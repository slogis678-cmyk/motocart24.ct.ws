import React, { useState } from 'react';
import {
  ShoppingCart,
  Heart,
  HelpCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Car,
  ChevronRight,
  PackageCheck,
  Check,
  Warehouse,
} from 'lucide-react';
import { store } from '../services/store';
import { Product } from '../types';
import { AskProductModal } from '../components/AskProductModal';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailViewProps {
  productId: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenVehicleModal: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onNavigate,
  onOpenVehicleModal,
}) => {
  const product = store.getProductById(productId);
  const activeVehicle = store.getActiveVehicle();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'SPECS' | 'OE' | 'VEHICLES' | 'REPLACEMENTS'>('SPECS');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(
    product ? store.getWishlist().includes(product.id) : false
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Produkt nie został odnaleziony</h2>
        <p className="text-slate-400 text-xs">Podany identyfikator produktu nie istnieje w katalogu.</p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
        >
          Wróć do katalogu części
        </button>
      </div>
    );
  }

  // Fitment verification with active car
  const isCompatible = activeVehicle
    ? product.compatibility.some((c) => c.vehicleId === activeVehicle.id)
    : null;

  const handleAddToCart = () => {
    store.addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleToggleWishlist = () => {
    const updated = store.toggleWishlist(product.id);
    setIsInWishlist(updated);
  };

  // Find replacement objects if any
  const replacementProducts = product.replacements
    .map((rId) => store.getProductById(rId))
    .filter(Boolean) as Product[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
          Strona główna
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate('catalog', `category=${product.categoryId}`)}
          className="hover:text-white transition-colors"
        >
          {product.categoryName}
        </button>
        <span>/</span>
        <span className="text-slate-200 font-semibold truncate max-w-sm">{product.name}</span>
      </div>

      {/* Main PDP Grid: Left Gallery & Right Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media & Core Visuals */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative flex items-center justify-center min-h-[420px] shadow-2xl">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[380px] w-auto object-contain transition-transform duration-300 hover:scale-105"
            />

            {product.isPromo && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded shadow">
                PROMOCJA
              </span>
            )}
          </div>

          {/* Vehicle Compatibility Banner right below image */}
          <div className="p-4 rounded-2xl border bg-slate-900 border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeVehicle
                    ? isCompatible
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <Car className="w-5 h-5" />
              </div>
              <div className="text-xs">
                {activeVehicle ? (
                  isCompatible ? (
                    <div>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Produkt pasuje do Twojego pojazdu
                      </span>
                      <p className="text-slate-300 font-semibold mt-0.5">
                        {activeVehicle.brand} {activeVehicle.model} ({activeVehicle.engine})
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Może nie pasować do wybranego auta
                      </span>
                      <p className="text-slate-400 mt-0.5">
                        Wybrane auto: {activeVehicle.brand} {activeVehicle.model}. Sprawdź specyfikację poniżej.
                      </p>
                    </div>
                  )
                ) : (
                  <div>
                    <span className="font-bold text-slate-200">
                      Sprawdź czy część pasuje do Twojego auta
                    </span>
                    <p className="text-slate-400 mt-0.5">
                      Podaj markę, model lub numer VIN, aby mieć 100% pewności dopasowania.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onOpenVehicleModal}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              {activeVehicle ? 'Zmień auto' : 'Wybierz pojazd'}
            </button>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
            {/* Header Brand & Code */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1.5">
                <span className="text-slate-200 uppercase tracking-wider font-bold">
                  {product.brandName}
                </span>
                <span>·</span>
                <span className="font-mono text-slate-300">{product.manufacturerCode}</span>
                <span>·</span>
                <span className="font-mono text-slate-400">SKU: {product.sku}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white font-['Cabinet_Grotesk'] leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono tabular-nums tracking-tight">
                  {product.priceGross.toFixed(2)} zł
                </span>
                <span className="text-xs text-slate-400">brutto (z 23% VAT)</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Cena netto: <strong className="text-slate-200">{product.priceNet.toFixed(2)} zł</strong>
              </p>
            </div>

            {/* Stock & Delivery details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-500" /> Dostępność:
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {product.status === 'DOSTĘPNY'
                    ? `W magazynie (${product.stock} szt.)`
                    : product.status}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-rose-500" /> Czas wysyłki:
                </span>
                <span className="font-semibold text-slate-200">{product.deliveryTime}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Warehouse className="w-4 h-4 text-sky-400" /> Magazyn:
                </span>
                <span className="font-mono text-slate-300">{product.warehouseLocation}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Kod EAN:</span>
                <span className="font-mono text-slate-300">{product.ean}</span>
              </div>
            </div>

            {/* Quantity & Buy CTA */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2.5 text-xs font-mono font-bold text-white tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-rose-600/25 ${
                    addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {addedAnimation
                      ? 'Dodano do koszyka!'
                      : `Dodaj do koszyka (${(product.priceGross * quantity).toFixed(2)} zł)`}
                  </span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleToggleWishlist}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isInWishlist
                      ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                      : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isInWishlist ? 'Na liście życzeń' : 'Dodaj do ulubionych'}</span>
                </button>

                <button
                  onClick={() => setIsAskModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Zapytaj o produkt</span>
                </button>
              </div>
            </div>

            {/* PDF Documentation Link if available */}
            {product.hasPdfDoc && (
              <div className="pt-2 border-t border-slate-800">
                <a
                  href="#pdf-download"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Pobieranie oficjalnej dokumentacji technicznej: ${product.pdfDocTitle}`);
                  }}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-rose-500" />
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
                        Dokumentacja techniczna PDF
                      </p>
                      <p className="text-[11px] text-slate-500">{product.pdfDocTitle}</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section: Parametry techniczne, Numery OE, Kompatybilne pojazdy */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex border-b border-slate-800 gap-4 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('SPECS')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'SPECS'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Parametry techniczne ({product.attributes.length})
          </button>
          <button
            onClick={() => setActiveTab('OE')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'OE'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Numery OE i zamienniki ({product.oeNumbers.length + product.crossReferences.length})
          </button>
          <button
            onClick={() => setActiveTab('VEHICLES')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'VEHICLES'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Kompatybilne pojazdy ({product.compatibility.length})
          </button>
          {replacementProducts.length > 0 && (
            <button
              onClick={() => setActiveTab('REPLACEMENTS')}
              className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'REPLACEMENTS'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Polecane zamienniki ({replacementProducts.length})
            </button>
          )}
        </div>

        {/* Tab 1: SPECS */}
        {activeTab === 'SPECS' && (
          <div className="space-y-6">
            <div className="max-w-2xl text-xs text-slate-300 leading-relaxed space-y-2">
              <h4 className="font-bold text-white text-sm">Opis produktu</h4>
              <p>{product.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Szczegółowa specyfikacja</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                {product.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between py-2 border-b border-slate-800/80"
                  >
                    <span className="text-slate-400">{attr.name}</span>
                    <span className="font-semibold text-slate-200">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: OE NUMBERS */}
        {activeTab === 'OE' && (
          <div className="space-y-6 text-xs">
            <div>
              <h4 className="font-bold text-white text-sm mb-2">
                Oryginalne numery katalogowe (OE)
              </h4>
              <p className="text-slate-400 mb-3">
                Część jest fabrycznym odpowiednikiem poniższych numerów części zamiennych producentów samochodów:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.oeNumbers.map((oe, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 font-semibold"
                  >
                    {oe}
                  </span>
                ))}
              </div>
            </div>

            {product.crossReferences.length > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2">Zamienniki innych producentów</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.crossReferences.map((cross, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-300">{cross.brand}</span>
                      <span className="font-mono text-slate-400">{cross.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: VEHICLES */}
        {activeTab === 'VEHICLES' && (
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-white text-sm mb-1">
              Lista potwierdzonych modeli samochodów
            </h4>
            <p className="text-slate-400 mb-4">
              Zastosowanie zweryfikowane katalogowo na podstawie bazy technicznej TecDoc i specyfikacji OEM:
            </p>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
              {product.compatibility.map((c, i) => (
                <div key={i} className="p-4 bg-slate-950/60 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-slate-100">
                      {c.brand} {c.model} ({c.generation})
                    </p>
                    <p className="text-slate-400">
                      Lata: <span className="font-mono text-slate-300">{c.yearRange}</span> · Silnik:{' '}
                      <span className="text-rose-400 font-semibold">{c.engine}</span>
                    </p>
                    {c.notes && <p className="text-[11px] text-slate-500 italic">Uwagi: {c.notes}</p>}
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded-lg text-[10px] font-bold uppercase shrink-0">
                    Zweryfikowano
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: REPLACEMENTS */}
        {activeTab === 'REPLACEMENTS' && replacementProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {replacementProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                activeVehicle={activeVehicle}
                onNavigate={onNavigate}
                onOpenVehicleModal={onOpenVehicleModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ask Modal */}
      <AskProductModal
        product={product}
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />
    </div>
  );
};
