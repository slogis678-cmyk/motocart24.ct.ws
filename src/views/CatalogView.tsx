import React, { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Car,
  Search,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { store } from '../services/store';
import { Category, Product, Vehicle } from '../types';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';

interface CatalogViewProps {
  initialParam?: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenVehicleModal: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialParam,
  onNavigate,
  onOpenVehicleModal,
}) => {
  const categories = store.getCategories();
  const brands = store.getBrands();
  const activeVehicle = store.getActiveVehicle();

  // Parse URL query parameters from initialParam
  const params = useMemo(() => new URLSearchParams(initialParam || ''), [initialParam]);

  const [searchQuery, setSearchQuery] = useState(params.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(params.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(params.get('sub') || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(params.get('brand') || '');
  const [vehicleIdFilter, setVehicleIdFilter] = useState<string>(
    params.get('vehicle') || (activeVehicle ? activeVehicle.id : '')
  );
  const [sortBy, setSortBy] = useState<'popularity' | 'price_asc' | 'price_desc' | 'availability' | 'newest'>('popularity');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  // Quick View modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Mobile filters drawer
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync state if initialParam changes
  useEffect(() => {
    const q = params.get('q') || '';
    const cat = params.get('category') || '';
    const sub = params.get('sub') || '';
    const br = params.get('brand') || '';
    const veh = params.get('vehicle') || (activeVehicle ? activeVehicle.id : '');

    setSearchQuery(q);
    setSelectedCategory(cat);
    setSelectedSubcategory(sub);
    setSelectedBrand(br);
    setVehicleIdFilter(veh);
  }, [params, activeVehicle]);

  // Execute filtering
  const filteredProducts = store.searchProducts({
    query: searchQuery,
    categoryId: selectedCategory || undefined,
    subcategorySlug: selectedSubcategory || undefined,
    brandId: selectedBrand || undefined,
    vehicleId: vehicleIdFilter || undefined,
    minPrice,
    maxPrice,
    sortBy,
  });

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBrand('');
    setVehicleIdFilter('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    onNavigate('catalog');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumbs & Active vehicle pill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
            Strona główna
          </button>
          <span>/</span>
          <button onClick={handleResetFilters} className="hover:text-white transition-colors">
            Katalog części
          </button>
          {activeCategoryObj && (
            <>
              <span>/</span>
              <span className="text-slate-200 font-semibold">{activeCategoryObj.name}</span>
            </>
          )}
          {searchQuery && (
            <>
              <span>/</span>
              <span className="text-rose-400">Wyniki dla: "{searchQuery}"</span>
            </>
          )}
        </div>

        {/* Active vehicle quick selector */}
        <div className="flex items-center gap-2">
          {activeVehicle ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs">
              <Car className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-slate-300">
                Pojazd: <strong className="text-white">{activeVehicle.brand} {activeVehicle.model}</strong>
              </span>
              <button
                onClick={onOpenVehicleModal}
                className="ml-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline"
              >
                Zmień
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenVehicleModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <Car className="w-3.5 h-3.5 text-rose-400" />
              <span>Wybierz auto do weryfikacji</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP SIDEBAR FILTERS */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                Filtry katalogu
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Wyczyść
              </button>
            </div>

            {/* Vehicle compatibility toggle */}
            {activeVehicle && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Dopasowanie do auta
                </p>
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vehicleIdFilter === activeVehicle.id}
                    onChange={(e) => setVehicleIdFilter(e.target.checked ? activeVehicle.id : '')}
                    className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Tylko pasujące do mojego {activeVehicle.model}</span>
                </label>
              </div>
            )}

            {/* Category Tree */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Kategorie produktów
              </label>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1 scrollbar-none text-xs">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-rose-950/80 text-rose-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Wszystkie kategorie
                </button>
                {categories.map((c) => {
                  const isSelected = selectedCategory === c.id;
                  return (
                    <div key={c.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(c.id);
                          setSelectedSubcategory('');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-rose-950/80 text-rose-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({c.productCount})</span>
                      </button>

                      {/* Subcategories list if selected */}
                      {isSelected && c.subcategories.length > 0 && (
                        <div className="pl-4 py-1 space-y-1 border-l border-slate-800 ml-2">
                          {c.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedSubcategory(sub.slug)}
                              className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors ${
                                selectedSubcategory === sub.slug
                                  ? 'text-rose-400 font-bold'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brands Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Producent części
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-none text-xs">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                    !selectedBrand ? 'bg-rose-950/80 text-rose-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Wszyscy producenci
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedBrand === b.id
                        ? 'bg-rose-950/80 text-rose-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({b.productCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Cena brutto (zł)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <input
                    type="number"
                    placeholder="Od"
                    value={minPrice ?? ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Do"
                    value={maxPrice ?? ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS RESULTS MAIN AREA */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="text-xs text-slate-300">
              Znaleziono <strong className="text-white font-mono">{filteredProducts.length}</strong> produktów
              {searchQuery && (
                <span>
                  {' '}dla frazy: <span className="text-rose-400 font-semibold">"{searchQuery}"</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-200"
              >
                <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                <span>Filtry</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 hidden md:inline">Sortuj:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="popularity">Popularność</option>
                  <option value="price_asc">Cena: od najniższej</option>
                  <option value="price_desc">Cena: od najwyższej</option>
                  <option value="availability">Dostępność magazynowa</option>
                  <option value="newest">Nowości w ofercie</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter badges */}
          {(selectedCategory || selectedBrand || vehicleIdFilter || minPrice || maxPrice || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500">Aktywne filtry:</span>
              {selectedCategory && (
                <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg flex items-center gap-1.5">
                  Kategoria: {activeCategoryObj?.name}
                  <button onClick={() => setSelectedCategory('')}>
                    <X className="w-3 h-3 hover:text-rose-400" />
                  </button>
                </span>
              )}
              {selectedBrand && (
                <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg flex items-center gap-1.5">
                  Marka: {brands.find((b) => b.id === selectedBrand)?.name}
                  <button onClick={() => setSelectedBrand('')}>
                    <X className="w-3 h-3 hover:text-rose-400" />
                  </button>
                </span>
              )}
              {vehicleIdFilter && (
                <span className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800/40 rounded-lg flex items-center gap-1.5">
                  Pojazd aktywny
                  <button onClick={() => setVehicleIdFilter('')}>
                    <X className="w-3 h-3 hover:text-rose-200" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-400 hover:underline font-semibold ml-2"
              >
                Wyczyść wszystkie
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Brak produktów spełniających podane kryteria</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Spróbuj zmienić zapytanie, wyczyścić filtry pojazdu lub skorzystać z głównej wyszukiwarki wpisując numer OE części.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Pokaż wszystkie części
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  activeVehicle={activeVehicle}
                  onNavigate={onNavigate}
                  onOpenVehicleModal={onOpenVehicleModal}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        activeVehicle={activeVehicle}
        onNavigate={onNavigate}
      />

      {/* MOBILE FILTERS DRAWER */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-sm bg-slate-900 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-bold text-white text-base">Filtry produktów</span>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Kategoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">Wszystkie kategorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Producent</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">Wszyscy producenci</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold text-xs"
              >
                Zastosuj filtry ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
