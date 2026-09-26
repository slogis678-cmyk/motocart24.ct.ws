import React, { useState, useMemo } from 'react';
import {
  Disc,
  Filter,
  Search,
  CheckCircle2,
  Car,
  Fuel,
  CloudRain,
  Volume2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { store } from '../services/store';
import { ProductCard } from '../components/ProductCard';

interface TireFinderViewProps {
  initialParam?: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenVehicleModal: () => void;
}

export const TireFinderView: React.FC<TireFinderViewProps> = ({
  initialParam,
  onNavigate,
  onOpenVehicleModal,
}) => {
  const activeVehicle = store.getActiveVehicle();
  const vehicles = store.getVehicles();

  // Parse initial query params
  const params = useMemo(() => new URLSearchParams(initialParam || ''), [initialParam]);

  const [mode, setMode] = useState<'SIZE' | 'CAR'>('SIZE');

  // Size parameters
  const [width, setWidth] = useState<number>(Number(params.get('w')) || 205);
  const [profile, setProfile] = useState<number>(Number(params.get('p')) || 55);
  const [diameter, setDiameter] = useState<number>(Number(params.get('d')) || 16);
  const [season, setSeason] = useState<string>(params.get('s') || 'ALL');

  // Secondary filters
  const [onlyRunFlat, setOnlyRunFlat] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [wetGripFilter, setWetGripFilter] = useState('ALL'); // A, B, etc.
  const [fuelFilter, setFuelFilter] = useState('ALL'); // A, B, etc.

  // Car tab selection
  const [selectedBrandCar, setSelectedBrandCar] = useState('');
  const [selectedModelCar, setSelectedModelCar] = useState('');

  const allTires = store.getProducts().filter((p) => p.categoryId === 'cat-opony' && p.tireSpec);

  // Apply filters
  const filteredTires = allTires.filter((t) => {
    const spec = t.tireSpec!;
    if (mode === 'SIZE') {
      if (width && spec.width !== width) return false;
      if (profile && spec.profile !== profile) return false;
      if (diameter && spec.diameter !== diameter) return false;
    }
    if (season !== 'ALL' && spec.season !== season) return false;
    if (onlyRunFlat && !spec.isRunFlat) return false;
    if (selectedBrand !== 'ALL' && t.brandName.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (wetGripFilter !== 'ALL' && spec.wetGrip !== wetGripFilter) return false;
    if (fuelFilter !== 'ALL' && spec.rollingResistance !== fuelFilter) return false;
    return true;
  });

  const popularSizes = [
    { w: 205, p: 55, d: 16, label: '205/55 R16' },
    { w: 225, p: 45, d: 17, label: '225/45 R17' },
    { w: 225, p: 40, d: 18, label: '225/40 R18' },
    { w: 195, p: 65, d: 15, label: '195/65 R15' },
    { w: 235, p: 60, d: 18, label: '235/60 R18 (SUV)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Top Banner / Heading */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-800/60 rounded-full text-xs text-amber-300 font-semibold">
            <Disc className="w-3.5 h-3.5 text-amber-400" />
            <span>Konfigurator Ogumienia Samochodowego</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
            Znajdź odpowiednie opony do swojego auta
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Wyszukuj po dokładnym rozmiarze homologowanym przez producenta lub po marce i modelu pojazdu.
            Wszystkie opony posiadają oficjalne etykiety unijne (EU Tyre Label) potwierdzające drogę hamowania i hałas.
          </p>
        </div>
      </div>

      {/* Main Filter Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        {/* Toggle Mode: by Size vs by Car */}
        <div className="flex border-b border-slate-800 pb-4 justify-between items-center flex-wrap gap-4">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setMode('SIZE')}
              className={`py-2 px-4 rounded-lg transition-colors flex items-center gap-2 ${
                mode === 'SIZE' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Disc className="w-4 h-4" />
              <span>A. Wyszukaj po rozmiarze</span>
            </button>
            <button
              onClick={() => setMode('CAR')}
              className={`py-2 px-4 rounded-lg transition-colors flex items-center gap-2 ${
                mode === 'CAR' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>B. Dobierz do samochodu</span>
            </button>
          </div>

          {/* Quick Popular Size buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-bold uppercase mr-1">Popularne:</span>
            {popularSizes.map((ps) => (
              <button
                key={ps.label}
                onClick={() => {
                  setMode('SIZE');
                  setWidth(ps.w);
                  setProfile(ps.p);
                  setDiameter(ps.d);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors ${
                  width === ps.w && profile === ps.p && diameter === ps.d
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {ps.label}
              </button>
            ))}
          </div>
        </div>

        {/* Console Inputs: Size Mode */}
        {mode === 'SIZE' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Szerokość opony
              </label>
              <select
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value={195}>195 mm</option>
                <option value={205}>205 mm</option>
                <option value={215}>215 mm</option>
                <option value={225}>225 mm</option>
                <option value={235}>235 mm</option>
                <option value={245}>245 mm</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Profil (Wysokość %)
              </label>
              <select
                value={profile}
                onChange={(e) => setProfile(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value={40}>40</option>
                <option value={45}>45</option>
                <option value={50}>50</option>
                <option value={55}>55</option>
                <option value={60}>60</option>
                <option value={65}>65</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Średnica felgi
              </label>
              <select
                value={diameter}
                onChange={(e) => setDiameter(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value={15}>15 cali (R15)</option>
                <option value={16}>16 cali (R16)</option>
                <option value={17}>17 cali (R17)</option>
                <option value={18}>18 cali (R18)</option>
                <option value={19}>19 cali (R19)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Sezon
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
              >
                <option value="ALL">Wszystkie sezony</option>
                <option value="Letnie">Opony Letnie</option>
                <option value="Zimowe">Opony Zimowe (3PMSF)</option>
                <option value="Całoroczne">Opony Całoroczne</option>
              </select>
            </div>
          </div>
        )}

        {/* Console Inputs: Car Mode */}
        {mode === 'CAR' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Marka pojazdu
                </label>
                <select
                  value={selectedBrandCar}
                  onChange={(e) => setSelectedBrandCar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">Wybierz markę auta...</option>
                  {Array.from(new Set(vehicles.map((v) => v.brand))).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Model
                </label>
                <select
                  value={selectedModelCar}
                  disabled={!selectedBrandCar}
                  onChange={(e) => setSelectedModelCar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 disabled:opacity-40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">Wybierz model...</option>
                  {vehicles
                    .filter((v) => v.brand === selectedBrandCar)
                    .map((v) => (
                      <option key={v.id} value={v.model}>
                        {v.model} ({v.generation})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>
                Fabryczne homologowane rozmiary dla wybranego modelu: <strong>205/55 R16</strong>, <strong>225/45 R17</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode('SIZE');
                  setWidth(205);
                  setProfile(55);
                  setDiameter(16);
                }}
                className="text-xs text-rose-400 font-bold hover:underline"
              >
                Ustaw rozmiar 205/55 R16
              </button>
            </div>
          </div>
        )}

        {/* Secondary Detailed Filters (EU Label, Run-Flat, Brand) */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Brand */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Producent opon</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
            >
              <option value="ALL">Wszyscy producenci</option>
              <option value="Michelin">Michelin</option>
              <option value="Continental">Continental</option>
              <option value="Pirelli">Pirelli</option>
              <option value="Goodyear">Goodyear</option>
            </select>
          </div>

          {/* Wet Grip */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Przyczepność na mokrym (UE)</label>
            <select
              value={wetGripFilter}
              onChange={(e) => setWetGripFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
            >
              <option value="ALL">Wszystkie klasy</option>
              <option value="A">Klasa A (Najkrótsza droga hamowania)</option>
              <option value="B">Klasa B</option>
              <option value="C">Klasa C</option>
            </select>
          </div>

          {/* Fuel Class */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Oszczędność paliwa (UE)</label>
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
            >
              <option value="ALL">Wszystkie klasy</option>
              <option value="A">Klasa A</option>
              <option value="B">Klasa B</option>
              <option value="C">Klasa C</option>
            </select>
          </div>

          {/* Run Flat toggle */}
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={onlyRunFlat}
                onChange={(e) => setOnlyRunFlat(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500"
              />
              <span className="font-semibold">Tylko opony Run-Flat (RFT)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-['Cabinet_Grotesk']">
            Dostępne opony ({filteredTires.length})
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'SIZE'
              ? `Dla rozmiaru: ${width}/${profile} R${diameter} (${season === 'ALL' ? 'Wszystkie sezony' : season})`
              : 'Dopasowane do konfiguracji pojazdu'}
          </p>
        </div>
      </div>

      {/* Tire Cards Grid with EU Label indicators */}
      {filteredTires.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Disc className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="font-bold text-lg text-white">Brak opon w wybranym rozmiarze</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Spróbuj wybrać inny profil lub średnicę felgi (np. popularny rozmiar 205/55 R16 lub 225/45 R17).
          </p>
          <button
            onClick={() => {
              setWidth(205);
              setProfile(55);
              setDiameter(16);
              setSeason('ALL');
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
          >
            Pokaż opony 205/55 R16
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTires.map((product) => {
            const spec = product.tireSpec!;
            return (
              <div
                key={product.id}
                onClick={() => onNavigate('product', product.id)}
                className="bg-slate-900 border border-slate-800 hover:border-rose-500/60 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl space-y-4"
              >
                {/* Image & Season tag */}
                <div className="relative aspect-[4/3] bg-slate-950 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-amber-400 uppercase">
                    {spec.season}
                  </div>
                  {spec.isRunFlat && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold uppercase">
                      RUN FLAT
                    </div>
                  )}
                </div>

                {/* Name & Brand */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                    <span>{product.brandName}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-300">
                      {spec.width}/{spec.profile} R{spec.diameter}
                    </span>
                    <span>·</span>
                    <span className="text-slate-400">{spec.speedIndex}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                </div>

                {/* EU Tyre Label Micro-Card */}
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Fuel className="w-3 h-3 text-emerald-400" /> Paliwo
                    </span>
                    <span className="font-bold text-sm text-white font-mono">{spec.rollingResistance}</span>
                  </div>

                  <div className="space-y-0.5 border-x border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                      <CloudRain className="w-3 h-3 text-sky-400" /> Mokry
                    </span>
                    <span className="font-bold text-sm text-white font-mono">{spec.wetGrip}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Volume2 className="w-3 h-3 text-amber-400" /> Hałas
                    </span>
                    <span className="font-bold text-sm text-white font-mono">{spec.noiseDb} dB</span>
                  </div>
                </div>

                {/* Price & Buy Button */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-white font-mono tabular-nums">
                      {product.priceGross.toFixed(2)} zł
                    </span>
                    <p className="text-[10px] text-slate-400">za 1 sztukę brutto</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      store.addToCart(product, 4); // default 4 tires
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow"
                  >
                    Kup komplet (4 szt.)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
