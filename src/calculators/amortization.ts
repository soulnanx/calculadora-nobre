import { InputFinanciamento, ResultadoFinanciamento, ParcelaMensal } from '../types';

export function calcularFinanciamento(
  input: InputFinanciamento
): ResultadoFinanciamento {
  // Normalizar taxa para mensal
  let taxaMensal = input.taxaJuros / 100;
  if (input.taxaPeriodicidade === 'anual') {
    taxaMensal = Math.pow(1 + taxaMensal, 1 / 12) - 1;
  }

  // Normalizar período para meses
  let prazoMeses = input.prazo;
  if (input.prazoUnidade === 'anos') {
    prazoMeses = input.prazo * 12;
  }

  // Calcular evolução mensal baseado no sistema
  const evolucaoMensal: ParcelaMensal[] = [];
  
  if (input.sistema === 'SAC') {
    calcularSAC(input.valor, taxaMensal, prazoMeses, evolucaoMensal);
  } else {
    calcularPrice(input.valor, taxaMensal, prazoMeses, evolucaoMensal);
  }

  // Calcular resumo
  const totalPago = evolucaoMensal.reduce((sum, p) => sum + p.parcela, 0);
  const totalJuros = evolucaoMensal.reduce((sum, p) => sum + p.juros, 0);

  return {
    resumo: {
      totalPago,
      totalJuros,
      primeiraParcela: evolucaoMensal[0].parcela,
      ultimaParcela: evolucaoMensal[evolucaoMensal.length - 1].parcela,
      numeroParcelas: prazoMeses,
    },
    evolucaoMensal,
  };
}

function calcularSAC(
  valor: number,
  taxaMensal: number,
  prazoMeses: number,
  evolucao: ParcelaMensal[]
): void {
  const amortizacaoConstante = valor / prazoMeses;
  let saldoDevedor = valor;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    const saldoInicial = saldoDevedor;
    const juros = saldoDevedor * taxaMensal;
    const parcela = amortizacaoConstante + juros;
    
    saldoDevedor -= amortizacaoConstante;

    evolucao.push({
      mes,
      saldoInicial,
      juros,
      amortizacao: amortizacaoConstante,
      parcela,
      saldoFinal: saldoDevedor,
    });
  }
}

function calcularPrice(
  valor: number,
  taxaMensal: number,
  prazoMeses: number,
  evolucao: ParcelaMensal[]
): void {
  let parcelaFixa: number;
  
  if (taxaMensal === 0) {
    // Sem juros: parcela = valor / prazo
    parcelaFixa = valor / prazoMeses;
  } else {
    // Fórmula PMT
    parcelaFixa = valor * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / 
                  (Math.pow(1 + taxaMensal, prazoMeses) - 1);
  }

  let saldoDevedor = valor;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    const saldoInicial = saldoDevedor;
    const juros = saldoDevedor * taxaMensal;
    const amortizacao = parcelaFixa - juros;
    
    saldoDevedor -= amortizacao;

    evolucao.push({
      mes,
      saldoInicial,
      juros,
      amortizacao,
      parcela: parcelaFixa,
      saldoFinal: saldoDevedor,
    });
  }
}