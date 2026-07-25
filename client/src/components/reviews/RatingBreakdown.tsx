import StarRating from './StarRating';
import type { ReviewStats } from '../../types';

interface Props {
  stats: ReviewStats;
}

export default function RatingBreakdown({ stats }: Props) {
  const max = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl font-semibold text-charcoal">{stats.avg}</span>
        <div>
          <StarRating rating={Math.round(stats.avg)} size="md" />
          <p className="text-[12px] text-gray-400 font-light mt-0.5">{stats.count} avis</p>
        </div>
      </div>
      {[5, 4, 3, 2, 1].map(star => (
        <div key={star} className="flex items-center gap-2">
          <span className="text-[12px] text-gray-400 w-3">{star}</span>
          <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${((stats.distribution[star] || 0) / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-400 w-5 text-right">{stats.distribution[star] || 0}</span>
        </div>
      ))}
    </div>
  );
}
