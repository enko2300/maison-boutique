import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, fetch, total, updateQuantity, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetch();
  }, [user, open]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fade-in 0.2s ease-out' }}
      />

      {/* Drawer */}
      <div
        className="absolute top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col"
        style={{ animation: 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-medium text-charcoal">Panier</h2>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">
              {items.length} article{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-cream transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-[13px] text-gray-400 font-light mb-4">Connectez-vous pour voir votre panier</p>
              <button onClick={() => { onClose(); navigate('/login'); }} className="px-6 py-2.5 bg-charcoal text-white rounded-full text-[12px] tracking-[0.06em] uppercase font-medium hover:bg-charcoal/90 transition">
                Se connecter
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-[13px] text-gray-400 font-light mb-4">Votre panier est vide</p>
              <button onClick={() => { onClose(); navigate('/products'); }} className="px-6 py-2.5 bg-charcoal text-white rounded-full text-[12px] tracking-[0.06em] uppercase font-medium hover:bg-charcoal/90 transition">
                Découvrir le catalogue
              </button>
            </div>
          ) : (
            <div className="py-4 space-y-0 divide-y divide-gray-50">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-medium text-charcoal truncate">{item.product.name}</h4>
                        <p className="text-[11px] text-gray-400 font-light mt-0.5">
                          {item.size && `Taille ${item.size}`}
                          {item.size && item.color && ' · '}
                          {item.color && item.color}
                        </p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-charcoal transition-colors text-sm">−</button>
                        <span className="w-6 text-center text-[12px] font-medium text-charcoal">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-charcoal transition-colors text-sm">+</button>
                      </div>
                      <p className="text-[13px] font-medium text-charcoal">{(item.product.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {user && items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] tracking-[0.06em] uppercase text-gray-400 font-light">Sous-total</span>
              <span className="text-lg font-medium text-charcoal">{total().toFixed(2)} €</span>
            </div>
            <p className="text-[11px] text-gray-400 font-light">Livraison calculée à la caisse</p>
            <button
              onClick={handleCheckout}
              className="w-full bg-charcoal text-white py-3.5 rounded-full text-[12px] tracking-[0.08em] uppercase font-medium hover:bg-charcoal/90 transition-all"
            >
              Commander
            </button>
            <button
              onClick={onClose}
              className="w-full text-[12px] tracking-[0.06em] uppercase text-gray-400 font-light hover:text-charcoal transition-colors py-1"
            >
              Continuer les achats
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
