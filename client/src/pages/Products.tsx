import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/products';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import ScrollReveal from '../components/ui/ScrollReveal';
import QuickView from '../components/products/QuickView';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { useState } from 'react';
import type { Product } from '../types';

export default function Products() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = Number(searchParams.get('page') || '1');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', category, search, page],
    queryFn: () => productApi.list({ category, search, page }).then(r => r.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.categories().then(r => r.data),
  });

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
      <Breadcrumbs items={category ? [{ label: category }] : []} />

      <ScrollReveal>
        <div className="mb-8">
          <p className="text-champagne text-[11px] font-medium tracking-[0.3em] uppercase mb-2">Collection</p>
          <h1 className="text-3xl md:text-4xl font-light tracking-[-0.02em] text-charcoal">
            {category || (search ? `Résultats pour "${search}"` : 'Catalogue')}
          </h1>
          {data && <p className="text-[13px] text-gray-400 font-light mt-2">{data.total} produit{data.total > 1 ? 's' : ''}</p>}
        </div>
      </ScrollReveal>

      <ProductFilters categories={categories} />

      {isLoading ? (
        <div className="mt-8"><ProductGridSkeleton count={8} /></div>
      ) : data?.products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[13px] text-gray-400 font-light mb-4">Aucun produit trouvé.</p>
          <a href="/products" className="text-[12px] tracking-[0.06em] uppercase text-charcoal font-medium hover:text-champagne transition-colors">Voir tout le catalogue</a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7 mt-8">
            {data?.products.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 60}>
                <ProductCard product={p} onQuickView={setQuickViewProduct} />
              </ScrollReveal>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                <a key={p}
                  href={`/products?${new URLSearchParams({ ...(category && { category }), ...(search && { search }), page: String(p) })}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-[12px] font-medium transition-all duration-200 ${p === page ? 'bg-charcoal text-white' : 'border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      )}

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
