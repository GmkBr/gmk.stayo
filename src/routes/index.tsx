import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../components/layout/AdminLayout.tsx'
import { DashboardPage } from '../pages/dashboard/DashboardPage.tsx'
import { ReservationsPage } from '../pages/reservations/ReservationsPage.tsx'
import { GuestsPage } from '../pages/guests/GuestsPage.tsx'
import { GuestProfilePage } from '../pages/guests/GuestProfilePage.tsx'
import { RoomsPage } from '../pages/rooms/RoomsPage.tsx'
import { HousekeepingPage } from '../pages/housekeeping/HousekeepingPage.tsx'
import { MaintenancePage } from '../pages/maintenance/MaintenancePage.tsx'
import { ServicesPage } from '../pages/services/ServicesPage.tsx'
import { GuestPortalPage } from '../pages/guest-portal/GuestPortalPage.tsx'
import { SelfServicePage } from '../pages/self-service/SelfServicePage.tsx'
import { ReportsPage } from '../pages/reports/ReportsPage.tsx'
import { SettingsPage } from '../pages/settings/SettingsPage.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/guests" element={<GuestsPage />} />
        <Route path="/guests/:id" element={<GuestProfilePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/housekeeping" element={<HousekeepingPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/guest" element={<GuestPortalPage />} />
      <Route path="/self-service" element={<SelfServicePage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
