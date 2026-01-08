import type { Category } from '../../services/categories.service'
import CategoryTreeItem from '../categories/CategoryTreeItem'

type Props = {
  categories: Category[]
  selectedId?: number
  onSelect: (category: Category) => void
}

export default function CategoryTree({
  categories,
  selectedId,
  onSelect,
}: Props) {
  const buildTree = (parentId: number | null, level = 0) => {
    return categories
      .filter(cat =>
        parentId === null
          ? !cat.parent
          : cat.parent?.id === parentId
      )
      .map(cat => (
        <CategoryTreeItem
          key={cat.id}
          category={cat}
          level={level}
          isSelected={cat.id === selectedId}
          onSelect={onSelect}
        >
          {buildTree(cat.id, level + 1)}
        </CategoryTreeItem>
      ))
  }

  return <div>{buildTree(null)}</div>
}
