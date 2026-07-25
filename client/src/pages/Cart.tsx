import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import CartItemRow from '../components/cart/CartItemRow';

export default function Cart() {
  const { items, fetch, total, clear } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { if (user) fetch(); }, [user]);

  if (!user) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Connectez-vous pour voir votre panier.</p>
      <Link to="/login" className="text-indigo-600 font-medium hover:underline">Se connecter</Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Votre panier est vide.</p>
      <Link to="/products" className="text-indigo-600 font-medium hover:underline">Voir le catalogue</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Panier</h1>
      <div>
        {items.map(item => <CartItemRow key={item.id} item={item} />)}
      </div>
      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{total().toFixed(2)} &euro;</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Passer la commande
        </button>
        <button onClick={clear} className="w-full text-sm text-gray-500 hover:text-red-500 transition">
          Vider le panier
        </button>
      </div>
    </div>
  );
}
