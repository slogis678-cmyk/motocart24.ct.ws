# MOTOCAR24 - Profesjonalny Sklep Internetowy z Częściami i Akcesoriami Motoryzacyjnymi

Nowoczesna, skalowalna platforma e-commerce klasy Enterprise dla branży motoryzacyjnej, wyposażona w zaawansowaną wyszukiwarkę po numerach OE, EAN i VIN, dedykowany konfigurator opon, moduł doboru części do pojazdu oraz dwukierunkową integrację z systemem **Base.com (Baselinker)**.

---

## 1. Architektura Systemu

### Ogólny przepływ danych:
```
[ KLIENT / PRZEGLĄDARKA / MOBILE ]
               │
               ▼  (HTTPS / REST / WebSocket)
   ┌───────────────────────┐
   │    Vite + React SPA   │ ◄─── (Tailwind CSS, Zero-Pill, SSR/SPA Ready)
   └───────────┬───────────┘
               │
               ▼  (/api/*)
   ┌───────────────────────┐
   │  Express API Engine   │ ◄─── (server.ts, Middlewares, Walidacja, Auth)
   └───────────┬───────────┘
               │
               ├──► [ Relacyjna Baza Danych / Magazyn Stanów ]
               │     (Produkty, Numery OE, Pojazdy, Zamówienia, Klienci)
               │
               └──► [ Base.com Sync Engine (Baselinker API) ]
                     (Kolejka synchronizacji, webhooki, cenniki, stany)
```

### Przepływ synchronizacji Base.com:
```
[ PANEL ADMINISTRATORA ]
          │
          ▼
┌──────────────────┐       Pobieranie / Wysyłanie
│   SYNC ENGINE    │ ◄──────────────────────────────► [ BASE.COM REST API ]
└─────────┬────────┘    (Rate Limiting, Retries)        (Magazyn Centralny)
          │
          ├──► Zmiany stanów magazynowych (Inventory)
          ├──► Aktualizacja cen brutto/netto i stawek VAT
          ├──► Eksport zamówień ze sklepu do Base.com
          └──► Import statusów paczek i numerów przesyłek (DPD / InPost)
```

---

## 2. Główne Moduły i Funkcjonalności

1. **Wyszukiwarka Uniwersalna & Baza OE**:
   - Wyszukiwanie po nazwie, producencie, numerze katalogowym producenta, kodzie EAN, indeksie SKU oraz numerach oryginalnych OE (np. `34116792223`, `5Q0615301H`).
   - Autocomplete z podglądem produktów, powiązanych kategorii i marek oraz historią ostatnich zapytań.
   - Odporność na formatowanie (spacje, kropki, myślniki).

2. **Moduł "Dobierz część do auta" & Dekoder VIN**:
   - 4-stopniowy selektor: Marka -> Model -> Generacja/Lata -> Silnik i moc (KM/kW).
   - Dekoder VIN (weryfikacja prefiksu nadwozia np. `WBA3D...`, `WVWZZZAU...`).
   - Tryb "Gwarancja dopasowania" – dynamiczne oznaczanie produktów zielonym znacznikiem zgodności lub ostrzeżeniem o braku pewności dopasowania.

3. **Wyszukiwarka Opon**:
   - Dobór według wymiarów: Szerokość (155-315), Profil (30-85), Średnica (13"-22"), Sezon (Letnie, Zimowe, Całoroczne).
   - Filtrowanie po unijnych etykietach energetycznych (EU Tyre Label): opory toczenia, przyczepność na mokrej nawierzchni, hałas w dB, homologacje (Run-Flat, XL, 3PMSF).

4. **Karta Produktu (PDP)**:
   - Zdjęcia studyjne, ceny brutto/netto z 23% VAT, statusy magazynowe ("W magazynie", "Ostatnie sztuki", "Na zamówienie").
   - Tabela parametrów technicznych i wymiarów.
   - Lista oryginalnych numerów OE oraz cross-referencje zamienników (Brembo, ATE, TRW, Bosch, Valeo).
   - Spis kompatybilnych modeli aut wraz z kodami silników.
   - Pobieranie oficjalnej dokumentacji technicznej PDF.
   - Moduł "Zapytaj doradcę technicznego o część".

5. **Koszyk i Ścieżka Zakupowa (Checkout)**:
   - Automatyczne przeliczanie kwot netto, VAT i brutto.
   - Pasek postępu do darmowej dostawy (próg 250 zł).
   - Kody rabatowe (np. `MOTO10`, `START2026`).
   - Metody dostawy: Paczkomaty InPost 24/7, Kurier DPD, Odbiór osobisty.
   - Metody płatności: BLIK (z weryfikacją kodu), PayU, Karta, Płatność przy odbiorze.
   - Obsługa zamówień B2B z NIP i danymi do Faktury VAT.

6. **Panel Klienta**:
   - Witaj, [Imię] Dashboard.
   - Moje zamówienia (historia, statusy, tracking przesyłek kurierskich).
   - "Mój Garaż" (zapisywanie wielu pojazdów, szybkie przełączanie aktywnego auta).
   - Ulubione części (Wishlist).
   - Adresy doręczeń i dane firmowe.
   - Faktury VAT (podgląd i wydruk).
   - Moduł zwrotów i reklamacji RMA (30 dni na zwrot).

7. **Panel Administratora**:
   - System Monitoring: Backend, Database, Base.com, Wyszukiwarka, Email.
   - Dashboard KPI (obrót, zamówienia, niskie stany magazynowe).
   - Zarządzanie produktami (dodawanie, edycja, usuwanie, zmiana cen i stanów).
   - Masowy import produktów (format JSON / CSV).
   - Zarządzanie zamówieniami i zmiana statusów.
   - Centrum Integracji Base.com: przyciski synchronizacji, logi zadań, raporty błędów.
   - Generator sitemap.xml, robots.txt i struktura danych Schema.org.

---

## 3. Instrukcja Uruchomienia i Konfiguracji

### Wymagania wstępne:
- Node.js w wersji 20+
- Menedżer pakietów npm

### Uruchomienie w środowisku deweloperskim:
```bash
# 1. Instalacja zależności
npm install

# 2. Uruchomienie serwera full-stack (Express + Vite) na porcie 3000
npm run dev
```

Aplikacja dostępna jest pod adresem: `http://localhost:3000`.

### Budowanie produkcyjne:
```bash
# Zbudowanie zoptymalizowanego frontendu
npm run build

# Uruchomienie serwera produkcyjnego
npm start
```

---

## 4. Konfiguracja Zmiennych Środowiskowych (.env)

Skopiuj plik `.env.example` do `.env` i uzupełnij klucze:
```env
# Port aplikacji (domyślnie 3000)
PORT=3000

# Base.com (Baselinker) API Credentials
BASE_API_KEY="twój_tajny_token_api_base_com"
BASE_API_URL="https://api.base.com/v1"
BASE_INVENTORY_ID="inv-magazyn-centralny-49210"

# Opcjonalne klucze operatorów płatności
PAYU_POS_ID=""
PAYU_MD5_KEY=""
PAYU_CLIENT_SECRET=""

# Przewoźnicy kurierscy
INPOST_API_TOKEN=""
DPD_LOGIN=""
DPD_PASSWORD=""

# Google OAuth (Logowanie)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 5. Integracja z Base.com (Baselinker)

Sklep komunikuje się z oficjalnym API Base.com za pośrednictwem dedykowanego silnika synchronizacji w `server.ts` oraz `src/services/store.ts`.

Obsługiwane operacje:
- `IMPORT_PRODUCTS`: Pobieranie nowych kartotek produktowych z magazynu Base.com.
- `EXPORT_PRODUCTS`: Wystawianie produktów ze sklepu do katalogu Base.com.
- `SYNC_PRICES`: Aktualizacja cenników hurtowych i detalicznych.
- `SYNC_STOCKS`: Natychmiastowa synchronizacja ilości dostępnych w magazynie centralnym.
- `SYNC_ORDERS`: Przesyłanie nowych zamówień do Base.com oraz pobieranie numerów listów przewozowych.
- `WEBHOOKS`: Odbiór zdarzeń w czasie rzeczywistym pod adresem `/api/base/webhook`.

---

## 6. Architektura Rozszerzeń (Roadmap)

System został zaprojektowany modułowo. Dodanie kolejnych integracji odbywa się bez ingerencji w warstwę prezentacji:
- **TecDoc / TecAlliance**: Podpięcie oficjalnej bazy KType i numerów OE.
- **Inter Cars API / Moto-Profil API**: Dodanie adaptera hurtowni w warstwie dostawców.
- **Allegro REST API / Ceneo**: Dedykowane moduły eksportu ofert i integracji zamówień.
- **Dropshipping**: Automatyczne kierowanie zleceń do magazynów zewnętrznych.
