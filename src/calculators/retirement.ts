import {
  InputRentabilidade,
  ResultadoRentabilidade,
  CenarioPreservar,
  CenarioConsumir,
  CenarioReal,
  EvolucaoMensalRentabilidade,
} from '../types';

export function calcularRentabilidade(
  input: InputRentabilidade
): ResultadoRentabilidade {
  // Normalizar taxa para mensal
  let taxaMensal = input.taxaJuros / 100;
  if (input.taxaPeriodicidade === 'anual') {
    taxaMensal = Math.pow(1 + taxaMensal, 1 / 12) - 1;
  }

  // Normalizar inflação para mensal
  let inflacaoMensal = input.inflacao / 100;
  if (input.inflacaoPeriodicidade === 'anual') {
    inflacaoMensal = Math.pow(1 + inflacaoMensal, 1 / 12) - 1;
  }

  // Normalizar período para meses
  let periodoMeses = input.periodo;
  if (input.periodoUnidade === 'anos') {
    periodoMeses = input.periodo * 12;
  }

  // Calcular taxa real
  const taxaReal = (1 + taxaMensal) / (1 + inflacaoMensal) - 1;

  // Cenário 1: Preservar (perpétuo)
  const saquePreservar = input.patrimonio * taxaReal;
  const cenarioPreservar: CenarioPreservar = {
    saqueMensalInicial: saquePreservar,
    patrimonioConstanteReal: input.patrimonio,
    duracao: 'perpetuo',
  };

  // Cenário 2: Consumir nominal (PMT com taxa nominal)
  let saqueConsumirNominal: number;
  if (taxaMensal === 0) {
    saqueConsumirNominal = input.patrimonio / periodoMeses;
  } else {
    saqueConsumirNominal =
      input.patrimonio *
      (taxaMensal * Math.pow(1 + taxaMensal, periodoMeses)) /
      (Math.pow(1 + taxaMensal, periodoMeses) - 1);
  }
  const cenarioConsumirNominal: CenarioConsumir = {
    saqueMensal: saqueConsumirNominal,
    duracaoMeses: periodoMeses,
    totalSacado: saqueConsumirNominal * periodoMeses,
  };

  // Cenário 3: Consumir real (PMT com taxa real)
  let saqueConsumirReal: number;
  if (taxaReal === 0) {
    saqueConsumirReal = input.patrimonio / periodoMeses;
  } else {
    saqueConsumirReal =
      input.patrimonio *
      (taxaReal * Math.pow(1 + taxaReal, periodoMeses)) /
      (Math.pow(1 + taxaReal, periodoMeses) - 1);
  }
  const cenarioConsumirReal: CenarioReal = {
    saqueMensalInicial: saqueConsumirReal,
    duracaoMeses: periodoMeses,
    totalSacado: saqueConsumirReal * periodoMeses, // Aproximação, será recalculado na simulação
  };

  // Se saque desejado informado, simular duração
  if (input.saqueDesejado !== undefined && input.saqueDesejado > 0) {
    // Simular cenário consumir nominal com saque fixo
    let saldoNominal = input.patrimonio;
    let mesesNominal = 0;
    const limiteMeses = periodoMeses * 3; // Limite de 3x o período para evitar loop infinito
    while (saldoNominal > 0 && mesesNominal < limiteMeses) {
      mesesNominal++;
      const juros = saldoNominal * taxaMensal;
      saldoNominal = saldoNominal + juros - input.saqueDesejado;
    }
    cenarioConsumirNominal.duracaoMeses = mesesNominal >= limiteMeses ? periodoMeses : mesesNominal;
    cenarioConsumirNominal.totalSacado = input.saqueDesejado * cenarioConsumirNominal.duracaoMeses;

    // Simular cenário consumir real com saque corrigido
    let saldoReal = input.patrimonio;
    let mesesReal = 0;
    let saqueAtual = input.saqueDesejado;
    while (saldoReal > 0 && mesesReal < limiteMeses) {
      mesesReal++;
      const juros = saldoReal * taxaMensal;
      saldoReal = saldoReal + juros - saqueAtual;
      saqueAtual *= (1 + inflacaoMensal);
    }
    cenarioConsumirReal.duracaoMeses = mesesReal >= limiteMeses ? periodoMeses : mesesReal;
    cenarioConsumirReal.saqueMensalInicial = input.saqueDesejado;
  }

  // Gerar evolução mensal para os 3 cenários
  const evolucaoPreservar = gerarEvolucaoPreservar(
    input.patrimonio,
    taxaMensal,
    inflacaoMensal,
    saquePreservar,
    periodoMeses
  );

  const evolucaoConsumirNominal = gerarEvolucaoConsumirNominal(
    input.patrimonio,
    taxaMensal,
    saqueConsumirNominal,
    input.saqueDesejado,
    periodoMeses
  );

  const evolucaoConsumirReal = gerarEvolucaoConsumirReal(
    input.patrimonio,
    taxaMensal,
    inflacaoMensal,
    saqueConsumirReal,
    input.saqueDesejado,
    periodoMeses
  );

  return {
    cenarios: {
      preservar: cenarioPreservar,
      consumirNominal: cenarioConsumirNominal,
      consumirReal: cenarioConsumirReal,
    },
    evolucaoMensal: {
      preservar: evolucaoPreservar,
      consumirNominal: evolucaoConsumirNominal,
      consumirReal: evolucaoConsumirReal,
    },
  };
}

function gerarEvolucaoPreservar(
  patrimonio: number,
  taxaMensal: number,
  inflacaoMensal: number,
  saqueInicial: number,
  periodoMeses: number
): EvolucaoMensalRentabilidade[] {
  const evolucao: EvolucaoMensalRentabilidade[] = [];
  let saldo = patrimonio;
  let saque = saqueInicial;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    const juros = saldo * taxaMensal;
    saldo = saldo + juros - saque;
    const saldoReal = saldo / Math.pow(1 + inflacaoMensal, mes);

    evolucao.push({
      mes,
      saque,
      jurosMes: juros,
      saldoNominal: saldo,
      saldoReal,
    });

    saque *= (1 + inflacaoMensal); // Corrigir saque pela inflação
  }

  return evolucao;
}

function gerarEvolucaoConsumirNominal(
  patrimonio: number,
  taxaMensal: number,
  saqueCalculado: number,
  saqueDesejado: number | undefined,
  periodoMeses: number
): EvolucaoMensalRentabilidade[] {
  const evolucao: EvolucaoMensalRentabilidade[] = [];
  let saldo = patrimonio;
  const saque = saqueDesejado !== undefined && saqueDesejado > 0 ? saqueDesejado : saqueCalculado;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    if (saldo <= 0) break;

    const juros = saldo * taxaMensal;
    saldo = saldo + juros - saque;

    evolucao.push({
      mes,
      saque: Math.min(saque, saldo + juros), // Não sacar mais que o saldo
      jurosMes: juros,
      saldoNominal: Math.max(0, saldo),
      saldoReal: Math.max(0, saldo), // Simplificação: saldo real = nominal (sem inflação nesta função)
    });
  }

  return evolucao;
}

function gerarEvolucaoConsumirReal(
  patrimonio: number,
  taxaMensal: number,
  inflacaoMensal: number,
  saqueInicialCalculado: number,
  saqueDesejado: number | undefined,
  periodoMeses: number
): EvolucaoMensalRentabilidade[] {
  const evolucao: EvolucaoMensalRentabilidade[] = [];
  let saldo = patrimonio;
  let saque = saqueDesejado !== undefined && saqueDesejado > 0 ? saqueDesejado : saqueInicialCalculado;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    if (saldo <= 0) break;

    const juros = saldo * taxaMensal;
    saldo = saldo + juros - saque;
    const saldoReal = saldo / Math.pow(1 + inflacaoMensal, mes);

    evolucao.push({
      mes,
      saque: Math.min(saque, saldo + juros),
      jurosMes: juros,
      saldoNominal: Math.max(0, saldo),
      saldoReal: Math.max(0, saldoReal),
    });

    saque *= (1 + inflacaoMensal); // Corrigir saque pela inflação
  }

  return evolucao;
}
