import { Link } from 'react-router-dom';

const calculadoras = [
  {
    path: '/juros-compostos',
    icon: '📈',
    nome: 'Juros Compostos',
    descricao: 'Simule o crescimento do seu dinheiro com aportes mensais',
  },
];

export function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Calculadora Nobre</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculadoras.map((calc) => (
            <Link
              key={calc.path}
              to={calc.path}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{calc.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{calc.nome}</h2>
              <p className="text-gray-600">{calc.descricao}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
