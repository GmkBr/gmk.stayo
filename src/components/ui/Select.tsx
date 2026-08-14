import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn.ts'

type Option = { value: string; label: string }

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  options: Option[]
}

export function Select({ label, options, className, id, ...props }: Props) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={selectId}>
      {label && <span className="text-[13px] font-medium text-ink">{label}</span>}
      <select
        id={selectId}
        className={cn(
          'h-9 w-full rounded-lg border border-line bg-surface px-3 text-[13px] text-ink transition-colors hover:border-ink/20 focus:border-accent focus:outline-none focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
