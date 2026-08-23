import { 
  InputFinanciamento, 
  ResultadoFinanciamento, 
  ParcelaMensal,
  InputFinanciamentoV2,
  ResultadoFinanciamentoV2,
  ParcelaMensalV2,
  AmortizacaoExtra,
  TaxaSeguro
} from '../types';

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
    parcelaFixa = valor / prazoMeses;
  } else {
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

export function calcularFinanciamentoV2(
  input: InputFinanciamentoV2
): ResultadoFinanciamentoV2 {
  let taxaMensal = input.taxaJuros / 100;
  if (input.taxaPeriodicidade === 'anual') {
    taxaMensal = Math.pow(1 + taxaMensal, 1 / 12) - 1;
  }

  let prazoMeses = input.prazo;
  if (input.prazoUnidade === 'anos') {
    prazoMeses = input.prazo * 12;
  }

  const evolucaoMensal: ParcelaMensalV2[] = [];
  
  if (input.sistema === 'SAC') {
    calcularSACV2(input.valor, taxaMensal, prazoMeses, evolucaoMensal, 
                  input.amortizacoesExtras || [], input.taxasSeguros || []);
  } else {
    calcularPriceV2(input.valor, taxaMensal, prazoMeses, evolucaoMensal,
                    input.amortizacoesExtras || [], input.taxasSeguros || []);
  }

  const totalPago = evolucaoMensal.reduce((sum, p) => sum + p.parcelaTotal, 0);
  const totalJuros = evolucaoMensal.reduce((sum, p) => sum + p.juros, 0);
  const totalAmortizacaoExtra = evolucaoMensal.reduce((sum, p) => sum + p.amortizacaoExtra, 0);
  const totalTaxasSeguros = evolucaoMensal.reduce((sum, p) => sum + p.taxaSeguro, 0);

  return {
    resumo: {
      totalPago,
      totalJuros,
      totalAmortizacaoExtra,
      totalTaxasSeguros,
      primeiraParcela: evolucaoMensal[0].parcelaTotal,
      ultimaParcela: evolucaoMensal[evolucaoMensal.length - 1].parcelaTotal,
      numeroParcelas: evolucaoMensal.length,
    },
    evolucaoMensal,
  };
}

function calcularTaxaSeguroMes(mes: number, taxasSeguros: TaxaSeguro[]): number {
  return taxasSeguros
    .filter(t => mes >= t.mesInicial && mes <= t.mesFinal)
    .reduce((sum, t) => sum + t.valorMensal, 0);
}

function calcularSACV2(
  valor: number,
  taxaMensal: number,
  prazoMeses: number,
  evolucao: ParcelaMensalV2[],
  amortizacoesExtras: AmortizacaoExtra[],
  taxasSeguros: TaxaSeguro[]
): void {
  const amortizacaoConstanteOriginal = valor / prazoMeses;
  let saldoDevedor = valor;
  let amortizacaoConstante = amortizacaoConstanteOriginal;
  let mes = 1;

  while (saldoDevedor > 0.01 && mes <= prazoMeses * 2) {
    const saldoInicial = saldoDevedor;
    const juros = saldoDevedor * taxaMensal;
    const taxaSeguro = calcularTaxaSeguroMes(mes, taxasSeguros);
    
    let amortizacaoExtra = 0;
    const amortExtraMes = amortizacoesExtras.filter(a => a.mes === mes);
    
    if (amortExtraMes.length > 0) {
      amortExtraMes.forEach(a => {
        if (a.tipo === 'prazo') {
          saldoDevedor -= a.valor;
          amortizacaoExtra += a.valor;
        }
      });
    }
    
    const amortizacao = Math.min(amortizacaoConstante, saldoDevedor);
    const parcelaBase = amortizacao + juros;
    const parcelaTotal = parcelaBase + taxaSeguro;
    
    saldoDevedor -= amortizacao;
    
    if (amortExtraMes.some(a => a.tipo === 'parcela')) {
      const totalAmortParcela = amortExtraMes
        .filter(a => a.tipo === 'parcela')
        .reduce((sum, a) => sum + a.valor, 0);
      saldoDevedor -= totalAmortParcela;
      amortizacaoExtra += totalAmortParcela;
      
      const mesesRestantes = prazoMeses - mes;
      if (mesesRestantes > 0) {
        amortizacaoConstante = saldoDevedor / mesesRestantes;
      }
    }

    evolucao.push({
      mes,
      saldoInicial,
      juros,
      amortizacao,
      amortizacaoExtra,
      taxaSeguro,
      parcela: parcelaBase,
      parcelaTotal,
      saldoFinal: Math.max(0, saldoDevedor),
    });

    mes++;
  }
}

function calcularPriceV2(
  valor: number,
  taxaMensal: number,
  prazoMeses: number,
  evolucao: ParcelaMensalV2[],
  amortizacoesExtras: AmortizacaoExtra[],
  taxasSeguros: TaxaSeguro[]
): void {
  let parcelaFixa: number;
  
  if (taxaMensal === 0) {
    parcelaFixa = valor / prazoMeses;
  } else {
    parcelaFixa = valor * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / 
                  (Math.pow(1 + taxaMensal, prazoMeses) - 1);
  }

  let saldoDevedor = valor;
  let mes = 1;
  let mesesRestantes = prazoMeses;

  while (saldoDevedor > 0.01 && mes <= prazoMeses * 2) {
    const saldoInicial = saldoDevedor;
    const juros = saldoDevedor * taxaMensal;
    const taxaSeguro = calcularTaxaSeguroMes(mes, taxasSeguros);
    
    let amortizacaoExtra = 0;
    const amortExtraMes = amortizacoesExtras.filter(a => a.mes === mes);
    
    if (amortExtraMes.length > 0) {
      amortExtraMes.forEach(a => {
        if (a.tipo === 'prazo') {
          saldoDevedor -= a.valor;
          amortizacaoExtra += a.valor;
          
          if (taxaMensal > 0 && parcelaFixa > saldoDevedor * taxaMensal) {
            mesesRestantes = Math.log(parcelaFixa / (parcelaFixa - saldoDevedor * taxaMensal)) / Math.log(1 + taxaMensal);
          }
        }
      });
    }
    
    const amortizacao = parcelaFixa - juros;
    const parcelaBase = parcelaFixa;
    const parcelaTotal = parcelaBase + taxaSeguro;
    
    saldoDevedor -= amortizacao;
    
    if (amortExtraMes.some(a => a.tipo === 'parcela')) {
      const totalAmortParcela = amortExtraMes
        .filter(a => a.tipo === 'parcela')
        .reduce((sum, a) => sum + a.valor, 0);
      saldoDevedor -= totalAmortParcela;
      amortizacaoExtra += totalAmortParcela;
      
      mesesRestantes = prazoMeses - mes;
      if (mesesRestantes > 0 && taxaMensal > 0) {
        parcelaFixa = saldoDevedor * (taxaMensal * Math.pow(1 + taxaMensal, mesesRestantes)) / 
                      (Math.pow(1 + taxaMensal, mesesRestantes) - 1);
      } else if (mesesRestantes > 0) {
        parcelaFixa = saldoDevedor / mesesRestantes;
      }
    }

    evolucao.push({
      mes,
      saldoInicial,
      juros,
      amortizacao,
      amortizacaoExtra,
      taxaSeguro,
      parcela: parcelaBase,
      parcelaTotal,
      saldoFinal: Math.max(0, saldoDevedor),
    });

    mesesRestantes--;
    mes++;
  }
}