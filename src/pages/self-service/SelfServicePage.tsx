import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ScanLine } from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { formatLongDate } from '../../utils/format.ts'
import { cn } from '../../utils/cn.ts'
import type { Reservation } from '../../types/index.ts'
import { totemBrandTitle, totemShellStyle } from '../../lib/totemBrand.ts'
import {
  DONE_MS,
  FLOW_STEPS,
  IDLE_MS,
  SCAN_MS,
  SEARCH_MS,
  clockLabel,
  firstName,
  searchReservations,
  termsDisplayFor,
  wingCopy,
  type FlowStepId,
} from './totemCheckin.ts'

type Screen = 'início' | FlowStepId | 'lista' | 'fim' | 'operador'
type DocStatus = 'idle' | 'scanning' | 'ok' | 'fail'

const KIOSK_BTN = 'h-14 min-h-14 w-full rounded-xl text-base'

export function SelfServicePage() {
  const navigate = useNavigate()
  const { hotel, hotelRooms, searchCheckin, completeCheckin, addActivity } = useApp()
  const brand = hotel.brand
  const terms = termsDisplayFor(hotel)
  const termsId = useId()

  const [screen, setScreen] = useState<Screen>('início')
  const [query, setQuery] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)
  const [matches, setMatches] = useState<Reservation[]>([])
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [docStatus, setDocStatus] = useState<DocStatus>('idle')
  const [accepted, setAccepted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(DONE_MS / 1000)
  const [notice, setNotice] = useState('')

  const searchTimer = useRef<number | undefined>(undefined)
  const scanTimer = useRef<number | undefined>(undefined)
  const idleTimer = useRef<number | undefined>(undefined)
  const doneTimer = useRef<number | undefined>(undefined)
  const tickTimer = useRef<number | undefined>(undefined)

  const flowIndex = FLOW_STEPS.findIndex((step) => step.id === screen)
  const inFlow = flowIndex >= 0 || screen === 'lista'
  const progressIndex = screen === 'lista' ? 0 : flowIndex

  const room = reservation ? hotelRooms.find((item) => item.id === reservation.roomId) : undefined
  const floor = room?.floor ?? Number(reservation?.roomNumber.slice(0, 1) || 1)

  const resetSession = useCallback((nextNotice = '') => {
    window.clearTimeout(searchTimer.current)
    window.clearTimeout(scanTimer.current)
    window.clearTimeout(doneTimer.current)
    window.clearInterval(tickTimer.current)
    setScreen('início')
    setQuery('')
    setSearchError('')
    setSearching(false)
    setMatches([])
    setReservation(null)
    setDocStatus('idle')
    setAccepted(false)
    setSecondsLeft(DONE_MS / 1000)
    setNotice(nextNotice)
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
      window.clearTimeout(searchTimer.current)
      window.clearTimeout(scanTimer.current)
      window.clearTimeout(doneTimer.current)
      window.clearInterval(tickTimer.current)
      window.clearTimeout(idleTimer.current)
    }
  }, [])

  function goBack() {
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
  }

  function openReservation(next: Reservation) {
    setReservation(next)
    setSearchError('')
    setDocStatus('idle')
    setAccepted(false)
    setScreen('dados')
  }

  function handleSearch() {
    if (searching) return
    setSearching(true)
    setSearchError('')
    window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => {
      void (async () => {
        try {
          const list = await searchCheckin(query)
          setSearching(false)
          if (!query.trim()) {
            setSearchError('Digite o nome completo ou o código da reserva.')
            return
          }
          const outcome = searchReservations(list, query)
          if (outcome.kind === 'empty') {
            setSearchError('Digite o nome completo ou o código da reserva.')
            return
          }
          if (outcome.kind === 'none') {
            setSearchError('Nenhuma reserva encontrada. Confira o nome ou chame a recepção, ao lado.')
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
        } catch {
          setSearching(false)
          setSearchError('Não foi possível consultar a API. Verifique a conexão e o login.')
        }
      })()
    }, SEARCH_MS)
  }

  function startScan() {
    if (docStatus === 'scanning') return
    setDocStatus('scanning')
    window.clearTimeout(scanTimer.current)
    scanTimer.current = window.setTimeout(() => setDocStatus('ok'), SCAN_MS)
  }

  function finishCheckIn() {
    if (!reservation || !accepted) return
    void completeCheckin(reservation.id)
      .then((next) => {
        setReservation(next)
        addActivity({
          time: clockLabel(),
          title: 'Check-in no totem',
          detail: `${next.guestName} — Quarto ${next.roomNumber}`,
          kind: 'checkin',
        })
        setScreen('fim')
        setSecondsLeft(DONE_MS / 1000)
        window.clearInterval(tickTimer.current)
        tickTimer.current = window.setInterval(() => {
          setSecondsLeft((value) => Math.max(0, value - 1))
        }, 1000)
        window.clearTimeout(doneTimer.current)
        doneTimer.current = window.setTimeout(resetSession, DONE_MS)
      })
      .catch(() => {
        setSearchError('Não foi possível concluir o check-in. A recepção resolve.')
        setScreen('busca')
      })
  }

  const footer = footerFor(screen, {
    searching,
    docStatus,
    accepted,
    onBack: goBack,
    onSearch: handleSearch,
    onConfirm: () => setScreen('docs'),
    onContinueDocs: () => setScreen('termos'),
    onScan: startScan,
    onFinish: finishCheckIn,
    onRejectTerms: () => resetSession('Sem aceitar os termos, o check-in fica com a recepção, ao lado.'),
  })

  return (
    <div className="totem-shell flex min-h-svh flex-col" style={totemShellStyle(brand)}>
      <header className="px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: brand.primaryColor }}>
          {totemBrandTitle(brand, hotel.name)}
        </p>
      </header>

      {inFlow && progressIndex >= 0 && (
        <div className="px-6 pb-2">
          <p className="text-[15px] font-medium">
            Passo {progressIndex + 1} de {FLOW_STEPS.length}
          </p>
          <ol className="mt-3 flex gap-2" aria-hidden="true">
            {FLOW_STEPS.map((step, index) => (
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
        {screen === 'início' && (
          <div className="flex flex-1 flex-col justify-center pb-8 text-center">
            <h1 className="text-[clamp(1.85rem,5vw,2.35rem)] font-semibold leading-[1.15] tracking-[-0.04em] text-balance">
              Bem-vindo ao {hotel.name}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-muted">
              Toque para começar o check-in. A recepção está ao lado, se preferir.
            </p>
            {notice && <p className="mx-auto mt-5 max-w-md text-[16px] font-medium">{notice}</p>}
          </div>
        )}

        {screen === 'busca' && (
          <FlowBody title="Encontre sua reserva">
            <Input
              autoFocus
              autoCapitalize="words"
              autoComplete="off"
              spellCheck={false}
              label="Nome ou código da reserva"
              placeholder="Maria Oliveira ou RS-1002"
              hint="O código está no e-mail de confirmação."
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
                    onClick={() => openReservation(item)}
                    className="flex min-h-16 w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-left"
                  >
                    <span>
                      <span className="block text-[17px] font-medium">{item.guestName}</span>
                      <span className="mt-1 block text-[14px] text-muted">
                        Quarto {item.roomNumber} · {formatLongDate(item.checkIn)}
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
              <Row k="Quarto" v={`${reservation.roomNumber} · ${reservation.category}`} />
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
              Aproxime o RG ou a CNH da câmera. Se você já enviou na pré-chegada, confirme abaixo.
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
                  <p className="mt-3 text-[16px] text-muted">Câmera pronta</p>
                </>
              )}
              {docStatus === 'scanning' && <p className="text-[16px] font-medium">Lendo o documento…</p>}
              {docStatus === 'ok' && (
                <>
                  <Check className="size-8" style={{ color: brand.accentColor }} strokeWidth={2.2} />
                  <p className="mt-3 text-[16px] font-medium">Documento reconhecido</p>
                </>
              )}
              {docStatus === 'fail' && (
                <p className="text-[16px] font-medium">Não deu para ler. Aproxime de novo, com o documento aberto.</p>
              )}
            </div>
            {docStatus !== 'ok' && (
              <button
                type="button"
                className="mt-4 min-h-12 text-[16px] font-medium underline-offset-4 hover:underline"
                style={{ color: brand.primaryColor }}
                onClick={() => setDocStatus('ok')}
              >
                Já enviei na pré-chegada
              </button>
            )}
            {docStatus === 'idle' && (
              <button
                type="button"
                className="mt-1 min-h-12 text-[15px] text-muted underline-offset-4 hover:underline"
                onClick={() => setDocStatus('fail')}
              >
                A câmera não está lendo
              </button>
            )}
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

        {screen === 'fim' && reservation && (
          <div className="totem-success-mark flex flex-1 flex-col justify-center pb-6 text-center">
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
              Retire o cartão na bandeja à direita
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[17px] leading-relaxed text-muted">
              {firstName(reservation.guestName)}, siga {wingCopy(reservation.category, floor)}. Esta tela some sozinha em{' '}
              {secondsLeft}s.
            </p>
          </div>
        )}

        {screen === 'operador' && (
          <div className="flex flex-1 flex-col justify-center pb-8 text-center">
            <h2 className="text-[28px] font-semibold tracking-[-0.04em]">Voltar ao console?</h2>
            <p className="mt-3 text-[16px] text-muted">O hóspede não precisa desta tela. Só use se for a equipe.</p>
          </div>
        )}
      </main>

      <footer className="mx-auto flex w-full max-w-xl flex-col gap-3 px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {screen === 'início' && (
          <Button className={KIOSK_BTN} onClick={() => setScreen('busca')}>
            Iniciar check-in
          </Button>
        )}
        {footer}
        {screen === 'operador' && (
          <>
            <Button className={KIOSK_BTN} onClick={() => navigate('/')}>
              Ir ao console
            </Button>
            <Button className={KIOSK_BTN} variant="secondary" onClick={() => setScreen('início')}>
              Continuar no totem
            </Button>
          </>
        )}
        {screen !== 'operador' && screen !== 'fim' && (
          <button
            type="button"
            onClick={() => setScreen('operador')}
            className="mx-auto min-h-12 px-3 text-[14px] text-muted"
          >
            Console
          </button>
        )}
      </footer>
    </div>
  )
}

function docsCta(status: DocStatus) {
  if (status === 'scanning') return 'Lendo…'
  if (status === 'fail') return 'Tentar de novo'
  return 'Ler documento'
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
    docStatus: DocStatus
    accepted: boolean
    onBack: () => void
    onSearch: () => void
    onConfirm: () => void
    onContinueDocs: () => void
    onScan: () => void
    onFinish: () => void
    onRejectTerms: () => void
  },
) {
  if (screen === 'busca') {
    return (
      <>
        <Button className={KIOSK_BTN} disabled={actions.searching} onClick={actions.onSearch}>
          {actions.searching ? 'Buscando reserva…' : 'Buscar'}
        </Button>
        <BackButton onClick={actions.onBack} />
      </>
    )
  }
  if (screen === 'lista' || screen === 'dados') {
    return (
      <>
        {screen === 'dados' && (
          <Button className={KIOSK_BTN} onClick={actions.onConfirm}>
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
          <Button className={KIOSK_BTN} onClick={actions.onContinueDocs}>
            Continuar
          </Button>
        ) : (
          <Button className={KIOSK_BTN} disabled={actions.docStatus === 'scanning'} onClick={actions.onScan}>
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
        <Button className={KIOSK_BTN} disabled={!actions.accepted} onClick={actions.onFinish}>
          Aceitar e finalizar
        </Button>
        <button type="button" onClick={actions.onRejectTerms} className="min-h-14 text-[16px] font-medium text-muted">
          Não aceito
        </button>
        <BackButton onClick={actions.onBack} />
      </>
    )
  }
  return null
}
