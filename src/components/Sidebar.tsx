import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  FileText,
  ShoppingCart,
  Receipt,
  Users,
  Percent,
  Boxes,
  Settings,
  LogOut
} from 'lucide-react'


const mainMenu = [
  { name: 'Dashboard', icon: LayoutDashboard },
]

const catalogMenu = [
  { name: 'Produtos', icon: Package, path: '/products' },
  { name: 'Categorias', icon: Tags, path: '/categories' },
  { name: 'Páginas & Banners', icon: FileText, path: '/pages' },
]

const salesMenu = [
  { name: 'Vendas', icon: ShoppingCart },
  { name: 'Pedidos', icon: Receipt },
  { name: 'Promoções', icon: Percent },
]

const managementMenu = [
  { name: 'Clientes', icon: Users },
  { name: 'Usuários', icon: Users },
  { name: 'Inventário', icon: Boxes },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 font-bold text-xl">
        Mercado Admin
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <MenuSection title="MAIN" items={mainMenu} />
        <MenuSection title="CATÁLOGO" items={catalogMenu} />
        <MenuSection title="VENDAS" items={salesMenu} />
        <MenuSection title="GESTÃO" items={managementMenu} />
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        <button className="flex items-center w-full px-3 py-2 text-sm rounded-lg
              text-gray-700 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-700">
          <Settings className="w-5 h-5 mr-3" />
          Configurações
        </button>

        <button className="flex items-center w-full px-3 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </button>
      </div>
    </aside>
  )
}

/* -------------------- */
/* Section Component    */
/* -------------------- */

function MenuSection({
  title,
  items,
}: {
  title: string
  items: { name: string; icon: any; path?: string }[]
}) {
  return (
    <div>
      <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">
        {title}
      </p>

      <div className="space-y-1">
        {items.map(item =>
          item.path ? (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center w-full px-3 py-2 text-sm rounded-lg
                ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ) : (
            <button
              key={item.name}
              className="flex items-center w-full px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <item.icon className="w-5 h-5 mr-3 text-gray-500" />
              {item.name}
            </button>
          )
        )}
      </div>
    </div>
  )
}
