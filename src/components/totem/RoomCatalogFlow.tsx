import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronLeft, ChevronUp, Minus, Plus, ShoppingBag, type LucideIcon } from 'lucide-react'
import type { CatalogCategory, CatalogItem, HotelBrand, Order, Service } from '../../types/index.ts'
import { Button } from '../ui/Button.tsx'
import { formatBRLExact, firstName, greetingForNow } from '../../utils/format.ts'
import {
  DONE_MS,
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
import {
  ROOM_IDLE_MS,
  ROOM_PAYMENT_NOTE,
  ROOM_SHORTCUTS,
  categorySubtitle,
  deliveryHint,
  featuredItems,
  iconForCategory,
  qtyInCart,
  type RoomShortcut,
} from '../../pages/totem/roomCatalog.ts'
import { TotemShell } from './TotemShell.tsx'

type Screen = 'home' | 'catalog' | 'orders' | 'done'

type Props = {
  brand: HotelBrand
  roomNumber: string
  guestName: string
  categories: CatalogCategory[]
  items: CatalogItem[]
  services?: Service[]
  orders?: Order[]
  onSubmit: (lines: CartLine[], notes: string) => void
}

export function RoomCatalogFlow({
  brand,
  roomNumber,
  guestName,
  categories,
  items,
  services = [],
  orders = [],
  onSubmit,
}: Props) {
  const [screen, setScreen] = useState<Screen>('home')
  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null)
  const [showServicesOnly, setShowServicesOnly] = useState(false)
  const [cartExpanded, setCartExpanded] = useState(false)
  const [cart, setCart] = useState<CartLine[]>([])
  const [notes, setNotes] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(DONE_MS / 1000)
  const idleTimer = useRef<number | undefined>(undefined)
  const doneTimer = useRef<number | undefined>(undefined)
  const tickTimer = useRef<number | undefined>(undefined)
  const toastTimer = useRef<number | undefined>(undefined)

  const highlights = featuredItems(items, categories)
  const count = cartCount(cart)
  const total = cartTotal(cart)

  const resetSession = useCallback(() => {
    window.clearTimeout(doneTimer.current)
    window.clearInterval(tickTimer.current)
    setScreen('home')
    setCart([])
    setNotes('')
    setShowServicesOnly(false)
    setCartExpanded(false)
    setSecondsLeft(DONE_MS / 1000)
    setCategoryId(categories[0]?.id ?? null)
  }, [categories])

  const bumpIdle = useCallback(() => {
    window.clearTimeout(idleTimer.current)
    if (screen === 'home' || screen === 'done') return
    idleTimer.current = window.setTimeout(resetSession, ROOM_IDLE_MS)
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
      window.clearTimeout(toastTimer.current)
    }
  }, [])

  function flashToast(message: string) {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  function openCatalog(shortcut?: RoomShortcut) {
    if (shortcut?.showOrders) {
      setShowServicesOnly(false)
      setScreen('orders')
      bumpIdle()
      return
    }
    if (shortcut?.showServices) {
      setShowServicesOnly(true)
      setCategoryId(null)
    } else if (shortcut?.categoryId) {
      setShowServicesOnly(false)
      setCategoryId(shortcut.categoryId)
    } else {
      setShowServicesOnly(false)
      setCategoryId(categories[0]?.id ?? null)
    }
    setScreen('catalog')
    bumpIdle()
  }

  function addCatalogItem(item: CatalogItem) {
    setCart((prev) => mergeCartLine(prev, catalogAsCartLine(item)))
    flashToast(`${item.name} adicionado`)
    bumpIdle()
  }

  function addServiceItem(service: Service) {
    setCart((prev) => mergeCartLine(prev, serviceAsCartLine(service)))
    flashToast(`${service.name} adicionado`)
    bumpIdle()
  }

  function confirmOrder() {
    if (cart.length === 0) return
    setCartExpanded(false)
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
  const showCartDock = count > 0 && screen !== 'done'
  const activeOrders = orders.filter((item) => item.status === 'open' || item.status === 'preparing')
  const sortedOrders = [...orders].sort((a, b) => b.time.localeCompare(a.time))

  return (
    <TotemShell brand={brand} contextLabel={`Quarto ${roomNumber}`} guestMode>
      {toast && (
        <div
          className="room-totem-toast fixed left-1/2 top-[max(4.5rem,env(safe-area-inset-top))] z-20 -translate-x-1/2"
          role="status"
        >
          <Check size={16} strokeWidth={2.5} />
          {toast}
        </div>
      )}

      {screen === 'home' && (
        <div className={`room-totem-home flex flex-1 flex-col ${showCartDock ? 'pb-28' : 'pb-8'}`}>
          <div
            className="room-totem-hero -mx-6 mb-6 px-6 py-8 text-center"
            style={{ background: brand.coverTone }}
          >
            <p className="text-[13px] font-medium" style={{ color: brand.primaryColor }}>
              {greetingForNow()}, {firstName(guestName)}
            </p>
            <h1 className="mt-2 text-[clamp(1.75rem,5vw,2.25rem)] font-semibold leading-tight tracking-[-0.04em]">
              O que você precisa?
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
              Peça no quarto. {ROOM_PAYMENT_NOTE}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ROOM_SHORTCUTS.map((shortcut) => {
              const Icon = shortcut.icon
              return (
                <button
                  key={shortcut.id}
                  type="button"
                  onClick={() => openCatalog(shortcut)}
                  className="room-totem-shortcut flex min-h-[7.5rem] flex-col items-start rounded-2xl bg-white p-4 text-left shadow-soft"
                >
                  <span
                    className="flex size-11 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in srgb, ${brand.primaryColor} 12%, white)`,
                      color: brand.primaryColor,
                    }}
                  >
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <span className="mt-3 text-[16px] font-semibold tracking-[-0.02em]">{shortcut.label}</span>
                  <span className="mt-0.5 text-[12px] text-muted">
                    {shortcut.showOrders && activeOrders.length > 0
                      ? `${activeOrders.length} em andamento`
                      : shortcut.hint}
                  </span>
                </button>
              )
            })}
          </div>

          {highlights.length > 0 && (
            <section className="mt-8">
              <div className="mb-3 flex items-end justify-between gap-3">
                <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Destaques do cardápio</h2>
                <button
                  type="button"
                  onClick={() => openCatalog()}
                  className="text-[13px] font-medium"
                  style={{ color: brand.primaryColor }}
                >
                  Ver tudo
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {highlights.map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId)
                  const Icon = iconForCategory(item.categoryId)
                  return (
                    <li key={item.id}>
                      <HomeHighlightCard
                        item={item}
                        category={cat}
                        icon={Icon}
                        brand={brand}
                        onAdd={() => addCatalogItem(item)}
                      />
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      )}

      {screen === 'catalog' && (
        <div className={`room-menu-catalog flex flex-1 flex-col ${showCartDock ? 'pb-28' : 'pb-4'}`}>
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="mb-2 inline-flex min-h-11 items-center gap-1 text-[14px] font-medium text-muted hover:text-ink"
          >
            <ChevronLeft size={18} />
            Voltar
          </button>

          <div
            className="room-menu-hero -mx-6 mb-6 px-6 py-7"
            style={{
              background: `linear-gradient(165deg, ${brand.coverTone} 0%, color-mix(in srgb, ${brand.secondaryColor} 88%, ${brand.coverTone}) 100%)`,
            }}
          >
            <h2 className="text-[clamp(1.75rem,5vw,2.35rem)] font-semibold leading-tight tracking-[-0.04em] text-balance">
              {showServicesOnly ? 'Serviços do hotel' : activeCategory?.name ?? 'Cardápio'}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              {showServicesOnly
                ? 'Agende pelo quarto. Valor na conta.'
                : categorySubtitle(activeCategory)}
            </p>
          </div>

          {!showServicesOnly && categories.length > 1 && (
            <div
              className="room-menu-tabs mb-6 flex gap-1 rounded-2xl p-1"
              style={{ background: `color-mix(in srgb, ${brand.primaryColor} 6%, white)` }}
              role="tablist"
            >
              {categories.map((cat) => {
                const active = cat.id === categoryId
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategoryId(cat.id)}
                    className="min-h-11 flex-1 rounded-xl px-2 py-2.5 text-[13px] font-semibold transition-all duration-200"
                    style={{
                      background: active ? brand.primaryColor : 'transparent',
                      color: active ? '#fff' : undefined,
                      boxShadow: active ? '0 2px 8px color-mix(in srgb, var(--hotel-primary) 24%, transparent)' : undefined,
                    }}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          )}

          {!showServicesOnly && (
            <ul className="room-menu-list flex flex-col">
              {categoryItems.map((item, index) => (
                <li key={item.id}>
                  <MenuItemRow
                    item={item}
                    category={activeCategory}
                    brand={brand}
                    inCart={qtyInCart(cart, item.id)}
                    onAdd={() => addCatalogItem(item)}
                  />
                  {index < categoryItems.length - 1 && <div className="room-menu-divider" aria-hidden="true" />}
                </li>
              ))}
            </ul>
          )}

          {(showServicesOnly || services.length > 0) && (
            <ul className={`room-menu-list flex flex-col ${showServicesOnly ? '' : 'mt-8'}`}>
              {!showServicesOnly && services.length > 0 && (
                <li className="mb-4">
                  <h3 className="text-[18px] font-semibold tracking-[-0.03em]">Serviços</h3>
                </li>
              )}
              {services.map((service, index) => (
                <li key={service.id}>
                  <ServiceRow
                    service={service}
                    brand={brand}
                    inCart={cart.find((line) => line.key === `sv-${service.id}`)?.qty ?? 0}
                    onAdd={() => addServiceItem(service)}
                  />
                  {index < services.length - 1 && <div className="room-menu-divider" aria-hidden="true" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {screen === 'orders' && (
        <div className={`flex flex-1 flex-col ${showCartDock ? 'pb-28' : 'pb-4'}`}>
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="mb-2 inline-flex min-h-11 items-center gap-1 text-[14px] font-medium text-muted hover:text-ink"
          >
            <ChevronLeft size={18} />
            Voltar
          </button>

          <div
            className="room-menu-hero -mx-6 mb-6 px-6 py-7"
            style={{
              background: `linear-gradient(165deg, ${brand.coverTone} 0%, color-mix(in srgb, ${brand.secondaryColor} 88%, ${brand.coverTone}) 100%)`,
            }}
          >
            <h2 className="text-[clamp(1.75rem,5vw,2.35rem)] font-semibold leading-tight tracking-[-0.04em]">
              Meus pedidos
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Acompanhe o andamento do que você pediu pelo cardápio.
            </p>
          </div>

          {sortedOrders.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
              <p className="text-[17px] font-semibold tracking-[-0.02em]">Nenhum pedido ainda</p>
              <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted">
                Quando você pedir pelo cardápio, o status aparece aqui em tempo real.
              </p>
              <Button className={`mt-6 ${KIOSK_BTN}`} onClick={() => openCatalog()}>
                Ver cardápio
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {sortedOrders.map((order) => (
                <li key={order.id}>
                  <OrderTrackCard order={order} brand={brand} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showCartDock && (
        <RoomCartDock
          brand={brand}
          cart={cart}
          count={count}
          total={total}
          notes={notes}
          expanded={cartExpanded}
          onToggle={() => setCartExpanded((prev) => !prev)}
          onClose={() => setCartExpanded(false)}
          onNotesChange={setNotes}
          onBumpLine={(key, delta) => setCart((prev) => bumpCartLine(prev, key, delta))}
          onConfirm={confirmOrder}
        />
      )}

      {screen === 'done' && (
        <div className="totem-success-mark flex flex-1 flex-col items-center justify-center pb-8 text-center">
          <span
            className="flex size-16 items-center justify-center rounded-full"
            style={{ background: `color-mix(in srgb, ${brand.primaryColor} 14%, white)` }}
          >
            <Check size={32} strokeWidth={2} style={{ color: brand.primaryColor }} />
          </span>
          <span
            className="mx-auto mt-5 block h-1 w-16 rounded-full"
            style={{ background: brand.accentColor }}
            aria-hidden="true"
          />
          <h2 className="mt-6 text-[1.75rem] font-semibold tracking-[-0.04em]">Pedido a caminho</h2>
          <p className="mt-2 text-[15px] font-medium" style={{ color: brand.primaryColor }}>
            Previsão ~25 min
          </p>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
            {firstName(guestName)}, a equipe já recebeu. {ROOM_PAYMENT_NOTE}
          </p>
          <p className="mt-6 text-[13px] text-muted">Volta ao início em {secondsLeft}s</p>
          <Button variant="secondary" className="mt-6 min-h-12 min-w-44 text-[15px]" onClick={resetSession}>
            Fazer outro pedido
          </Button>
        </div>
      )}
    </TotemShell>
  )
}

function OrderTrackCard({ order, brand }: { order: Order; brand: HotelBrand }) {
  const status = ORDER_TRACK[order.status]
  const isDone = order.status === 'delivered' || order.status === 'cancelled'

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="flex items-start justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <p className="text-[16px] font-semibold leading-snug tracking-[-0.02em]">{order.items}</p>
          <p className="mt-1 text-[13px] text-muted">
            {order.time}
            {order.total > 0 && ` · ${formatBRLExact(order.total)}`}
          </p>
          {order.notes && <p className="mt-2 text-[13px] text-muted">Obs.: {order.notes}</p>}
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      {!isDone && (
        <div className="border-t border-line px-4 py-4">
          <ol className="flex gap-2">
            {TRACK_STEPS.map((step, index) => {
              const reached = status.step >= index + 1
              return (
                <li key={step} className="flex flex-1 flex-col gap-2">
                  <span
                    className="h-1.5 rounded-full transition-colors"
                    style={{
                      background: reached
                        ? brand.primaryColor
                        : 'color-mix(in srgb, var(--hotel-primary) 12%, white)',
                    }}
                  />
                  <span
                    className="text-[11px] font-medium leading-tight"
                    style={{ color: reached ? brand.primaryColor : undefined }}
                  >
                    {step}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </article>
  )
}

const TRACK_STEPS = ['Recebido', 'Preparando', 'A caminho'] as const

const ORDER_TRACK: Record<
  Order['status'],
  { label: string; step: number; bg: string; color: string }
> = {
  open: {
    label: 'Recebido',
    step: 1,
    bg: 'color-mix(in srgb, var(--hotel-primary) 12%, white)',
    color: 'color-mix(in srgb, var(--hotel-primary) 90%, #000)',
  },
  preparing: {
    label: 'Em preparo',
    step: 2,
    bg: '#eef1f6',
    color: '#4a5a73',
  },
  delivered: {
    label: 'Entregue',
    step: 3,
    bg: '#ecf4ee',
    color: '#3d6b4f',
  },
  cancelled: {
    label: 'Cancelado',
    step: 0,
    bg: '#fef3f2',
    color: '#b42318',
  },
}

function HomeHighlightCard({
  item,
  category,
  icon: Icon,
  brand,
  onAdd,
}: {
  item: CatalogItem
  category?: CatalogCategory
  icon: LucideIcon
  brand: HotelBrand
  onAdd: () => void
}) {
  const hint = deliveryHint(category, item.price)

  return (
    <button
      type="button"
      onClick={onAdd}
      className="room-totem-shortcut flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-soft"
    >
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: `color-mix(in srgb, ${brand.primaryColor} 10%, white)`,
          color: brand.primaryColor,
        }}
      >
        <Icon size={20} strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[16px] font-semibold tracking-[-0.02em]">{item.name}</span>
          <span className="room-catalog-badge">{hint}</span>
        </span>
        {item.description && (
          <span className="mt-1 block text-[13px] leading-relaxed text-muted">{item.description}</span>
        )}
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[15px] font-semibold tabular-nums">
          {item.price > 0 ? formatBRLExact(item.price) : 'Grátis'}
        </span>
        <span className="mt-1 block text-[11px] font-medium" style={{ color: brand.primaryColor }}>
          Adicionar
        </span>
      </span>
    </button>
  )
}

function MenuItemRow({
  item,
  category,
  brand,
  inCart,
  onAdd,
}: {
  item: CatalogItem
  category?: CatalogCategory
  brand: HotelBrand
  inCart: number
  onAdd: () => void
}) {
  const hint = deliveryHint(category, item.price)

  return (
    <button type="button" onClick={onAdd} className="room-menu-row flex w-full gap-4 py-5 text-left">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.03em]">{item.name}</h3>
          <span className="shrink-0 text-[17px] font-semibold tabular-nums tracking-[-0.02em]" style={{ color: brand.primaryColor }}>
            {item.price > 0 ? formatBRLExact(item.price) : 'Grátis'}
          </span>
        </div>
        {item.description && (
          <p className="mt-1.5 max-w-prose text-[14px] leading-relaxed text-muted">{item.description}</p>
        )}
        <p className="mt-2 text-[12px] font-medium" style={{ color: `color-mix(in srgb, ${brand.primaryColor} 72%, #171717)` }}>
          {hint}
        </p>
      </div>
      <span className="room-menu-add-btn shrink-0 self-center" data-active={inCart > 0 || undefined} aria-hidden="true">
        {inCart > 0 ? inCart : <Plus size={20} strokeWidth={2} />}
      </span>
    </button>
  )
}

function ServiceRow({
  service,
  brand,
  inCart,
  onAdd,
}: {
  service: Service
  brand: HotelBrand
  inCart: number
  onAdd: () => void
}) {
  return (
    <button type="button" onClick={onAdd} className="room-menu-row flex w-full gap-4 py-5 text-left">
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
        style={{ background: service.tone }}
      >
        <span className="text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: brand.primaryColor }}>
          {service.name.slice(0, 2)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.03em]">{service.name}</h3>
          <span className="shrink-0 text-[17px] font-semibold tabular-nums" style={{ color: brand.primaryColor }}>
            {formatBRLExact(service.price)}
          </span>
        </div>
        <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{service.description}</p>
        <p className="mt-2 text-[12px] font-medium" style={{ color: `color-mix(in srgb, ${brand.primaryColor} 72%, #171717)` }}>
          Agendar
        </p>
      </div>
      <span className="room-menu-add-btn shrink-0 self-center" data-active={inCart > 0 || undefined} aria-hidden="true">
        {inCart > 0 ? inCart : <Plus size={20} strokeWidth={2} />}
      </span>
    </button>
  )
}

function RoomCartDock({
  brand,
  cart,
  count,
  total,
  notes,
  expanded,
  onToggle,
  onClose,
  onNotesChange,
  onBumpLine,
  onConfirm,
}: {
  brand: HotelBrand
  cart: CartLine[]
  count: number
  total: number
  notes: string
  expanded: boolean
  onToggle: () => void
  onClose: () => void
  onNotesChange: (value: string) => void
  onBumpLine: (key: string, delta: number) => void
  onConfirm: () => void
}) {
  return (
    <div className="room-cart-dock pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl">
      {expanded && (
        <button
          type="button"
          aria-label="Fechar pedido"
          className="room-cart-backdrop pointer-events-auto fixed inset-0 bg-ink/30"
          onClick={onClose}
        />
      )}

      <div
        className={`room-cart-panel pointer-events-auto relative mx-auto w-full ${expanded ? 'room-cart-panel--open' : ''}`}
        role={expanded ? 'dialog' : undefined}
        aria-modal={expanded || undefined}
        aria-label={expanded ? 'Seu pedido' : undefined}
      >
        {expanded && (
          <div className="room-cart-sheet flex max-h-[min(72svh,640px)] flex-col rounded-t-3xl bg-white shadow-[0_-8px_32px_rgb(17_24_39_/_0.12)]">
            <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-[18px] font-semibold tracking-[-0.03em]">Seu pedido</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full bg-canvas text-muted"
                aria-label="Continuar comprando"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
              <ul className="flex flex-col gap-2">
                {cart.map((line) => (
                  <li
                    key={line.key}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-canvas px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium">{line.name}</p>
                      <p className="text-[13px] text-muted">{formatBRLExact(line.price * line.qty)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Remover um"
                        onClick={() => onBumpLine(line.key, -1)}
                        className="flex size-10 items-center justify-center rounded-lg bg-white"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-6 text-center text-[15px] font-semibold tabular-nums">{line.qty}</span>
                      <button
                        type="button"
                        aria-label="Adicionar um"
                        onClick={() => onBumpLine(line.key, 1)}
                        className="flex size-10 items-center justify-center rounded-lg bg-white"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-2xl bg-canvas px-4 py-4">
                <p className="text-[13px] font-medium">Observações</p>
                <textarea
                  value={notes}
                  onChange={(event) => onNotesChange(event.target.value)}
                  placeholder="Ex.: sem cebola, entregar após 19h"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-[15px] focus:border-accent focus:outline-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-[16px] font-semibold">
                <span>Total estimado</span>
                <span className="tabular-nums">{formatBRLExact(total)}</span>
              </div>
            </div>

            <div className="shrink-0 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button className={KIOSK_BTN} onClick={onConfirm}>
                Enviar pedido
              </Button>
              <p className="mt-2 text-center text-[12px] text-muted">{ROOM_PAYMENT_NOTE}</p>
            </div>
          </div>
        )}

        {!expanded && (
          <button
            type="button"
            onClick={onToggle}
            className="room-cart-bar flex w-full items-center gap-3 border-t border-line/80 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgb(17_24_39_/_0.08)]"
          >
            <span
              className="relative flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `color-mix(in srgb, ${brand.primaryColor} 12%, white)`,
                color: brand.primaryColor,
              }}
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
              <span
                className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: brand.primaryColor }}
              >
                {count}
              </span>
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[15px] font-semibold tracking-[-0.02em]">
                {count} {count === 1 ? 'item' : 'itens'} · {formatBRLExact(total)}
              </span>
              <span className="block text-[12px] text-muted">Toque para revisar e enviar</span>
            </span>
            <span
              className="flex shrink-0 items-center gap-1 text-[14px] font-semibold"
              style={{ color: brand.primaryColor }}
            >
              Finalizar
              <ChevronUp size={18} strokeWidth={2} />
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export { toOrderLines }
