import { useCurrencyStore, type Currency } from '../../stores/currencyStore';
import { useState, useRef, useEffect } from 'react';

const currencies: { code: Currency; label: string; flag: string }[] = [
  { code: 'CHF', label: 'Suisse', flag: '🇨🇭' },
  { code: 'EUR', label: 'Europe', flag: '🇪🇺' },
  { code: 'USD', label: 'USA', flag: '🇺🇸' },
];

export default function CurrencySelector() {
  const { currency, set } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = currencies.find(c => c.code === currency)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-[11px] font-medium text-gray-500 hover:text-charcoal transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.code}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-dropdown z-50 min-w-[120px]">
          {currencies.map(c => (
            <button
              key={c.code}
              onClick={() => { set(c.code); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-4 py-2.5 text-[12px] transition-colors ${
                c.code === currency ? 'bg-cream text-charcoal font-medium' : 'text-gray-500 hover:bg-cream/50'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.code}</span>
              <span className="text-[10px] text-gray-400 ml-auto">{c.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
