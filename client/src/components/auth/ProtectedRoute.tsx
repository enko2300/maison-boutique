import { useAuthStore } from '../../stores/authStore';

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuthStore();

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;
  if (!user) return <div className="text-center py-20"><p className="text-gray-500">Connectez-vous pour accéder à cette page.</p></div>;
  if (adminOnly && user.role !== 'ADMIN') return <div className="text-center py-20"><p className="text-gray-500">Accès réservé aux administrateurs.</p></div>;

  return <>{children}</>;
}
