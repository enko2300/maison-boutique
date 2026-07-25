import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/products';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useToastStore } from '../components/ui/Toast';
import { ProductDetailSkeleton } from '../components/ui/Skeletons';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ImageGallery from '../components/products/ImageGallery';
import QuantitySelector from '../components/ui/QuantitySelector';
import RelatedProducts from '../components/products/RelatedProducts';
import QuickView from '../components/products/QuickView';
import SEOHead from '../components/seo/SEOHead';
import { useState } from 'react';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const showToast = useToastStore(s => s.show);
  const toggleWishlist = useWishlistStore(s => s.toggle);
  const isWished = useWishlistStore(s => s.has(id || ''));
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.detail(id!).then(r => r.data),
    enabled: !!id,
    retry: 1,
  });

  if (isLoading) return <ProductDetailSkeleton />;
  if (error || !product) return (
    <div className="text-center py-20">
      <p className="text-[13px] text-gray-400 font-light">{error ? 'Erreur lors du chargement.' : 'Produit introuvable.'}</p>
      <button onClick={() => navigate('/products')} className="mt-4 text-[12px] text-charcoal font-medium hover:text-champagne transition-colors">Retour au catalogue</button>
    </div>
  );

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    for (let i = 0; i < quantity; i++) {
      await addItem(product.id, selectedSize || product.sizes[0], selectedColor || product.colors[0]);
    }
    setAdded(true);
    showToast(`${quantity} article${quantity > 1 ? 's' : ''} ajouté${quantity > 1 ? 's' : ''} au panier`, 'cart');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = () => {
    if (!user) return navigate('/login');
    toggleWishlist(product.id);
    showToast(isWished ? 'Retiré des favoris' : 'Ajouté aux favoris', 'heart');
  };

  // Generate multiple "images" for gallery demo
  const images = [product.image];

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
      <SEOHead
        title={product.name}
        description={product.description}
        image={product.image}
        type="product"
      />
      <Breadcrumbs items={[
        { label: product.category, path: `/products?category=${product.category}` },
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image gallery */}
        <ImageGallery images={images} alt={product.name} />

        {/* Product info */}
        <div className="flex flex-col">
          <p className="text-champagne text-[11px] font-medium tracking-[0.2em] uppercase mb-3">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-light tracking-[-0.02em] text-charcoal leading-tight">{product.name}</h1>
          <p className="text-xl font-medium text-charcoal mt-4">{product.price.toFixed(2)} €</p>
          <p className="text-gray-400 mt-5 text-[14px] font-light leading-relaxed">{product.description}</p>

          {/* Sizes */}
          <div className="mt-8">
            <p className="text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-3">Taille</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`w-12 h-10 text-[12px] rounded-lg border transition-all duration-200 ${selectedSize === s ? 'border-charcoal bg-charcoal text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="mt-5">
            <p className="text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-3">Couleur</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                <button key={c} onClick={() => setSelectedColor(c)}
                  className={`px-4 h-10 text-[12px] rounded-lg border transition-all duration-200 ${selectedColor === c ? 'border-charcoal bg-charcoal text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="mt-8">
            <p className="text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-3">Quantité</p>
            <div className="flex items-center gap-4">
              <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} />
              <span className="text-[12px] text-gray-400 font-light">{product.stock} disponible{product.stock > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="flex-1 bg-charcoal text-white py-3.5 rounded-full text-[12px] tracking-[0.08em] uppercase font-medium hover:bg-charcoal/90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
              {added ? '✓ Ajouté' : product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </button>
            <button onClick={handleWishlist}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 ${isWished ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-red-400'}`}>
              <svg className="w-5 h-5" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-[11px] text-amber-600 font-light mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Plus que {product.stock} en stock
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
            {[
              { icon: '◇', text: 'Qualité premium' },
              { icon: '○', text: 'Livraison offerte' },
              { icon: '□', text: 'Retours 30j' },
            ].map(v => (
              <div key={v.text} className="text-center">
                <span className="text-champagne text-sm">{v.icon}</span>
                <p className="text-[10px] text-gray-400 font-light mt-1">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RelatedProducts currentProduct={product} onQuickView={setQuickViewProduct} />
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
