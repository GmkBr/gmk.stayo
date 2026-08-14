import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn.ts'

type ToastItem = {
  id: string
  title: string
  detail?: string
  tone?: 'default' | 'success' | 'danger'
}

type ToastContextValue = {
  push: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()
    setItems((prev) => [...prev, { ...toast, id }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto rounded-xl border border-line bg-surface px-4 py-3 shadow-soft',
              item.tone === 'success' && 'border-success/20',
              item.tone === 'danger' && 'border-danger/20',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold">{item.title}</p>
                {item.detail && <p className="mt-0.5 text-[12px] text-muted">{item.detail}</p>}
              </div>
              <button
                type="button"
                aria-label="Dispensar"
                className="text-muted hover:text-ink"
                onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
