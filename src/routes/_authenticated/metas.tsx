import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/metas')({
  component: Metas,
})

function Metas() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Metas Financeiras</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Configure suas metas financeiras.</p>
      </div>
    </div>
  )
}
