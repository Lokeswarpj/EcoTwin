import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { DashboardMetrics } from '../../types';

interface ScoreGaugeProps {
  metrics?: DashboardMetrics;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ metrics }) => {
  const score = metrics ? Math.round(metrics.planet_score) : 78;
  const maxDash = 440;
  const offset = maxDash - (maxDash * Math.min(100, Math.max(0, score))) / 100;

  const strokeColor = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';
  const alertText = metrics?.budget_forecast_alert || 'At current rates, budget will overshoot in 12 days.';

  return (
    <div className="glass p-8 rounded-[32px] text-center relative overflow-hidden fade-rise delay-600">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 blur-3xl" />
      <span className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-4 font-semibold">
        Planet Score
      </span>

      <div className="relative inline-flex items-center justify-center w-40 h-40 mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/10"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray="440"
            strokeDashoffset={offset}
            className="score-circle"
          />
        </svg>
        <div className="absolute text-5xl font-display text-white">
          {score}
          <span className="text-xl text-white/60">/100</span>
        </div>
      </div>

      <div className={`p-4 rounded-xl text-sm flex items-center gap-3 justify-center border transition-all ${
        score >= 80
          ? 'bg-green-400/10 border-green-400/20 text-green-400'
          : score >= 60
          ? 'bg-amber-400/10 border-amber-400/20 text-amber-300'
          : 'bg-red-400/10 border-red-400/20 text-red-400'
      }`}>
        {score >= 80 ? (
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
        ) : score >= 60 ? (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
        )}
        <span>{alertText}</span>
      </div>
    </div>
  );
};
