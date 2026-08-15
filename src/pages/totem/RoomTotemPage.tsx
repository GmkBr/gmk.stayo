import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext.tsx'
import { Button } from '../../components/ui/Button.tsx'

export function RoomTotemPage() {
  const { hotel } = useApp()
  const brand = hotel.brand

  return (
    <div
      className="flex min-h-svh flex-col"
      style={{ background: brand.secondaryColor, ['--hotel-primary' as string]: brand.primaryColor }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: brand.primaryColor }}>
          {brand.hotelName}
        </p>
        <Link to="/" className="text-[12px] text-muted">
          Sair do totem
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 pb-16">
        <p className="text-[13px] font-medium text-muted">Quarto 203</p>
        <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.045em]">Olá, João.</h1>
        <p className="mt-3 text-[15px] text-muted">
          Pedidos, room service e solicitações entram aqui no próximo passo. Por enquanto esta tela só marca o lugar do
          totem.
        </p>
        <Button className="mt-8 h-14 min-w-56 text-base" disabled>
          Fazer um pedido
        </Button>
      </div>
    </div>
  )
}
