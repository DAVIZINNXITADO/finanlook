import { createFileRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">FinanLook</h1>
            <div className="flex gap-6">
              <Link to="/bem-vindo" className="text-gray-600 hover:text-gray-900">Bem-vindo</Link>
              <Link to="/visao-geral" className="text-gray-600 hover:text-gray-900">Visão Geral</Link>
              <Link to="/contas" className="text-gray-600 hover:text-gray-900">Contas</Link>
              <Link to="/movimentacoes" className="text-gray-600 hover:text-gray-900">Movimentações</Link>
              <Link to="/investimentos" className="text-gray-600 hover:text-gray-900">Investimentos</Link>
              <Link to="/metas" className="text-gray-600 hover:text-gray-900">Metas</Link>
              <Link to="/reserva" className="text-gray-600 hover:text-gray-900">Reserva</Link>
              <Link to="/organizar-salario" className="text-gray-600 hover:text-gray-900">Organizar Salário</Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
