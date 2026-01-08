import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

type Props = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 text-gray-900 dark:text-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}
