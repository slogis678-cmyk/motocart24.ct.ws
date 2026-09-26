import React, { useState, useEffect } from 'react';
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Tag,
  CreditCard,
  Building,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { store } from '../services/store';
import { Cart, PaymentMethod, ShippingMethod } from '../types';

interface CartViewProps {
  onNavigate: (view: string, param?: string) => void;
  onOrderCreated: (orderId: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({ onNavigate, onOrderCreated }) => {
  const [cart, setCart] = useState<Cart>(store.getCart());
  const currentUser = store.getCurrentUser();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Checkout form states
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('PACZKOMAT');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BLIK');
  const [blikCode, setBlikCode] = useState('');

  // Address inputs
  const [firstName, setFirstName] = useState(currentUser?.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(currentUser?.name.split(' ')[1] || 'Nowak');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+48 501 234 567');
  const [street, setStreet] = useState('ul. Marszałkowska 42/15');
  const [city, setCity] = useState('Warszawa');
  const [postalCode, setPostalCode] = useState('00-503');
  const [paczkomatCode, setPaczkomatCode] = useState('WAW04M - Puławska 10');

  // Invoice toggle
  const [needInvoice, setNeedInvoice] = useState(false);
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [nip, setNip] = useState(currentUser?.nip || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const update = () => setCart(store.getCart());
    return store.subscribe(update);
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    const res = store.applyCoupon(couponCode);
    setCouponMsg({ text: res.message, isError: !res.success });
  };

  const amountMissingForFreeShipping = Math.max(
    0,
    cart.freeShippingThreshold - (cart.subtotalGross - cart.discountAmount)
  );

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const shippingNames: Record<ShippingMethod, string> = {
      PACZKOMAT: `Paczkomaty InPost 24/7 (${paczkomatCode})`,
      COURIER_DPD: 'Kurier DPD Express (Dostawa 24h)',
      COURIER_INPOST: 'Kurier InPost pod drzwi',
      PICKUP: 'Odbiór osobisty w salonie MOTOCAR24 (Warszawa)',
    };

    const paymentNames: Record<PaymentMethod, string> = {
      BLIK: `Płatność BLIK (Kod: ${blikCode || 'Autoryzowany'})`,
      PAYU: 'Szybki przelew PayU',
      CARD: 'Karta płatnicza (Visa/Mastercard)',
      COD: 'Płatność przy odbiorze (Pobranie)',
      TRANSFER: 'Tradycyjny przelew bankowy',
    };

    const order = store.createOrder({
      userId: currentUser?.id,
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: {
        street,
        city,
        postalCode,
        paczkomatCode: shippingMethod === 'PACZKOMAT' ? paczkomatCode : undefined,
      },
      billingAddress: needInvoice
        ? {
            street,
            city,
            postalCode,
            companyName,
            nip,
          }
        : undefined,
      items: cart.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        manufacturerCode: item.product.manufacturerCode,
        brand: item.product.brandName,
        unitPriceGross: item.product.priceGross,
        quantity: item.quantity,
        totalGross: Number((item.product.priceGross * item.quantity).toFixed(2)),
        imageUrl: item.product.imageUrl,
      })),
      shippingMethod,
      shippingMethodName: shippingNames[shippingMethod],
      paymentMethod,
      paymentMethodName: paymentNames[paymentMethod],
      shippingCost: cart.shippingCost,
      discountAmount: cart.discountAmount,
      totalNet: cart.subtotalNet,
      vatAmount: cart.vatAmount,
      totalGross: cart.totalGross,
      status: 'NOWE',
      paymentStatus: paymentMethod === 'COD' ? 'PŁATNOŚĆ_PRZY_ODBIORZE' : 'OPŁACONE',
      trackingCarrier: shippingMethod === 'PACZKOMAT' ? 'InPost' : 'DPD Polska',
      trackingNumber: `M24-${Math.floor(100000000 + Math.random() * 900000000)}`,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderCreated(order.id);
    }, 800);
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-['Cabinet_Grotesk']">
          Twój koszyk jest pusty
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Nie dodałeś jeszcze żadnych części. Przejdź do katalogu lub skorzystaj z wyszukiwarki, aby znaleźć produkty do swojego samochodu.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-600/30"
        >
          Przejdź do katalogu części
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
          Koszyk i realizacja zamówienia
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Sprawdź zawartość koszyka, wybierz metodę dostawy i bezpieczną płatność
        </p>
      </div>

      {/* Free shipping progress bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-rose-500" />
            {amountMissingForFreeShipping === 0 ? (
              <span className="text-emerald-400 font-bold">Gratulacje! Masz darmową dostawę</span>
            ) : (
              <span>
                Do darmowej dostawy brakuje jeszcze:{' '}
                <strong className="text-rose-400 font-mono">
                  {amountMissingForFreeShipping.toFixed(2)} zł
                </strong>
              </span>
            )}
          </span>
          <span className="text-slate-400 font-mono">Próg darmowej dostawy: 250,00 zł</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-rose-600 to-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{
              width: `${Math.min(
                100,
                ((cart.subtotalGross - cart.discountAmount) / cart.freeShippingThreshold) * 100
              )}%`,
            }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Items list & Delivery/Payment selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* Itemized List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              1. Wybrane produkty ({cart.items.length})
            </h3>

            <div className="divide-y divide-slate-800">
              {cart.items.map((item) => (
                <div key={item.product.id} className="py-4 flex items-center gap-4">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 object-contain rounded bg-slate-950 border border-slate-800 shrink-0 p-1"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-100 truncate">{item.product.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{item.product.brandName}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-300">{item.product.manufacturerCode}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">{item.product.deliveryTime}</span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => store.updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-300 hover:text-white text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-bold text-white tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => store.updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-300 hover:text-white text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0 min-w-[90px]">
                    <span className="font-black text-sm text-white font-mono tabular-nums">
                      {(item.product.priceGross * item.quantity).toFixed(2)} zł
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {item.product.priceGross.toFixed(2)} zł / szt.
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => store.removeFromCart(item.product.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Usuń z koszyka"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Methods */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              2. Metoda dostawy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div
                onClick={() => setShippingMethod('PACZKOMAT')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  shippingMethod === 'PACZKOMAT'
                    ? 'bg-rose-950/40 border-rose-600 shadow'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">InPost Paczkomaty 24/7</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {cart.shippingCost === 0 ? 'Gratis' : '15,00 zł'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Odbiór o dowolnej porze z wybranego automatu Paczkomat
                </p>
              </div>

              <div
                onClick={() => setShippingMethod('COURIER_DPD')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  shippingMethod === 'COURIER_DPD'
                    ? 'bg-rose-950/40 border-rose-600 shadow'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">Kurier DPD Express</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {cart.shippingCost === 0 ? 'Gratis' : '15,00 zł'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Bezpośrednia dostawa pod wskazany adres w 24 godziny
                </p>
              </div>

              <div
                onClick={() => setShippingMethod('PICKUP')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  shippingMethod === 'PICKUP'
                    ? 'bg-rose-950/40 border-rose-600 shadow'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">Odbiór osobisty</span>
                  <span className="font-mono text-emerald-400 font-bold">0,00 zł</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Salon i magazyn MOTOCAR24, Warszawa ul. Marszałkowska
                </p>
              </div>
            </div>

            {shippingMethod === 'PACZKOMAT' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wybrany automat Paczkomat:
                </label>
                <input
                  type="text"
                  required
                  value={paczkomatCode}
                  onChange={(e) => setPaczkomatCode(e.target.value)}
                  placeholder="np. WAW04M, ul. Puławska 10"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              3. Forma płatności
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { id: 'BLIK', label: 'BLIK', desc: 'Kod 6-cyfrowy' },
                { id: 'PAYU', label: 'PayU', desc: 'Szybki przelew' },
                { id: 'CARD', label: 'Karta', desc: 'Visa / MC' },
                { id: 'COD', label: 'Za pobraniem', desc: 'Płatność kurierowi' },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPaymentMethod(p.id as PaymentMethod)}
                  className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                    paymentMethod === p.id
                      ? 'bg-rose-950/40 border-rose-600 shadow'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-white text-xs">{p.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>

            {paymentMethod === 'BLIK' && (
              <div className="pt-2 max-w-xs">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wpisz 6-cyfrowy kod BLIK:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={blikCode}
                  onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123 456"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>

          {/* Delivery Address Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              4. Dane odbiorcy i adres wysyłki
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Imię</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nazwisko</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Adres e-mail (do powiadomień)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Telefon kontaktowy</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Ulica i numer domu / lokalu</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kod pocztowy</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Miejscowość</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Invoice Toggle */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={needInvoice}
                  onChange={(e) => setNeedInvoice(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold">Chcę otrzymać Fakturę VAT na firmę</span>
              </label>

              {needInvoice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Pełna nazwa firmy</label>
                    <input
                      type="text"
                      required={needInvoice}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Firma Sp. z o.o."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">NIP (do weryfikacji w MF)</label>
                    <input
                      type="text"
                      required={needInvoice}
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder="np. 5252819234"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 sticky top-24">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider pb-3 border-b border-slate-800">
              Podsumowanie koszyka
            </h3>

            {/* Coupon code input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Kod rabatowy</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="np. MOTO10 lub START2026"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Dodaj
                </button>
              </div>
              {couponMsg && (
                <p
                  className={`text-[11px] ${
                    couponMsg.isError ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Wartość produktów brutto:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {cart.subtotalGross.toFixed(2)} zł
                </span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Rabat ({cart.appliedCoupon}):</span>
                  <span className="font-mono tabular-nums">-{cart.discountAmount.toFixed(2)} zł</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Koszt wybranej dostawy:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {cart.shippingCost === 0 ? 'Darmowa' : `${cart.shippingCost.toFixed(2)} zł`}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Podatek VAT (23%):</span>
                <span className="font-mono tabular-nums text-slate-300">
                  {cart.vatAmount.toFixed(2)} zł
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Wartość netto:</span>
                <span className="font-mono tabular-nums text-slate-300">
                  {cart.subtotalNet.toFixed(2)} zł
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Do zapłaty:</span>
                <span className="text-2xl font-black text-rose-500 font-mono tabular-nums">
                  {cart.totalGross.toFixed(2)} zł
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-rose-600/30"
            >
              {isSubmitting ? (
                <span>Przetwarzanie zamówienia...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zamawiam i płacę ({cart.totalGross.toFixed(2)} zł)</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-500 text-center space-y-1">
              <p>Klikając przycisk akceptujesz Regulamin sklepu MOTOCAR24.</p>
              <p className="flex items-center justify-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Szyfrowanie SSL 256-bit · Ochrona kupującego
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
