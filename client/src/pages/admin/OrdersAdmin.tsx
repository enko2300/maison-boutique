import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersAdmin() {
  const queryClient = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.orders.list().then(r => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.orders.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Commandes</h2>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium text-gray-900">{order.user?.name}</span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-sm text-gray-500">{order.user?.email}</span>
              </div>
              <span className="font-semibold">{order.total.toFixed(2)} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
              <select
                value={order.status}
                onChange={e => statusMutation.mutate({ id: order.id, status: e.target.value })}
                className="text-sm border rounded-lg px-2 py-1"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {order.items.map(i => `${i.product.name} ×${i.quantity}`).join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
