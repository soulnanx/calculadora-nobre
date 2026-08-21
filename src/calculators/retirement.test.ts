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
