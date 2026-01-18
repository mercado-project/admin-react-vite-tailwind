import { useMemo, useState } from 'react'
import type { Product } from '../../services/products.service'
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Filter
} from 'lucide-react'

type Props = {
  products: Product[]
  selectedId?: number
  onSelect: (product: Product) => void
  onAdd: () => void
}

type SortKey = 'id' | 'name' | 'sku' | 'price'
type SortOrder = 'asc' | 'desc'

const PAGE_SIZE = 30

const gridCols =
  'grid-cols-[40px_60px_minmax(0,1fr)_120px_100px_100px]'

export default function ProductsGrid({
  products,
  selectedId,
  onSelect,
  onAdd,
}: Props) {
  /* -------------------- */
  /* State                */
  /* -------------------- */
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [actionsOpen, setActionsOpen] = useState(false)

  /* -------------------- */
  /* Filtering            */
  /* -------------------- */
  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term)
    )
  }, [products, search])

  /* -------------------- */
  /* Sorting              */
  /* -------------------- */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortKey) {
        case 'price':
          aVal = Number(a.prices?.[0]?.price || 0)
          bVal = Number(b.prices?.[0]?.price || 0)
          break
        default:
          aVal = (a as any)[sortKey]
          bVal = (b as any)[sortKey]
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortOrder])

  /* -------------------- */
  /* Pagination           */
  /* -------------------- */
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sorted.slice(start, start + PAGE_SIZE)
  }, [sorted, page])

  /* -------------------- */
  /* Helpers              */
  /* -------------------- */
  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  function toggleRow(id: number) {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  function toggleAll() {
    const ids = paginated.map(p => p.id)
    const allSelected = ids.every(id => selectedRows.includes(id))

    setSelectedRows(allSelected
      ? selectedRows.filter(id => !ids.includes(id))
      : [...new Set([...selectedRows, ...ids])]
    )
  }

  /* -------------------- */
  /* Render               */
  /* -------------------- */
  return (
    <div className="h-full flex flex-col">

      {/* TOOLBAR */}
      <div className="mb-4 mt-1 flex items-center justify-between gap-4">

        {/* SEARCH */}
        <input
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Buscar por nome ou SKU..."
          className="
            w-80 px-3 py-2 text-sm
            border rounded-md
            bg-white dark:bg-gray-900
            border-gray-300 dark:border-gray-700
          "
        />

        {/* ACTIONS */}
        <div className="flex items-center gap-2 relative">

        <button
          onClick={onAdd}
          className="
            px-4 py-2 text-[13px] font-medium rounded-md
            bg-green-600 text-white
            hover:bg-green-700
            dark:bg-green-500 dark:hover:bg-green-600
          "
        >
          + Adicionar
        </button>

          {/* ACTION BUTTON */}
          <button
            disabled={selectedRows.length === 0}
            onClick={() => setActionsOpen(o => !o)}
            className={`
              flex items-center gap-2 px-3 py-2 text-sm rounded-md border
              transition
              ${
                selectedRows.length === 0
                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800'
              }
            `}
          >
            <MoreVertical className="w-4 h-4" />
            Ação
          </button>

          {/* ACTION DROPDOWN */}
          {actionsOpen && selectedRows.length > 0 && (
            <div
              className="
                absolute right-0 top-full mt-1
                w-40 rounded-md border
                bg-white dark:bg-gray-900
                shadow-lg z-20
              "
            >
              <button
                className="
                  w-full px-4 py-2 text-sm text-left
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  text-red-600
                "
              >
                Excluir
              </button>
            </div>
          )}

          {/* FILTER BUTTON */}
          <button
            className="
              flex items-center gap-2 px-3 py-2 text-sm rounded-md border
              bg-white dark:bg-gray-900
              border-gray-300 dark:border-gray-700
              hover:bg-gray-100 dark:hover:bg-gray-800
            "
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="flex-1 overflow-y-auto">

        {/* HEADER */}
        <div
          className={`
            grid ${gridCols}
            sticky top-0 z-10
            bg-gray-50 dark:bg-gray-800
            text-xs font-semibold uppercase
            text-gray-600 dark:text-gray-400
            border-b border-gray-200 dark:border-gray-700
          `}
        >
          <HeaderCell center>
            <input
              type="checkbox"
              onChange={toggleAll}
              checked={
                paginated.length > 0 &&
                paginated.every(p => selectedRows.includes(p.id))
              }
            />
          </HeaderCell>

          <SortableHeader label="ID" active={sortKey === 'id'} order={sortOrder} onClick={() => toggleSort('id')} />
          <SortableHeader label="Nome" active={sortKey === 'name'} order={sortOrder} onClick={() => toggleSort('name')} />
          <SortableHeader label="SKU" active={sortKey === 'sku'} order={sortOrder} onClick={() => toggleSort('sku')} />

          <HeaderCell>Status</HeaderCell>

          <SortableHeader label="Preço" active={sortKey === 'price'} order={sortOrder} onClick={() => toggleSort('price')} />
        </div>

        {/* ROWS */}
        {paginated.map((product, index) => {
          const isSelected = product.id === selectedId
          const zebra = index % 2 === 1

          return (
            <div
              key={product.id}
              onClick={() => onSelect(product)}
              className={`
                grid ${gridCols}
                cursor-pointer text-sm
                border-b border-gray-100 dark:border-gray-800
                transition-colors

                ${
                  isSelected
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : zebra
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : 'bg-white dark:bg-gray-900'
                }

                hover:bg-gray-100 dark:hover:bg-gray-700
              `}
            >
              <Cell center onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(product.id)}
                  onChange={() => toggleRow(product.id)}
                />
              </Cell>

              <Cell muted>{product.id}</Cell>
              <Cell strong truncate>{product.name}</Cell>
              <Cell>{product.sku || '-'}</Cell>

              <Cell>
                {product.active ? (
                  <span className="text-green-600 dark:text-green-400">Ativo</span>
                ) : (
                  <span className="text-gray-400">Inativo</span>
                )}
              </Cell>

              <Cell>
                {product.prices?.[0]?.price
                  ? `R$ ${product.prices[0].price}`
                  : '-'}
              </Cell>
            </div>
          )
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-3 flex justify-end gap-2 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="px-2">
            Página {page} de {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

/* -------------------- */
/* Helper Components    */
/* -------------------- */

function HeaderCell({
  children,
  center,
}: {
  children: React.ReactNode
  center?: boolean
}) {
  return (
    <div
      className={`
        px-3 py-2
        border-r border-gray-200 dark:border-gray-700
        last:border-r-0
        whitespace-nowrap
        ${center ? 'flex justify-center' : ''}
      `}
    >
      {children}
    </div>
  )
}

function SortableHeader({
  label,
  active,
  order,
  onClick,
}: {
  label: string
  active: boolean
  order: 'asc' | 'desc'
  onClick: () => void
}) {
  return (
    <HeaderCell>
      <button
        onClick={onClick}
        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
      >
        {label}
        {active &&
          (order === 'asc'
            ? <ChevronUp className="w-3 h-3" />
            : <ChevronDown className="w-3 h-3" />
          )}
      </button>
    </HeaderCell>
  )
}

function Cell({
  children,
  strong,
  muted,
  truncate,
  center,
  onClick,
}: {
  children: React.ReactNode
  strong?: boolean
  muted?: boolean
  truncate?: boolean
  center?: boolean
  onClick?: React.MouseEventHandler
}) {
  return (
    <div
      onClick={onClick}
      className={`
        px-3 py-2
        border-r border-gray-100 dark:border-gray-800
        last:border-r-0
        whitespace-nowrap
        ${truncate ? 'overflow-hidden text-ellipsis' : ''}
        ${strong ? 'font-medium text-gray-900 dark:text-gray-100' : ''}
        ${muted ? 'text-gray-500 dark:text-gray-400' : ''}
        ${center ? 'flex justify-center' : ''}
      `}
    >
      {children}
    </div>
  )
}
