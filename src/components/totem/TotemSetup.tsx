import { useState } from 'react'
import type { HotelBrand, TotemKind } from '../../types/index.ts'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'
import { TotemShell } from './TotemShell.tsx'
import { KIOSK_BTN } from '../../pages/totem/totemOrder.ts'

type Props = {
  brand: HotelBrand
  kind: TotemKind
  onBind: (code: string) => { ok: boolean; error?: string }
}

const COPY: Record<TotemKind, { title: string; hint: string; example: string }> = {
  room: {
    title: 'Ativar totem do quarto',
    hint: 'Digite o código que a equipe cadastrou no console. Só precisa fazer isso uma vez.',
    example: 'Ex.: Q203-AUR',
  },
  area: {
    title: 'Ativar totem de área',
    hint: 'Digite o código do restaurante, spa ou lobby. Só precisa fazer isso uma vez.',
    example: 'Ex.: RST-AUR',
  },
}

export function TotemSetup({ brand, kind, onBind }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const copy = COPY[kind]

  function submit() {
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Informe o código do totem.')
      return
    }
    const result = onBind(trimmed)
    if (!result.ok) {
      setError(result.error ?? 'Código inválido.')
      return
    }
    setError('')
  }

  return (
    <TotemShell brand={brand}>
      <div className="flex flex-1 flex-col justify-center pb-12">
        <h1 className="text-[clamp(1.75rem,5vw,2.2rem)] font-semibold leading-tight tracking-[-0.04em]">
          {copy.title}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">{copy.hint}</p>
        <div className="mt-8">
          <Input
            autoFocus
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            label="Código do totem"
            placeholder={copy.example}
            value={code}
            error={error || undefined}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase())
              if (error) setError('')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
            className="h-14 rounded-xl px-4 text-base tracking-[0.08em]"
          />
        </div>
        <Button className={`mt-6 ${KIOSK_BTN}`} onClick={submit}>
          Ativar
        </Button>
      </div>
    </TotemShell>
  )
}
