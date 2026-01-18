import { useEffect, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout'
import toast from 'react-hot-toast'
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  type Order,
  type OrderStatus,
  type OrdersQueryParams,
} from '../services/orders.service'

/* ===================== */
/* PAGE                  */
/* ===================== */

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('')

  /* ===================== */
  /* LOAD DATA             */
  /* ===================== */

  async function loadData() {
    try {
      setLoading(true)
      const params: OrdersQueryParams = {
        page,
        limit,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter as OrderStatus }),
      }

      const response = await getOrders(params)
      setOrders(response.data || [])
      setTotal(response.total || 0)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, statusFilter])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadData()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  /* ===================== */
  /* ACTIONS               */
  /* ===================== */

  async function handleUpdateStatus() {
    if (!selectedOrder || !newStatus) return

    try {
      await updateOrderStatus(selectedOrder.id, newStatus as OrderStatus)
      toast.success('Status atualizado com sucesso')
      setStatusModalOpen(false)
      setSelectedOrder(null)
      setNewStatus('')
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Erro ao atualizar status')
    }
  }

  async function handleDeleteOrder(id: number) {
    if (!confirm('Deseja realmente excluir este pedido?')) return

    try {
      await deleteOrder(id)
      toast.success('Pedido excluído com sucesso')
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Erro ao excluir pedido')
    }
  }

  function openStatusModal(order: Order) {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusModalOpen(true)
  }

  /* ===================== */
  /* HELPERS               */
  /* ===================== */

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getStatusBadgeColor(status: OrderStatus) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      canceled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[status] || colors.pending
  }

  function getStatusLabel(status: OrderStatus) {
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      shipped: 'Enviado',
      delivered: 'Entregue',
      canceled: 'Cancelado',
    }
    return labels[status] || status
  }

  function getPaymentMethodLabel(method: string) {
    const labels = {
      card: 'Cartão',
      pix: 'PIX',
      boleto: 'Boleto',
    }
    return labels[method as keyof typeof labels] || method
  }

  const totalPages = Math.ceil(total / limit)

  /* ===================== */
  /* RENDER                */
  /* ===================== */

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pedidos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie todos os pedidos dos clientes
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar por nome do cliente..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as OrderStatus | '')
                setPage(1)
              }}
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-500">
            {loading ? (
              'Carregando...'
            ) : (
              <>
                {total} {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
              </>
            )}
          </div>
        </div>

        {/* ORDERS TABLE */}
        {loading ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-500">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customer.fullName}
                        </div>
                        {order.customer.email && (
                          <div className="text-xs text-gray-500">{order.customer.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        {order.shippingFee > 0 && (
                          <div className="text-xs text-gray-500">
                            + {formatCurrency(order.shippingFee)} frete
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openStatusModal(order)}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Alterar Status
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-3 py-1.5 text-xs font-medium border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STATUS MODAL */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Alterar Status do Pedido
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Pedido #{selectedOrder.id} - {selectedOrder.customer.fullName}
                </p>
              </div>
              <button
                onClick={() => {
                  setStatusModalOpen(false)
                  setSelectedOrder(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status Atual
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Novo Status <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as OrderStatus)}
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="canceled">Cancelado</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <strong>Valor Total:</strong> {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                  {selectedOrder.shippingFee > 0 && (
                    <p>
                      <strong>Frete:</strong> {formatCurrency(selectedOrder.shippingFee)}
                    </p>
                  )}
                  <p>
                    <strong>Pagamento:</strong> {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setStatusModalOpen(false)
                  setSelectedOrder(null)
                  setNewStatus('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === selectedOrder.status}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
