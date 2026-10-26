import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.tsx'
import { useTotemProfile } from '../../hooks/useTotemProfile.ts'
import { useApp } from '../../app/useApp.ts'
import { TotemShell } from '../../components/totem/TotemShell.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { OperationOrdersPanel } from './operation/OperationOrdersPanel.tsx'
import { OperationCatalogPanel } from './operation/OperationCatalogPanel.tsx'

type MainTab = 'orders' | 'catalog'

export function OperationTotemPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { ready } = useTotemProfile('operation')
  const { hotel, hotelOrders, bootstrapping, bootstrapError, reloadHotelData } = useApp()
  const [tab, setTab] = useState<MainTab>('orders')

  const openCount = useMemo(
    () => hotelOrders.filter((item) => item.status === 'open' || item.status === 'preparing').length,
    [hotelOrders],
  )

  if (!ready || bootstrapping) {
    return (
      <div className="totem-shell flex min-h-svh items-center justify-center text-[15px] text-muted">
        Carregando operação…
      </div>
    )
  }

  function handleSignOut() {
    void signOut().then(() => navigate('/login', { replace: true }))
  }

  return (
    <TotemShell
      brand={hotel.brand}
      title={hotel.name}
      contextLabel="Operação · cozinha e preparo"
      staffConfig={{
        holdMs: 5000,
        actions: [{ label: 'Sair', onClick: handleSignOut, variant: 'danger' }],
      }}
      footer={
        <div className="mx-auto flex w-full max-w-xl gap-2">
          <Button
            size="kiosk"
            className="flex-1"
            variant={tab === 'orders' ? 'primary' : 'secondary'}
            onClick={() => setTab('orders')}
          >
            Pedidos{openCount > 0 ? ` (${openCount})` : ''}
          </Button>
          <Button
            size="kiosk"
            className="flex-1"
            variant={tab === 'catalog' ? 'primary' : 'secondary'}
            onClick={() => setTab('catalog')}
          >
            Cardápio
          </Button>
        </div>
      }
    >
      {bootstrapError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[14px] text-red-700">
          {bootstrapError}
        </p>
      )}

      {tab === 'orders' ? <OperationOrdersPanel /> : <OperationCatalogPanel />}

      {tab === 'orders' && (
        <p className="mt-auto pt-4 text-center text-[12px] text-muted">
          <button type="button" className="underline" onClick={() => void reloadHotelData()}>
            Atualizar lista
          </button>
        </p>
      )}
    </TotemShell>
  )
}
