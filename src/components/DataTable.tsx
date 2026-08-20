import { formatCurrency } from '../lib/utils';
import { ResultadoJurosCompostos } from '../types';

interface DataTableProps {
  data: ResultadoJurosCompostos['evolucaoMensal'];
}

export function DataTable({ data }: DataTableProps) {
  return (
    <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">Mês</th>
            <th className="px-4 py-2 text-right font-semibold">Aporte Acumulado</th>
            <th className="px-4 py-2 text-right font-semibold">Juros Acumulados</th>
            <th className="px-4 py-2 text-right font-semibold">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.mes} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-2">{row.mes}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(row.aporteAcumulado)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(row.jurosAcumulados)}</td>
              <td className="px-4 py-2 text-right font-semibold">{formatCurrency(row.saldo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
