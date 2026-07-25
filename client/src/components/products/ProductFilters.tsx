import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ProductFilters({ categories }: { categories: string[] }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const currentCategory = searchParams.get('category') || 'all';

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'all') params.delete('category');
    else params.set('category', cat);
    params.set('page', '1');
    navigate(`/products?${params}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set('search', search);
    else params.delete('search');
    params.set('page', '1');
    navigate(`/products?${params}`);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 text-sm rounded-full border transition ${currentCategory === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
        >
          Tous
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 text-sm rounded-full border transition ${currentCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
