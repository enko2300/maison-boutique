import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then(r => r.data),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.orders.list().then(r => r.data),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.products.list().then(r => r.data),
  });

  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { label: 'Revenus', value: `${(stats?.revenue ?? 0).toFixed(0)} €`, sub: 'Total payé', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    { label: 'Commandes', value: stats?.totalOrders ?? 0, sub: `${orders.filter(o => o.status === 'PAID').length} payées`, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
    )},
    { label: 'Produits', value: stats?.totalProducts ?? 0, sub: `${outOfStock.length} en rupture`, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    )},
    { label: 'Clients', value: stats?.totalUsers ?? 0, sub: 'Comptes créés', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )},
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] tracking-[0.1em] uppercase text-gray-400 font-medium">{c.label}</span>
              <span className="text-champagne">{c.icon}</span>
            </div>
            <p className="text-2xl font-semibold text-charcoal">{c.value}</p>
            <p className="text-[11px] text-gray-400 font-light mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100/60">
            <h3 className="text-[13px] font-medium text-charcoal">Commandes récentes</h3>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-[13px] text-gray-400 font-light text-center">Aucune commande</p>
          ) : (
            <div className="divide-y divide-gray-100/60">
              {recentOrders.map(o => (
                <div key={o.id} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-[11px] font-medium text-charcoal">
                      {o.user?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-charcoal">{o.user?.name || 'Client'}</p>
                      <p className="text-[11px] text-gray-400 font-light">{o.items.length} article{o.items.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-medium text-charcoal">{o.total.toFixed(2)} €</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      o.status === 'PAID' ? 'bg-green-50 text-green-700' :
                      o.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          {/* Low stock */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100/60 flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-charcoal">Stock faible</h3>
              {lowStock.length > 0 && (
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">{lowStock.length}</span>
              )}
            </div>
            {lowStock.length === 0 && outOfStock.length === 0 ? (
              <p className="px-5 py-6 text-[12px] text-gray-400 font-light text-center">Tout va bien</p>
            ) : (
              <div className="divide-y divide-gray-100/60">
                {outOfStock.slice(0, 3).map(p => (
                  <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                    <p className="text-[12px] text-charcoal truncate max-w-[140px]">{p.name}</p>
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Rupture</span>
                  </div>
                ))}
                {lowStock.slice(0, 3).map(p => (
                  <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                    <p className="text-[12px] text-charcoal truncate max-w-[140px]">{p.name}</p>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">{p.stock} restant{p.stock > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top categories */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100/60">
              <h3 className="text-[13px] font-medium text-charcoal">Catégories</h3>
            </div>
            <div className="p-5 space-y-3">
              {Object.entries(
                products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {} as Record<string, number>)
              ).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500 font-light">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-champagne/60 rounded-full" style={{ width: `${(count / products.length) * 100}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
