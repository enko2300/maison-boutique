import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../api/client';

interface Suggestion {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface Props {
  onClose?: () => void;
}

export default function SearchAutocomplete({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    api.get('/products/autocomplete', { params: { q: debouncedQuery } })
      .then(r => setResults(r.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const handleSelect = (id: string) => {
    navigate(`/products/${id}`);
    setQuery('');
    setResults([]);
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex].id);
    } else if (e.key === 'Escape') {
      setResults([]);
      onClose?.();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Rechercher un produit..."
        className="w-full pl-11 pr-10 py-3 bg-cream dark:bg-gray-800 border-0 rounded-full text-[13px] placeholder:text-gray-400 focus:ring-1 focus:ring-champagne/40 transition-all outline-none font-light text-charcoal dark:text-gray-200"
        autoFocus
      />
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-700 overflow-hidden animate-dropdown z-50">
          {results.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                i === selectedIndex ? 'bg-cream dark:bg-gray-700' : 'hover:bg-cream/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-charcoal dark:text-gray-200 truncate">{item.name}</p>
                <p className="text-[11px] text-gray-400">{item.category}</p>
              </div>
              <span className="text-[13px] font-medium text-charcoal dark:text-gray-200">{item.price.toFixed(2)} €</span>
            </button>
          ))}
        </div>
      )}

      {loading && debouncedQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 text-center">
          <div className="w-5 h-5 border-2 border-champagne border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}
    </div>
  );
}
