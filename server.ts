import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SYNC_LOGS,
  INITIAL_USERS,
  INITIAL_VEHICLES,
} from './src/data/mockDatabase';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // In-memory server state
  let serverProducts = [...INITIAL_PRODUCTS];
  let serverOrders = [...INITIAL_ORDERS];
  let serverSyncLogs = [...INITIAL_SYNC_LOGS];
  let serverBaseConfig = {
    apiKey: process.env.BASE_API_KEY || 'bc_live_99a8b7762c194e8a_secret',
    apiUrl: process.env.BASE_API_URL || 'https://api.base.com/v1',
    inventoryId: process.env.BASE_INVENTORY_ID || 'inv-magazyn-centralny-49210',
    status: 'CONNECTED',
    lastSync: '2026-09-26T00:02:45Z',
    syncedCount: 25201,
    errorCount: 229,
  };

  // --- HEALTH CHECK ---
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ONLINE',
      system: 'MOTOCAR24 E-Commerce Engine',
      version: '2.4.0-enterprise',
      database: 'ONLINE',
      baseCom: serverBaseConfig.status === 'CONNECTED' ? 'ONLINE' : 'DISCONNECTED',
      timestamp: new Date().toISOString(),
    });
  });

  // --- CATEGORIES & BRANDS ---
  app.get('/api/categories', (req, res) => {
    res.json({ success: true, data: INITIAL_CATEGORIES });
  });

  app.get('/api/catalog/structure', (req, res) => {
    const CATEGORY_META: Record<string, any> = {
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

    const dynamicCategories = INITIAL_CATEGORIES.map((cat) => {
      const prodsInCat = serverProducts.filter((p) => p.categoryId === cat.id);
      const meta = CATEGORY_META[cat.id] || {};
      return {
        ...cat,
        badge: meta.badge,
        featured: meta.featured,
        featuredBrands: meta.featuredBrands,
        banner: meta.banner,
        productCount: prodsInCat.length > 0 ? prodsInCat.length : cat.productCount,
        subcategories: cat.subcategories.map((sub) => {
          const prodsInSub = serverProducts.filter(
            (p) => p.categoryId === cat.id && p.subcategorySlug === sub.slug
          );
          return {
            ...sub,
            count: prodsInSub.length > 0 ? prodsInSub.length : sub.count,
          };
        }),
      };
    });

    const quickLinks = [
      { id: 'ql-tires', label: 'Wyszukiwarka opon', type: 'view', target: 'tires', isHighlight: true, badge: 'Konfigurator', iconName: 'Disc' },
      { id: 'ql-hamulce', label: 'Hamulce', type: 'category', target: 'category=cat-hamulce', badge: 'Bestseller' },
      { id: 'ql-filtry', label: 'Filtry', type: 'category', target: 'category=cat-filtry' },
      { id: 'ql-oleje', label: 'Oleje i płyny', type: 'category', target: 'category=cat-oleje', badge: 'Promocja' },
      { id: 'ql-silnik', label: 'Silnik & Rozrząd', type: 'category', target: 'category=cat-silnik' },
      { id: 'ql-zawieszenie', label: 'Zawieszenie', type: 'category', target: 'category=cat-zawieszenie' },
      { id: 'ql-elektryka', label: 'Elektryka & Akumulatory', type: 'category', target: 'category=cat-elektryka' },
      { id: 'ql-wycieraczki', label: 'Wycieraczki', type: 'category', target: 'category=cat-wycieraczki' },
    ];

    res.json({
      success: true,
      categories: dynamicCategories,
      brands: INITIAL_BRANDS,
      quickLinks,
      totalCategories: dynamicCategories.length,
      version: '2.4.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/brands', (req, res) => {
    res.json({ success: true, data: INITIAL_BRANDS });
  });

  // --- VEHICLES ---
  app.get('/api/vehicles', (req, res) => {
    const { brand, model } = req.query;
    let list = [...INITIAL_VEHICLES];
    if (brand) list = list.filter((v) => v.brand.toLowerCase() === String(brand).toLowerCase());
    if (model) list = list.filter((v) => v.model.toLowerCase() === String(model).toLowerCase());
    res.json({ success: true, data: list });
  });

  app.get('/api/vehicles/vin-decode', (req, res) => {
    const { vin } = req.query;
    const str = String(vin || '').toUpperCase().trim();
    const matched = INITIAL_VEHICLES.find((v) => v.vinPrefix && str.startsWith(v.vinPrefix));
    if (matched) {
      res.json({ success: true, vehicle: matched });
    } else {
      res.json({
        success: false,
        message: 'Nie rozpoznano dokładnego silnika po VIN. Wybierz markę i model ręcznie.',
      });
    }
  });

  // --- PRODUCTS ---
  app.get('/api/products', (req, res) => {
    const { category, subcategory, brand, vehicleId, query, sort, limit = 50, page = 1 } = req.query;
    let list = [...serverProducts];

    if (query) {
      const q = String(query).toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.ean.includes(q) ||
          p.manufacturerCode.toLowerCase().includes(q) ||
          p.oeNumbers.some((oe) => oe.toLowerCase().replace(/[\s.-]/g, '').includes(q.replace(/[\s.-]/g, ''))) ||
          p.brandName.toLowerCase().includes(q)
      );
    }

    if (category) {
      list = list.filter((p) => p.categoryId === category || p.categoryName.toLowerCase() === String(category).toLowerCase());
    }

    if (subcategory) {
      list = list.filter((p) => p.subcategorySlug === subcategory);
    }

    if (brand) {
      list = list.filter((p) => p.brandId === brand || p.brandName.toLowerCase() === String(brand).toLowerCase());
    }

    if (vehicleId) {
      list = list.filter((p) => p.compatibility.some((c) => c.vehicleId === vehicleId));
    }

    // Sort
    if (sort === 'price_asc') list.sort((a, b) => a.priceGross - b.priceGross);
    else if (sort === 'price_desc') list.sort((a, b) => b.priceGross - a.priceGross);
    else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));

    const total = list.length;
    const l = Number(limit);
    const p = Number(page);
    const paginated = list.slice((p - 1) * l, p * l);

    res.json({
      success: true,
      total,
      page: p,
      limit: l,
      data: paginated,
    });
  });

  app.get('/api/products/:id', (req, res) => {
    const product = serverProducts.find((p) => p.id === req.params.id || p.slug === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produkt nie został znaleziony.' });
    }
    res.json({ success: true, data: product });
  });

  // --- TIRE SEARCH ---
  app.get('/api/tires/search', (req, res) => {
    const { width, profile, diameter, season, runFlat } = req.query;
    let list = serverProducts.filter((p) => p.categoryId === 'cat-opony' && p.tireSpec);

    if (width) list = list.filter((p) => p.tireSpec?.width === Number(width));
    if (profile) list = list.filter((p) => p.tireSpec?.profile === Number(profile));
    if (diameter) list = list.filter((p) => p.tireSpec?.diameter === Number(diameter));
    if (season && season !== 'ALL') list = list.filter((p) => p.tireSpec?.season === season);
    if (runFlat === 'true') list = list.filter((p) => p.tireSpec?.isRunFlat);

    res.json({ success: true, count: list.length, data: list });
  });

  // --- SEARCH AUTOCOMPLETE ---
  app.get('/api/search/suggestions', (req, res) => {
    const q = String(req.query.q || '').toLowerCase().trim();
    if (!q || q.length < 2) {
      return res.json({ products: [], categories: [], brands: [] });
    }

    const matchedProducts = serverProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.oeNumbers.some((oe) => oe.toLowerCase().includes(q)))
      .slice(0, 5);

    const matchedCategories = INITIAL_CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3);
    const matchedBrands = INITIAL_BRANDS.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 3);

    res.json({
      products: matchedProducts,
      categories: matchedCategories,
      brands: matchedBrands,
    });
  });

  // --- ORDERS ---
  app.get('/api/orders', (req, res) => {
    res.json({ success: true, count: serverOrders.length, data: serverOrders });
  });

  app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    const newOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `M24/2026/09/${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'NOWE',
      paymentStatus: orderData.paymentMethod === 'COD' ? 'PŁATNOŚĆ_PRZY_ODBIORZE' : 'OPŁACONE',
      invoiceNumber: `FV/M24/2026/09/${Math.floor(1000 + Math.random() * 9000)}`,
      baseComOrderId: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    serverOrders.unshift(newOrder);
    res.status(201).json({ success: true, data: newOrder });
  });

  // --- BASE.COM INTEGRATION ---
  app.get('/api/base/status', (req, res) => {
    res.json({
      connected: serverBaseConfig.status === 'CONNECTED',
      config: {
        apiUrl: serverBaseConfig.apiUrl,
        inventoryId: serverBaseConfig.inventoryId,
        apiKeyMasked: 'bc_live_***_secret',
      },
      lastSync: serverBaseConfig.lastSync,
      syncedCount: serverBaseConfig.syncedCount,
      errorCount: serverBaseConfig.errorCount,
    });
  });

  app.post('/api/base/sync', (req, res) => {
    const { action } = req.body;
    const log = {
      id: `sync-${Date.now()}`,
      jobId: `SYNC #${Math.floor(1240 + Math.random() * 50)}`,
      action: action || 'FULL_SYNC',
      status: 'SUCCESS',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      totalItems: 25430,
      successItems: 25201,
      failedItems: 229,
      durationSeconds: 12,
      details: `Wykonano synchronizację Base.com (${action}). Zaktualizowano stany i ceny.`,
    };
    serverSyncLogs.unshift(log as any);
    serverBaseConfig.lastSync = new Date().toISOString();
    res.json({ success: true, log });
  });

  app.post('/api/base/webhook', (req, res) => {
    console.log('[Base.com Webhook received]:', req.body);
    res.json({ success: true, received: true, timestamp: new Date().toISOString() });
  });

  // --- SEO SITEMAP & ROBOTS ---
  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'text/xml');
    const urls = [
      'https://motocar24.pl/',
      ...INITIAL_CATEGORIES.map((c) => `https://motocar24.pl/kategoria/${c.slug}`),
      ...serverProducts.map((p) => `https://motocar24.pl/produkt/${p.slug}`),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>`;
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /panel-klienta
Disallow: /koszyk
Sitemap: https://motocar24.pl/sitemap.xml
`);
  });

  // Mount Vite middleware in development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MOTOCAR24 Enterprise Engine listening on port ${PORT}`);
  });
}

startServer();
