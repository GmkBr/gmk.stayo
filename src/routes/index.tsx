import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../components/layout/AdminLayout.tsx'
import { HubPage } from '../pages/hub/HubPage.tsx'
import { QueuesPage } from '../pages/queues/QueuesPage.tsx'
import { ReservationsPage } from '../pages/reservations/ReservationsPage.tsx'
import { SelfServicePage } from '../pages/self-service/SelfServicePage.tsx'
import { RoomTotemPage } from '../pages/totem/RoomTotemPage.tsx'
import { AreaTotemPage } from '../pages/totem/AreaTotemPage.tsx'
import { TotemsPage } from '../pages/totems/TotemsPage.tsx'
import { CatalogPage } from '../pages/catalog/CatalogPage.tsx'
import { DocsPage } from '../pages/docs/DocsPage.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HubPage />} />
      <Route path="/docs" element={<DocsPage />} />

      <Route element={<AdminLayout />}>
        <Route path="/filas" element={<QueuesPage />} />
        <Route path="/reservas" element={<ReservationsPage />} />
        <Route path="/totens" element={<TotemsPage />} />
        <Route path="/cardapio" element={<CatalogPage />} />
      </Route>

      <Route path="/totem/recepcao" element={<SelfServicePage />} />
      <Route path="/totem/quarto" element={<RoomTotemPage />} />
      <Route path="/totem/area" element={<AreaTotemPage />} />

      <Route path="/dashboard" element={<Navigate to="/filas" replace />} />
      <Route path="/reservations" element={<Navigate to="/reservas" replace />} />
      <Route path="/self-service" element={<Navigate to="/totem/recepcao" replace />} />
      <Route path="/guest" element={<Navigate to="/totem/quarto" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
