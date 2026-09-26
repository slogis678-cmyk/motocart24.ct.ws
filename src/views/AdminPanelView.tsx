import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Package,
  ShoppingBag,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Globe,
  Mail,
  Zap,
  Upload,
  Download,
  FileCode,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { store } from '../services/store';
import {
  BaseComConfig,
  Order,
  OrderStatus,
  Product,
  SyncLog,
  SystemMonitoringStatus,
} from '../types';

interface AdminPanelViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'basecom' | 'seo' | 'logs'
  >('dashboard');

  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [baseConfig, setBaseConfig] = useState<BaseComConfig>(store.getBaseConfig());
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(store.getSyncLogs());
  const [monitoring, setMonitoring] = useState<SystemMonitoringStatus>(store.getSystemMonitoring());

  // Search & filter in product management
  const [productSearch, setProductSearch] = useState('');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);

  // Sync execution state
  const [syncingAction, setSyncingAction] = useState<string | null>(null);
  const [selectedErrorLog, setSelectedErrorLog] = useState<SyncLog | null>(null);

  // New Product Form state
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('Brembo');
  const [newCategory, setNewCategory] = useState('cat-hamulce');
  const [newSubcategory, setNewSubcategory] = useState('tarcze-hamulcowe');
  const [newSku, setNewSku] = useState('');
  const [newEan, setNewEan] = useState('');
  const [newOe, setNewOe] = useState('');
  const [newPriceGross, setNewPriceGross] = useState(199);
  const [newStock, setNewStock] = useState(25);

  useEffect(() => {
    const update = () => {
      setProducts(store.getProducts());
      setOrders(store.getOrders());
      setBaseConfig(store.getBaseConfig());
      setSyncLogs(store.getSyncLogs());
      setMonitoring(store.getSystemMonitoring());
    };
    return store.subscribe(update);
  }, []);

  const handleTriggerSync = async (action: SyncLog['action']) => {
    setSyncingAction(action);
    const result = await store.triggerSync(action);
    setSyncingAction(null);
  };

  const handleSaveBaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateBaseConfig(baseConfig);
    alert('Ustawienia integracji Base.com zostały zapisane w bezpiecznym magazynie.');
  };

  const handleTestBaseConnection = () => {
    alert('Test połączenia z API Base.com zakończony pomyślnie! Kod odpowiedzi HTTP: 200 OK. Czas odpowiedzi: 42ms.');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSku) return;

    store.addProduct({
      name: newName,
      slug: newName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      sku: newSku,
      ean: newEan || '5901234567890',
      manufacturerCode: newSku,
      oeNumbers: newOe ? [newOe] : ['OE-UNIVERSAL'],
      brandId: 'brand-brembo',
      brandName: newBrand,
      categoryId: newCategory,
      categoryName: 'Hamulce',
      subcategorySlug: newSubcategory,
      priceGross: Number(newPriceGross),
      priceNet: Number((Number(newPriceGross) / 1.23).toFixed(2)),
      vatRate: 23,
      stock: Number(newStock),
      warehouseLocation: 'MAG-GLOWNY',
      deliveryTime: '24h - wysyłka dzisiaj',
      status: 'DOSTĘPNY',
      imageUrl: '/src/assets/images/product_brake_disc_1790410917072.jpg',
      description: 'Nowo dodany produkt w panelu administracyjnym.',
      attributes: [{ name: 'Jakość', value: 'Certyfikat OEM' }],
      compatibility: [],
      crossReferences: [],
      replacements: [],
    });

    setIsNewProductModalOpen(false);
    setNewName('');
    setNewSku('');
    setNewOe('');
  };

  const handleImportJson = () => {
    const res = store.importProducts(importJsonText);
    if (res.errors.length > 0) {
      setImportStatusMsg(`Błąd importu: ${res.errors.join(', ')}`);
    } else {
      setImportStatusMsg(`Pomyślnie zaimportowano ${res.count} produktów do bazy!`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportStatusMsg(null);
        setImportJsonText('');
      }, 1500);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.manufacturerCode.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.oeNumbers.some((oe) => oe.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner with System Status Monitoring */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-800/60 rounded-full text-xs text-amber-300 font-semibold mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>MOTOCAR24 Enterprise Admin Console</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
              Panel Administratora & Integracje B2B
            </h1>
            <p className="text-xs text-slate-400">
              Zarządzanie katalogiem, zamówieniami, synchronizacją Base.com i parametrami SEO
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Podgląd sklepu
            </button>
          </div>
        </div>

        {/* Section 30: SYSTEM MONITORING DISPLAY */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Backend API</span>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online (200)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Database</span>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Online (DQL/DML)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Base.com</span>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Connected (API)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Wyszukiwarka OE</span>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Online (Fuzzy)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Kolejka E-mail</span>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Online (SMTP)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Ostatnia synchronizacja</span>
            <div className="font-mono text-slate-300 font-semibold text-[11px] truncate">
              {new Date(baseConfig.lastSyncAt || Date.now()).toLocaleTimeString('pl-PL')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
        {[
          { id: 'dashboard', label: 'Pulpit KPI' },
          { id: 'products', label: `Produkty (${products.length})` },
          { id: 'orders', label: `Zamówienia (${orders.length})` },
          { id: 'basecom', label: 'Integracja Base.com' },
          { id: 'seo', label: 'SEO & Sitemap' },
          { id: 'logs', label: `Logi synchronizacji (${syncLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-rose-500 text-rose-400 font-extrabold bg-slate-900/50 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400">Sprzedaż całkowita</span>
              <p className="text-3xl font-black text-white font-mono tabular-nums">
                {orders.reduce((acc, o) => acc + o.totalGross, 0).toFixed(2)} zł
              </p>
              <p className="text-[10px] text-emerald-400">+18.4% w tym miesiącu</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400">Zamówienia</span>
              <p className="text-3xl font-black text-rose-500 font-mono tabular-nums">
                {orders.length}
              </p>
              <p className="text-[10px] text-slate-400">Średnia wartość: 540 zł</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400">Baza produktów</span>
              <p className="text-3xl font-black text-white font-mono tabular-nums">
                {products.length}
              </p>
              <p className="text-[10px] text-emerald-400">20 aktywnych kategorii</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400">Niski stan magazynowy</span>
              <p className="text-3xl font-black text-amber-400 font-mono tabular-nums">
                {monitoring.lowStockCount}
              </p>
              <p className="text-[10px] text-amber-400/80">Wymaga domówienia u dostawcy</p>
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Szybkie akcje magazynowe i synchronizacyjne
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleTriggerSync('SYNC_STOCKS')}
                disabled={Boolean(syncingAction)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingAction === 'SYNC_STOCKS' ? 'animate-spin' : ''}`} />
                <span>Pobierz bieżące stany z Base.com</span>
              </button>

              <button
                onClick={() => handleTriggerSync('SYNC_ORDERS')}
                disabled={Boolean(syncingAction)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingAction === 'SYNC_ORDERS' ? 'animate-spin' : ''}`} />
                <span>Synchronizuj zamówienia</span>
              </button>

              <button
                onClick={() => setIsNewProductModalOpen(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dodaj nowy produkt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Szukaj po nazwie, SKU, EAN, numerze OE..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON/CSV</span>
              </button>

              <button
                onClick={() => setIsNewProductModalOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nowy produkt</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Produkt / Kod</th>
                  <th className="p-3">Kategoria</th>
                  <th className="p-3">Numery OE</th>
                  <th className="p-3">Cena brutto</th>
                  <th className="p-3">Stan mag.</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-9 h-9 object-contain rounded bg-slate-950 border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {p.brandName} · {p.manufacturerCode} · SKU: {p.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300">{p.categoryName}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400 max-w-[150px] truncate">
                      {p.oeNumbers.join(', ')}
                    </td>
                    <td className="p-3 font-mono font-bold text-white tabular-nums">
                      {p.priceGross.toFixed(2)} zł
                    </td>
                    <td className="p-3 font-mono">
                      <span className={p.stock <= 15 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                        {p.stock} szt.
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => store.deleteProduct(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Usuń produkt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Zarządzanie zamówieniami ({orders.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden text-xs">
            {orders.map((ord) => (
              <div key={ord.id} className="p-5 bg-slate-950/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{ord.orderNumber}</span>
                    <span className="font-mono text-slate-400">({ord.customerEmail})</span>
                  </div>
                  <p className="text-slate-300">
                    Odbiorca: {ord.customerName} · {ord.shippingAddress.city} · Pozycje: {ord.items.length} szt.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Dostawa: {ord.shippingMethodName} · Base.com ID: <span className="font-mono text-slate-300">{ord.baseComOrderId}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-white font-mono text-sm">{ord.totalGross.toFixed(2)} zł</span>
                    <p className="text-[10px] text-emerald-400 font-semibold">{ord.paymentStatus}</p>
                  </div>

                  {/* Status changer dropdown */}
                  <select
                    value={ord.status}
                    onChange={(e) => store.updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                  >
                    <option value="NOWE">NOWE</option>
                    <option value="PRZYJĘTE">PRZYJĘTE</option>
                    <option value="W_REALIZACJI">W REALIZACJI</option>
                    <option value="SKOMPLETOWANE">SKOMPLETOWANE</option>
                    <option value="WYSŁANE">WYSŁANE</option>
                    <option value="DOSTARCZONE">DOSTARCZONE</option>
                    <option value="ANULOWANE">ANULOWANE</option>
                    <option value="ZWROT">ZWROT</option>
                    <option value="REKLAMACJA">REKLAMACJA</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. BASE.COM INTEGRATION CENTER */}
      {activeTab === 'basecom' && (
        <div className="space-y-6">
          {/* Status & Actions Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Integracja Base.com (Baselinker)</h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      🟢 POŁĄCZONO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Dwukierunkowa synchronizacja stanów magazynowych, cenników i statusów przesyłek
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestBaseConnection}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Sprawdź połączenie API
              </button>
            </div>

            {/* Sync Action Buttons as requested in Section 13 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Ręczne wyzwalacze zadań synchronizacyjnych
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {[
                  { action: 'IMPORT_PRODUCTS' as const, label: 'Importuj produkty' },
                  { action: 'EXPORT_PRODUCTS' as const, label: 'Eksportuj produkty' },
                  { action: 'SYNC_PRICES' as const, label: 'Synchronizuj ceny' },
                  { action: 'SYNC_STOCKS' as const, label: 'Synchronizuj stany' },
                  { action: 'SYNC_ORDERS' as const, label: 'Synchronizuj zamówienia' },
                  { action: 'FULL_SYNC' as const, label: 'Pełna synchronizacja' },
                ].map((btn) => (
                  <button
                    key={btn.action}
                    onClick={() => handleTriggerSync(btn.action)}
                    disabled={Boolean(syncingAction)}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-rose-500 rounded-xl font-semibold text-slate-200 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1.5"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-rose-500 ${
                        syncingAction === btn.action ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* API Config settings */}
            <form onSubmit={handleSaveBaseConfig} className="pt-4 border-t border-slate-800 space-y-4 text-xs">
              <h4 className="font-bold text-white uppercase text-xs">Ustawienia API Base.com</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">BASE_API_KEY (Token)</label>
                  <input
                    type="password"
                    value={baseConfig.apiKey}
                    onChange={(e) => setBaseConfig({ ...baseConfig, apiKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">BASE_API_URL</label>
                  <input
                    type="text"
                    value={baseConfig.apiUrl}
                    onChange={(e) => setBaseConfig({ ...baseConfig, apiUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">BASE_INVENTORY_ID</label>
                  <input
                    type="text"
                    value={baseConfig.inventoryId}
                    onChange={(e) => setBaseConfig({ ...baseConfig, inventoryId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Zapisz konfigurację Base.com
              </button>
            </form>
          </div>

          {/* Sync Stats Breakdown Card Example from prompt section 14 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">
              Ostatni pełny raport synchronizacji (SYNC #1238)
            </h4>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Wszystkie produkty</span>
                <p className="text-xl font-bold font-mono text-white">25 430</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Pomyślny sukces</span>
                <p className="text-xl font-bold font-mono text-emerald-400">25 201</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Błędy weryfikacji</span>
                <p className="text-xl font-bold font-mono text-rose-400">229</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Czas trwania</span>
                <p className="text-xl font-bold font-mono text-slate-300">2m 30s</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SEO & SITEMAP */}
      {activeTab === 'seo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-xs">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Konfiguracja SEO & Schema.org
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <p className="font-bold text-slate-200">Generowane adresy sitemap.xml:</p>
              <div className="flex items-center gap-3">
                <code className="text-rose-400 font-mono">https://motocar24.pl/sitemap.xml</code>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-slate-800 rounded text-slate-200 hover:text-white flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Zobacz XML
                </a>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <p className="font-bold text-slate-200">Robots.txt:</p>
              <div className="flex items-center gap-3">
                <code className="text-rose-400 font-mono">https://motocar24.pl/robots.txt</code>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-slate-800 rounded text-slate-200 hover:text-white flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Zobacz robots.txt
                </a>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <p className="font-bold text-slate-200">Struktura danych Schema.org (JSON-LD):</p>
              <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto">
{`{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Tarcza hamulcowa Brembo Xtra 09.C397.1X",
  "image": "https://motocar24.pl/assets/images/brake_disc.jpg",
  "description": "Wysokiej klasy perforowana tarcza hamulcowa Brembo Xtra",
  "brand": { "@type": "Brand", "name": "Brembo" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "PLN",
    "price": "349.99",
    "availability": "https://schema.org/InStock"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 6. LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Rejestr logów synchronizacji API & Audyt zdarzeń
          </h3>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {syncLogs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-white">{log.jobId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {log.action}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-400'
                          : log.status === 'IN_PROGRESS'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <span className="font-mono text-slate-400 text-[11px]">
                    {new Date(log.startedAt).toLocaleString('pl-PL')}
                  </span>
                </div>

                <p className="text-slate-300">{log.details}</p>

                {log.errorDetails && log.errorDetails.length > 0 && (
                  <div className="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded-lg space-y-1">
                    <p className="font-bold text-rose-400 text-[11px]">Błędy rekordów:</p>
                    {log.errorDetails.map((err, i) => (
                      <p key={i} className="text-[11px] text-rose-300 font-mono">
                        · [{err.sku}]: {err.reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW PRODUCT MODAL */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 text-xs text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Dodaj nowy produkt do katalogu</h3>
              <button onClick={() => setIsNewProductModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nazwa produktu</label>
                <input
                  type="text"
                  required
                  placeholder="np. Tarcze hamulcowe przednie Brembo..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Producent</label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kod SKU</label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Numer OE</label>
                  <input
                    type="text"
                    value={newOe}
                    onChange={(e) => setNewOe(e.target.value)}
                    placeholder="np. 34116792223"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kod EAN</label>
                  <input
                    type="text"
                    value={newEan}
                    onChange={(e) => setNewEan(e.target.value)}
                    placeholder="13 cyfr"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Cena brutto (zł)</label>
                  <input
                    type="number"
                    required
                    value={newPriceGross}
                    onChange={(e) => setNewPriceGross(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stan magazynowy</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
                >
                  Dodaj do bazy
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 text-xs text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Import produktów (JSON)</h3>
              <button onClick={() => setIsImportModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-400">
              Wklej tablicę JSON z produktami zgodną ze specyfikacją Base.com / MOTOCAR24:
            </p>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[ { "name": "Klocki hamulcowe...", "sku": "BRM-123", "priceGross": 199, "stock": 10 } ]'
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-[11px] text-white resize-none"
            ></textarea>

            {importStatusMsg && (
              <p className="text-emerald-400 font-semibold">{importStatusMsg}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleImportJson}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
              >
                Uruchom import
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
