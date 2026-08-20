import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import type { CatalogCategory, CatalogItem, HotelBrand, Service } from '../../types/index.ts'
import { Button } from '../ui/Button.tsx'
import { formatBRLExact, greetingForNow } from '../../utils/format.ts'
import {
  DONE_MS,
  IDLE_MS,
  KIOSK_BTN,
  bumpCartLine,
  cartCount,
  cartTotal,
  catalogAsCartLine,
  mergeCartLine,
  serviceAsCartLine,
  toOrderLines,
  type CartLine,
} from '../../pages/totem/totemOrder.ts'
import { TotemShell } from './TotemShell.tsx'

type Screen = 'home' | 'catalog' | 'cart' | 'done'

type Props = {
  brand: HotelBrand
  contextLabel: string
  greeting: string
  subtitle: string
  categories: CatalogCategory[]
  items: CatalogItem[]
  services?: Service[]
  paymentNote?: string
  onSubmit: (lines: CartLine[], notes: string) => void
  onUnbind?: () => void
}

export function CatalogFlow({
  brand,
  contextLabel,
  greeting,
  subtitle,
  categories,
  items,
  services = [],
  paymentNote = 'O pagamento é feito no checkout do totem de recepção.',
  onSubmit,
  onUnbind,
}: Props) {
  const [screen, setScreen] = useState<Screen>('home')
  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null)
  const [cart, setCart] = useState<CartLine[]>([])
  const [notes, setNotes] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(DONE_MS / 1000)
  const idleTimer = useRef<number | undefined>(undefined)
  const doneTimer = useRef<number | undefined>(undefined)
  const tickTimer = useRef<number | undefined>(undefined)

  const resetSession = useCallback(() => {
    window.clearTimeout(doneTimer.current)
    window.clearInterval(tickTimer.current)
    setScreen('home')
    setCart([])
    setNotes('')
    setSecondsLeft(DONE_MS / 1000)
    setCategoryId(categories[0]?.id ?? null)
  }, [categories])

  const bumpIdle = useCallback(() => {
    window.clearTimeout(idleTimer.current)
    if (screen === 'home' || screen === 'done') return
    idleTimer.current = window.setTimeout(resetSession, IDLE_MS)
  }, [resetSession, screen])

  useEffect(() => {
    bumpIdle()
    const onActivity = () => bumpIdle()
    window.addEventListener('pointerdown', onActivity)
    window.addEventListener('keydown', onActivity)
    return () => {
      window.clearTimeout(idleTimer.current)
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
    }
  }, [bumpIdle, screen])

  useEffect(() => {
    return () => {
      window.clearTimeout(idleTimer.current)
      window.clearTimeout(doneTimer.current)
      window.clearInterval(tickTimer.current)
    }
  }, [])

  function addCatalogItem(item: CatalogItem) {
    setCart((prev) => mergeCartLine(prev, catalogAsCartLine(item)))
    bumpIdle()
  }

  function addServiceItem(service: Service) {
    setCart((prev) => mergeCartLine(prev, serviceAsCartLine(service)))
    bumpIdle()
  }

  function confirmOrder() {
    if (cart.length === 0) return
    onSubmit(cart, notes.trim())
    setScreen('done')
    setSecondsLeft(DONE_MS / 1000)
    window.clearInterval(tickTimer.current)
    tickTimer.current = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1))
    }, 1000)
    window.clearTimeout(doneTimer.current)
    doneTimer.current = window.setTimeout(resetSession, DONE_MS)
  }

  const activeCategory = categories.find((item) => item.id === categoryId)
  const categoryItems = categoryId ? items.filter((item) => item.categoryId === categoryId) : []
  const count = cartCount(cart)
  const total = cartTotal(cart)

  const footer =
    screen === 'catalog' && count > 0 ? (
      <Button className={KIOSK_BTN} onClick={() => setScreen('cart')}>
        Ver pedido · {count} {count === 1 ? 'item' : 'itens'} · {formatBRLExact(total)}
      </Button>
    ) : screen === 'cart' ? (
      <div className="flex flex-col gap-2">
        <Button className={KIOSK_BTN} disabled={cart.length === 0} onClick={confirmOrder}>
          Enviar pedido
        </Button>
        <p className="text-center text-[12px] text-muted">{paymentNote}</p>
      </div>
    ) : undefined

  return (
    <TotemShell brand={brand} contextLabel={contextLabel} onUnbind={onUnbind} footer={footer}>
      {screen === 'home' && (
        <div className="flex flex-1 flex-col justify-center pb-8">
          <p className="text-[13px] font-medium text-muted">{greetingForNow()}</p>
          <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.045em]">{greeting}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p>
          <div className="mt-8 flex flex-col gap-3">
            <Button className={KIOSK_BTN} onClick={() => setScreen('catalog')}>
              Fazer um pedido
            </Button>
            {services.length > 0 && (
              <p className="text-[13px] text-muted">
                Também disponível: {services.map((item) => item.name).join(', ')} — dentro do catálogo.
              </p>
            )}
          </div>
        </div>
      )}

      {screen === 'catalog' && (
        <div className="flex flex-1 flex-col pb-4 pt-2">
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="mb-4 inline-flex min-h-11 items-center gap-1 text-[15px] font-medium"
            style={{ color: brand.primaryColor }}
          >
            <ChevronLeft size={18} />
            Voltar
          </button>

          {categories.length > 1 && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => {
                const active = cat.id === categoryId
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className="shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors"
                    style={{
                      background: active ? brand.primaryColor : 'white',
                      color: active ? 'white' : undefined,
                    }}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          )}

          {activeCategory && (
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
              {activeCategory.name}
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {categoryItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => addCatalogItem(item)}
                  className="flex w-full items-start justify-between gap-4 rounded-2xl bg-white px-4 py-4 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-[16px] font-medium">{item.name}</span>
                    {item.description && (
                      <span className="mt-1 block text-[13px] leading-relaxed text-muted">{item.description}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-[14px] font-semibold tabular-nums">
                    {item.price > 0 ? formatBRLExact(item.price) : 'Grátis'}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {services.length > 0 && (
            <>
              <p className="mb-3 mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">Serviços</p>
              <ul className="flex flex-col gap-3">
                {services.map((service) => (
                  <li key={service.id}>
                    <button
                      type="button"
                      onClick={() => addServiceItem(service)}
                      className="flex w-full items-start justify-between gap-4 rounded-2xl bg-white px-4 py-4 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block text-[16px] font-medium">{service.name}</span>
                        <span className="mt-1 block text-[13px] leading-relaxed text-muted">{service.description}</span>
                      </span>
                      <span className="shrink-0 text-[14px] font-semibold tabular-nums">
                        {formatBRLExact(service.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {screen === 'cart' && (
        <div className="flex flex-1 flex-col pb-4 pt-2">
          <button
            type="button"
            onClick={() => setScreen('catalog')}
            className="mb-4 inline-flex min-h-11 items-center gap-1 text-[15px] font-medium"
            style={{ color: brand.primaryColor }}
          >
            <ChevronLeft size={18} />
            Continuar pedindo
          </button>

          <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Seu pedido</h2>

          {cart.length === 0 ? (
            <p className="mt-4 text-[15px] text-muted">Nenhum item ainda.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {cart.map((line) => (
                <li key={line.key} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium">{line.name}</p>
                    <p className="text-[13px] text-muted">{formatBRLExact(line.price * line.qty)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Remover um"
                      onClick={() => setCart((prev) => bumpCartLine(prev, line.key, -1))}
                      className="flex size-10 items-center justify-center rounded-lg bg-canvas"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center text-[15px] font-semibold tabular-nums">{line.qty}</span>
                    <button
                      type="button"
                      aria-label="Adicionar um"
                      onClick={() => setCart((prev) => bumpCartLine(prev, line.key, 1))}
                      className="flex size-10 items-center justify-center rounded-lg bg-canvas"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 rounded-2xl bg-white px-4 py-4">
            <p className="text-[13px] font-medium">Observações</p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ex.: sem cebola, entregar após 19h"
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-line bg-surface px-3 py-2 text-[15px] focus:border-accent focus:outline-none"
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-[16px] font-semibold">
            <span>Total estimado</span>
            <span className="tabular-nums">{formatBRLExact(total)}</span>
          </div>
        </div>
      )}

      {screen === 'done' && (
        <div className="flex flex-1 flex-col items-center justify-center pb-8 text-center">
          <h2 className="text-[28px] font-semibold tracking-[-0.04em]">Pedido enviado</h2>
          <p className="mt-3 max-w-sm text-[16px] leading-relaxed text-muted">
            A equipe já recebeu. {paymentNote}
          </p>
          <p className="mt-6 text-[14px] text-muted">Volta ao início em {secondsLeft}s</p>
          <Button variant="secondary" className="mt-6 min-w-40" onClick={resetSession}>
            Novo pedido
          </Button>
        </div>
      )}
    </TotemShell>
  )
}

export { toOrderLines }
