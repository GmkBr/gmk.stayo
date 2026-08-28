import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../components/layout/AdminLayout.tsx'
import { RequireConsole } from '../auth/RequireConsole.tsx'
import { RequireTotem } from '../auth/RequireTotem.tsx'
import { HubPage } from '../pages/hub/HubPage.tsx'
import { QueuesPage } from '../pages/queues/QueuesPage.tsx'
import { ReservationsPage } from '../pages/reservations/ReservationsPage.tsx'
import { TotemAppPage } from '../pages/totem/TotemAppPage.tsx'
import { TotemsPage } from '../pages/totems/TotemsPage.tsx'
import { CatalogPage } from '../pages/catalog/CatalogPage.tsx'
import { DocsPage } from '../pages/docs/DocsPage.tsx'
import { LoginPage } from '../pages/auth/LoginPage.tsx'
import { HotelSelectPage } from '../pages/hotels/HotelSelectPage.tsx'
import { HotelCreatePage } from '../pages/hotels/HotelCreatePage.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/hub" element={<HubPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/hoteis"
        element={
          <RequireConsole>
            <HotelSelectPage />
          </RequireConsole>
        }
      />
      <Route
        path="/hoteis/novo"
        element={
          <RequireConsole>
            <HotelCreatePage />
          </RequireConsole>
        }
      />
      <Route
        path="/hoteis/:hotelId/editar"
        element={
          <RequireConsole>
            <HotelCreatePage />
          </RequireConsole>
        }
      />

      <Route
        element={
          <RequireConsole>
            <AdminLayout />
          </RequireConsole>
        }
      >
        <Route path="/filas" element={<QueuesPage />} />
        <Route path="/reservas" element={<ReservationsPage />} />
        <Route path="/totens" element={<TotemsPage />} />
        <Route path="/cardapio" element={<CatalogPage />} />
      </Route>

      <Route
        path="/totem"
        element={
          <RequireTotem>
            <TotemAppPage />
          </RequireTotem>
        }
      />

      <Route path="/totem/recepcao" element={<Navigate to="/totem" replace />} />
      <Route path="/totem/quarto" element={<Navigate to="/totem" replace />} />
      <Route path="/totem/area" element={<Navigate to="/totem" replace />} />

      <Route path="/dashboard" element={<Navigate to="/hoteis" replace />} />
      <Route path="/reservations" element={<Navigate to="/reservas" replace />} />
      <Route path="/self-service" element={<Navigate to="/totem" replace />} />
      <Route path="/guest" element={<Navigate to="/totem" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
