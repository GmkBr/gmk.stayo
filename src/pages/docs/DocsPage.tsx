import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { StayoLogo } from '../../components/brand/StayoLogo.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { cn } from '../../utils/cn.ts'
import {
  CODE_FILES,
  DOC_UPDATED,
  INCOMPLETE,
  LEGACY,
  MVP_STEPS,
  REDIRECTS,
  RULES,
  SECTIONS,
  SURFACES,
  WORKS,
  type SectionId,
  type StepStatus,
  type SurfaceStatus,
} from '../../docs/content.ts'

const SURFACE_BADGE: Record<SurfaceStatus, { label: string; tone: 'green' | 'amber' | 'neutral' }> = {
  live: { label: 'No ar', tone: 'green' },
  partial: { label: 'Visual', tone: 'amber' },
  next: { label: 'Próximo', tone: 'neutral' },
}

const STEP_META: Record<StepStatus, { label: string; tone: 'green' | 'blue' | 'neutral' }> = {
  done: { label: 'Feito', tone: 'green' },
  now: { label: 'Agora', tone: 'blue' },
  later: { label: 'Depois', tone: 'neutral' },
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
        <Block
          title="O que é o STAYO"
          lead="Protótipo frontend da comunicação entre totens de autoatendimento e as reservas do hotel. Sem backend."
        >
          <p className="max-w-xl text-[15px] leading-relaxed text-muted">
            O hóspede faz check-in no totem de recepção. Depois pede no totem do quarto ou das áreas comuns. O console
            só acompanha o que esses totens fizeram.
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            Não é um PMS. Não gerimos ocupação, governança, manutenção, receita nem cadastro interno de hotel.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Fact label="Stack" value="Vite + React" />
            <Fact label="Estado" value="AppContext + mocks" />
            <Fact label="Entrada" value="localhost:5173" />
          </div>
        </Block>
      )
    case 'superficies':
      return (
        <Block title="Superfícies" lead="Totens não usam sidebar nem topbar do console. Troca de tela passa pelo hub.">
          <ul className="grid gap-3 sm:grid-cols-2">
            {SURFACES.map((item) => {
              const badge = SURFACE_BADGE[item.status]
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-ink/20"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[15px] font-semibold tracking-[-0.02em]">{item.title}</span>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </span>
                    <span className="mt-1 font-mono text-[12px] text-muted">{item.path}</span>
                    <span className="mt-2 text-[13px] leading-relaxed text-muted">{item.role}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <h3 className="mt-10 text-sm font-semibold">Redirecionamentos velhos</h3>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {REDIRECTS.map((item) => (
              <li key={item.from} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
                <span className="font-mono text-muted">{item.from}</span>
                <span className="font-mono">{item.to}</span>
              </li>
            ))}
          </ul>
        </Block>
      )
    case 'mvp':
      return (
        <Block title="Ordem do MVP" lead="Serviços e cardápio só entram no totem de quarto.">
          <ol className="flex flex-col gap-3">
            {MVP_STEPS.map((step, index) => {
              const meta = STEP_META[step.status]
              return (
                <li
                  key={step.title}
                  className={cn(
                    'rounded-xl border bg-surface p-4 shadow-soft',
                    step.status === 'now' ? 'border-accent' : 'border-line',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-medium text-muted">{String(index + 1).padStart(2, '0')}</p>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <p className="mt-2 text-[16px] font-semibold tracking-[-0.03em]">{step.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{step.detail}</p>
                </li>
              )
            })}
          </ol>
        </Block>
      )
    case 'estado':
      return (
        <Block title="Estado do código" lead="O que a demo mostra hoje, e o que ainda é falso.">
          <div className="grid gap-4 lg:grid-cols-2">
            <ListCard title="Funciona" tone="green" items={WORKS} />
            <ListCard title="Incompleto" tone="amber" items={INCOMPLETE} />
          </div>
        </Block>
      )
    case 'codigo':
      return (
        <Block title="Pastas que importam" lead="Onde mexer. Totem usa a marca do hotel. Console usa a identidade STAYO.">
          <ul className="overflow-hidden rounded-xl border border-line bg-surface">
            {CODE_FILES.map((item) => (
              <FileRow key={item.path} path={item.path} role={item.role} />
            ))}
          </ul>
        </Block>
      )
    case 'legado':
      return (
        <Block
          title="Fora do produto"
          lead="Arquivos ainda no disco, sem rota. Não volte para o sidebar. Se precisar de um componente, copie a peça."
        >
          <ul className="overflow-hidden rounded-xl border border-line bg-surface">
            {LEGACY.map((item) => (
              <FileRow key={item.path} path={item.path} role={item.role} />
            ))}
          </ul>
        </Block>
      )
    case 'regras':
      return (
        <Block title="Regras de produto" lead="Vale para qualquer tela nova.">
          <ul className="flex flex-col gap-2">
            {RULES.map((rule) => (
              <li key={rule} className="rounded-xl border border-line bg-surface px-4 py-3 text-[14px] leading-relaxed">
                {rule}
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3 shadow-soft">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-0.5 text-[13px] font-semibold">{value}</p>
    </div>
  )
}

function ListCard({ title, tone, items }: { title: string; tone: 'green' | 'amber'; items: string[] }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-soft">
      <div className="mb-3">
        <Badge tone={tone}>{title}</Badge>
      </div>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="text-[13px] leading-relaxed text-ink">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

function FileRow({ path, role }: { path: string; role: string }) {
  return (
    <li className="flex flex-col gap-0.5 border-b border-line px-4 py-3 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="font-mono text-[12px]">{path}</span>
      <span className="text-[13px] text-muted sm:text-right">{role}</span>
    </li>
  )
}
