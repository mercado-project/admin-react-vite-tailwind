import type { Order } from '../../services/orders.service';
import { Eye, CheckCircle, Clock, X, Truck, Package } from 'lucide-react';

interface SalesGridProps {
  sales: Order[]; // Manter nome da prop 'sales' semanticamente na pagina, mas tipado como Order
  onViewDetails: (order: Order) => void;
  isLoading?: boolean;
}

const statusMap = {
  pending: { label: 'Pendente', color: 'yellow', icon: Clock },
  paid: { label: 'Pago', color: 'green', icon: CheckCircle },
  shipped: { label: 'Enviado', color: 'blue', icon: Truck },
  delivered: { label: 'Entregue', color: 'green', icon: Package },
  canceled: { label: 'Cancelado', color: 'red', icon: X },
};

const paymentMethodMap = {
  card: 'Cartão',
  pix: 'PIX',
  boleto: 'Boleto',
};

export default function SalesGrid({
  sales,
  onViewDetails,
  isLoading = false,
}: SalesGridProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium">Nenhuma venda encontrada</p>
          <p className="text-sm text-gray-400">Tente alterar os filtros de data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Itens
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Pagamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sales.map((sale) => {
              const statusInfo = statusMap[sale.status as keyof typeof statusMap] || statusMap.pending;
              const StatusIcon = statusInfo.icon;

              return (
                <tr
                  key={sale.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {sale.customer?.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                    {sale.items?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {paymentMethodMap[sale.paymentMethod as keyof typeof paymentMethodMap] ||
                      sale.paymentMethod}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {statusInfo.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(sale.orderDate)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onViewDetails(sale)}
                        disabled={isLoading}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition disabled:opacity-50"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {sales.map((sale) => {
          const statusInfo = statusMap[sale.status as keyof typeof statusMap] || statusMap.pending;
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={sale.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {sale.customer?.fullName || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sale.items?.length || 0} itens
                  </p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(sale.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Data
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(sale.orderDate)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onViewDetails(sale)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Ver Detalhes
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
