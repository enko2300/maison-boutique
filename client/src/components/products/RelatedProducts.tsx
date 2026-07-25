import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/products';
import ProductCard from './ProductCard';
import ScrollReveal from '../ui/ScrollReveal';
import type { Product } from '../../types';

interface Props {
  currentProduct: Product;
  onQuickView?: (product: Product) => void;
}

export default function RelatedProducts({ currentProduct, onQuickView }: Props) {
  const { data } = useQuery({
    queryKey: ['products', currentProduct.category],
    queryFn: () => productApi.list({ category: currentProduct.category, limit: 8 }).then(r => r.data),
  });

  const related = data?.products?.filter(p => p.id !== currentProduct.id).slice(0, 4) ?? [];

  if (related.length === 0) return null;

  return (
    <ScrollReveal>
      <section className="mt-20 border-t border-gray-100 pt-16">
        <div className="text-center mb-10">
          <p className="text-champagne text-[10px] font-medium tracking-[0.25em] uppercase mb-2">Vous aimerez aussi</p>
          <h2 className="text-2xl font-light tracking-[-0.01em] text-charcoal">Nos suggestions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-7">
          {related.map(p => (
            <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
