import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ScanLine } from 'lucide-react'
import { useApp } from '../../app/useApp.ts'
import { useAuth } from '../../auth/AuthContext.tsx'
import { ApiError } from '../../api/client.ts'
import { isDemoMode } from '../../demo/mode.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { TotemStaffConfigHold } from '../../components/totem/TotemStaffConfigHold.tsx'
import { formatBRLExact, formatLongDate } from '../../utils/format.ts'
import { totemSearchEmptyMessage } from '../../lib/totemSearch.ts'
import { reservationRoomLabel } from '../../lib/reservationDisplay.ts'
import { cn } from '../../utils/cn.ts'
import type { CheckoutStatement } from '../../modules/journeys/model.ts'
import type { PaymentMethod } from '../../shared/model.ts'
import type { Reservation } from '../../modules/reservations/model.ts'
import { totemBrandTitle, hotelMonogram, totemShellStyle } from '../../lib/totemBrand.ts'
import {
  DONE_MS,
  FLOW_STEPS,
  IDLE_MS,
  SCAN_MS,
  clockLabel,
  firstName,
  searchReservations,
  termsDisplayFor,
  wingCopy,
  type FlowStepId,
} from './totemCheckin.ts'
import {
  CHECKOUT_PAYMENT_OPTIONS,
  searchCheckoutReservations,
} from './totemCheckout.ts'

type FlowMode = 'checkin' | 'checkout'
type Screen = 'início' | FlowStepId | 'lista' | 'extrato' | 'pagamento' | 'fim'
type DocStatus = 'idle' | 'scanning' | 'ok' | 'fail'

const KIOSK_BTN = 'w-full'
const CHECKOUT_STEPS = [
  { id: 'busca', label: 'Reserva' },
  { id: 'extrato', label: 'Conta' },
  { id: 'pagamento', label: 'Pagamento' },
] as const

function totemApiMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return err.message || 'Esta operação já foi concluída. Fale com a recepção, ao lado.'
    }
    return err.message || fallback
  }
  return fallback
}

export function SelfServicePage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const {
    hotel,
    hotelRooms,
    searchCheckin,
    validateCheckin,
    completeCheckin,
    searchCheckout,
    validateCheckout,
    completeCheckout,
    addActivity,
  } = useApp()
  const brand = hotel.brand
  const terms = termsDisplayFor(hotel)
  const termsId = useId()

  const [flowMode, setFlowMode] = useState<FlowMode | null>(null)
  const [screen, setScreen] = useState<Screen>('início')
  const [query, setQuery] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)
  const [validating, setValidating] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [matches, setMatches] = useState<Reservation[]>([])
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [statement, setStatement] = useState<CheckoutStatement | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [docStatus, setDocStatus] = useState<DocStatus>('idle')
  const [accepted, setAccepted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(DONE_MS / 1000)
  const [notice, setNotice] = useState('')
  const [flowError, setFlowError] = useState('')
  const demoMode = isDemoMode()

  const scanTimer = useRef<number | undefined>(undefined)
  const idleTimer = useRef<number | undefined>(undefined)
  const doneTimer = useRef<number | undefined>(undefined)
  const tickTimer = useRef<number | undefined>(undefined)
  const sessionVersion = useRef(0)

  const isCheckout = flowMode === 'checkout'
  const steps = isCheckout ? CHECKOUT_STEPS : FLOW_STEPS
  const flowIndex = steps.findIndex((step) => step.id === screen)
  const inFlow = flowMode !== null && (flowIndex >= 0 || screen === 'lista')
  const progressIndex =
    screen === 'lista' ? 0 : screen === 'extrato' ? 1 : screen === 'pagamento' ? 2 : flowIndex

  const room = reservation ? hotelRooms.find((item) => item.id === reservation.roomId) : undefined
  const floor = room?.floor ?? Number(reservation?.roomNumber.slice(0, 1) || 1)

  const resetSession = useCallback((nextNotice = '') => {
    sessionVersion.current += 1
    window.clearTimeout(scanTimer.current)
    window.clearTimeout(doneTimer.current)
    window.clearInterval(tickTimer.current)
    setFlowMode(null)
    setScreen('início')
    setQuery('')
    setSearchError('')
    setSearching(false)
    setValidating(false)
    setCompleting(false)
    setMatches([])
    setReservation(null)
    setStatement(null)
    setPaymentMethod('card')
    setDocStatus('idle')
    setAccepted(false)
    setSecondsLeft(DONE_MS / 1000)
    setNotice(nextNotice)
    setFlowError('')
  }, [])

  const bumpIdle = useCallback(() => {
    window.clearTimeout(idleTimer.current)
    if (screen === 'início' || screen === 'fim') return
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
      window.clearTimeout(scanTimer.current)
      window.clearTimeout(doneTimer.current)
      window.clearInterval(tickTimer.current)
      window.clearTimeout(idleTimer.current)
    }
  }, [])

  function startFlow(mode: FlowMode) {
    setFlowMode(mode)
    setScreen('busca')
    setSearchError('')
    setFlowError('')
  }

  function goBack() {
    setFlowError('')
    if (screen === 'busca' || screen === 'lista') {
      resetSession()
      return
    }
    if (screen === 'dados') {
      setScreen(matches.length > 1 ? 'lista' : 'busca')
      return
    }
    if (screen === 'docs') {
      setDocStatus('idle')
      setScreen('dados')
      return
    }
    if (screen === 'termos') {
      setAccepted(false)
      setScreen('docs')
    }
    if (screen === 'extrato') {
      setStatement(null)
      setScreen(matches.length > 1 ? 'lista' : 'busca')
    }
    if (screen === 'pagamento') {
      setScreen('extrato')
    }
  }

  async function openCheckinReservation(next: Reservation) {
    const version = sessionVersion.current
    setValidating(true)
    setSearchError('')
    try {
      const validated = await validateCheckin(next.id)
      if (version !== sessionVersion.current) return
      setReservation(validated)
      setDocStatus('idle')
      setAccepted(false)
      setScreen('dados')
    } catch (err) {
      if (version !== sessionVersion.current) return
      setSearchError(totemApiMessage(err, 'Não foi possível validar a reserva. A recepção resolve.'))
    } finally {
      if (version === sessionVersion.current) setValidating(false)
    }
  }

  async function openCheckoutReservation(next: Reservation) {
    const version = sessionVersion.current
    setValidating(true)
    setSearchError('')
    try {
      const nextStatement = await validateCheckout(next.id)
      if (version !== sessionVersion.current) return
      setReservation(nextStatement.reservation)
      setStatement(nextStatement)
      setPaymentMethod('card')
      setScreen('extrato')
    } catch (err) {
      if (version !== sessionVersion.current) return
      setSearchError(totemApiMessage(err, 'Não foi possível carregar a conta. A recepção resolve.'))
    } finally {
      if (version === sessionVersion.current) setValidating(false)
    }
  }

  function openReservation(next: Reservation) {
    if (isCheckout) void openCheckoutReservation(next)
    else void openCheckinReservation(next)
  }

  function handleSearch() {
    if (searching || validating) return
    if (!query.trim()) {
      setSearchError(totemSearchEmptyMessage())
      return
    }
    setSearching(true)
    setSearchError('')
    const version = sessionVersion.current
    void (async () => {
      try {
        const list = isCheckout ? await searchCheckout(query) : await searchCheckin(query)
        if (version !== sessionVersion.current) return
        setSearching(false)
        const outcome = isCheckout
          ? searchCheckoutReservations(list, query)
          : searchReservations(list, query)
        if (outcome.kind === 'empty') {
          setSearchError(totemSearchEmptyMessage())
          return
        }
        if (outcome.kind === 'none') {
          setSearchError('Nenhuma reserva encontrada. Confira os dados ou chame a recepção, ao lado.')
          return
        }
        if (outcome.kind === 'blocked') {
          setSearchError(outcome.message)
          return
        }
        if (outcome.kind === 'many') {
          setMatches(outcome.reservations)
          setScreen('lista')
          return
        }
        setMatches([])
        openReservation(outcome.reservation)
      } catch (err) {
        if (version !== sessionVersion.current) return
        setSearching(false)
        setSearchError(totemApiMessage(err, 'Não foi possível consultar a API. Verifique a conexão e o login.'))
      }
    })()
  }

  function startScan() {
    if (docStatus === 'scanning') return
    setDocStatus('scanning')
    window.clearTimeout(scanTimer.current)
    scanTimer.current = window.setTimeout(() => setDocStatus('ok'), SCAN_MS)
  }

  function showDoneScreen(next: Reservation, activity: { title: string; detail: string; kind: 'checkin' | 'checkout' }) {
    setReservation(next)
    addActivity({
      time: clockLabel(),
      title: activity.title,
      detail: activity.detail,
      kind: activity.kind,
    })
    setScreen('fim')
    setSecondsLeft(DONE_MS / 1000)
    window.clearInterval(tickTimer.current)
    tickTimer.current = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1))
    }, 1000)
    window.clearTimeout(doneTimer.current)
    doneTimer.current = window.setTimeout(resetSession, DONE_MS)
  }

  function finishCheckIn() {
    if (!reservation || !accepted) return
    const version = sessionVersion.current
    setCompleting(true)
    setFlowError('')
    void completeCheckin(reservation.id)
      .then((next) => {
        if (version !== sessionVersion.current) return
        showDoneScreen(next, {
          title: 'Check-in no totem',
          detail: `${next.guestName} — Quarto ${next.roomNumber}`,
          kind: 'checkin',
        })
      })
      .catch((err) => {
        if (version !== sessionVersion.current) return
        setFlowError(totemApiMessage(err, 'Não foi possível concluir o check-in. Tente novamente ou chame a recepção.'))
      })
      .finally(() => {
        if (version === sessionVersion.current) setCompleting(false)
      })
  }

  function finishCheckout() {
    if (!reservation || !statement) return
    const version = sessionVersion.current
    setCompleting(true)
    setFlowError('')
    void completeCheckout(reservation.id, {
      paymentMethod,
      paidAmount: statement.total,
    })
      .then((next) => {
        if (version !== sessionVersion.current) return
        showDoneScreen(next, {
          title: 'Check-out realizado',
          detail: `${next.guestName} — ${formatBRLExact(statement.total)}`,
          kind: 'checkout',
        })
      })
      .catch((err) => {
        if (version !== sessionVersion.current) return
        setFlowError(totemApiMessage(err, 'Não foi possível concluir o check-out. Tente novamente ou chame a recepção.'))
      })
      .finally(() => {
        if (version === sessionVersion.current) setCompleting(false)
      })
  }

  const footer = footerFor(screen, {
    searching: searching || validating,
    completing,
    docStatus,
    accepted,
    isCheckout,
    onBack: goBack,
    onSearch: handleSearch,
    onConfirm: () => setScreen('docs'),
    onContinueDocs: () => setScreen('termos'),
    onScan: startScan,
    onFinish: finishCheckIn,
    onRejectTerms: () => resetSession('Sem aceitar os termos, o check-in fica com a recepção, ao lado.'),
    onContinueExtrato: () => setScreen('pagamento'),
    onFinishCheckout: finishCheckout,
  })

  return (
    <div className="totem-shell flex min-h-svh flex-col" style={totemShellStyle(brand)}>
      <header className="px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <TotemStaffConfigHold
          holdMs={5000}
          actions={[
            {
              label: 'Voltar ao início',
              onClick: () => resetSession(),
            },
            {
              label: 'Sair',
              variant: 'danger',
              onClick: () => {
                void signOut().then(() => navigate('/login', { replace: true }))
              },
            },
          ]}
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: brand.primaryColor }}>
            {totemBrandTitle(brand, hotel.name)}
          </p>
        </TotemStaffConfigHold>
        {demoMode && <p className="mt-1 text-[12px] font-medium text-muted">Modo demonstração</p>}
      </header>

      {inFlow && progressIndex >= 0 && (
        <div className="px-6 pb-2">
          <p className="text-[15px] font-medium" aria-live="off">
            Passo {progressIndex + 1} de {steps.length}: {steps[progressIndex]?.label}
          </p>
          <ol className="mt-3 flex gap-2" aria-hidden="true">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  background:
                    index <= progressIndex ? brand.primaryColor : 'color-mix(in srgb, #171717 12%, transparent)',
                }}
              />
            ))}
          </ol>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6" aria-live="polite">
        {flowError && screen !== 'início' && (
          <div role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-900">
            {flowError}
          </div>
        )}
        {screen === 'início' && (
          <div className="flex flex-1 flex-col justify-center py-4">
            <div className="flex flex-col items-center text-center">
              <div
                className="totem-welcome-mark"
                style={{
                  color: brand.primaryColor,
                  background: `color-mix(in srgb, ${brand.accentColor} 20%, #ffffff)`,
                  border: `2px solid color-mix(in srgb, ${brand.primaryColor} 22%, transparent)`,
                }}
                aria-hidden
              >
                {hotelMonogram(hotel.name)}
              </div>
              <span
                className="mx-auto mt-5 block h-1 w-16 rounded-full"
                style={{ background: brand.accentColor }}
                aria-hidden
              />
              <h1 className="mt-6 text-[clamp(1.85rem,5vw,2.35rem)] font-semibold leading-[1.15] tracking-[-0.04em] text-balance">
                Bem-vindo ao {hotel.name}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-muted">
                Encontre sua reserva e siga as etapas na tela. A recepção está disponível se precisar de ajuda.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button size="kiosk" className={KIOSK_BTN} onClick={() => startFlow('checkin')}>
                Iniciar check-in
              </Button>
              <Button size="kiosk" variant="secondary" className={KIOSK_BTN} onClick={() => startFlow('checkout')}>
                Fazer check-out
              </Button>
            </div>

            {notice && (
              <div
                role="alert"
                className="mx-auto mt-6 max-w-md rounded-2xl border px-4 py-3 text-[15px] font-medium leading-snug"
                style={{
                  borderColor: `color-mix(in srgb, ${brand.accentColor} 45%, #d1d5db)`,
                  background: `color-mix(in srgb, ${brand.accentColor} 14%, #ffffff)`,
                  color: '#171717',
                }}
              >
                {notice}
              </div>
            )}
          </div>
        )}

        {screen === 'busca' && (
          <FlowBody title={isCheckout ? 'Encontre sua estadia' : 'Encontre sua reserva'}>
            <Input
              autoFocus
              autoCapitalize="words"
              autoComplete="off"
              spellCheck={false}
              label="Código da reserva, CPF ou nome completo"
              placeholder="Maria Oliveira, RS-1002 ou 000.000.000-00"
              hint="Use o código do e-mail de confirmação para encontrar sua reserva mais rápido."
              error={searchError || undefined}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                if (searchError) setSearchError('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              className="h-14 rounded-xl px-4 text-base"
            />
          </FlowBody>
        )}

        {screen === 'lista' && (
          <FlowBody title="Qual reserva é a sua?">
            <ul className="flex flex-col gap-3">
              {matches.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={validating}
                    onClick={() => openReservation(item)}
                    className="flex min-h-16 w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-left disabled:opacity-60"
                  >
                    <span>
                      <span className="block text-[17px] font-medium">{item.guestName}</span>
                      <span className="mt-1 block text-[14px] text-muted">
                        {formatLongDate(isCheckout ? item.checkOut : item.checkIn)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </FlowBody>
        )}

        {screen === 'dados' && reservation && (
          <FlowBody title="Confirme seus dados">
            <ul className="space-y-3 text-[16px]">
              <Row k="Hóspede" v={reservation.guestName} />
              {reservation.code && <Row k="Reserva" v={reservation.code} />}
              <Row k="Quarto" v={reservationRoomLabel(reservation)} />
              <Row k="Entrada" v={formatLongDate(reservation.checkIn)} />
              <Row k="Saída" v={formatLongDate(reservation.checkOut)} />
            </ul>
            <button
              type="button"
              onClick={() => {
                setReservation(null)
                setScreen('busca')
              }}
              className="mt-5 min-h-12 text-[16px] font-medium underline-offset-4 hover:underline"
              style={{ color: brand.primaryColor }}
            >
              Isto não sou eu
            </button>
          </FlowBody>
        )}

        {screen === 'docs' && (
          <FlowBody title="Documento">
            <p className="text-[16px] leading-relaxed text-muted">
              Esta etapa demonstra a conferência de identidade. Nenhum documento é lido por este dispositivo.
            </p>
            <div
              className={cn(
                'mt-5 flex min-h-44 flex-col items-center justify-center rounded-2xl border bg-white px-5 py-10 text-center',
                docStatus === 'ok' ? 'border-transparent' : 'border-dashed border-line',
              )}
              style={docStatus === 'ok' ? { boxShadow: `inset 0 0 0 2px ${brand.accentColor}` } : undefined}
            >
              {docStatus === 'idle' && (
                <>
                  <ScanLine className="size-8" style={{ color: brand.primaryColor }} strokeWidth={1.75} />
                  <p className="mt-3 text-[16px] text-muted">Leitura demonstrativa</p>
                </>
              )}
              {docStatus === 'scanning' && <p className="text-[16px] font-medium">Simulando conferência…</p>}
              {docStatus === 'ok' && (
                <>
                  <Check className="size-8" style={{ color: brand.accentColor }} strokeWidth={2.2} />
                  <p className="mt-3 text-[16px] font-medium">Etapa demonstrativa concluída</p>
                </>
              )}
              {docStatus === 'fail' && (
                <p className="text-[16px] font-medium">A conferência real precisa ser feita pela equipe.</p>
              )}
            </div>
          </FlowBody>
        )}

        {screen === 'termos' && (
          <FlowBody title="Termos da hospedagem">
            {terms.lines.length > 0 && (
              <ul className="space-y-3 text-[16px] leading-relaxed text-muted">
                {terms.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
            {terms.pdfUrl && (
              <div className={terms.lines.length > 0 ? 'mt-5' : ''}>
                <p className="mb-2 text-[14px] font-medium text-ink">Documento completo</p>
                <iframe
                  title="Termos da hospedagem em PDF"
                  src={terms.pdfUrl}
                  className="h-[min(42vh,320px)] w-full rounded-xl border border-line bg-canvas"
                />
                <a
                  href={terms.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center text-[14px] font-medium underline-offset-2 hover:underline"
                  style={{ color: brand.primaryColor }}
                >
                  Abrir PDF em tela cheia
                </a>
              </div>
            )}
            <label htmlFor={termsId} className="mt-6 flex min-h-14 cursor-pointer items-start gap-3">
              <input
                id={termsId}
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 size-6 shrink-0 rounded border-line accent-current"
                style={{ accentColor: brand.primaryColor }}
              />
              <span className="text-[16px] leading-snug">Li e aceito os termos da hospedagem.</span>
            </label>
          </FlowBody>
        )}

        {screen === 'extrato' && reservation && statement && (
          <FlowBody title="Sua conta">
            <ul className="space-y-3 text-[16px]">
              <Row k="Hóspede" v={reservation.guestName} />
              <Row k="Quarto" v={reservation.roomNumber} />
            </ul>
            <ul className="mt-5 space-y-2">
              {statement.charges.map((charge, index) => (
                <li
                  key={`${charge.type}-${charge.orderId ?? index}`}
                  className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3 text-[15px]"
                >
                  <span className="min-w-0 text-muted">{charge.label}</span>
                  <span className="shrink-0 font-medium tabular-nums">{formatBRLExact(charge.amount)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-2xl px-4 py-4 text-[17px] font-semibold">
              <span>Total</span>
              <span className="tabular-nums" style={{ color: brand.primaryColor }}>
                {formatBRLExact(statement.total)}
              </span>
            </div>
            {(statement.openOrderIds?.length ?? 0) > 0 && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-relaxed text-amber-950">
                <p className="font-medium">
                  {statement.openOrderIds!.length === 1
                    ? '1 pedido ainda em preparo'
                    : `${statement.openOrderIds!.length} pedidos ainda em preparo`}
                </p>
                <p className="mt-1 text-amber-900">
                  Esses valores não entram neste pagamento. Fale com a recepção se precisar incluir.
                </p>
              </div>
            )}
          </FlowBody>
        )}

        {screen === 'pagamento' && statement && (
          <FlowBody title="Forma de pagamento">
            <p className="mb-4 text-[16px] text-muted">
              Total a pagar: <strong className="text-ink">{formatBRLExact(statement.total)}</strong>
            </p>
            <p className="mb-5 rounded-xl border border-line bg-white px-4 py-3 text-[14px] leading-relaxed text-muted">
              Este totem não cobra automaticamente. Confirme o pagamento com a recepção antes de sair.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CHECKOUT_PAYMENT_OPTIONS.map((option) => {
                const active = paymentMethod === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPaymentMethod(option.value)}
                    className={cn(
                      'min-h-16 rounded-2xl border px-4 py-3 text-[16px] font-medium transition-colors',
                      active ? 'border-transparent text-white' : 'border-line bg-white text-ink',
                    )}
                    style={active ? { background: brand.primaryColor } : undefined}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </FlowBody>
        )}

        {screen === 'fim' && reservation && (
          <div className="totem-success-mark flex flex-1 flex-col justify-center pb-6 text-center">
            {isCheckout ? (
              <>
                <Check className="mx-auto size-16" style={{ color: brand.accentColor }} strokeWidth={2} />
                <h2 className="mt-6 text-[1.75rem] font-semibold tracking-[-0.04em] text-balance">
                  Conta encerrada
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[17px] leading-relaxed text-muted">
                  {firstName(reservation.guestName)}, obrigado pela estadia. Confirme o pagamento com a recepção. Esta tela volta ao início em {secondsLeft}s.
                </p>
              </>
            ) : (
              <>
                <p
                  className="font-semibold leading-none tracking-[-0.05em]"
                  aria-label={`Quarto ${reservation.roomNumber}`}
                  style={{ fontSize: 'clamp(4.5rem, 18vw, 7rem)', color: brand.primaryColor }}
                >
                  {reservation.roomNumber}
                </p>
                <span
                  className="mx-auto mt-5 block h-1 w-16 rounded-full"
                  style={{ background: brand.accentColor }}
                  aria-hidden="true"
                />
                <h2 className="mt-6 text-[1.75rem] font-semibold tracking-[-0.04em] text-balance">
                  Check-in registrado
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[17px] leading-relaxed text-muted">
                  {firstName(reservation.guestName)}, procure a recepção para conferir o documento e retirar a chave. Seu quarto fica {wingCopy(reservation.category, floor)}. Esta tela volta ao início em {secondsLeft}s.
                </p>
              </>
            )}
          </div>
        )}
      </main>

      {screen !== 'início' && (
        <footer className="mx-auto flex w-full max-w-xl flex-col gap-3 px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {footer}
        </footer>
      )}
    </div>
  )
}

function docsCta(status: DocStatus) {
  if (status === 'scanning') return 'Simulando…'
  if (status === 'fail') return 'Repetir demonstração'
  return 'Simular conferência'
}

function FlowBody({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col pt-4">
      <h2 className="mb-6 text-[clamp(1.6rem,4vw,1.85rem)] font-semibold tracking-[-0.04em]">{title}</h2>
      {children}
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-4">
      <span className="shrink-0 text-muted">{k}</span>
      <span className="min-w-0 text-right font-medium break-words">{v}</span>
    </li>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-14 items-center justify-center gap-1 text-[16px] font-medium"
    >
      <ChevronLeft className="size-5" strokeWidth={2} />
      Voltar
    </button>
  )
}

function footerFor(
  screen: Screen,
  actions: {
    searching: boolean
    completing: boolean
    docStatus: DocStatus
    accepted: boolean
    isCheckout: boolean
    onBack: () => void
    onSearch: () => void
    onConfirm: () => void
    onContinueDocs: () => void
    onScan: () => void
    onFinish: () => void
    onRejectTerms: () => void
    onContinueExtrato: () => void
    onFinishCheckout: () => void
  },
) {
  if (screen === 'busca') {
    return (
      <>
        <Button size="kiosk" className={KIOSK_BTN} disabled={actions.searching} onClick={actions.onSearch}>
          {actions.searching ? 'Buscando…' : 'Buscar'}
        </Button>
        <BackButton onClick={actions.onBack} />
      </>
    )
  }
  if (screen === 'lista' || screen === 'dados') {
    return (
      <>
        {screen === 'dados' && (
          <Button size="kiosk" className={KIOSK_BTN} onClick={actions.onConfirm}>
            Está correto
          </Button>
        )}
        <BackButton onClick={actions.onBack} />
      </>
    )
  }
  if (screen === 'docs') {
    return (
      <>
        {actions.docStatus === 'ok' ? (
          <Button size="kiosk" className={KIOSK_BTN} onClick={actions.onContinueDocs}>
            Continuar
          </Button>
        ) : (
          <Button size="kiosk" className={KIOSK_BTN} disabled={actions.docStatus === 'scanning'} onClick={actions.onScan}>
            {docsCta(actions.docStatus)}
          </Button>
        )}
        <BackButton onClick={actions.onBack} />
      </>
    )
  }
  if (screen === 'termos') {
    return (
      <>
        <Button
          size="kiosk"
          className={KIOSK_BTN}
          disabled={!actions.accepted || actions.completing}
          onClick={actions.onFinish}
        >
          {actions.completing ? 'Finalizando…' : 'Aceitar e finalizar'}
        </Button>
        <button type="button" onClick={actions.onRejectTerms} className="min-h-14 text-[16px] font-medium text-muted">
          Não aceito
        </button>
        <BackButton onClick={actions.onBack} />
      </>
    )
  }
  if (screen === 'extrato') {
    return (
      <>
        <Button size="kiosk" className={KIOSK_BTN} onClick={actions.onContinueExtrato}>
          Ir para pagamento
        </Button>
        <BackButton onClick={actions.onBack} />
      </>
    )
  }
  if (screen === 'pagamento') {
    return (
      <>
        <Button
          size="kiosk"
          className={KIOSK_BTN}
          disabled={actions.completing}
          onClick={actions.onFinishCheckout}
        >
          {actions.completing ? 'Encerrando conta…' : 'Registrar forma e encerrar'}
        </Button>
        <BackButton onClick={actions.onBack} />
      </>
    )
  }
  return null
}
