import { useState, useEffect } from 'react';
import { Search, Plus, Trash, User, Package, Check } from 'lucide-react';
import { searchCustomers, type Customer } from '../../services/customers.service';
import { searchProducts, type Product } from '../../services/products.service';
import { createOrder, type PaymentMethod, type OrderStatus } from '../../services/orders.service';

interface NewOrderFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function NewOrderForm({ onSuccess, onCancel }: NewOrderFormProps) {
    // Customer State
    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

    // Product Search State
    const [productQuery, setProductQuery] = useState('');
    const [productResults, setProductResults] = useState<Product[]>([]);

    // Cart State
    const [items, setItems] = useState<{ product: Product; quantity: number }[]>([]);
    const [quantityToAdd, setQuantityToAdd] = useState(1);
    const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | null>(null);

    // Order Details State
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
    const [status, setStatus] = useState<OrderStatus>('pending');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounce Customer Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (customerQuery.length >= 2) {
                setIsSearchingCustomers(true);
                try {
                    const results = await searchCustomers(customerQuery);
                    setCustomerResults(results);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSearchingCustomers(false);
                }
            } else {
                setCustomerResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [customerQuery]);

    // Debounce Product Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (productQuery.length >= 2) {
                try {
                    const results = await searchProducts(productQuery);
                    setProductResults(results);
                } catch (err) {
                    console.error(err);
                }
            } else {
                setProductResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [productQuery]);

    const handleAddProduct = () => {
        if (!selectedProductToAdd) return;

        // Check if already exists
        const existingItemIndex = items.findIndex(item => item.product.id === selectedProductToAdd.id);
        if (existingItemIndex >= 0) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += quantityToAdd;
            setItems(newItems);
        } else {
            setItems([...items, { product: selectedProductToAdd, quantity: quantityToAdd }]);
        }

        // Reset selection
        setSelectedProductToAdd(null);
        setProductQuery('');
        setProductResults([]);
        setQuantityToAdd(1);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => {
            // Assuming product has a price, though the type definition in products.service.ts
            // shows prices as an array `prices?: { price: string }[]`.
            // We'll try to get the first price or default to 0.
            const priceStr = item.product.prices?.[0]?.price || '0';
            const price = parseFloat(priceStr);
            return acc + (price * item.quantity);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) {
            setError('Selecione um cliente.');
            return;
        }
        if (items.length === 0) {
            setError('Adicione pelo menos um produto.');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            await createOrder({
                customerId: selectedCustomer.id,
                // Using 'pix' and 'pending' from state
                paymentMethod,
                status,
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                }))
            });
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Erro ao criar pedido. Verifique os dados e tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerQuery('');
        setCustomerResults([]);
    };

    const selectProduct = (product: Product) => {
        setSelectedProductToAdd(product);
        setProductQuery(product.name);
        setProductResults([]);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Customer Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cliente
                    </label>
                    {selectedCustomer ? (
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.fullName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.user?.email || selectedCustomer.phone}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCustomer(null)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                                Alterar
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar cliente (nome, email...)"
                                    value={customerQuery}
                                    onChange={(e) => setCustomerQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                />
                            </div>
                            {/* Customer Results Dropdown */}
                            {!selectedCustomer && customerResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {customerResults.map((customer) => (
                                        <button
                                            type="button"
                                            key={customer.id}
                                            onClick={() => selectCustomer(customer)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col"
                                        >
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{customer.fullName}</span>
                                            <span className="text-sm text-gray-500">{customer.user?.email || customer.phone || 'Sem contato'}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {!selectedCustomer && isSearchingCustomers && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 p-2 text-center text-sm text-gray-500">
                                    Buscando...
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Product Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Adicionar Produtos
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar produto..."
                                value={productQuery}
                                onChange={(e) => {
                                    setProductQuery(e.target.value);
                                    if (selectedProductToAdd && e.target.value !== selectedProductToAdd.name) {
                                        setSelectedProductToAdd(null);
                                    }
                                }}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                            />
                            {/* Product Results Dropdown */}
                            {!selectedProductToAdd && productResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {productResults.map((product) => (
                                        <button
                                            type="button"
                                            key={product.id}
                                            onClick={() => selectProduct(product)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                {product.images && product.images.length > 0 && (
                                                    <img src={product.images[0].image_url} alt={product.name} className="w-8 h-8 rounded object-cover" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                                                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                R$ {product.prices?.[0]?.price ? parseFloat(product.prices[0].price).toFixed(2) : '0.00'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input
                            type="number"
                            min="1"
                            value={quantityToAdd}
                            onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 1)}
                            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            type="button"
                            onClick={handleAddProduct}
                            disabled={!selectedProductToAdd}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar
                        </button>
                    </div>
                </div>

                {/* Items List */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase flex justify-between">
                        <span>Produto</span>
                        <span className="mr-12">Qtd / Subtotal</span>
                    </div>
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p>Nenhum produto adicionado</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {items.map((item, index) => {
                                const price = parseFloat(item.product.prices?.[0]?.price || '0');
                                return (
                                    <li key={`${item.product.id}-${index}`} className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            {item.product.images?.[0] && (
                                                <img src={item.product.images[0].image_url} alt="" className="w-10 h-10 rounded object-cover border border-gray-200 dark:border-gray-700" />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                                                <p className="text-sm text-gray-500">Unit: R$ {price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">x{item.quantity}</p>
                                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">R$ {(price * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                    {items.length > 0 && (
                        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">R$ {calculateTotal().toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Método de Pagamento
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        >
                            <option value="pix">Pix</option>
                            <option value="card">Cartão de Crédito</option>
                            <option value="boleto">Boleto</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status Inicial
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as OrderStatus)}
                            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        >
                            <option value="pending">Pendente (Pending)</option>
                            <option value="paid">Pago (Paid)</option>
                            <option value="shipped">Enviado (Shipped)</option>
                            <option value="delivered">Entregue (Delivered)</option>
                            <option value="canceled">Cancelado (Canceled)</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? 'Gerando...' : (
                        <>
                            <Check className="w-4 h-4" />
                            Criar Pedido
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
