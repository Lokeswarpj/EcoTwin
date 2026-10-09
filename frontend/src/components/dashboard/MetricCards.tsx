import React from 'react';
import { Leaf, Trash2, Droplet } from 'lucide-react';
import { DashboardMetrics } from '../../types';

interface MetricCardsProps {
  metrics?: DashboardMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const carbon = metrics?.monthly_carbon_used_kg ?? 12.4;
  const waste = metrics?.monthly_waste_diverted_kg ?? 0.8;
  const water = metrics?.monthly_water_consumed_l ?? 140;

  const carbonPercent = Math.min(100, (carbon / 20) * 100);
  const wastePercent = Math.min(100, (waste / 1.8) * 100);
  const waterPercent = Math.min(100, (water / 180) * 100);

  return (
    <div className="grid md:grid-cols-3 gap-4 fade-rise delay-600">
      {/* Carbon */}
      <div className="glass p-6 rounded-3xl group hover:border-green-400/40 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <Leaf className="w-6 h-6 text-green-400" />
          <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Carbon</span>
        </div>
        <div className="text-3xl font-display mb-2">
          {carbon.toFixed(1)} kg <span className="text-sm font-sans text-white/40">CO2e</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="bg-green-400 h-full transition-all duration-700"
            style={{ width: `${carbonPercent}%` }}
          />
        </div>
      </div>

      {/* Waste */}
      <div className="glass p-6 rounded-3xl group hover:border-amber-400/40 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <Trash2 className="w-6 h-6 text-amber-400" />
          <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Waste</span>
        </div>
        <div className="text-3xl font-display mb-2">
          {waste.toFixed(1)} kg <span className="text-sm font-sans text-white/40">Diverted</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="bg-amber-400 h-full transition-all duration-700"
            style={{ width: `${wastePercent}%` }}
          />
        </div>
      </div>

      {/* Water */}
      <div className="glass p-6 rounded-3xl group hover:border-blue-400/40 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <Droplet className="w-6 h-6 text-blue-400" />
          <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Water</span>
        </div>
        <div className="text-3xl font-display mb-2">
          {Math.round(water)} L <span className="text-sm font-sans text-white/40">Consumed</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="bg-blue-400 h-full transition-all duration-700"
            style={{ width: `${waterPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
