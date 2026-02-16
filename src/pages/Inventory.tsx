import { useEffect, useState, useMemo } from 'react'
import AdminLayout from '../layouts/AdminLayout'
import { getAllProducts, type Product } from '../services/products.service'
import {
  getAllPrices,
  getAllStocks,
  createPrice,
  updatePrice,
  createStock,
  updateStock,
  type Price,
  type Stock,
} from '../services/inventory.service'
import {
  Edit2,
  Save,
  X,
  Search,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import StatCard from '../components/common/StatCard'

type InventoryProduct = Product & {
  price?: Price
  stock?: Stock
}

export default function Inventory() {
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingPrice, setEditingPrice] = useState<{
    productId: number
    price: number
    priceId?: number
  } | null>(null)
  const [editingStock, setEditingStock] = useState<{
    productId: number
    quantity: number
    stockId?: number
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  async function loadInventory() {
    try {
      setLoading(true)
      const [productsData, pricesData, stocksData] = await Promise.all([
        getAllProducts(),
        getAllPrices(),
        getAllStocks(),
      ])

      // Mapear produtos com seus preços e estoques mais recentes
      const inventory = productsData.map((product) => {
        const productPrices = pricesData
          .filter((p) => p.productId === product.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        const productStock = stocksData.find((s) => s.productId === product.id)

        return {
          ...product,
          price: productPrices[0],
          stock: productStock,
        }
      })

      setProducts(inventory)
    } catch (error) {
      console.error('Erro ao carregar inventário:', error)
      showNotification('error', 'Erro ao carregar inventário')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term)
    )
  }, [products, search])

  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  async function handleSavePrice() {
    if (!editingPrice) return

    try {
      setSaving(true)
      if (editingPrice.priceId) {
        await updatePrice(editingPrice.priceId, { price: editingPrice.price })
      } else {
        await createPrice({
          productId: editingPrice.productId,
          price: editingPrice.price,
        })
      }
      showNotification('success', 'Preço atualizado com sucesso!')
      setEditingPrice(null)
      await loadInventory()
    } catch (error) {
      console.error('Erro ao salvar preço:', error)
      showNotification('error', 'Erro ao salvar preço')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveStock() {
    if (!editingStock) return

    try {
      setSaving(true)
      if (editingStock.stockId) {
        await updateStock(editingStock.stockId, {
          quantity: editingStock.quantity,
        })
      } else {
        await createStock({
          productId: editingStock.productId,
          quantity: editingStock.quantity,
        })
      }
      showNotification('success', 'Estoque atualizado com sucesso!')
      setEditingStock(null)
      await loadInventory()
    } catch (error) {
      console.error('Erro ao salvar estoque:', error)
      showNotification('error', 'Erro ao salvar estoque')
    } finally {
      setSaving(false)
    }
  }

  const totalProducts = products.length
  const productsWithPrice = products.filter((p) => p.price).length
  const productsWithStock = products.filter((p) => p.stock).length
  const lowStockProducts = products.filter(
    (p) => p.stock && p.stock.quantity < 10
  ).length

  return (
    <AdminLayout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Inventário
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie preços e estoque de todos os produtos
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Package}
            label="Total de Produtos"
            value={totalProducts}
            color="blue"
          />
          <StatCard
            icon={DollarSign}
            label="Produtos com Preço"
            value={productsWithPrice}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Produtos com Estoque"
            value={productsWithStock}
            color="purple"
          />
          <StatCard
            icon={AlertCircle}
            label="Estoque Baixo"
            value={lowStockProducts}
            color="red"
          />
        </div>

        {/* SEARCH BAR */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos por nome ou SKU..."
            className="
              w-full pl-10 pr-4 py-2.5
              border border-gray-300 dark:border-gray-700 rounded-lg
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-white
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Estoque
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {product.sku || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingPrice?.productId === product.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              R$
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={editingPrice.price}
                              onChange={(e) =>
                                setEditingPrice({
                                  ...editingPrice,
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={handleSavePrice}
                              disabled={saving}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingPrice(null)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.price
                                ? `R$ ${parseFloat(product.price.price.toString()).toFixed(2).replace('.', ',')}`
                                : '-'}
                            </span>
                            <button
                              onClick={() =>
                                setEditingPrice({
                                  productId: product.id,
                                  price: product.price
                                    ? parseFloat(product.price.price.toString())
                                    : 0,
                                  priceId: product.price?.id,
                                })
                              }
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStock?.productId === product.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editingStock.quantity}
                              onChange={(e) =>
                                setEditingStock({
                                  ...editingStock,
                                  quantity: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveStock}
                              disabled={saving}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${product.stock && product.stock.quantity < 10
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-900 dark:text-white'
                                }`}
                            >
                              {product.stock ? product.stock.quantity : '-'}
                            </span>
                            {product.stock && product.stock.quantity < 10 && (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                            <button
                              onClick={() =>
                                setEditingStock({
                                  productId: product.id,
                                  quantity: product.stock?.quantity || 0,
                                  stockId: product.stock?.id,
                                })
                              }
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => {
                            if (product.price) {
                              setEditingPrice({
                                productId: product.id,
                                price: parseFloat(product.price.price.toString()),
                                priceId: product.price.id,
                              })
                            }
                            if (product.stock) {
                              setEditingStock({
                                productId: product.id,
                                quantity: product.stock.quantity,
                                stockId: product.stock.id,
                              })
                            }
                            if (!product.price && !product.stock) {
                              setEditingPrice({
                                productId: product.id,
                                price: 0,
                              })
                              setEditingStock({
                                productId: product.id,
                                quantity: 0,
                              })
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          Editar Ambos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Nenhum produto encontrado
                </div>
              )}
            </div>
          )}
        </div>

        {/* NOTIFICATION */}
        {notification && (
          <div
            className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${notification.type === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
                }`}
            >
              {notification.message}
            </span>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}



