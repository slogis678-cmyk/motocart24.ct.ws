import { Category, Brand, MegaMenuQuickLink, MegaMenuFeaturedSection, CatalogStructureConfig } from '../types';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '../data/mockDatabase';
import { store } from './store';

// Default enriched category configuration metadata
const CATEGORY_METADATA: Record<string, {
  badge?: string;
  featured?: boolean;
  featuredBrands?: string[];
  banner?: MegaMenuFeaturedSection;
}> = {
  'cat-hamulce': {
    badge: 'Bestseller',
    featured: true,
    featuredBrands: ['brand-brembo', 'brand-bosch', 'brand-ate', 'brand-trw'],
    banner: {
      title: 'Tarcze i klocki hamulcowe Brembo & ATE',
      subtitle: 'Bezpieczeństwo bez kompromisów. Gwarancja dopasowania do VIN.',
      badge: 'Polecane przez ekspertów',
      ctaText: 'Zobacz zestawy hamulcowe',
      targetView: 'catalog',
      targetParam: 'category=cat-hamulce',
    },
  },
  'cat-opony': {
    badge: 'Popularne',
    featured: true,
    featuredBrands: ['brand-michelin', 'brand-continental', 'brand-pirelli'],
    banner: {
      title: 'Dobierz opony według modelu lub rozmiaru',
      subtitle: 'Klasa energetyczna A/B, wysoka przyczepność na mokrym i cicha jazda.',
      badge: 'Sezon 2026',
      ctaText: 'Konfigurator opon',
      targetView: 'tires',
    },
  },
  'cat-oleje': {
    badge: 'Promocja',
    featured: true,
    featuredBrands: ['brand-castrol', 'brand-motul', 'brand-bosch'],
    banner: {
      title: 'Oryginalne oleje silnikowe 5W-30 & 0W-20',
      subtitle: 'Normy VW 504/507, BMW Longlife-04, MB 229.51, Dexos2.',
      badge: '100% Oryginał',
      ctaText: 'Sprawdź oleje silnikowe',
      targetView: 'catalog',
      targetParam: 'category=cat-oleje',
    },
  },
  'cat-filtry': {
    badge: 'Hit',
    featured: true,
    featuredBrands: ['brand-mann', 'brand-bosch', 'brand-febi'],
  },
  'cat-zawieszenie': {
    badge: 'Polecane',
    featured: true,
    featuredBrands: ['brand-sachs', 'brand-lemforder', 'brand-febi', 'brand-trw'],
  },
  'cat-silnik': {
    featured: true,
    featuredBrands: ['brand-bosch', 'brand-denso', 'brand-ngk', 'brand-febi'],
  },
  'cat-elektryka': {
    badge: 'Akumulatory',
    featured: true,
    featuredBrands: ['brand-bosch', 'brand-osram', 'brand-denso'],
  },
  'cat-wycieraczki': {
    badge: 'Wiosna 2026',
    featured: true,
    featuredBrands: ['brand-bosch', 'brand-valeo', 'brand-osram'],
  },
};

const DEFAULT_QUICK_LINKS: MegaMenuQuickLink[] = [
  { id: 'ql-tires', label: 'Wyszukiwarka opon', type: 'view', target: 'tires', isHighlight: true, badge: 'Konfigurator', iconName: 'Disc' },
  { id: 'ql-hamulce', label: 'Hamulce', type: 'category', target: 'category=cat-hamulce', badge: 'Bestseller' },
  { id: 'ql-filtry', label: 'Filtry', type: 'category', target: 'category=cat-filtry' },
  { id: 'ql-oleje', label: 'Oleje i płyny', type: 'category', target: 'category=cat-oleje', badge: 'Promocja' },
  { id: 'ql-silnik', label: 'Silnik & Rozrząd', type: 'category', target: 'category=cat-silnik' },
  { id: 'ql-zawieszenie', label: 'Zawieszenie', type: 'category', target: 'category=cat-zawieszenie' },
  { id: 'ql-elektryka', label: 'Elektryka & Akumulatory', type: 'category', target: 'category=cat-elektryka' },
  { id: 'ql-wycieraczki', label: 'Wycieraczki', type: 'category', target: 'category=cat-wycieraczki' },
];

class CatalogConfigurationService {
  private listeners: (() => void)[] = [];
  private structure: CatalogStructureConfig;
  private isFetching = false;
  private hasInitialized = false;

  constructor() {
    this.structure = this.buildInitialStructure();
    
    // Auto-sync whenever store changes (e.g. products added, synced, or removed)
    if (typeof window !== 'undefined') {
      store.subscribe(() => {
        this.syncWithStoreProducts();
      });
    }
  }

  private buildInitialStructure(): CatalogStructureConfig {
    const categories: Category[] = INITIAL_CATEGORIES.map((cat) => {
      const meta = CATEGORY_METADATA[cat.id] || {};
      return {
        ...cat,
        badge: meta.badge,
        featured: meta.featured,
        featuredBrands: meta.featuredBrands,
        banner: meta.banner,
      };
    });

    return {
      categories,
      brands: INITIAL_BRANDS,
      quickLinks: DEFAULT_QUICK_LINKS,
      totalCategories: categories.length,
      version: '2.4.0',
      lastUpdated: new Date().toISOString(),
    };
  }

  private syncWithStoreProducts() {
    const products = store.getProducts();
    const updatedCategories = this.structure.categories.map((cat) => {
      const prodsInCat = products.filter((p) => p.categoryId === cat.id);
      const subcategories = cat.subcategories.map((sub) => {
        const prodsInSub = products.filter(
          (p) => p.categoryId === cat.id && p.subcategorySlug === sub.slug
        );
        return {
          ...sub,
          count: prodsInSub.length > 0 ? prodsInSub.length : sub.count,
        };
      });

      return {
        ...cat,
        productCount: prodsInCat.length > 0 ? prodsInCat.length : cat.productCount,
        subcategories,
      };
    });

    this.structure = {
      ...this.structure,
      categories: updatedCategories,
      lastUpdated: new Date().toISOString(),
    };

    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  /**
   * Returns current catalog structure synchronously
   */
  public getCatalogStructure(): CatalogStructureConfig {
    if (!this.hasInitialized && typeof window !== 'undefined') {
      this.hasInitialized = true;
      // Trigger background fetch from backend
      this.fetchCatalogStructure().catch(() => {
        // Fallback is already loaded
      });
    }
    return this.structure;
  }

  /**
   * Fetches latest externalized catalog structure from the backend REST API
   */
  public async fetchCatalogStructure(): Promise<CatalogStructureConfig> {
    if (this.isFetching) return this.structure;
    this.isFetching = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch('/api/catalog/structure', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.categories)) {
          // Merge metadata
          const categories: Category[] = json.categories.map((cat: Category) => {
            const meta = CATEGORY_METADATA[cat.id] || {};
            return {
              ...cat,
              badge: cat.badge || meta.badge,
              featured: cat.featured ?? meta.featured,
              featuredBrands: cat.featuredBrands || meta.featuredBrands,
              banner: cat.banner || meta.banner,
            };
          });

          const quickLinks: MegaMenuQuickLink[] = Array.isArray(json.quickLinks) && json.quickLinks.length > 0
            ? json.quickLinks
            : DEFAULT_QUICK_LINKS;

          this.structure = {
            categories,
            brands: Array.isArray(json.brands) ? json.brands : INITIAL_BRANDS,
            quickLinks,
            featuredSections: json.featuredSections,
            totalCategories: categories.length,
            version: json.version || '2.4.0',
            lastUpdated: json.timestamp || new Date().toISOString(),
          };

          this.notify();
          return this.structure;
        }
      }
    } catch {
      // Backend request fallback gracefully handled via store-derived structure
    } finally {
      this.isFetching = false;
    }

    return this.structure;
  }

  public getCategories(): Category[] {
    return this.getCatalogStructure().categories;
  }

  public getCategoryById(id: string): Category | undefined {
    return this.getCatalogStructure().categories.find((c) => c.id === id);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.getCatalogStructure().categories.find((c) => c.slug === slug);
  }

  public getQuickLinks(): MegaMenuQuickLink[] {
    return this.getCatalogStructure().quickLinks;
  }

  public getBrandsForCategory(categoryId: string): Brand[] {
    const cat = this.getCategoryById(categoryId);
    const allBrands = this.getCatalogStructure().brands;

    if (cat?.featuredBrands && cat.featuredBrands.length > 0) {
      const featured = allBrands.filter((b) => cat.featuredBrands!.includes(b.id));
      if (featured.length > 0) return featured;
    }

    return allBrands.slice(0, 8);
  }
}

export const catalogService = new CatalogConfigurationService();
