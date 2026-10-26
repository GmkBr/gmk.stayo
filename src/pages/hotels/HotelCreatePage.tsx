import { useEffect, useId, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Building2, Check, FileText, Palette } from 'lucide-react'
import { useApp } from '../../app/useApp.ts'
import { HotelBrandPreview } from '../../components/hotels/HotelBrandPreview.tsx'
import { HotelHubShell } from '../../components/hotels/HotelHubShell.tsx'
import {
  COVER_TONES,
  DEFAULT_BRAND,
  DEFAULT_TERMS_EXAMPLE,
  draftFromHotel,
  draftToInput,
  emptyDraft,
  messageFromHotelError,
  normalizeHexColor,
  UF_OPTIONS_WITH_PLACEHOLDER,
  type HotelDraft,
} from '../../components/hotels/hotelFormShared.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { Select } from '../../components/ui/Select.tsx'
import { Textarea } from '../../components/ui/Textarea.tsx'
import { isValidTermsPath, resolveHotelAssetUrl } from '../../lib/hotelAssets.ts'

const STEPS = [
  { id: 'identity', label: 'Identidade', icon: Building2 },
  { id: 'terms', label: 'Termos', icon: FileText },
  { id: 'brand', label: 'Marca', icon: Palette },
] as const

export function HotelCreatePage() {
  const { hotelId: editHotelId } = useParams<{ hotelId?: string }>()
  const isEdit = Boolean(editHotelId)
  const location = useLocation()
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo ?? '/hoteis'

  const { hotels, bootstrapping, createHotel, updateHotel, deleteHotel } = useApp()
  const editingHotel = useMemo(
    () => (editHotelId ? hotels.find((item) => item.id === editHotelId) : undefined),
    [editHotelId, hotels],
  )

  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<HotelDraft>(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState<'name' | 'city' | 'state' | null>(null)

  useEffect(() => {
    if (isEdit && editingHotel) {
      setDraft(draftFromHotel(editingHotel))
      setStep(0)
      setConfirmDelete(false)
      setError('')
      setFieldError(null)
    }
  }, [isEdit, editingHotel])

  const currentStep = STEPS[step]
  const hotelNotFound = isEdit && !bootstrapping && !editingHotel

  function patch(partial: Partial<HotelDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
    if (fieldError && ('name' in partial || 'city' in partial || 'state' in partial)) {
      setFieldError(null)
      setError('')
    }
  }

  function validateStep(index: number): { message: string; field?: 'name' | 'city' | 'state' } | null {
    if (index === 0) {
      if (!draft.name.trim()) return { message: 'Informe o nome do hotel.', field: 'name' }
      if (!draft.city.trim()) return { message: 'Informe a cidade.', field: 'city' }
      if (!draft.state.trim()) return { message: 'Selecione a UF.', field: 'state' }
    }
    if (index === 1 && !isValidTermsPath(draft.termsPath)) {
      return { message: 'Use apenas letras, números, barras, hífens e pontos no caminho do PDF.' }
    }
    return null
  }

  function goNext() {
    const result = validateStep(step)
    if (result) {
      setError(result.message)
      setFieldError(result.field ?? null)
      return
    }
    setError('')
    setFieldError(null)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function skipTerms() {
    if (!isEdit) patch({ termsText: '', termsPath: '' })
    setError('')
    setStep(2)
  }

  function goBack() {
    setError('')
    setFieldError(null)
    if (step === 0) {
      navigate(isEdit ? returnTo : '/hoteis')
      return
    }
    setStep((s) => s - 1)
  }

  async function submitCreate(body: ReturnType<typeof draftToInput>) {
    setSaving(true)
    setError('')
    setFieldError(null)
    try {
      const saved = await createHotel(body)
      navigate('/filas', { replace: true, state: { welcomeHotel: saved.name } })
    } catch (err) {
      setError(messageFromHotelError(err, 'Não foi possível criar o hotel.'))
    } finally {
      setSaving(false)
    }
  }

  async function submitUpdate(body: ReturnType<typeof draftToInput>) {
    if (!editingHotel) return
    setSaving(true)
    setError('')
    setFieldError(null)
    try {
      await updateHotel(editingHotel.id, body)
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(messageFromHotelError(err, 'Não foi possível salvar o hotel.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    const result = validateStep(0)
    if (result) {
      setError(result.message)
      setFieldError(result.field ?? null)
      setStep(0)
      return
    }
    const body = draftToInput(draft, { persistEmptyTerms: isEdit })
    if (isEdit) await submitUpdate(body)
    else await submitCreate(body)
  }

  async function handleSaveWithDefaults() {
    const result = validateStep(0)
    if (result) {
      setError(result.message)
      setFieldError(result.field ?? null)
      setStep(0)
      return
    }
    const body = draftToInput(
      {
        ...draft,
        ...DEFAULT_BRAND,
        brandHotelName: draft.brandHotelName.trim() || draft.name.trim(),
      },
      { persistEmptyTerms: isEdit },
    )
    if (isEdit) await submitUpdate(body)
    else await submitCreate(body)
  }

  async function handleDelete() {
    if (!editingHotel) return
    setSaving(true)
    setError('')
    try {
      await deleteHotel(editingHotel.id)
      navigate('/hoteis', { replace: true })
    } catch (err) {
      setError(messageFromHotelError(err, 'Não foi possível excluir o hotel.'))
      setConfirmDelete(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate() {
    await handleSave()
  }

  async function handleCreateWithDefaults() {
    await handleSaveWithDefaults()
  }

  const pageTitle = isEdit ? 'Editar hotel' : 'Cadastrar hotel'
  const pageSubtitle = isEdit
    ? 'Atualize identidade, termos e marca. As alterações valem no console e nos totens.'
    : 'Três passos rápidos. Você vira administrador automaticamente e entra no console em seguida.'
  const progressLabel = isEdit ? 'Progresso da edição' : 'Progresso do cadastro'
  const finalActionLabel = saving
    ? isEdit
      ? 'Salvando…'
      : 'Criando…'
    : isEdit
      ? 'Salvar alterações'
      : 'Criar hotel e entrar'
  const defaultsActionLabel = saving
    ? isEdit
      ? 'Salvando…'
      : 'Criando…'
    : isEdit
      ? 'Salvar com identidade padrão'
      : 'Usar identidade padrão e criar'

  if (isEdit && bootstrapping) {
    return (
      <HotelHubShell backTo="/hoteis" backLabel="Hotéis">
        <div
          aria-busy="true"
          aria-live="polite"
          className="rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-soft"
        >
          <p className="text-[14px] text-muted">Carregando hotel…</p>
        </div>
      </HotelHubShell>
    )
  }

  if (hotelNotFound) {
    return (
      <HotelHubShell backTo="/hoteis" backLabel="Hotéis">
        <div className="rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-soft">
          <h1 className="text-lg font-semibold tracking-[-0.03em]">Hotel não encontrado</h1>
          <p className="mt-2 text-[14px] text-muted">Esse hotel não está na sua lista ou foi removido.</p>
          <Button className="mt-6" onClick={() => navigate('/hoteis')}>
            Voltar aos hotéis
          </Button>
        </div>
      </HotelHubShell>
    )
  }

  if (confirmDelete && editingHotel) {
    return (
      <HotelHubShell backTo="/hoteis" backLabel="Hotéis">
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-soft sm:p-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.04em]">Excluir hotel?</h1>
          <p className="mt-2 text-[14px] text-muted">
            “{editingHotel.name}” some das listagens (soft delete). Só dono ou ADMIN pode excluir.
          </p>
          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" disabled={saving} onClick={() => setConfirmDelete(false)}>
              Voltar
            </Button>
            <Button variant="danger" disabled={saving} onClick={() => void handleDelete()}>
              {saving ? 'Excluindo…' : 'Confirmar exclusão'}
            </Button>
          </div>
        </div>
      </HotelHubShell>
    )
  }

  return (
    <HotelHubShell backTo="/hoteis" backLabel="Hotéis">
      <div className="mb-6">
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.045em]">{pageTitle}</h1>
        <p className="mt-2 max-w-xl text-[15px] text-muted">{pageSubtitle}</p>
      </div>

      <p className="mb-4 text-[13px] font-medium text-ink" aria-live="polite">
        Passo {step + 1} de {STEPS.length} — {currentStep.label}
      </p>

      <nav aria-label={progressLabel}>
        <ol className="mb-8 flex gap-2 sm:gap-3">
          {STEPS.map((item, index) => {
            const Icon = item.icon
            const done = index < step
            const active = index === step
            let stepCircleClass = 'border-line bg-surface text-muted'
            if (done) stepCircleClass = 'border-success bg-success-soft text-success'
            else if (active) stepCircleClass = 'border-ink/20 bg-ink text-white'

            return (
              <li
                key={item.id}
                aria-current={active ? 'step' : undefined}
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors sm:size-10 ${stepCircleClass}`}
                >
                  {done ? <Check size={16} aria-hidden /> : <Icon size={16} strokeWidth={1.75} aria-hidden />}
                </div>
                <span className={`text-center text-[11px] font-medium sm:text-[12px] ${active ? 'text-ink' : 'text-muted'}`}>
                  {item.label}
                </span>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-7">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.03em]">Dados do hotel</h2>
              <p className="mt-1 text-[13px] text-muted">Nome e localização aparecem no console e nos totens.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Nome do hotel"
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Hotel Maré"
                  autoFocus
                  error={fieldError === 'name' ? error : undefined}
                />
              </div>
              <Input
                label="Cidade"
                value={draft.city}
                onChange={(e) => patch({ city: e.target.value })}
                placeholder="Florianópolis"
                error={fieldError === 'city' ? error : undefined}
              />
              <Select
                label="UF"
                options={UF_OPTIONS_WITH_PLACEHOLDER}
                value={draft.state}
                onChange={(e) => patch({ state: e.target.value })}
                error={fieldError === 'state' ? error : undefined}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.03em]">Termos no check-in</h2>
              <p className="mt-1 text-[13px] text-muted">
                Texto inline, PDF ou os dois. Sem nenhum, o totem usa regras padrão do STAYO. Uma regra por linha no
                texto.
              </p>
            </div>
            <Textarea
              label="Texto dos termos (opcional)"
              value={draft.termsText}
              onChange={(e) => patch({ termsText: e.target.value })}
              placeholder={DEFAULT_TERMS_EXAMPLE}
              hint="Ex.: horário de check-out, silêncio, política de animais."
              rows={6}
            />
            <Input
              label="PDF dos termos (opcional)"
              value={draft.termsPath}
              onChange={(e) => {
                patch({ termsPath: e.target.value })
                if (error && !fieldError) setError('')
              }}
              placeholder="hotel-assets/mare/terms.pdf"
              hint="Caminho retornado após upload no storage. Alternativa ou complemento ao texto acima."
              error={error && !fieldError && !isValidTermsPath(draft.termsPath) ? error : undefined}
            />
            {draft.termsPath.trim() && isValidTermsPath(draft.termsPath) && resolveHotelAssetUrl(draft.termsPath) && (
              <a
                href={resolveHotelAssetUrl(draft.termsPath) ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-[13px] font-medium text-ink underline-offset-2 hover:underline"
              >
                Pré-visualizar PDF
              </a>
            )}
            <Button variant="secondary" type="button" disabled={saving} onClick={skipTerms}>
              {isEdit ? 'Pular este passo' : 'Configurar depois'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.03em]">Identidade visual</h2>
              <p className="mt-1 text-[13px] text-muted">
                Cores e nome da marca nos totens. À direita, exemplos de uso real no check-in.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Input
                  label="Nome da marca"
                  value={draft.brandHotelName}
                  onChange={(e) => patch({ brandHotelName: e.target.value })}
                  placeholder={draft.name.trim() || 'Maré'}
                />
                <Select
                  label="Tom da capa"
                  options={COVER_TONES}
                  value={draft.coverTone}
                  onChange={(e) => patch({ coverTone: e.target.value })}
                  hint="Metadado de identidade — reservado para capas futuras."
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <ColorField
                    label="Primária"
                    value={draft.primaryColor}
                    fallback={DEFAULT_BRAND.primaryColor}
                    onChange={(v) => patch({ primaryColor: v })}
                  />
                  <ColorField
                    label="Secundária"
                    value={draft.secondaryColor}
                    fallback={DEFAULT_BRAND.secondaryColor}
                    onChange={(v) => patch({ secondaryColor: v })}
                  />
                  <ColorField
                    label="Destaque"
                    value={draft.accentColor}
                    fallback={DEFAULT_BRAND.accentColor}
                    onChange={(v) => patch({ accentColor: v })}
                  />
                </div>
                <button
                  type="button"
                  className="min-h-11 text-[13px] font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
                  onClick={() => patch({ ...DEFAULT_BRAND, brandHotelName: draft.brandHotelName })}
                >
                  Restaurar cores padrão
                </button>
              </div>
              <HotelBrandPreview draft={draft} />
            </div>
          </div>
        )}

        {error && !fieldError && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-[13px] text-danger"
          >
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" disabled={saving} onClick={goBack}>
              {step === 0 ? 'Cancelar' : 'Voltar'}
            </Button>
            {isEdit && step === 0 && (
              <Button variant="danger" disabled={saving} onClick={() => setConfirmDelete(true)}>
                Excluir hotel
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {step === 2 && (
              <Button variant="secondary" disabled={saving} onClick={() => void handleCreateWithDefaults()}>
                {defaultsActionLabel}
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button disabled={saving} onClick={goNext}>
                Continuar
              </Button>
            ) : (
              <Button disabled={saving} onClick={() => void handleCreate()}>
                {finalActionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </HotelHubShell>
  )
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  readonly label: string
  readonly value: string
  readonly fallback: string
  readonly onChange: (value: string) => void
}) {
  const id = useId()
  const labelId = `${id}-label`
  const errorId = `${id}-error`
  const [fieldError, setFieldError] = useState('')

  function commitValue(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) {
      setFieldError('')
      onChange(fallback)
      return
    }
    const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
    if (!/^#[0-9A-Fa-f]{6}$/.test(withHash)) {
      setFieldError('Use o formato #RRGGBB.')
      onChange(fallback)
      return
    }
    setFieldError('')
    onChange(withHash.toUpperCase())
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-[12px] font-medium text-muted">
        {label}
      </span>
      <div
        className={`flex items-center gap-2 rounded-lg border bg-canvas p-1.5 ${fieldError ? 'border-danger' : 'border-line'}`}
      >
        <input
          type="color"
          value={normalizeHexColor(value, fallback)}
          onChange={(e) => {
            setFieldError('')
            onChange(e.target.value.toUpperCase())
          }}
          className="size-8 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
          aria-labelledby={labelId}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setFieldError('')
            onChange(e.target.value)
          }}
          onBlur={(e) => commitValue(e.target.value)}
          aria-labelledby={labelId}
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent text-[12px] font-medium uppercase text-ink outline-none"
        />
      </div>
      {fieldError && (
        <span id={errorId} className="text-[11px] text-danger">
          {fieldError}
        </span>
      )}
    </div>
  )
}
