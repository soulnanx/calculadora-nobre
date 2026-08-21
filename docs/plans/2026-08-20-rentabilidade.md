# Calculadora de Rentabilidade e Aposentadoria - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar uma calculadora de rentabilidade que simula 3 cenários de resgate (preservar, consumir nominal, consumir real) e responde "quanto posso sacar?" ou "quanto tempo dura meu patrimônio?".

**Architecture:** SPA React estática hospedada no GitHub Pages. Lógica de cálculo pura separada da UI. Estado local com useState, sem estado global. Componentes reutilizáveis para inputs e exibição de resultados. Nova página `/rentabilidade` independente da calculadora de Juros Compostos.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, React Router, Vitest

**Spec:** `docs/specs/todo/spec-rentabilidade.md`

## Global Constraints

- Deploy: GitHub Pages (estático)
- Sem backend na v1 (sem Supabase, sem auth)
- Cálculo automático em tempo real (sem botão "Calcular")
- Layout responsivo (desktop: 2 colunas, mobile: empilhado)
- Formatação monetária brasileira (R$ 1.000,00)
- Taxa pode ser mensal ou anual (conversão automática para mensal)
- Inflação pode ser mensal ou anual (conversão automática para mensal)
- Período pode ser em meses ou anos (conversão automática para meses)
- Saque desejado é opcional
- Taxa real pode ser negativa (juros < inflação) — tratar caso edge com mensagem clara

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── CurrencyInput.tsx          # (existente) Input monetário com máscara
│   ├── NumberInput.tsx            # (existente) Input numérico genérico
│   ├── RadioGroup.tsx             # (existente) Grupo de radio buttons
│   ├── ResultCard.tsx             # (existente) Card de resumo (valor + label)
│   ├── DataTable.tsx              # (existente) Tabela com scroll e sticky header
│   └── ScenarioTabs.tsx           # (novo) Tabs para selecionar cenário
├── calculators/
│   ├── compound-interest.ts       # (existente)
│   ├── compound-interest.test.ts  # (existente)
│   ├── retirement.ts              # (novo) Lógica pura dos 3 cenários
│   └── retirement.test.ts         # (novo) Testes vitest
├── pages/
│   ├── Home.tsx                   # (modificar) Adicionar card Rentabilidade
│   ├── JurosCompostos.tsx         # (existente)
│   └── Rentabilidade.tsx          # (novo) Página da calculadora
├── lib/
│   └── utils.ts                   # (existente) Formatação, debounce
├── types/
│   └── index.ts                   # (modificar) Adicionar InputRentabilidade + ResultadoRentabilidade
├── App.tsx                        # (modificar) Adicionar rota /rentabilidade
├── main.tsx                       # (existente)
└── index.css                      # (existente)
```

---

### Task 1: Definir Types para Rentabilidade

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `InputRentabilidade` e `ResultadoRentabilidade` para uso pela lógica de cálculo e UI

- [ ] **Step 1: Adicionar tipos em src/types/index.ts**

Adicionar ao final do arquivo existente:

```typescript
export interface InputRentabilidade {
  patrimonio: number;
  taxaJuros: number;
  taxaPeriodicidade: 'mensal' | 'anual';
  inflacao: number;
  inflacaoPeriodicidade: 'mensal' | 'anual';
  periodo: number;
  periodoUnidade: 'meses' | 'anos';
  saqueDesejado?: number;
}

export interface CenarioPreservar {
  saqueMensalInicial: number;
  patrimonioConstanteReal: number;
  duracao: 'perpetuo';
}

export interface CenarioConsumir {
  saqueMensal: number;
  duracaoMeses: number;
  totalSacado: number;
}

export interface CenarioReal {
  saqueMensalInicial: number;
  duracaoMeses: number;
  totalSacado: number;
}

export interface EvolucaoMensalRentabilidade {
  mes: number;
  saque: number;
  jurosMes: number;
  saldoNominal: number;
  saldoReal: number;
}

export interface ResultadoRentabilidade {
  cenarios: {
    preservar: CenarioPreservar;
    consumirNominal: CenarioConsumir;
    consumirReal: CenarioReal;
  };
  evolucaoMensal: {
    preservar: EvolucaoMensalRentabilidade[];
    consumirNominal: EvolucaoMensalRentabilidade[];
    consumirReal: EvolucaoMensalRentabilidade[];
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript types for retirement calculator"
```

---

### Task 2: Implementar Lógica de Cálculo (TDD)

**Files:**
- Create: `src/calculators/retirement.ts`
- Create: `src/calculators/retirement.test.ts`

**Interfaces:**
- Consumes: `InputRentabilidade` de `src/types/index.ts`
- Produces: `ResultadoRentabilidade` de `src/types/index.ts`

- [ ] **Step 1: Escrever teste falhando - cenário preservar**

Criar `src/calculators/retirement.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calcularRentabilidade } from './retirement';

describe('calcularRentabilidade', () => {
  it('deve calcular cenário preservar com taxa real positiva', () => {
    const input = {
      patrimonio: 1000000,
      taxaJuros: 1, // 1% ao mês
      taxaPeriodicidade: 'mensal' as const,
      inflacao: 0.5, // 0.5% ao mês
      inflacaoPeriodicidade: 'mensal' as const,
      periodo: 30,
      periodoUnidade: 'anos' as const,
    };

    const resultado = calcularRentabilidade(input);

    // taxa_real = (1.01 / 1.005) - 1 ≈ 0.004975
    // saque = 1000000 × 0.004975 ≈ 4975
    expect(resultado.cenarios.preservar.saqueMensalInicial).toBeGreaterThan(4900);
    expect(resultado.cenarios.preservar.saqueMensalInicial).toBeLessThan(5100);
    expect(resultado.cenarios.preservar.duracao).toBe('perpetuo');
    expect(resultado.cenarios.preservar.patrimonioConstanteReal).toBeCloseTo(1000000, -2);
  });

  it('deve calcular cenário consumir nominal', () => {
    const input = {
      patrimonio: 1000000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      inflacao: 0.5,
      inflacaoPeriodicidade: 'mensal' as const,
      periodo: 30,
      periodoUnidade: 'anos' as const,
    };

    const resultado = calcularRentabilidade(input);

    // PMT com taxa nominal de 1% ao mês por 360 meses
    // saque ≈ 1000000 × [0.01 × (1.01)^360] / [(1.01)^360 - 1]
    expect(resultado.cenarios.consumirNominal.saqueMensal).toBeGreaterThan(10000);
    expect(resultado.cenarios.consumirNominal.saqueMensal).toBeLessThan(11000);
    expect(resultado.cenarios.consumirNominal.duracaoMeses).toBe(360);
    expect(resultado.cenarios.consumirNominal.totalSacado).toBeGreaterThan(3600000);
  });

  it('deve calcular cenário consumir real', () => {
    const input = {
      patrimonio: 1000000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      inflacao: 0.5,
      inflacaoPeriodicidade: 'mensal' as const,
      periodo: 30,
      periodoUnidade: 'anos' as const,
    };

    const resultado = calcularRentabilidade(input);

    // PMT com taxa real ≈ 0.4975% ao mês por 360 meses
    expect(resultado.cenarios.consumirReal.saqueMensalInicial).toBeGreaterThan(5000);
    expect(resultado.cenarios.consumirReal.saqueMensalInicial).toBeLessThan(6000);
    expect(resultado.cenarios.consumirReal.duracaoMeses).toBe(360);
  });

  it('deve retornar evolução mensal para os 3 cenários', () => {
    const input = {
      patrimonio: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      inflacao: 0.5,
      inflacaoPeriodicidade: 'mensal' as const,
      periodo: 12,
      periodoUnidade: 'meses' as const,
    };

    const resultado = calcularRentabilidade(input);

    expect(resultado.evolucaoMensal.preservar).toHaveLength(12);
    expect(resultado.evolucaoMensal.consumirNominal).toHaveLength(12);
    expect(resultado.evolucaoMensal.consumirReal).toHaveLength(12);
    
    expect(resultado.evolucaoMensal.preservar[0].mes).toBe(1);
    expect(resultado.evolucaoMensal.preservar[0].saldoNominal).toBeGreaterThan(0);
  });

  it('deve simular duração com saque desejado informado', () => {
    const input = {
      patrimonio: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      inflacao: 0.5,
      inflacaoPeriodicidade: 'mensal' as const,
      periodo: 30,
      periodoUnidade: 'anos' as const,
      saqueDesejado: 2000,
    };

    const resultado = calcularRentabilidade(input);

    // Com saque de 2000, o patrimônio deve durar menos que 360 meses
    expect(resultado.cenarios.consumirNominal.duracaoMeses).toBeLessThan(360);
    expect(resultado.cenarios.consumirNominal.duracaoMeses).toBeGreaterThan(0);
  });

  it('deve tratar taxa real negativa', () => {
    const input = {
      patrimonio: 100000,
      taxaJuros: 0.3, // 0.3% ao mês
      taxaPeriodicidade: 'mensal' as const,
      inflacao: 1, // 1% ao mês (inflação > juros)
      inflacaoPeriodicidade: 'mensal' as const,
      periodo: 30,
      periodoUnidade: 'anos' as const,
    };

    const resultado = calcularRentabilidade(input);

    // taxa_real é negativa, então saque seria negativo
    expect(resultado.cenarios.preservar.saqueMensalInicial).toBeLessThan(0);
  });
});
```

- [ ] **Step 2: Rodar teste para verificar falha**

```bash
npm test
```

Expected: FAIL com "calcularRentabilidade is not defined"

- [ ] **Step 3: Implementar função calcularRentabilidade**

Criar `src/calculators/retirement.ts`:

```typescript
import {
  InputRentabilidade,
  ResultadoRentabilidade,
  CenarioPreservar,
  CenarioConsumir,
  CenarioReal,
  EvolucaoMensalRentabilidade,
} from '../types';

export function calcularRentabilidade(
  input: InputRentabilidade
): ResultadoRentabilidade {
  // Normalizar taxa para mensal
  let taxaMensal = input.taxaJuros / 100;
  if (input.taxaPeriodicidade === 'anual') {
    taxaMensal = Math.pow(1 + taxaMensal, 1 / 12) - 1;
  }

  // Normalizar inflação para mensal
  let inflacaoMensal = input.inflacao / 100;
  if (input.inflacaoPeriodicidade === 'anual') {
    inflacaoMensal = Math.pow(1 + inflacaoMensal, 1 / 12) - 1;
  }

  // Normalizar período para meses
  let periodoMeses = input.periodo;
  if (input.periodoUnidade === 'anos') {
    periodoMeses = input.periodo * 12;
  }

  // Calcular taxa real
  const taxaReal = (1 + taxaMensal) / (1 + inflacaoMensal) - 1;

  // Cenário 1: Preservar (perpétuo)
  const saquePreservar = input.patrimonio * taxaReal;
  const cenarioPreservar: CenarioPreservar = {
    saqueMensalInicial: saquePreservar,
    patrimonioConstanteReal: input.patrimonio,
    duracao: 'perpetuo',
  };

  // Cenário 2: Consumir nominal (PMT com taxa nominal)
  let saqueConsumirNominal: number;
  if (taxaMensal === 0) {
    saqueConsumirNominal = input.patrimonio / periodoMeses;
  } else {
    saqueConsumirNominal =
      input.patrimonio *
      (taxaMensal * Math.pow(1 + taxaMensal, periodoMeses)) /
      (Math.pow(1 + taxaMensal, periodoMeses) - 1);
  }
  const cenarioConsumirNominal: CenarioConsumir = {
    saqueMensal: saqueConsumirNominal,
    duracaoMeses: periodoMeses,
    totalSacado: saqueConsumirNominal * periodoMeses,
  };

  // Cenário 3: Consumir real (PMT com taxa real)
  let saqueConsumirReal: number;
  if (taxaReal === 0) {
    saqueConsumirReal = input.patrimonio / periodoMeses;
  } else {
    saqueConsumirReal =
      input.patrimonio *
      (taxaReal * Math.pow(1 + taxaReal, periodoMeses)) /
      (Math.pow(1 + taxaReal, periodoMeses) - 1);
  }
  const cenarioConsumirReal: CenarioReal = {
    saqueMensalInicial: saqueConsumirReal,
    duracaoMeses: periodoMeses,
    totalSacado: saqueConsumirReal * periodoMeses, // Aproximação, será recalculado na simulação
  };

  // Se saque desejado informado, simular duração
  if (input.saqueDesejado !== undefined && input.saqueDesejado > 0) {
    // Simular cenário consumir nominal com saque fixo
    let saldoNominal = input.patrimonio;
    let mesesNominal = 0;
    const limiteMeses = periodoMeses * 3; // Limite de 3x o período para evitar loop infinito
    while (saldoNominal > 0 && mesesNominal < limiteMeses) {
      mesesNominal++;
      const juros = saldoNominal * taxaMensal;
      saldoNominal = saldoNominal + juros - input.saqueDesejado;
    }
    cenarioConsumirNominal.duracaoMeses = mesesNominal >= limiteMeses ? periodoMeses : mesesNominal;
    cenarioConsumirNominal.totalSacado = input.saqueDesejado * cenarioConsumirNominal.duracaoMeses;

    // Simular cenário consumir real com saque corrigido
    let saldoReal = input.patrimonio;
    let mesesReal = 0;
    let saqueAtual = input.saqueDesejado;
    while (saldoReal > 0 && mesesReal < limiteMeses) {
      mesesReal++;
      const juros = saldoReal * taxaMensal;
      saldoReal = saldoReal + juros - saqueAtual;
      saqueAtual *= (1 + inflacaoMensal);
    }
    cenarioConsumirReal.duracaoMeses = mesesReal >= limiteMeses ? periodoMeses : mesesReal;
    cenarioConsumirReal.saqueMensalInicial = input.saqueDesejado;
  }

  // Gerar evolução mensal para os 3 cenários
  const evolucaoPreservar = gerarEvolucaoPreservar(
    input.patrimonio,
    taxaMensal,
    inflacaoMensal,
    saquePreservar,
    periodoMeses
  );

  const evolucaoConsumirNominal = gerarEvolucaoConsumirNominal(
    input.patrimonio,
    taxaMensal,
    saqueConsumirNominal,
    input.saqueDesejado,
    periodoMeses
  );

  const evolucaoConsumirReal = gerarEvolucaoConsumirReal(
    input.patrimonio,
    taxaMensal,
    inflacaoMensal,
    saqueConsumirReal,
    input.saqueDesejado,
    periodoMeses
  );

  return {
    cenarios: {
      preservar: cenarioPreservar,
      consumirNominal: cenarioConsumirNominal,
      consumirReal: cenarioConsumirReal,
    },
    evolucaoMensal: {
      preservar: evolucaoPreservar,
      consumirNominal: evolucaoConsumirNominal,
      consumirReal: evolucaoConsumirReal,
    },
  };
}

function gerarEvolucaoPreservar(
  patrimonio: number,
  taxaMensal: number,
  inflacaoMensal: number,
  saqueInicial: number,
  periodoMeses: number
): EvolucaoMensalRentabilidade[] {
  const evolucao: EvolucaoMensalRentabilidade[] = [];
  let saldo = patrimonio;
  let saque = saqueInicial;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    const juros = saldo * taxaMensal;
    saldo = saldo + juros - saque;
    const saldoReal = saldo / Math.pow(1 + inflacaoMensal, mes);

    evolucao.push({
      mes,
      saque,
      jurosMes: juros,
      saldoNominal: saldo,
      saldoReal,
    });

    saque *= (1 + inflacaoMensal); // Corrigir saque pela inflação
  }

  return evolucao;
}

function gerarEvolucaoConsumirNominal(
  patrimonio: number,
  taxaMensal: number,
  saqueCalculado: number,
  saqueDesejado: number | undefined,
  periodoMeses: number
): EvolucaoMensalRentabilidade[] {
  const evolucao: EvolucaoMensalRentabilidade[] = [];
  let saldo = patrimonio;
  const saque = saqueDesejado !== undefined && saqueDesejado > 0 ? saqueDesejado : saqueCalculado;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    if (saldo <= 0) break;

    const juros = saldo * taxaMensal;
    saldo = saldo + juros - saque;

    evolucao.push({
      mes,
      saque: Math.min(saque, saldo + juros), // Não sacar mais que o saldo
      jurosMes: juros,
      saldoNominal: Math.max(0, saldo),
      saldoReal: Math.max(0, saldo), // Simplificação: saldo real = nominal (sem inflação nesta função)
    });
  }

  return evolucao;
}

function gerarEvolucaoConsumirReal(
  patrimonio: number,
  taxaMensal: number,
  inflacaoMensal: number,
  saqueInicialCalculado: number,
  saqueDesejado: number | undefined,
  periodoMeses: number
): EvolucaoMensalRentabilidade[] {
  const evolucao: EvolucaoMensalRentabilidade[] = [];
  let saldo = patrimonio;
  let saque = saqueDesejado !== undefined && saqueDesejado > 0 ? saqueDesejado : saqueInicialCalculado;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    if (saldo <= 0) break;

    const juros = saldo * taxaMensal;
    saldo = saldo + juros - saque;
    const saldoReal = saldo / Math.pow(1 + inflacaoMensal, mes);

    evolucao.push({
      mes,
      saque: Math.min(saque, saldo + juros),
      jurosMes: juros,
      saldoNominal: Math.max(0, saldo),
      saldoReal: Math.max(0, saldoReal),
    });

    saque *= (1 + inflacaoMensal); // Corrigir saque pela inflação
  }

  return evolucao;
}
```

- [ ] **Step 4: Rodar testes para verificar passagem**

```bash
npm test
```

Expected: PASS (6 testes)

- [ ] **Step 5: Commit**

```bash
git add src/calculators/retirement.ts src/calculators/retirement.test.ts
git commit -m "feat: implement retirement calculation logic with tests"
```

---

### Task 3: Criar Componente ScenarioTabs

**Files:**
- Create: `src/components/ScenarioTabs.tsx`

**Interfaces:**
- Produces: Componente reutilizável para selecionar cenário na tabela detalhada

- [ ] **Step 1: Criar ScenarioTabs.tsx**

```tsx
interface ScenarioTabsProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}

export function ScenarioTabs({ options, value, onChange }: ScenarioTabsProps) {
  return (
    <div className="flex gap-2 border-b border-gray-200 mb-4">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            value === option.value
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ScenarioTabs.tsx
git commit -m "feat: add ScenarioTabs component for scenario selection"
```

---

### Task 4: Implementar Página Rentabilidade (UI)

**Files:**
- Create: `src/pages/Rentabilidade.tsx`

**Interfaces:**
- Consumes: Componentes de `src/components/`
- Consumes: `calcularRentabilidade` de `src/calculators/retirement.ts`
- Produces: Página completa da calculadora com formulário e resultado

- [ ] **Step 1: Criar Rentabilidade.tsx**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Rentabilidade.tsx
git commit -m "feat: implement Rentabilidade calculator page with form, chart, and table"
```

---

### Task 5: Atualizar Home e Rotas

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: Página `Rentabilidade` de `src/pages/Rentabilidade.tsx`
- Produces: Card na Home e rota `/rentabilidade` funcional

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
];
```

- [ ] **Step 2: Atualizar App.tsx**

```tsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { JurosCompostos } from './pages/JurosCompostos';
import { Rentabilidade } from './pages/Rentabilidade';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juros-compostos" element={<JurosCompostos />} />
        <Route path="/rentabilidade" element={<Rentabilidade />} />
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
- Home exibe 2 cards: "Juros Compostos" e "Rentabilidade"
- Clicar em "Rentabilidade" navega para `/rentabilidade`
- Formulário atualiza resultado em tempo real
- Gráfico exibe 3 linhas (preservar, consumir nominal, consumir real)
- Tabs permitem selecionar cenário para tabela detalhada
- Com saque desejado informado, ResultCards mostram duração em meses
- Sem saque desejado, ResultCards mostram saque mensal de cada cenário

- [ ] **Step 4: Rodar build de produção**

```bash
npm run build
```

Expected: Build completa sem erros

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.tsx src/App.tsx
git commit -m "feat: add Rentabilidade calculator to Home and routes"
```

---

### Task 6: Mover Spec para Done

**Files:**
- Modify: `docs/specs/todo/spec-rentabilidade.md`

- [ ] **Step 1: Atualizar status da spec**

Editar `docs/specs/todo/spec-rentabilidade.md`:

```markdown
**Status:** done
```

- [ ] **Step 2: Mover spec para done/**

```bash
git mv docs/specs/todo/spec-rentabilidade.md docs/specs/done/spec-rentabilidade.md
```

- [ ] **Step 3: Commit final**

```bash
git add .
git commit -m "docs: mark rentabilidade calculator as done"
```

---

## Resumo

**Total de tasks:** 6  
**Tempo estimado:** 2-3 horas  
**Dependências:** Todas as tasks são sequenciais

**Próximos passos após conclusão:**
- Deploy automático via GitHub Pages (workflow já existe)
- v2: Integrar com calculadora de Juros Compostos (exportar patrimônio acumulado)
- v2: Adicionar aportes mensais durante fase de resgate
