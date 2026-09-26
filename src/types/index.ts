export type UserRole = 'CUSTOMER' | 'ADMIN' | 'MANAGER' | 'WAREHOUSE' | 'SUPPORT';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  companyName?: string;
  nip?: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  nip?: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  generation: string;
  yearFrom: number;
  yearTo: number | null;
  engine: string;
  displacement: string; // e.g. "1968 ccm"
  powerHp: number; // e.g. 150 KM
  fuelType: 'Diesel' | 'Benzyna' | 'Hybryda' | 'Elektryczny';
  bodyType: string;
  vinPrefix?: string;
}

export interface UserVehicle {
  id: string;
  userId: string;
  vehicleId: string;
  vehicle: Vehicle;
  vin?: string;
  licensePlate?: string;
  nickname?: string;
  mileageKm?: number;
  addedAt: string;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  productCount: number;
  badge?: string;
  featured?: boolean;
  featuredBrands?: string[];
  banner?: MegaMenuFeaturedSection;
  subcategories: {
    id: string;
    name: string;
    slug: string;
    count: number;
  }[];
}

export interface MegaMenuQuickLink {
  id: string;
  label: string;
  type: 'category' | 'view' | 'external';
  target: string;
  badge?: string;
  isHighlight?: boolean;
  iconName?: string;
}

export interface MegaMenuFeaturedSection {
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  ctaText?: string;
  targetView: string;
  targetParam?: string;
}

export interface CatalogStructureConfig {
  categories: Category[];
  brands: Brand[];
  quickLinks: MegaMenuQuickLink[];
  featuredSections?: MegaMenuFeaturedSection[];
  totalCategories: number;
  version: string;
  lastUpdated: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoText: string;
  country: string;
  tier: 'PREMIUM' | 'OEM' | 'AFTERMARKET' | 'BUDGET';
  productCount: number;
}

export interface TireSpec {
  width: number; // e.g. 205
  profile: number; // e.g. 55
  diameter: number; // e.g. 16
  season: 'Letnie' | 'Zimowe' | 'Całoroczne';
  speedIndex: string; // e.g. "V (do 240 km/h)"
  loadIndex: string; // e.g. "91 (do 615 kg)"
  rollingResistance: 'A' | 'B' | 'C' | 'D' | 'E'; // EU fuel efficiency
  wetGrip: 'A' | 'B' | 'C' | 'D' | 'E'; // EU wet grip
  noiseDb: number; // e.g. 69 dB
  isRunFlat: boolean;
  isReinforced: boolean; // XL
  homologation?: string; // e.g. "MO (Mercedes)", "★ (BMW)", "AO (Audi)"
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductCompatibility {
  vehicleId: string;
  brand: string;
  model: string;
  generation: string;
  yearRange: string;
  engine: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  ean: string;
  manufacturerCode: string;
  oeNumbers: string[];
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  subcategorySlug: string;
  priceGross: number; // PLN
  priceNet: number;
  vatRate: number; // 23%
  regularPriceGross?: number;
  stock: number;
  warehouseLocation: string;
  deliveryTime: string; // e.g. "24h - wysyłka dzisiaj"
  status: 'DOSTĘPNY' | 'OSTATNIE_SZTUKI' | 'NA_ZAMÓWIENIE' | 'NIEDOSTĘPNY';
  imageUrl: string;
  secondaryImages?: string[];
  description: string;
  attributes: ProductAttribute[];
  compatibility: ProductCompatibility[];
  crossReferences: {
    brand: string;
    code: string;
  }[];
  replacements: string[]; // product IDs
  hasPdfDoc?: boolean;
  pdfDocTitle?: string;
  tireSpec?: TireSpec;
  isPromo?: boolean;
  isBestseller?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotalGross: number;
  subtotalNet: number;
  vatAmount: number;
  discountAmount: number;
  appliedCoupon?: string;
  shippingCost: number;
  freeShippingThreshold: number; // default 250 PLN
  totalGross: number;
}

export type OrderStatus =
  | 'NOWE'
  | 'PRZYJĘTE'
  | 'W_REALIZACJI'
  | 'SKOMPLETOWANE'
  | 'WYSŁANE'
  | 'DOSTARCZONE'
  | 'ANULOWANE'
  | 'ZWROT'
  | 'REKLAMACJA';

export type PaymentMethod = 'BLIK' | 'PAYU' | 'CARD' | 'COD' | 'TRANSFER';
export type ShippingMethod = 'PACZKOMAT' | 'COURIER_DPD' | 'COURIER_INPOST' | 'PICKUP';

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  manufacturerCode: string;
  brand: string;
  unitPriceGross: number;
  quantity: number;
  totalGross: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    companyName?: string;
    nip?: string;
    paczkomatCode?: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    companyName: string;
    nip: string;
  };
  items: OrderItem[];
  shippingMethod: ShippingMethod;
  shippingMethodName: string;
  paymentMethod: PaymentMethod;
  paymentMethodName: string;
  shippingCost: number;
  discountAmount: number;
  totalNet: number;
  vatAmount: number;
  totalGross: number;
  status: OrderStatus;
  paymentStatus: 'OPŁACONE' | 'OCZEKUJE' | 'PŁATNOŚĆ_PRZY_ODBIORZE' | 'ANULOWANE';
  trackingNumber?: string;
  trackingCarrier?: string;
  invoiceNumber?: string;
  notes?: string;
  baseComOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnClaim {
  id: string;
  orderNumber: string;
  type: 'ZWROT' | 'REKLAMACJA';
  productName: string;
  reason: string;
  status: 'NOWA' | 'W_ROZPATRYWANIU' | 'ZAAKCEPTOWANA' | 'ODRZUCONA';
  createdAt: string;
}

export interface BaseComConfig {
  apiKey: string;
  apiUrl: string;
  inventoryId: string;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  lastConnected: boolean;
  lastSyncAt: string | null;
  syncedProductsCount: number;
  errorCount: number;
}

export interface SyncLog {
  id: string;
  jobId: string;
  action: 'IMPORT_PRODUCTS' | 'EXPORT_PRODUCTS' | 'SYNC_PRICES' | 'SYNC_STOCKS' | 'SYNC_ORDERS' | 'FULL_SYNC' | 'WEBHOOK_EVENT';
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'IN_PROGRESS';
  startedAt: string;
  finishedAt: string;
  totalItems: number;
  successItems: number;
  failedItems: number;
  durationSeconds: number;
  details: string;
  errorDetails?: {
    sku: string;
    reason: string;
  }[];
}

export interface SystemMonitoringStatus {
  backend: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  database: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  baseCom: 'ONLINE' | 'DISCONNECTED' | 'ERROR';
  search: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  email: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  lastSyncDate: string;
  uptimeSeconds: number;
  totalProductsCount: number;
  totalOrdersCount: number;
  lowStockCount: number;
}
