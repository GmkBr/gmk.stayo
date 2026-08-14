import { cn } from '../../utils/cn.ts'

type Props = {
  collapsed?: boolean
  className?: string
  tone?: 'dark' | 'light'
}

export function StayoLogo({ collapsed = false, className, tone = 'dark' }: Props) {
  const color = tone === 'dark' ? '#171717' : '#ffffff'

  return (
    <span className={cn('inline-flex items-center gap-2', className)} aria-label="STAYO">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <rect width="22" height="22" rx="6" fill={color} />
        <path
          d="M6.2 15.4V6.6h4.35c2.05 0 3.35 1.18 3.35 3 0 1.86-1.32 3.06-3.35 3.06H8.45v2.74H6.2zm2.25-4.5h1.85c.92 0 1.45-.54 1.45-1.42s-.53-1.4-1.45-1.4H8.45v2.82z"
          fill={tone === 'dark' ? '#fff' : '#171717'}
        />
      </svg>
      {!collapsed && (
        <span
          className={cn(
            'text-[15px] font-semibold tracking-[0.18em]',
            tone === 'dark' ? 'text-ink' : 'text-white',
          )}
        >
          STAYO
        </span>
      )}
    </span>
  )
}
