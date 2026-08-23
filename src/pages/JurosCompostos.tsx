import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumberInput } from '../components/NumberInput';
import { RadioGroup } from '../components/RadioGroup';
import { ResultCard } from '../components/ResultCard';
import { DataTable } from '../components/DataTable';
import { calcularJurosCompostos } from '../calculators/compound-interest';
import { InputJurosCompostos } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../lib/utils';

export function JurosCompostos() {
  const [valorInicial, setValorInicial] = useState(10000);
  const [aporteMensal, setAporteMensal] = useState(500);
  const [taxaJuros, setTaxaJuros] = useState(1);
  const [taxaPeriodicidade, setTaxaPeriodicidade] = useState<'mensal' | 'anual'>('mensal');
  const [periodo, setPeriodo] = useState(10);
  const [periodoUnidade, setPeriodoUnidade] = useState<'meses' | 'anos'>('anos');
  const [inflacaoPeriodo, setInflacaoPeriodo] = useState<number | undefined>(undefined);

  const input: InputJurosCompostos = useMemo(
    () => ({
      valorInicial,
      aporteMensal,
      taxaJuros,
      taxaPeriodicidade,
      periodo,
      periodoUnidade,
      inflacaoPeriodo,
    }),
    [valorInicial, aporteMensal, taxaJuros, taxaPeriodicidade, periodo, periodoUnidade, inflacaoPeriodo]
  );

  const resultado = useMemo(() => calcularJurosCompostos(input), [input]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Juros Compostos</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calculadora de Juros Compostos</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Parâmetros</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor inicial
                </label>
                <CurrencyInput value={valorInicial} onChange={setValorInicial} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aporte mensal
                </label>
                <CurrencyInput value={aporteMensal} onChange={setAporteMensal} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa de juros
                </label>
                <NumberInput value={taxaJuros} onChange={setTaxaJuros} suffix="%" />
                <div className="mt-2">
                  <RadioGroup
                    name="taxaPeriodicidade"
                    options={[
                      { value: 'mensal', label: 'Mensal' },
                      { value: 'anual', label: 'Anual' },
                    ]}
                    value={taxaPeriodicidade}
                    onChange={(v) => setTaxaPeriodicidade(v as 'mensal' | 'anual')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <NumberInput value={periodo} onChange={setPeriodo} />
                <div className="mt-2">
                  <RadioGroup
                    name="periodoUnidade"
                    options={[
                      { value: 'meses', label: 'Meses' },
                      { value: 'anos', label: 'Anos' },
                    ]}
                    value={periodoUnidade}
                    onChange={(v) => setPeriodoUnidade(v as 'meses' | 'anos')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inflação no período (opcional)
                </label>
                <NumberInput
                  value={inflacaoPeriodo || 0}
                  onChange={(v) => setInflacaoPeriodo(v > 0 ? v : undefined)}
                  suffix="%"
                />
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resultado</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard
                  label="Valor final"
                  value={resultado.resumo.valorFinalNominal}
                  highlight
                />
                <ResultCard label="Total investido" value={resultado.resumo.totalInvestido} />
                <ResultCard label="Total em juros" value={resultado.resumo.totalJuros} />
                {resultado.resumo.valorReal !== undefined && (
                  <ResultCard label="Valor real (ajustado)" value={resultado.resumo.valorReal} />
                )}
              </div>
            </div>

            {/* Gráfico */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Evolução</h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={resultado.evolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10 }} label={{ value: 'Mês', position: 'insideBottom', offset: -5 }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} width={100} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Saldo total"
                  />
                  <Line
                    type="monotone"
                    dataKey="aporteAcumulado"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    name="Total investido"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Evolução Mensal</h2>
              <DataTable data={resultado.evolucaoMensal} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
