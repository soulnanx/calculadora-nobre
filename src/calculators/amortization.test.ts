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