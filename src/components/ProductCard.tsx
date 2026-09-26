import React, { useState } from 'react';
import { ShoppingCart, Heart, CheckCircle2, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';
import { Product, Vehicle } from '../types';
import { store } from '../services/store';

interface ProductCardProps {
  product: Product;
  activeVehicle?: Vehicle | null;
  onNavigate: (view: string, param?: string) => void;
  onOpenVehicleModal?: () => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  activeVehicle,
  onNavigate,
  onOpenVehicleModal,
  onQuickView,
}) => {
  const [isInWishlist, setIsInWishlist] = useState(store.getWishlist().includes(product.id));
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Check compatibility with active vehicle if selected
  const isCompatible = activeVehicle
    ? product.compatibility.some((c) => c.vehicleId === activeVehicle.id)
    : null;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = store.toggleWishlist(product.id);
    setIsInWishlist(updated);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div
      onClick={() => onNavigate('product', product.id)}
      className="group bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/80 cursor-pointer relative"
    >
      {/* Top Image area */}
      <div className="relative aspect-[4/3] bg-slate-950/80 overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // CSS SVG Fallback
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Promo tag */}
        {product.isPromo && (
          <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
            PROMOCJA
          </div>
        )}

        {/* Action Buttons Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2">
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="px-3 py-1.5 bg-slate-900/90 hover:bg-rose-600 text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-lg"
              title="Szybki podgląd"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Szybki podgląd</span>
            </button>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 transition-colors shadow"
          title={isInWishlist ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-400 group-hover:text-rose-400'
            }`}
          />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Metadata clean text with separators */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
            <span className="text-slate-300 font-semibold">{product.brandName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">{product.manufacturerCode}</span>
            {product.tireSpec && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400">{product.tireSpec.season}</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug group-hover:text-rose-400 transition-colors">
            {product.name}
          </h3>

          {/* Primary OE number & SKU */}
          <div className="mt-1.5 text-[11px] text-slate-500 font-mono flex items-center gap-2">
            <span>OE: {product.oeNumbers[0] || '-'}</span>
            <span>·</span>
            <span>SKU: {product.sku}</span>
          </div>
        </div>

        {/* Vehicle fitment status */}
        <div className="pt-2 border-t border-slate-800/80">
          {activeVehicle ? (
            isCompatible ? (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Pasuje do Twojego {activeVehicle.brand} {activeVehicle.model}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Część może nie pasować do wybranego auta</span>
              </div>
            )
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenVehicleModal) onOpenVehicleModal();
              }}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Sprawdź dopasowanie do auta</span>
            </button>
          )}
        </div>

        {/* Bottom Price & Add to Cart */}
        <div className="pt-2 border-t border-slate-800/80 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white font-mono tabular-nums tracking-tight">
                {product.priceGross.toFixed(2)} zł
              </span>
              {product.regularPriceGross && (
                <span className="text-xs text-slate-500 line-through font-mono tabular-nums">
                  {product.regularPriceGross.toFixed(2)} zł
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>{product.priceNet.toFixed(2)} zł netto</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">{product.deliveryTime}</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{addedAnimation ? 'Dodano!' : 'Kup'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
