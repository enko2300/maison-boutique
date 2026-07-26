import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useToastStore } from '../ui/Toast';
import { useFormatPrice } from '../../hooks/useFormatPrice';

interface Props {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: Props) {
  const toggle = useWishlistStore(s => s.toggle);
  const isWished = useWishlistStore(s => s.has(product.id));
  const showToast = useToastStore(s => s.show);
  const { format } = useFormatPrice();

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    showToast(isWished ? 'Retiré des favoris' : 'Ajouté aux favoris', 'heart');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden mb-4 relative">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-500 rounded-2xl" />

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
            isWished
              ? 'bg-white text-red-500 shadow-md'
              : 'bg-white/70 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white shadow-sm'
          }`}
        >
          <svg className="w-4 h-4" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Quick view button */}
        {onQuickView && (
          <button
            onClick={handleQuickView}
            className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm text-charcoal py-2 rounded-xl text-[11px] tracking-[0.06em] uppercase font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-sm"
          >
            Aperçu rapide
          </button>
        )}
      </div>
      <div className="px-0.5">
        <p className="text-[11px] text-champagne tracking-[0.08em] uppercase font-medium mb-1">{product.category}</p>
        <h3 className="text-[13px] font-medium text-charcoal group-hover:text-champagne transition-colors duration-300 leading-snug">{product.name}</h3>
        <p className="text-[13px] text-gray-400 font-light mt-1.5 tracking-wide">{format(product.price)}</p>
      </div>
    </Link>
  );
}
