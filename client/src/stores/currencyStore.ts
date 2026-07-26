import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'CHF' | 'EUR' | 'USD';

const symbols: Record<Currency, string> = { CHF: 'CHF', EUR: '€', USD: '$' };
const rates: Record<Currency, number> = { CHF: 1, EUR: 0.95, USD: 1.08 };

interface CurrencyState {
  currency: Currency;
  set: (c: Currency) => void;
  symbol: () => string;
  convert: (priceInCHF: number) => number;
  format: (priceInCHF: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'CHF',
      set: (c) => set({ currency: c }),
      symbol: () => symbols[get().currency],
      convert: (priceInCHF) => priceInCHF * rates[get().currency],
      format: (priceInCHF) => {
        const converted = priceInCHF * rates[get().currency];
        return `${converted.toFixed(2)} ${symbols[get().currency]}`;
      },
    }),
    { name: 'currency' }
  )
);
