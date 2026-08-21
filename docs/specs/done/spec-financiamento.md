# Calculadora de Financiamento Imobiliário

**Status:** done  
**Data:** 2026-08-20  
**Autor:** [a definir]

## Contexto

Financiamento imobiliário é uma das decisões financeiras mais importantes da vida. Existem dois sistemas principais de amortização no Brasil:

- **SAC (Sistema de Amortização Constante):** Parcelas decrescentes, amortização constante, total de juros menor
- **Price (Sistema Francês):** Parcelas fixas, amortização crescente, total de juros maior

Esta calculadora permite simular e comparar os dois sistemas para tomar decisões informadas sobre financiamento.

## Arquitetura

### Stack
- **Frontend:** React 18 + Vite + TypeScript
- **Estilo:** Tailwind CSS (minimalista)
- **Gráficos:** Recharts
- **Deploy:** GitHub Pages (estático)

### Estrutura
```
src/
├── calculators/
│   └── amortization.ts       # Lógica pura SAC e Price
├── pages/
│   └── Financiamento.tsx     # Página da calculadora
└── types/
    └── index.ts              # Adicionar tipos de financiamento
```

### Separação de Responsabilidades
- `calculators/amortization.ts` contém apenas matemática pura (testável isoladamente)
- `pages/Financiamento.tsx` orquestra UI + estado
- Reutiliza componentes existentes (`CurrencyInput`, `NumberInput`, `RadioGroup`, `ResultCard`, `DataTable`)

## Detalhes de Implementação

### Rotas
- `/financiamento` → Calculadora de Financiamento Imobiliário

### Home
- Adicionar novo card no array `calculadoras`:
  - path: `/financiamento`
  - icon: `🏠`
  - nome: `Financiamento`
  - descricao: `Simule financiamento imobiliário SAC e Price`

### Página Financiamento

#### Layout (responsivo)
- **Desktop:** formulário à esquerda, resultado à direita
- **Mobile:** formulário empilha acima do resultado
- Mesmo padrão visual das outras calculadoras

#### Formulário

| Campo | Componente | Default | Obrigatório |
|---|---|---|---|
| Valor do financiamento | `CurrencyInput` | R$ 300.000,00 | Sim |
| Taxa de juros | `NumberInput` + `RadioGroup` (Mensal/Anual) | 10% anual | Sim |
| Prazo | `NumberInput` + `RadioGroup` (Meses/Anos) | 30 anos | Sim |
| Sistema | `RadioGroup` (SAC/Price) | SAC | Sim |

#### Resultado

**Resumo (3-4 ResultCards):**
- Total pago
- Total de juros
- Parcela (fixa para Price, primeira/última para SAC)
- Número de parcelas

**Gráfico de linha:**
- Eixo X: mês
- Eixo Y: valor em R$
- Modo normal: 2 linhas (saldo devedor e parcela do sistema selecionado)
- Modo comparação (botão "Comparar" ativo): 4 linhas (saldo devedor SAC, saldo devedor Price, parcela SAC, parcela Price)

**Tabela de evolução mensal:**
- Colunas: Mês, Saldo Inicial, Juros, Amortização, Parcela, Saldo Final
- Scroll com sticky header

### Interação
- Cálculo automático em tempo real (sem botão "Calcular")
- Estado em `useState` (sem estado global)
- Sem persistência (v1)
- Botão "Comparar" que mostra SAC e Price lado a lado no gráfico

### Lógica de Cálculo

#### Normalização
- Taxa anual → mensal: `i_mensal = (1 + i_anual)^(1/12) - 1`
- Período em anos → meses: `n_meses = anos × 12`
- Cálculo sempre em meses internamente

#### SAC (Sistema de Amortização Constante)

```
amortizacao_constante = valor_financiamento / n_meses

Para cada mês i (1 a n):
  juros_i = saldo_devedor_{i-1} × taxa_mensal
  parcela_i = amortizacao_constante + juros_i
  saldo_devedor_i = saldo_devedor_{i-1} - amortizacao_constante
```

**Características:**
- Amortização constante todos os meses
- Juros decrescentes (porque saldo devedor diminui)
- Parcelas decrescentes
- Primeira parcela é a maior, última é a menor

#### Price (Sistema Francês)

```
parcela_fixa = valor × [i × (1+i)^n] / [(1+i)^n - 1]

Para cada mês i (1 a n):
  juros_i = saldo_devedor_{i-1} × taxa_mensal
  amortizacao_i = parcela_fixa - juros_i
  saldo_devedor_i = saldo_devedor_{i-1} - amortizacao_i
```

**Características:**
- Parcela fixa todos os meses
- Juros decrescentes
- Amortização crescente (porque juros diminuem)
- Saldo devedor diminui mais lentamente que SAC

#### Estrutura dos Tipos

```typescript
interface InputFinanciamento {
  valor: number;
  taxaJuros: number;
  taxaPeriodicidade: 'mensal' | 'anual';
  prazo: number;
  prazoUnidade: 'meses' | 'anos';
  sistema: 'SAC' | 'Price';
}

interface ParcelaMensal {
  mes: number;
  saldoInicial: number;
  juros: number;
  amortizacao: number;
  parcela: number;
  saldoFinal: number;
}

interface ResultadoFinanciamento {
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

#### Validações
- Valor do financiamento > 0
- Taxa de juros ≥ 0
- Prazo > 0
- Taxa de juros = 0 → tratamento especial (sem juros, apenas divide valor pelo prazo)

## Critérios de Aceitação
- [ ] Home exibe card "Financiamento" com link para `/financiamento`
- [ ] Formulário aceita valor, taxa (mensal/anual), prazo (meses/anos), sistema (SAC/Price)
- [ ] Cálculo SAC correto: parcelas decrescentes, amortização constante
- [ ] Cálculo Price correto: parcelas fixas, amortização crescente
- [ ] Resultado mostra total pago, total juros, parcelas
- [ ] Gráfico exibe evolução do saldo devedor e parcelas
- [ ] Tabela exibe evolução mês a mês
- [ ] Botão "Comparar" mostra SAC e Price lado a lado no gráfico
- [ ] Layout responsivo (desktop e mobile)
- [ ] Testes unitários cobrindo SAC e Price

## Futuro (v2+)
- Amortização extra (por prazo e por parcela)
- Taxas e seguros adicionais
- Correção monetária (TR/IPCA)
- Comparação lado a lado sempre ativa (duas colunas)
- Exportar tabela para CSV/Excel
- Outros sistemas de amortização (Misto, Americano, Bullet)
- Integração com calculadora de Rentabilidade (simular resgate após quitar financiamento)
