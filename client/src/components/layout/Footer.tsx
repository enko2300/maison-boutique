import { Link } from 'react-router-dom';
import { useState } from 'react';

const paymentIcons: Record<string, JSX.Element> = {
  visa: (
    <svg viewBox="0 0 48 32" className="h-5 opacity-50 hover:opacity-100 transition-opacity duration-300">
      <rect width="48" height="32" rx="3" fill="white"/>
      <path d="M19.5 21h-3.3l2.1-12.5h3.3L19.5 21zm13.3-12.1c-.6-.2-1.6-.5-2.8-.5-3.1 0-5.2 1.6-5.2 3.9 0 1.7 1.5 2.6 2.7 3.2 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.1-1.8 1.1-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.5c.7.3 2.1.6 3.5.6 3.3 0 5.4-1.6 5.4-4 0-1.3-.8-2.3-2.6-3.2-1.1-.6-1.7-1-1.7-1.5 0-.5.5-1 1.7-1 1 0 1.7.2 2.2.4l.3.1.5-2.4zm7.1-.4h-2.5c-.8 0-1.4.2-1.7 1l-4.8 11.5h3.4l.7-1.8h4.1l.4 1.8H43L40 9zm-3.9 8l1.7-4.7 1 4.7h-2.7zM16.5 9l-3.2 8.5-.3-1.8c-.6-1.9-2.4-3.9-4.5-4.9l3 11.2h3.4l5.1-12.5h-3.5z" fill="#1A1A1A"/>
      <path d="M11.2 9H5.1l-.1.3c4.3 1.1 7.1 3.7 8.3 6.9l-1.2-6c-.2-.8-.7-1-1-.1z" fill="#F7B600"/>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 48 32" className="h-5 opacity-50 hover:opacity-100 transition-opacity duration-300">
      <circle cx="19" cy="16" r="9" fill="#EB001B" opacity="0.8"/>
      <circle cx="29" cy="16" r="9" fill="#F79E1B" opacity="0.8"/>
      <path d="M24 9.5a9 9 0 013 6.5 9 9 0 01-3 6.5 9 9 0 01-3-6.5A9 9 0 0124 9.5z" fill="#FF5F00" opacity="0.8"/>
    </svg>
  ),
  paypal: (
    <svg viewBox="0 0 48 32" className="h-5 opacity-50 hover:opacity-100 transition-opacity duration-300">
      <path d="M31.5 8.5h-8.7c-.5 0-.9.3-1 .8l-2.4 14.8c-.1.4.3.7.7.7h3.6c.5 0 .9-.3 1-.8l.7-4.5c.1-.5.5-.8 1-.8h2.2c4.3 0 6.8-2.1 7.4-6.3.3-1.8 0-3.2-.8-4.1-.9-1-2.3-1.5-3.9-1.5l.8-.3z" fill="white"/>
      <path d="M32.3 8.8c-.2 0-.3 0-.4.1-.9.4-1.6 1.1-2 2.1-.8 1.9-.3 4.1 1.2 5.2.7.5 1.5.7 2.4.7h.7c.4 0 .7-.2.8-.6l.7-4.5c.1-.3 0-.5-.1-.7-.4-.7-1.2-1.2-2.1-1.4-.3-.1-.7-.2-1.2-.2v-.4z" fill="white"/>
      <path d="M30.1 8.5h-8.7c-.5 0-.9.3-1 .8l-2.4 14.8c-.1.4.3.7.7.7h3.3c.4-.1.7-.3.8-.7l.7-4.5c.1-.5.5-.8 1-.8h2.2c4.3 0 6.8-2.1 7.4-6.3.3-1.8 0-3.2-.8-4.1-.9-1-2.3-1.5-3.9-1.5l-.3.6z" fill="white"/>
    </svg>
  ),
  applepay: (
    <svg viewBox="0 0 48 32" className="h-5 opacity-50 hover:opacity-100 transition-opacity duration-300">
      <path d="M18.7 10.2c.5-.6.9-1.5.8-2.3-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.2.8.1 1.7-.4 2.2-1zm.7 1.1c-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.3 2-1.4 2.4-.4 5.9 1 7.8.7 1 1.5 2 2.5 2 .9 0 1.3-.6 2.5-.6s1.5.6 2.5.6c1.1 0 1.8-1 2.5-2 .5-.7.7-1.1 1.1-1.9-2.1-.8-2.4-3.8-.3-5.1-.8-.9-1.9-1.3-3.3-.9zm10.2 0.5c-1.3 0-2.1.6-2.8.6-.7 0-1.4-.5-2.4-.5-1.7 0-2.9 1-3.7 2.3-1.6 2.7-.4 6.6 1.1 8.8.7 1.1 1.6 2.3 2.7 2.3 1 0 1.4-.7 2.6-.7 1.3 0 1.6.7 2.6.7 1.1 0 1.9-1.1 2.6-2.3.8-1.3 1.1-2.5 1.1-2.6 0-.1-2.1-.8-2.1-3 0-1.9 1.5-2.8 1.6-2.9-.9-1.3-2.2-1.4-2.5-1.5h-.8v.1z" fill="white"/>
    </svg>
  ),
  amex: (
    <svg viewBox="0 0 48 32" className="h-5 opacity-50 hover:opacity-100 transition-opacity duration-300">
      <path d="M10 12.5l2.5 6.1 2.5-6.1h2.4l-3.7 8.7h-2.4L7.6 12.5H10zm10.6 0v8.7h2.2v-3.2h2.5c2 0 3.3-1.2 3.3-2.8s-1.3-2.7-3.3-2.7h-4.7zm2.2 1.5h2.2c1 0 1.6.5 1.6 1.3s-.6 1.2-1.6 1.2h-2.2v-2.5zm11.3-1.5l-2.2 5.3-2.3-5.3h-2.6l3.5 8.7h2.2l3.5-8.7h-2.1zm6.6 0v1.4h3.1v1.5h-3.1v1.4h3.3v1.5h-5.5v-8.7h5.5v1.4h-3.3v1.5z" fill="white"/>
    </svg>
  ),
  googlepay: (
    <svg viewBox="0 0 48 32" className="h-5 opacity-50 hover:opacity-100 transition-opacity duration-300">
      <path d="M19.2 16.5c0-.5 0-.9.1-1.3h-5.7v2.5h3.3c-.1.7-.5 1.3-1.1 1.7v1.4h1.8c1.1-1 1.6-2.5 1.6-4.3z" fill="white"/>
      <path d="M13.6 19.2c-.7 0-1.3-.2-1.8-.6l-1.8 1.4c1.1 1 2.5 1.6 3.6 1.6 2.2 0 4-1.5 4.6-3.4h-1.8c-.5.8-1.4 1-2.8 1z" fill="white"/>
      <path d="M11.8 15.9l-1.8-1.4c-1-.8-1.5-2-1.5-3.3s.5-2.5 1.5-3.3l1.8 1.4c-.5.7-.8 1.5-.8 2.4s.3 1.7.8 2.4z" fill="white"/>
      <path d="M13.6 9.8c1.1 0 2.1.4 2.8 1.1l1.8-1.4c-1.1-1-2.5-1.6-4.6-1.6-2 0-3.7.9-4.7 2.3l1.8 1.4c.5-1 1.3-1.8 2.9-1.8z" fill="white"/>
    </svg>
  ),
};

const socialLinks = [
  { name: 'Instagram', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
  { name: 'TikTok', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 005.58 2.18V2.44a4.84 4.84 0 01-1-.06z"/></svg> },
  { name: 'Pinterest', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg> },
  { name: 'Twitter', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
];

const footerLinks = {
  boutique: [
    { label: 'Tous les produits', to: '/products' },
    { label: 'Nouveautés', to: '/products?category=Robes' },
    { label: 'Robes', to: '/products?category=Robes' },
    { label: 'Vestes', to: '/products?category=Vestes' },
    { label: 'Pantalons', to: '/products?category=Pantalons' },
  ],
  aide: [
    { label: 'Guide des tailles', href: '#' },
    { label: 'Livraison & retours', href: '#' },
    { label: 'Suivi de commande', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Nous contacter', to: '/contact' },
  ],
  maison: [
    { label: 'Notre histoire', href: '#' },
    { label: 'Durabilité', href: '#' },
    { label: 'Carrières', href: '#' },
    { label: 'Presse', href: '#' },
    { label: 'Programme fidélité', href: '#' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-charcoal text-gray-500 mt-auto">
      {/* Champagne accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-champagne/40 to-transparent" />

      {/* Newsletter */}
      <div className="border-b border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-champagne text-[10px] font-medium tracking-[0.3em] uppercase mb-2">Newsletter</p>
              <h3 className="text-white text-lg font-light tracking-[-0.01em]">Restez informé</h3>
              <p className="text-[13px] text-gray-500 mt-1.5 font-light">Nouveautés et offres exclusives en avant-première.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-0">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="flex-1 md:w-72 px-5 py-3 bg-white/[0.04] border border-white/[0.06] rounded-l-full text-[13px] text-white placeholder:text-gray-600 focus:ring-1 focus:ring-champagne/30 focus:bg-white/[0.06] focus:border-champagne/20 outline-none transition-all font-light"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-charcoal rounded-r-full text-[11px] tracking-[0.08em] uppercase font-medium hover:bg-champagne hover:text-white transition-all duration-300 whitespace-nowrap"
              >
                {subscribed ? '✓' : "S'inscrire"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block">
              <span className="text-xl font-semibold text-white tracking-[-0.02em]">MAISON</span>
              <span className="text-xl font-light text-champagne">.</span>
            </Link>
            <p className="text-[13px] text-gray-500 mt-5 leading-relaxed font-light max-w-[240px]">
              Mode contemporaine pensée pour durer. Qualité, style et responsabilité au coeur de chaque pièce.
            </p>
            {/* Social */}
            <div className="flex gap-2 mt-6">
              {socialLinks.map(s => (
                <a
                  key={s.name}
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/[0.06] flex items-center justify-center text-gray-600 hover:text-white hover:border-white/20 transition-all duration-300"
                  title={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-[11px] font-medium tracking-[0.15em] uppercase mb-5">Boutique</h4>
            <ul className="space-y-3">
              {footerLinks.boutique.map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[13px] text-gray-500 hover:text-white transition-colors duration-300 font-light">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[11px] font-medium tracking-[0.15em] uppercase mb-5">Aide</h4>
            <ul className="space-y-3">
              {footerLinks.aide.map(l => (
                <li key={l.label}>
                  {'to' in l && l.to ? (
                    <Link to={l.to} className="text-[13px] text-gray-500 hover:text-white transition-colors duration-300 font-light">{l.label}</Link>
                  ) : (
                    <a href={l.href} className="text-[13px] text-gray-500 hover:text-white transition-colors duration-300 font-light">{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[11px] font-medium tracking-[0.15em] uppercase mb-5">Maison</h4>
            <ul className="space-y-3">
              {footerLinks.maison.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-[13px] text-gray-500 hover:text-white transition-colors duration-300 font-light">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Payment methods — monochrome luxe */}
            <div className="flex items-center gap-2.5">
              {Object.entries(paymentIcons).map(([name, icon]) => (
                <div
                  key={name}
                  className="bg-white/[0.04] rounded-md px-2.5 py-1.5 flex items-center justify-center cursor-default"
                  title={name}
                >
                  {icon}
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-5 text-[11px] text-gray-600 font-light">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-champagne/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Sécurisé
              </span>
              <span className="w-px h-3 bg-white/[0.06]" />
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-champagne/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                SSL 256-bit
              </span>
              <span className="w-px h-3 bg-white/[0.06]" />
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-champagne/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Retours 30j
              </span>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-5 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-gray-600 font-light tracking-wide">&copy; {new Date().getFullYear()} MAISON. Tous droits réservés.</p>
            <div className="flex gap-5">
              <a href="#" className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-light tracking-wide">CGV</a>
              <a href="#" className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-light tracking-wide">Confidentialité</a>
              <a href="#" className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-light tracking-wide">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
