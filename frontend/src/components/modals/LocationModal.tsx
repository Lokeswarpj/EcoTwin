import React, { useEffect, useState } from 'react';
import { X, Check, MapPin, Globe, Radio } from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES, CITY_REGIONAL_MAP } from '../../i18n/translations';
import { fetchContext } from '../../services/api';
import { CityContext } from '../../types';

interface LocationModalProps {
  isOpen: boolean;
  selectedCity: string;
  selectedLanguage: LanguageCode;
  onSelectCity: (city: string) => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onClose: () => void;
}

interface CityOption {
  city: string;
  region: string;
  primaryLang: string;
  langCode: LanguageCode;
  defaultWeather: string;
  defaultAqi: number;
}

const CITIES: CityOption[] = [
  { city: 'Delhi', region: 'NCR / Northern Grid', primaryLang: 'Hindi (हिन्दी)', langCode: 'hi', defaultWeather: '30°C', defaultAqi: 166 },
  { city: 'Bengaluru', region: 'Karnataka / BESCOM Grid', primaryLang: 'Kannada (ಕನ್ನಡ)', langCode: 'kn', defaultWeather: '30°C', defaultAqi: 67 },
  { city: 'Hyderabad', region: 'Telangana / TSSPDCL Grid', primaryLang: 'Telugu (తెలుగు)', langCode: 'te', defaultWeather: '33°C', defaultAqi: 111 },
  { city: 'Chennai', region: 'Tamil Nadu / TANGEDCO Grid', primaryLang: 'Tamil (தமிழ்)', langCode: 'ta', defaultWeather: '33°C', defaultAqi: 64 },
  { city: 'Mumbai', region: 'Maharashtra / Adani-BEST Grid', primaryLang: 'Marathi (मराठी)', langCode: 'mr', defaultWeather: '37°C', defaultAqi: 160 },
  { city: 'Kochi', region: 'Kerala / KSEB Grid', primaryLang: 'Malayalam (മലയാളം)', langCode: 'ml', defaultWeather: '30°C', defaultAqi: 75 },
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  selectedCity,
  selectedLanguage,
  onSelectCity,
  onSelectLanguage,
  onClose,
}) => {
  const [liveContexts, setLiveContexts] = useState<Record<string, CityContext>>({});

  useEffect(() => {
    if (!isOpen) return;

    // Fetch real-time telemetry for all cities
    let isMounted = true;
    const fetchAllCities = async () => {
      try {
        const promises = CITIES.map(c =>
          fetchContext(c.city).then(data => ({ city: c.city, data })).catch(() => null)
        );
        const results = await Promise.all(promises);
        if (!isMounted) return;

        const contextMap: Record<string, CityContext> = {};
        results.forEach(res => {
          if (res && res.data) {
            contextMap[res.city] = res.data;
          }
        });
        setLiveContexts(prev => ({ ...prev, ...contextMap }));
      } catch (e) {
        console.error('Failed to fetch live city context in modal', e);
      }
    };

    fetchAllCities();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRegional = CITY_REGIONAL_MAP[selectedCity] || CITY_REGIONAL_MAP['Bengaluru'];

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-[32px] p-6 relative border border-white/20 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white">Select City &amp; Grid</h3>
              <p className="text-xs text-white/50">Live regional air quality, carbon grid &amp; tariffs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City List */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Available Regional Hubs</p>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
              Live Sensor Sync
            </span>
          </div>

          {CITIES.map((c) => {
            const liveData = liveContexts[c.city];
            const aqiVal = liveData ? liveData.aqi : c.defaultAqi;
            const tempVal = liveData && liveData.temperature_c !== undefined
              ? `${liveData.temperature_c.toFixed(0)}°C`
              : c.defaultWeather;

            return (
              <button
                key={c.city}
                onClick={() => {
                  onSelectCity(c.city);
                }}
                className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between group border cursor-pointer ${
                  c.city === selectedCity
                    ? 'border-cyan-400 bg-white/15 shadow-md shadow-cyan-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    <span>{c.city}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10">
                      {c.primaryLang}
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1 flex items-center gap-2">
                    <span>{c.region}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-white/80">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          aqiVal <= 50
                            ? 'bg-emerald-400'
                            : aqiVal <= 100
                            ? 'bg-amber-400'
                            : aqiVal <= 150
                            ? 'bg-orange-400'
                            : 'bg-rose-500'
                        }`}
                      />
                      AQI <strong>{aqiVal}</strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-white/70">{tempVal}</span>
                  </div>
                </div>
                <Check
                  className={`w-5 h-5 text-cyan-400 ${
                    c.city === selectedCity ? 'opacity-100' : 'opacity-0'
                  } group-hover:opacity-100 transition-opacity`}
                />
              </button>
            );
          })}
        </div>

        {/* Language Selection Section */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">UI Language Preference</p>
            </div>
            <span className="text-[11px] text-white/50">Dual mode pairs English + {currentRegional.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((l) => {
              const isSelected = selectedLanguage === l.code;
              const label =
                l.code === 'dual'
                  ? `Dual: English + ${currentRegional.native}`
                  : `${l.name} (${l.native})`;

              return (
                <button
                  key={l.code}
                  onClick={() => onSelectLanguage(l.code)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left transition-all border cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-green-400 bg-green-500/20 text-white shadow-sm'
                      : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="truncate">{label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all cursor-pointer shadow-lg shadow-white/10"
          >
            Apply &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
