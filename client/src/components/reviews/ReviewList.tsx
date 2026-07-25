import StarRating from './StarRating';
import type { Review } from '../../types';

interface Props {
  reviews: Review[];
}

export default function ReviewList({ reviews }: Props) {
  if (reviews.length === 0) {
    return <p className="text-[13px] text-gray-400 font-light text-center py-6">Aucun avis pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-champagne/10 flex items-center justify-center text-[11px] font-medium text-champagne">
                {review.user.name[0].toUpperCase()}
              </div>
              <span className="text-[13px] font-medium text-charcoal">{review.user.name}</span>
            </div>
            <span className="text-[11px] text-gray-400 font-light">
              {new Date(review.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <StarRating rating={review.rating} size="sm" />
          {review.comment && (
            <p className="text-[13px] text-gray-500 font-light mt-2 leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
