import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/visao-geral')({
  component: VisaoGeral,
})

function VisaoGeral() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Visão Geral</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Saldo Total</h3>
          <p className="text-2xl font-bold text-blue-600">R$ 0,00</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Receitas</h3>
          <p className="text-2xl font-bold text-green-600">R$ 0,00</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Despesas</h3>
          <p className="text-2xl font-bold text-red-600">R$ 0,00</p>
        </div>
      </div>
    </div>
  )
}
