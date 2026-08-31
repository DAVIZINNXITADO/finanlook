import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/bem-vindo')({
  component: BemVindo,
})

function BemVindo() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bem-vindo ao FinanLook</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Comece a gerenciar suas finanças aqui.</p>
      </div>
    </div>
  )
}
