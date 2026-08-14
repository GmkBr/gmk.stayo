import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.tsx'
import { ToastProvider } from './components/ui/Toast.tsx'
import { AppRoutes } from './routes/index.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  )
}
