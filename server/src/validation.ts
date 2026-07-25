import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive('Le prix doit être positif'),
  image: z.string().url('URL image invalide'),
  category: z.enum(['T-shirts', 'Robes', 'Vestes', 'Pantalons', 'Sweats', 'Chemises', 'Jupes']),
  sizes: z.union([z.array(z.string()), z.string()]),
  colors: z.union([z.array(z.string()), z.string()]),
  stock: z.number().int().min(0, 'Stock ne peut pas être négatif'),
  featured: z.boolean().optional().default(false),
});

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().optional().default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.enum(['commande', 'produit', 'retour', 'partenariat', 'presse', 'autre']),
  message: z.string().min(10).max(5000),
});

// Helper to normalize sizes/colors from JSON strings
export function normalizeStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return [val];
    }
  }
  return [];
}
