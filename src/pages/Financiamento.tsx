import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CurrencyInput } from '../components/CurrencyInput';
import { NumberInput } from '../components/NumberInput';
import { RadioGroup } from '../components/RadioGroup';
import { ResultCard } from '../components/ResultCard';
import { calcularFinanciamento } from '../calculators/amortization';
import { InputFinanciamento } from '../types';
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

export function Financiamento() {
  const [valor, setValor] = useState(300000);
  const [taxaJuros, setTaxaJuros] = useState(10);
  const [taxaPeriodicidade, setTaxaPeriodicidade] = useState<'mensal' | 'anual'>('anual');
  const [prazo, setPrazo] = useState(30);
  const [prazoUnidade, setPrazoUnidade] = useState<'meses' | 'anos'>('anos');
  const [sistema, setSistema] = useState<'SAC' | 'Price'>('SAC');
  const [comparar, setComparar] = useState(false);

  const input: InputFinanciamento = useMemo(
    () => ({
      valor,
      taxaJuros,
      taxaPeriodicidade,
      prazo,
      prazoUnidade,
      sistema,
    }),
    [valor, taxaJuros, taxaPeriodicidade, prazo, prazoUnidade, sistema]
  );

  const resultado = useMemo(() => calcularFinanciamento(input), [input]);

  const resultadoComparacao = useMemo(() => {
    if (!comparar) return null;
    const sistemaOposto = sistema === 'SAC' ? 'Price' : 'SAC';
    return calcularFinanciamento({ ...input, sistema: sistemaOposto });
  }, [input, comparar, sistema]);

  const dadosGrafico = useMemo(() => {
    if (comparar && resultadoComparacao) {
      const maxMeses = Math.max(resultado.evolucaoMensal.length, resultadoComparacao.evolucaoMensal.length);
      return Array.from({ length: maxMeses }, (_, i) => ({
        mes: i + 1,
        saldoDevedor: resultado.evolucaoMensal[i]?.saldoFinal || 0,
        parcela: resultado.evolucaoMensal[i]?.parcela || 0,
        saldoDevedorComparacao: resultadoComparacao.evolucaoMensal[i]?.saldoFinal || 0,
        parcelaComparacao: resultadoComparacao.evolucaoMensal[i]?.parcela || 0,
      }));
    }
    return resultado.evolucaoMensal.map((p) => ({
      mes: p.mes,
      saldoDevedor: p.saldoFinal,
      parcela: p.parcela,
    }));
  }, [resultado, resultadoComparacao, comparar]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Financiamento</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calculadora de Financiamento Imobiliário</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Parâmetros</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do financiamento
                </label>
                <CurrencyInput value={valor} onChange={setValor} />
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
                  Prazo
                </label>
                <NumberInput value={prazo} onChange={setPrazo} />
                <div className="mt-2">
                  <RadioGroup
                    name="prazoUnidade"
                    options={[
                      { value: 'meses', label: 'Meses' },
                      { value: 'anos', label: 'Anos' },
                    ]}
                    value={prazoUnidade}
                    onChange={(v) => setPrazoUnidade(v as 'meses' | 'anos')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistema de amortização
                </label>
                <RadioGroup
                  name="sistema"
                  options={[
                    { value: 'SAC', label: 'SAC (parcelas decrescentes)' },
                    { value: 'Price', label: 'Price (parcelas fixas)' },
                  ]}
                  value={sistema}
                  onChange={(v) => setSistema(v as 'SAC' | 'Price')}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="comparar"
                  checked={comparar}
                  onChange={(e) => setComparar(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="comparar" className="text-sm text-gray-700">
                  Comparar com {sistema === 'SAC' ? 'Price' : 'SAC'}
                </label>
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resultado - {sistema}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard label="Total pago" value={resultado.resumo.totalPago} highlight />
                <ResultCard label="Total de juros" value={resultado.resumo.totalJuros} />
                <ResultCard label="Primeira parcela" value={resultado.resumo.primeiraParcela} />
                <ResultCard label="Última parcela" value={resultado.resumo.ultimaParcela} />
              </div>

              {comparar && resultadoComparacao && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparação - {sistema === 'SAC' ? 'Price' : 'SAC'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ResultCard label="Total pago" value={resultadoComparacao.resumo.totalPago} />
                    <ResultCard label="Total de juros" value={resultadoComparacao.resumo.totalJuros} />
                    <ResultCard label="Primeira parcela" value={resultadoComparacao.resumo.primeiraParcela} />
                    <ResultCard label="Última parcela" value={resultadoComparacao.resumo.ultimaParcela} />
                  </div>
                </div>
              )}
            </div>

            {/* Gráfico */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Evolução</h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" label={{ value: 'Mês', position: 'insideBottom', offset: -5 }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="saldoDevedor"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name={`Saldo devedor (${sistema})`}
                  />
                  <Line
                    type="monotone"
                    dataKey="parcela"
                    stroke="#10b981"
                    strokeWidth={2}
                    name={`Parcela (${sistema})`}
                  />
                  {comparar && resultadoComparacao && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="saldoDevedorComparacao"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name={`Saldo devedor (${sistema === 'SAC' ? 'Price' : 'SAC'})`}
                      />
                      <Line
                        type="monotone"
                        dataKey="parcelaComparacao"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name={`Parcela (${sistema === 'SAC' ? 'Price' : 'SAC'})`}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Evolução Mensal - {sistema}</h2>
              
              <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Mês</th>
                      <th className="px-4 py-2 text-right font-semibold">Saldo Inicial</th>
                      <th className="px-4 py-2 text-right font-semibold">Juros</th>
                      <th className="px-4 py-2 text-right font-semibold">Amortização</th>
                      <th className="px-4 py-2 text-right font-semibold">Parcela</th>
                      <th className="px-4 py-2 text-right font-semibold">Saldo Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.evolucaoMensal.map((row) => (
                      <tr key={row.mes} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{row.mes}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.saldoInicial)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.juros)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.amortizacao)}</td>
                        <td className="px-4 py-2 text-right font-semibold">{formatCurrency(row.parcela)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.saldoFinal)}</td>
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
