import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Car,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Phone,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  History,
  Trash2,
  SlidersHorizontal,
  Disc,
  CircleDot,
  Layers,
  Droplet,
  Cpu,
  Activity,
  Compass,
  Zap,
  Wind,
  Flame,
  Sliders,
  Package,
  Wrench,
  Server,
  Radio,
  Sun,
} from 'lucide-react';
import { store } from '../services/store';
import { catalogService } from '../services/catalogService';
import { CatalogStructureConfig, Category, MegaMenuQuickLink, Product, Vehicle } from '../types';

interface NavbarProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenVehicleModal: () => void;
  onOpenAuthModal: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenVehicleModal,
  onOpenAuthModal,
  currentView,
}) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(store.getActiveVehicle());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(store.getRecentSearches());

  // Dynamic externalized catalog structure state from backend/configuration service
  const [catalogStructure, setCatalogStructure] = useState<CatalogStructureConfig>(() =>
    catalogService.getCatalogStructure()
  );
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  const categories = catalogStructure.categories;
  const brands = catalogStructure.brands;
  const quickLinks = catalogStructure.quickLinks;

  // Active category in outward flyout menu
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string>(() => {
    const cats = catalogService.getCategories();
    return cats.length > 0 ? cats[0].id : 'cat-hamulce';
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const megaMenuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const cart = store.getCart();
      setCartCount(cart.items.reduce((acc, i) => acc + i.quantity, 0));
      setWishlistCount(store.getWishlist().length);
      setCurrentUser(store.getCurrentUser());
      setActiveVehicle(store.getActiveVehicle());
      setRecentSearches(store.getRecentSearches());
    };
    update();
    const unsubStore = store.subscribe(update);

    // Subscribe to dynamic catalog configuration updates
    const unsubCatalog = catalogService.subscribe(() => {
      setCatalogStructure({ ...catalogService.getCatalogStructure() });
    });

    // Fetch latest catalog structure from backend REST API asynchronously
    setIsCatalogLoading(true);
    catalogService
      .fetchCatalogStructure()
      .then((data) => {
        setCatalogStructure(data);
        if (data.categories.length > 0 && !data.categories.some((c) => c.id === hoveredCategoryId)) {
          setHoveredCategoryId(data.categories[0].id);
        }
      })
      .catch((err) => {
        console.warn('Catalog structure fetch fallback active:', err);
      })
      .finally(() => {
        setIsCatalogLoading(false);
      });

    return () => {
      unsubStore();
      unsubCatalog();
    };
  }, []);

  // Handle ESC key to close mega menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside click for search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search suggestions
  const searchResults: Product[] = searchQuery.trim().length >= 2
    ? store.searchProducts({ query: searchQuery }).slice(0, 5)
    : [];

  const matchedCategories = searchQuery.trim().length >= 2
    ? categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const matchedBrands = searchQuery.trim().length >= 2
    ? brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      store.recordSearchQuery(searchQuery.trim());
      setSearchFocused(false);
      onNavigate('catalog', `q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectRecentSearch = (term: string) => {
    setSearchQuery(term);
    setSearchFocused(false);
    onNavigate('catalog', `q=${encodeURIComponent(term)}`);
  };

  // Helper to render category icon dynamically
  const getCategoryIcon = (keyOrId?: string, iconName?: string) => {
    const identifier = (iconName || keyOrId || '').toLowerCase();
    if (identifier.includes('opon') || identifier.includes('disc')) {
      return <Disc className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (identifier.includes('felg') || identifier.includes('circle')) {
      return <CircleDot className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (identifier.includes('hamulc') || identifier.includes('shield')) {
      return <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />;
    }
    if (identifier.includes('filtr') || identifier.includes('layer')) {
      return <Layers className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (identifier.includes('olej') || identifier.includes('droplet')) {
      return <Droplet className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    if (identifier.includes('silnik') || identifier.includes('cpu')) {
      return <Cpu className="w-4 h-4 text-red-400 shrink-0" />;
    }
    if (identifier.includes('zawiesz') || identifier.includes('activity')) {
      return <Activity className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
    if (identifier.includes('kierown') || identifier.includes('compass')) {
      return <Compass className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
    if (identifier.includes('elektr') || identifier.includes('zap') || identifier.includes('akumulat')) {
      return <Zap className="w-4 h-4 text-yellow-400 shrink-0" />;
    }
    if (identifier.includes('klima') || identifier.includes('wind')) {
      return <Wind className="w-4 h-4 text-blue-300 shrink-0" />;
    }
    if (identifier.includes('wydech') || identifier.includes('flame')) {
      return <Flame className="w-4 h-4 text-orange-500 shrink-0" />;
    }
    if (identifier.includes('karos') || identifier.includes('nadwoz')) {
      return <Truck className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    if (identifier.includes('wycier') || identifier.includes('slider')) {
      return <Sliders className="w-4 h-4 text-teal-400 shrink-0" />;
    }
    if (identifier.includes('chem') || identifier.includes('sparkle')) {
      return <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />;
    }
    if (identifier.includes('narzed') || identifier.includes('wrench')) {
      return <Wrench className="w-4 h-4 text-lime-400 shrink-0" />;
    }
    if (identifier.includes('warsztat') || identifier.includes('server')) {
      return <Server className="w-4 h-4 text-emerald-300 shrink-0" />;
    }
    if (identifier.includes('radio') || identifier.includes('elektron')) {
      return <Radio className="w-4 h-4 text-cyan-300 shrink-0" />;
    }
    if (identifier.includes('oswietl') || identifier.includes('sun')) {
      return <Sun className="w-4 h-4 text-amber-300 shrink-0" />;
    }
    if (identifier.includes('dostawcz') || identifier.includes('truck')) {
      return <Truck className="w-4 h-4 text-amber-600 shrink-0" />;
    }
    return <Package className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const activeCategory = categories.find((c) => c.id === hoveredCategoryId) || categories[0];
  const featuredBrandsForActiveCategory = activeCategory
    ? catalogService.getBrandsForCategory(activeCategory.id)
    : brands.slice(0, 8);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-xl">
      {/* Top utility trust bar */}
      <div className="hidden lg:block bg-slate-950/80 border-b border-slate-800/60 py-1.5 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Truck className="w-3.5 h-3.5 text-rose-500" />
              Darmowa dostawa od 250 zł · Wysyłka w 24h
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Oryginalne części z gwarancją dopasowania
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
              30 dni na bezpłatny zwrot
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href="tel:+48221002424" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3 h-3 text-rose-500" />
              Infolinia techniczna: <strong className="text-slate-200">+48 22 100 24 24</strong>
            </a>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Panel Administracyjny
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer flex items-center gap-2 group shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-lg tracking-tighter">M</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="font-black text-xl md:text-2xl tracking-tight text-white font-['Cabinet_Grotesk']">
                  MOTO<span className="text-rose-500">CAR</span>
                </span>
                <span className="text-rose-500 font-extrabold text-xl md:text-2xl ml-0.5">24</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                CZĘŚCI SAMOCHODOWE
              </span>
            </div>
          </div>

          {/* Center search bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Znajdź część, numer OE, EAN, SKU lub nazwę produktu..."
                className="w-full bg-slate-950/90 text-slate-100 placeholder-slate-500 border border-slate-700/80 rounded-xl pl-11 pr-24 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                Szukaj
              </button>
            </form>

            {/* Search dropdown suggestions */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 divide-y divide-slate-800/80 backdrop-blur-md">
                {/* When empty query -> Show recent searches */}
                {searchQuery.trim().length < 2 && recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        Ostatnio wyszukiwane
                      </span>
                      <button
                        onClick={() => store.clearRecentSearches()}
                        className="text-slate-500 hover:text-rose-400 text-[11px] flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Wyczyść
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectRecentSearch(term)}
                          className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700/80 text-slate-300 text-xs rounded-lg transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autocomplete matched products */}
                {searchQuery.trim().length >= 2 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Pasujące produkty ({searchResults.length})
                    </p>
                    {searchResults.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">Brak bezpośrednich wyników dla zapytania.</p>
                    ) : (
                      <div className="space-y-2">
                        {searchResults.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSearchFocused(false);
                              onNavigate('product', p.id);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-slate-800/80 rounded-lg cursor-pointer transition-colors"
                          >
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded bg-slate-800 shrink-0 border border-slate-700"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-200 truncate">{p.name}</p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>{p.brandName}</span>
                                <span>·</span>
                                <span className="font-mono text-slate-300">{p.manufacturerCode}</span>
                                <span>·</span>
                                <span className="text-slate-400">OE: {p.oeNumbers[0]}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-rose-400 tabular-nums">
                                {p.priceGross.toFixed(2)} zł
                              </span>
                              <p className="text-[10px] text-emerald-400 font-medium">Na stanie ({p.stock})</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Matched categories & brands */}
                {searchQuery.trim().length >= 2 && (matchedCategories.length > 0 || matchedBrands.length > 0) && (
                  <div className="pt-3 mt-2 flex flex-col md:flex-row gap-4">
                    {matchedCategories.length > 0 && (
                      <div className="flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Kategorie</p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedCategories.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSearchFocused(false);
                                onNavigate('catalog', `category=${c.id}`);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-xs rounded-lg text-slate-300 transition-colors"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {matchedBrands.length > 0 && (
                      <div className="flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Producenci</p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedBrands.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => {
                                setSearchFocused(false);
                                onNavigate('catalog', `brand=${b.id}`);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-xs rounded-lg text-slate-300 transition-colors"
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active vehicle badge & selector */}
          <div className="hidden xl:flex items-center">
            <button
              onClick={onOpenVehicleModal}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-xs max-w-[170px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mój samochód</span>
                <span className="font-semibold text-slate-200 truncate group-hover:text-rose-400 transition-colors">
                  {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : 'Wybierz pojazd'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform" />
            </button>
          </div>

          {/* User actions: account, wishlist, cart */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* User Account */}
            <div className="relative">
              <button
                onClick={() => {
                  if (currentUser) {
                    setIsUserDropdownOpen(!isUserDropdownOpen);
                  } else {
                    onOpenAuthModal();
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs font-semibold"
              >
                <UserIcon className="w-5 h-5 text-slate-400" />
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Konto'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
              </button>

              {/* User Dropdown */}
              {isUserDropdownOpen && currentUser && (
                <div
                  onMouseLeave={() => setIsUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs"
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                      Rola: {currentUser.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onNavigate('panel-klienta');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200"
                    >
                      Panel Klienta (Moje konto)
                    </button>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onNavigate('panel-klienta', 'orders');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200"
                    >
                      Moje zamówienia
                    </button>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onNavigate('panel-klienta', 'garage');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200"
                    >
                      Mój garaż (Samochody)
                    </button>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-300 font-semibold"
                    >
                      Panel Administratora
                    </button>
                  </div>
                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        store.setCurrentUser(null);
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-rose-400 font-medium"
                    >
                      Wyloguj się
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Ulubione produkty"
            >
              <Heart className="w-5 h-5 text-slate-400 hover:text-rose-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-rose-600/25 transition-all group"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-rose-600 rounded-full text-[10px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">Koszyk</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj części, OE, EAN, SKU..."
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-700 rounded-xl pl-10 pr-20 py-2 text-xs focus:outline-none focus:border-rose-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-lg"
            >
              Szukaj
            </button>
          </form>
        </div>
      </div>

      {/* Categories Bar & Quick Links */}
      <div className="relative bg-slate-950 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 py-1.5 min-w-0">
            {/* Mega menu trigger button */}
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
                isMegaMenuOpen
                  ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-rose-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              }`}
            >
              <Menu className="w-4 h-4" />
              <span>Katalog części</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMegaMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Quick direct links - dynamically generated from externalized catalog configuration */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
              {quickLinks.map((link) => {
                const isLinkActive =
                  (link.type === 'view' && currentView === link.target) ||
                  (link.type === 'category' && currentView === 'catalog' && typeof window !== 'undefined' && window.location.search.includes(link.target));
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (link.type === 'view') {
                        onNavigate(link.target);
                      } else {
                        onNavigate('catalog', link.target);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      isLinkActive
                        ? 'text-rose-400 bg-rose-950/40 border border-rose-900/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {link.isHighlight && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/50 uppercase tracking-tighter">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Vehicle Match CTA Button */}
          <div className="hidden md:flex items-center gap-2 shrink-0 pl-2">
            <button
              onClick={onOpenVehicleModal}
              className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white border border-slate-700/80 hover:border-rose-500 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Car className="w-3.5 h-3.5 text-rose-500" />
              <span>Dopasuj część do pojazdu</span>
            </button>
          </div>
        </div>

        {/* OUTWARD EXPANDING MEGA MENU ("Rozwijany na zewnątrz") */}
        {isMegaMenuOpen && (
          <>
            {/* Backdrop Blur Scrim */}
            <div
              onClick={() => setIsMegaMenuOpen(false)}
              className="fixed inset-0 top-[110px] md:top-[124px] bg-slate-950/75 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            />

            {/* Outward Flyout Container */}
            <div
              ref={megaMenuContainerRef}
              className="absolute top-full left-0 right-0 z-50 px-4 pt-2 pb-6 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl shadow-slate-950/95 overflow-hidden flex flex-col md:flex-row max-h-[640px] ring-1 ring-white/10">
                {/* Left Column: Dynamic Categories list */}
                <div className="w-full md:w-72 bg-slate-950 border-r border-slate-800/80 overflow-y-auto max-h-[600px] p-2 space-y-0.5 shrink-0 scrollbar-thin">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Działy katalogowe ({categories.length})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Przesuń kursor →</span>
                  </div>

                  {categories.map((cat) => {
                    const isSelected = hoveredCategoryId === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onMouseEnter={() => setHoveredCategoryId(cat.id)}
                        onClick={() => setHoveredCategoryId(cat.id)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getCategoryIcon(cat.id, cat.iconName)}
                          <span className="truncate">{cat.name}</span>
                          {cat.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-tight shrink-0 font-bold ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-mono tabular-nums ${
                              isSelected ? 'text-rose-200' : 'text-slate-500'
                            }`}
                          >
                            {cat.productCount}
                          </span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              isSelected ? 'text-white translate-x-0.5' : 'text-slate-600'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Expanded Panel ("Rozwijany na zewnątrz") */}
                {activeCategory && (
                  <div className="flex-1 bg-slate-900 p-6 md:p-8 overflow-y-auto max-h-[600px] flex flex-col justify-between space-y-6">
                    <div className="space-y-6">
                      {/* Header of the expanded category */}
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/40 flex items-center justify-center">
                              {getCategoryIcon(activeCategory.id, activeCategory.iconName)}
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
                              {activeCategory.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-slate-300">
                              {activeCategory.productCount} produktów
                            </span>
                            {activeCategory.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/50 text-[10px] font-bold uppercase tracking-wider">
                                {activeCategory.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 max-w-xl">
                            {activeCategory.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              onNavigate('catalog', `category=${activeCategory.id}`);
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-rose-600/25"
                          >
                            <span>Wszystkie w dziale</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                            title="Zamknij menu"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Optional Category Banner */}
                      {activeCategory.banner && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-800 to-slate-900 border border-rose-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                          <div className="space-y-0.5">
                            {activeCategory.banner.badge && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                                {activeCategory.banner.badge}
                              </span>
                            )}
                            <h4 className="text-sm font-bold text-white">{activeCategory.banner.title}</h4>
                            {activeCategory.banner.subtitle && (
                              <p className="text-xs text-slate-300">{activeCategory.banner.subtitle}</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              onNavigate(activeCategory.banner!.targetView, activeCategory.banner!.targetParam);
                            }}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl whitespace-nowrap transition-colors shadow-sm self-start sm:self-center"
                          >
                            {activeCategory.banner.ctaText || 'Sprawdź'}
                          </button>
                        </div>
                      )}

                      {/* Subcategories grid */}
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Podkategorie i grupy części ({activeCategory.subcategories.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {activeCategory.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setIsMegaMenuOpen(false);
                                onNavigate('catalog', `category=${activeCategory.id}&sub=${sub.slug}`);
                              }}
                              className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/60 rounded-xl text-left transition-all flex items-center justify-between group"
                            >
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-rose-400 transition-colors">
                                {sub.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                                ({sub.count})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Top Brands in this section */}
                      <div className="pt-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Rekomendowani producenci OE / Aftermarket ({featuredBrandsForActiveCategory.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {featuredBrandsForActiveCategory.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => {
                                setIsMegaMenuOpen(false);
                                onNavigate('catalog', `category=${activeCategory.id}&brand=${b.id}`);
                              }}
                              className="px-3 py-1 bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:text-rose-300 text-slate-300 text-xs rounded-lg transition-colors font-mono"
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom vehicle verification banner */}
                    <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          {activeVehicle ? (
                            <span>
                              Aktywny filtr pojazdu:{' '}
                              <strong className="text-white font-semibold">
                                {activeVehicle.brand} {activeVehicle.model} ({activeVehicle.engine})
                              </strong>
                            </span>
                          ) : (
                            'Wskazówka: Wybierz auto w nagłówku, aby system automatycznie sprawdzał zgodność każdej części.'
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          onOpenVehicleModal();
                        }}
                        className="text-rose-400 font-bold hover:underline shrink-0"
                      >
                        {activeVehicle ? 'Zmień pojazd' : 'Wybierz pojazd do weryfikacji'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Car className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Wybrany pojazd</p>
                <p className="font-semibold text-slate-200">
                  {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : 'Brak pojazdu'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenVehicleModal();
              }}
              className="text-xs text-rose-400 font-semibold"
            >
              Zmień
            </button>
          </div>

          <div className="space-y-1 text-sm font-semibold">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Nawigacja</p>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('home');
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-200"
            >
              Strona Główna
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('catalog');
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-200"
            >
              Wszystkie Części (Katalog)
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('tires');
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-rose-400 font-bold"
            >
              Wyszukiwarka Opon
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('panel-klienta');
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-200"
            >
              Panel Klienta
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('admin');
              }}
              className="w-full text-left py-2 px-3 rounded-lg bg-slate-800/80 text-amber-300"
            >
              Panel Administratora & Base.com
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                Działy katalogowe ({categories.length})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('catalog', `category=${c.id}`);
                  }}
                  className="text-left p-2.5 bg-slate-800/60 rounded-xl hover:bg-slate-800 text-slate-300 flex items-center gap-2 group transition-colors"
                >
                  {getCategoryIcon(c.id, c.iconName)}
                  <span className="truncate group-hover:text-rose-400 font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
