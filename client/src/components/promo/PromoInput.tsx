import { useState } from 'react';
import { promoApi } from '../../api/promo';
import { useToastStore } from '../ui/Toast';

interface Props {
  subtotal: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  appliedCode: string | null;
}

export default function PromoInput({ subtotal, onApply, onRemove, appliedCode }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const showToast = useToastStore(s => s.show);

  const handleValidate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await promoApi.validate(code.trim(), subtotal);
      onApply(result.discount, result.code);
      showToast(`Code "${result.code}" appliqué : -${result.discount.toFixed(2)} €`, 'check');
      setCode('');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[13px] font-medium text-green-700">{appliedCode}</span>
        </div>
        <button onClick={onRemove} className="text-[12px] text-green-600 hover:text-green-800 font-medium">Retirer</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
          placeholder="Code promo"
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] focus:ring-1 focus:ring-champagne/40 focus:border-champagne/40 outline-none transition-all uppercase tracking-wider"
          onKeyDown={e => e.key === 'Enter' && handleValidate()}
        />
        <button
          onClick={handleValidate}
          disabled={loading || !code.trim()}
          className="px-5 py-2.5 bg-charcoal text-white rounded-xl text-[12px] tracking-[0.06em] uppercase font-medium hover:bg-charcoal/90 transition-all disabled:opacity-40"
        >
          {loading ? '...' : 'Appliquer'}
        </button>
      </div>
      {error && <p className="text-[12px] text-red-500 mt-2 font-light">{error}</p>}
    </div>
  );
}
