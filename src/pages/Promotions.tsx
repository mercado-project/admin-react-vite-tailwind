import { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../layouts/AdminLayout';import type {
  Promotion,
  CreatePromotionDto,
} from '../services/promotions.service';
import promotionsService from '../services/promotions.service';
import PromotionModal from '../components/promotions/PromotionModal';
import PromotionForm from '../components/promotions/PromotionForm';
import PromotionsGrid from '../components/promotions/PromotionsGrid';

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load promotions
  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await promotionsService.getAllPromotions();
      setPromotions(data);
      setFilteredPromotions(data);
    } catch (err) {
      setError('Erro ao carregar promoções. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  // Filter promotions by search term
  useEffect(() => {
    const filtered = promotions.filter((promotion) =>
      promotion.product?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredPromotions(filtered);
  }, [searchTerm, promotions]);

  // Open modal for creating new promotion
  const handleOpenCreate = () => {
    setSelectedPromotion(undefined);
    setIsModalOpen(true);
  };

  // Open modal for editing promotion
  const handleOpenEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPromotion(undefined);
  };

  // Handle form submission
  const handleSubmit = async (data: CreatePromotionDto) => {
    try {
      setIsSaving(true);
      setError(null);

      if (selectedPromotion) {
        // Update existing promotion
        const updated = await promotionsService.updatePromotion(
          selectedPromotion.id,
          data
        );
        setPromotions((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        toast.success('Promoção atualizada com sucesso!');
      } else {
        // Create new promotion
        const newPromotion = await promotionsService.createPromotion(data);
        setPromotions((prev) => [newPromotion, ...prev]);
        toast.success('Promoção criada com sucesso!');
      }

      handleCloseModal();
    } catch (err) {
      const errorMsg = selectedPromotion
        ? 'Erro ao atualizar promoção. Tente novamente.'
        : 'Erro ao criar promoção. Tente novamente.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta promoção?')) return;

    try {
      setIsSaving(true);
      setError(null);
      await promotionsService.deletePromotion(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      toast.success('Promoção deletada com sucesso!');
    } catch (err) {
      const errorMsg = 'Erro ao deletar promoção. Tente novamente.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Promoções
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerenciar promoções dos produtos
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={isLoading || isSaving}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Nova Promoção
        </button>
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
          placeholder="Buscar por produto..."
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
          <PromotionsGrid
            promotions={filteredPromotions}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            isLoading={isSaving}
          />
        </div>
      )}

      {/* Modal */}
      <PromotionModal
        isOpen={isModalOpen}
        title={
          selectedPromotion
            ? 'Editar Promoção'
            : 'Criar Nova Promoção'
        }
        onClose={handleCloseModal}
        size="md"
      >
        <PromotionForm
          promotion={selectedPromotion}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </PromotionModal>
      </div>
    </AdminLayout>
  );
}
