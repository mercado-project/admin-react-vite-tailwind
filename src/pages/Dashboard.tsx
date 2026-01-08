import AdminLayout from '../layouts/AdminLayout'
import SalesChart from '../components/SalesChart'

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Expense Overview
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard title="Operational Costs" value="$1,222.75" />
          <StatCard title="Pending Invoices" value="$3,432.75" />
          <StatCard title="Reimbursable Expenses" value="$640.50" />
          <StatCard title="Approved Payments" value="$2,145.30" />
        </div>

        {/* Gráfico grande */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Sales Over Time
          </h3>

          <SalesChart />
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-semibold mt-2 text-gray-800 dark:text-gray-100">
        {value}
      </p>
    </div>
  )
}
