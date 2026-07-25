import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  image: z.string().url(),
  category: z.enum(['T-shirts', 'Robes', 'Vestes', 'Pantalons', 'Sweats', 'Chemises', 'Jupes']),
  sizes: z.array(z.string()).min(1),
  colors: z.array(z.string()).min(1),
  stock: z.number().int().min(0),
  featured: z.boolean(),
});

describe('Product validation schema', () => {
  it('accepts valid product', () => {
    const result = productSchema.safeParse({
      name: 'T-shirt Test',
      description: 'Description test',
      price: 29.99,
      image: 'https://example.com/image.jpg',
      category: 'T-shirts',
      sizes: ['S', 'M'],
      colors: ['Noir'],
      stock: 10,
      featured: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative price', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      description: 'Test',
      price: -5,
      image: 'https://example.com/image.jpg',
      category: 'T-shirts',
      sizes: ['S'],
      colors: ['Noir'],
      stock: 10,
      featured: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = productSchema.safeParse({
      name: '',
      description: 'Test',
      price: 29.99,
      image: 'https://example.com/image.jpg',
      category: 'T-shirts',
      sizes: ['S'],
      colors: ['Noir'],
      stock: 10,
      featured: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      description: 'Test',
      price: 29.99,
      image: 'https://example.com/image.jpg',
      category: 'Invalid',
      sizes: ['S'],
      colors: ['Noir'],
      stock: 10,
      featured: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty sizes array', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      description: 'Test',
      price: 29.99,
      image: 'https://example.com/image.jpg',
      category: 'T-shirts',
      sizes: [],
      colors: ['Noir'],
      stock: 10,
      featured: false,
    });
    expect(result.success).toBe(false);
  });
});
