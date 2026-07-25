import { Link, Outlet, useLocation } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const tabs = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/products', label: 'Produits' },
  { to: '/admin/orders', label: 'Commandes' },
];

export default function Admin() {
  const location = useLocation();

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Administration</h1>
        <nav className="flex gap-4 mb-6 border-b pb-3">
          {tabs.map(t => (
            <Link
              key={t.to}
              to={t.to}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition ${t.exact ? location.pathname === t.to : location.pathname.startsWith(t.to) ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <Outlet />
      </div>
    </ProtectedRoute>
  );
}
