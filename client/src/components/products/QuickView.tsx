import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useToastStore } from '../ui/Toast';
import { useFormatPrice } from '../../hooks/useFormatPrice';
import type { Product } from '../../types';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const toggleWishlist = useWishlistStore(s => s.toggle);
  const isWished = useWishlistStore(s => s.has(product?.id || ''));
  const showToast = useToastStore(s => s.show);
  const { format } = useFormatPrice();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = async () => {
    if (!user) { onClose(); return navigate('/login'); }
    await addItem(product.id, selectedSize || product.sizes[0], selectedColor || product.colors[0]);
    setAdded(true);
    showToast('Ajouté au panier', 'cart');
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  const handleWishlist = () => {
    if (!user) { onClose(); return navigate('/login'); }
    toggleWishlist(product.id);
    showToast(isWished ? 'Retiré des favoris' : 'Ajouté aux favoris', 'heart');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Image */}
        <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto bg-gray-50 relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-500 hover:text-charcoal transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
          <p className="text-champagne text-[10px] font-medium tracking-[0.2em] uppercase mb-2">{product.category}</p>
          <h2 className="text-xl font-medium text-charcoal leading-tight">{product.name}</h2>
          <p className="text-lg font-medium text-charcoal mt-3">{format(product.price)}</p>
          <p className="text-[13px] text-gray-400 font-light mt-3 leading-relaxed line-clamp-3">{product.description}</p>

          {/* Sizes */}
          <div className="mt-5">
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-medium mb-2">Taille</p>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`w-10 h-8 text-[11px] rounded-lg border transition-all ${
                    selectedSize === s ? 'border-charcoal bg-charcoal text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="mt-4">
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-medium mb-2">Couleur</p>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map(c => (
                <button key={c} onClick={() => setSelectedColor(c)}
                  className={`px-3 h-8 text-[11px] rounded-lg border transition-all ${
                    selectedColor === c ? 'border-charcoal bg-charcoal text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}>{c}</button>
              ))}
            </div>
          </div>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-[11px] text-amber-600 font-light mt-3">Plus que {product.stock} en stock</p>
          )}

          <div className="mt-auto pt-5 flex gap-2">
            <button onClick={handleAdd} disabled={product.stock === 0}
              className="flex-1 bg-charcoal text-white py-3 rounded-full text-[11px] tracking-[0.08em] uppercase font-medium hover:bg-charcoal/90 transition disabled:opacity-40">
              {added ? '✓ Ajouté' : product.stock === 0 ? 'Rupture' : 'Ajouter au panier'}
            </button>
            <button onClick={handleWishlist}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                isWished ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-red-400'
              }`}>
              <svg className="w-4 h-4" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          <button onClick={() => { onClose(); navigate(`/products/${product.id}`); }}
            className="mt-3 text-[11px] text-gray-400 font-light hover:text-charcoal transition-colors text-center">
            Voir la fiche complète →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-in { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
