export function mockCheckout(items: { name: string; price: number; quantity: number }[]) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    success: true,
    transactionId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    total,
  };
}
