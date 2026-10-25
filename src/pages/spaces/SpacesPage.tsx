import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useApp } from '../../app/useApp.ts'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { Select } from '../../components/ui/Select.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'
import { messageFromHotelError } from '../../components/hotels/hotelFormShared.ts'
import {
  MANAGED_SPACE_TYPES,
  SPACE_TYPE_LABELS,
  spaceDisplayMeta,
  spaceDisplayTitle,
  totemForSpace,
} from '../../lib/spaceLabels.ts'
import { totemEmail } from '../../lib/totemLogin.ts'
import type { Space, SpaceType } from '../../modules/spaces/model.ts'

const TYPE_OPTIONS: { value: SpaceType; label: string }[] = MANAGED_SPACE_TYPES.map((type) => ({
  value: type,
  label: SPACE_TYPE_LABELS[type],
}))

const ALL_TYPES = 'all' as const
type TypeFilter = SpaceType | typeof ALL_TYPES

type Draft = {
  type: SpaceType
  number: string
  name: string
  floor: string
}

export function SpacesPage() {
  const {
    hotelSpaces,
    hotelTotems,
    refreshing,
    addSpace,
    updateSpace,
    deleteSpace,
  } = useApp()

  const [filter, setFilter] = useState<TypeFilter>(ALL_TYPES)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Space | null>(null)
  const [draft, setDraft] = useState<Draft>({ type: 'room', number: '', name: '', floor: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === ALL_TYPES) return hotelSpaces
    return hotelSpaces.filter((item) => item.type === filter)
  }, [filter, hotelSpaces])

  const relatedTotem = editing ? totemForSpace(editing, hotelTotems) : undefined

  function openCreate(type: SpaceType = 'room') {
    setEditing(null)
    setDraft({ type, number: '', name: '', floor: '' })
    setError(null)
    setModalOpen(true)
  }

  function openEdit(space: Space) {
    setEditing(space)
    setDraft({
      type: space.type,
      number: space.number ?? '',
      name: space.name ?? '',
      floor: space.floor ?? '',
    })
    setError(null)
    setModalOpen(true)
  }

  async function saveSpace() {
    setError(null)
    setSaving(true)
    try {
      if (editing) {
        if (editing.type === 'room') {
          if (!draft.number.trim()) {
            setError('Informe o número do quarto.')
            return
          }
          await updateSpace(editing.id, {
            number: draft.number.trim(),
            name: draft.name.trim() || undefined,
            floor: draft.floor.trim() || undefined,
          })
        } else {
          if (!draft.name.trim()) {
            setError('Informe o nome da área.')
            return
          }
          await updateSpace(editing.id, { name: draft.name.trim() })
        }
      } else if (draft.type === 'room') {
        if (!draft.number.trim()) {
          setError('Informe o número do quarto.')
          return
        }
        await addSpace({
          type: 'room',
          number: draft.number.trim(),
          name: draft.name.trim() || undefined,
          floor: draft.floor.trim() || undefined,
        })
      } else {
        if (!draft.name.trim()) {
          setError('Informe o nome da área.')
          return
        }
        await addSpace({ type: 'area', name: draft.name.trim() })
      }
      setModalOpen(false)
    } catch (err) {
      setError(messageFromHotelError(err, 'Não foi possível salvar o espaço.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    if (!window.confirm(`Remover "${spaceDisplayTitle(editing)}"? Esta ação não pode ser desfeita.`)) return
    setError(null)
    setDeleting(true)
    try {
      await deleteSpace(editing.id)
      setModalOpen(false)
    } catch (err) {
      setError(messageFromHotelError(err, 'Não foi possível remover o espaço.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <PageHeader
        title="Espaços"
        subtitle="Cadastre quartos e áreas comuns do hotel. Totens de quarto e área vinculam-se a estes registros."
        actions={
          <Button onClick={() => openCreate()}>
            <Plus size={16} />
            Novo espaço
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === ALL_TYPES} onClick={() => setFilter(ALL_TYPES)}>
          Todos ({hotelSpaces.length})
        </FilterChip>
        {TYPE_OPTIONS.map((opt) => {
          const count = hotelSpaces.filter((s) => s.type === opt.value).length
          return (
            <FilterChip key={opt.value} active={filter === opt.value} onClick={() => setFilter(opt.value)}>
              {opt.label} ({count})
            </FilterChip>
          )
        })}
      </div>

      <Card>
        {refreshing && hotelSpaces.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted">Carregando espaços…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum espaço cadastrado"
            description="Cadastre quartos e áreas antes de vincular totens a eles."
            action={{ label: 'Cadastrar espaço', onClick: () => openCreate() }}
          />
        ) : (
          <ul className="flex flex-col">
            {filtered.map((space) => {
              const totem = totemForSpace(space, hotelTotems)
              const meta = spaceDisplayMeta(space)
              const subtitle = [meta, totem ? `Totem: ${totem.name}` : 'Sem totem vinculado']
                .filter(Boolean)
                .join(' · ')
              return (
                <li
                  key={space.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0"
                >
                  <button type="button" onClick={() => openEdit(space)} className="min-w-0 flex-1 text-left">
                    <p className="text-[13px] font-medium">{spaceDisplayTitle(space)}</p>
                    <p className="text-[12px] text-muted">{subtitle}</p>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone="neutral">{SPACE_TYPE_LABELS[space.type]}</Badge>
                    {totem && (
                      <Badge tone={totem.active ? 'green' : 'neutral'}>
                        {totem.active ? 'Com totem' : 'Totem inativo'}
                      </Badge>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Detalhe do espaço' : 'Novo espaço'}
        footer={
          <>
            {editing && (
              <Button variant="ghost" onClick={() => void handleDelete()} disabled={deleting || saving}>
                {deleting ? 'Removendo…' : 'Excluir'}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving || deleting}>
              Cancelar
            </Button>
            <Button onClick={() => void saveSpace()} disabled={saving || deleting}>
              {saving ? 'Salvando…' : editing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {!editing && (
            <Select
              label="Tipo"
              value={draft.type}
              onChange={(e) => {
                const type = e.target.value as SpaceType
                setDraft((prev) => ({ ...prev, type, number: '', name: '', floor: '' }))
              }}
              options={TYPE_OPTIONS}
            />
          )}

          {(editing?.type === 'room' || draft.type === 'room') && (
            <>
              <Input
                label="Número"
                value={draft.number}
                onChange={(e) => setDraft((prev) => ({ ...prev, number: e.target.value }))}
                placeholder="101"
                autoFocus
              />
              <Input
                label="Nome (opcional)"
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Suíte Standard"
                hint="Se omitido, o backend usa o número como nome."
              />
              <Input
                label="Andar (opcional)"
                value={draft.floor}
                onChange={(e) => setDraft((prev) => ({ ...prev, floor: e.target.value }))}
                placeholder="1"
              />
            </>
          )}

          {(editing?.type === 'area' || draft.type === 'area') && (
            <Input
              label="Nome"
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Restaurante"
              autoFocus
            />
          )}

          {editing && (
            <section className="rounded-lg border border-line bg-canvas px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Totem vinculado</p>
              {relatedTotem ? (
                <div className="mt-2 flex flex-col gap-1">
                  <p className="text-[13px] font-medium">{relatedTotem.name}</p>
                  <p className="font-mono text-[11px] text-muted">{totemEmail(relatedTotem.loginId)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge tone={relatedTotem.active ? 'green' : 'neutral'}>
                      {relatedTotem.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Link to="/totens" className="text-[12px] text-muted underline-offset-2 hover:text-ink hover:underline">
                      Abrir em Totens
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-muted">
                  Nenhum totem vinculado a este espaço.{' '}
                  <Link to="/totens" className="text-ink underline-offset-2 hover:underline">
                    Cadastrar totem
                  </Link>
                </p>
              )}
            </section>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active ? 'bg-ink text-white' : 'bg-canvas text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
