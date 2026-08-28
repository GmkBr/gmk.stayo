import { SelfServicePage } from '../self-service/SelfServicePage.tsx'
import { RoomTotemPage } from './RoomTotemPage.tsx'
import { AreaTotemPage } from './AreaTotemPage.tsx'
import { OperationTotemPage } from './OperationTotemPage.tsx'
import { useApp } from '../../context/AppContext.tsx'

export function TotemAppPage() {
  const { profile } = useApp()
  const kind = profile?.totem?.kind

  switch (kind) {
    case 'reception':
      return <SelfServicePage />
    case 'room':
      return <RoomTotemPage />
    case 'area':
      return <AreaTotemPage />
    case 'operation':
      return <OperationTotemPage />
    default:
      return <OperationTotemPage />
  }
}
