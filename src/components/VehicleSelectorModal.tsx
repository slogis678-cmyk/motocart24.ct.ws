import React, { useState } from 'react';
import { X, Car, Check, Search, AlertCircle, Sparkles, Plus, Trash2 } from 'lucide-react';
import { store } from '../services/store';
import { Vehicle } from '../types';

interface VehicleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleSelected?: (vehicle: Vehicle) => void;
}

export const VehicleSelectorModal: React.FC<VehicleSelectorModalProps> = ({
  isOpen,
  onClose,
  onVehicleSelected,
}) => {
  const vehicles = store.getVehicles();
  const userVehicles = store.getUserVehicles();
  const activeVehicle = store.getActiveVehicle();

  const [activeTab, setActiveTab] = useState<'SELECT' | 'VIN' | 'GARAGE'>('SELECT');

  // Step state for manual vehicle selection
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedGeneration, setSelectedGeneration] = useState<string>('');
  const [selectedEngineId, setSelectedEngineId] = useState<string>('');

  // VIN state
  const [vinInput, setVinInput] = useState<string>('');
  const [vinError, setVinError] = useState<string | null>(null);

  // Nickname/plate for saving
  const [saveToGarage, setSaveToGarage] = useState(true);
  const [licensePlate, setLicensePlate] = useState('');
  const [nickname, setNickname] = useState('');

  if (!isOpen) return null;

  // Extraction of unique lists for step dropdowns
  const availableBrands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();

  const availableModels = selectedBrand
    ? Array.from(new Set(vehicles.filter((v) => v.brand === selectedBrand).map((v) => v.model))).sort()
    : [];

  const availableGenerations = selectedBrand && selectedModel
    ? Array.from(
        new Set(
          vehicles
            .filter((v) => v.brand === selectedBrand && v.model === selectedModel)
            .map((v) => v.generation)
        )
      )
    : [];

  const availableEngines = selectedBrand && selectedModel && selectedGeneration
    ? vehicles.filter(
        (v) =>
          v.brand === selectedBrand &&
          v.model === selectedModel &&
          v.generation === selectedGeneration
      )
    : [];

  const handleSelectEngine = (veh: Vehicle) => {
    if (saveToGarage) {
      store.addUserVehicle(veh, nickname || undefined, licensePlate || undefined);
    } else {
      store.setActiveVehicle(veh);
    }
    if (onVehicleSelected) onVehicleSelected(veh);
    onClose();
  };

  const handleVinSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setVinError(null);
    const cleanVin = vinInput.trim().toUpperCase();
    if (cleanVin.length < 5) {
      setVinError('Podaj prawidłowy numer VIN (minimum 5 znaków).');
      return;
    }

    const matched = vehicles.find((v) => v.vinPrefix && cleanVin.startsWith(v.vinPrefix));
    if (matched) {
      handleSelectEngine(matched);
    } else {
      setVinError(
        'Podaj dodatkowe informacje o pojeździe, aby zwiększyć dokładność dopasowania. Wybierz wersję z listy poniżej.'
      );
    }
  };

  const handleSelectFromGarage = (veh: Vehicle) => {
    store.setActiveVehicle(veh);
    if (onVehicleSelected) onVehicleSelected(veh);
    onClose();
  };

  const handleClearActiveVehicle = () => {
    store.setActiveVehicle(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Znajdź część do swojego samochodu</h3>
              <p className="text-xs text-slate-400">
                Wybierz parametry auta, aby zobaczyć tylko w 100% kompatybilne części
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Car notification if exists */}
        {activeVehicle && (
          <div className="bg-emerald-950/40 border-b border-emerald-900/40 px-5 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                Aktualnie wybrane: <strong>{activeVehicle.brand} {activeVehicle.model}</strong> ({activeVehicle.engine})
              </span>
            </div>
            <button
              onClick={handleClearActiveVehicle}
              className="text-slate-400 hover:text-rose-400 text-[11px] underline"
            >
              Usuń filtr pojazdu
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('SELECT')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
              activeTab === 'SELECT'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Wybór z katalogu (Marka, Model, Silnik)
          </button>
          <button
            onClick={() => setActiveTab('VIN')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
              activeTab === 'VIN'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Szukaj po VIN
          </button>
          <button
            onClick={() => setActiveTab('GARAGE')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
              activeTab === 'GARAGE'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Mój garaż ({userVehicles.length})
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'SELECT' && (
            <div className="space-y-4">
              {/* Step 1: Marka */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  1. Marka pojazdu
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedModel('');
                    setSelectedGeneration('');
                    setSelectedEngineId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Wybierz markę samochodu --</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Model */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  2. Model
                </label>
                <select
                  value={selectedModel}
                  disabled={!selectedBrand}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedGeneration('');
                    setSelectedEngineId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 disabled:opacity-40 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Wybierz model --</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Generacja / Rok */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  3. Generacja i lata produkcji
                </label>
                <select
                  value={selectedGeneration}
                  disabled={!selectedModel}
                  onChange={(e) => {
                    setSelectedGeneration(e.target.value);
                    setSelectedEngineId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 disabled:opacity-40 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Wybierz generację --</option>
                  {availableGenerations.map((gen) => (
                    <option key={gen} value={gen}>
                      {gen}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Silnik */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  4. Wersja silnikowa i moc
                </label>
                <div className="space-y-2">
                  {availableEngines.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      Wybierz powyższe pola, aby wyświetlić dostępne kody silników.
                    </p>
                  ) : (
                    availableEngines.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => handleSelectEngine(v)}
                        className="p-3 bg-slate-950 border border-slate-800 hover:border-rose-500/80 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
                            {v.engine}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Pojemność: {v.displacement} · Paliwo: {v.fuelType} · Nadwozie: {v.bodyType}
                          </p>
                        </div>
                        <button className="px-3 py-1.5 bg-rose-600 group-hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shrink-0">
                          Wybierz
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Save checkbox */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveGarage"
                  checked={saveToGarage}
                  onChange={(e) => setSaveToGarage(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="saveGarage" className="text-xs text-slate-300 cursor-pointer">
                  Zapisz ten samochód w moim profilu (Mój Garaż)
                </label>
              </div>
            </div>
          )}

          {activeTab === 'VIN' && (
            <div className="space-y-4">
              <form onSubmit={handleVinSearch} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Numer nadwozia VIN (17 znaków)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vinInput}
                      onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                      placeholder="np. WBA3D... lub WVWZZZAU..."
                      maxLength={17}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 uppercase font-mono tracking-wider focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                    >
                      Dekoduj VIN
                    </button>
                  </div>
                </div>
              </form>

              {vinError && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>{vinError}</p>
                </div>
              )}

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-400">
                <p className="font-semibold text-slate-300">Przykładowe prefiksy VIN w bazie demo:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setVinInput('WBA3D51000F123456')}
                    className="px-2 py-1 bg-slate-800 rounded font-mono text-slate-200 text-[11px] hover:bg-slate-700"
                  >
                    WBA3D... (BMW 320d F30)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVinInput('WVWZZZAU1EP123456')}
                    className="px-2 py-1 bg-slate-800 rounded font-mono text-slate-200 text-[11px] hover:bg-slate-700"
                  >
                    WVWZZZAU... (VW Golf VII)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVinInput('WAUZZZF45HA123456')}
                    className="px-2 py-1 bg-slate-800 rounded font-mono text-slate-200 text-[11px] hover:bg-slate-700"
                  >
                    WAUZZZF4... (Audi A4 B9)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'GARAGE' && (
            <div className="space-y-3">
              {userVehicles.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Car className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p>Twój garaż jest jeszcze pusty.</p>
                  <p className="mt-1 text-slate-500">
                    Wybierz auto w zakładce 1, aby zapisać je na stałe w swoim profilu.
                  </p>
                </div>
              ) : (
                userVehicles.map((uv) => {
                  const isCurrent = activeVehicle?.id === uv.vehicle.id;
                  return (
                    <div
                      key={uv.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-rose-950/30 border-rose-600/60'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">
                            {uv.vehicle.brand} {uv.vehicle.model}
                          </span>
                          {uv.nickname && (
                            <span className="text-[11px] text-slate-400">({uv.nickname})</span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded">
                              AKTYWNY
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {uv.vehicle.engine} · {uv.vehicle.generation}
                        </p>
                        {uv.licensePlate && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">
                            Rej: {uv.licensePlate}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCurrent && (
                          <button
                            onClick={() => handleSelectFromGarage(uv.vehicle)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Wybierz
                          </button>
                        )}
                        <button
                          onClick={() => store.removeUserVehicle(uv.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                          title="Usuń z garażu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
