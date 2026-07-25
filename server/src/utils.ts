export function parseProduct(p: any) {
  return {
    ...p,
    sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
  };
}

export function parseCartItem(item: any) {
  return {
    ...item,
    product: parseProduct(item.product),
  };
}
