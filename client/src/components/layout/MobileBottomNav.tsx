import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';

export default function MobileBottomNav({ onCartClick }: { onCartClick: () => void }) {
  const location = useLocation();
  const count = useCartStore(s => s.count);
  const { user } = useAuthStore();

  const isHidden = location.pathname.startsWith('/admin') || location.pathname === '/checkout';
  if (isHidden) return null;

  const links = [
    { to: '/', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, label: 'Accueil' },
    { to: '/products', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>, label: 'Catalogue' },
    { to: '/cart', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>, label: 'Panier', badge: count(), onClick: onCartClick },
    { to: user ? '/orders' : '/login', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, label: user ? 'Compte' : 'Connexion' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-bottom">
      <div className="flex items-center justify-around h-14">
        {links.map(link => {
          const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to);
          const isCart = link.label === 'Panier';

          if (isCart) {
            return (
              <button
                key={link.label}
                onClick={link.onClick}
                className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
              >
                <span className={`transition-colors ${isActive ? 'text-charcoal' : 'text-gray-400'}`}>{link.icon}</span>
                <span className="text-[9px] font-light text-gray-400">{link.label}</span>
                {link.badge! > 0 && (
                  <span className="absolute top-1.5 right-3 w-4 h-4 bg-charcoal text-white text-[8px] rounded-full flex items-center justify-center font-medium">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={link.label}
              to={link.to}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full"
            >
              <span className={`transition-colors ${isActive ? 'text-charcoal' : 'text-gray-400'}`}>{link.icon}</span>
              <span className={`text-[9px] font-light transition-colors ${isActive ? 'text-charcoal' : 'text-gray-400'}`}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
