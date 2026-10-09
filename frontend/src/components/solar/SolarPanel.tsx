import React, { useState, useEffect } from 'react';
import { Sun } from 'lucide-react';
import { simulateSolar } from '../../services/api';
import { SolarSimulationResult } from '../../types';

interface SolarPanelProps {
  city?: string;
}

export const SolarPanel: React.FC<SolarPanelProps> = ({ city = 'Bengaluru' }) => {
  const [kw, setKw] = useState<number>(4.5);
  const [solarData, setSolarData] = useState<SolarSimulationResult>({
    roof_area_kw: 4.5,
    annual_generation_kwh: 5978,
    annual_co2e_avoided_tons: 2.4,
    annual_savings_inr: 12400,
    estimated_payback_years: 3.8,
    trees_equivalent: 110,
    methodology_note: 'Solar PV model based on Bengaluru solar irradiance.'
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

  return (
    <div className="glass p-8 rounded-[32px] fade-rise delay-600">
      <h3 className="font-display text-2xl mb-6 flex items-center justify-between">
        <span>Solar &amp; Energy Panel</span>
        <Sun className="w-5 h-5 text-amber-400" />
      </h3>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Roof Area Capacity</span>
            <span className="text-white font-medium">{kw.toFixed(1)} kW</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={kw}
            onChange={(e) => setKw(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-xs text-white/40 mb-1">CO2e Saved / yr</p>
            <p className="text-xl font-display text-green-400">
              -{solarData.annual_co2e_avoided_tons.toFixed(1)}t
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-xs text-white/40 mb-1">Est. Savings / yr</p>
            <p className="text-xl font-display text-white">
              ₹{Math.round(solarData.annual_savings_inr).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-white/40 flex items-center justify-between pt-1">
          <span>Est. Payback: {solarData.estimated_payback_years} yrs</span>
          <span>Trees eq: +{solarData.trees_equivalent}</span>
        </div>
      </div>
    </div>
  );
};
