import { useMemo, useState } from 'react'
import { Copy, Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { Select } from '../../components/ui/Select.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'
import type { Totem, TotemKind } from '../../types/index.ts'

export function TotemsPage() {
  const { hotel, hotelTotems, hotelAreas, hotelRooms, addTotem, updateTotem } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Totem | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [draft, setDraft] = useState({
    kind: 'room' as TotemKind,
    code: '',
    name: '',
    roomNumber: '',
    areaId: '',
    active: true,
  })

  const roomTotems = useMemo(() => hotelTotems.filter((item) => item.kind === 'room'), [hotelTotems])
  const areaTotems = useMemo(() => hotelTotems.filter((item) => item.kind === 'area'), [hotelTotems])

  function openCreate(kind: TotemKind) {
    setEditing(null)
    setDraft({
      kind,
      code: '',
      name: '',
      roomNumber: kind === 'room' ? hotelRooms[0]?.number ?? '' : '',
      areaId: kind === 'area' ? hotelAreas[0]?.id ?? '' : '',
      active: true,
    })
    setModalOpen(true)
  }

  function openEdit(totem: Totem) {
    setEditing(totem)
    setDraft({
      kind: totem.kind,
      code: totem.code,
      name: totem.name,
      roomNumber: totem.roomNumber ?? '',
      areaId: totem.areaId ?? '',
      active: totem.active,
    })
    setModalOpen(true)
  }

  function saveTotem() {
    if (!draft.code.trim() || !draft.name.trim()) return
    if (editing) {
      updateTotem(editing.id, {
        code: draft.code.trim().toUpperCase(),
        name: draft.name.trim(),
        kind: draft.kind,
        roomNumber: draft.kind === 'room' ? draft.roomNumber : undefined,
        areaId: draft.kind === 'area' ? draft.areaId : undefined,
        active: draft.active,
      })
    } else {
      addTotem({
        hotelId: hotel.id,
        code: draft.code.trim().toUpperCase(),
        name: draft.name.trim(),
        kind: draft.kind,
        roomNumber: draft.kind === 'room' ? draft.roomNumber : undefined,
        areaId: draft.kind === 'area' ? draft.areaId : undefined,
        active: draft.active,
      })
    }
    setModalOpen(false)
  }

  function copyCode(code: string) {
    void navigator.clipboard.writeText(code)
    setCopied(code)
    window.setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <PageHeader
        title="Totens"
        subtitle="Cadastre tablets de quarto e de área. Cada totem tem um código para ativação única no dispositivo."
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <TotemSection
          title="Quartos"
          empty="Nenhum totem de quarto cadastrado."
          totems={roomTotems}
          onAdd={() => openCreate('room')}
          onEdit={openEdit}
          onCopy={copyCode}
          copied={copied}
          labelFor={(totem) => `Quarto ${totem.roomNumber}`}
        />
        <TotemSection
          title="Áreas"
          empty="Nenhum totem de área cadastrado."
          totems={areaTotems}
          onAdd={() => openCreate('area')}
          onEdit={openEdit}
          onCopy={copyCode}
          copied={copied}
          labelFor={(totem) => hotelAreas.find((a) => a.id === totem.areaId)?.name ?? totem.name}
        />
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar totem' : 'Novo totem'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveTotem}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nome"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={draft.kind === 'room' ? 'Quarto 203' : 'Restaurante principal'}
          />
          <Input
            label="Código de ativação"
            value={draft.code}
            onChange={(e) => setDraft((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="Q203-AUR"
            hint="O tablet usa este código uma única vez para se identificar."
          />
          {draft.kind === 'room' ? (
            <Select
              label="Quarto"
              value={draft.roomNumber}
              onChange={(e) => setDraft((prev) => ({ ...prev, roomNumber: e.target.value }))}
              options={hotelRooms.map((room) => ({ value: room.number, label: `Quarto ${room.number}` }))}
            />
          ) : (
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
    </div>
  )
}

function TotemSection({
  title,
  empty,
  totems,
  onAdd,
  onEdit,
  onCopy,
  copied,
  labelFor,
}: {
  title: string
  empty: string
  totems: Totem[]
  onAdd: () => void
  onEdit: (totem: Totem) => void
  onCopy: (code: string) => void
  copied: string | null
  labelFor: (totem: Totem) => string
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-[-0.02em]">{title}</h2>
        <Button size="sm" variant="secondary" onClick={onAdd}>
          <Plus size={14} />
          Adicionar
        </Button>
      </div>
      {totems.length === 0 ? (
        <EmptyState title={empty} description="Cadastre um totem para gerar o código de ativação." />
      ) : (
        <ul className="flex flex-col">
          {totems.map((totem) => (
            <li key={totem.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
              <button type="button" onClick={() => onEdit(totem)} className="min-w-0 flex-1 text-left">
                <p className="text-[13px] font-medium">{totem.name}</p>
                <p className="text-[12px] text-muted">{labelFor(totem)}</p>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCopy(totem.code)}
                  className="inline-flex items-center gap-1 rounded-md bg-canvas px-2 py-1 font-mono text-[11px]"
                >
                  {totem.code}
                  <Copy size={12} />
                </button>
                {copied === totem.code && <span className="text-[11px] text-muted">Copiado</span>}
                <Badge tone={totem.active ? 'green' : 'neutral'}>{totem.active ? 'Ativo' : 'Inativo'}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
