import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { useState, useMemo } from 'react';
import type { Product } from '../../types';

type SortKey = 'name' | 'price' | 'stock' | 'category' | 'createdAt';
type SortDir = 'asc' | 'desc';

const emptyProduct: Partial<Product> = {
  name: '', description: '', price: 0, image: '', category: 'T-shirts',
  sizes: ['S', 'M', 'L'], colors: ['Noir'], stock: 0, featured: false,
};

export default function ProductsAdmin() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.products.list().then(r => r.data),
  });

  // Local state
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [quickStock, setQuickStock] = useState<Record<string, number>>({});

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.products.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (p: Partial<Product>) =>
      p.id ? adminApi.products.update(p.id, p) : adminApi.products.create(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditing(null);
      setIsCreating(false);
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) await adminApi.products.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setSelected(new Set());
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      adminApi.products.update(id, { stock }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  // Derived data
  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== 'all') result = result.filter(p => p.category === catFilter);
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [products, search, catFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setIsCreating(false);
  };

  const openCreate = () => {
    setEditing({ ...emptyProduct });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!editing) return;
    saveMutation.mutate(editing);
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <svg className={`w-3 h-3 inline-block ml-1 transition-transform ${sortKey === col ? 'text-charcoal' : 'text-gray-300'} ${sortKey === col && sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 bg-cream border-0 rounded-lg text-[13px] focus:ring-1 focus:ring-champagne/30 outline-none font-light"
            />
          </div>
          {/* Category filter */}
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="px-3 py-2 bg-cream border-0 rounded-lg text-[12px] text-gray-600 focus:ring-1 focus:ring-champagne/30 outline-none font-light"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Toutes' : c}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => { if (confirm(`Supprimer ${selected.size} produit(s) ?`)) bulkDelete.mutate([...selected]); }}
              className="px-3 py-2 text-[11px] tracking-[0.04em] uppercase font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Supprimer ({selected.size})
            </button>
          )}
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-charcoal text-white rounded-lg text-[12px] tracking-[0.04em] uppercase font-medium hover:bg-charcoal/90 transition-colors"
          >
            + Nouveau produit
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100/60">
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-charcoal focus:ring-champagne/30 accent-charcoal cursor-pointer" />
                </th>
                <th className="px-5 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-medium cursor-pointer hover:text-charcoal transition-colors" onClick={() => toggleSort('name')}>
                  Produit <SortIcon col="name" />
                </th>
                <th className="px-5 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-medium cursor-pointer hover:text-charcoal transition-colors hidden md:table-cell" onClick={() => toggleSort('category')}>
                  Catégorie <SortIcon col="category" />
                </th>
                <th className="px-5 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-medium cursor-pointer hover:text-charcoal transition-colors" onClick={() => toggleSort('price')}>
                  Prix <SortIcon col="price" />
                </th>
                <th className="px-5 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-medium cursor-pointer hover:text-charcoal transition-colors" onClick={() => toggleSort('stock')}>
                  Stock <SortIcon col="stock" />
                </th>
                <th className="px-5 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-medium hidden lg:table-cell">État</th>
                <th className="px-5 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-[13px] text-gray-400 font-light">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-[13px] text-gray-400 font-light">Aucun produit trouvé</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className={`group hover:bg-cream/30 transition-colors ${selected.has(p.id) ? 'bg-cream/50' : ''}`}>
                  <td className="px-5 py-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                      className="w-4 h-4 rounded border-gray-300 text-charcoal focus:ring-champagne/30 accent-charcoal cursor-pointer" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-charcoal truncate max-w-[180px]">{p.name}</p>
                        <p className="text-[11px] text-gray-400 font-light md:hidden">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-[12px] text-gray-500 font-light">{p.category}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[13px] font-medium text-charcoal">{p.price.toFixed(2)} €</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={quickStock[p.id] ?? p.stock}
                        onChange={e => setQuickStock({ ...quickStock, [p.id]: Number(e.target.value) })}
                        onBlur={() => {
                          if (quickStock[p.id] !== undefined && quickStock[p.id] !== p.stock) {
                            stockMutation.mutate({ id: p.id, stock: quickStock[p.id] });
                          }
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        className={`w-16 px-2 py-1 text-[12px] font-medium rounded-md border text-center outline-none transition-colors ${
                          p.stock === 0 ? 'border-red-200 bg-red-50 text-red-600' :
                          p.stock <= 5 ? 'border-amber-200 bg-amber-50 text-amber-700' :
                          'border-gray-200 bg-cream text-charcoal focus:border-champagne/40'
                        }`}
                      />
                      {p.stock <= 5 && p.stock > 0 && <span className="text-[9px] text-amber-600">⚠</span>}
                      {p.stock === 0 && <span className="text-[9px] text-red-500">●</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      {p.featured && (
                        <span className="text-[9px] bg-champagne/10 text-champagne px-1.5 py-0.5 rounded font-medium">★ Vedette</span>
                      )}
                      <div className="flex gap-0.5">
                        {p.sizes.slice(0, 3).map(s => (
                          <span key={s} className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">{s}</span>
                        ))}
                        {p.sizes.length > 3 && <span className="text-[9px] text-gray-400">+{p.sizes.length - 3}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-cream text-gray-400 hover:text-charcoal transition-colors" title="Modifier">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => {
                        saveMutation.mutate({ ...p, featured: !p.featured });
                      }} className={`p-1.5 rounded-md transition-colors ${p.featured ? 'text-champagne hover:bg-champagne/10' : 'text-gray-400 hover:bg-cream hover:text-champagne'}`} title="Vedette">
                        <svg className="w-4 h-4" fill={p.featured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                      </button>
                      <button onClick={() => { if (confirm(`Supprimer "${p.name}" ?`)) deleteMutation.mutate(p.id); }} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100/60 text-[11px] text-gray-400 font-light">
            {filtered.length} produit{filtered.length > 1 ? 's' : ''} · {selected.size > 0 ? `${selected.size} sélectionné${selected.size > 1 ? 's' : ''}` : `${products.filter(p => p.stock <= 5).length} stock faible`}
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-dropdown">
            <div className="sticky top-0 bg-white border-b border-gray-100/60 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-[15px] font-medium text-charcoal">{isCreating ? 'Nouveau produit' : 'Modifier le produit'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-full hover:bg-cream transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Image preview */}
              {editing.image && (
                <div className="aspect-[16/9] bg-gray-50 rounded-xl overflow-hidden">
                  <img src={editing.image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-1.5">Nom</label>
                  <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-cream border-0 rounded-xl text-[13px] focus:ring-1 focus:ring-champagne/30 outline-none font-light" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-1.5">Description</label>
                  <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3}
                    className="w-full px-3 py-2.5 bg-cream border-0 rounded-xl text-[13px] focus:ring-1 focus:ring-champagne/30 outline-none font-light resize-none" />
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-1.5">Prix (€)</label>
                  <input type="number" step="0.01" value={editing.price || ''} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-cream border-0 rounded-xl text-[13px] focus:ring-1 focus:ring-champagne/30 outline-none font-light" />
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-1.5">Catégorie</label>
                  <select value={editing.category || 'T-shirts'} onChange={e => setEditing({ ...editing, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-cream border-0 rounded-xl text-[13px] focus:ring-1 focus:ring-champagne/30 outline-none font-light">
                    {['T-shirts', 'Robes', 'Vestes', 'Pantalons', 'Sweats', 'Chemises', 'Jupes'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-1.5">Stock</label>
                  <input type="number" value={editing.stock ?? 0} onChange={e => setEditing({ ...editing, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-cream border-0 rounded-xl text-[13px] focus:ring-1 focus:ring-champagne/30 outline-none font-light" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2.5">
                    <input type="checkbox" checked={editing.featured || false} onChange={e => setEditing({ ...editing, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-charcoal focus:ring-champagne/30 accent-charcoal" />
                    <span className="text-[12px] text-gray-600 font-light">Produit vedette</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-1.5">Image URL</label>
                  <input value={editing.image || ''} onChange={e => setEditing({ ...editing, image: e.target.value })}
                    className="w-full px-3 py-2.5 bg-cream border-0 rounded-xl text-[13px] focus:ring-1 focus:ring-champagne/30 outline-none font-light" placeholder="https://..." />
                </div>

                {/* Sizes */}
                <div className="col-span-2">
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-1.5">Tailles</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(editing.sizes || []).map(s => (
                      <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream rounded-lg text-[12px] text-charcoal">
                        {s}
                        <button onClick={() => setEditing({ ...editing, sizes: (editing.sizes || []).filter(x => x !== s) })} className="text-gray-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={sizeInput} onChange={e => setSizeInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && sizeInput.trim()) { setEditing({ ...editing, sizes: [...(editing.sizes || []), sizeInput.trim()] }); setSizeInput(''); } }}
                      placeholder="Ajouter une taille" className="flex-1 px-3 py-2 bg-cream border-0 rounded-lg text-[12px] focus:ring-1 focus:ring-champagne/30 outline-none font-light" />
                    <button onClick={() => { if (sizeInput.trim()) { setEditing({ ...editing, sizes: [...(editing.sizes || []), sizeInput.trim()] }); setSizeInput(''); } }}
                      className="px-3 py-2 bg-gray-100 rounded-lg text-[12px] text-gray-600 hover:bg-gray-200 transition-colors">+</button>
                  </div>
                </div>

                {/* Colors */}
                <div className="col-span-2">
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-1.5">Couleurs</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(editing.colors || []).map(c => (
                      <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream rounded-lg text-[12px] text-charcoal">
                        {c}
                        <button onClick={() => setEditing({ ...editing, colors: (editing.colors || []).filter(x => x !== c) })} className="text-gray-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={colorInput} onChange={e => setColorInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && colorInput.trim()) { setEditing({ ...editing, colors: [...(editing.colors || []), colorInput.trim()] }); setColorInput(''); } }}
                      placeholder="Ajouter une couleur" className="flex-1 px-3 py-2 bg-cream border-0 rounded-lg text-[12px] focus:ring-1 focus:ring-champagne/30 outline-none font-light" />
                    <button onClick={() => { if (colorInput.trim()) { setEditing({ ...editing, colors: [...(editing.colors || []), colorInput.trim()] }); setColorInput(''); } }}
                      className="px-3 py-2 bg-gray-100 rounded-lg text-[12px] text-gray-600 hover:bg-gray-200 transition-colors">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100/60 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-[12px] text-gray-500 hover:text-charcoal transition-colors">Annuler</button>
              <button onClick={handleSave} disabled={saveMutation.isPending}
                className="px-5 py-2.5 bg-charcoal text-white rounded-full text-[12px] tracking-[0.04em] uppercase font-medium hover:bg-charcoal/90 transition-all disabled:opacity-50">
                {saveMutation.isPending ? 'Sauvegarde...' : isCreating ? 'Créer' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
