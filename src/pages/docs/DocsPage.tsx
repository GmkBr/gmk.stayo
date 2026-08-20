import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { StayoLogo } from '../../components/brand/StayoLogo.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { cn } from '../../utils/cn.ts'
import {
  DOC_UPDATED,
  FEATURES,
  FLOWS,
  LIMITATIONS,
  PRODUCT_SUMMARY,
  SECTIONS,
  UPCOMING,
  type FeatureStatus,
  type SectionId,
} from '../../docs/content.ts'

const FEATURE_BADGE: Record<FeatureStatus, { label: string; tone: 'green' | 'amber' | 'neutral' }> = {
  live: { label: 'Disponível', tone: 'green' },
  partial: { label: 'Parcial', tone: 'amber' },
  next: { label: 'Em breve', tone: 'neutral' },
}

function sectionFromHash(hash: string): SectionId {
  const id = hash.replace('#', '')
  return SECTIONS.some((item) => item.id === id) ? (id as SectionId) : 'produto'
}

export function DocsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const active = sectionFromHash(location.hash)

  function go(id: SectionId) {
    navigate({ pathname: '/docs', hash: id }, { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
        <Link to="/" aria-label="Voltar ao hub">
          <StayoLogo />
        </Link>
        <div className="flex items-center gap-4">
          <p className="hidden text-[12px] text-muted sm:block">Atualizado {DOC_UPDATED}</p>
          <Link to="/" className="text-[13px] font-medium text-muted hover:text-ink">
            Hub
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col lg:flex-row">
        <nav
          aria-label="Seções da documentação"
          className="shrink-0 border-b border-line bg-surface lg:w-56 lg:border-b-0 lg:border-r"
        >
          <ul className="flex gap-1 overflow-x-auto p-3 scrollbar-thin lg:sticky lg:top-0 lg:flex-col lg:gap-0.5 lg:py-6">
            {SECTIONS.map((item) => (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors',
                    active === item.id ? 'bg-canvas text-ink' : 'text-muted hover:bg-canvas hover:text-ink',
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">
          <SectionBody id={active} />
        </main>
      </div>
    </div>
  )
}

function SectionBody({ id }: { id: SectionId }) {
  switch (id) {
    case 'produto':
      return (
        <Block title={PRODUCT_SUMMARY.title} lead={PRODUCT_SUMMARY.lead}>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted">{PRODUCT_SUMMARY.description}</p>
          <div className="mt-6 rounded-xl border border-line bg-surface px-4 py-3 text-[14px] leading-relaxed text-muted">
            {PRODUCT_SUMMARY.notPms}
          </div>
          <h3 className="mt-10 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Quem usa o quê</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {PRODUCT_SUMMARY.users.map((item) => (
              <li
                key={item.role}
                className="flex flex-col gap-0.5 rounded-xl border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-[14px] font-semibold">{item.role}</span>
                <span className="text-[13px] text-muted">{item.uses}</span>
              </li>
            ))}
          </ul>
        </Block>
      )

    case 'funcionalidades':
      return (
        <Block
          title="Funcionalidades"
          lead="O que cada parte do STAYO faz hoje. Clique no nome para abrir a tela."
        >
          <ul className="flex flex-col gap-4">
            {FEATURES.map((feature) => {
              const badge = FEATURE_BADGE[feature.status]
              return (
                <li key={feature.title} className="rounded-xl border border-line bg-surface p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      {feature.path ? (
                        <Link to={feature.path} className="text-[17px] font-semibold tracking-[-0.03em] hover:text-accent">
                          {feature.title}
                        </Link>
                      ) : (
                        <p className="text-[17px] font-semibold tracking-[-0.03em]">{feature.title}</p>
                      )}
                      {feature.path && (
                        <p className="mt-0.5 font-mono text-[12px] text-muted">{feature.path}</p>
                      )}
                    </div>
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted">{feature.summary}</p>
                  <CapList title="O que faz" items={feature.capabilities} />
                  {feature.limitations && feature.limitations.length > 0 && (
                    <CapList title="Ainda não" items={feature.limitations} muted />
                  )}
                </li>
              )
            })}
          </ul>
        </Block>
      )

    case 'fluxos':
      return (
        <Block title="Fluxos" lead="Passo a passo de uso — do ponto de vista de quem opera o produto.">
          <ul className="flex flex-col gap-4">
            {FLOWS.map((flow) => (
              <li
                key={flow.title}
                className={cn(
                  'rounded-xl border bg-surface p-5 shadow-soft',
                  flow.status === 'live' ? 'border-line' : 'border-dashed border-line',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[17px] font-semibold tracking-[-0.03em]">{flow.title}</p>
                    <p className="mt-0.5 text-[13px] text-muted">{flow.actor}</p>
                  </div>
                  <Badge tone={flow.status === 'live' ? 'green' : 'neutral'}>
                    {flow.status === 'live' ? 'Disponível' : 'Em breve'}
                  </Badge>
                </div>
                <ol className="mt-4 flex flex-col gap-2.5">
                  {flow.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-[14px] leading-relaxed">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-canvas text-[12px] font-semibold text-muted">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </Block>
      )

    case 'proximos':
      return (
        <Block title="Próximos passos" lead="O que vem depois do que já está disponível na demo.">
          <ul className="flex flex-col gap-3">
            {UPCOMING.map((item, i) => (
              <li key={item.title} className="rounded-xl border border-line bg-surface p-4 shadow-soft">
                <p className="text-[13px] font-medium text-muted">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-1 text-[16px] font-semibold tracking-[-0.03em]">{item.title}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{item.detail}</p>
              </li>
            ))}
          </ul>
        </Block>
      )

    case 'limitacoes':
      return (
        <Block
          title="Limitações da demo"
          lead="O que ainda não é produção. Importante saber antes de apresentar ou testar com cliente."
        >
          <ul className="flex flex-col gap-2">
            {LIMITATIONS.map((item) => (
              <li key={item} className="rounded-xl border border-line bg-surface px-4 py-3 text-[14px] leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </Block>
      )
  }
}

function Block({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-[28px] font-semibold tracking-[-0.04em]">{title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{lead}</p>
      <div className="mt-8">{children}</div>
    </div>
  )
}

function CapList({ title, items, muted }: { title: string; items: string[]; muted?: boolean }) {
  return (
    <div className={cn('mt-4', muted && 'opacity-80')}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">{title}</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[13px] leading-relaxed">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
