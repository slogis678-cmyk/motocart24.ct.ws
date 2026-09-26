import React from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  Printer,
  FileText,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { store } from '../services/store';

interface OrderConfirmationViewProps {
  orderId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  orderId,
  onNavigate,
}) => {
  const order = store.getOrderById(orderId);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Nie odnaleziono zamówienia</h2>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
        >
          Wróć do sklepu
        </button>
      </div>
    );
  }

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Top Success Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Zamówienie przyjęte do realizacji
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white font-['Cabinet_Grotesk'] mt-1">
            Dziękujemy za zakupy w MOTOCAR24!
          </h1>
          <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
            Potwierdzenie wraz z podsumowaniem zostało wysłane na adres:{' '}
            <strong className="text-white">{order.customerEmail}</strong>.
          </p>
        </div>

        <div className="inline-flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
          <span>Nr zamówienia: <strong className="text-rose-400">{order.orderNumber}</strong></span>
          <span>·</span>
          <span>Faktura: <strong className="text-slate-100">{order.invoiceNumber}</strong></span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Shipping details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-rose-500" />
            Szczegóły dostawy
          </h3>
          <div className="space-y-1 text-slate-300">
            <p><strong>Metoda:</strong> {order.shippingMethodName}</p>
            <p><strong>Odbiorca:</strong> {order.customerName}</p>
            <p><strong>Adres:</strong> {order.shippingAddress.street}, {order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
            <p><strong>Telefon:</strong> {order.customerPhone}</p>
            {order.trackingNumber && (
              <p className="pt-2 text-slate-400">
                Nr przesyłki: <span className="font-mono text-slate-200">{order.trackingNumber}</span> ({order.trackingCarrier})
              </p>
            )}
          </div>
        </div>

        {/* Payment & Invoice details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            Płatność i rozliczenie
          </h3>
          <div className="space-y-1 text-slate-300">
            <p><strong>Forma płatności:</strong> {order.paymentMethodName}</p>
            <p><strong>Status płatności:</strong> <span className="text-emerald-400 font-bold">{order.paymentStatus}</span></p>
            <p><strong>Łączna kwota brutto:</strong> <span className="font-bold text-white font-mono text-sm">{order.totalGross.toFixed(2)} zł</span></p>
            {order.billingAddress && (
              <p className="pt-2 text-slate-400">
                Faktura na: {order.billingAddress.companyName} (NIP: {order.billingAddress.nip})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Order list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">
          Zamówione pozycje ({order.items.length})
        </h3>

        <div className="divide-y divide-slate-800">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-12 rounded object-contain bg-slate-950 border border-slate-800 p-1"
                />
                <div>
                  <p className="font-semibold text-slate-100">{item.name}</p>
                  <p className="text-slate-400 text-[11px]">
                    Kod: {item.manufacturerCode} · Ilość: {item.quantity} szt.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-white font-mono">{item.totalGross.toFixed(2)} zł</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          onClick={handlePrintInvoice}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Drukuj potwierdzenie / Fakturę</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('panel-klienta', 'orders')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Przejdź do moich zamówień
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow flex items-center justify-center gap-1.5"
          >
            <span>Kontynuuj zakupy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
