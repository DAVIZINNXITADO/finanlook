import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-blue-600">FinanLook</h1>
        <p className="text-xl text-gray-600 mb-8">Seu assistente pessoal de finanças</p>
        <div className="space-x-4">
          <Link to="/auth" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}
