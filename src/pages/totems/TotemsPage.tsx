import { useMemo, useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { Select } from '../../components/ui/Select.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'
import { TOTEM_EMAIL_DOMAIN, TOTEM_KIND_LABELS, totemEmail } from '../../lib/totemLogin.ts'
import type { Totem, TotemKind } from '../../types/index.ts'

const KIND_OPTIONS: { value: TotemKind; label: string }[] = [
  { value: 'reception', label: TOTEM_KIND_LABELS.reception },
  { value: 'room', label: TOTEM_KIND_LABELS.room },
  { value: 'area', label: TOTEM_KIND_LABELS.area },
  { value: 'operation', label: TOTEM_KIND_LABELS.operation },
]

const ALL_KINDS = 'all' as const
type KindFilter = TotemKind | typeof ALL_KINDS

export function TotemsPage() {
  const { hotelTotems, hotelAreas, hotelRooms, addTotem, updateTotem, resetTotemPassword } = useApp()

  const [filter, setFilter] = useState<KindFilter>(ALL_KINDS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Totem | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [draft, setDraft] = useState({
    kind: 'reception' as TotemKind,
    loginSuffix: '',
    password: '',
    name: '',
    roomNumber: '',
    areaId: '',
    active: true,
  })

  const filtered = useMemo(() => {
    if (filter === ALL_KINDS) return hotelTotems
    return hotelTotems.filter((item) => item.kind === filter)
  }, [filter, hotelTotems])

  function openCreate(kind: TotemKind = 'reception') {
    setEditing(null)
    setDraft({
      kind,
      loginSuffix: '',
      password: '',
      name: '',
      roomNumber: kind === 'room' ? (hotelRooms[0]?.number ?? '') : '',
      areaId: kind === 'area' ? (hotelAreas[0]?.id ?? '') : '',
      active: true,
    })
    setModalOpen(true)
  }

  function openEdit(totem: Totem) {
    setEditing(totem)
    setDraft({
      kind: totem.kind,
      loginSuffix: totem.loginId,
      password: '',
      name: totem.name,
      roomNumber: totem.roomNumber ?? '',
      areaId: totem.areaId ?? '',
      active: totem.active,
    })
    setModalOpen(true)
  }

  async function saveTotem() {
    if (!draft.name.trim()) return
    if (editing) {
      await updateTotem(editing.id, {
        name: draft.name.trim(),
        kind: draft.kind,
        roomNumber: draft.kind === 'room' ? draft.roomNumber : undefined,
        areaId: draft.kind === 'area' ? draft.areaId : undefined,
        active: draft.active,
      })
    } else {
      if (!draft.loginSuffix.trim() || !draft.password.trim()) return
      await addTotem({
        name: draft.name.trim(),
        kind: draft.kind,
        loginSuffix: draft.loginSuffix.trim(),
        password: draft.password,
        roomNumber: draft.kind === 'room' ? draft.roomNumber : null,
        areaId: draft.kind === 'area' ? draft.areaId : null,
      })
    }
    setModalOpen(false)
  }

  async function handleResetPassword() {
    if (!editing || newPassword.length < 6) return
    await resetTotemPassword(editing.id, newPassword)
    setResetOpen(false)
    setNewPassword('')
  }

  function locationLabel(totem: Totem) {
    if (totem.kind === 'room' && totem.roomNumber) return `Quarto ${totem.roomNumber}`
    if (totem.kind === 'area' && totem.areaId) {
      return hotelAreas.find((a) => a.id === totem.areaId)?.name ?? totem.name
    }
    return TOTEM_KIND_LABELS[totem.kind]
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <PageHeader
        title="Totens"
        subtitle="Cadastre dispositivos com login e senha. Cada totem é um usuário do hotel — ao entrar, assume a interface do tipo definido."
        actions={
          <Button onClick={() => openCreate()}>
            <Plus size={16} />
            Novo totem
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === ALL_KINDS} onClick={() => setFilter(ALL_KINDS)}>
          Todos ({hotelTotems.length})
        </FilterChip>
        {KIND_OPTIONS.map((opt) => {
          const count = hotelTotems.filter((t) => t.kind === opt.value).length
          return (
            <FilterChip key={opt.value} active={filter === opt.value} onClick={() => setFilter(opt.value)}>
              {opt.label} ({count})
            </FilterChip>
          )
        })}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhum totem cadastrado"
            description="Crie um totem com login e senha para o tablet usar na recepção, quarto, área ou operação."
            action={{ label: 'Cadastrar totem', onClick: () => openCreate() }}
          />
        ) : (
          <ul className="flex flex-col">
            {filtered.map((totem) => (
              <li
                key={totem.id}
                className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0"
              >
                <button type="button" onClick={() => openEdit(totem)} className="min-w-0 flex-1 text-left">
                  <p className="text-[13px] font-medium">{totem.name}</p>
                  <p className="text-[12px] text-muted">{locationLabel(totem)}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted">{totemEmail(totem.loginId)}</p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="neutral">{TOTEM_KIND_LABELS[totem.kind]}</Badge>
                  <Badge tone={totem.active ? 'green' : 'neutral'}>{totem.active ? 'Ativo' : 'Inativo'}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar totem' : 'Novo totem'}
        footer={
          <>
            {editing && (
              <Button variant="ghost" onClick={() => setResetOpen(true)}>
                Redefinir senha
              </Button>
            )}
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveTotem()}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Tipo"
            value={draft.kind}
            onChange={(e) => {
              const kind = e.target.value as TotemKind
              setDraft((prev) => ({
                ...prev,
                kind,
                roomNumber: kind === 'room' ? (hotelRooms[0]?.number ?? '') : '',
                areaId: kind === 'area' ? (hotelAreas[0]?.id ?? '') : '',
              }))
            }}
            options={KIND_OPTIONS}
            disabled={Boolean(editing)}
          />
          <Input
            label="Nome"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Recepção principal"
          />
          {editing ? (
            <Input
              label="Login"
              value={editing.loginId}
              readOnly
              hint={`E-mail no dispositivo: ${totemEmail(editing.loginId)}. Imutável após criação.`}
            />
          ) : (
            <Input
              label="Login"
              value={draft.loginSuffix}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  loginSuffix: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                }))
              }
              placeholder="recepcao-01"
              hint={`No tablet: ${draft.loginSuffix ? totemEmail(draft.loginSuffix) : `…@${TOTEM_EMAIL_DOMAIN}`} ou só o identificador.`}
            />
          )}
          {!editing && (
            <Input
              label="Senha"
              type="password"
              value={draft.password}
              onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))}
              minLength={6}
              hint="Senha usada no tablet para entrar."
            />
          )}
          {draft.kind === 'room' && (
            <Select
              label="Quarto"
              value={draft.roomNumber}
              onChange={(e) => setDraft((prev) => ({ ...prev, roomNumber: e.target.value }))}
              options={hotelRooms.map((room) => ({ value: room.number, label: `Quarto ${room.number}` }))}
            />
          )}
          {draft.kind === 'area' && (
            <Select
              label="Área"
              value={draft.areaId}
              onChange={(e) => setDraft((prev) => ({ ...prev, areaId: e.target.value }))}
              options={hotelAreas.map((area) => ({ value: area.id, label: area.name }))}
            />
          )}
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft((prev) => ({ ...prev, active: e.target.checked }))}
            />
            Totem ativo
          </label>
        </div>
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Redefinir senha"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleResetPassword()} disabled={newPassword.length < 6}>
              Salvar senha
            </Button>
          </>
        }
      >
        <Input
          label="Nova senha"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          autoFocus
        />
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
