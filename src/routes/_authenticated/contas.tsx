import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/contas')({
  component: Contas,
})

function Contas() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contas</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Gerencie suas contas aqui.</p>
      </div>
    </div>
  )
}
