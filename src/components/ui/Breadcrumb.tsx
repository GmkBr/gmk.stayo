import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

type Crumb = { label: string; to?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-[13px] text-muted">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <span key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="shrink-0" />}
            {item.to && !last ? (
              <Link to={item.to} className="truncate hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span className={last ? 'truncate font-medium text-ink' : 'truncate'}>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
