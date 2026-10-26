import type { ReactNode } from 'react'
import { Check, ScanLine } from 'lucide-react'
import { Button } from '../ui/Button.tsx'
import { DEFAULT_BRAND, normalizeHexColor, type HotelDraft } from './hotelFormShared.ts'
import { hotelMonogram, totemBrandTitle, totemShellStyle } from '../../lib/totemBrand.ts'

type Props = {
  readonly draft: HotelDraft
}

export function HotelBrandPreview({ draft }: Props) {
  const displayName = draft.brandHotelName.trim() || draft.name.trim() || 'Seu hotel'
  const primary = normalizeHexColor(draft.primaryColor, DEFAULT_BRAND.primaryColor)
  const secondary = normalizeHexColor(draft.secondaryColor, DEFAULT_BRAND.secondaryColor)
  const accent = normalizeHexColor(draft.accentColor, DEFAULT_BRAND.accentColor)

  const brand = {
    primaryColor: primary,
    secondaryColor: secondary,
    accentColor: accent,
    hotelName: displayName,
    coverTone: draft.coverTone,
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[13px] font-semibold text-ink">Onde cada cor aparece</p>
        <p className="mt-0.5 text-[12px] text-muted">
          Elementos reais do totem de recepção e do hub — não é simulação de tela.
        </p>
      </div>

      <div className="totem-shell space-y-3 bg-white p-4" style={totemShellStyle(brand)}>
        <UsageBlock label="Primária" hex={primary} hint="Botões, título do hotel e progresso do check-in">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: primary }}>
            {totemBrandTitle(brand, draft.name.trim() || undefined)}
          </p>
          <ol className="mt-3 flex gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <li
                key={index}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  background:
                    index < 2 ? primary : 'color-mix(in srgb, #171717 12%, transparent)',
                }}
              />
            ))}
          </ol>
          <Button type="button" size="kiosk" className="mt-3 w-full pointer-events-none" tabIndex={-1}>
            Continuar
          </Button>
          <p className="mt-2 text-[12px] font-medium" style={{ color: primary }}>
            Link de ação · checkbox · ícone de leitura
          </p>
          <ScanLine className="mt-1 size-5" style={{ color: primary }} strokeWidth={1.75} aria-hidden />
        </UsageBlock>

        <UsageBlock label="Secundária" hex={secondary} hint="Monograma no hub e detalhes de apoio">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-semibold text-white shadow-soft ${isLightHex(secondary) ? 'ring-1 ring-ink/12' : ''}`}
              style={{ background: secondary }}
              aria-hidden
            >
              {hotelMonogram(displayName)}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink">Ícone do hotel na seleção</p>
              <span
                className="mt-2 block h-0.5 w-12 rounded-full"
                style={{ background: secondary }}
                aria-hidden
              />
            </div>
          </div>
        </UsageBlock>

        <UsageBlock label="Destaque" hex={accent} hint="Alertas, confirmações e ênfase visual">
          <span className="block h-1 w-16 rounded-full" style={{ background: accent }} aria-hidden />
          <div
            className="mt-3 rounded-2xl border px-3 py-2.5 text-[13px] font-medium leading-snug text-ink"
            style={{
              borderColor: `color-mix(in srgb, ${accent} 45%, #d1d5db)`,
              background: `color-mix(in srgb, ${accent} 14%, #ffffff)`,
            }}
          >
            Aviso ao hóspede — ex.: retirar cartão na bandeja
          </div>
          <div className="mt-2 flex items-center gap-2 text-[13px] text-ink">
            <Check className="size-5 shrink-0" style={{ color: accent }} strokeWidth={2.2} aria-hidden />
            Documento validado
          </div>
        </UsageBlock>
      </div>
    </div>
  )
}

function UsageBlock({
  label,
  hex,
  hint,
  children,
}: {
  readonly label: string
  readonly hex: string
  readonly hint: string
  readonly children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-line bg-white p-3">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold text-ink">{label}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">{hint}</p>
        </div>
        <ColorChip hex={hex} />
      </div>
      {children}
    </section>
  )
}

function ColorChip({ hex }: { readonly hex: string }) {
  const light = isLightHex(hex)
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-canvas px-1.5 py-1">
      <span
        className={`size-3.5 rounded-sm ${light ? 'ring-1 ring-inset ring-ink/12' : ''}`}
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <span className="font-mono text-[10px] font-medium uppercase text-muted">{hex}</span>
    </span>
  )
}

function isLightHex(hex: string) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return false
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.85
}
