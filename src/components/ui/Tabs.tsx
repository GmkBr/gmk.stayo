import { cn } from '../../utils/cn.ts'

type Tab = { id: string; label: string }

type Props = {
  tabs: Tab[]
  value: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, value, onChange }: Props) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-line">
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors',
              active ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
