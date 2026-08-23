import { useState, useEffect, InputHTMLAttributes } from 'react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

export function NumberInput({ value, onChange, suffix, ...props }: NumberInputProps) {
  const [textValue, setTextValue] = useState<string>(String(value));

  useEffect(() => {
    setTextValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextValue(raw);
    const numericValue = parseFloat(raw);
    onChange(isNaN(numericValue) ? 0 : numericValue);
  };

  return (
    <div className="relative">
      <input
        type="number"
        value={textValue}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {suffix}
        </span>
      )}
    </div>
  );
}