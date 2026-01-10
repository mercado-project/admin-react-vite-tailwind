import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { Toaster } from 'react-hot-toast'

type Props = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Toast global */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#16a34a', // green-600
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#dc2626', // red-600
              color: '#fff',
            },
          },
        }}
      />

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

