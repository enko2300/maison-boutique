import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import type { Product } from '../types';

const mockProduct: Product = {
  id: 'test-1',
  name: 'T-shirt Test',
  description: 'Un t-shirt de test',
  price: 29.99,
  image: 'https://picsum.photos/seed/test/400/500',
  category: 'T-shirts',
  sizes: ['S', 'M', 'L'],
  colors: ['Noir', 'Blanc'],
  stock: 10,
  featured: false,
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ProductCard', () => {
  it('renders product name', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    expect(screen.getByText('T-shirt Test')).toBeDefined();
  });

  it('renders product price', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    expect(screen.getByText('29.99 €')).toBeDefined();
  });

  it('renders product category', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    expect(screen.getByText('T-shirts')).toBeDefined();
  });

  it('renders product image', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    const img = screen.getByAltText('T-shirt Test');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('https://picsum.photos/seed/test/400/500');
  });

  it('links to product detail page', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/products/test-1');
  });
});
