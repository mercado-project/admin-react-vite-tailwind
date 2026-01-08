import { Search, Bell, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Topbar() {
  const { isDark, toggleTheme } = useDarkMode()

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="
              pl-9 pr-3 py-2 border rounded-lg text-sm
              bg-white dark:bg-gray-700
              text-gray-800 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600
            "
          />
        </div>

        {/* Toggle Dark Mode */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Alternar tema"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/40"
            className="w-8 h-8 rounded-full"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-800 dark:text-gray-100">
              James Richard
            </p>
            <p className="text-gray-400 text-xs">Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
