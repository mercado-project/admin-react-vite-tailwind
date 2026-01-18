import { useEffect, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout'
import toast from 'react-hot-toast'
import {
  getAllBanners,
  getAllCmsPages,
  updateBanner,
  deleteBanner,
  updateCmsPage,
  deleteCmsPage,
  createBanner,
  createCmsPage,
  type Banner,
  type CmsPage,
} from '../services/cms.service'

/* ===================== */
/* PAGE                  */
/* ===================== */

export default function CmsPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [pages, setPages] = useState<CmsPage[]>([])
  const [loading, setLoading] = useState(true)
  const [bannerModalOpen, setBannerModalOpen] = useState(false)
  const [pageModalOpen, setPageModalOpen] = useState(false)

  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null)
  const [editingPage, setEditingPage] = useState<Partial<CmsPage> | null>(null)

  /* ===================== */
  /* LOAD DATA             */
  /* ===================== */

  async function loadData() {
    try {
      const [bannersData, pagesData] = await Promise.all([
        getAllBanners(),
        getAllCmsPages(),
      ])

      setBanners(bannersData)
      setPages(pagesData)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar CMS')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  /* ===================== */
  /* BANNERS ACTIONS       */
  /* ===================== */

  async function handleSaveBanner() {
    if (!editingBanner) return

    try {
      // Preparar payload com todos os campos necessários
      const payload: Partial<Banner> = {
        imageUrl: editingBanner.imageUrl || '',
        linkUrl: editingBanner.linkUrl || '',
        active: editingBanner.active !== undefined ? editingBanner.active : true,
      }

      if (editingBanner.id) {
        await updateBanner(editingBanner.id, payload)
        toast.success('Banner atualizado com sucesso')
      } else {
        await createBanner(payload)
        toast.success('Banner criado com sucesso')
      }

      setBannerModalOpen(false)
      setEditingBanner(null)
      loadData()
    } catch (error: any) {
      console.error('Erro ao salvar banner:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao salvar banner'
      toast.error(errorMessage)
    }
  }


  async function handleDeleteBanner(id: number) {
    if (!confirm('Deseja realmente excluir este banner?')) return

    try {
      await deleteBanner(id)
      setBanners(prev => prev.filter(b => b.id !== id))
      toast.success('Banner excluído')
    } catch {
      toast.error('Erro ao excluir banner')
    }
  }

  /* ===================== */
  /* CMS ACTIONS           */
  /* ===================== */

  async function handleSavePage() {
    if (!editingPage) return

    try {
      // Formatar URL para garantir que tenha barra inicial
      let formattedUrl = editingPage.url || ''
      if (formattedUrl && !formattedUrl.startsWith('/')) {
        formattedUrl = '/' + formattedUrl
      }

      // Preparar payload com todos os campos necessários
      const payload: Partial<CmsPage> = {
        title: editingPage.title || '',
        url: formattedUrl,
        content: editingPage.content || '',
        pageType: editingPage.pageType || 'cms',
        metaTitle: editingPage.metaTitle || '',
        metaDescription: editingPage.metaDescription || '',
        bannerImage: editingPage.bannerImage || null,
        active: editingPage.active !== undefined ? editingPage.active : true,
      }

      if (editingPage.id) {
        await updateCmsPage(editingPage.id, payload)
        toast.success('Página atualizada com sucesso')
      } else {
        await createCmsPage(payload)
        toast.success('Página criada com sucesso')
      }

      setPageModalOpen(false)
      setEditingPage(null)
      loadData()
    } catch (error: any) {
      console.error('Erro ao salvar página:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao salvar página'
      toast.error(errorMessage)
    }
  }


  async function handleDeletePage(id: number) {
    if (!confirm('Deseja realmente excluir esta página?')) return

    try {
      await deleteCmsPage(id)
      setPages(prev => prev.filter(p => p.id !== id))
      toast.success('Página excluída')
    } catch {
      toast.error('Erro ao excluir página')
    }
  }

  /* ===================== */
  /* RENDER                */
  /* ===================== */

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Páginas & Banners
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie conteúdos institucionais e banners do site
            </p>
          </div>
        </div>

        {loading && (
          <div className="text-sm text-gray-500">
            Carregando dados...
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* ===================== */}
            {/* BANNERS */}
            {/* ===================== */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <header className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Banners</h2>
                  </div>
                  <p className="text-sm text-gray-500">
                    Banners exibidos no site ({banners.length})
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingBanner({ imageUrl: '', linkUrl: '', active: true })
                    setBannerModalOpen(true)
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                >
                  + Novo Banner
                </button>
              </header>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {banners.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500">Nenhum banner cadastrado</p>
                  </div>
                ) : (
                  banners.map(banner => (
                    <div key={banner.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex gap-4 items-center flex-1 min-w-0">
                          <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shrink-0">
                            <img
                              src={banner.imageUrl}
                              alt="Banner"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="60"%3E%3Crect fill="%23e5e7eb" width="100" height="60"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="10" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {banner.linkUrl || 'Sem link'}
                              </p>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${
                                banner.active 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {banner.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {banner.imageUrl}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setEditingBanner(banner)
                              setBannerModalOpen(true)
                            }}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="px-3 py-1.5 text-xs font-medium border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* ===================== */}
            {/* CMS PAGES */}
            {/* ===================== */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <header className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Páginas CMS</h2>
                  </div>
                  <p className="text-sm text-gray-500">
                    Conteúdos institucionais ({pages.length})
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingPage({
                      title: '',
                      url: '',
                      content: '',
                      pageType: 'cms',
                      metaTitle: '',
                      metaDescription: '',
                      bannerImage: null,
                      active: true,
                    })
                    setPageModalOpen(true)
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                >
                  + Nova Página
                </button>
              </header>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {pages.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500">Nenhuma página cadastrada</p>
                  </div>
                ) : (
                  pages.map(page => (
                    <div key={page.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {page.title}
                            </p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              page.active 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {page.active ? 'Ativa' : 'Inativa'}
                            </span>
                            {page.pageType && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {page.pageType}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            /{page.url}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            {page.bannerImage && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Banner
                              </span>
                            )}
                            {page.metaTitle && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                SEO
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              // Garantir que a URL seja tratada corretamente ao editar (remover barra inicial)
                              setEditingPage({
                                ...page,
                                url: page.url?.replace(/^\//, '') || '',
                              })
                              setPageModalOpen(true)
                            }}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="px-3 py-1.5 text-xs font-medium border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>
        )}
      </div>
      {/* Banner Modal */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingBanner?.id ? 'Editar Banner' : 'Novo Banner'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingBanner?.id ? 'Atualize as informações do banner' : 'Preencha os dados para criar um novo banner'}
                </p>
              </div>
              <button
                onClick={() => {
                  setBannerModalOpen(false)
                  setEditingBanner(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL da Imagem <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={editingBanner?.imageUrl || ''}
                  onChange={e =>
                    setEditingBanner(prev => ({ ...prev!, imageUrl: e.target.value }))
                  }
                />
                {editingBanner?.imageUrl && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <img
                        src={editingBanner.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23e5e7eb" width="400" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não encontrada%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL do Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://exemplo.com/pagina"
                  value={editingBanner?.linkUrl || ''}
                  onChange={e =>
                    setEditingBanner(prev => ({ ...prev!, linkUrl: e.target.value }))
                  }
                />
                <p className="mt-1.5 text-xs text-gray-500">URL para onde o banner redirecionará quando clicado</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    Status
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingBanner?.active ? 'Banner está ativo e visível' : 'Banner está inativo e oculto'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingBanner(prev => ({ ...prev!, active: !prev?.active }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    editingBanner?.active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editingBanner?.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setBannerModalOpen(false)
                  setEditingBanner(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBanner}
                disabled={!editingBanner?.imageUrl || !editingBanner?.linkUrl}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
              >
                {editingBanner?.id ? 'Atualizar' : 'Criar'} Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CMS Page Modal */}
      {pageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingPage?.id ? 'Editar Página CMS' : 'Nova Página CMS'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingPage?.id ? 'Atualize as informações da página' : 'Preencha os dados para criar uma nova página'}
                </p>
              </div>
              <button
                onClick={() => {
                  setPageModalOpen(false)
                  setEditingPage(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Título */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título da Página <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ex: Sobre Nós"
                    value={editingPage?.title || ''}
                    onChange={e =>
                      setEditingPage(prev => ({ ...prev!, title: e.target.value }))
                    }
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-sm text-gray-500">
                      /
                    </span>
                    <input
                      type="text"
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="sobre-nos"
                      value={editingPage?.url?.replace(/^\//, '') || ''}
                      onChange={e =>
                        setEditingPage(prev => ({ ...prev!, url: e.target.value }))
                      }
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">URL amigável (sem espaços ou caracteres especiais)</p>
                </div>

                {/* Tipo de Página */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Página <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editingPage?.pageType || 'cms'}
                    onChange={e =>
                      setEditingPage(prev => ({ ...prev!, pageType: e.target.value }))
                    }
                  >
                    <option value="cms">CMS</option>
                    <option value="page">Página</option>
                    <option value="blog">Blog</option>
                    <option value="landing">Landing Page</option>
                    <option value="faq">FAQ</option>
                    <option value="terms">Termos</option>
                    <option value="privacy">Privacidade</option>
                  </select>
                </div>

                {/* Banner Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL da Imagem do Banner
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://exemplo.com/banner.jpg"
                    value={editingPage?.bannerImage || ''}
                    onChange={e =>
                      setEditingPage(prev => ({ ...prev!, bannerImage: e.target.value || null }))
                    }
                  />
                  {editingPage?.bannerImage && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Preview do Banner:</p>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <img
                          src={editingPage.bannerImage}
                          alt="Banner preview"
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23e5e7eb" width="400" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não encontrada%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Título (SEO)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Título para SEO"
                    value={editingPage?.metaTitle || ''}
                    onChange={e =>
                      setEditingPage(prev => ({ ...prev!, metaTitle: e.target.value }))
                    }
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Recomendado: 50-60 caracteres</p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Descrição (SEO)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Descrição para SEO"
                    value={editingPage?.metaDescription || ''}
                    onChange={e =>
                      setEditingPage(prev => ({ ...prev!, metaDescription: e.target.value }))
                    }
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Recomendado: 150-160 caracteres</p>
                </div>

                {/* Content */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conteúdo da Página <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={12}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm resize-none"
                    placeholder="Digite o conteúdo HTML ou texto da página aqui..."
                    value={editingPage?.content || ''}
                    onChange={e =>
                      setEditingPage(prev => ({ ...prev!, content: e.target.value }))
                    }
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Suporta HTML e texto formatado</p>
                </div>

                {/* Active Toggle */}
                <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                      Status da Página
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {editingPage?.active ? 'Página está ativa e visível' : 'Página está inativa e oculta'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingPage(prev => ({ ...prev!, active: !prev?.active }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      editingPage?.active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editingPage?.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setPageModalOpen(false)
                  setEditingPage(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePage}
                disabled={!editingPage?.title || !editingPage?.url || !editingPage?.content}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
              >
                {editingPage?.id ? 'Atualizar' : 'Criar'} Página
              </button>
            </div>
          </div>
        </div>
      )}



    </AdminLayout>
  )
}
