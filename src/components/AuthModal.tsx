import React, { useState } from 'react';
import { X, Mail, Lock, User, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { store } from '../services/store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [nip, setNip] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Podaj adres email oraz hasło.');
      return;
    }

    // Authenticate or fallback
    const user = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? ('ADMIN' as const) : ('CUSTOMER' as const),
      createdAt: new Date().toISOString(),
    };
    store.setCurrentUser(user);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !name) {
      setError('Uzupełnij wszystkie wymagane pola (Imię, Email, Hasło).');
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      companyName: companyName || undefined,
      nip: nip || undefined,
      role: 'CUSTOMER' as const,
      createdAt: new Date().toISOString(),
    };
    store.setCurrentUser(newUser);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleGoogleLogin = () => {
    // Interactive Google Auth simulation with real session creation
    const googleUser = {
      id: 'user-google-oauth-9812',
      email: 'jan.kowalski.demo@gmail.com',
      name: 'Jan Kowalski (Google)',
      role: 'CUSTOMER' as const,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
      createdAt: new Date().toISOString(),
    };
    store.setCurrentUser(googleUser);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Wpisz swój adres email.');
      return;
    }
    setSuccessMsg('Wysłaliśmy link do zresetowania hasła na podany adres e-mail.');
    setTimeout(() => {
      setMode('LOGIN');
      setSuccessMsg(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="font-bold text-base text-white">
              {mode === 'LOGIN' && 'Logowanie do MOTOCAR24'}
              {mode === 'REGISTER' && 'Utwórz konto klienta'}
              {mode === 'FORGOT' && 'Zresetuj hasło'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'LOGIN' && 'Zaloguj się, aby mieć dostęp do historii zamówień i garażu'}
              {mode === 'REGISTER' && 'Zarejestruj się jako klient indywidualny lub warsztat'}
              {mode === 'FORGOT' && 'Podaj swój adres e-mail, aby odzyskać dostęp'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Quick Google Sign In */}
          {mode !== 'FORGOT' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-3 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Kontynuuj przez Google</span>
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[10px] uppercase font-bold text-slate-500">lub przez e-mail</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adres e-mail</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="np. klient@motocar24.pl"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Hasło</label>
                  <button
                    type="button"
                    onClick={() => setMode('FORGOT')}
                    className="text-[11px] text-rose-400 hover:text-rose-300"
                  >
                    Nie pamiętasz hasła?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-600/30"
              >
                Zaloguj się
              </button>

              {/* Demo auto-fill */}
              <div className="pt-2 text-[11px] text-slate-400 text-center">
                Szybkie logowanie testowe:{' '}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@motocar24.pl');
                    setPassword('admin123');
                  }}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Admin
                </button>{' '}
                ·{' '}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('klient@motocar24.pl');
                    setPassword('klient123');
                  }}
                  className="text-rose-400 hover:underline font-semibold"
                >
                  Klient
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Imię i nazwisko</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jan Kowalski"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adres e-mail</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jan.kowalski@firma.pl"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hasło</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 znaków"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* B2B / Company fields (optional) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nazwa firmy (B2B)</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Opcjonalnie"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">NIP (do faktury)</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="np. 5252819234"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-600/30"
              >
                Zarejestruj konto
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'FORGOT' && (
            <form onSubmit={handleForgot} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Twój adres e-mail</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="podany podczas rejestracji"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Wyślij instrukcję resetowania
              </button>

              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Wróć do logowania
              </button>
            </form>
          )}

          {/* Switch mode links */}
          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            {mode === 'LOGIN' && (
              <p>
                Nie masz jeszcze konta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('REGISTER')}
                  className="font-bold text-rose-400 hover:text-rose-300"
                >
                  Zarejestruj się
                </button>
              </p>
            )}
            {mode === 'REGISTER' && (
              <p>
                Masz już konto?{' '}
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="font-bold text-rose-400 hover:text-rose-300"
                >
                  Zaloguj się
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
