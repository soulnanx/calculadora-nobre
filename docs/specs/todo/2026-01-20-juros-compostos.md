# Calculadora de Juros Compostos

**Status:** todo  
**Data:** 2026-01-20  
**Autor:** [a definir]

## Contexto
Primeira calculadora do projeto Calculadora Nobre. Permite simular o crescimento de investimentos com juros compostos e aportes mensais fixos, incluindo ajuste opcional por inflação para visualizar o poder de compra real.

## Arquitetura

### Stack
- **Frontend:** React 18 + Vite + TypeScript
- **Estilo:** Tailwind CSS (minimalista)
- **Gráficos:** Recharts
- **Deploy:** GitHub Pages (estático)

### Estrutura
```
src/
├── components/          # UI reutilizável
├── calculators/         # Lógica pura (sem React)
├── pages/               # Páginas da aplicação
├── lib/                 # Utilitários
└── types/               # TypeScript types
```

### Separação de Responsabilidades
- `calculators/` contém apenas matemática pura (testável isoladamente)
- `pages/` orquestra UI + estado
- `components/` é agnóstico de domínio

## Detalhes de Implementação

### Rotas
- `/` → Home (grid de cards das calculadoras)
- `/juros-compostos` → Calculadora de Juros Compostos

### Página Home
- Grid responsivo de cards
- Cada card: ícone, nome, descrição curta
- Link para a rota da calculadora

### Página Juros Compostos

#### Layout (responsivo)
- **Desktop:** formulário à esquerda, resultado à direita
- **Mobile:** formulário empilha acima do resultado

#### Formulário
- **Valor inicial:** input monetário com máscara (R$ 1.000,00)
- **Aporte mensal:** input monetário com máscara
- **Taxa de juros:** input numérico + radio (Mensal | Anual)
- **Período:** input numérico + radio (Meses | Anos)
- **Inflação no período:** input numérico opcional (%)

#### Resultado
- **Resumo:** cards com valor final nominal, total investido, total em juros, valor real (se inflação informada)
- **Gráfico de linha:** saldo total vs. total investido ao longo do tempo (tooltip ao hover)
- **Tabela:** evolução mês a mês (mês, aporte acumulado, juros acumulados, saldo) com scroll e sticky header

#### Interação
- Cálculo automático em tempo real (debounce 300ms)
- Sem botão "Calcular"
- Estado em `useState` (sem estado global)
- Sem persistência (v1)

### Lógica de Cálculo

#### Fórmula
```
Valor futuro = VI × (1 + i)^n + A × [((1 + i)^n - 1) / i]

Onde:
- VI = Valor inicial
- A  = Aporte mensal
- i  = Taxa de juros (decimal)
- n  = Número de períodos (meses)
```

#### Normalização
- Taxa anual → mensal: `i_mensal = (1 + i_anual)^(1/12) - 1`
- Período em anos → meses: `n_meses = anos × 12`
- Cálculo sempre em meses internamente

#### Ajuste de Inflação
```
Valor real = Valor nominal / (1 + inflacao_no_periodo)
```

#### Estrutura do Resultado
```typescript
interface Resultado {
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

#### Validações
- Taxa não pode ser < -100%
- Período deve ser > 0
- Valores monetários ≥ 0

### Componentes Reutilizáveis
- `CurrencyInput` — input com máscara monetária
- `NumberInput` — input numérico genérico
- `RadioGroup` — grupo de radio buttons estilizado
- `ResultCard` — card de resumo (valor grande + label)
- `DataTable` — tabela com scroll e sticky header

## Critérios de Aceitação
- [ ] Home exibe grid de cards com link para juros compostos
- [ ] Formulário aceita valor inicial, aporte, taxa (mensal/anual), período (meses/anos), inflação opcional
- [ ] Cálculo atualiza automaticamente conforme usuário digita
- [ ] Resultado mostra valor final nominal, total investido, total em juros
- [ ] Se inflação informada, mostra valor real ajustado
- [ ] Gráfico de linha exibe evolução (saldo vs. investido)
- [ ] Tabela exibe evolução mês a mês com scroll
- [ ] Layout responsivo (desktop e mobile)
- [ ] Deploy automático via GitHub Pages

## Futuro (v2+)
- Integração com Supabase (auth + salvar simulações)
- Histórico de simulações salvas
- Novas calculadoras (financiamento, aposentadoria, etc.)
- Exportar resultado para PDF/Excel
- Comparar múltiplos cenários lado a lado
- Dark mode
