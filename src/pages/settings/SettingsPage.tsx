import { useState } from 'react'
import { useApp } from '../../context/AppContext.tsx'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Tabs } from '../../components/ui/Tabs.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { useToast } from '../../components/ui/Toast.tsx'

const TABS = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'users', label: 'Usuários' },
  { id: 'rooms', label: 'Quartos' },
  { id: 'services', label: 'Serviços' },
  { id: 'prefs', label: 'Preferências' },
  { id: 'integrations', label: 'Integrações' },
]

export function SettingsPage() {
  const { hotel } = useApp()
  const { push } = useToast()
  const [tab, setTab] = useState('hotel')

  return (
    <div className="mx-auto flex max-w-[800px] flex-col gap-6">
      <PageHeader title="Configurações" subtitle="Identidade da casa, equipe e conexões. Tudo visual, nada persistido de verdade." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'hotel' && (
        <Card className="flex flex-col gap-3">
          <Input label="Nome" defaultValue={hotel.name} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cidade" defaultValue={hotel.city} />
            <Input label="Estado" defaultValue={hotel.state} />
          </div>
          <Input label="Quartos" defaultValue={String(hotel.roomCount)} />
          <div>
            <Button onClick={() => push({ title: 'Dados do hotel atualizados', tone: 'success' })}>Salvar</Button>
          </div>
        </Card>
      )}

      {tab === 'users' && (
        <Card padding="none">
          {[
            { name: 'João', role: 'Administrador' },
            { name: 'Ana Ribeiro', role: 'Governança' },
            { name: 'Marcos Lima', role: 'Recepção' },
          ].map((user) => (
            <div key={user.name} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0">
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-[12px] text-muted">{user.role}</p>
              </div>
              <Badge>Ativo</Badge>
            </div>
          ))}
        </Card>
      )}

      {tab === 'rooms' && (
        <Card>
          <p className="text-[13px] text-muted">Categorias atuais: Standard, Superior, Suíte Premium e Chalé. A edição real entra com o backend.</p>
        </Card>
      )}

      {tab === 'services' && (
        <Card>
          <p className="text-[13px] text-muted">O catálogo vive em Serviços. Aqui só o interruptor geral da casa.</p>
        </Card>
      )}

      {tab === 'prefs' && (
        <Card className="flex flex-col gap-3">
          <label className="flex items-center justify-between text-[13px]">
            Check-in a partir das 14h
            <input type="checkbox" defaultChecked className="accent-accent" />
          </label>
          <label className="flex items-center justify-between text-[13px]">
            Check-out até 12h
            <input type="checkbox" defaultChecked className="accent-accent" />
          </label>
          <label className="flex items-center justify-between text-[13px]">
            Idioma do painel em português
            <input type="checkbox" defaultChecked className="accent-accent" />
          </label>
        </Card>
      )}

      {tab === 'integrations' && (
        <Card className="flex flex-col gap-3">
          {['PMS', 'Channel manager', 'Fechaduras', 'WhatsApp'].map((name) => (
            <div key={name} className="flex items-center justify-between rounded-lg border border-line px-3 py-3">
              <p className="text-sm font-medium">{name}</p>
              <Badge tone="neutral">Em breve</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
