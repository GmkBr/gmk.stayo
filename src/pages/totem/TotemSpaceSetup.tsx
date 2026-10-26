import { useEffect, useState } from 'react'
import * as spacesApi from '../../modules/spaces/api.ts'
import { totemBrandTitle, totemShellStyle } from '../../lib/totemBrand.ts'
import { spaceDisplayMeta, spaceDisplayTitle } from '../../lib/spaceLabels.ts'
import type { Hotel, HotelBrand } from '../../modules/hotels/model.ts'
import type { Space } from '../../modules/spaces/model.ts'

type Props = {
  kind: 'room' | 'area'
  hotel: Hotel
  brand: HotelBrand
  onSelect: (space: Space) => void
}

export function TotemSpaceSetup({ kind, hotel, brand, onSelect }: Props) {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void spacesApi.listSpaces(hotel.id, kind)
      .then((list) => {
        if (!cancelled) setSpaces(list.filter((item) => item.type === kind))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Não foi possível carregar os espaços.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [hotel.id, kind])

  const title = kind === 'room' ? 'Em qual quarto este totem está?' : 'Em qual área este totem está?'
  const hint =
    kind === 'room'
      ? 'Escolha o quarto onde o tablet ficará instalado. Você pode trocar depois, se mover o dispositivo.'
      : 'Escolha a área comum atendida por este tablet.'

  return (
    <div className="totem-shell flex min-h-svh flex-col" style={totemShellStyle(brand)}>
      <header className="px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: brand.primaryColor }}>
          {totemBrandTitle(brand, hotel.name)}
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 pb-8">
        <div className="flex flex-1 flex-col justify-center">
          <h1 className="text-[clamp(1.6rem,4.5vw,2rem)] font-semibold leading-tight tracking-[-0.04em] text-balance">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-[16px] leading-relaxed text-muted">{hint}</p>

          {loading && <p className="mt-8 text-[15px] text-muted">Carregando…</p>}

          {error && (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && spaces.length === 0 && (
            <p className="mt-8 text-[15px] text-muted">
              Nenhum {kind === 'room' ? 'quarto' : 'área'} cadastrado. Peça à equipe para cadastrar em Espaços no
              console.
            </p>
          )}

          {!loading && spaces.length > 0 && (
            <ul className="mt-8 flex max-h-[min(24rem,50vh)] flex-col gap-3 overflow-y-auto">
              {spaces.map((space) => {
                const meta = spaceDisplayMeta(space)
                return (
                  <li key={space.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(space)}
                      className="flex min-h-16 w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-4 text-left transition-colors hover:border-ink/15 active:bg-canvas"
                    >
                      <span>
                        <span className="block text-[17px] font-medium">{spaceDisplayTitle(space)}</span>
                        {meta && <span className="mt-1 block text-[14px] text-muted">{meta}</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
