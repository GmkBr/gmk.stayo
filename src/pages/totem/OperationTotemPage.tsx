import { useAuth } from '../../auth/AuthContext.tsx'
import { useApp } from '../../context/AppContext.tsx'
import { TotemShell } from '../../components/totem/TotemShell.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { KIOSK_BTN } from './totemOrder.ts'

export function OperationTotemPage() {
  const { hotel } = useApp()
  const { signOut } = useAuth()

  return (
    <TotemShell brand={hotel.brand} title={hotel.name}>
      <div className="flex flex-1 flex-col justify-center pb-12 text-center">
        <h1 className="text-[clamp(1.75rem,5vw,2.2rem)] font-semibold leading-tight tracking-[-0.04em]">
          Operação
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-muted">
          Fila de pedidos para cozinha e preparo em breve. Por enquanto, use o console para acompanhar os pedidos.
        </p>
        <Button className={`mx-auto mt-8 min-w-[12rem] ${KIOSK_BTN}`} variant="secondary" onClick={() => void signOut()}>
          Sair do totem
        </Button>
      </div>
    </TotemShell>
  )
}
