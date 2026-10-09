import React, { useState, useEffect } from 'react';
import { Sun, Home, Zap, TrendingUp, Trees, Clock } from 'lucide-react';
import { simulateSolar } from '../../services/api';
import { SolarSimulationResult } from '../../types';

interface SolarPanelProps {
  city?: string;
}

// 1 kW rooftop solar requires ~100 sq ft of shadow-free rooftop space (MNRE India standard)
const SQFT_PER_KW = 100;

export const SolarPanel: React.FC<SolarPanelProps> = ({ city = 'Bengaluru' }) => {
  const [sqft, setSqft] = useState<number>(450); // Default 450 sq ft -> 4.5 kW
  const kw = Math.round((sqft / SQFT_PER_KW) * 10) / 10;

  const [solarData, setSolarData] = useState<SolarSimulationResult>({
    roof_area_kw: 4.5,
    annual_generation_kwh: 5978,
    annual_co2e_avoided_tons: 2.4,
    annual_savings_inr: 50556,
    estimated_payback_years: 4.3,
    trees_equivalent: 235,
    methodology_note: 'Solar PV model based on regional solar irradiance.'
  });

  useEffect(() => {
    let active = true;
    simulateSolar(kw, city)
      .then((res) => {
        if (active) setSolarData(res);
      })
      .catch((err) => console.warn('Solar API fallback', err));
    return () => {
      active = false;
    };
  }, [kw, city]);

  const presetSizes = [
    { label: '300 sq ft', value: 300, desc: 'Apartment' },
    { label: '500 sq ft', value: 500, desc: 'House' },
    { label: '800 sq ft', value: 800, desc: 'Villa' },
    { label: '1200 sq ft', value: 1200, desc: 'Commercial' },
  ];

  return (
    <div className="glass p-7 lg:p-8 rounded-[32px] fade-rise delay-600 border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/20 shadow-lg shadow-amber-500/10">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-2xl text-white">Rooftop Solar &amp; Clean Energy Yield</h3>
            <p className="text-xs text-white/50">Instant clean yield and tariff economics calculator for {city}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70">
          <span>MNRE Benchmark Grid Mix</span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* Left Side: Sq Ft Selection & Capacity Calculator (md:col-span-6) */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Home className="w-4 h-4 text-cyan-400" />
                <span className="font-medium">Rooftop Usable Area</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-xl text-cyan-300">{sqft}</span>
                <span className="text-xs text-white/50 ml-1">sq ft</span>
              </div>
            </div>

            {/* Area Slider */}
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={sqft}
              onChange={(e) => setSqft(parseInt(e.target.value, 10))}
              className="w-full"
            />

            {/* Computed Solar Capacity Badge */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-white/40 text-[11px]">~100 sq ft per 1 kW</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-xs">
                <Zap className="w-3.5 h-3.5" />
                <span><strong>{kw.toFixed(1)} kW</strong> System</span>
              </div>
            </div>

            {/* Quick Preset Chips */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {presetSizes.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setSqft(preset.value)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-mono transition-all text-center border cursor-pointer ${
                    sqft === preset.value
                      ? 'bg-cyan-500/25 border-cyan-400 text-white font-medium shadow-sm'
                      : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: ROI & Clean Generation Cards (md:col-span-6) */}
        <div className="md:col-span-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-1.5 text-xs text-white/50 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>CO2e Avoided / yr</span>
              </div>
              <p className="text-2xl lg:text-3xl font-display text-emerald-400">
                -{solarData.annual_co2e_avoided_tons.toFixed(1)}t
              </p>
              <p className="text-[11px] font-mono text-white/40 mt-1 flex items-center gap-1">
                <Trees className="w-3 h-3 text-emerald-400" />
                <span>+{solarData.trees_equivalent} trees equiv.</span>
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-1.5 text-xs text-white/50 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Est. Savings / yr</span>
              </div>
              <p className="text-2xl lg:text-3xl font-display text-white">
                ₹{Math.round(solarData.annual_savings_inr).toLocaleString()}
              </p>
              <p className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{solarData.estimated_payback_years} yrs payback</span>
              </p>
            </div>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-white/70">
            <span className="text-white/50">Annual Clean Electricity</span>
            <span className="font-mono text-cyan-300 font-semibold text-sm">
              {solarData.annual_generation_kwh.toLocaleString()} kWh/year
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
