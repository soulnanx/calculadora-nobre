import { formatCurrency } from '../lib/utils';

interface ResultCardProps {
  label: string;
  value: number;
  highlight?: boolean;
}

export function ResultCard({ label, value, highlight = false }: ResultCardProps) {
  return (
    <div className={`p-3 md:p-4 rounded-lg ${highlight ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
      <div className="text-xs md:text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-base md:text-lg font-bold break-words ${highlight ? 'text-blue-900' : 'text-gray-900'}`}>
        {formatCurrency(value)}
      </div>
    </div>
  );
}
