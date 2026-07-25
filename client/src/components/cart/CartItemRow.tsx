import { useCartStore } from '../../stores/cartStore';

export default function CartItemRow({ item }: { item: import('../../types').CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4 border-b">
      <img src={item.product.image} alt={item.product.name} className="w-20 h-24 object-cover rounded-lg" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {item.size && `Taille: ${item.size}`}
          {item.size && item.color && ' · '}
          {item.color && `Couleur: ${item.color}`}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-1">{item.product.price.toFixed(2)} &euro;</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 rounded border text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm"
          >
            -
          </button>
          <span className="text-sm w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 rounded border text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm"
          >
            +
          </button>
          <button onClick={() => removeItem(item.id)} className="ml-auto text-xs text-red-500 hover:text-red-700">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
