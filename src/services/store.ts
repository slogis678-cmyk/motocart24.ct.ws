import {
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_RETURNS,
  INITIAL_SYNC_LOGS,
  INITIAL_USERS,
  INITIAL_VEHICLES,
} from '../data/mockDatabase';
import {
  BaseComConfig,
  Cart,
  Order,
  OrderStatus,
  Product,
  ReturnClaim,
  SyncLog,
  SystemMonitoringStatus,
  TireSpec,
  User,
  UserVehicle,
  Vehicle,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'motocar24_products',
  ORDERS: 'motocar24_orders',
  USER: 'motocar24_current_user',
  CART: 'motocar24_cart',
  WISHLIST: 'motocar24_wishlist',
  USER_VEHICLES: 'motocar24_user_vehicles',
  ACTIVE_VEHICLE: 'motocar24_active_vehicle',
  BASE_CONFIG: 'motocar24_base_config',
  SYNC_LOGS: 'motocar24_sync_logs',
  RETURNS: 'motocar24_returns',
  RECENT_SEARCHES: 'motocar24_recent_searches',
};

class StoreService {
  private products: Product[] = [];
  private orders: Order[] = [];
  private currentUser: User | null = null;
  private cart: Cart = {
    items: [],
    subtotalGross: 0,
    subtotalNet: 0,
    vatAmount: 0,
    discountAmount: 0,
    shippingCost: 0,
    freeShippingThreshold: 250,
    totalGross: 0,
  };
  private wishlist: string[] = []; // product IDs
  private userVehicles: UserVehicle[] = [];
  private activeVehicle: Vehicle | null = null;
  private baseConfig: BaseComConfig = {
    apiKey: 'bc_live_99a8b7762c194e8a_secret',
    apiUrl: 'https://api.base.com/v1',
    inventoryId: 'inv-magazyn-centralny-49210',
    autoSyncEnabled: true,
    syncIntervalMinutes: 15,
    lastConnected: true,
    lastSyncAt: new Date().toISOString(),
    syncedProductsCount: 25201,
    errorCount: 229,
  };
  private syncLogs: SyncLog[] = [];
  private returnClaims: ReturnClaim[] = [];
  private recentSearches: string[] = ['Brembo Xtra', '205/55 R16', 'Castrol 5W30', 'Filtr oleju Golf 7', 'Bosch Aerotwin'];

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      this.products = storedProds ? JSON.parse(storedProds) : INITIAL_PRODUCTS;

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      this.orders = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      this.currentUser = storedUser ? JSON.parse(storedUser) : INITIAL_USERS[1]; // default logged in as Piotr Nowak (Customer)

      const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (storedCart) {
        this.cart = JSON.parse(storedCart);
      } else {
        // Preload cart with 1 sample item so user immediately sees active cart badge
        this.cart.items = [
          {
            product: this.products[0],
            quantity: 2,
          },
        ];
        this.recalculateCart();
      }

      const storedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      this.wishlist = storedWishlist ? JSON.parse(storedWishlist) : ['prod-tir-001', 'prod-oil-001'];

      const storedUserVehicles = localStorage.getItem(STORAGE_KEYS.USER_VEHICLES);
      if (storedUserVehicles) {
        this.userVehicles = JSON.parse(storedUserVehicles);
      } else {
        this.userVehicles = [
          {
            id: 'uv-01',
            userId: 'user-demo-customer',
            vehicleId: 'veh-bmw-320d-f30',
            vehicle: INITIAL_VEHICLES[0],
            licensePlate: 'WI 9842A',
            nickname: 'Mój czarny sedan BMW',
            mileageKm: 184500,
            addedAt: '2026-02-15T12:00:00Z',
            isActive: true,
          },
          {
            id: 'uv-02',
            userId: 'user-demo-customer',
            vehicleId: 'veh-vw-golf7-20tdi',
            vehicle: INITIAL_VEHICLES[2],
            licensePlate: 'WZ 4511C',
            nickname: 'Golf firmowy (Variant)',
            mileageKm: 215000,
            addedAt: '2026-03-01T10:00:00Z',
            isActive: false,
          },
        ];
      }

      const storedActiveVehicle = localStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE);
      this.activeVehicle = storedActiveVehicle ? JSON.parse(storedActiveVehicle) : INITIAL_VEHICLES[0];

      const storedConfig = localStorage.getItem(STORAGE_KEYS.BASE_CONFIG);
      if (storedConfig) this.baseConfig = JSON.parse(storedConfig);

      const storedLogs = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      this.syncLogs = storedLogs ? JSON.parse(storedLogs) : INITIAL_SYNC_LOGS;

      const storedReturns = localStorage.getItem(STORAGE_KEYS.RETURNS);
      this.returnClaims = storedReturns ? JSON.parse(storedReturns) : INITIAL_RETURNS;

      const storedSearches = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      if (storedSearches) this.recentSearches = JSON.parse(storedSearches);
    } catch (e) {
      console.error('Error initializing store from localStorage:', e);
      this.products = INITIAL_PRODUCTS;
      this.orders = INITIAL_ORDERS;
      this.currentUser = INITIAL_USERS[1];
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((fn) => fn());
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(this.wishlist));
      localStorage.setItem(STORAGE_KEYS.USER_VEHICLES, JSON.stringify(this.userVehicles));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, JSON.stringify(this.activeVehicle));
      localStorage.setItem(STORAGE_KEYS.BASE_CONFIG, JSON.stringify(this.baseConfig));
      localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(this.syncLogs));
      localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(this.returnClaims));
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(this.recentSearches));
    } catch (err) {
      console.warn('Storage save failed:', err);
    }
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id || p.slug === id);
  }

  public getCategories() {
    return INITIAL_CATEGORIES;
  }

  public getBrands() {
    return INITIAL_BRANDS;
  }

  public getVehicles() {
    return INITIAL_VEHICLES;
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.unshift(newProd);
    this.notify();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = {
      ...this.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.notify();
    return this.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    if (this.products.length !== initLen) {
      this.notify();
      return true;
    }
    return false;
  }

  public searchProducts(params: {
    query?: string;
    categoryId?: string;
    subcategorySlug?: string;
    brandId?: string;
    vehicleId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'popularity' | 'price_asc' | 'price_desc' | 'availability' | 'newest';
    tireSeason?: string;
    tireWidth?: number;
    tireProfile?: number;
    tireDiameter?: number;
  }): Product[] {
    let result = [...this.products];

    // Filter by query (name, OE, SKU, EAN, manufacturerCode, brand)
    if (params.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase();
      this.recordSearchQuery(params.query.trim());
      result = result.filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchEan = p.ean.includes(q);
        const matchMfg = p.manufacturerCode.toLowerCase().includes(q);
        const matchBrand = p.brandName.toLowerCase().includes(q);
        const matchOe = p.oeNumbers.some((oe) => oe.toLowerCase().replace(/[\s.-]/g, '').includes(q.replace(/[\s.-]/g, '')));
        const matchCross = p.crossReferences.some((cr) => cr.code.toLowerCase().includes(q));
        return matchName || matchSku || matchEan || matchMfg || matchBrand || matchOe || matchCross;
      });
    }

    if (params.categoryId) {
      result = result.filter((p) => p.categoryId === params.categoryId);
    }

    if (params.subcategorySlug) {
      result = result.filter((p) => p.subcategorySlug === params.subcategorySlug);
    }

    if (params.brandId) {
      const bId = params.brandId.toLowerCase();
      result = result.filter((p) => p.brandId === params.brandId || p.brandName.toLowerCase() === bId);
    }

    if (params.vehicleId) {
      result = result.filter((p) => p.compatibility.some((c) => c.vehicleId === params.vehicleId));
    }

    if (params.minPrice !== undefined) {
      result = result.filter((p) => p.priceGross >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      result = result.filter((p) => p.priceGross <= params.maxPrice!);
    }

    // Tire filters
    if (params.tireSeason && params.tireSeason !== 'ALL') {
      result = result.filter((p) => p.tireSpec?.season === params.tireSeason);
    }
    if (params.tireWidth) {
      result = result.filter((p) => p.tireSpec?.width === params.tireWidth);
    }
    if (params.tireProfile) {
      result = result.filter((p) => p.tireSpec?.profile === params.tireProfile);
    }
    if (params.tireDiameter) {
      result = result.filter((p) => p.tireSpec?.diameter === params.tireDiameter);
    }

    // Sorting
    switch (params.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.priceGross - b.priceGross);
        break;
      case 'price_desc':
        result.sort((a, b) => b.priceGross - a.priceGross);
        break;
      case 'availability':
        result.sort((a, b) => b.stock - a.stock);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popularity':
      default:
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
    }

    return result;
  }

  public recordSearchQuery(term: string) {
    if (!term || term.length < 2) return;
    this.recentSearches = [term, ...this.recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    this.notify();
  }

  public getRecentSearches() {
    return this.recentSearches;
  }

  public clearRecentSearches() {
    this.recentSearches = [];
    this.notify();
  }

  // --- VEHICLE SELECTION ---
  public getActiveVehicle(): Vehicle | null {
    return this.activeVehicle;
  }

  public setActiveVehicle(vehicle: Vehicle | null) {
    this.activeVehicle = vehicle;
    // update in userVehicles isActive flag
    if (vehicle) {
      this.userVehicles = this.userVehicles.map((uv) => ({
        ...uv,
        isActive: uv.vehicleId === vehicle.id,
      }));
    }
    this.notify();
  }

  public getUserVehicles(): UserVehicle[] {
    return this.userVehicles;
  }

  public addUserVehicle(vehicle: Vehicle, nickname?: string, licensePlate?: string, vin?: string): UserVehicle {
    const newUv: UserVehicle = {
      id: `uv-${Date.now()}`,
      userId: this.currentUser?.id || 'guest',
      vehicleId: vehicle.id,
      vehicle,
      nickname: nickname || `${vehicle.brand} ${vehicle.model}`,
      licensePlate,
      vin,
      addedAt: new Date().toISOString(),
      isActive: true,
    };
    this.userVehicles.push(newUv);
    this.setActiveVehicle(vehicle);
    return newUv;
  }

  public removeUserVehicle(id: string) {
    this.userVehicles = this.userVehicles.filter((uv) => uv.id !== id);
    if (this.activeVehicle && !this.userVehicles.some((uv) => uv.vehicleId === this.activeVehicle?.id)) {
      this.activeVehicle = this.userVehicles[0]?.vehicle || null;
    }
    this.notify();
  }

  // --- CART ---
  public getCart(): Cart {
    return this.cart;
  }

  public addToCart(product: Product, quantity = 1) {
    const existing = this.cart.items.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.items.push({ product, quantity });
    }
    this.recalculateCart();
    this.notify();
  }

  public updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.cart.items.find((i) => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.recalculateCart();
      this.notify();
    }
  }

  public removeFromCart(productId: string) {
    this.cart.items = this.cart.items.filter((i) => i.product.id !== productId);
    this.recalculateCart();
    this.notify();
  }

  public clearCart() {
    this.cart.items = [];
    this.cart.appliedCoupon = undefined;
    this.cart.discountAmount = 0;
    this.recalculateCart();
    this.notify();
  }

  public applyCoupon(code: string): { success: boolean; message: string } {
    const upper = code.trim().toUpperCase();
    if (upper === 'MOTO10') {
      this.cart.appliedCoupon = 'MOTO10 (-10%)';
      this.recalculateCart();
      this.notify();
      return { success: true, message: 'Rabat 10% został pomyślnie naliczony!' };
    }
    if (upper === 'START2026') {
      this.cart.appliedCoupon = 'START2026 (-20 zł)';
      this.recalculateCart();
      this.notify();
      return { success: true, message: 'Kupon 20 zł został pomyślnie naliczony!' };
    }
    return { success: false, message: 'Nieprawidłowy kod rabatowy. Spróbuj MOTO10 lub START2026.' };
  }

  private recalculateCart() {
    let subtotalGross = 0;
    this.cart.items.forEach((item) => {
      subtotalGross += item.product.priceGross * item.quantity;
    });

    let discount = 0;
    if (this.cart.appliedCoupon?.includes('MOTO10')) {
      discount = subtotalGross * 0.1;
    } else if (this.cart.appliedCoupon?.includes('START2026')) {
      discount = Math.min(20, subtotalGross);
    }

    const discountedGross = Math.max(0, subtotalGross - discount);
    const subtotalNet = Number((discountedGross / 1.23).toFixed(2));
    const vatAmount = Number((discountedGross - subtotalNet).toFixed(2));
    const shippingCost = discountedGross >= this.cart.freeShippingThreshold || discountedGross === 0 ? 0 : 15.0;

    this.cart.subtotalGross = Number(subtotalGross.toFixed(2));
    this.cart.discountAmount = Number(discount.toFixed(2));
    this.cart.subtotalNet = subtotalNet;
    this.cart.vatAmount = vatAmount;
    this.cart.shippingCost = shippingCost;
    this.cart.totalGross = Number((discountedGross + shippingCost).toFixed(2));
  }

  // --- WISHLIST ---
  public getWishlist(): string[] {
    return this.wishlist;
  }

  public toggleWishlist(productId: string): boolean {
    const has = this.wishlist.includes(productId);
    if (has) {
      this.wishlist = this.wishlist.filter((id) => id !== productId);
    } else {
      this.wishlist.push(productId);
    }
    this.notify();
    return !has;
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const id = `ord-${Date.now()}`;
    const orderNumber = `M24/2026/09/${Math.floor(10000 + Math.random() * 90000)}`;
    const invoiceNumber = `FV/M24/2026/09/${Math.floor(1000 + Math.random() * 9000)}`;
    const baseComOrderId = `BC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      invoiceNumber,
      baseComOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    this.clearCart();
    this.notify();
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    trackingCarrier?: string
  ): Order | null {
    const idx = this.orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) return null;
    this.orders[idx].status = status;
    if (trackingNumber) this.orders[idx].trackingNumber = trackingNumber;
    if (trackingCarrier) this.orders[idx].trackingCarrier = trackingCarrier;
    this.orders[idx].updatedAt = new Date().toISOString();
    this.notify();
    return this.orders[idx];
  }

  // --- USER AUTH & PROFILE ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public switchUserRole(role: User['role']) {
    if (!this.currentUser) {
      this.currentUser = INITIAL_USERS[0];
    }
    this.currentUser.role = role;
    this.notify();
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.notify();
  }

  // --- RETURNS & CLAIMS ---
  public getReturns(): ReturnClaim[] {
    return this.returnClaims;
  }

  public addReturnClaim(claim: Omit<ReturnClaim, 'id' | 'createdAt' | 'status'>): ReturnClaim {
    const newClaim: ReturnClaim = {
      ...claim,
      id: `ret-${Date.now()}`,
      status: 'NOWA',
      createdAt: new Date().toISOString(),
    };
    this.returnClaims.unshift(newClaim);
    this.notify();
    return newClaim;
  }

  // --- BASE.COM INTEGRATION ---
  public getBaseConfig(): BaseComConfig {
    return this.baseConfig;
  }

  public updateBaseConfig(config: Partial<BaseComConfig>) {
    this.baseConfig = { ...this.baseConfig, ...config };
    this.notify();
  }

  public getSyncLogs(): SyncLog[] {
    return this.syncLogs;
  }

  public triggerSync(
    action: SyncLog['action']
  ): Promise<{ success: boolean; log: SyncLog; message: string }> {
    return new Promise((resolve) => {
      const jobId = `SYNC #${Math.floor(1240 + Math.random() * 50)}`;
      const startTime = new Date();
      const inProgressLog: SyncLog = {
        id: `sync-${Date.now()}`,
        jobId,
        action,
        status: 'IN_PROGRESS',
        startedAt: startTime.toISOString(),
        finishedAt: '',
        totalItems: action === 'SYNC_ORDERS' ? 18 : 25430,
        successItems: 0,
        failedItems: 0,
        durationSeconds: 0,
        details: `Rozpoczęto zadanie ${action}...`,
      };

      this.syncLogs.unshift(inProgressLog);
      this.notify();

      setTimeout(() => {
        const finishedTime = new Date();
        const duration = Math.round((finishedTime.getTime() - startTime.getTime()) / 1000);
        const failedItems = action === 'IMPORT_PRODUCTS' ? 14 : action === 'SYNC_PRICES' ? 5 : 0;
        const total = inProgressLog.totalItems;
        const successItems = total - failedItems;

        const completedLog: SyncLog = {
          ...inProgressLog,
          status: failedItems > 0 ? 'WARNING' : 'SUCCESS',
          finishedAt: finishedTime.toISOString(),
          durationSeconds: duration,
          successItems,
          failedItems,
          details:
            failedItems > 0
              ? `Zakończono z ostrzeżeniami: ${successItems} pozycji zaktualizowano pomyślnie, ${failedItems} pozycji wymaga weryfikacji danych EAN/VAT.`
              : `Operacja zakończona pełnym sukcesem. Zsynchronizowano ${total} rekordów.`,
          errorDetails:
            failedItems > 0
              ? [
                  { sku: 'VAG-03L100099X', reason: 'Nieznana stawka VAT w cenniku dostawcy B2B (oczekiwano 23%)' },
                  { sku: 'CON-0311299999', reason: 'Błędny format kodu EAN (12 cyfr zamiast 13)' },
                ]
              : undefined,
        };

        this.syncLogs[0] = completedLog;
        this.baseConfig.lastSyncAt = finishedTime.toISOString();
        this.baseConfig.syncedProductsCount += successItems > 100 ? 12 : 0;
        this.notify();

        resolve({
          success: true,
          log: completedLog,
          message: `Synchronizacja Base.com (${action}) zakończona!`,
        });
      }, 1200);
    });
  }

  // --- SYSTEM MONITORING STATUS ---
  public getSystemMonitoring(): SystemMonitoringStatus {
    const lowStockCount = this.products.filter((p) => p.stock <= 15).length;
    return {
      backend: 'ONLINE',
      database: 'ONLINE',
      baseCom: this.baseConfig.lastConnected ? 'ONLINE' : 'DISCONNECTED',
      search: 'ONLINE',
      email: 'ONLINE',
      lastSyncDate: this.baseConfig.lastSyncAt || 'Nigdy',
      uptimeSeconds: 849200,
      totalProductsCount: this.products.length,
      totalOrdersCount: this.orders.length,
      lowStockCount,
    };
  }

  // --- IMPORT / EXPORT PRODUCTS ---
  public importProducts(jsonContent: string): { count: number; errors: string[] } {
    try {
      const items = JSON.parse(jsonContent);
      if (!Array.isArray(items)) throw new Error('Format pliku musi być tablicą JSON');
      let count = 0;
      items.forEach((item) => {
        if (item.name && item.sku) {
          this.addProduct({
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            sku: item.sku,
            ean: item.ean || '5900000000000',
            manufacturerCode: item.manufacturerCode || item.sku,
            oeNumbers: item.oeNumbers || [],
            brandId: item.brandId || 'brand-bosch',
            brandName: item.brandName || 'Bosch',
            categoryId: item.categoryId || 'cat-hamulce',
            categoryName: item.categoryName || 'Hamulce',
            subcategorySlug: item.subcategorySlug || 'tarcze-hamulcowe',
            priceGross: Number(item.priceGross) || 100,
            priceNet: Number((Number(item.priceGross || 100) / 1.23).toFixed(2)),
            vatRate: 23,
            stock: Number(item.stock) || 10,
            warehouseLocation: item.warehouseLocation || 'MAG-GLOWNY',
            deliveryTime: '24h - wysyłka dzisiaj',
            status: 'DOSTĘPNY',
            imageUrl: item.imageUrl || '/src/assets/images/product_brake_disc_1790410917072.jpg',
            description: item.description || 'Importowany produkt motoryzacyjny.',
            attributes: item.attributes || [],
            compatibility: item.compatibility || [],
            crossReferences: item.crossReferences || [],
            replacements: [],
          });
          count++;
        }
      });
      return { count, errors: [] };
    } catch (e: any) {
      return { count: 0, errors: [e.message] };
    }
  }
}

export const store = new StoreService();
