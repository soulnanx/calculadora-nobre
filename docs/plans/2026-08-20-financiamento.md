# Calculadora de Financiamento Imobiliário - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar uma calculadora de financiamento imobiliário que simula sistemas SAC e Price, permite comparar os dois sistemas, e mostra evolução mensal detalhada.

**Architecture:** SPA React estática hospedada no GitHub Pages. Lógica de cálculo pura separada da UI. Estado local com useState, sem estado global. Componentes reutilizáveis para inputs e exibição de resultados. Nova página `/financiamento` independente das outras calculadoras.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, React Router, Vitest

**Spec:** `docs/specs/todo/spec-financiamento.md`

## Global Constraints

- Deploy: GitHub Pages (estático)
- Sem backend na v1 (sem Supabase, sem auth)
- Cálculo automático em tempo real (sem botão "Calcular")
- Layout responsivo (desktop: 2 colunas, mobile: empilhado)
- Formatação monetária brasileira (R$ 1.000,00)
- Taxa pode ser mensal ou anual (conversão automática para mensal)
- Prazo pode ser em meses ou anos (conversão automática para meses)
- Sistema pode ser SAC ou Price
- Taxa de juros = 0 tratada como caso especial (apenas divide valor pelo prazo)

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── CurrencyInput.tsx          # (existente) Input monetário com máscara
│   ├── NumberInput.tsx            # (existente) Input numérico genérico
│   ├── RadioGroup.tsx             # (existente) Grupo de radio buttons
│   ├── ResultCard.tsx             # (existente) Card de resumo (valor + label)
│   └── DataTable.tsx              # (existente) Tabela com scroll e sticky header
├── calculators/
│   ├── compound-interest.ts       # (existente)
│   ├── compound-interest.test.ts  # (existente)
│   ├── amortization.ts            # (novo) Lógica pura SAC e Price
│   └── amortization.test.ts       # (novo) Testes vitest
├── pages/
│   ├── Home.tsx                   # (modificar) Adicionar card Financiamento
│   ├── JurosCompostos.tsx         # (existente)
│   ├── Rentabilidade.tsx          # (existente)
│   └── Financiamento.tsx          # (novo) Página da calculadora
├── lib/
│   └── utils.ts                   # (existente) Formatação, debounce
├── types/
│   └── index.ts                   # (modificar) Adicionar InputFinanciamento + ResultadoFinanciamento
├── App.tsx                        # (modificar) Adicionar rota /financiamento
├── main.tsx                       # (existente)
└── index.css                      # (existente)
```

---

### Task 1: Definir Types para Financiamento

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `InputFinanciamento`, `ParcelaMensal`, e `ResultadoFinanciamento` para uso pela lógica de cálculo e UI

- [ ] **Step 1: Adicionar tipos em src/types/index.ts**

Adicionar ao final do arquivo existente:

```typescript
export interface InputFinanciamento {
  valor: number;
  taxaJuros: number;
  taxaPeriodicidade: 'mensal' | 'anual';
  prazo: number;
  prazoUnidade: 'meses' | 'anos';
  sistema: 'SAC' | 'Price';
}

export interface ParcelaMensal {
  mes: number;
  saldoInicial: number;
  juros: number;
  amortizacao: number;
  parcela: number;
  saldoFinal: number;
}

export interface ResultadoFinanciamento {
  resumo: {
    totalPago: number;
    totalJuros: number;
    primeiraParcela: number;
    ultimaParcela: number;
    numeroParcelas: number;
  };
  evolucaoMensal: ParcelaMensal[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript types for financing calculator"
```

---

### Task 2: Implementar Lógica de Cálculo (TDD)

**Files:**
- Create: `src/calculators/amortization.ts`
- Create: `src/calculators/amortization.test.ts`

**Interfaces:**
- Consumes: `InputFinanciamento` de `src/types/index.ts`
- Produces: `ResultadoFinanciamento` de `src/types/index.ts`

- [ ] **Step 1: Escrever teste falhando - cálculo SAC**

Criar `src/calculators/amortization.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calcularFinanciamento } from './amortization';

describe('calcularFinanciamento', () => {
  it('deve calcular financiamento SAC com parcelas decrescentes', () => {
    const input = {
      valor: 300000,
      taxaJuros: 10,
      taxaPeriodicidade: 'anual' as const,
      prazo: 30,
      prazoUnidade: 'anos' as const,
      sistema: 'SAC' as const,
    };

    const resultado = calcularFinanciamento(input);

    // Amortização constante = 300000 / 360 = 833.33
    // Primeira parcela: juros = 300000 × (1.10^(1/12) - 1) ≈ 2391
    // Total primeira parcela ≈ 833.33 + 2391 ≈ 3224
    expect(resultado.resumo.primeiraParcela).toBeGreaterThan(3000);
    expect(resultado.resumo.primeiraParcela).toBeLessThan(3500);
    
    // Última parcela: juros ≈ 833.33 × taxa_mensal ≈ 6.64
    // Total última parcela ≈ 833.33 + 6.64 ≈ 840
    expect(resultado.resumo.ultimaParcela).toBeGreaterThan(800);
    expect(resultado.resumo.ultimaParcela).toBeLessThan(900);
    
    expect(resultado.resumo.numeroParcelas).toBe(360);
    expect(resultado.evolucaoMensal).toHaveLength(360);
    
    // Verificar que parcelas são decrescentes
    expect(resultado.evolucaoMensal[0].parcela).toBeGreaterThan(resultado.evolucaoMensal[1].parcela);
    expect(resultado.evolucaoMensal[358].parcela).toBeGreaterThan(resultado.evolucaoMensal[359].parcela);
  });

  it('deve calcular financiamento Price com parcelas fixas', () => {
    const input = {
      valor: 300000,
      taxaJuros: 10,
      taxaPeriodicidade: 'anual' as const,
      prazo: 30,
      prazoUnidade: 'anos' as const,
      sistema: 'Price' as const,
    };

    const resultado = calcularFinanciamento(input);

    // PMT com taxa mensal ≈ 0.7974% por 360 meses
    // PMT ≈ 300000 × [0.007974 × (1.007974)^360] / [(1.007974)^360 - 1] ≈ 2628
    expect(resultado.resumo.primeiraParcela).toBeGreaterThan(2500);
    expect(resultado.resumo.primeiraParcela).toBeLessThan(2800);
    
    // Parcelas fixas
    expect(resultado.resumo.primeiraParcela).toBeCloseTo(resultado.resumo.ultimaParcela, 1);
    
    expect(resultado.resumo.numeroParcelas).toBe(360);
    expect(resultado.evolucaoMensal).toHaveLength(360);
    
    // Verificar que parcelas são fixas (tolerância pequena)
    const diff = Math.abs(resultado.evolucaoMensal[0].parcela - resultado.evolucaoMensal[359].parcela);
    expect(diff).toBeLessThan(0.01);
  });

  it('deve calcular total de juros corretamente', () => {
    const input = {
      valor: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'SAC' as const,
    };

    const resultado = calcularFinanciamento(input);

    // Total pago = soma de todas as parcelas
    const totalParcelas = resultado.evolucaoMensal.reduce((sum, p) => sum + p.parcela, 0);
    expect(resultado.resumo.totalPago).toBeCloseTo(totalParcelas, 2);
    
    // Total juros = total pago - valor financiado
    expect(resultado.resumo.totalJuros).toBeCloseTo(resultado.resumo.totalPago - 100000, 2);
    expect(resultado.resumo.totalJuros).toBeGreaterThan(0);
  });

  it('deve tratar taxa de juros zero', () => {
    const input = {
      valor: 120000,
      taxaJuros: 0,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'SAC' as const,
    };

    const resultado = calcularFinanciamento(input);

    // Sem juros, parcela = valor / prazo = 10000
    expect(resultado.resumo.primeiraParcela).toBeCloseTo(10000, 2);
    expect(resultado.resumo.ultimaParcela).toBeCloseTo(10000, 2);
    expect(resultado.resumo.totalJuros).toBe(0);
    expect(resultado.resumo.totalPago).toBe(120000);
  });

  it('deve retornar evolução mensal completa', () => {
    const input = {
      valor: 50000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 6,
      prazoUnidade: 'meses' as const,
      sistema: 'Price' as const,
    };

    const resultado = calcularFinanciamento(input);

    expect(resultado.evolucaoMensal).toHaveLength(6);
    expect(resultado.evolucaoMensal[0].mes).toBe(1);
    expect(resultado.evolucaoMensal[5].mes).toBe(6);
    
    // Saldo final da última parcela deve ser zero (ou muito próximo)
    expect(resultado.evolucaoMensal[5].saldoFinal).toBeCloseTo(0, 1);
  });

  it('deve comparar SAC e Price - SAC tem menos juros totais', () => {
    const inputBase = {
      valor: 200000,
      taxaJuros: 12,
      taxaPeriodicidade: 'anual' as const,
      prazo: 20,
      prazoUnidade: 'anos' as const,
    };

    const resultadoSAC = calcularFinanciamento({ ...inputBase, sistema: 'SAC' as const });
    const resultadoPrice = calcularFinanciamento({ ...inputBase, sistema: 'Price' as const });

    // SAC deve ter menos juros totais que Price
    expect(resultadoSAC.resumo.totalJuros).toBeLessThan(resultadoPrice.resumo.totalJuros);
    
    // SAC deve ter primeira parcela maior que Price
    expect(resultadoSAC.resumo.primeiraParcela).toBeGreaterThan(resultadoPrice.resumo.primeiraParcela);
    
    // SAC deve ter última parcela menor que Price
    expect(resultadoSAC.resumo.ultimaParcela).toBeLessThan(resultadoPrice.resumo.ultimaParcela);
  });
});
```

- [ ] **Step 2: Rodar teste para verificar falha**

```bash
npm test
```

Expected: FAIL com "calcularFinanciamento is not defined"

- [ ] **Step 3: Implementar função calcularFinanciamento**

Criar `src/calculators/amortization.ts`:

```typescript
import { InputFinanciamento, ResultadoFinanciamento, ParcelaMensal } from '../types';

export function calcularFinanciamento(
  input: InputFinanciamento
): ResultadoFinanciamento {
  // Normalizar taxa para mensal
  let taxaMensal = input.taxaJuros / 100;
  if (input.taxaPeriodicidade === 'anual') {
    taxaMensal = Math.pow(1 + taxaMensal, 1 / 12) - 1;
  }

  // Normalizar período para meses
  let prazoMeses = input.prazo;
  if (input.prazoUnidade === 'anos') {
    prazoMeses = input.prazo * 12;
  }

  // Calcular evolução mensal baseado no sistema
  const evolucaoMensal: ParcelaMensal[] = [];
  
  if (input.sistema === 'SAC') {
    calcularSAC(input.valor, taxaMensal, prazoMeses, evolucaoMensal);
  } else {
    calcularPrice(input.valor, taxaMensal, prazoMeses, evolucaoMensal);
  }

  // Calcular resumo
  const totalPago = evolucaoMensal.reduce((sum, p) => sum + p.parcela, 0);
  const totalJuros = evolucaoMensal.reduce((sum, p) => sum + p.juros, 0);

  return {
    resumo: {
      totalPago,
      totalJuros,
      primeiraParcela: evolucaoMensal[0].parcela,
      ultimaParcela: evolucaoMensal[evolucaoMensal.length - 1].parcela,
      numeroParcelas: prazoMeses,
    },
    evolucaoMensal,
  };
}

function calcularSAC(
  valor: number,
  taxaMensal: number,
  prazoMeses: number,
  evolucao: ParcelaMensal[]
): void {
  const amortizacaoConstante = valor / prazoMeses;
  let saldoDevedor = valor;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    const saldoInicial = saldoDevedor;
    const juros = saldoDevedor * taxaMensal;
    const parcela = amortizacaoConstante + juros;
    
    saldoDevedor -= amortizacaoConstante;

    evolucao.push({
      mes,
      saldoInicial,
      juros,
      amortizacao: amortizacaoConstante,
      parcela,
      saldoFinal: saldoDevedor,
    });
  }
}

function calcularPrice(
  valor: number,
  taxaMensal: number,
  prazoMeses: number,
  evolucao: ParcelaMensal[]
): void {
  let parcelaFixa: number;
  
  if (taxaMensal === 0) {
    // Sem juros: parcela = valor / prazo
    parcelaFixa = valor / prazoMeses;
  } else {
    // Fórmula PMT
    parcelaFixa = valor * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / 
                  (Math.pow(1 + taxaMensal, prazoMeses) - 1);
  }

  let saldoDevedor = valor;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    const saldoInicial = saldoDevedor;
    const juros = saldoDevedor * taxaMensal;
    const amortizacao = parcelaFixa - juros;
    
    saldoDevedor -= amortizacao;

    evolucao.push({
      mes,
      saldoInicial,
      juros,
      amortizacao,
      parcela: parcelaFixa,
      saldoFinal: saldoDevedor,
    });
  }
}
```

- [ ] **Step 4: Rodar testes para verificar passagem**

```bash
npm test
```

Expected: PASS (6 testes)

- [ ] **Step 5: Commit**

```bash
git add src/calculators/amortization.ts src/calculators/amortization.test.ts
git commit -m "feat: implement financing calculation logic (SAC and Price) with tests"
```

---

### Task 3: Implementar Página Financiamento (UI)

**Files:**
- Create: `src/pages/Financiamento.tsx`

**Interfaces:**
- Consumes: Componentes de `src/components/`
- Consumes: `calcularFinanciamento` de `src/calculators/amortization.ts`
- Produces: Página completa da calculadora com formulário e resultado

- [ ] **Step 1: Criar Financiamento.tsx**

```tsx
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparação - {resultadoComparacao.resumo.numeroParcelas === resultado.resumo.numeroParcelas ? (sistema === 'SAC' ? 'Price' : 'SAC') : (sistema === 'SAC' ? 'Price' : 'SAC')}</h3>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Financiamento.tsx
git commit -m "feat: implement Financiamento calculator page with form, chart, and table"
```

---

### Task 4: Atualizar Home e Rotas

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: Página `Financiamento` de `src/pages/Financiamento.tsx`
- Produces: Card na Home e rota `/financiamento` funcional

- [ ] **Step 1: Atualizar Home.tsx**

Adicionar novo card no array `calculadoras`:

```typescript
const calculadoras = [
  {
    path: '/juros-compostos',
    icon: '📈',
    nome: 'Juros Compostos',
    descricao: 'Simule o crescimento do seu dinheiro com aportes mensais',
  },
  {
    path: '/rentabilidade',
    icon: '🏦',
    nome: 'Rentabilidade',
    descricao: 'Simule estratégias de resgate e aposentadoria',
  },
  {
    path: '/financiamento',
    icon: '🏠',
    nome: 'Financiamento',
    descricao: 'Simule financiamento imobiliário SAC e Price',
  },
];
```

- [ ] **Step 2: Atualizar App.tsx**

```tsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { JurosCompostos } from './pages/JurosCompostos';
import { Rentabilidade } from './pages/Rentabilidade';
import { Financiamento } from './pages/Financiamento';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juros-compostos" element={<JurosCompostos />} />
        <Route path="/rentabilidade" element={<Rentabilidade />} />
        <Route path="/financiamento" element={<Financiamento />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
```

- [ ] **Step 3: Testar aplicação completa**

```bash
npm run dev
```

Expected:
- Home exibe 3 cards: "Juros Compostos", "Rentabilidade" e "Financiamento"
- Clicar em "Financiamento" navega para `/financiamento`
- Formulário atualiza resultado em tempo real
- Gráfico exibe evolução do saldo devedor e parcelas
- Tabela exibe evolução mês a mês
- Checkbox "Comparar" mostra SAC e Price lado a lado no gráfico

- [ ] **Step 4: Rodar build de produção**

```bash
npm run build
```

Expected: Build completa sem erros

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.tsx src/App.tsx
git commit -m "feat: add Financiamento calculator to Home and routes"
```

---

### Task 5: Mover Spec para Done

**Files:**
- Modify: `docs/specs/todo/spec-financiamento.md`

- [ ] **Step 1: Atualizar status da spec**

Editar `docs/specs/todo/spec-financiamento.md`:

```markdown
**Status:** done
```

- [ ] **Step 2: Mover spec para done/**

```bash
git mv docs/specs/todo/spec-financiamento.md docs/specs/done/spec-financiamento.md
```

- [ ] **Step 3: Commit final**

```bash
git add .
git commit -m "docs: mark financiamento calculator as done"
```

---

## Resumo

**Total de tasks:** 5  
**Tempo estimado:** 2-3 horas  
**Dependências:** Todas as tasks são sequenciais

**Próximos passos após conclusão:**
- Deploy automático via GitHub Pages (workflow já existe)
- v2: Adicionar amortização extra (por prazo e por parcela)
- v2: Adicionar taxas e seguros
- v2: Adicionar correção monetária (TR/IPCA)
