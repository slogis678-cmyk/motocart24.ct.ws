import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Product } from '../types';
import { store } from '../services/store';

interface AskProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const AskProductModal: React.FC<AskProductModalProps> = ({ product, isOpen, onClose }) => {
  const currentUser = store.getCurrentUser();
  const activeVehicle = store.getActiveVehicle();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [vin, setVin] = useState('');
  const [message, setMessage] = useState(
    activeVehicle
      ? `Dzień dobry, proszę o potwierdzenie dopasowania tej części do mojego pojazdu: ${activeVehicle.brand} ${activeVehicle.model} (${activeVehicle.engine}).`
      : 'Dzień dobry, mam pytanie odnośnie kompatybilności i dostępności tej części:'
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-500">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Zapytaj doradcę technicznego</h3>
              <p className="text-xs text-slate-400">Nasi eksperci odpowiedzą w ciągu 15 minut</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product summary strip */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-12 h-12 rounded object-contain bg-slate-900 border border-slate-800 shrink-0"
          />
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-bold text-slate-200 truncate">{product.name}</p>
            <p className="text-slate-400">
              Kod: <span className="font-mono text-slate-300">{product.manufacturerCode}</span> · OE: {product.oeNumbers[0]}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Wiadomość została wysłana!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Doradca techniczny MOTOCAR24 zweryfikuje zgodność katalogową i skontaktuje się z Tobą telefonicznie lub mailowo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Imię i nazwisko</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. Piotr Nowak"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefon kontaktowy</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="np. +48 500 000 000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Adres e-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="np. klient@domena.pl"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Numer VIN (opcjonalnie do 100% pewności)
                  </label>
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    maxLength={17}
                    placeholder="17 znaków VIN"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Treść Twojego pytania</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/30"
              >
                <Send className="w-4 h-4" />
                <span>Wyślij zapytanie do eksperta</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
