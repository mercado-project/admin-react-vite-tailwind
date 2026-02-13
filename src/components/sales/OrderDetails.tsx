import type { Order } from '../../services/orders.service';

interface OrderDetailsProps {
    order: Order;
    onClose: () => void;
}

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Cliente</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {order.customer.fullName}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Data do Pedido</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(order.orderDate)}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {order.status === 'paid' ? 'Pago' : order.status}
                    </span>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Método de Pagamento</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {order.paymentMethod}
                    </p>
                </div>
            </div>

            {/* Items List */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Itens do Pedido
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Produto
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Qtd
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Preço un.
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Subtotal
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                        {item.product.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right">
                                        {formatCurrency(item.unitPrice)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                                        {formatCurrency(item.unitPrice * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 dark:bg-gray-800 font-semibold">
                                <td colSpan={3} className="px-6 py-4 text-right text-gray-900 dark:text-gray-100">
                                    Total
                                </td>
                                <td className="px-6 py-4 text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(order.totalAmount)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={onClose}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
