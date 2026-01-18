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
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
]

const catalogMenu = [
  { name: 'Produtos', icon: Package, path: '/products' },
  { name: 'Categorias', icon: Tags, path: '/categories' },
  { name: 'Páginas & Banners', icon: FileText, path: '/pages' },
]

const salesMenu = [
  { name: 'Vendas', icon: ShoppingCart },
  { name: 'Pedidos', icon: Receipt, path: '/orders' },
  { name: 'Promoções', icon: Percent },
]

const managementMenu = [
  { name: 'Clientes', icon: Users },
  { name: 'Usuários', icon: Users },
  { name: 'Inventário', icon: Boxes },
]

const baseItemClass = `
  flex items-center w-full px-3 py-2 text-sm rounded-lg
  transition-colors
  text-gray-700 dark:text-gray-200
  hover:bg-gray-100 dark:hover:bg-gray-700
`

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 font-bold text-xl text-gray-900 dark:text-white">
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
      <div className="border-t dark:border-gray-700 p-4 space-y-2">
        <button className={baseItemClass}>
          <Settings className="w-5 h-5 mr-3" />
          Configurações
        </button>

        <button className="flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-gray-700">
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
                ${baseItemClass}
                ${
                  isActive
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : ''
                }
              `
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ) : (
            <button key={item.name} className={baseItemClass}>
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          )
        )}
      </div>
    </div>
  )
}
