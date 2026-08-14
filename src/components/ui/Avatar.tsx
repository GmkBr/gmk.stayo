import { cn } from '../../utils/cn.ts'

type Props = {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function initials(name: string) {
  return name
    .split(' ')
    .filter((part) => part.length > 2 && part.toLowerCase() !== 'de' && part.toLowerCase() !== 'da')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

const sizes = {
  sm: 'size-7 text-[11px]',
  md: 'size-9 text-[12px]',
  lg: 'size-14 text-base',
}

export function Avatar({ name, size = 'md', className }: Props) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-[#ece8e1] font-semibold tracking-wide text-ink/80',
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
