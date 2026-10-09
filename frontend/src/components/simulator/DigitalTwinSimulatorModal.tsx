import React, { useState, useMemo } from 'react';
import { X, Sparkles, Zap, TrendingUp, Trees, DollarSign, ShieldCheck, ArrowRight, Sun, Car, Salad, Wind, ShoppingBag } from 'lucide-react';

interface DigitalTwinSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanetScore?: number;
  onApplyToAutopilot?: (settings: any) => void;
  onAtmosphereChange?: (state: 'normal' | 'emerald' | 'warning') => void;
}

export const DigitalTwinSimulatorModal: React.FC<DigitalTwinSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentPlanetScore = 78.5,
  onApplyToAutopilot,
  onAtmosphereChange,
}) => {
  // Simulator Parameters
  const [solarKw, setSolarKw] = useState<number>(3.0);
  const [evCommutePercent, setEvCommutePercent] = useState<number>(60);
  const [plantBasedDays, setPlantBasedDays] = useState<number>(4);
  const [acTemp, setAcTemp] = useState<number>(24);
  const [zeroPlastic, setZeroPlastic] = useState<number>(80);

  // Computations
  const sim = useMemo(() => {
    // 1. Solar CO2 + Financial
    const annualSolarKwh = solarKw * 1400; // 1400 kWh/kW/yr in Bengaluru/India
    const solarCo2SavingKg = annualSolarKwh * 0.76;
    const solarRupeeSavingYr = annualSolarKwh * 7.5;

    // 2. EV / Transit Shift (assuming 25 km daily round trip = 7500 km/yr)
    const annualKm = 7500;
    const iceEmissionsKg = (annualKm * 0.14); // 140g/km ICE
    const evEmissionsKg = (annualKm * 0.04);
    const commuteCo2SavedKg = (iceEmissionsKg - evEmissionsKg) * (evCommutePercent / 100);
    const commuteRupeeSavedYr = (annualKm * 8.5 * (evCommutePercent / 100)) - (annualKm * 1.8 * (evCommutePercent / 100));

    // 3. Diet Shift (Avg Indian non-veg vs plant-based delta ~2.5 kg CO2/day)
    const dietCo2SavedKg = plantBasedDays * 52 * 2.2;
    const dietRupeeSavedYr = plantBasedDays * 52 * 60; // savings on grocery/meat premium

    // 4. AC Temperature (Each degree above 20°C saves ~6% energy on ~1800 kWh annual cooling)
    const acEnergySavedKwh = Math.max(0, acTemp - 20) * 0.06 * 1800;
    const acCo2SavedKg = acEnergySavedKwh * 0.76;
    const acRupeeSavedYr = acEnergySavedKwh * 7.5;

    // 5. Plastic avoidance (avoiding ~35kg packaging/yr + landfill methane)
    const plasticCo2SavedKg = (zeroPlastic / 100) * 75;
    const plasticRupeeSavedYr = (zeroPlastic / 100) * 1800;

    const totalAnnualCo2SavedKg = solarCo2SavingKg + commuteCo2SavedKg + dietCo2SavedKg + acCo2SavedKg + plasticCo2SavedKg;
    const totalAnnualRupeeSaved = solarRupeeSavingYr + commuteRupeeSavedYr + dietRupeeSavedYr + acRupeeSavedYr + plasticRupeeSavedYr;
    const tenYearRupeeSaved = totalAnnualRupeeSaved * 10;
    const tenYearCo2SavedTons = (totalAnnualCo2SavedKg * 10) / 1000;
    const treesEquivalent = Math.round(totalAnnualCo2SavedKg / 21.7); // 1 mature tree absorbs ~21.7 kg CO2/yr

    // Score boost projection
    const projectedBoost = Math.min(21.5, (totalAnnualCo2SavedKg / 4000) * 18);
    const newPlanetScore = Math.min(100, Math.round((currentPlanetScore + projectedBoost) * 10) / 10);

    return {
      annualCo2SavedKg: Math.round(totalAnnualCo2SavedKg),
      annualRupeeSaved: Math.round(totalAnnualRupeeSaved),
      tenYearRupeeSaved: Math.round(tenYearRupeeSaved),
      tenYearCo2SavedTons: Number(tenYearCo2SavedTons.toFixed(1)),
      treesEquivalent,
      projectedBoost: Number(projectedBoost.toFixed(1)),
      newPlanetScore
    };
  }, [solarKw, evCommutePercent, plantBasedDays, acTemp, zeroPlastic, currentPlanetScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-3xl w-full rounded-[32px] p-6 lg:p-8 relative border border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.2)] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white flex items-center gap-2">
                "What-If" Digital Twin Life Simulator
              </h3>
              <p className="text-xs text-white/60">
                Tune your lifestyle parameters to forecast your 10-Year personal ecological &amp; financial twin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Hero Projection Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-cyan-300 font-medium mb-1">
              <span>Predicted Planet Score</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-white">{sim.newPlanetScore}</span>
              <span className="text-xs text-emerald-400 font-mono">+{sim.projectedBoost} pts</span>
            </div>
            <span className="text-[10px] text-white/40 mt-1">From current {currentPlanetScore}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-medium mb-1">
              <span>10-Yr Family Savings</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-display text-white">₹{(sim.tenYearRupeeSaved / 100000).toFixed(2)}L</span>
            </div>
            <span className="text-[10px] text-emerald-300/80 mt-1">₹{sim.annualRupeeSaved.toLocaleString('en-IN')}/yr saved</span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-sky-300 font-medium mb-1">
              <span>10-Yr Carbon Avoided</span>
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-display text-white">{sim.tenYearCo2SavedTons}t</span>
              <span className="text-xs text-sky-300">CO₂e</span>
            </div>
            <span className="text-[10px] text-white/40 mt-1">{sim.annualCo2SavedKg.toLocaleString('en-IN')} kg / yr</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1">
              <span>Offset Equivalence</span>
              <Trees className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-display text-white">{sim.treesEquivalent}</span>
              <span className="text-xs text-amber-300">Trees</span>
            </div>
            <span className="text-[10px] text-white/40 mt-1">Forest canopy power</span>
          </div>
        </div>

        {/* Interactive Sliders Section */}
        <div className="space-y-6 mb-8 bg-white/5 p-5 rounded-2xl border border-white/10">
          <h4 className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider">
            Personal Lifestyle Levers
          </h4>

          {/* Slider 1: Rooftop Solar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Rooftop Solar Capacity</span>
              </div>
              <span className="font-mono text-amber-300 font-semibold">{solarKw} kW</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={solarKw}
              onChange={(e) => setSolarKw(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-white/40 font-mono">
              <span>0 kW (Grid Only)</span>
              <span>3 kW (Avg 2BHK/3BHK)</span>
              <span>8 kW (Net-Zero Pro)</span>
            </div>
          </div>

          {/* Slider 2: EV / Clean Commute */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>Clean Transit / EV / Metro Share</span>
              </div>
              <span className="font-mono text-cyan-300 font-semibold">{evCommutePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={evCommutePercent}
              onChange={(e) => setEvCommutePercent(parseInt(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-white/40 font-mono">
              <span>0% (100% ICE Petrol)</span>
              <span>50% (Hybrid Metro + Bike)</span>
              <span>100% (Zero Emission EV)</span>
            </div>
          </div>

          {/* Slider 3: Plant Based Meals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white">
                <Salad className="w-4 h-4 text-emerald-400" />
                <span>Plant-Rich / Low-Carbon Meals</span>
              </div>
              <span className="font-mono text-emerald-300 font-semibold">{plantBasedDays} Days / Week</span>
            </div>
            <input
              type="range"
              min="0"
              max="7"
              step="1"
              value={plantBasedDays}
              onChange={(e) => setPlantBasedDays(parseInt(e.target.value))}
              className="w-full accent-emerald-400 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-white/40 font-mono">
              <span>0 Days</span>
              <span>3 Days (Flexitarian)</span>
              <span>7 Days (Full Green Diet)</span>
            </div>
          </div>

          {/* Slider 4: AC Thermostat Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white">
                <Wind className="w-4 h-4 text-sky-400" />
                <span>AC Thermostat Setpoint</span>
              </div>
              <span className="font-mono text-sky-300 font-semibold">{acTemp}°C (Eco Optimization)</span>
            </div>
            <input
              type="range"
              min="18"
              max="26"
              step="1"
              value={acTemp}
              onChange={(e) => setAcTemp(parseInt(e.target.value))}
              className="w-full accent-sky-400 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-white/40 font-mono">
              <span>18°C (Max Grid Load)</span>
              <span>24°C (Bureau of Energy Efficiency Standard)</span>
              <span>26°C (Super Eco)</span>
            </div>
          </div>

          {/* Slider 5: Single-Use Plastic Elimination */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                <span>Zero Single-Use Plastic Adherence</span>
              </div>
              <span className="font-mono text-purple-300 font-semibold">{zeroPlastic}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={zeroPlastic}
              onChange={(e) => setZeroPlastic(parseInt(e.target.value))}
              className="w-full accent-purple-400 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-white/40 font-mono">
              <span>0% (Standard Packaging)</span>
              <span>50% (Cloth Bags + Refills)</span>
              <span>100% (Zero Plastic Household)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={() => {
              if (onAtmosphereChange) onAtmosphereChange('emerald');
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Preview Radiant Aura on 3D Earth
          </button>

          <button
            onClick={() => {
              if (onApplyToAutopilot) {
                onApplyToAutopilot({ solarKw, evCommutePercent, plantBasedDays, acTemp, zeroPlastic });
              }
              onClose();
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-cyan-400 text-black px-8 py-3.5 rounded-full font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black" />
            Apply Targets to Monthly Autopilot Plan
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
