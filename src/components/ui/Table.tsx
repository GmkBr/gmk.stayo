import type { ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto scrollbar-thin', className)}>
      <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-line text-[12px] font-medium text-muted">{children}</tr>
    </thead>
  )
}

export function TH({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn('px-3 py-2.5 font-medium', className)}>{children}</th>
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TR({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-line last:border-0',
        onClick && 'cursor-pointer transition-colors hover:bg-canvas/80',
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function TD({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-3 py-3 align-middle text-ink', className)}>{children}</td>
}
