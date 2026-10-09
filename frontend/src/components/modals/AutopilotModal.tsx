import React, { useEffect, useState } from 'react';
import { X, Bot, RefreshCw, CheckCircle2, Sparkles, ChevronDown, ChevronUp, ArrowRight, Zap, Utensils, Train } from 'lucide-react';
import { generateWeeklyPlan } from '../../services/api';
import { WeeklyPlan, TraceItem } from '../../types';
import { LanguageCode, getTranslation } from '../../i18n/translations';

interface AutopilotModalProps {
  isOpen: boolean;
  city?: string;
  language?: LanguageCode;
  onClose: () => void;
  onPlanGenerated: () => void;
}

export const AutopilotModal: React.FC<AutopilotModalProps> = ({
  isOpen,
  city = 'Delhi',
  language = 'en',
  onClose,
  onPlanGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const runSynthesis = async () => {
    setIsGenerating(true);
    setStepIndex(1);
    
    // Smooth step visual progression
    const t1 = setTimeout(() => setStepIndex(2), 250);
    const t2 = setTimeout(() => setStepIndex(3), 500);

    try {
      const result = await generateWeeklyPlan(city);
      setPlan(result);
      setStepIndex(4);
    } catch (err) {
      console.error('Failed to generate weekly plan', err);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runSynthesis();
    } else {
      setStepIndex(0);
      setShowTrace(false);
    }
  }, [isOpen, city]);

  const handleApplyPlan = () => {
    onPlanGenerated();
    onClose();
    setTimeout(() => {
      document.getElementById('action-stream-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full rounded-[32px] p-6 sm:p-7 relative border border-cyan-400/40 shadow-[0_0_60px_rgba(34,211,238,0.2)] max-h-[88vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-2xl text-white">
                  {getTranslation('autopilot.modal_title', language, city)}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-green-500/20 text-green-300 border border-green-500/30">
                  Ready
                </span>
              </div>
              <p className="text-xs text-white/60">
                Multi-agent planetary balance optimized for <span className="text-white font-medium">{city}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Step Progression Bar while synthesizing */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-white/70 font-mono">
                <span>Cooperating Agents In-Progress</span>
                <span className="text-cyan-400">Step {stepIndex} of 4</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(stepIndex / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs text-white/50 italic">
                {stepIndex === 1 && 'Ingesting real-time weather, AQI, and grid carbon intensity...'}
                {stepIndex === 2 && 'Auditing remaining monthly carbon budget against 1.5°C threshold...'}
                {stepIndex === 3 && 'Negotiating trade-offs across Food, Mobility, and Energy agents...'}
                {stepIndex === 4 && 'Plan successfully compiled and persisted!'}
              </p>
            </div>
          )}

          {/* Plan Overview Hero Card */}
          {plan && (
            <>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-cyan-300 uppercase">
                    Target for this Week
                  </span>
                  <h4 className="text-base font-semibold text-white mt-0.5">{plan.title}</h4>
                  <p className="text-xs text-white/70 mt-0.5 max-w-md">{plan.summary}</p>
                </div>
                <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                  <div className="text-right">
                    <span className="text-xl font-bold text-green-400">
                      -{plan.projected_co2e_reduction_kg} kg
                    </span>
                    <p className="text-[10px] text-white/50">Projected CO₂e Saved</p>
                  </div>
                </div>
              </div>

              {/* 3 Coordinated Priority Actions */}
              <div className="space-y-2.5">
                <h5 className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                  Coordinated Agent Micro-Actions
                </h5>
                {plan.actions.map((act) => {
                  const icon =
                    act.category.includes('Food') ? (
                      <Utensils className="w-4 h-4 text-green-400" />
                    ) : act.category.includes('Mobility') ? (
                      <Train className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Zap className="w-4 h-4 text-cyan-400" />
                    );

                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-white/5 mt-0.5 shrink-0">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-white/50">{act.category}</span>
                          <span className="text-xs font-semibold text-green-300">+{act.points} pts</span>
                        </div>
                        <h6 className="text-sm font-semibold text-white truncate mt-0.5">{act.title}</h6>
                        <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{act.description}</p>
                        
                        {act.steps && act.steps.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {act.steps.map((st, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] text-white/70">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                                <span>{st.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Collapsible Agent Collaboration Logs */}
              <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
                <button
                  onClick={() => setShowTrace(!showTrace)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    View Agent Negotiation Trace ({plan.trace.length} entries)
                  </span>
                  {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTrace && (
                  <div className="p-3 border-t border-white/10 bg-black/70 space-y-1.5 font-mono text-[11px] max-h-36 overflow-y-auto">
                    {plan.trace.map((tr: TraceItem, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-white/80">
                        <span className="text-white/40">[{tr.timestamp}]</span>
                        <span className="text-cyan-400 font-semibold">&lt;{tr.agent_name}&gt;</span>
                        <span>{tr.explanation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Fixed Sticky Action Footer */}
        {plan && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 mt-3 shrink-0 bg-transparent">
            <button
              onClick={runSynthesis}
              disabled={isGenerating}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/15"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Re-Synthesizing...' : getTranslation('autopilot.rerun_btn', language, city)}
            </button>

            <button
              onClick={handleApplyPlan}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black text-sm font-semibold hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>{getTranslation('autopilot.apply_btn', language, city)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
