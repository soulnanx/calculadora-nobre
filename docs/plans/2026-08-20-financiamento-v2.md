# Financiamento v2 - Plano de Implementação

**Data:** 2026-08-20  
**Spec:** `docs/specs/todo/spec-financiamento-v2.md`  
**Status:** todo

## Objetivo

Adicionar funcionalidades avançadas à calculadora de financiamento:
- Amortizações extras (por prazo e por parcela)
- Taxas e seguros mensais

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

## Tasks

### Task 1: Atualizar tipos para v2

**Files:**
- Modify: `src/types/index.ts`

**Steps:**
1. Adicionar tipos `AmortizacaoExtra` e `TaxaSeguro`
2. Estender `InputFinanciamento` com campos opcionais
3. Estender `ParcelaMensal` com novos campos
4. Estender `ResultadoFinanciamento` com novos totais

**Código:**
```typescript
export interface AmortizacaoExtra {
  mes: number;
  valor: number;
  tipo: 'prazo' | 'parcela';
}

export interface TaxaSeguro {
  mesInicial: number;
  mesFinal: number;
  valorMensal: number;
}

export interface InputFinanciamentoV2 extends InputFinanciamento {
  amortizacoesExtras?: AmortizacaoExtra[];
  taxasSeguros?: TaxaSeguro[];
}

export interface ParcelaMensalV2 extends ParcelaMensal {
  amortizacaoExtra: number;
  taxaSeguro: number;
  parcelaTotal: number;
}

export interface ResultadoFinanciamentoV2 {
  resumo: {
    totalPago: number;
    totalJuros: number;
    totalAmortizacaoExtra: number;
    totalTaxasSeguros: number;
    primeiraParcela: number;
    ultimaParcela: number;
    numeroParcelas: number;
  };
  evolucaoMensal: ParcelaMensalV2[];
}
```

**Validação:**
- TypeScript compila sem erros
- Tipos são exportados corretamente

---

### Task 2: Implementar lógica de amortização extra

**Files:**
- Modify: `src/calculators/amortization.ts`
- Modify: `src/calculators/amortization.test.ts`

**Steps:**
1. Criar função auxiliar `calcularAmortizacaoExtraPorPrazo`
2. Criar função auxiliar `calcularAmortizacaoExtraPorParcela`
3. Atualizar `calcularSAC` para aplicar amortizações extras
4. Atualizar `calcularPrice` para aplicar amortizações extras
5. Adicionar testes para amortização por prazo
6. Adicionar testes para amortização por parcela

**Lógica SAC - Amortização por Prazo:**
```typescript
// Após amortização extra no mês M:
// - Amortização constante permanece igual
// - Número de parcelas restantes = novo_saldo / amortizacao_constante
```

**Lógica Price - Amortização por Prazo:**
```typescript
// Após amortização extra no mês M:
// - Parcela fixa permanece igual
// - Número de parcelas restantes = ln(parcela / (parcela - saldo * taxa)) / ln(1 + taxa)
```

**Lógica Price - Amortização por Parcela:**
```typescript
// Após amortização extra no mês M:
// - Número de parcelas restantes permanece igual
// - Nova parcela = PMT(novo_saldo, taxa, parcelas_restantes)
```

**Testes de Validação:**
1. SAC + amortização por prazo: R$ 100k, 12 meses, 1% ao mês, R$ 20k após mês 6 → 10 parcelas totais
2. Price + amortização por prazo: R$ 100k, 12 meses, 1% ao mês, R$ 20k após mês 6 → parcelas reduzidas
3. Price + amortização por parcela: R$ 100k, 12 meses, 1% ao mês, R$ 20k após mês 6 → nova parcela ≈ R$ 5.899,58

**Validação:**
- Todos os testes existentes passam
- Novos testes passam com valores esperados
- Cálculos matemáticos validados com exemplos reais

---

### Task 3: Implementar lógica de taxas/seguros

**Files:**
- Modify: `src/calculators/amortization.ts`
- Modify: `src/calculators/amortization.test.ts`

**Steps:**
1. Criar função auxiliar `calcularTaxaSeguroMes`
2. Atualizar `calcularSAC` para adicionar taxas/seguros
3. Atualizar `calcularPrice` para adicionar taxas/seguros
4. Atualizar `ResultadoFinanciamento` com total de taxas/seguros
5. Adicionar testes para taxas/seguros

**Lógica:**
```typescript
// Para cada mês:
// taxa_seguro = soma de todas as taxas/seguros ativas naquele mês
// parcela_total = parcela_sistema + taxa_seguro
```

**Testes de Validação:**
1. Taxa fixa: R$ 50/mês dos meses 1-12 → parcela total = parcela base + R$ 50
2. Múltiplas taxas: R$ 50 meses 1-6 + R$ 30 meses 7-12 → valores corretos
3. Total de taxas: R$ 50 × 12 = R$ 600

**Validação:**
- Todos os testes existentes passam
- Novos testes passam com valores esperados
- Total de taxas/seguros calculado corretamente

---

### Task 4: Atualizar UI para amortizações e taxas

**Files:**
- Modify: `src/pages/Financiamento.tsx`

**Steps:**
1. Adicionar estado para `amortizacoesExtras` e `taxasSeguros`
2. Criar seção "Amortizações Extras" no formulário
3. Criar seção "Taxas e Seguros" no formulário
4. Adicionar ResultCards para total de amortização extra e taxas/seguros
5. Atualizar tabela com novas colunas
6. Testar UI manualmente

**UI - Amortizações Extras:**
```tsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Amortizações Extras</h3>
  {amortizacoesExtras.map((amort, index) => (
    <div key={index} className="flex gap-2 items-end">
      <NumberInput
        label="Mês"
        value={amort.mes}
        onChange={(v) => atualizarAmortizacao(index, 'mes', v)}
      />
      <CurrencyInput
        label="Valor"
        value={amort.valor}
        onChange={(v) => atualizarAmortizacao(index, 'valor', v)}
      />
      <RadioGroup
        label="Tipo"
        options={[
          { value: 'prazo', label: 'Prazo' },
          { value: 'parcela', label: 'Parcela' }
        ]}
        value={amort.tipo}
        onChange={(v) => atualizarAmortizacao(index, 'tipo', v)}
      />
      <Button onClick={() => removerAmortizacao(index)}>Remover</Button>
    </div>
  ))}
  <Button onClick={adicionarAmortizacao}>Adicionar Amortização</Button>
</div>
```

**UI - Taxas e Seguros:**
```tsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Taxas e Seguros</h3>
  {taxasSeguros.map((taxa, index) => (
    <div key={index} className="flex gap-2 items-end">
      <NumberInput
        label="Mês Inicial"
        value={taxa.mesInicial}
        onChange={(v) => atualizarTaxa(index, 'mesInicial', v)}
      />
      <NumberInput
        label="Mês Final"
        value={taxa.mesFinal}
        onChange={(v) => atualizarTaxa(index, 'mesFinal', v)}
      />
      <CurrencyInput
        label="Valor Mensal"
        value={taxa.valorMensal}
        onChange={(v) => atualizarTaxa(index, 'valorMensal', v)}
      />
      <Button onClick={() => removerTaxa(index)}>Remover</Button>
    </div>
  ))}
  <Button onClick={adicionarTaxa}>Adicionar Taxa/Seguro</Button>
</div>
```

**Tabela Atualizada:**
| Mês | Saldo Inicial | Juros | Amortização | Amort. Extra | Taxa/Seguro | Parcela Total | Saldo Final |

**Validação:**
- UI responsiva mantida
- Campos de entrada funcionam corretamente
- Cálculos atualizam em tempo real
- Tabela mostra todas as colunas

---

### Task 5: Mover spec para done

**Files:**
- Move: `docs/specs/todo/spec-financiamento-v2.md` → `docs/specs/done/spec-financiamento-v2.md`

**Steps:**
1. Atualizar status da spec para "done"
2. Mover arquivo para pasta `done`
3. Commit

---

## Validação Final

### Testes Automatizados
```bash
npm test
```
- Todos os 17+ testes passam
- Novos testes de amortização extra passam
- Novos testes de taxas/seguros passam

### Build
```bash
npm run build
```
- Build completa sem erros
- TypeScript compila sem erros

### Validação Manual
1. Abrir calculadora de financiamento
2. Testar cenário básico (sem amortizações/taxas) - deve funcionar como v1
3. Adicionar amortização extra por prazo - verificar redução de parcelas
4. Adicionar amortização extra por parcela - verificar redução de valor
5. Adicionar taxa/seguro - verificar aumento da parcela
6. Combinar amortizações e taxas - verificar cálculos corretos
7. Testar responsividade em mobile

### Exemplos de Validação Matemática

**Exemplo 1: SAC + Amortização por Prazo**
- Financiamento: R$ 100.000, 1% ao mês, 12 meses, SAC
- Amortização constante: R$ 8.333,33
- Amortização: R$ 20.000 após mês 6
- Saldo após mês 6: R$ 50.000
- Após amortização: R$ 30.000
- Parcelas restantes: 30.000 / 8.333,33 = 3,6 ≈ 4 meses
- **Total: 6 + 4 = 10 meses** ✓

**Exemplo 2: Price + Amortização por Parcela**
- Financiamento: R$ 100.000, 1% ao mês, 12 meses, Price
- Parcela fixa: R$ 8.884,87
- Amortização: R$ 20.000 após mês 6
- Saldo após mês 6: R$ 54.264,72
- Após amortização: R$ 34.264,72
- Parcelas restantes: 6
- Nova parcela: PMT(34.264,72, 0,01, 6) = R$ 5.899,58
- **Parcela reduz de R$ 8.884,87 para R$ 5.899,58** ✓

**Exemplo 3: Taxas/Seguros**
- Financiamento: R$ 100.000, 1% ao mês, 12 meses
- Parcela base: R$ 8.884,87
- Taxa: R$ 50/mês dos meses 1-12
- Parcela total: R$ 8.934,87
- Total de taxas: R$ 600
- **Total pago: (R$ 8.934,87 × 12) = R$ 107.218,44** ✓

---

## Cronograma

- Task 1: 30 min
- Task 2: 2 horas
- Task 3: 1 hora
- Task 4: 2 horas
- Task 5: 15 min
- **Total: ~5,5 horas**

## Dependências

- Task 1 → Task 2, Task 3
- Task 2, Task 3 → Task 4
- Task 4 → Task 5

## Riscos

1. **Complexidade matemática:** Amortização por prazo no Price requer cálculo de logaritmo
   - Mitigação: Testes rigorosos com valores conhecidos
   
2. **Performance:** Múltiplas amortizações podem tornar cálculo lento
   - Mitigação: Otimizar loops, usar memoization se necessário

3. **UI complexa:** Muitos inputs podem confundir usuário
   - Mitigação: Seções bem organizadas, labels claros

## Critérios de Aceitação

- [ ] Tipos atualizados e exportados
- [ ] Lógica de amortização extra implementada e testada
- [ ] Lógica de taxas/seguros implementada e testada
- [ ] UI atualizada com novos inputs
- [ ] Tabela mostra todas as colunas
- [ ] Todos os testes passam (17+)
- [ ] Build sem erros
- [ ] Validação manual bem-sucedida
- [ ] Spec movida para done
