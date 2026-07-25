import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orders';
import { Link } from 'react-router-dom';

const statusLabels: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAID: { label: 'Payé', cls: 'bg-green-50 text-green-700 border-green-200' },
  SHIPPED: { label: 'Expédié', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  DELIVERED: { label: 'Livré', cls: 'bg-gray-50 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'Annulé', cls: 'bg-red-50 text-red-600 border-red-200' },
};

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.list().then(r => r.data),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-6 h-6 border-2 border-champagne border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-champagne text-[11px] font-medium tracking-[0.3em] uppercase mb-3">Historique</p>
        <h1 className="text-2xl font-light tracking-[-0.02em] text-charcoal">Mes commandes</h1>
      </div>

      {!orders?.length ? (
        <div className="text-center py-16">
          <p className="text-[13px] text-gray-400 font-light mb-4">Aucune commande pour le moment.</p>
          <Link to="/products" className="text-[12px] tracking-[0.06em] uppercase text-charcoal font-medium hover:text-champagne transition-colors">
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const st = statusLabels[order.status] || { label: order.status, cls: 'bg-gray-50 text-gray-600 border-gray-200' };
            const invoiceUrl = `/invoices/facture-${order.id.slice(-8)}.pdf`;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/60">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium tracking-[0.04em] text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className={`text-[10px] tracking-[0.06em] uppercase font-medium px-2.5 py-1 rounded-full border ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <span className="text-[15px] font-medium text-charcoal">{order.total.toFixed(2)} &euro;</span>
                </div>

                {/* Items */}
                <div className="px-6 py-4 space-y-2.5">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-charcoal font-medium text-[13px]">{item.product.name}</p>
                          <p className="text-[11px] text-gray-400 font-light">
                            {item.size && `Taille ${item.size}`}
                            {item.size && item.color && ' · '}
                            {item.color && item.color}
                            {' · '}Qté {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-[13px] text-gray-500 font-light">{(item.price * item.quantity).toFixed(2)} &euro;</span>
                    </div>
                  ))}
                </div>

                {/* Footer with invoice link */}
                <div className="px-6 py-3 bg-cream/40 border-t border-gray-100/60 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-light">
                    N° {order.id.slice(-8).toUpperCase()}
                  </span>
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] tracking-[0.04em] uppercase text-charcoal font-medium hover:text-champagne transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Voir la facture
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
