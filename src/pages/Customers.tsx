import { useEffect, useState, useMemo } from 'react'
import AdminLayout from '../layouts/AdminLayout'
import {
  getAllCustomers,
  updateCustomer,
  createCustomer,
  deleteCustomer,
  type Customer,
} from '../services/customers.service'
import Modal from '../components/Modal'
import {
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from 'lucide-react'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    birthDate: '',
    phone: '',
    email: '',
    password: '',
  })
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  async function loadCustomers() {
    try {
      setLoading(true)
      const data = await getAllCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      showNotification('error', 'Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filteredCustomers = useMemo(() => {
    const term = search.toLowerCase()
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.cpf.includes(term) ||
        c.phone.includes(term) ||
        c.user?.email.toLowerCase().includes(term)
    )
  }, [customers, search])

  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  function formatCPF(cpf: string) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  function formatPhone(phone: string) {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
  }

  function handleOpenModal(customer?: Customer) {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        fullName: customer.fullName,
        cpf: customer.cpf,
        birthDate: customer.birthDate
          ? new Date(customer.birthDate).toISOString().split('T')[0]
          : '',
        phone: customer.phone,
        email: '',
        password: '',
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        fullName: '',
        cpf: '',
        birthDate: '',
        phone: '',
        email: '',
        password: '',
      })
    }
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingCustomer(null)
    setFormData({
      fullName: '',
      cpf: '',
      birthDate: '',
      phone: '',
      email: '',
      password: '',
    })
  }

  async function handleSave() {
    try {
      setSaving(true)
      
      // Validação de campos obrigatórios
      if (!formData.fullName.trim()) {
        showNotification('error', 'Nome completo é obrigatório')
        setSaving(false)
        return
      }
      
      const cpfClean = formData.cpf.replace(/\D/g, '')
      if (cpfClean.length !== 11) {
        showNotification('error', 'CPF deve ter 11 dígitos')
        setSaving(false)
        return
      }
      
      const phoneClean = formData.phone.replace(/\D/g, '')
      if (!phoneClean || phoneClean.length < 10 || phoneClean.length > 11) {
        showNotification('error', 'Telefone deve ter 10 ou 11 dígitos')
        setSaving(false)
        return
      }

      // Ao criar novo cliente, email e password são obrigatórios
      if (!editingCustomer) {
        if (!formData.email.trim()) {
          showNotification('error', 'Email é obrigatório para criar novo cliente')
          setSaving(false)
          return
        }
        if (!formData.password.trim()) {
          showNotification('error', 'Senha é obrigatória para criar novo cliente')
          setSaving(false)
          return
        }
        if (formData.password.length < 8) {
          showNotification('error', 'Senha deve ter no mínimo 8 caracteres')
          setSaving(false)
          return
        }
      }

      const payload: any = {
        fullName: formData.fullName.trim(),
        cpf: cpfClean,
        phone: phoneClean,
        ...(formData.birthDate && { birthDate: formData.birthDate }),
      }

      // Se é novo cliente, adicionar dados do usuário
      if (!editingCustomer) {
        payload.email = formData.email.trim()
        payload.password = formData.password
      }

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload)
        showNotification('success', 'Cliente atualizado com sucesso!')
      } else {
        await createCustomer(payload)
        showNotification('success', 'Cliente criado com sucesso!')
      }
      handleCloseModal()
      await loadCustomers()
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error)
      showNotification(
        'error',
        error.response?.data?.message || 'Erro ao salvar cliente'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      await deleteCustomer(id)
      showNotification('success', 'Cliente excluído com sucesso!')
      await loadCustomers()
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error)
      showNotification(
        'error',
        error.response?.data?.message || 'Erro ao excluir cliente'
      )
    }
  }

  const totalCustomers = customers.length
  const customersWithUser = customers.filter((c) => c.user).length
  const recentCustomers = customers.filter(
    (c) =>
      new Date(c.createdAt).getTime() >
      new Date().setDate(new Date().getDate() - 30)
  ).length

  return (
    <AdminLayout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Clientes
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie todos os clientes do sistema
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Novo Cliente
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={UsersIcon}
            label="Total de Clientes"
            value={totalCustomers}
            color="blue"
          />
          <StatCard
            icon={Mail}
            label="Com Conta de Acesso"
            value={customersWithUser}
            color="green"
          />
          <StatCard
            icon={Calendar}
            label="Novos (30 dias)"
            value={recentCustomers}
            color="purple"
          />
        </div>

        {/* SEARCH BAR */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF, telefone ou email..."
            className="
              w-full pl-10 pr-4 py-2.5
              border border-gray-300 dark:border-gray-700 rounded-lg
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-white
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Nome Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      CPF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Data de Criação
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">
                              {customer.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {formatCPF(customer.cpf)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {formatPhone(customer.phone)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.user?.email || (
                          <span className="text-gray-400 italic">Sem conta</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(customer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL */}
        <Modal
          title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
          open={modalOpen}
          onClose={handleCloseModal}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="João da Silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CPF <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {formData.cpf.length > 0 && ` (${formData.cpf.replace(/\D/g, '').length}/11)`}
                </span>
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 11) {
                    const formatted = value
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d{2})$/, '$1-$2')
                    setFormData({ ...formData, cpf: formatted })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  formData.cpf.replace(/\D/g, '').length === 11 && formData.cpf.length > 0
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
                }`}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {formData.phone.length > 0 && ` (${formData.phone.replace(/\D/g, '').length}/10-11)`}
                </span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 11) {
                    let formatted = ''
                    if (value.length <= 2) {
                      formatted = value
                    } else if (value.length <= 6) {
                      formatted = value.replace(/(\d{2})(\d+)/, '($1) $2')
                    } else {
                      formatted = value.replace(/(\d{2})(\d{4,5})(\d+)/, '($1) $2-$3')
                    }
                    setFormData({ ...formData, phone: formatted })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  formData.phone.replace(/\D/g, '').length >= 10 && formData.phone.length > 0
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
                }`}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>

            {!editingCustomer && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cliente@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Senha <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      {formData.password.length > 0 && ` (${formData.password.length}/min 8)`}
                    </span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                      formData.password.length >= 8 && formData.password.length > 0
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !formData.fullName.trim() ||
                  formData.cpf.replace(/\D/g, '').length !== 11 ||
                  formData.phone.replace(/\D/g, '').length < 10 ||
                  (!editingCustomer && (!formData.email.trim() || formData.password.length < 8))
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

        {/* NOTIFICATION */}
        {notification && (
          <div
            className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                notification.type === 'success'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}
            >
              {notification.message}
            </span>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

/* ===================== */
/* StatCard Component    */
/* ===================== */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: number
  color: 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    purple:
      'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
  }

  return (
    <div
      className={`p-4 rounded-lg border ${colorClasses[color]} flex items-center gap-4`}
    >
      <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs font-medium opacity-80">{label}</div>
      </div>
    </div>
  )
}
