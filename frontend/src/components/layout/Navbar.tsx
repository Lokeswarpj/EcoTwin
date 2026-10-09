import React from 'react';
import { Zap, ChevronDown } from 'lucide-react';
import { CityContext } from '../../types';

interface NavbarProps {
  cityContext?: CityContext;
  language: string;
  onOpenLocation: () => void;
  onOpenAutopilot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cityContext,
  language,
  onOpenLocation,
  onOpenAutopilot
}) => {
  const cityName = cityContext?.city || 'Bengaluru';
  const aqi = cityContext?.aqi || 72;
  const temp = cityContext?.temperature_c ? `${cityContext.temperature_c.toFixed(0)}°C` : '24°C';

  return (
    <nav className="fixed top-0 left-0 w-full z-40 glass bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <a href="#" className="text-3xl font-display tracking-tight text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
          EcoTwin
        </a>

        <div className="hidden lg:flex items-center gap-6 text-[14px] text-white/60">
          <button
            onClick={onOpenLocation}
            className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <span>{cityName} / English, Hindi, Kannada</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>
          
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>AQI {aqi} • Mild Weather ({temp})</span>
            {cityContext?.is_live && (
              <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-400/30">
                LIVE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenAutopilot}
          className="bg-white text-black px-6 py-2.5 rounded-full text-[14px] font-medium btn-hover flex items-center gap-2 shadow-lg shadow-white/10"
        >
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          Launch Autopilot
        </button>
      </div>
    </nav>
  );
};
