import { useEffect, useState } from 'react'

export function usePageLoading(ms = 450) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(id)
  }, [ms])

  return loading
}
