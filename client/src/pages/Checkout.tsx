import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { orderApi } from '../api/orders';
import { promoApi } from '../api/promo';
import { useState } from 'react';

export default function Checkout() {
  const { items, total, fetch: fetchCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const result = await promoApi.validate(promoCode.trim(), total());
      setPromoDiscount(result.discount);
      setPromoApplied(result.code);
      setPromoCode('');
    } catch (e: any) {
      setPromoError(e.response?.data?.error || 'Code invalide');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoDiscount(0);
    setPromoApplied(null);
    setPromoError('');
  };

  const finalTotal = total() - promoDiscount;

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await orderApi.checkout(promoApplied || undefined);
      setInvoiceUrl(data.invoiceUrl || null);
      fetchCart();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  // Success state — invoice display
  if (invoiceUrl) return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-champagne text-[11px] font-medium tracking-[0.3em] uppercase mb-3">Merci</p>
        <h1 className="text-2xl font-light tracking-[-0.02em] text-charcoal">Commande confirmée</h1>
        <p className="text-[13px] text-gray-400 font-light mt-2">Votre facture a été générée automatiquement.</p>
      </div>

      {/* Invoice preview */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center">
              <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium text-charcoal">Facture</p>
              <p className="text-[11px] text-gray-400 font-light">Document PDF</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-[11px] tracking-[0.06em] uppercase font-medium border border-gray-200 rounded-full text-charcoal hover:bg-cream transition-all"
            >
              Ouvrir
            </a>
            <a
              href={invoiceUrl}
              download
              className="px-4 py-2 text-[11px] tracking-[0.06em] uppercase font-medium bg-charcoal text-white rounded-full hover:bg-charcoal/90 transition-all"
            >
              Télécharger
            </a>
          </div>
        </div>

        {/* PDF iframe preview */}
        <div className="bg-gray-50" style={{ height: '500px' }}>
          <iframe
            src={invoiceUrl}
            className="w-full h-full border-0"
            title="Facture"
          />
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-8">
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 text-[12px] tracking-[0.06em] uppercase font-medium border border-gray-200 rounded-full text-charcoal hover:bg-cream transition-all"
        >
          Mes commandes
        </button>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 text-[12px] tracking-[0.06em] uppercase font-medium bg-charcoal text-white rounded-full hover:bg-charcoal/90 transition-all"
        >
          Continuer les achats
        </button>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="text-center py-20">
      <p className="text-[13px] text-gray-400 font-light">Votre panier est vide.</p>
      <button onClick={() => navigate('/products')} className="mt-4 text-[12px] text-charcoal font-medium hover:text-champagne transition-colors">
        Voir le catalogue
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-champagne text-[11px] font-medium tracking-[0.3em] uppercase mb-3">Récapitulatif</p>
        <h1 className="text-2xl font-light tracking-[-0.02em] text-charcoal">Votre commande</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between text-[13px]">
            <span className="text-gray-500 font-light">
              {item.product.name}
              {(item.size || item.color) && (
                <span className="text-gray-400 ml-1">
                  ({[item.size, item.color].filter(Boolean).join(', ')})
                </span>
              )}
              {' '}× {item.quantity}
            </span>
            <span className="font-medium text-charcoal">{(item.product.price * item.quantity).toFixed(2)} &euro;</span>
          </div>
        ))}

        {/* Promo code section */}
        <div className="border-t border-gray-100 pt-4">
          {promoApplied ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] font-medium text-green-700">{promoApplied}</span>
                <span className="text-[12px] text-green-600">-{promoDiscount.toFixed(2)} €</span>
              </div>
              <button onClick={handleRemovePromo} className="text-[12px] text-green-600 hover:text-green-800 font-medium">Retirer</button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                  placeholder="Code promo"
                  className="flex-1 px-4 py-2.5 bg-cream border border-gray-200 rounded-xl text-[13px] focus:ring-1 focus:ring-champagne/40 outline-none transition-all uppercase tracking-wider"
                  onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCode.trim()}
                  className="px-5 py-2.5 bg-charcoal text-white rounded-xl text-[12px] tracking-[0.06em] uppercase font-medium hover:bg-charcoal/90 transition-all disabled:opacity-40"
                >
                  {promoLoading ? '...' : 'Appliquer'}
                </button>
              </div>
              {promoError && <p className="text-[12px] text-red-500 mt-2 font-light">{promoError}</p>}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-400 font-light">Sous-total</span>
            <span className="text-gray-600">{total().toFixed(2)} €</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-[13px]">
              <span className="text-green-600 font-light">Réduction</span>
              <span className="text-green-600">-{promoDiscount.toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium">Total</span>
            <span className="text-lg font-medium text-charcoal">{finalTotal.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Stock warning */}
      <div className="mt-4 p-4 bg-cream rounded-xl">
        <div className="flex items-start gap-3">
          <svg className="w-4 h-4 text-champagne mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[12px] text-gray-500 font-light leading-relaxed">
            Le stock sera vérifié et mis à jour automatiquement. Une facture PDF sera générée après confirmation.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl">
          <p className="text-[12px] text-red-600 font-light">{error}</p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full mt-6 bg-charcoal text-white py-3.5 rounded-full text-[12px] tracking-[0.08em] uppercase font-medium hover:bg-charcoal/90 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? 'Traitement en cours...' : `Confirmer et payer ${finalTotal.toFixed(2)} €`}
      </button>

      <p className="text-center text-[11px] text-gray-400 font-light mt-4">
        Paiement simulé · Aucun frais réel
      </p>
    </div>
  );
}
