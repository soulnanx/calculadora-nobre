import { describe, it, expect } from 'vitest';
import { calcularJurosCompostos } from './compound-interest';

describe('calcularJurosCompostos', () => {
  it('deve calcular juros compostos com aporte mensal - taxa mensal', () => {
    const input = {
      valorInicial: 10000,
      aporteMensal: 500,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      periodo: 12,
      periodoUnidade: 'meses' as const,
    };

    const resultado = calcularJurosCompostos(input);

    expect(resultado.resumo.totalInvestido).toBe(16000);
    expect(resultado.resumo.valorFinalNominal).toBeGreaterThan(16000);
    expect(resultado.resumo.totalJuros).toBeGreaterThan(0);
    expect(resultado.evolucaoMensal).toHaveLength(12);
  });

  it('deve converter taxa anual para mensal', () => {
    const input = {
      valorInicial: 10000,
      aporteMensal: 0,
      taxaJuros: 12,
      taxaPeriodicidade: 'anual' as const,
      periodo: 1,
      periodoUnidade: 'anos' as const,
    };

    const resultado = calcularJurosCompostos(input);

    expect(resultado.resumo.valorFinalNominal).toBeCloseTo(11200, 0);
  });

  it('deve converter período de anos para meses', () => {
    const input = {
      valorInicial: 1000,
      aporteMensal: 100,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      periodo: 2,
      periodoUnidade: 'anos' as const,
    };

    const resultado = calcularJurosCompostos(input);

    expect(resultado.evolucaoMensal).toHaveLength(24);
  });

  it('deve calcular valor real com inflação', () => {
    const input = {
      valorInicial: 10000,
      aporteMensal: 500,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      periodo: 12,
      periodoUnidade: 'meses' as const,
      inflacaoPeriodo: 5,
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
    expect(resultado.evolucaoMensal[0].aporteAcumulado).toBe(1100);
    expect(resultado.evolucaoMensal[2].aporteAcumulado).toBe(1300);
  });
});
