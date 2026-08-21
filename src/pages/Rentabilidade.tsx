import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumberInput } from '../components/NumberInput';
import { RadioGroup } from '../components/RadioGroup';
import { ResultCard } from '../components/ResultCard';
import { ScenarioTabs } from '../components/ScenarioTabs';
import { calcularRentabilidade } from '../calculators/retirement';
import { InputRentabilidade } from '../types';
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

export function Rentabilidade() {
  const [patrimonio, setPatrimonio] = useState(500000);
  const [taxaJuros, setTaxaJuros] = useState(0.5);
  const [taxaPeriodicidade, setTaxaPeriodicidade] = useState<'mensal' | 'anual'>('mensal');
  const [inflacao, setInflacao] = useState(0.3);
  const [inflacaoPeriodicidade, setInflacaoPeriodicidade] = useState<'mensal' | 'anual'>('mensal');
  const [periodo, setPeriodo] = useState(30);
  const [periodoUnidade, setPeriodoUnidade] = useState<'meses' | 'anos'>('anos');
  const [saqueDesejado, setSaqueDesejado] = useState<number | undefined>(undefined);
  const [cenarioSelecionado, setCenarioSelecionado] = useState('preservar');

  const input: InputRentabilidade = useMemo(
    () => ({
      patrimonio,
      taxaJuros,
      taxaPeriodicidade,
      inflacao,
      inflacaoPeriodicidade,
      periodo,
      periodoUnidade,
      saqueDesejado,
    }),
    [patrimonio, taxaJuros, taxaPeriodicidade, inflacao, inflacaoPeriodicidade, periodo, periodoUnidade, saqueDesejado]
  );

  const resultado = useMemo(() => calcularRentabilidade(input), [input]);

  const dadosGrafico = useMemo(() => {
    const maxMeses = Math.max(
      resultado.evolucaoMensal.preservar.length,
      resultado.evolucaoMensal.consumirNominal.length,
      resultado.evolucaoMensal.consumirReal.length
    );

    return Array.from({ length: maxMeses }, (_, i) => ({
      mes: i + 1,
      preservar: resultado.evolucaoMensal.preservar[i]?.saldoNominal || 0,
      consumirNominal: resultado.evolucaoMensal.consumirNominal[i]?.saldoNominal || 0,
      consumirReal: resultado.evolucaoMensal.consumirReal[i]?.saldoNominal || 0,
    }));
  }, [resultado]);

  const dadosTabela = useMemo(() => {
    if (cenarioSelecionado === 'preservar') return resultado.evolucaoMensal.preservar;
    if (cenarioSelecionado === 'consumirNominal') return resultado.evolucaoMensal.consumirNominal;
    return resultado.evolucaoMensal.consumirReal;
  }, [cenarioSelecionado, resultado]);

  const taxaReal = useMemo(() => {
    const taxaMensal = taxaPeriodicidade === 'anual'
      ? Math.pow(1 + taxaJuros / 100, 1 / 12) - 1
      : taxaJuros / 100;
    const inflacaoMensal = inflacaoPeriodicidade === 'anual'
      ? Math.pow(1 + inflacao / 100, 1 / 12) - 1
      : inflacao / 100;
    return ((1 + taxaMensal) / (1 + inflacaoMensal) - 1) * 100;
  }, [taxaJuros, taxaPeriodicidade, inflacao, inflacaoPeriodicidade]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Rentabilidade</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calculadora de Rentabilidade e Aposentadoria</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Parâmetros</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patrimônio acumulado
                </label>
                <CurrencyInput value={patrimonio} onChange={setPatrimonio} />
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
                  Inflação
                </label>
                <NumberInput value={inflacao} onChange={setInflacao} suffix="%" />
                <div className="mt-2">
                  <RadioGroup
                    name="inflacaoPeriodicidade"
                    options={[
                      { value: 'mensal', label: 'Mensal' },
                      { value: 'anual', label: 'Anual' },
                    ]}
                    value={inflacaoPeriodicidade}
                    onChange={(v) => setInflacaoPeriodicidade(v as 'mensal' | 'anual')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período de resgate
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
                  Saque desejado (opcional)
                </label>
                <CurrencyInput
                  value={saqueDesejado || 0}
                  onChange={(v) => setSaqueDesejado(v > 0 ? v : undefined)}
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Taxa real</div>
                <div className={`text-lg font-semibold ${taxaReal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {taxaReal.toFixed(2)}% ao mês
                </div>
                {taxaReal < 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    Atenção: juros menores que a inflação. Patrimônio deteriora em termos reais.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {saqueDesejado ? 'Duração do Patrimônio' : 'Quanto Posso Sacar?'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {saqueDesejado ? (
                  <>
                    <ResultCard
                      label="Preservar"
                      value={resultado.cenarios.consumirNominal.duracaoMeses >= 1200 ? Infinity : resultado.cenarios.consumirNominal.duracaoMeses}
                      highlight={resultado.cenarios.consumirNominal.duracaoMeses >= 1200}
                    />
                    <ResultCard
                      label="Consumir (nominal)"
                      value={resultado.cenarios.consumirNominal.duracaoMeses}
                    />
                    <ResultCard
                      label="Consumir (real)"
                      value={resultado.cenarios.consumirReal.duracaoMeses}
                    />
                  </>
                ) : (
                  <>
                    <ResultCard
                      label="Preservar (mensal)"
                      value={resultado.cenarios.preservar.saqueMensalInicial}
                      highlight
                    />
                    <ResultCard
                      label="Consumir nominal (mensal)"
                      value={resultado.cenarios.consumirNominal.saqueMensal}
                    />
                    <ResultCard
                      label="Consumir real (inicial)"
                      value={resultado.cenarios.consumirReal.saqueMensalInicial}
                    />
                  </>
                )}
              </div>

              {resultado.cenarios.preservar.saqueMensalInicial < 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800">
                    <strong>Cenário preservar indisponível:</strong> Com taxa real negativa, não é possível preservar o patrimônio em termos reais. O patrimônio deteriora mesmo sem saques.
                  </div>
                </div>
              )}
            </div>

            {/* Gráfico */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Evolução do Patrimônio</h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" label={{ value: 'Mês', position: 'insideBottom', offset: -5 }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="preservar"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Preservar"
                  />
                  <Line
                    type="monotone"
                    dataKey="consumirNominal"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Consumir (nominal)"
                  />
                  <Line
                    type="monotone"
                    dataKey="consumirReal"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Consumir (real)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Evolução Mensal Detalhada</h2>

              <ScenarioTabs
                options={[
                  { value: 'preservar', label: 'Preservar' },
                  { value: 'consumirNominal', label: 'Consumir Nominal' },
                  { value: 'consumirReal', label: 'Consumir Real' },
                ]}
                value={cenarioSelecionado}
                onChange={setCenarioSelecionado}
              />

              <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Mês</th>
                      <th className="px-4 py-2 text-right font-semibold">Saque</th>
                      <th className="px-4 py-2 text-right font-semibold">Juros</th>
                      <th className="px-4 py-2 text-right font-semibold">Saldo Nominal</th>
                      <th className="px-4 py-2 text-right font-semibold">Saldo Real</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosTabela.map((row) => (
                      <tr key={row.mes} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{row.mes}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.saque)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.jurosMes)}</td>
                        <td className="px-4 py-2 text-right font-semibold">{formatCurrency(row.saldoNominal)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.saldoReal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
