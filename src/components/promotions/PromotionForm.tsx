import { useState, useEffect } from 'react';
import type { Promotion, CreatePromotionDto } from '../../services/promotions.service';
import { getAllProducts } from '../../services/products.service';

interface PromotionFormProps {
  promotion?: Promotion;
  onSubmit: (data: CreatePromotionDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface Product {
  id: number;
  name: string;
}

interface FormDataState {
  productId: number;
  promotionalPrice: string | number;
  startAt: string;
  endAt: string;
  active: boolean;
}

export default function PromotionForm({
  promotion,
  onSubmit,
  onCancel,
  isLoading = false,
}: PromotionFormProps) {
  const [formData, setFormData] = useState<FormDataState>({
    productId: promotion?.product?.id || 0,
    promotionalPrice: promotion?.promotionalPrice ?? '',
    startAt: promotion?.startAt?.split('T')[0] || '',
    endAt: promotion?.endAt?.split('T')[0] || '',
    active: promotion?.active ?? true,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) newErrors.productId = 'Produto é obrigatório';
    const priceValue = parseFloat(String(formData.promotionalPrice));
    if (!formData.promotionalPrice || isNaN(priceValue) || priceValue <= 0)
      newErrors.promotionalPrice = 'Preço promocional deve ser maior que 0';
    if (!formData.startAt) newErrors.startAt = 'Data inicial é obrigatória';
    if (!formData.endAt) newErrors.endAt = 'Data final é obrigatória';

    if (formData.startAt && formData.endAt) {
      const start = new Date(formData.startAt);
      const end = new Date(formData.endAt);
      if (start >= end) {
        newErrors.endAt = 'Data final deve ser após a data inicial';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Converte price para número antes de enviar
      const dataToSubmit: CreatePromotionDto = {
        ...formData,
        promotionalPrice: parseFloat(String(formData.promotionalPrice)),
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
    
    if (type === 'number' && name === 'promotionalPrice') {
      // Para o preço, aceita vazio ou valores válidos
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value) || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : type === 'number'
              ? parseFloat(value) || 0
              : value,
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
      {/* Product Selection */}
      <div>
        <label htmlFor="productId" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
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

      {/* Promotional Price */}
      <div>
        <label
          htmlFor="promotionalPrice"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          Preço Promocional (R$) *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium">
            R$
          </span>
          <input
            id="promotionalPrice"
            type="number"
            name="promotionalPrice"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={formData.promotionalPrice}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.promotionalPrice
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        </div>
        {errors.promotionalPrice && (
          <p className="mt-1 text-sm text-red-600">{errors.promotionalPrice}</p>
        )}
      </div>

      {/* Start Date */}
      <div>
        <label
          htmlFor="startAt"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          Data Inicial *
        </label>
        <input
          id="startAt"
          type="date"
          name="startAt"
          value={formData.startAt}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.startAt ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.startAt && (
          <p className="mt-1 text-sm text-red-600">{errors.startAt}</p>
        )}
      </div>

      {/* End Date */}
      <div>
        <label
          htmlFor="endAt"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          Data Final *
        </label>
        <input
          id="endAt"
          type="date"
          name="endAt"
          value={formData.endAt}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.endAt ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.endAt && (
          <p className="mt-1 text-sm text-red-600">{errors.endAt}</p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-3">
        <input
          id="active"
          type="checkbox"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="active"
          className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
        >
          Ativa
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {isLoading ? 'Salvando...' : promotion ? 'Atualizar' : 'Criar Promoção'}
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
