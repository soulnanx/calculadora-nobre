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
  let taxaMensal = normalizarTaxaMensal(input.taxaJuros, input.taxaPeriodicidade);
  let prazoMeses = normalizarPrazoMeses(input.prazo, input.prazoUnidade);

  const evolucaoMensal: ParcelaMensal[] = [];
  
  if (input.sistema === 'SAC') {
    calcularSAC(input.valor, taxaMensal, prazoMeses, evolucaoMensal);
  } else {
    calcularPrice(input.valor, taxaMensal, prazoMeses, evolucaoMensal);
  }

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

function normalizarTaxaMensal(taxaJuros: number, taxaPeriodicidade: 'mensal' | 'anual'): number {
  let taxaMensal = taxaJuros / 100;
  if (taxaPeriodicidade === 'anual') {
    taxaMensal = Math.pow(1 + taxaMensal, 1 / 12) - 1;
  }
  return taxaMensal;
}

function normalizarPrazoMeses(prazo: number, prazoUnidade: 'meses' | 'anos'): number {
  return prazoUnidade === 'anos' ? prazo * 12 : prazo;
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
  let parcelaFixa = calcularPMT(valor, taxaMensal, prazoMeses);
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

function calcularPMT(valor: number, taxaMensal: number, prazoMeses: number): number {
  if (taxaMensal === 0) {
    return valor / prazoMeses;
  }
  return valor * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / 
        (Math.pow(1 + taxaMensal, prazoMeses) - 1);
}

function gerarData(mes: number, dataInicio?: string): string {
  if (!dataInicio) return String(mes);
  const [ano, mesInicial] = dataInicio.split('-').map(Number);
  const data = new Date(ano, mesInicial - 1 + mes, 1);
  const mm = String(data.getMonth() + 1).padStart(2, '0');
  return `${mm}/${data.getFullYear()}`;
}

export function calcularFinanciamentoV2(
  input: InputFinanciamentoV2
): ResultadoFinanciamentoV2 {
  const taxaMensal = normalizarTaxaMensal(input.taxaJuros, input.taxaPeriodicidade);
  const prazoMeses = normalizarPrazoMeses(input.prazo, input.prazoUnidade);
  const amortizacoesExtras = input.amortizacoesExtras || [];
  const taxasSeguros = input.taxasSeguros || [];

  const evolucaoMensal: ParcelaMensalV2[] = [];
  
  if (input.sistema === 'SAC') {
    calcularSACV2(input.valor, taxaMensal, prazoMeses, evolucaoMensal, 
                  amortizacoesExtras, taxasSeguros, input.dataInicio);
  } else {
    calcularPriceV2(input.valor, taxaMensal, prazoMeses, evolucaoMensal,
                    amortizacoesExtras, taxasSeguros, input.dataInicio);
  }

  const totalPago = evolucaoMensal.reduce((sum, p) => sum + p.parcelaTotal, 0);
  const totalJuros = evolucaoMensal.reduce((sum, p) => sum + p.juros, 0);
  const totalAmortizacaoExtra = evolucaoMensal.reduce((sum, p) => sum + p.amortizacaoExtra, 0);
  const totalTaxasSeguros = evolucaoMensal.reduce((sum, p) => sum + p.taxaSeguro, 0);

  const ultima = evolucaoMensal[evolucaoMensal.length - 1];

  return {
    resumo: {
      totalPago,
      totalJuros,
      totalAmortizacaoExtra,
      totalTaxasSeguros,
      primeiraParcela: evolucaoMensal[0].parcelaTotal,
      ultimaParcela: ultima.parcelaTotal,
      numeroParcelas: evolucaoMensal.length,
      dataUltimaParcela: ultima.data,
    },
    evolucaoMensal,
  };
}

function calcularTaxaSeguroMes(mes: number, taxasSeguros: TaxaSeguro[]): number {
  return taxasSeguros
    .filter(t => mes >= t.mesInicial && mes <= t.mesFinal)
    .reduce((sum, t) => sum + t.valorMensal, 0);
}

function aplicarAmortizacoesExtras(
  mes: number,
  saldoDevedor: number,
  amortizacoesExtras: AmortizacaoExtra[]
): { novoSaldo: number; totalExtra: number; tipoAmort: 'prazo' | 'parcela' | null } {
  const extras = amortizacoesExtras.filter(a => a.mes === mes);
  let novoSaldo = saldoDevedor;
  let totalExtra = 0;
  let tipoAmort: 'prazo' | 'parcela' | null = null;

  extras.forEach(a => {
    novoSaldo -= a.valor;
    totalExtra += a.valor;
    if (!tipoAmort) tipoAmort = a.tipo;
  });

  return { novoSaldo, totalExtra, tipoAmort };
}

function calcularSACV2(
  valor: number,
  taxaMensal: number,
  prazoMeses: number,
  evolucao: ParcelaMensalV2[],
  amortizacoesExtras: AmortizacaoExtra[],
  taxasSeguros: TaxaSeguro[],
  dataInicio?: string
): void {
  let amortizacaoConstante = valor / prazoMeses;
  let saldoDevedor = valor;
  let mes = 1;

  while (saldoDevedor > 0.01 && mes <= prazoMeses * 2) {
    const saldoInicial = saldoDevedor;
    const juros = saldoDevedor * taxaMensal;
    const taxaSeguro = calcularTaxaSeguroMes(mes, taxasSeguros);

    // 1. Pagar a parcela do mês
    const amortizacao = Math.min(amortizacaoConstante, saldoDevedor);
    const parcelaBase = amortizacao + juros;
    const parcelaTotal = parcelaBase + taxaSeguro;
    
    saldoDevedor -= amortizacao;

    // 2. Aplicar amortização extra APÓS pagar a parcela
    const { novoSaldo, totalExtra, tipoAmort } = aplicarAmortizacoesExtras(mes, saldoDevedor, amortizacoesExtras);
    saldoDevedor = novoSaldo;

    if (tipoAmort === 'prazo') {
      // Mantém amortização constante, reduz prazo: parcelas restantes = saldo / amortizacaoConstante
      // O while termina naturalmente quando saldo <= 0
    } else if (tipoAmort === 'parcela') {
      // Mantém prazo, recalcula amortização para os meses restantes
      const mesesRestantes = prazoMeses - mes;
      if (mesesRestantes > 0 && saldoDevedor > 0) {
        amortizacaoConstante = saldoDevedor / mesesRestantes;
      }
    }

    evolucao.push({
      mes,
      data: gerarData(mes, dataInicio),
      saldoInicial,
      juros,
      amortizacao,
      amortizacaoExtra: totalExtra,
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
  taxasSeguros: TaxaSeguro[],
  dataInicio?: string
): void {
  let parcelaFixa = calcularPMT(valor, taxaMensal, prazoMeses);
  let saldoDevedor = valor;
  let mes = 1;
  let parcelasRestantes = prazoMeses;

  while (saldoDevedor > 0.01 && mes <= prazoMeses * 2) {
    const saldoInicial = saldoDevedor;
    const juros = saldoDevedor * taxaMensal;
    const taxaSeguro = calcularTaxaSeguroMes(mes, taxasSeguros);

    // 1. Pagar a parcela do mês
    const amortizacao = Math.min(parcelaFixa - juros, saldoDevedor);
    const parcelaBase = parcelaFixa;
    const parcelaTotal = parcelaBase + taxaSeguro;
    
    saldoDevedor -= amortizacao;

    // 2. Aplicar amortização extra APÓS pagar a parcela
    const { novoSaldo, totalExtra, tipoAmort } = aplicarAmortizacoesExtras(mes, saldoDevedor, amortizacoesExtras);
    saldoDevedor = novoSaldo;

    if (tipoAmort === 'prazo') {
      // Mantém parcela fixa, recalcula parcelas restantes
      if (taxaMensal > 0 && parcelaFixa > saldoDevedor * taxaMensal) {
        parcelasRestantes = Math.ceil(
          Math.log(parcelaFixa / (parcelaFixa - saldoDevedor * taxaMensal)) / Math.log(1 + taxaMensal)
        );
      } else if (taxaMensal === 0) {
        parcelasRestantes = Math.ceil(saldoDevedor / parcelaFixa);
      }
    } else if (tipoAmort === 'parcela') {
      // Mantém prazo, recalcula parcela para os meses restantes
      const mesesRestantes = prazoMeses - mes;
      if (mesesRestantes > 0 && saldoDevedor > 0) {
        parcelaFixa = calcularPMT(saldoDevedor, taxaMensal, mesesRestantes);
        parcelasRestantes = mesesRestantes;
      }
    }

    evolucao.push({
      mes,
      data: gerarData(mes, dataInicio),
      saldoInicial,
      juros,
      amortizacao,
      amortizacaoExtra: totalExtra,
      taxaSeguro,
      parcela: parcelaBase,
      parcelaTotal,
      saldoFinal: Math.max(0, saldoDevedor),
    });

    parcelasRestantes--;
    mes++;
  }
}