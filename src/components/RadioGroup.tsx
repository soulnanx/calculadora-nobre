interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  vertical?: boolean;
}

export function RadioGroup({ name, options, value, onChange, vertical = false }: RadioGroupProps) {
  return (
    <div className={`${vertical ? 'flex flex-col gap-2' : 'flex gap-4'}`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
