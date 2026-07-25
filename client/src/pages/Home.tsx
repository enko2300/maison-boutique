import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/products';
import ProductCard from '../components/products/ProductCard';
import ScrollReveal from '../components/ui/ScrollReveal';
import QuickView from '../components/products/QuickView';
import SEOHead from '../components/seo/SEOHead';
import { useState } from 'react';
import type { Product } from '../types';

export default function Home() {
  const { data: featured } = useQuery({ queryKey: ['featured'], queryFn: () => productApi.featured().then(r => r.data) });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <div>
      <SEOHead title="Boutique de mode haut de gamme" description="Découvrez notre collection de vêtements et accessoires. Pièces intemporelles, qualité premium, livraison gratuite dès 50€." />
      {/* Hero */}
      <section className="relative bg-charcoal text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-gray-900 to-charcoal opacity-80" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 py-28 md:py-40">
          <div className="max-w-2xl">
            <p className="text-champagne text-[11px] font-medium tracking-[0.3em] uppercase mb-6">Collection Automne-Hiver</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[-0.03em] leading-[1.1]">
              L'élégance<br/>
              <span className="font-medium">redéfinie</span>
            </h1>
            <p className="text-gray-400 mt-6 text-[15px] font-light leading-relaxed max-w-md">
              Des pièces intemporelles, pensées avec soin. Qualité, coupe et durabilité pour une garde-robe qui vous ressemble.
            </p>
            <div className="flex items-center gap-4 mt-10">
              <Link to="/products" className="inline-flex items-center gap-3 bg-white text-charcoal px-8 py-3.5 rounded-full text-[12px] tracking-[0.08em] uppercase font-medium hover:bg-champagne hover:text-white transition-all duration-300">
                Découvrir
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link to="/products?category=Robes" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-[12px] tracking-[0.06em] uppercase font-light transition-colors duration-300 ml-2">Nouveautés</Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne/30 to-transparent" />
      </section>

      {/* Featured */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-champagne text-[11px] font-medium tracking-[0.2em] uppercase mb-2">Sélection</p>
              <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] text-charcoal">Nos coups de coeur</h2>
            </div>
            <Link to="/products" className="text-[12px] tracking-[0.06em] uppercase text-gray-400 hover:text-charcoal transition-colors font-light hidden md:block">Tout voir →</Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
          {featured?.slice(0, 8).map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 80}>
              <ProductCard product={p} onQuickView={setQuickViewProduct} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      <ScrollReveal>
        <section className="bg-cream">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
            <div className="text-center mb-12">
              <p className="text-champagne text-[11px] font-medium tracking-[0.2em] uppercase mb-2">Explorer</p>
              <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] text-charcoal">Nos univers</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'T-shirts', count: '24 pièces', gradient: 'from-gray-100 to-gray-50' },
                { name: 'Robes', count: '18 pièces', gradient: 'from-stone-100 to-stone-50' },
                { name: 'Vestes', count: '15 pièces', gradient: 'from-neutral-100 to-neutral-50' },
                { name: 'Pantalons', count: '20 pièces', gradient: 'from-zinc-100 to-zinc-50' },
              ].map(cat => (
                <Link key={cat.name} to={`/products?category=${cat.name}`}
                  className="group relative bg-gradient-to-br bg-white rounded-2xl p-8 overflow-hidden hover:shadow-xl transition-all duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      <span className="text-lg font-light text-charcoal">{cat.name[0]}</span>
                    </div>
                    <h3 className="text-[15px] font-medium text-charcoal mb-1">{cat.name}</h3>
                    <p className="text-[12px] text-gray-400 font-light">{cat.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Values */}
      <ScrollReveal>
        <section className="border-y border-gray-100">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
              {[
                { icon: '◇', title: 'Qualité premium', desc: 'Tissus soigneusement sélectionnés' },
                { icon: '○', title: 'Livraison offerte', desc: 'Dès 50€ d\'achat' },
                { icon: '□', title: 'Retours faciles', desc: 'Sous 30 jours, gratuits' },
                { icon: '△', title: 'Paiement sécurisé', desc: 'Visa, Mastercard, PayPal' },
              ].map(v => (
                <div key={v.title} className="py-8 lg:py-10 lg:px-8 first:pl-0">
                  <span className="text-champagne text-xl mb-3 block">{v.icon}</span>
                  <h4 className="text-[13px] font-medium text-charcoal mb-1">{v.title}</h4>
                  <p className="text-[12px] text-gray-400 font-light">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
