import React, { useState } from 'react';
import { X, ShoppingCart, Heart, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Truck, RotateCcw } from 'lucide-react';
import { Product, Vehicle } from '../types';
import { store } from '../services/store';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  activeVehicle?: Vehicle | null;
  onNavigate: (view: string, param?: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  activeVehicle,
  onNavigate,
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(store.getWishlist().includes(product.id));
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isCompatible = activeVehicle
    ? product.compatibility.some((c) => c.vehicleId === activeVehicle.id)
    : null;

  const handleAddToCart = () => {
    store.addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1000);
  };

  const netPrice = (product.priceGross / 1.23).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image Gallery preview */}
        <div className="w-full md:w-1/2 bg-slate-950 p-8 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-800">
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-h-80 object-contain drop-shadow-2xl"
          />
          {product.isPromo && (
            <span className="absolute top-4 left-4 px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
              PROMOCJA
            </span>
          )}
        </div>

        {/* Right Details Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-slate-200">{product.brandName}</span>
              <span>·</span>
              <span className="font-mono">OE: {product.oeNumbers[0] || product.manufacturerCode}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
              {product.name}
            </h2>

            {/* Price Box */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-rose-500 font-mono tracking-tight">
                  {product.priceGross.toFixed(2)} zł
                </span>
                <span className="text-xs text-slate-400">brutto (23% VAT)</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Cena netto: {netPrice} zł · SKU: {product.sku}
              </div>
            </div>

            {/* Vehicle Fitment banner */}
            {activeVehicle && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  isCompatible
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                }`}
              >
                {isCompatible ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>
                  {isCompatible
                    ? `Produkt w 100% pasuje do Twojego pojazdu (${activeVehicle.brand} ${activeVehicle.model})`
                    : `Weryfikacja: Część może nie pasować do wybranego auta (${activeVehicle.brand} ${activeVehicle.model})`}
                </span>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Magazyn centralny: {product.status} ({product.stock} szt. w lokalizacji {product.warehouseLocation})</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-slate-300 hover:bg-slate-800 transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-mono font-bold text-white tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-slate-300 hover:bg-slate-800 transition-colors font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addedSuccess}
                className="flex-1 py-3 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dodano do koszyka!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Dodaj do koszyka</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('product', product.id);
                }}
                className="text-rose-400 hover:underline font-semibold"
              >
                Zobacz pełną kartę produktu i specyfikację OE →
              </button>
              <button
                onClick={() => {
                  store.toggleWishlist(product.id);
                  setIsInWishlist(!isInWishlist);
                }}
                className={`flex items-center gap-1.5 hover:text-rose-400 transition-colors ${
                  isInWishlist ? 'text-rose-500 font-semibold' : ''
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-rose-500' : ''}`} />
                <span>{isInWishlist ? 'W ulubionych' : 'Do ulubionych'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
