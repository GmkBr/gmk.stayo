import { cn } from '../../utils/cn.ts'

type Props = {
  collapsed?: boolean
  className?: string
  tone?: 'dark' | 'light'
}

export function StayoLogo({ collapsed = false, className, tone = 'dark' }: Props) {
  return (
    <span
      className={cn(
        'font-medium uppercase leading-none select-none',
        collapsed ? 'text-[11px] tracking-[0.1em]' : 'text-[15px] tracking-[0.14em]',
        tone === 'dark' ? 'text-ink' : 'text-white',
        className,
      )}
      aria-label="STAYO"
    >
      STAYO
    </span>
  )
}
