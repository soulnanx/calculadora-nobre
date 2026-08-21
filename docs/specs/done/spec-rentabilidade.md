# Calculadora de Rentabilidade e Aposentadoria

**Status:** done  
**Data:** 2026-08-20  
**Autor:** [a definir]

## Contexto

A calculadora de Juros Compostos cobre a **fase de acumulação** — quanto meu dinheiro cresce ao longo do tempo. Esta nova calculadora cobre a **fase de resgate** — já tenho um patrimônio acumulado e quero saber como sacar dele.

Responde duas perguntas naturais:
1. **Quanto posso sacar por mês?** (dado meu patrimônio, taxa e inflação)
2. **Quanto tempo dura meu patrimônio?** (dado um saque que eu quero fazer)

Oferece 3 cenários de resgate para comparação:

| Cenário | Comportamento | Duração |
|---|---|---|
| **Preservar** | Saque = juros reais. Patrimônio constante em termos reais. | Perpétuo |
| **Consumir (nominal)** | Saque fixo nominal (PMT). Patrimônio zera em N meses. | N meses |
| **Consumir (real)** | Saque inicial corrigido pela inflação. Patrimônio zera em termos reais em N meses. | N meses |

Quando o saque informado é menor que o cenário "Preservar", o patrimônio cresce — cobrindo implicitamente o cenário "crescer patrimônio".

## Arquitetura

### Integração
- **Independente** da calculadora de Juros Compostos
- Cada calculadora tem seus próprios inputs
- Compartilha componentes reutilizáveis (`CurrencyInput`, `NumberInput`, `RadioGroup`, `ResultCard`)

### Novos arquivos
```
src/
├── calculators/
│   ├── retirement.ts            # Lógica pura dos 3 cenários
│   └── retirement.test.ts       # Testes vitest
├── pages/
│   └── Rentabilidade.tsx        # Página da calculadora
└── types/
    └── index.ts                 # Adicionar InputRentabilidade + ResultadoRentabilidade
```

### Componentes reutilizados
- `CurrencyInput` — patrimônio inicial, saque desejado
- `NumberInput` — taxa de juros, inflação, período
- `RadioGroup` — periodicidade da taxa (mensal/anual), unidade do período (meses/anos)
- `ResultCard` — resumo dos cenários
- `DataTable` — evolução mensal (adaptável)

### Componente novo
- `ScenarioTabs` — tabs para selecionar qual cenário exibir na tabela detalhada

## Detalhes de Implementação

### Rotas
- `/rentabilidade` → Calculadora de Rentabilidade e Aposentadoria

### Home
- Adicionar novo card no array `calculadoras`:
  - path: `/rentabilidade`
  - icon: `🏦`
  - nome: `Rentabilidade`
  - descricao: `Simule estratégias de resgate e aposentadoria`

### Página Rentabilidade

#### Layout (responsivo)
- **Desktop:** formulário à esquerda, resultado à direita
- **Mobile:** formulário empilha acima do resultado
- Mesmo padrão visual da página de Juros Compostos

#### Formulário

| Campo | Componente | Default | Obrigatório |
|---|---|---|---|
| Patrimônio acumulado | `CurrencyInput` | R$ 500.000,00 | Sim |
| Taxa de juros | `NumberInput` + `RadioGroup` (Mensal/Anual) | 0,5% mensal | Sim |
| Inflação | `NumberInput` + `RadioGroup` (Mensal/Anual) | 0,3% mensal | Sim |
| Período de resgate | `NumberInput` + `RadioGroup` (Meses/Anos) | 30 anos | Sim |
| Saque desejado | `CurrencyInput` | (vazio) | Não |

#### Resultado

**Se saque NÃO informado** — modo "Quanto posso sacar?":
- 3 `ResultCard`s lado a lado, um por cenário:
  - Preservar: saque mensal perpétuo
  - Consumir (nominal): saque mensal fixo durante N meses
  - Consumir (real): saque inicial (corrigido mensalmente) durante N meses
- Gráfico: evolução do patrimônio (nominal) para os 3 cenários sobrepostos
- Se inflação > 0, gráfico adicional ou linha extra com patrimônio em termos reais

**Se saque INFORMADO** — modo "Quanto tempo dura?":
- Para cada cenário, mostrar:
  - Duração em meses/anos (ou "Perpétuo" se o saque ≤ cenário preservar)
  - Saldo final (zero ou valor residual)
- Gráfico: evolução do patrimônio até zerar (cada cenário com seu tempo)
- Tabela: evolução mensal detalhada do cenário selecionado via tabs

#### Gráfico
- Recharts `LineChart`
- Eixo X: mês (ou ano, se período > 24 meses, agrupar por ano)
- Eixo Y: valor em R$
- 3 linhas com cores distintas:
  - Preservar: `#10b981` (verde)
  - Consumir nominal: `#f59e0b` (âmbar)
  - Consumir real: `#ef4444` (vermelho)
- Tooltip com valor formatado em R$ para cada cenário
- Se patrimônio em termos reais for relevante, toggle para exibir linha real vs. nominal

#### Tabela
- `ScenarioTabs` no topo: 3 tabs (Preservar | Consumir Nominal | Consumir Real)
- Colunas: Mês, Saque, Juros do Mês, Saldo Nominal, Saldo Real
- Scroll com sticky header (mesmo padrão do `DataTable` existente)

### Interação
- Cálculo automático em tempo real (sem botão "Calcular")
- Estado em `useState` (sem estado global)
- Sem persistência (v1)

### Lógica de Cálculo

#### Normalização (igual à calculadora de Juros Compostos)
- Taxa anual → mensal: `i_mensal = (1 + i_anual)^(1/12) - 1`
- Inflação anual → mensal: `inf_mensal = (1 + inf_anual)^(1/12) - 1`
- Período em anos → meses: `n_meses = anos × 12`
- Cálculo sempre em meses internamente

#### Taxa real
```
taxa_real = (1 + taxa_nominal_mensal) / (1 + inflacao_mensal) - 1
```

#### Cenário 1: Preservar (perpétuo)
```
saque_mensal = patrimonio × taxa_real
```
- O patrimônio rende a taxa real e o saque consome exatamente esse rendimento
- Em termos nominais, o saque é corrigido pela inflação a cada mês
- Patrimônio nominal cresce (acompanha inflação), patrimônio real é constante

#### Cenário 2: Consumir (saque fixo nominal)
```
saque = PV × [i × (1+i)^n] / [(1+i)^n - 1]
```
Onde:
- PV = patrimônio acumulado
- i = taxa nominal mensal
- n = período em meses

- Saque é o mesmo nominalmente todos os meses
- Patrimônio zera exatamente no mês N
- Em termos reais, o poder de compra do saque deteriora ao longo do tempo

#### Cenário 3: Consumir (saque corrigido pela inflação)
```
saque_inicial = PV × [tr × (1+tr)^n] / [(1+tr)^n - 1]
```
Onde:
- PV = patrimônio acumulado
- tr = taxa real mensal
- n = período em meses

- Saque inicial é calculado com taxa real
- A cada mês, o saque é multiplicado por `(1 + inflacao_mensal)`
- Patrimônio em termos reais zera no mês N
- Patrimônio nominal pode zerar antes ou depois dependendo da inflação

#### Simulação com saque informado
Para cada cenário, simular mês a mês:
```
saldo = patrimonio
mes = 0
enquanto saldo > 0:
    mes++
    juros = saldo × taxa_nominal_mensal
    saque_efetivo = saque_desejado  # ou saque_desejado × (1 + inflacao)^(mes-1) para cenário 3
    saldo = saldo + juros - saque_efetivo
```
- Retornar mês em que saldo ≤ 0 (duração)
- Se após N meses (ou um limite razoável, ex.: 100 anos) saldo > 0 → "Perpétuo"

#### Estrutura do Resultado
```typescript
interface InputRentabilidade {
  patrimonio: number;
  taxaJuros: number;
  taxaPeriodicidade: 'mensal' | 'anual';
  inflacao: number;
  inflacaoPeriodicidade: 'mensal' | 'anual';
  periodo: number;
  periodoUnidade: 'meses' | 'anos';
  saqueDesejado?: number;
}

interface ResultadoRentabilidade {
  cenarios: {
    preservar: CenarioPreservar;
    consumirNominal: CenarioConsumir;
    consumirReal: CenarioReal;
  };
  evolucaoMensal: {
    preservar: EvolucaoMensal[];
    consumirNominal: EvolucaoMensal[];
    consumirReal: EvolucaoMensal[];
  };
}

interface CenarioPreservar {
  saqueMensalInicial: number;
  patrimonioConstanteReal: number;
  duracao: 'perpetuo';
}

interface CenarioConsumir {
  saqueMensal: number;
  duracaoMeses: number;
  totalSacado: number;
}

interface CenarioReal {
  saqueMensalInicial: number;
  duracaoMeses: number;
  totalSacado: number;
}

interface EvolucaoMensal {
  mes: number;
  saque: number;
  jurosMes: number;
  saldoNominal: number;
  saldoReal: number;
}
```

#### Validações
- Patrimônio > 0
- Taxa de juros ≥ 0
- Inflação ≥ 0
- Período > 0
- Saque desejado ≥ 0 (se informado)
- Taxa real pode ser negativa (juros < inflação) — tratar caso edge:
  - Cenário preservar: saque seria negativo → exibir "Patrimônio deteriora, não é possível preservar"
  - Cenários consumir: função normalmente (saque consome patrimônio mais rápido)

## Critérios de Aceitação
- [ ] Home exibe card "Rentabilidade" com link para `/rentabilidade`
- [ ] Formulário aceita patrimônio, taxa (mensal/anual), inflação (mensal/anual), período (meses/anos), saque desejado opcional
- [ ] Sem saque: exibe 3 ResultCards com saque mensal de cada cenário
- [ ] Com saque: exibe duração do patrimônio para cada cenário (ou "Perpétuo")
- [ ] Gráfico de linha exibe evolução do patrimônio para os 3 cenários
- [ ] Tabs permitem selecionar cenário para tabela detalhada
- [ ] Tabela exibe: mês, saque, juros, saldo nominal, saldo real
- [ ] Taxa real negativa é tratada (mensagem clara no cenário preservar)
- [ ] Layout responsivo (desktop e mobile)
- [ ] Testes unitários cobrindo os 3 cenários e simulação com saque

## Futuro (v2+)
- Integração com calculadora de Juros Compostos (exportar patrimônio acumulado como input)
- Aportes mensais durante a fase de resgate (aposentadoria parcial)
- Comparação lado a lado com a calculadora de Juros Compostos (ciclo completo: acumular → resgatar)
- Exportar resultado para PDF/Excel
- Cenário com imposto de renda sobre rendimentos
- Variação de taxa ao longo do tempo (cenário otimista/pessimista)
