import { useCallback, useState } from 'react'

function readCollapsed() {
  return localStorage.getItem('stayo.sidebar') === '1'
}

export function useInterfaceModule() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsed)

  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('stayo.sidebar', next ? '1' : '0')
      return next
    })
  }, [])

  return {
    sidebarCollapsed,
    toggleSidebar,
    mobileNavOpen,
    setMobileNavOpen,
  }
}
