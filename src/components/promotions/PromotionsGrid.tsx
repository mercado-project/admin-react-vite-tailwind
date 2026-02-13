import type { Promotion } from '../../services/promotions.service';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface PromotionsGridProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function PromotionsGrid({
  promotions,
  onEdit,
  onDelete,
  isLoading = false,
}: PromotionsGridProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isPromotionActive = (active: boolean) => {
    return active;
  };

  if (promotions.length === 0) {
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
          <p className="text-lg font-medium">Nenhuma promoção encontrada</p>
          <p className="text-sm text-gray-400">
            Comece criando uma nova promoção
          </p>
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
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Preço Promocional
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {promotions.map((promotion) => {
              const isActive = isPromotionActive(promotion.active);

              return (
                <tr
                  key={promotion.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {promotion.product?.name || 'Produto removido'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-semibold">
                    {formatCurrency(promotion.promotionalPrice)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      {formatDate(promotion.startAt)} a{' '}
                      {formatDate(promotion.endAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        <CheckCircle className="w-4 h-4" />
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        <XCircle className="w-4 h-4" />
                        Inativa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(promotion)}
                        disabled={isLoading}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition disabled:opacity-50"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(promotion.id)}
                        disabled={isLoading}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
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
        {promotions.map((promotion) => {
          const isActive = isPromotionActive(
            promotion.active
          );

          return (
            <div
              key={promotion.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {promotion.product?.name || 'Produto removido'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(promotion.startAt)} a{' '}
                    {formatDate(promotion.endAt)}
                  </p>
                </div>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    <CheckCircle className="w-3 h-3" />
                    Ativa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    <XCircle className="w-3 h-3" />
                    Inativa
                  </span>
                )}
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Preço Promocional
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(promotion.promotionalPrice)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(promotion)}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(promotion.id)}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
