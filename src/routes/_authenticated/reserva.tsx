import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reserva')({
  component: Reserva,
})

function Reserva() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Fundo de Reserva</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Gerencie seu fundo de reserva.</p>
      </div>
    </div>
  )
}
