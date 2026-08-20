import { InputJurosCompostos, ResultadoJurosCompostos } from '../types';

export function calcularJurosCompostos(
  input: InputJurosCompostos
): ResultadoJurosCompostos {
  let taxaMensal = input.taxaJuros / 100;
  if (input.taxaPeriodicidade === 'anual') {
    taxaMensal = Math.pow(1 + taxaMensal, 1 / 12) - 1;
  }

  let periodoMeses = input.periodo;
  if (input.periodoUnidade === 'anos') {
    periodoMeses = input.periodo * 12;
  }

  const evolucaoMensal: ResultadoJurosCompostos['evolucaoMensal'] = [];
  let saldo = input.valorInicial;
  let totalJuros = 0;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    const jurosMes = saldo * taxaMensal;
    totalJuros += jurosMes;
    saldo += jurosMes + input.aporteMensal;

    evolucaoMensal.push({
      mes,
      aporteAcumulado: input.valorInicial + input.aporteMensal * mes,
      jurosAcumulados: totalJuros,
      saldo,
    });
  }

  const valorFinalNominal = saldo;
  const totalInvestido = input.valorInicial + input.aporteMensal * periodoMeses;

  const resumo: ResultadoJurosCompostos['resumo'] = {
    valorFinalNominal,
    totalInvestido,
    totalJuros,
  };

  if (input.inflacaoPeriodo !== undefined && input.inflacaoPeriodo > 0) {
    resumo.valorReal = valorFinalNominal / (1 + input.inflacaoPeriodo / 100);
  }

  return { resumo, evolucaoMensal };
}
