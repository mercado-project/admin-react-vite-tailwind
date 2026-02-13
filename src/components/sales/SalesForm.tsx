import { useState, useEffect } from 'react';
import type { Sale, CreateSaleDto } from '../../services/sales.service';
import type { Customer } from '../../services/customers.service';
import { getAllCustomers } from '../../services/customers.service';
import { getAllProducts } from '../../services/products.service';

interface SalesFormProps {
  sale?: Sale;
  onSubmit: (data: CreateSaleDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface Product {
  id: number;
  name: string;
}

interface FormDataState {
  customerId: number;
  productId: number;
  quantity: number;
  unitPrice: string | number;
  paymentMethod: 'card' | 'pix' | 'boleto';
  orderId?: number;
}

export default function SalesForm({
  sale,
  onSubmit,
  onCancel,
  isLoading = false,
}: SalesFormProps) {
  const [formData, setFormData] = useState<FormDataState>({
    customerId: sale?.customer?.id || 0,
    productId: sale?.product?.id || 0,
    quantity: sale?.quantity || 1,
    unitPrice: sale?.unitPrice ?? '',
    paymentMethod: (sale?.paymentMethod as 'card' | 'pix' | 'boleto') || 'card',
    orderId: sale?.order?.id,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, productsData] = await Promise.all([
          getAllCustomers(),
          getAllProducts(),
        ]);
        setCustomers(customersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) newErrors.customerId = 'Cliente é obrigatório';
    if (!formData.productId) newErrors.productId = 'Produto é obrigatório';
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = 'Quantidade deve ser maior que 0';
    const priceValue = parseFloat(String(formData.unitPrice));
    if (!formData.unitPrice || isNaN(priceValue) || priceValue <= 0)
      newErrors.unitPrice = 'Preço deve ser maior que 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const dataToSubmit: CreateSaleDto = {
        ...formData,
        unitPrice: parseFloat(String(formData.unitPrice)),
      };
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number' && name === 'unitPrice') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value) || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === 'number' ? (value === '' ? 0 : parseFloat(value) || 0) : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer */}
      <div>
        <label
          htmlFor="customerId"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          Cliente *
        </label>
        <select
          id="customerId"
          name="customerId"
          value={formData.customerId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.customerId
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <option value={0}>Selecione um cliente</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.fullName}
            </option>
          ))}
        </select>
        {errors.customerId && (
          <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
        )}
      </div>

      {/* Product */}
      <div>
        <label
          htmlFor="productId"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          Produto *
        </label>
        <select
          id="productId"
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.productId
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <option value={0}>Selecione um produto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        {errors.productId && (
          <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          Quantidade *
        </label>
        <input
          id="quantity"
          type="number"
          name="quantity"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.quantity
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
        )}
      </div>

      {/* Unit Price */}
      <div>
        <label
          htmlFor="unitPrice"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          Preço Unitário (R$) *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium">
            R$
          </span>
          <input
            id="unitPrice"
            type="number"
            name="unitPrice"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.unitPrice
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        </div>
        {errors.unitPrice && (
          <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label
          htmlFor="paymentMethod"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          Método de Pagamento *
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          <option value="card">Cartão</option>
          <option value="pix">PIX</option>
          <option value="boleto">Boleto</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {isLoading ? 'Salvando...' : sale ? 'Atualizar' : 'Criar Venda'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
