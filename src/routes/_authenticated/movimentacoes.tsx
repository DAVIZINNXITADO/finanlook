import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/movimentacoes')({
  component: Movimentacoes,
})

function Movimentacoes() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Movimentações</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Visualize suas movimentações financeiras.</p>
      </div>
    </div>
  )
}
