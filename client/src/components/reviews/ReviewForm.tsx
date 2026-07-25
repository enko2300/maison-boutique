import { useState } from 'react';
import StarRating from './StarRating';
import { reviewApi } from '../../api/reviews';
import { useToastStore } from '../ui/Toast';

interface Props {
  productId: string;
  onSuccess: () => void;
}

export default function ReviewForm({ productId, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const showToast = useToastStore(s => s.show);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    try {
      await reviewApi.create(productId, { rating, comment: comment || undefined });
      showToast('Avis publié', 'check');
      setRating(0);
      setComment('');
      onSuccess();
    } catch (e: any) {
      showToast(e.response?.data?.error || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5">
      <p className="text-[13px] font-medium text-charcoal mb-3">Laisser un avis</p>
      <div className="mb-3">
        <p className="text-[11px] text-gray-400 font-light mb-1.5">Note</p>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Votre commentaire (optionnel)"
        rows={3}
        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] focus:ring-1 focus:ring-champagne/40 outline-none font-light resize-none transition-all"
      />
      <button
        type="submit"
        disabled={loading || rating === 0}
        className="mt-3 px-5 py-2.5 bg-charcoal text-white rounded-xl text-[12px] tracking-[0.06em] uppercase font-medium hover:bg-charcoal/90 transition-all disabled:opacity-40"
      >
        {loading ? 'Envoi...' : 'Publier'}
      </button>
    </form>
  );
}
