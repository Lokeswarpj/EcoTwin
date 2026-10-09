import React from 'react';
import { X, Check, MapPin, Globe } from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES, CITY_REGIONAL_MAP } from '../../i18n/translations';

interface LocationModalProps {
  isOpen: boolean;
  selectedCity: string;
  selectedLanguage: LanguageCode;
  onSelectCity: (city: string) => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onClose: () => void;
}

const CITIES = [
  { city: 'Delhi', region: 'NCR / Northern Grid', primaryLang: 'Hindi (हिन्दी)', langCode: 'hi' as LanguageCode, weather: 'Hazy / Cool', aqi: 166 },
  { city: 'Bengaluru', region: 'Karnataka / BESCOM Grid', primaryLang: 'Kannada (ಕನ್ನಡ)', langCode: 'kn' as LanguageCode, weather: 'Pleasant (24°C)', aqi: 67 },
  { city: 'Hyderabad', region: 'Telangana / TSSPDCL Grid', primaryLang: 'Telugu (తెలుగు)', langCode: 'te' as LanguageCode, weather: 'Warm (28°C)', aqi: 85 },
  { city: 'Chennai', region: 'Tamil Nadu / TANGEDCO Grid', primaryLang: 'Tamil (தமிழ்)', langCode: 'ta' as LanguageCode, weather: 'Humid (30°C)', aqi: 78 },
  { city: 'Mumbai', region: 'Maharashtra / Adani-BEST Grid', primaryLang: 'Marathi (मराठी)', langCode: 'mr' as LanguageCode, weather: 'Coastal (29°C)', aqi: 112 },
  { city: 'Kochi', region: 'Kerala / KSEB Grid', primaryLang: 'Malayalam (മലയാളം)', langCode: 'ml' as LanguageCode, weather: 'Tropical (27°C)', aqi: 52 },
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  selectedCity,
  selectedLanguage,
  onSelectCity,
  onSelectLanguage,
  onClose,
}) => {
  if (!isOpen) return null;

  const currentRegional = CITY_REGIONAL_MAP[selectedCity] || CITY_REGIONAL_MAP['Delhi'];

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
              <p className="text-xs text-white/50">Customizes energy tariffs, transit routes &amp; languages</p>
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
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Available Cities</p>
          {CITIES.map((c) => (
            <button
              key={c.city}
              onClick={() => {
                onSelectCity(c.city);
              }}
              className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between group border cursor-pointer ${
                c.city === selectedCity ? 'border-cyan-400 bg-white/15 shadow-md shadow-cyan-500/10' : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  <span>{c.city}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10">
                    {c.primaryLang}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-0.5">
                  {c.region} • AQI {c.aqi}
                </div>
              </div>
              <Check
                className={`w-5 h-5 text-cyan-400 ${
                  c.city === selectedCity ? 'opacity-100' : 'opacity-0'
                } group-hover:opacity-100 transition-opacity`}
              />
            </button>
          ))}
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
