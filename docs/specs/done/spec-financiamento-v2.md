# Calculadora de Financiamento Imobiliário v2

**Status:** done  
**Data:** 2026-08-20  
**Autor:** [a definir]

## Contexto

A v1 da calculadora de financiamento implementa os sistemas SAC e Price com comparação. A v2 adiciona funcionalidades avançadas:

1. **Amortização extra:** Pagamentos adicionais que reduzem o saldo devedor mais rapidamente
2. **Taxas e seguros:** Custos adicionais que são somados à parcela mensal

## Arquitetura

### Extensão da v1
- Reutiliza toda a lógica existente de SAC e Price
- Adiciona novos inputs para amortizações extras e taxas/seguros
- Atualiza a lógica de cálculo para considerar esses fatores

### Estrutura
```
src/
├── calculators/
│   └── amortization.ts       # (modificar) Adicionar lógica de amortização extra e taxas
├── pages/
│   └── Financiamento.tsx     # (modificar) Adicionar UI para amortizações e taxas
└── types/
    └── index.ts              # (modificar) Adicionar tipos para amortizações e taxas
```

## Detalhes de Implementação

### Novos Inputs

#### Amortizações Extras
Lista de amortizações, cada uma com:
- **Mês:** Em qual mês a amortização será feita (após o pagamento da parcela daquele mês)
- **Valor:** Valor da amortização extra (R$)
- **Tipo:** Por prazo ou por parcela

#### Taxas e Seguros
Lista de taxas/seguros, cada uma com:
- **Mês inicial:** Quando começa a ser cobrada
- **Mês final:** Quando termina de ser cobrada
- **Valor mensal:** Valor cobrado por mês (R$)

### Lógica de Cálculo

#### Amortização Extra por Prazo

**Conceito:** Após pagar a amortização extra, o saldo devedor diminui, mas o valor da amortização constante permanece o mesmo (no SAC) ou o valor da parcela permanece o mesmo (no Price). O número de parcelas restantes é recalculado.

**Fórmula (SAC):**
```
Após amortização extra no mês M:
  novo_saldo = saldo_atual - valor_amortizacao
  amortizacao_constante = valor_original / prazo_original (permanece igual)
  numero_parcelas_restantes = novo_saldo / amortizacao_constante
```

**Fórmula (Price):**
```
Após amortização extra no mês M:
  novo_saldo = saldo_atual - valor_amortizacao
  parcela_fixa = parcela_fixa_original (permanece igual)
  numero_parcelas_restantes = ln(parcela_fixa / (parcela_fixa - novo_saldo × taxa)) / ln(1 + taxa)
```

**Exemplo de validação:**
- Financiamento: R$ 100.000, taxa 1% ao mês, 12 meses, SAC
- Amortização constante: R$ 8.333,33
- Parcela mês 1: R$ 9.333,33 (8.333,33 + 1.000 juros)
- Saldo após mês 1: R$ 91.666,67

**Cenário: Amortização de R$ 20.000 após mês 6**
- Saldo após mês 6 (sem amortização): R$ 50.000
- Amortização extra: R$ 20.000
- Novo saldo: R$ 30.000
- Amortização constante permanece: R$ 8.333,33
- Novas parcelas restantes: 30.000 / 8.333,33 = 3,6 ≈ 4 meses
- **Total de parcelas: 6 + 4 = 10 meses** (em vez de 12)

#### Amortização Extra por Parcela

**Conceito:** Após pagar a amortização extra, o saldo devedor diminui, mas o número de parcelas restantes permanece o mesmo. O valor da parcela é recalculado.

**Fórmula (Price):**
```
Após amortização extra no mês M:
  novo_saldo = saldo_atual - valor_amortizacao
  parcelas_restantes = prazo_total - M
  nova_parcela = novo_saldo × [taxa × (1+taxa)^parcelas_restantes] / [(1+taxa)^parcelas_restantes - 1]
```

**Exemplo de validação:**
- Financiamento: R$ 100.000, taxa 1% ao mês, 12 meses, Price
- Parcela fixa: R$ 8.884,87
- Saldo após mês 6: R$ 54.264,72

**Cenário: Amortização de R$ 20.000 após mês 6**
- Novo saldo: R$ 34.264,72
- Parcelas restantes: 6
- Nova parcela: 34.264,72 × [0,01 × (1,01)^6] / [(1,01)^6 - 1] = R$ 5.899,58
- **Parcela diminui de R$ 8.884,87 para R$ 5.899,58**

#### Taxas e Seguros

**Conceito:** Valor fixo adicionado à parcela mensal durante um período específico.

**Fórmula:**
```
parcela_total = parcela_sistema + taxa_seguro (se mês estiver no período)
```

**Exemplo de validação:**
- Financiamento: R$ 100.000, taxa 1% ao mês, 12 meses, Price
- Parcela: R$ 8.884,87
- Taxa de seguro: R$ 50,00 dos meses 1 a 12
- Parcela total meses 1-12: R$ 8.934,87

### Estrutura dos Tipos

```typescript
interface AmortizacaoExtra {
  mes: number;
  valor: number;
  tipo: 'prazo' | 'parcela';
}

interface TaxaSeguro {
  mesInicial: number;
  mesFinal: number;
  valorMensal: number;
}

interface InputFinanciamentoV2 extends InputFinanciamento {
  amortizacoesExtras?: AmortizacaoExtra[];
  taxasSeguros?: TaxaSeguro[];
}

interface ParcelaMensalV2 extends ParcelaMensal {
  amortizacaoExtra?: number;
  taxaSeguro: number;
  parcelaTotal: number;
}

interface ResultadoFinanciamentoV2 extends ResultadoFinanciamento {
  evolucaoMensal: ParcelaMensalV2[];
  resumo: {
    totalPago: number;
    totalJuros: number;
    totalAmortizacaoExtra: number;
    totalTaxasSeguros: number;
    primeiraParcela: number;
    ultimaParcela: number;
    numeroParcelas: number;
  };
}
```

### UI

#### Formulário
- Seção "Amortizações Extras":
  - Campo de notação de parcelas (ex: `1-5`, `3,7,12-15,20`) com parser que expande ranges
  - Campo de valor da amortização + tipo (radio: prazo/parcela)
  - Botões "Adicionar em N parcela(s)" (soma valores existentes) e "Substituir em N parcela(s)" (sobrescreve valores existentes) — mesclagem por (mês + tipo)
  - Gerador de sequência: "começando em X, a cada Y, até Z" com botão "Gerar sequência" que preenche o campo de notação
  - Lista de amortizações aplicadas com edição/remoção por linha
- Seção "Taxas e Seguros":
  - Botão "Adicionar taxa/seguro"
  - Para cada taxa: mês inicial, mês final, valor mensal
  - Botão "Remover" em cada linha
- Campo "Data de início" (input month) que determina as datas das parcelas

#### Resultado
- ResultCards adicionais:
  - Total de amortização extra
  - Total de taxas/seguros
  - Nº parcelas (exibido como número inteiro, não moeda)
- Texto "Última parcela em: MM/AAAA"
- Tabela atualizada com colunas:
  - Mês | MM/AAAA, Saldo Inicial, Juros, Amortização, Amortização Extra, Taxa/Seguro, Parcela Total, Saldo Final
- Layout em 1 coluna (largura total, max-w-3xl) — formulário empilhado, resultado abaixo
- Quando campos essenciais (valor/prazo) estão zerados: mensagem "Preencha o valor do financiamento e o prazo para calcular a simulação" em vez de renderizar resultados quebrados

### Correções de Cálculo (após v2 inicial)

- **Ordem da amortização extra**: aplicada APÓS o pagamento da parcela do mês (conforme site de referência), não antes
- **Guarda contra campos vazios**: `prazo <= 0`, `valor <= 0` ou `NaN` retornam resultado vazio seguro (evita divisão por zero e crash na UI)
- **NumberInput preserva texto vazio**: o campo pode ficar vazio enquanto o usuário digita (não força "0" visível)

### Validação Matemática

Para garantir que a implementação está correta, os testes devem validar:

1. **Amortização por prazo:**
   - Financiamento R$ 100.000, 1% ao mês, 12 meses, SAC
   - Amortização R$ 20.000 após mês 6
   - Esperado: Total de parcelas = 10 (6 + 4)
   - Esperado: Total de juros < cenário sem amortização

2. **Amortização por parcela:**
   - Financiamento R$ 100.000, 1% ao mês, 12 meses, Price
   - Amortização R$ 20.000 após mês 6
   - Esperado: Nova parcela após mês 6 ≈ R$ 5.899,58
   - Esperado: Total de juros < cenário sem amortização

3. **Taxas/Seguros:**
   - Financiamento R$ 100.000, 1% ao mês, 12 meses
   - Taxa R$ 50 dos meses 1-12
   - Esperado: Parcela total = parcela base + R$ 50
   - Esperado: Total pago = total sem taxa + (R$ 50 × 12)

4. **Combinação:**
   - Financiamento com amortização extra + taxas/seguros
   - Esperado: Cálculo correto de ambos

## Critérios de Aceitação
- [x] Formulário permite adicionar múltiplas amortizações extras
- [x] Notação de parcelas (ranges, listas, combinações) com parser
- [x] Gerador de sequência de parcelas
- [x] Botões Adicionar (soma) e Substituir (sobrescreve) com mesclagem por mês+tipo
- [x] Formulário permite adicionar múltiplas taxas/seguros
- [x] Amortização por prazo reduz corretamente o número de parcelas
- [x] Amortização por parcela reduz corretamente o valor da parcela
- [x] Amortização extra aplicada APÓS o pagamento da parcela
- [x] Taxas/seguros são somados à parcela no período correto
- [x] Resultado mostra total de amortização extra e taxas/seguros
- [x] Tabela mostra colunas adicionais (amortização extra, taxa/seguro, parcela total)
- [x] Datas das parcelas (MM/AAAA) e data da última parcela
- [x] Testes validam a matemática com exemplos reais (incluindo site de referência)
- [x] Layout em 1 coluna (responsivo)
- [x] Campos vazios não crasham a aplicação (guardas + mensagem de fallback)
- [x] Validação contra site de referência (R$ 115.688,99, SAC, 9,89% a.a, 36 meses)

## Futuro (v3+)
- Correção monetária (TR/IPCA)
- Exportar tabela para CSV/Excel
- Outros sistemas de amortização (Misto, Americano, Bullet)
- Integração com calculadora de Rentabilidade
