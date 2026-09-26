import React from 'react';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';
import { store } from '../services/store';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const categories = store.getCategories();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      {/* 4 Pillars Trust Row */}
      <div className="border-b border-slate-800/80 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-500 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Wysyłka w 24 godziny</h4>
              <p className="mt-1 text-slate-400 text-xs leading-relaxed">
                Zamówienia złożone do godziny 16:00 wysyłamy jeszcze tego samego dnia roboczego.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Gwarancja dopasowania</h4>
              <p className="mt-1 text-slate-400 text-xs leading-relaxed">
                Weryfikujemy zgodność każdej części z numerem VIN Twojego pojazdu.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-500 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30 dni na darmowy zwrot</h4>
              <p className="mt-1 text-slate-400 text-xs leading-relaxed">
                Brak ukrytych kosztów. Wygodny formularz zwrotów w panelu klienta.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-500 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Bezpieczne płatności</h4>
              <p className="mt-1 text-slate-400 text-xs leading-relaxed">
                Szybkie płatności BLIK, PayU, karty płatnicze oraz bezpieczna opcja za pobraniem.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-extrabold text-base">
                M
              </div>
              <span className="font-black text-xl text-white font-['Cabinet_Grotesk'] tracking-tight">
                MOTO<span className="text-rose-500">CAR</span>24
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Profesjonalny dystrybutor części samochodowych, opon, felg, olejów i chemii warsztatowej.
              Automatyczna integracja z systemem Base.com oraz bezpośrednie stany magazynowe wiodących europejskich producentów.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-500" />
                <span>Infolinia: +48 22 100 24 24 (Pn-Pt 8:00 - 18:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-500" />
                <span>Email: kontakt@motocar24.pl</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Centrala logistyczna: ul. Magazynowa 14, 05-800 Pruszków</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Popularne działy</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'category=cat-opony')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Opony samochodowe
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'category=cat-hamulce')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Tarcze i klocki hamulcowe
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'category=cat-filtry')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Filtry oleju i kabinowe
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'category=cat-oleje')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Oleje silnikowe 5W30 / 0W20
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'category=cat-silnik')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Zestawy rozrządu i pompy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'category=cat-zawieszenie')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Amortyzatory i wahacze
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Obsługa klienta</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('panel-klienta', 'orders')} className="hover:text-white transition-colors">
                  Śledzenie zamówienia
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('panel-klienta', 'garage')} className="hover:text-white transition-colors">
                  Mój garaż (Zapisane auta)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('panel-klienta', 'returns')} className="hover:text-white transition-colors">
                  Zwroty i reklamacje (RMA)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cart')} className="hover:text-white transition-colors">
                  Koszty i sposoby dostawy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tires')} className="hover:text-white transition-colors">
                  Dobór opon według rozmiaru
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-amber-400/90 hover:text-amber-300 transition-colors font-medium">
                  Status integracji Base.com
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Informacje prawne</h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white cursor-pointer">Regulamin sklepu MOTOCAR24</li>
              <li className="hover:text-white cursor-pointer">Polityka prywatności i RODO</li>
              <li className="hover:text-white cursor-pointer">Polityka plików cookies</li>
              <li className="hover:text-white cursor-pointer">Informacje dla warsztatów (B2B)</li>
              <li className="hover:text-white cursor-pointer">Dla dostawców i hurtowni</li>
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300">
                  Mapa strony (sitemap.xml)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment badges */}
      <div className="bg-slate-950/90 border-t border-slate-900 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} MOTOCAR24 Sp. z o.o. Wszelkie prawa zastrzeżone. NIP: 5252819234, REGON: 382910481.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 font-semibold">Płatności: BLIK · PayU · Visa · Mastercard · Pobranie</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-400 font-semibold">Dostawa: InPost Paczkomaty 24/7 · DPD Polska · Odbiór osobisty</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
