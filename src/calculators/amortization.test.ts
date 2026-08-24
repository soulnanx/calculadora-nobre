import { describe, it, expect } from 'vitest';
import { calcularFinanciamento, calcularFinanciamentoV2 } from './amortization';

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

describe('calcularFinanciamentoV2', () => {
  it('deve calcular SAC com amortização extra por prazo', () => {
    const input = {
      valor: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'SAC' as const,
      amortizacoesExtras: [
        { mes: 6, valor: 20000, tipo: 'prazo' as const }
      ],
    };

    const resultado = calcularFinanciamentoV2(input);

    // Amortização constante = 100000 / 12 = 8333.33
    // Saldo após mês 6: 50000
    // Após amortização: 30000
    // Parcelas restantes: 30000 / 8333.33 = 3.6 ≈ 4 meses
    // Total: 6 + 4 = 10 meses
    expect(resultado.resumo.numeroParcelas).toBeLessThanOrEqual(11);
    expect(resultado.resumo.numeroParcelas).toBeGreaterThanOrEqual(9);
    expect(resultado.resumo.totalAmortizacaoExtra).toBe(20000);
    expect(resultado.resumo.totalJuros).toBeLessThan(
      calcularFinanciamentoV2({ ...input, amortizacoesExtras: [] }).resumo.totalJuros
    );
  });

  it('deve calcular Price com amortização extra por parcela', () => {
    const input = {
      valor: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'Price' as const,
      amortizacoesExtras: [
        { mes: 6, valor: 20000, tipo: 'parcela' as const }
      ],
    };

    const resultado = calcularFinanciamentoV2(input);

    // Saldo após mês 6: ~54264.72
    // Após amortização: ~34264.72
    // Parcelas restantes: 6
    // Nova parcela: PMT(34264.72, 0.01, 6) ≈ 5899.58
    expect(resultado.resumo.numeroParcelas).toBe(12);
    expect(resultado.resumo.totalAmortizacaoExtra).toBe(20000);
    
    // Parcela após mês 6 deve ser menor que antes
    const parcelaAntes = resultado.evolucaoMensal[5].parcelaTotal;
    const parcelaDepois = resultado.evolucaoMensal[6].parcelaTotal;
    expect(parcelaDepois).toBeLessThan(parcelaAntes);
  });

  it('deve calcular taxas e seguros', () => {
    const input = {
      valor: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'Price' as const,
      taxasSeguros: [
        { mesInicial: 1, mesFinal: 12, valorMensal: 50 }
      ],
    };

    const resultado = calcularFinanciamentoV2(input);
    const resultadoSemTaxa = calcularFinanciamentoV2({ ...input, taxasSeguros: [] });

    // Parcela total = parcela base + taxa
    expect(resultado.evolucaoMensal[0].taxaSeguro).toBe(50);
    expect(resultado.evolucaoMensal[0].parcelaTotal).toBeCloseTo(
      resultadoSemTaxa.evolucaoMensal[0].parcela + 50,
      2
    );
    
    // Total de taxas = 50 * 12 = 600
    expect(resultado.resumo.totalTaxasSeguros).toBe(600);
  });

  it('deve calcular múltiplas taxas e seguros', () => {
    const input = {
      valor: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'Price' as const,
      taxasSeguros: [
        { mesInicial: 1, mesFinal: 6, valorMensal: 50 },
        { mesInicial: 7, mesFinal: 12, valorMensal: 30 }
      ],
    };

    const resultado = calcularFinanciamentoV2(input);

    // Meses 1-6: taxa = 50
    expect(resultado.evolucaoMensal[0].taxaSeguro).toBe(50);
    expect(resultado.evolucaoMensal[5].taxaSeguro).toBe(50);
    
    // Meses 7-12: taxa = 30
    expect(resultado.evolucaoMensal[6].taxaSeguro).toBe(30);
    expect(resultado.evolucaoMensal[11].taxaSeguro).toBe(30);
    
    // Total = 50*6 + 30*6 = 300 + 180 = 480
    expect(resultado.resumo.totalTaxasSeguros).toBe(480);
  });

  it('deve combinar amortização extra e taxas/seguros', () => {
    const input = {
      valor: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'Price' as const,
      amortizacoesExtras: [
        { mes: 6, valor: 20000, tipo: 'prazo' as const }
      ],
      taxasSeguros: [
        { mesInicial: 1, mesFinal: 12, valorMensal: 50 }
      ],
    };

    const resultado = calcularFinanciamentoV2(input);

    expect(resultado.resumo.totalAmortizacaoExtra).toBe(20000);
    expect(resultado.resumo.totalTaxasSeguros).toBeGreaterThan(0);
    expect(resultado.evolucaoMensal[0].amortizacaoExtra).toBe(0);
    expect(resultado.evolucaoMensal[5].amortizacaoExtra).toBe(20000);
    expect(resultado.evolucaoMensal[0].taxaSeguro).toBe(50);
  });

  it('deve gerar datas das parcelas a partir da data de início', () => {
    const input = {
      valor: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'SAC' as const,
      dataInicio: '2026-08',
    };

    const resultado = calcularFinanciamentoV2(input);

    expect(resultado.evolucaoMensal[0].data).toBe('09/2026');
    expect(resultado.evolucaoMensal[1].data).toBe('10/2026');
    expect(resultado.evolucaoMensal[11].data).toBe('08/2027');
    expect(resultado.resumo.dataUltimaParcela).toBe('08/2027');
  });

  it('deve validar SAC contra site de referência (115688.99, 9.89% aa, 36 meses)', () => {
    const input = {
      valor: 115688.99,
      taxaJuros: 9.89,
      taxaPeriodicidade: 'anual' as const,
      prazo: 36,
      prazoUnidade: 'meses' as const,
      sistema: 'SAC' as const,
      dataInicio: '2026-08',
    };

    const resultado = calcularFinanciamentoV2(input);
    const primeira = resultado.evolucaoMensal[0];
    const ultima = resultado.evolucaoMensal[35];

    // Amortização constante = 115688.99 / 36 = 3213.58
    expect(primeira.amortizacao).toBeCloseTo(3213.58, 2);
    // Parcela 1: juros 912.80 + amortização 3213.58 = 4126.38
    expect(primeira.juros).toBeCloseTo(912.80, 2);
    expect(primeira.parcelaTotal).toBeCloseTo(4126.38, 2);
    // Parcela 36: juros 25.36 + amortização 3213.58 = 3238.94
    expect(ultima.juros).toBeCloseTo(25.36, 2);
    expect(ultima.parcelaTotal).toBeCloseTo(3238.94, 2);
    // Total juros: 16886.77, Total pago: 132575.76
    expect(resultado.resumo.totalJuros).toBeCloseTo(16886.77, 2);
    expect(resultado.resumo.totalPago).toBeCloseTo(132575.76, 2);
    // Datas
    expect(primeira.data).toBe('09/2026');
    expect(ultima.data).toBe('08/2029');
    expect(resultado.resumo.dataUltimaParcela).toBe('08/2029');
  });

  it('deve retornar resultado vazio sem crashar quando prazo é zero', () => {
    const input = {
      valor: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 0,
      prazoUnidade: 'meses' as const,
      sistema: 'SAC' as const,
    };

    const resultado = calcularFinanciamentoV2(input);

    expect(resultado.evolucaoMensal).toHaveLength(0);
    expect(resultado.resumo.numeroParcelas).toBe(0);
    expect(resultado.resumo.totalPago).toBe(0);
  });

  it('deve retornar resultado vazio sem crashar quando valor é zero', () => {
    const input = {
      valor: 0,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'Price' as const,
    };

    const resultado = calcularFinanciamentoV2(input);

    expect(resultado.evolucaoMensal).toHaveLength(0);
    expect(resultado.resumo.totalPago).toBe(0);
  });

  it('deve retornar resultado vazio sem crashar quando valor é pequeno demais para gerar parcelas (ex: 0.01)', () => {
    const input = {
      valor: 0.01,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'SAC' as const,
    };

    const resultado = calcularFinanciamentoV2(input);

    expect(resultado.evolucaoMensal).toHaveLength(0);
    expect(resultado.resumo.numeroParcelas).toBe(0);
    expect(resultado.resumo.totalPago).toBe(0);
  });

  it('deve aplicar amortização extra APÓS pagar a parcela', () => {
    const input = {
      valor: 100000,
      taxaJuros: 1,
      taxaPeriodicidade: 'mensal' as const,
      prazo: 12,
      prazoUnidade: 'meses' as const,
      sistema: 'SAC' as const,
      amortizacoesExtras: [
        { mes: 3, valor: 10000, tipo: 'prazo' as const }
      ],
    };

    const resultado = calcularFinanciamentoV2(input);
    const mes3 = resultado.evolucaoMensal[2];
    const mes4 = resultado.evolucaoMensal[3];

    // No mês 3, a amortização extra é aplicada após a parcela
    // Saldo após 2 parcelas: 100000 - 2*(100000/12) = 83333.33
    // Parcela do mês 3: 8333.33 (amort) + 833.33 (juros) = 9166.67
    // Saldo após parcela do mês 3: 75000
    // Após extra: 75000 - 10000 = 65000
    expect(mes3.amortizacaoExtra).toBe(10000);
    expect(mes3.saldoFinal).toBeCloseTo(65000, 2);
    expect(mes3.saldoInicial).toBeCloseTo(83333.33, 2);
    expect(mes3.amortizacao).toBeCloseTo(8333.33, 2);
    expect(mes3.parcela).toBeCloseTo(9166.67, 2);
    // Mês 4 continua com amortização constante
    expect(mes4.amortizacao).toBeCloseTo(8333.33, 2);
    expect(mes4.saldoFinal).toBeCloseTo(56666.67, 2);
  });
});