import React, { useState, useRef, useEffect } from 'react';
import { Zap, ChevronDown, MapPin, Globe, Check } from 'lucide-react';
import { CityContext } from '../../types';
import { LanguageCode, SUPPORTED_LANGUAGES, CITY_REGIONAL_MAP, getTranslation } from '../../i18n/translations';

interface NavbarProps {
  cityContext?: CityContext;
  language: LanguageCode;
  onOpenLocation: () => void;
  onOpenAutopilot: () => void;
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cityContext,
  language,
  onOpenLocation,
  onOpenAutopilot,
  onSelectLanguage
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const cityName = cityContext?.city || 'Delhi';
  const aqi = cityContext?.aqi || 72;
  const temp = cityContext?.temperature_c ? `${cityContext.temperature_c.toFixed(0)}°C` : '24°C';
  const regionalInfo = CITY_REGIONAL_MAP[cityName] || CITY_REGIONAL_MAP['Delhi'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangLabel =
    language === 'dual'
      ? `Dual (${regionalInfo.native})`
      : SUPPORTED_LANGUAGES.find((l) => l.code === language)?.native || 'English';

  return (
    <nav className="fixed top-0 left-0 w-full z-40 glass bg-white/5 border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-6 lg:gap-10">
        <a href="#" className="text-2xl lg:text-3xl font-display tracking-tight text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
          EcoTwin
        </a>

        <div className="hidden md:flex items-center gap-3 lg:gap-4 text-xs text-white/70">
          {/* City Selector Button */}
          <button
            onClick={onOpenLocation}
            className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-all px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            title="Click to switch city and regional grid"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium text-white">{cityName}</span>
            <span className="text-[11px] text-white/40">({regionalInfo.name})</span>
            <ChevronDown className="w-3 h-3 text-white/40 ml-0.5" />
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-all px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              title="Change UI language"
            >
              <Globe className="w-3.5 h-3.5 text-green-400" />
              <span className="font-medium">{currentLangLabel}</span>
              <ChevronDown className="w-3 h-3 text-white/40 ml-0.5" />
            </button>

            {langDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl glass-card bg-slate-900/95 border border-white/20 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-wider border-b border-white/10 mb-1">
                  Choose Language
                </div>
                {SUPPORTED_LANGUAGES.map((l) => {
                  const isSelected = language === l.code;
                  const label =
                    l.code === 'dual'
                      ? `Dual: English + ${regionalInfo.native}`
                      : `${l.name} (${l.native})`;

                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        onSelectLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Live Environmental Telemetry Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>AQI {aqi} • {temp}</span>
            {cityContext?.is_live && (
              <span className="text-[9px] text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded font-mono border border-sky-400/30">
                LIVE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile Language Button */}
        <button
          onClick={onOpenLocation}
          className="md:hidden p-2 rounded-full bg-white/5 text-white/80 border border-white/10"
        >
          <Globe className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={onOpenAutopilot}
          className="bg-white text-black px-5 lg:px-6 py-2 rounded-full text-xs lg:text-sm font-semibold btn-hover flex items-center gap-2 shadow-lg shadow-white/10 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-500 fill-amber-500" />
          <span>{getTranslation('nav.autopilot', language, cityName)}</span>
        </button>
      </div>
    </nav>
  );
};
