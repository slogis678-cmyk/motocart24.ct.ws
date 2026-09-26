import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Car,
  Heart,
  MapPin,
  FileText,
  RotateCcw,
  Settings,
  LogOut,
  Trash2,
  Plus,
  CheckCircle2,
  ExternalLink,
  Truck,
  Printer,
  ShieldCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { store } from '../services/store';
import { Order, Product, ReturnClaim, UserVehicle, Vehicle } from '../types';

interface CustomerPanelViewProps {
  initialSection?: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenVehicleModal: () => void;
}

export const CustomerPanelView: React.FC<CustomerPanelViewProps> = ({
  initialSection = 'dashboard',
  onNavigate,
  onOpenVehicleModal,
}) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'garage'
    | 'addresses'
    | 'wishlist'
    | 'invoices'
    | 'returns'
    | 'settings'
  >((initialSection as any) || 'dashboard');

  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>(store.getUserVehicles());
  const [wishlistIds, setWishlistIds] = useState<string[]>(store.getWishlist());
  const [returns, setReturns] = useState<ReturnClaim[]>(store.getReturns());

  // RMA Form modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [rmaOrderNumber, setRmaOrderNumber] = useState('');
  const [rmaProductName, setRmaProductName] = useState('');
  const [rmaType, setRmaType] = useState<'ZWROT' | 'REKLAMACJA'>('ZWROT');
  const [rmaReason, setRmaReason] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const update = () => {
      setCurrentUser(store.getCurrentUser());
      setOrders(store.getOrders());
      setUserVehicles(store.getUserVehicles());
      setWishlistIds(store.getWishlist());
      setReturns(store.getReturns());
    };
    return store.subscribe(update);
  }, []);

  const wishlistProducts = wishlistIds
    .map((id) => store.getProductById(id))
    .filter(Boolean) as Product[];

  const handleCreateRMA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rmaOrderNumber || !rmaProductName || !rmaReason) return;
    store.addReturnClaim({
      orderNumber: rmaOrderNumber,
      productName: rmaProductName,
      type: rmaType,
      reason: rmaReason,
    });
    setIsReturnModalOpen(false);
    setRmaOrderNumber('');
    setRmaProductName('');
    setRmaReason('');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 2500);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Czy na pewno chcesz usunąć swoje konto z bazy MOTOCAR24? Ta operacja jest nieodwracalna.')) {
      store.setCurrentUser(null);
      onNavigate('home');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-center font-bold text-xl">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white font-['Cabinet_Grotesk']">
              Witaj, {currentUser ? currentUser.name : 'Gościu'}!
            </h1>
            <p className="text-xs text-slate-400">
              Konto klienta: <span className="font-mono text-slate-300">{currentUser?.email}</span> · Rola: {currentUser?.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenVehicleModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Car className="w-4 h-4 text-rose-400" />
            <span>Zarządzaj garażem</span>
          </button>
          <button
            onClick={() => {
              store.setCurrentUser(null);
              onNavigate('home');
            }}
            className="px-4 py-2 bg-slate-950 border border-slate-700 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Wyloguj</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content with Sidebar Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1 text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Pulpit klienta', icon: User },
            { id: 'orders', label: `Moje zamówienia (${orders.length})`, icon: ShoppingBag },
            { id: 'garage', label: `Mój garaż (${userVehicles.length})`, icon: Car },
            { id: 'wishlist', label: `Ulubione (${wishlistIds.length})`, icon: Heart },
            { id: 'addresses', label: 'Dane i adresy', icon: MapPin },
            { id: 'invoices', label: 'Faktury VAT', icon: FileText },
            { id: 'returns', label: `Zwroty i reklamacje (${returns.length})`, icon: RotateCcw },
            { id: 'settings', label: 'Ustawienia konta', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-3 transition-colors ${
                  isCurrent
                    ? 'bg-rose-600 text-white font-bold shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Active Section */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl min-h-[500px]">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                Podsumowanie konta
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab('orders')}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer space-y-1 transition-colors"
                >
                  <span className="text-[11px] uppercase font-bold text-slate-400">Zamówienia</span>
                  <p className="text-2xl font-black text-white font-mono">{orders.length}</p>
                  <p className="text-[10px] text-emerald-400">Wszystkie zarejestrowane</p>
                </div>

                <div
                  onClick={() => setActiveTab('garage')}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer space-y-1 transition-colors"
                >
                  <span className="text-[11px] uppercase font-bold text-slate-400">Mój Garaż</span>
                  <p className="text-2xl font-black text-rose-500 font-mono">{userVehicles.length}</p>
                  <p className="text-[10px] text-slate-400">Zapisane samochody</p>
                </div>

                <div
                  onClick={() => setActiveTab('wishlist')}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer space-y-1 transition-colors"
                >
                  <span className="text-[11px] uppercase font-bold text-slate-400">Ulubione</span>
                  <p className="text-2xl font-black text-white font-mono">{wishlistIds.length}</p>
                  <p className="text-[10px] text-slate-400">Zapisane części</p>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Ostatnie zamówienia
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Zobacz wszystkie ({orders.length})
                  </button>
                </div>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                  {orders.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="p-4 bg-slate-950/60 flex items-center justify-between text-xs gap-4">
                      <div>
                        <p className="font-bold text-white">{ord.orderNumber}</p>
                        <p className="text-slate-400 text-[11px]">
                          Data: {new Date(ord.createdAt).toLocaleDateString('pl-PL')} · Pozycje: {ord.items.length}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white tabular-nums">
                          {ord.totalGross.toFixed(2)} zł
                        </span>
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[11px]">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                Historia zamówień ({orders.length})
              </h2>

              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-xs text-slate-400 font-mono">
                          Zamówienie z dnia {new Date(ord.createdAt).toLocaleString('pl-PL')}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{ord.orderNumber}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            ord.status === 'DOSTARCZONE'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : ord.status === 'WYSŁANE'
                              ? 'bg-sky-950 text-sky-400 border border-sky-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Ordered items */}
                    <div className="divide-y divide-slate-800/80">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded object-contain bg-slate-900 border border-slate-800 p-1"
                            />
                            <div>
                              <p className="font-semibold text-slate-200">{item.name}</p>
                              <p className="text-slate-400 text-[11px]">
                                Kod: {item.manufacturerCode} · Ilość: {item.quantity} szt.
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-white font-mono tabular-nums">
                            {item.totalGross.toFixed(2)} zł
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer info: Tracking, Total, Invoice */}
                    <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
                      <div>
                        <p>Dostawa: <strong className="text-slate-200">{ord.shippingMethodName}</strong></p>
                        {ord.trackingNumber && (
                          <p className="text-slate-300">
                            Nr przesyłki: <span className="font-mono text-rose-400 font-semibold">{ord.trackingNumber}</span> ({ord.trackingCarrier})
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-white font-mono">
                          Razem: {ord.totalGross.toFixed(2)} zł
                        </span>
                        {ord.invoiceNumber && (
                          <p className="text-[11px] text-slate-500">Faktura: {ord.invoiceNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GARAGE */}
          {activeTab === 'garage' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                    Mój garaż samochodowy
                  </h2>
                  <p className="text-xs text-slate-400">
                    Zapisane pojazdy pozwalają jednym kliknięciem filtrować 100% kompatybilne części
                  </p>
                </div>

                <button
                  onClick={onOpenVehicleModal}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dodaj samochód</span>
                </button>
              </div>

              <div className="space-y-3">
                {userVehicles.map((uv) => {
                  const isActive = store.getActiveVehicle()?.id === uv.vehicle.id;
                  return (
                    <div
                      key={uv.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-rose-950/20 border-rose-600/70 shadow-lg'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-white">
                              {uv.vehicle.brand} {uv.vehicle.model}
                            </h3>
                            {uv.nickname && (
                              <span className="text-xs text-slate-400">({uv.nickname})</span>
                            )}
                            {isActive && (
                              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[10px]">
                                AKTYWNY W SKLEPIE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300">
                            Silnik: <strong>{uv.vehicle.engine}</strong> · Generacja: {uv.vehicle.generation}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Pojemność: {uv.vehicle.displacement} · Paliwo: {uv.vehicle.fuelType}
                            {uv.licensePlate && ` · Tablica: ${uv.licensePlate}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              store.setActiveVehicle(uv.vehicle);
                              onNavigate('catalog', `vehicle=${uv.vehicle.id}`);
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow"
                          >
                            Pokaż części
                          </button>
                          <button
                            onClick={() => store.removeUserVehicle(uv.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800"
                            title="Usuń auto z garażu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                Zapisane części ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs space-y-3">
                  <Heart className="w-10 h-10 mx-auto text-slate-600" />
                  <p>Twoja lista ulubionych części jest pusta.</p>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl"
                  >
                    Przeglądaj katalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onNavigate('product', p.id)}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition-all space-y-3"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-36 object-contain bg-slate-900 rounded-xl p-2"
                      />
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold">{p.brandName}</span>
                        <h4 className="font-bold text-xs text-white line-clamp-2">{p.name}</h4>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="font-black text-sm text-white font-mono tabular-nums">
                          {p.priceGross.toFixed(2)} zł
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            store.addToCart(p, 1);
                          }}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                        >
                          Do koszyka
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                Zapisane adresy i dane firmy
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                    Główny adres doręczeń
                  </h4>
                  <div className="text-slate-300 space-y-1">
                    <p className="font-bold text-white">{currentUser?.name}</p>
                    <p>ul. Marszałkowska 42/15</p>
                    <p>00-503 Warszawa</p>
                    <p>Polska</p>
                    <p className="text-slate-400">Tel: {currentUser?.phone || '+48 501 234 567'}</p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                    Dane do Faktury VAT (B2B)
                  </h4>
                  <div className="text-slate-300 space-y-1">
                    <p className="font-bold text-white">{currentUser?.companyName || 'Brak danych firmy'}</p>
                    <p>NIP: {currentUser?.nip || '-'}</p>
                    <p>ul. Marszałkowska 42/15</p>
                    <p>00-503 Warszawa</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                Faktury VAT
              </h2>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                {orders
                  .filter((o) => o.invoiceNumber)
                  .map((ord) => (
                    <div key={ord.id} className="p-4 bg-slate-950 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-white">{ord.invoiceNumber}</p>
                        <p className="text-slate-400 text-[11px]">
                          Do zamówienia: {ord.orderNumber} · Data: {new Date(ord.createdAt).toLocaleDateString('pl-PL')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white">{ord.totalGross.toFixed(2)} zł brutto</span>
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-500" />
                          <span>Pobierz PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 7: RETURNS & CLAIMS */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                    Zwroty i reklamacje (RMA)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Masz 30 dni na darmowy zwrot każdej części bez podawania przyczyny
                  </p>
                </div>

                <button
                  onClick={() => setIsReturnModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Zgłoś nowy zwrot / reklamację</span>
                </button>
              </div>

              <div className="space-y-3">
                {returns.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Brak aktywnych zgłoszeń zwrotów lub reklamacji.
                  </p>
                ) : (
                  returns.map((ret) => (
                    <div
                      key={ret.id}
                      className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ret.type === 'ZWROT' ? 'bg-sky-950 text-sky-400' : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {ret.type}
                          </span>
                          <span className="font-bold text-white">{ret.orderNumber}</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          Status: <strong className="text-rose-400">{ret.status}</strong>
                        </span>
                      </div>
                      <p className="text-slate-200 font-semibold">{ret.productName}</p>
                      <p className="text-slate-400 text-[11px]">Powód zgłoszenia: {ret.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                Ustawienia konta i bezpieczeństwo
              </h2>

              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                <h4 className="font-bold text-white uppercase text-xs">Zmień hasło</h4>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nowe hasło</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Powtórz nowe hasło</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                {passwordSuccess && (
                  <p className="text-emerald-400 text-xs font-semibold">Hasło zostało zmienione pomyślnie!</p>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  Zapisz nowe hasło
                </button>
              </form>

              <div className="pt-6 border-t border-slate-800 space-y-2">
                <h4 className="font-bold text-rose-500 uppercase text-xs">Strefa niebezpieczna</h4>
                <p className="text-xs text-slate-400">
                  Usunięcie konta spowoduje bezpowrotne skasowanie historii pojazdów i ulubionych części.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 rounded-xl text-xs font-bold"
                >
                  Usuń konto klienta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Return Claim Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 text-xs text-slate-100">
            <h3 className="font-bold text-base text-white">Formularz zwrotu / reklamacji</h3>

            <form onSubmit={handleCreateRMA} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Typ zgłoszenia</label>
                <select
                  value={rmaType}
                  onChange={(e: any) => setRmaType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                >
                  <option value="ZWROT">Zwrot towaru w ciągu 30 dni</option>
                  <option value="REKLAMACJA">Reklamacja gwarancyjna</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Numer zamówienia</label>
                <input
                  type="text"
                  required
                  placeholder="np. M24/2026/09/10024"
                  value={rmaOrderNumber}
                  onChange={(e) => setRmaOrderNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nazwa części lub kod SKU</label>
                <input
                  type="text"
                  required
                  placeholder="np. Tarcze hamulcowe Brembo"
                  value={rmaProductName}
                  onChange={(e) => setRmaProductName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Powód zwrotu / opis wady</label>
                <textarea
                  rows={3}
                  required
                  value={rmaReason}
                  onChange={(e) => setRmaReason(e.target.value)}
                  placeholder="Opisz przyczynę zwrotu lub problem techniczny..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
                >
                  Wyślij zgłoszenie RMA
                </button>
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
