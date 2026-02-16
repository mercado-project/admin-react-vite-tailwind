import { useState, useEffect } from 'react';
import { Search, AlertCircle, Calendar, Filter, DollarSign, TrendingUp } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { getOrders, getOrderStats, type Order, type OrderStats } from '../services/orders.service';
import SalesModal from '../components/sales/SalesModal';
import OrderDetails from '../components/sales/OrderDetails';
import SalesGrid from '../components/sales/SalesGrid';
import StatCard from '../components/common/StatCard';

export default function Sales() {
  const [sales, setSales] = useState<Order[]>([]);
  const [filteredSales, setFilteredSales] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);

  // Filtros de data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load sales (orders) and stats
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = { status: 'paid' };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [ordersResponse, statsResponse] = await Promise.all([
        getOrders(params),
        getOrderStats()
      ]);

      const salesArray = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
      setSales(salesArray);
      setFilteredSales(salesArray);
      setStats(statsResponse);

    } catch (err) {
      setError('Erro ao carregar vendas. Tente novamente.');
      setSales([]);
      setFilteredSales([]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  // Filter sales by search term locally
  useEffect(() => {
    if (!Array.isArray(sales)) {
      setFilteredSales([]);
      return;
    }
    const filtered = sales.filter(
      (sale) =>
        sale.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSales(filtered);
  }, [searchTerm, sales]);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(undefined);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Vendas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerenciar vendas realizadas (Pedidos Pagos) e acompanhar métricas
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Vendas Hoje (Total)"
              value={formatCurrency(stats.today.total)}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              label="Vendas Hoje (Qtd)"
              value={stats.today.count}
              color="blue"
            />
            <StatCard
              icon={DollarSign}
              label="Vendas Mês (Total)"
              value={formatCurrency(stats.month.total)}
              color="purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Vendas Mês (Qtd)"
              value={stats.month.count}
              color="yellow"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSetToday}
              className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Hoje
            </button>
            {(startDate || endDate) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <SalesGrid
              sales={filteredSales}
              onViewDetails={handleOpenDetails}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Modal */}
        <SalesModal
          isOpen={isModalOpen}
          title="Detalhes da Venda"
          onClose={handleCloseModal}
          size="lg"
        >
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onClose={handleCloseModal}
            />
          )}
        </SalesModal>
      </div>

    </AdminLayout>
  );
}
