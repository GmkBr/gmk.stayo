import { useState } from 'react'
import type { Reservation } from '../../types/index.ts'
import { formatBRL, formatLongDate } from '../../utils/format.ts'
import { Button } from '../ui/Button.tsx'
import { Modal } from '../ui/Modal.tsx'
import { cn } from '../../utils/cn.ts'

const STEPS = ['Reserva', 'Hóspede', 'Documentos', 'Pagamento', 'Confirmação']

type Props = {
  open: boolean
  reservation: Reservation | null
  onClose: () => void
  onComplete: () => void
}

export function CheckInModal({ open, reservation, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0)

  function handleClose() {
    setStep(0)
    onClose()
  }

  if (!reservation) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Realizar check-in"
      size="lg"
      footer={
        step < 4 ? (
          <>
            <Button variant="ghost" onClick={step === 0 ? handleClose : () => setStep((s) => s - 1)}>
              {step === 0 ? 'Cancelar' : 'Voltar'}
            </Button>
            <Button onClick={() => setStep((s) => s + 1)}>{step === 3 ? 'Confirmar pagamento' : 'Continuar'}</Button>
          </>
        ) : (
          <Button
            onClick={() => {
              onComplete()
              handleClose()
            }}
          >
            Concluir
          </Button>
        )
      }
    >
      <ol className="mb-5 flex gap-1">
        {STEPS.map((label, i) => (
          <li key={label} className="flex min-w-0 flex-1 flex-col gap-1">
            <span className={cn('h-1 rounded-full', i <= step ? 'bg-accent' : 'bg-line')} />
            <span className={cn('truncate text-[11px]', i === step ? 'font-medium text-ink' : 'text-muted')}>{label}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <dl className="grid grid-cols-2 gap-3 text-[13px]">
          <Info label="Hóspede" value={reservation.guestName} />
          <Info label="Quarto" value={`${reservation.roomNumber} · ${reservation.category}`} />
          <Info label="Check-in" value={formatLongDate(reservation.checkIn)} />
          <Info label="Check-out" value={formatLongDate(reservation.checkOut)} />
          <Info label="Hóspedes" value={String(reservation.guests)} />
          <Info label="Total" value={formatBRL(reservation.total)} />
        </dl>
      )}

      {step === 1 && (
        <dl className="grid grid-cols-2 gap-3 text-[13px]">
          <Info label="Nome" value={reservation.guestName} />
          <Info label="E-mail" value={reservation.guestEmail} />
          <Info label="Telefone" value={reservation.guestPhone} />
          <Info label="Documento" value="Documento em arquivo (mock)" />
        </dl>
      )}

      {step === 2 && (
        <div className="rounded-xl border border-dashed border-line bg-canvas px-4 py-10 text-center">
          <p className="text-sm font-medium">Documentos conferidos</p>
          <p className="mt-1 text-[13px] text-muted">RG e comprovante anexados na pré-chegada. Nada a capturar agora.</p>
        </div>
      )}

      {step === 3 && (
        <dl className="grid grid-cols-2 gap-3 text-[13px]">
          <Info label="Valor" value={formatBRL(reservation.total)} />
          <Info label="Forma" value={paymentLabel(reservation.paymentMethod)} />
          <Info label="Status" value="Pré-autorizado" />
          <Info label="Fatura" value="Enviada por e-mail após o check-in" />
        </dl>
      )}

      {step === 4 && (
        <div className="py-4 text-center">
          <p className="text-lg font-semibold tracking-[-0.03em]">Check-in pronto</p>
          <p className="mt-1 text-[13px] text-muted">
            {reservation.guestName} no quarto {reservation.roomNumber}. Cartão da porta pode ser emitido na recepção.
          </p>
        </div>
      )}
    </Modal>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}

function paymentLabel(method: Reservation['paymentMethod']) {
  const map = { credit: 'Cartão de crédito', pix: 'Pix', debit: 'Cartão de débito', cash: 'Dinheiro', invoice: 'Faturado' }
  return map[method]
}
