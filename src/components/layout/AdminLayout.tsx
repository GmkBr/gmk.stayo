import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { Sidebar } from './Sidebar.tsx'
import { Topbar } from './Topbar.tsx'
import { GlobalSearch } from './GlobalSearch.tsx'

export function AdminLayout() {
  const { mobileNavOpen, setMobileNavOpen, sidebarCollapsed, toggleSidebar } = useApp()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname, setMobileNavOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLSelectElement)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-svh bg-canvas">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-svh">
          <Sidebar />
        </div>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-ink/25" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="relative min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {sidebarCollapsed && (
            <button
              type="button"
              aria-label="Expandir menu"
              onClick={toggleSidebar}
              className="absolute left-2 top-2 hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-surface lg:flex"
            >
              <PanelLeft size={16} />
            </button>
          )}
          <Outlet />
        </main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
