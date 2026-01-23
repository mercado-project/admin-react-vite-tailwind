import { useEffect, useState, useMemo } from 'react'
import AdminLayout from '../layouts/AdminLayout'
import {
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
  type User as userType,
  UserRole,
} from '../services/users.service'
import Modal from '../components/Modal'
import {
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  Shield,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState<userType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<userType | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: UserRole.CUSTOMER as UserRole,
  })
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      showNotification('error', 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase()
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        u.customer?.fullName.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    )
  }, [users, search])

  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  function handleOpenModal(user?: userType) {
    if (user) {
      setEditingUser(user)
      setFormData({
        email: user.email,
        password: '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        email: '',
        password: '',
        role: UserRole.CUSTOMER,
      })
    }
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingUser(null)
    setFormData({
      email: '',
      password: '',
      role: UserRole.CUSTOMER,
    })
  }

  async function handleSave() {
    try {
      setSaving(true)
      if (editingUser) {
        const payload: any = {
          email: formData.email,
          role: formData.role,
        }
        if (formData.password) {
          payload.password = formData.password
        }
        await updateUser(editingUser.id, payload)
        showNotification('success', 'Usuário atualizado com sucesso!')
      } else {
        if (!formData.password) {
          showNotification('error', 'A senha é obrigatória para novos usuários')
          return
        }
        await createUser(formData)
        showNotification('success', 'Usuário criado com sucesso!')
      }
      handleCloseModal()
      await loadUsers()
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      showNotification(
        'error',
        error.response?.data?.message || 'Erro ao salvar usuário'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      await deleteUser(id)
      showNotification('success', 'Usuário excluído com sucesso!')
      await loadUsers()
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      showNotification(
        'error',
        error.response?.data?.message || 'Erro ao excluir usuário'
      )
    }
  }

  const totalUsers = users.length
  const adminUsers = users.filter((u) => u.role === UserRole.ADMIN).length
  const customerUsers = users.filter((u) => u.role === UserRole.CUSTOMER).length
  const usersWithCustomer = users.filter((u) => u.customer).length

  return (
    <AdminLayout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Usuários
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie todos os usuários do sistema
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={UsersIcon}
            label="Total de Usuários"
            value={totalUsers}
            color="blue"
          />
          <StatCard
            icon={Shield}
            label="Administradores"
            value={adminUsers}
            color="purple"
          />
          <StatCard
            icon={User}
            label="Clientes"
            value={customerUsers}
            color="green"
          />
          <StatCard
            icon={CheckCircle2}
            label="Com Perfil Completo"
            value={usersWithCustomer}
            color="orange"
          />
        </div>

        {/* SEARCH BAR */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email, nome ou função..."
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Função
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
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.customer?.fullName || (
                          <span className="text-gray-400 italic">Sem perfil</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === UserRole.ADMIN
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          }`}
                        >
                          {user.role === UserRole.ADMIN ? 'Admin' : 'Cliente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
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
              {filteredUsers.length === 0 && (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  {search ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL */}
        <Modal
          title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          open={modalOpen}
          onClose={handleCloseModal}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="usuario@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Função
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={UserRole.CUSTOMER}>Cliente</option>
                <option value={UserRole.ADMIN}>Administrador</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
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
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    purple:
      'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
    orange:
      'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400',
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
