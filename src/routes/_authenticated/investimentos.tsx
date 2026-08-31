import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/investimentos')({
  component: Investimentos,
})

function Investimentos() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Investimentos</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Controle seus investimentos.</p>
      </div>
    </div>
  )
}
