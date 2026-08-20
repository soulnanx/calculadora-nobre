# Calculadora de Juros Compostos - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar uma calculadora de juros compostos stateless com interface minimalista, cálculo em tempo real, gráfico e tabela de evolução.

**Architecture:** SPA React estática hospedada no GitHub Pages. Lógica de cálculo pura separada da UI. Estado local com useState, sem estado global. Componentes reutilizáveis para inputs e exibição de resultados.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, React Router

**Spec:** `docs/specs/todo/spec-juros-compostos.md`

## Global Constraints

- Deploy: GitHub Pages (estático)
- Sem backend na v1 (sem Supabase, sem auth)
- Cálculo automático em tempo real (debounce 300ms)
- Layout responsivo (desktop: 2 colunas, mobile: empilhado)
- Formatação monetária brasileira (R$ 1.000,00)
- Taxa pode ser mensal ou anual (conversão automática para mensal)
- Período pode ser em meses ou anos (conversão automática para meses)
- Inflação opcional no período

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── CurrencyInput.tsx          # Input monetário com máscara
│   ├── NumberInput.tsx            # Input numérico genérico
│   ├── RadioGroup.tsx             # Grupo de radio buttons
│   ├── ResultCard.tsx             # Card de resumo (valor + label)
│   └── DataTable.tsx              # Tabela com scroll e sticky header
├── calculators/
│   └── compound-interest.ts       # Lógica pura de cálculo
├── pages/
│   ├── Home.tsx                   # Grid de cards
│   └── JurosCompostos.tsx         # Página da calculadora
├── lib/
│   └── utils.ts                   # Formatação, debounce
├── types/
│   └── index.ts                   # TypeScript types
├── App.tsx                        # Router
├── main.tsx                       # Entry point
└── index.css                      # Tailwind imports
```

---

### Task 1: Setup do Projeto com Vite + React + TypeScript

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `.gitignore`

**Interfaces:**
- Produces: Projeto Vite funcional com React e TypeScript

- [ ] **Step 1: Inicializar package.json**

```bash
cd /Users/renansan/Developer/workspace/calculadora-nobre
npm init -y
```

- [ ] **Step 2: Instalar dependências**

```bash
npm install react@^18.3 react-dom@^18.3 react-router-dom@^6.20
npm install -D @types/react@^18.3 @types/react-dom@^18.3 @vitejs/plugin-react@^4.2 typescript@^5.3 vite@^5.0
```

- [ ] **Step 3: Instalar Tailwind CSS**

```bash
npm install -D tailwindcss@^3.4 postcss@^8.4 autoprefixer@^10.4
npx tailwindcss init -p
```

- [ ] **Step 4: Instalar Recharts**

```bash
npm install recharts@^2.10
```

- [ ] **Step 5: Configurar vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/calculadora-nobre/',
});
```

- [ ] **Step 6: Configurar tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 7: Configurar tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 8: Configurar tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 9: Configurar tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 10: Configurar postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 11: Criar index.html**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calculadora Nobre</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 12: Criar src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 13: Criar src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 14: Criar src/App.tsx**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 15: Criar .gitignore**

```
# Dependencies
node_modules/

# Build
dist/
dist-ssr/
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
```

- [ ] **Step 16: Adicionar scripts ao package.json**

Editar `package.json` e adicionar:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 17: Testar setup**

```bash
npm run dev
```

Expected: Servidor inicia em http://localhost:5173, mostra "Home"

- [ ] **Step 18: Commit**

```bash
git add .
git commit -m "chore: setup Vite + React + TypeScript + Tailwind"
```

---

### Task 2: Definir Types e Utilitários

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/utils.ts`

**Interfaces:**
- Produces: Types TypeScript para inputs e resultados da calculadora
- Produces: Funções utilitárias de formatação e debounce

- [ ] **Step 1: Criar src/types/index.ts**

```typescript
export interface InputJurosCompostos {
  valorInicial: number;
  aporteMensal: number;
  taxaJuros: number;
  taxaPeriodicidade: 'mensal' | 'anual';
  periodo: number;
  periodoUnidade: 'meses' | 'anos';
  inflacaoPeriodo?: number;
}

export interface ResultadoJurosCompostos {
  resumo: {
    valorFinalNominal: number;
    totalInvestido: number;
    totalJuros: number;
    valorReal?: number;
  };
  evolucaoMensal: Array<{
    mes: number;
    aporteAcumulado: number;
    jurosAcumulados: number;
    saldo: number;
  }>;
}
```

- [ ] **Step 2: Criar src/lib/utils.ts**

```typescript
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/lib/utils.ts
git commit -m "feat: add TypeScript types and utility functions"
```

---

### Task 3: Implementar Lógica de Cálculo (TDD)

**Files:**
- Create: `src/calculators/compound-interest.ts`
- Create: `src/calculators/compound-interest.test.ts`

**Interfaces:**
- Consumes: `InputJurosCompostos` de `src/types/index.ts`
- Produces: `ResultadoJurosCompostos` de `src/types/index.ts`

- [ ] **Step 1: Instalar Vitest para testes**

```bash
npm install -D vitest@^1.0
```

- [ ] **Step 2: Adicionar script de teste ao package.json**

Editar `package.json` e adicionar:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

- [ ] **Step 3: Escrever teste falhando - cálculo básico**

Criar `src/calculators/compound-interest.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calcularJurosCompostos } from './compound-interest';

describe('calcularJurosCompostos', () => {
  it('deve calcular juros compostos com aporte mensal - taxa mensal', () => {
    const input = {
      valorInicial: 10000,
      aporteMensal: 500,
      taxaJuros: 1, // 1% ao mês
      taxaPeriodicidade: 'mensal' as const,
      periodo: 12, // 12 meses
      periodoUnidade: 'meses' as const,
    };

    const resultado = calcularJurosCompostos(input);

    expect(resultado.resumo.totalInvestido).toBe(16000); // 10000 + (500 * 12)
    expect(resultado.resumo.valorFinalNominal).toBeGreaterThan(16000);
    expect(resultado.resumo.totalJuros).toBeGreaterThan(0);
    expect(resultado.evolucaoMensal).toHaveLength(12);
  });

  it('deve converter taxa anual para mensal', () => {
    const input = {
      valorInicial: 10000,
      aporteMensal: 0,
      taxaJuros: 12, // 12% ao ano
      taxaPeriodicidade: 'anual' as const,
      periodo: 1, // 1 ano
      periodoUnidade: 'anos' as const,
    };

    const resultado = calcularJurosCompostos(input);

    // 10000 * (1 + 0.12)^1 = 11200
    expect(resultado.resumo.valorFinalNominal).toBeCloseTo(11200, 0);
  });

  it('deve converter período de anos para meses', () => {
    const input = {
      valorInicial: 1000,
      aporteMensal: 100,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      periodo: 2, // 2 anos
      periodoUnidade: 'anos' as const,
    };

    const resultado = calcularJurosCompostos(input);

    expect(resultado.evolucaoMensal).toHaveLength(24); // 2 * 12
  });

  it('deve calcular valor real com inflação', () => {
    const input = {
      valorInicial: 10000,
      aporteMensal: 500,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      periodo: 12,
      periodoUnidade: 'meses' as const,
      inflacaoPeriodo: 5, // 5% no período
    };

    const resultado = calcularJurosCompostos(input);

    expect(resultado.resumo.valorReal).toBeDefined();
    expect(resultado.resumo.valorReal!).toBeLessThan(resultado.resumo.valorFinalNominal);
  });

  it('deve retornar evolução mensal completa', () => {
    const input = {
      valorInicial: 1000,
      aporteMensal: 100,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      periodo: 3,
      periodoUnidade: 'meses' as const,
    };

    const resultado = calcularJurosCompostos(input);

    expect(resultado.evolucaoMensal[0].mes).toBe(1);
    expect(resultado.evolucaoMensal[2].mes).toBe(3);
    expect(resultado.evolucaoMensal[0].aporteAcumulado).toBe(1100); // 1000 + 100
    expect(resultado.evolucaoMensal[2].aporteAcumulado).toBe(1300); // 1000 + (100 * 3)
  });
});
```

- [ ] **Step 4: Rodar teste para verificar falha**

```bash
npm test
```

Expected: FAIL com "calcularJurosCompostos is not defined"

- [ ] **Step 5: Implementar função calcularJurosCompostos**

Criar `src/calculators/compound-interest.ts`:

```typescript
import { InputJurosCompostos, ResultadoJurosCompostos } from '../types';

export function calcularJurosCompostos(
  input: InputJurosCompostos
): ResultadoJurosCompostos {
  // Normalizar taxa para mensal
  let taxaMensal = input.taxaJuros / 100;
  if (input.taxaPeriodicidade === 'anual') {
    taxaMensal = Math.pow(1 + taxaMensal, 1 / 12) - 1;
  }

  // Normalizar período para meses
  let periodoMeses = input.periodo;
  if (input.periodoUnidade === 'anos') {
    periodoMeses = input.periodo * 12;
  }

  const evolucaoMensal: ResultadoJurosCompostos['evolucaoMensal'] = [];
  let saldo = input.valorInicial;
  let totalJuros = 0;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    const jurosMes = saldo * taxaMensal;
    totalJuros += jurosMes;
    saldo += jurosMes + input.aporteMensal;

    evolucaoMensal.push({
      mes,
      aporteAcumulado: input.valorInicial + input.aporteMensal * mes,
      jurosAcumulados: totalJuros,
      saldo,
    });
  }

  const valorFinalNominal = saldo;
  const totalInvestido = input.valorInicial + input.aporteMensal * periodoMeses;

  const resumo: ResultadoJurosCompostos['resumo'] = {
    valorFinalNominal,
    totalInvestido,
    totalJuros,
  };

  // Ajuste de inflação (opcional)
  if (input.inflacaoPeriodo !== undefined && input.inflacaoPeriodo > 0) {
    resumo.valorReal = valorFinalNominal / (1 + input.inflacaoPeriodo / 100);
  }

  return { resumo, evolucaoMensal };
}
```

- [ ] **Step 6: Rodar testes para verificar passagem**

```bash
npm test
```

Expected: PASS (5 testes)

- [ ] **Step 7: Commit**

```bash
git add src/calculators/
git commit -m "feat: implement compound interest calculation logic with tests"
```

---

### Task 4: Criar Componentes de Input Reutilizáveis

**Files:**
- Create: `src/components/CurrencyInput.tsx`
- Create: `src/components/NumberInput.tsx`
- Create: `src/components/RadioGroup.tsx`

**Interfaces:**
- Produces: Componentes reutilizáveis para formulário

- [ ] **Step 1: Criar CurrencyInput.tsx**

```tsx
import { InputHTMLAttributes } from 'react';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
  const formatValue = (val: number): string => {
    return val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    const numericValue = parseInt(cleaned) / 100;
    onChange(numericValue || 0);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        R$
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={formatValue(value)}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}
```

- [ ] **Step 2: Criar NumberInput.tsx**

```tsx
import { InputHTMLAttributes } from 'react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

export function NumberInput({ value, onChange, suffix, ...props }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(e.target.value) || 0;
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {suffix}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Criar RadioGroup.tsx**

```tsx
interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({ name, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex gap-4">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: add reusable input components (CurrencyInput, NumberInput, RadioGroup)"
```

---

### Task 5: Criar Componentes de Resultado

**Files:**
- Create: `src/components/ResultCard.tsx`
- Create: `src/components/DataTable.tsx`

**Interfaces:**
- Produces: Componentes para exibir resumo e tabela de evolução

- [ ] **Step 1: Criar ResultCard.tsx**

```tsx
import { formatCurrency } from '../lib/utils';

interface ResultCardProps {
  label: string;
  value: number;
  highlight?: boolean;
}

export function ResultCard({ label, value, highlight = false }: ResultCardProps) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-blue-900' : 'text-gray-900'}`}>
        {formatCurrency(value)}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar DataTable.tsx**

```tsx
import { formatCurrency } from '../lib/utils';
import { ResultadoJurosCompostos } from '../types';

interface DataTableProps {
  data: ResultadoJurosCompostos['evolucaoMensal'];
}

export function DataTable({ data }: DataTableProps) {
  return (
    <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">Mês</th>
            <th className="px-4 py-2 text-right font-semibold">Aporte Acumulado</th>
            <th className="px-4 py-2 text-right font-semibold">Juros Acumulados</th>
            <th className="px-4 py-2 text-right font-semibold">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.mes} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-2">{row.mes}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(row.aporteAcumulado)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(row.jurosAcumulados)}</td>
              <td className="px-4 py-2 text-right font-semibold">{formatCurrency(row.saldo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/
git commit -m "feat: add result display components (ResultCard, DataTable)"
```

---

### Task 6: Implementar Página Home

**Files:**
- Create: `src/pages/Home.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: Página inicial com grid de cards das calculadoras

- [ ] **Step 1: Criar Home.tsx**

```tsx
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
```

- [ ] **Step 2: Atualizar App.tsx**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 3: Testar página Home**

```bash
npm run dev
```

Expected: Página exibe grid com card "Juros Compostos"

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx src/App.tsx
git commit -m "feat: implement Home page with calculator cards"
```

---

### Task 7: Implementar Página Juros Compostos (UI)

**Files:**
- Create: `src/pages/JurosCompostos.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: Componentes de `src/components/`
- Consumes: `calcularJurosCompostos` de `src/calculators/compound-interest.ts`
- Produces: Página completa da calculadora com formulário e resultado

- [ ] **Step 1: Criar JurosCompostos.tsx**

```tsx
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
                  <XAxis dataKey="mes" label={{ value: 'Mês', position: 'insideBottom', offset: -5 }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
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
```

- [ ] **Step 2: Atualizar App.tsx**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { JurosCompostos } from './pages/JurosCompostos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juros-compostos" element={<JurosCompostos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 3: Testar página completa**

```bash
npm run dev
```

Expected:
- Home exibe card "Juros Compostos"
- Clicar no card navega para `/juros-compostos`
- Formulário atualiza resultado em tempo real
- Gráfico exibe evolução
- Tabela exibe dados mensais

- [ ] **Step 4: Commit**

```bash
git add src/pages/JurosCompostos.tsx src/App.tsx
git commit -m "feat: implement Juros Compostos calculator page with form, chart, and table"
```

---

### Task 8: Configurar Deploy para GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: Workflow de deploy automático no push para main

- [ ] **Step 1: Verificar vite.config.ts**

Confirmar que `base` está configurado:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/calculadora-nobre/',
});
```

- [ ] **Step 2: Criar .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - run: npm run build

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

### Task 9: Testar Build e Mover Spec para Done

**Files:**
- Modify: `docs/specs/todo/spec-juros-compostos.md` → `docs/specs/done/spec-juros-compostos.md`

**Interfaces:**
- Produces: Build funcional e spec movida para done

- [ ] **Step 1: Rodar build de produção**

```bash
npm run build
```

Expected: Build completa sem erros, gera pasta `dist/`

- [ ] **Step 2: Testar preview local**

```bash
npm run preview
```

Expected: Servidor inicia, app funciona corretamente

- [ ] **Step 3: Atualizar status da spec**

Editar `docs/specs/todo/spec-juros-compostos.md`:

```markdown
**Status:** done
```

- [ ] **Step 4: Mover spec para done/**

```bash
git mv docs/specs/todo/spec-juros-compostos.md docs/specs/done/spec-juros-compostos.md
```

- [ ] **Step 5: Commit final**

```bash
git add .
git commit -m "docs: mark compound interest calculator as done"
```

- [ ] **Step 6: Push para GitHub**

```bash
git remote add origin https://github.com/<usuario>/calculadora-nobre.git
git branch -M main
git push -u origin main
```

Expected: Workflow de deploy executa automaticamente

- [ ] **Step 7: Verificar deploy**

Acessar: `https://<usuario>.github.io/calculadora-nobre/`

Expected: App funcionando no GitHub Pages

---

## Resumo

**Total de tasks:** 9  
**Tempo estimado:** 2-3 horas  
**Dependências:** Nenhuma (todas as tasks são sequenciais)

**Próximos passos após conclusão:**
- Adicionar mais calculadoras (nova spec → novo plano)
- v2: Integrar Supabase para auth + salvar simulações
