import type { Category } from '../../services/categories.service'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  category: Category
  level: number
  children?: ReactNode
  isSelected: boolean
  onSelect: (category: Category) => void
}

export default function CategoryTreeItem({
  category,
  level,
  children,
  isSelected,
  onSelect,
}: Props) {
  return (
    <div>
      <button
        onClick={() => onSelect(category)}
        className={`
          flex items-center w-full text-left px-3 py-2 rounded-lg
          transition
          ${isSelected
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <ChevronRight className="w-4 h-4 mr-2 opacity-60" />

        <span
          className={
            level === 0
              ? 'font-semibold text-sm'
              : 'text-sm text-gray-600 dark:text-gray-300'
          }
        >
          {category.name}
        </span>
      </button>

      <div className="ml-2">{children}</div>
    </div>
  )
}
