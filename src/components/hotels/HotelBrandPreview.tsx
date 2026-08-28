import type { CSSProperties } from 'react'
import { COVER_TONES, previewGradient, type HotelDraft } from './hotelFormShared.ts'

type Props = {
  readonly draft: HotelDraft
}

const TONE_LABELS = Object.fromEntries(COVER_TONES.map((t) => [t.value, t.label]))

export function HotelBrandPreview({ draft }: Props) {
  const displayName = draft.brandHotelName.trim() || draft.name.trim() || 'Seu hotel'
  const location =
    draft.city.trim() && draft.state.trim()
      ? `${draft.city.trim()}, ${draft.state.trim().toUpperCase()}`
      : 'Cidade, UF'
  const toneLabel = TONE_LABELS[draft.coverTone] ?? 'Frio'
  const swatches = [
    { id: 'primary', value: draft.primaryColor },
    { id: 'secondary', value: draft.secondaryColor },
    { id: 'accent', value: draft.accentColor },
  ]

  return (
    <div
      className="overflow-hidden rounded-2xl border border-line shadow-soft"
      style={
        {
          '--hotel-primary': draft.primaryColor,
          '--hotel-secondary': draft.secondaryColor,
          '--hotel-accent': draft.accentColor,
        } as CSSProperties
      }
    >
      <div
        className="relative px-5 pb-8 pt-6 text-white transition-[background] duration-300"
        style={{
          background: previewGradient(draft.primaryColor, draft.secondaryColor, draft.coverTone),
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">Preview do totem</p>
        <p className="mt-1 text-[11px] text-white/60">Tom da capa: {toneLabel}</p>
        <p className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">{displayName}</p>
        <p className="mt-1 text-[13px] text-white/80">{location}</p>
        <span
          className="absolute bottom-4 right-4 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: draft.accentColor, color: '#171717' }}
        >
          Check-in
        </span>
      </div>
      <div className="grid grid-cols-3 gap-px bg-line">
        {swatches.map((swatch) => (
          <div
            key={swatch.id}
            className="flex h-10 items-center justify-center bg-surface text-[10px] font-medium text-muted"
          >
            {swatch.value.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  )
}
