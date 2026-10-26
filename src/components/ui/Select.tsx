import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn.ts'

type Option = { value: string; label: string }

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
  options: Option[]
}

export function Select({ label, hint, error, options, className, id, ...props }: Props) {
  const autoId = useId()
  const selectId = id ?? autoId
  const hintId = hint ? `${selectId}-hint` : undefined
  const errorId = error ? `${selectId}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={selectId}>
      {label && (
        <span className={cn('text-[13px] font-medium', error ? 'text-danger' : 'text-ink')}>{label}</span>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-9 w-full rounded-lg border bg-surface px-3 text-[13px] text-ink transition-colors hover:border-ink/20 focus:border-accent focus:outline-none focus-visible:outline-none',
          error ? 'border-danger' : 'border-line',
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
      {error && (
        <span id={errorId} className="text-[12px] text-danger">
          {error}
        </span>
      )}
      {hint && !error && (
        <span id={hintId} className="text-[12px] text-muted">
          {hint}
        </span>
      )}
    </label>
  )
}
