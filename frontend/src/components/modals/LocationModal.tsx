import React from 'react';
import { X, Check } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
}

const CITIES = [
  { city: 'Bengaluru', languages: 'English, Hindi, Kannada', weather: 'Mild Weather (24°C)', aqi: 72 },
  { city: 'Mumbai', languages: 'English, Hindi, Marathi', weather: 'Humid (29°C)', aqi: 118 },
  { city: 'Delhi', languages: 'English, Hindi, Punjabi', weather: 'Hazy (26°C)', aqi: 184 },
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  selectedCity,
  onSelectCity,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-[32px] p-6 relative border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl text-white">Select Region &amp; Grid</h3>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-white/50 mb-4">
          Tariff rates, carbon intensity factors, and regional language output adjust automatically.
        </p>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {CITIES.map((c) => (
            <button
              key={c.city}
              onClick={() => {
                onSelectCity(c.city);
                onClose();
              }}
              className={`w-full text-left p-4 rounded-2xl glass hover:bg-white/10 transition-all flex items-center justify-between group border cursor-pointer ${
                c.city === selectedCity ? 'border-sky-400 bg-white/10' : 'border-white/10'
              }`}
            >
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  {c.city}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                    {c.languages}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {c.weather} • AQI {c.aqi}
                </div>
              </div>
              <Check
                className={`w-5 h-5 text-sky-400 ${
                  c.city === selectedCity ? 'opacity-100' : 'opacity-0'
                } group-hover:opacity-100 transition-opacity`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
