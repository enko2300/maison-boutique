interface Props {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({ value, onChange, min = 1, max = 99 }: Props) {
  return (
    <div className="flex items-center border border-gray-200 rounded-full">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-charcoal transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" /></svg>
      </button>
      <span className="w-10 text-center text-[14px] font-medium text-charcoal tabular-nums">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-charcoal transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );
}
