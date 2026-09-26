import React, { useState } from 'react';
import {
  Car,
  Search,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Disc,
  Layers,
  Droplet,
  Cpu,
  Activity,
  Sliders,
  Sun,
  Package,
} from 'lucide-react';
import { store } from '../services/store';
import { ProductCard } from '../components/ProductCard';

interface HomeViewProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenVehicleModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenVehicleModal }) => {
  const activeVehicle = store.getActiveVehicle();
  const vehicles = store.getVehicles();
  const products = store.getProducts();
  const categories = store.getCategories();
  const brands = store.getBrands();

  // Search Hero Tab state
  const [heroTab, setHeroTab] = useState<'CAR' | 'TIRE'>('CAR');

  // Car Tab mini-form
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [vinInput, setVinInput] = useState('');

  // Tire Tab mini-form
  const [tireWidth, setTireWidth] = useState('205');
  const [tireProfile, setTireProfile] = useState('55');
  const [tireDiameter, setTireDiameter] = useState('16');
  const [tireSeason, setTireSeason] = useState('ALL');

  const availableBrands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();
  const availableModels = selectedBrand
    ? Array.from(new Set(vehicles.filter((v) => v.brand === selectedBrand).map((v) => v.model))).sort()
    : [];

  const handleCarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBrand && selectedModel) {
      const match = vehicles.find((v) => v.brand === selectedBrand && v.model === selectedModel);
      if (match) {
        store.setActiveVehicle(match);
        onNavigate('catalog', `vehicle=${match.id}`);
        return;
      }
    }
    if (vinInput.trim()) {
      const cleanVin = vinInput.trim().toUpperCase();
      const match = vehicles.find((v) => v.vinPrefix && cleanVin.startsWith(v.vinPrefix));
      if (match) {
        store.setActiveVehicle(match);
        onNavigate('catalog', `vehicle=${match.id}`);
        return;
      }
    }
    onOpenVehicleModal();
  };

  const handleTireSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(
      'tires',
      `w=${tireWidth}&p=${tireProfile}&d=${tireDiameter}&s=${tireSeason}`
    );
  };

  // Filtered bestsellers and promotional items
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);
  const promoItems = products.filter((p) => p.isPromo).slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/motocar_hero_warehouse_1790410905286.jpg"
            alt="Centrum dystrybucji MOTOCAR24"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-25 filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Headline & Pitch */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-950/80 border border-rose-800/60 rounded-full text-xs text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Oficjalny dystrybutor · Magazyn centralny 100 000+ części</span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight leading-[1.08] text-balance">
                Części samochodowe z gwarancją dopasowania.
              </h1>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
                Wyszukaj części bezpośrednio po marce, modelu, numerze silnika lub kodzie VIN.
                Zapewniamy natychmiastową wysyłkę z magazynu centralnego oraz integrację z systemem Base.com.
              </p>

              {/* Quick stats inline */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <p className="text-2xl font-black text-white font-mono tabular-nums">24h</p>
                  <p className="text-xs text-slate-400">Czas wysyłki</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white font-mono tabular-nums">100k+</p>
                  <p className="text-xs text-slate-400">Produktów w magazynie</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-rose-500 font-mono tabular-nums">100%</p>
                  <p className="text-xs text-slate-400">Gwarancja dopasowania</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Search Widget (Dual Tab) */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 backdrop-blur-md">
                {/* Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
                  <button
                    onClick={() => setHeroTab('CAR')}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      heroTab === 'CAR'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Dobierz część do auta</span>
                  </button>
                  <button
                    onClick={() => setHeroTab('TIRE')}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      heroTab === 'TIRE'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Disc className="w-4 h-4" />
                    <span>Wyszukiwarka opon</span>
                  </button>
                </div>

                {/* Tab 1: Car parts selector */}
                {heroTab === 'CAR' && (
                  <form onSubmit={handleCarSearch} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          1. Marka pojazdu
                        </label>
                        <select
                          value={selectedBrand}
                          onChange={(e) => {
                            setSelectedBrand(e.target.value);
                            setSelectedModel('');
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                        >
                          <option value="">Wybierz markę...</option>
                          {availableBrands.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          2. Model
                        </label>
                        <select
                          value={selectedModel}
                          disabled={!selectedBrand}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 disabled:opacity-40 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                        >
                          <option value="">Wybierz model...</option>
                          {availableModels.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-slate-800"></div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">lub podaj numer VIN</span>
                        <div className="flex-1 h-px bg-slate-800"></div>
                      </div>
                      <input
                        type="text"
                        value={vinInput}
                        onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                        maxLength={17}
                        placeholder="Wpisz 17-znakowy numer VIN (np. WBA3D...)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 uppercase font-mono tracking-wider focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                      >
                        <Search className="w-4 h-4" />
                        <span>Szukaj pasujących części</span>
                      </button>
                      <button
                        type="button"
                        onClick={onOpenVehicleModal}
                        className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                        title="Rozwiń pełny konfigurator ze specyfikacją silnika"
                      >
                        Więcej opcji...
                      </button>
                    </div>
                  </form>
                )}

                {/* Tab 2: Tires selector */}
                {heroTab === 'TIRE' && (
                  <form onSubmit={handleTireSearch} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Szerokość
                        </label>
                        <select
                          value={tireWidth}
                          onChange={(e) => setTireWidth(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                        >
                          <option value="195">195</option>
                          <option value="205">205</option>
                          <option value="215">215</option>
                          <option value="225">225</option>
                          <option value="235">235</option>
                          <option value="245">245</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Profil
                        </label>
                        <select
                          value={tireProfile}
                          onChange={(e) => setTireProfile(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                        >
                          <option value="40">40</option>
                          <option value="45">45</option>
                          <option value="50">50</option>
                          <option value="55">55</option>
                          <option value="60">60</option>
                          <option value="65">65</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Średnica
                        </label>
                        <select
                          value={tireDiameter}
                          onChange={(e) => setTireDiameter(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                        >
                          <option value="15">15"</option>
                          <option value="16">16"</option>
                          <option value="17">17"</option>
                          <option value="18">18"</option>
                          <option value="19">19"</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Sezon
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'ALL', label: 'Wszystkie' },
                          { id: 'Letnie', label: 'Letnie' },
                          { id: 'Zimowe', label: 'Zimowe' },
                          { id: 'Całoroczne', label: 'Całoroczne' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setTireSeason(s.id)}
                            className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-colors ${
                              tireSeason === s.id
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                    >
                      <Search className="w-4 h-4" />
                      <span>Znajdź opony {tireWidth}/{tireProfile} R{tireDiameter}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE CAR NOTIFICATION BANNER IF SELECTED */}
      {activeVehicle && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-slate-900 border border-rose-600/40 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                    Twój aktywny pojazd
                  </span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Gwarancja dopasowania aktywna
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white mt-1">
                  {activeVehicle.brand} {activeVehicle.model} ({activeVehicle.generation})
                </h3>
                <p className="text-xs text-slate-400">
                  Silnik: {activeVehicle.engine} · Pojemność: {activeVehicle.displacement} · Moc: {activeVehicle.powerHp} KM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('catalog', `vehicle=${activeVehicle.id}`)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
              >
                <span>Przeglądaj części do tego auta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenVehicleModal}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Zmień auto
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white font-['Cabinet_Grotesk'] tracking-tight">
              Główne kategorie części
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Wybierz interesujący Cię układ pojazdu</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <span>Zobacz wszystkie ({categories.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.slice(0, 12).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog', `category=${cat.id}`)}
              className="group bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950 flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-rose-950/80 group-hover:text-rose-400 border border-slate-700/60 flex items-center justify-center text-slate-300 transition-colors mb-3">
                {cat.id === 'cat-opony' && <Disc className="w-5 h-5" />}
                {cat.id === 'cat-hamulce' && <ShieldCheck className="w-5 h-5" />}
                {cat.id === 'cat-filtry' && <Layers className="w-5 h-5" />}
                {cat.id === 'cat-oleje' && <Droplet className="w-5 h-5" />}
                {cat.id === 'cat-silnik' && <Cpu className="w-5 h-5" />}
                {cat.id === 'cat-zawieszenie' && <Activity className="w-5 h-5" />}
                {cat.id === 'cat-wycieraczki' && <Sliders className="w-5 h-5" />}
                {cat.id === 'cat-oswietlenie' && <Sun className="w-5 h-5" />}
                {cat.id !== 'cat-opony' &&
                  cat.id !== 'cat-hamulce' &&
                  cat.id !== 'cat-filtry' &&
                  cat.id !== 'cat-oleje' &&
                  cat.id !== 'cat-silnik' &&
                  cat.id !== 'cat-zawieszenie' &&
                  cat.id !== 'cat-wycieraczki' &&
                  cat.id !== 'cat-oswietlenie' && <Package className="w-5 h-5" />}
              </div>

              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-rose-400 transition-colors leading-tight">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  {cat.productCount} pozycji
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BESTSELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white font-['Cabinet_Grotesk'] tracking-tight">
              Najczęściej wybierane części
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Sprawdzone komponenty OEM i marek premium</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <span>Przeglądaj katalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              activeVehicle={activeVehicle}
              onNavigate={onNavigate}
              onOpenVehicleModal={onOpenVehicleModal}
            />
          ))}
        </div>
      </section>

      {/* TIRE PROMOTION BANNER */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl z-10">
            <span className="text-xs font-black uppercase tracking-wider text-rose-500">
              Sezonowa zmiana ogumienia
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-white font-['Cabinet_Grotesk'] tracking-tight leading-tight">
              Opony letnie, zimowe i całoroczne z darmową dostawą.
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Skorzystaj z dedykowanej wyszukiwarki opon. Dobierz odpowiedni indeks nośności,
              klasę przyczepności na mokrej nawierzchni oraz technologię Run-Flat od marek Michelin, Continental, Pirelli i Goodyear.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('tires')}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xl shadow-rose-600/25"
              >
                <Disc className="w-4 h-4" />
                <span>Otwórz konfigurator opon</span>
              </button>
            </div>
          </div>

          <div className="shrink-0 z-10">
            <img
              src="/src/assets/images/product_car_tire_1790410926925.jpg"
              alt="Opony premium MOTOCAR24"
              className="w-48 h-48 md:w-64 md:h-64 object-contain filter drop-shadow-2xl hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </section>

      {/* PROMO ITEMS SECTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white font-['Cabinet_Grotesk'] tracking-tight">
              Okazje i promocje tygodnia
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Ograniczone czasowo obniżki cen na wybrane indeksy</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <span>Wszystkie promocje</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promoItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              activeVehicle={activeVehicle}
              onNavigate={onNavigate}
              onOpenVehicleModal={onOpenVehicleModal}
            />
          ))}
        </div>
      </section>

      {/* TRUSTED BRANDS CAROUSEL/GRID */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
            Oficjalna dystrybucja części wiodących marek
          </h3>
          <p className="text-xs text-slate-400">
            Współpracujemy wyłącznie z certyfikowanymi producentami OE i Tier 1
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {brands.slice(0, 12).map((brand) => (
            <div
              key={brand.id}
              onClick={() => onNavigate('catalog', `brand=${brand.id}`)}
              className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-slate-800/60"
            >
              <span className="font-black text-sm text-slate-200 tracking-wider font-['Cabinet_Grotesk']">
                {brand.logoText}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">{brand.tier}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
