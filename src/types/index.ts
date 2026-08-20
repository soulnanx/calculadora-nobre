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
