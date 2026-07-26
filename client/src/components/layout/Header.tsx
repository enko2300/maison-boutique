import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useThemeStore } from '../../stores/themeStore';
import SearchAutocomplete from '../ui/SearchAutocomplete';
import CurrencySelector from '../ui/CurrencySelector';
import { useState, useEffect, useRef } from 'react';

const categories = [
  { name: 'T-shirts', desc: 'Basiques & éditions' },
  { name: 'Robes', desc: 'Du jour au soir' },
  { name: 'Vestes', desc: 'Pièces structurées' },
  { name: 'Pantalons', desc: 'Coupes parfaites' },
  { name: 'Sweats', desc: 'Confort raffiné' },
  { name: 'Chemises', desc: "L'essentiel chic" },
  { name: 'Jupes', desc: 'Silhouettes sculptées' },
];

interface Props {
  onCartClick?: () => void;
}

export default function Header({ onCartClick }: Props) {
  const { user, logout } = useAuthStore();
  const count = useCartStore(s => s.count);
  const { theme, toggle: toggleTheme } = useThemeStore();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [badgePop, setBadgePop] = useState(false);

  const megaRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [scrolled, setScrolled] = useState(() => {
    return sessionStorage.getItem('header_scrolled') === 'true';
  });

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
      sessionStorage.setItem('header_scrolled', String(isScrolled));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setScrolled(false);
      sessionStorage.setItem('header_scrolled', 'false');
      prevPathname.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    setMegaOpen(false);
    setUserMenuOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const c = count();
    if (c > prevCount && c > 0) {
      setBadgePop(true);
      setTimeout(() => setBadgePop(false), 300);
    }
    setPrevCount(c);
  }, [count()]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div
        className={`bg-charcoal text-center text-[11px] py-2 font-light tracking-[0.2em] uppercase transition-all duration-300 overflow-hidden ${
          scrolled ? 'h-0 py-0 opacity-0' : 'h-[32px] opacity-100'
        }`}
      >
        <span
          className="bg-clip-text text-transparent animate-gradient"
          style={{
            backgroundImage: 'linear-gradient(90deg, #666, #E8D5B0, #C9A96E, #E8D5B0, #666)',
            backgroundSize: '200% 200%',
          }}
        >
          Livraison offerte dès 50 CHF · Retours gratuits sous 30 jours
        </span>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]'
            : 'bg-white'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[64px]">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-baseline gap-0.5 group">
                <span className="text-[22px] font-semibold tracking-[-0.04em] text-charcoal transition-colors duration-300 group-hover:text-champagne">Bouclor</span>
                <span className="text-[22px] font-light text-champagne">.</span>
              </Link>

              <nav className="hidden lg:flex items-center gap-8">
                <Link to="/products" className={`text-[13px] tracking-[0.08em] uppercase font-light transition-all duration-300 ${isActive('/products') ? 'text-charcoal' : 'text-gray-400 hover:text-charcoal'}`}>Catalogue</Link>

                <div ref={megaRef} className="relative">
                  <button onClick={() => { setMegaOpen(!megaOpen); setUserMenuOpen(false); }}
                    className={`flex items-center gap-1.5 text-[13px] tracking-[0.08em] uppercase font-light transition-all duration-300 ${megaOpen ? 'text-charcoal' : 'text-gray-400 hover:text-charcoal'}`}>
                    Catégories
                    <svg className={`w-3 h-3 transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {megaOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[480px] bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] border border-gray-100/80 overflow-hidden animate-dropdown">
                      <div className="p-6 grid grid-cols-2 gap-1">
                        {categories.map(cat => (
                          <Link key={cat.name} to={`/products?category=${cat.name}`}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-cream transition-all duration-200 group/item">
                            <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-xs text-gray-400 group-hover/item:bg-champagne/10 group-hover/item:text-champagne transition-all duration-200">{cat.name[0]}</div>
                            <div>
                              <p className="text-[13px] font-medium text-charcoal">{cat.name}</p>
                              <p className="text-[11px] text-gray-400 font-light">{cat.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="px-6 py-4 bg-cream/50 border-t border-gray-100">
                        <Link to="/products" className="text-[12px] tracking-[0.06em] uppercase text-gray-500 hover:text-charcoal transition-colors flex items-center gap-2 font-light">
                          Découvrir tout le catalogue
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/products?category=Robes" className="text-[13px] tracking-[0.08em] uppercase font-light transition-all duration-300 text-gray-400 hover:text-charcoal">Nouveautés</Link>
              </nav>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-3 rounded-full text-gray-400 hover:text-charcoal transition-all duration-300">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>

              <button
                onClick={toggleTheme}
                className="p-3 rounded-full text-gray-400 hover:text-charcoal transition-all duration-300"
                aria-label={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
              >
                {theme === 'light' ? (
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              <CurrencySelector />

              <button
                onClick={onCartClick}
                className="relative p-3 rounded-full text-gray-400 hover:text-charcoal transition-all duration-300"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count() > 0 && (
                  <span className={`absolute top-1 right-1 bg-charcoal text-white text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-medium ${badgePop ? 'animate-badge-pop' : ''}`}>
                    {count()}
                  </span>
                )}
              </button>

              {user ? (
                <div ref={userRef} className="relative ml-1">
                  <button onClick={() => { setUserMenuOpen(!userMenuOpen); setMegaOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-cream transition-all duration-300">
                    <div className="w-7 h-7 border border-charcoal/10 text-charcoal rounded-full flex items-center justify-center text-[11px] font-medium">{user.name[0].toUpperCase()}</div>
                    <span className="hidden sm:block text-[12px] tracking-[0.04em] text-gray-500 font-light">{user.name}</span>
                    <svg className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] border border-gray-100/80 overflow-hidden animate-dropdown">
                      <div className="px-5 py-4 bg-cream/40">
                        <p className="font-medium text-charcoal text-[13px]">{user.name}</p>
                        <p className="text-[11px] text-gray-400 font-light mt-0.5">{user.email}</p>
                      </div>
                      <div className="py-1.5">
                        <Link to="/orders" className="flex items-center gap-3 px-5 py-2.5 text-[13px] text-gray-600 hover:text-charcoal hover:bg-cream/50 transition-all font-light">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          Mes commandes
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link to="/admin" className="flex items-center gap-3 px-5 py-2.5 text-[13px] text-gray-600 hover:text-charcoal hover:bg-cream/50 transition-all font-light">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Administration
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 py-1.5">
                        <button onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-5 py-2.5 text-[13px] text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition-all font-light">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-2 ml-2 px-5 py-2 border border-charcoal text-charcoal rounded-full text-[12px] tracking-[0.06em] uppercase font-light hover:bg-charcoal hover:text-white transition-all duration-300">Connexion</Link>
              )}

              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-3 rounded-full text-gray-400 hover:text-charcoal transition-all">
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-gray-100/60 bg-white dark:bg-gray-900">
            <div className="max-w-xl mx-auto px-6 py-5 relative">
              <SearchAutocomplete onClose={() => setSearchOpen(false)} />
              <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-charcoal transition-colors z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 w-[320px] h-full bg-white shadow-2xl animate-slide-in overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-10">
                <span className="text-[15px] font-medium tracking-[0.06em] uppercase text-charcoal">Menu</span>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-cream transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {!user && (
                <div className="flex gap-3 mb-10">
                  <Link to="/login" className="flex-1 bg-charcoal text-white py-3 rounded-full text-[12px] tracking-[0.06em] uppercase font-light text-center hover:bg-charcoal/90 transition">Connexion</Link>
                  <Link to="/register" className="flex-1 border border-gray-200 text-charcoal py-3 rounded-full text-[12px] tracking-[0.06em] uppercase font-light text-center hover:bg-cream transition">Inscription</Link>
                </div>
              )}

              <nav className="space-y-0.5">
                <Link to="/products" className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-cream text-charcoal font-light text-[14px] transition-all">Catalogue</Link>
                <div className="pt-6 pb-2 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.15em]">Catégories</div>
                {categories.map(cat => (
                  <Link key={cat.name} to={`/products?category=${cat.name}`} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-cream text-gray-500 hover:text-charcoal font-light text-[13px] transition-all">
                    <span className="text-[11px] text-gray-300 font-medium w-6">{cat.name[0]}</span>{cat.name}
                  </Link>
                ))}
              </nav>

              {user && (
                <div className="mt-10 pt-8 border-t border-gray-100 space-y-0.5">
                  <Link to="/orders" className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-cream text-gray-600 hover:text-charcoal font-light text-[13px] transition-all">Mes commandes</Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-cream text-gray-600 hover:text-charcoal font-light text-[13px] transition-all">Administration</Link>
                  )}
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl hover:bg-red-50/50 text-gray-500 hover:text-red-600 font-light text-[13px] transition-all mt-4">Déconnexion</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
