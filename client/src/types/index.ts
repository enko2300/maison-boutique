export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  discount: number;
  promoCodeId: string | null;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
  user?: { name: string; email: string };
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
  product: Product;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'percent' | 'fixed';
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

export interface ReviewStats {
  avg: number;
  count: number;
  distribution: Record<number, number>;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
}
