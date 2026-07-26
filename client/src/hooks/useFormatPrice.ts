import { useCurrencyStore } from '../stores/currencyStore';

export function useFormatPrice() {
  const format = useCurrencyStore(s => s.format);
  const symbol = useCurrencyStore(s => s.symbol);
  const convert = useCurrencyStore(s => s.convert);
  return { format, symbol, convert };
}
