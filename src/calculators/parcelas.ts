export function parsearParcelas(notacao: string): number[] {
  const partes = notacao.split(',');
  const parcelas: number[] = [];

  for (const parte of partes) {
    const trim = parte.trim();
    if (!trim) continue;

    if (trim.includes('-')) {
      const [inicio, fim] = trim.split('-').map((s) => parseInt(s.trim(), 10));
      if (isNaN(inicio)) continue;
      if (isNaN(fim)) {
        parcelas.push(inicio);
        continue;
      }
      if (fim < inicio) continue;

      for (let i = inicio; i <= fim; i++) {
        parcelas.push(i);
      }
    } else {
      const num = parseInt(trim, 10);
      if (isNaN(num)) continue;
      parcelas.push(num);
    }
  }

  return [...new Set(parcelas)].sort((a, b) => a - b);
}

export function gerarSequenciaParcelas(
  inicio: number,
  incremento: number,
  ate: number
): string {
  if (incremento <= 0 || ate < inicio) return '';

  const parcelas: number[] = [];
  for (let i = inicio; i <= ate; i += incremento) {
    parcelas.push(i);
  }

  return parcelas.join(',');
}