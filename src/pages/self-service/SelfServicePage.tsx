import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { formatLongDate } from '../../utils/format.ts'

const STEPS = ['início', 'busca', 'dados', 'docs', 'termos', 'fim'] as const
type Step = (typeof STEPS)[number]

export function SelfServicePage() {
  const { hotel } = useApp()
  const [step, setStep] = useState<Step>('início')
  const [query, setQuery] = useState('João Silva')
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
        <Link to="/dashboard" className="text-[12px] text-muted">
          Sair do totem
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 pb-16">
        {step === 'início' && (
          <div className="text-center">
            <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.045em]">
              Bem-vindo ao
              <br />
              {hotel.name}
            </h1>
            <p className="mt-3 text-[15px] text-muted">Toque para começar o check-in. A recepção está ao lado, se preferir.</p>
            <Button className="mt-8 h-14 min-w-56 text-base" onClick={() => setStep('busca')}>
              Iniciar check-in
            </Button>
          </div>
        )}

        {step === 'busca' && (
          <Panel title="Encontre sua reserva" onBack={() => setStep('início')}>
            <Input className="h-12 text-base" label="Nome / código da reserva" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button className="mt-6 h-12 w-full" onClick={() => setStep('dados')}>
              Buscar
            </Button>
          </Panel>
        )}

        {step === 'dados' && (
          <Panel title="Confirme seus dados" onBack={() => setStep('busca')}>
            <ul className="space-y-3 text-[15px]">
              <Row k="Hóspede" v="João Silva" />
              <Row k="Quarto" v="203 · Suíte Premium" />
              <Row k="Entrada" v={formatLongDate('2026-08-14')} />
              <Row k="Saída" v={formatLongDate('2026-08-17')} />
            </ul>
            <Button className="mt-6 h-12 w-full" onClick={() => setStep('docs')}>
              Está correto
            </Button>
          </Panel>
        )}

        {step === 'docs' && (
          <Panel title="Documentação" onBack={() => setStep('dados')}>
            <p className="text-[15px] text-muted">Aproxime o documento da câmera ou confirme o envio feito na pré-chegada.</p>
            <div className="mt-4 rounded-2xl border border-dashed border-line bg-white py-16 text-center text-[14px] text-muted">
              Documento reconhecido (simulado)
            </div>
            <Button className="mt-6 h-12 w-full" onClick={() => setStep('termos')}>
              Continuar
            </Button>
          </Panel>
        )}

        {step === 'termos' && (
          <Panel title="Termos da hospedagem" onBack={() => setStep('docs')}>
            <p className="text-[15px] leading-relaxed text-muted">
              Check-out até 12h. Animais apenas nos chalés. Silêncio após 22h nas áreas comuns. O cartão do quarto desativa após o check-out.
            </p>
            <Button className="mt-6 h-12 w-full" onClick={() => setStep('fim')}>
              Aceitar e finalizar
            </Button>
          </Panel>
        )}

        {step === 'fim' && (
          <div className="text-center">
            <h2 className="text-[32px] font-semibold tracking-[-0.04em]">Check-in concluído</h2>
            <p className="mt-3 text-[15px] text-muted">Quarto 203. Retire o cartão na bandeja à direita e siga pela ala das suítes.</p>
            <Button className="mt-8 h-12" variant="secondary" onClick={() => setStep('início')}>
              Novo check-in
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Panel({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-6 text-[13px] text-muted hover:text-ink">
        ← Voltar
      </button>
      <h2 className="mb-6 text-[28px] font-semibold tracking-[-0.04em]">{title}</h2>
      {children}
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
      <span className="text-muted">{k}</span>
      <span className="font-medium">{v}</span>
    </li>
  )
}
