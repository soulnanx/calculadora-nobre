export interface InputJurosCompostos {
  valorInicial: number;
  aporteMensal: number;
  taxaJuros: number;
  taxaPeriodicidade: 'mensal' | 'anual';
  periodo: number;
  periodoUnidade: 'meses' | 'anos';
  inflacaoPeriodo?: number;
}

export interface ResultadoJurosCompostos {
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

export interface InputRentabilidade {
  patrimonio: number;
  taxaJuros: number;
  taxaPeriodicidade: 'mensal' | 'anual';
  inflacao: number;
  inflacaoPeriodicidade: 'mensal' | 'anual';
  periodo: number;
  periodoUnidade: 'meses' | 'anos';
  saqueDesejado?: number;
}

export interface CenarioPreservar {
  saqueMensalInicial: number;
  patrimonioConstanteReal: number;
  duracao: 'perpetuo';
}

export interface CenarioConsumir {
  saqueMensal: number;
  duracaoMeses: number;
  totalSacado: number;
}

export interface CenarioReal {
  saqueMensalInicial: number;
  duracaoMeses: number;
  totalSacado: number;
}

export interface EvolucaoMensalRentabilidade {
  mes: number;
  saque: number;
  jurosMes: number;
  saldoNominal: number;
  saldoReal: number;
}

export interface ResultadoRentabilidade {
  cenarios: {
    preservar: CenarioPreservar;
    consumirNominal: CenarioConsumir;
    consumirReal: CenarioReal;
  };
  evolucaoMensal: {
    preservar: EvolucaoMensalRentabilidade[];
    consumirNominal: EvolucaoMensalRentabilidade[];
    consumirReal: EvolucaoMensalRentabilidade[];
  };
}

export interface InputFinanciamento {
  valor: number;
  taxaJuros: number;
  taxaPeriodicidade: 'mensal' | 'anual';
  prazo: number;
  prazoUnidade: 'meses' | 'anos';
  sistema: 'SAC' | 'Price';
}

export interface ParcelaMensal {
  mes: number;
  saldoInicial: number;
  juros: number;
  amortizacao: number;
  parcela: number;
  saldoFinal: number;
}

export interface ResultadoFinanciamento {
  resumo: {
    totalPago: number;
    totalJuros: number;
    primeiraParcela: number;
    ultimaParcela: number;
    numeroParcelas: number;
  };
  evolucaoMensal: ParcelaMensal[];
}

// v2 - Amortização extra e taxas/seguros
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
