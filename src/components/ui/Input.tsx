import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../utils/cn.ts'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  icon?: ReactNode
  /** Mostra botão para alternar visibilidade (use com type="password"). */
  passwordToggle?: boolean
}

export function Input({
  label,
  hint,
  error,
  icon,
  passwordToggle = false,
  className,
  id,
  type,
  ...props
}: Props) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isPasswordField = type === 'password'
  const showToggle = passwordToggle && isPasswordField
  const inputType = showToggle && passwordVisible ? 'text' : type

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
      {label && (
        <span className={cn('text-[13px] font-medium', error ? 'text-danger' : 'text-ink')}>{label}</span>
      )}
      <span className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
        <input
          id={inputId}
          type={inputType}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-9 w-full rounded-lg border bg-surface px-3 text-[13px] text-ink placeholder:text-muted/80 transition-colors hover:border-ink/20 focus:border-accent focus:outline-none focus-visible:outline-none',
            error ? 'border-danger' : 'border-line',
            icon ? 'pl-9' : undefined,
            showToggle ? 'pr-10' : undefined,
            className,
          )}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
            aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={passwordVisible}
            onClick={() => setPasswordVisible((visible) => !visible)}
            disabled={props.disabled}
          >
            {passwordVisible ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
          </button>
        )}
      </span>
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
