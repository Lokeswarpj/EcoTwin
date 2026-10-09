import React from 'react';
import { CheckCircle, Circle, ArrowRight, Sparkles, Train, Bus } from 'lucide-react';
import { ActionCard } from '../../types';

interface ActionStreamProps {
  actions: ActionCard[];
  onToggleStep: (actionId: string, stepIndex: number, currentStatus: boolean) => void;
  onOpenHistory: () => void;
}

export const ActionStream: React.FC<ActionStreamProps> = ({
  actions,
  onToggleStep,
  onOpenHistory
}) => {
  return (
    <section id="action-stream-section" className="mb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-display">AI Action Stream</h2>
          <p className="text-sm text-white/50 mt-1">
            Live autonomous interventions by Gemini Multi-Agent Swarm
          </p>
        </div>
        <button
          onClick={onOpenHistory}
          className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>View History</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((task) => {
          const badgeColor =
            task.color === 'green'
              ? 'bg-green-400 text-black'
              : task.color === 'amber'
              ? 'bg-amber-400 text-black'
              : 'bg-blue-400 text-black';

          const pointsColor =
            task.color === 'green'
              ? 'text-green-400'
              : task.color === 'amber'
              ? 'text-amber-400'
              : 'text-blue-400';

          return (
            <div
              key={task.id}
              className={`glass p-8 rounded-[32px] hover:translate-y-[-8px] transition-all duration-300 group flex flex-col justify-between ${
                task.color === 'amber' ? 'border-white/30 bg-white/10' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`${badgeColor} inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest`}
                  >
                    {task.category}
                  </div>
                  <span className="text-xs text-white/40 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    {task.agent_name}
                  </span>
                </div>

                <h4 className="text-xl font-medium mb-3">{task.title}</h4>
                <p className="text-white/60 text-sm mb-6">{task.description}</p>

                {/* Custom Trade-off Card (Negotiator AI) */}
                {task.trade_off && (
                  <div className="bg-black/20 p-4 rounded-2xl space-y-3 mb-8">
                    <div className="flex justify-between text-xs text-white/40">
                      <span className="uppercase">Impact Option</span>
                      <span className="uppercase">Fare</span>
                    </div>
                    <div className="flex justify-between font-medium items-center">
                      <span className="text-green-400 flex items-center gap-1.5">
                        <Train className="w-4 h-4" /> {task.trade_off.option_a}
                      </span>
                      <span>{task.trade_off.fare_a}</span>
                    </div>
                    <div className="flex justify-between font-medium items-center text-white/70">
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <Bus className="w-4 h-4" /> {task.trade_off.option_b}
                      </span>
                      <span>{task.trade_off.fare_b}</span>
                    </div>
                  </div>
                )}

                {/* Checklist Steps */}
                <div className="space-y-2 mb-8">
                  {task.steps.map((step, idx) => (
                    <div
                      key={idx}
                      onClick={() => onToggleStep(task.id, idx, step.done)}
                      className="flex items-center gap-3 text-sm cursor-pointer select-none group/item py-1"
                    >
                      {step.done ? (
                        <CheckCircle
                          className={`w-5 h-5 shrink-0 transition-transform group-hover/item:scale-110 ${pointsColor}`}
                        />
                      ) : (
                        <Circle className="w-5 h-5 shrink-0 text-white/30 transition-transform group-hover/item:scale-110" />
                      )}
                      <span
                        className={`transition-colors ${
                          step.done
                            ? 'text-white/90 line-through opacity-80'
                            : 'text-white/70 group-hover/item:text-white'
                        }`}
                      >
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-white/40 pt-4 border-t border-white/10">
                <span className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                  -{task.co2_saving_kg.toFixed(2)} kg CO2e
                </span>
                <span className={`${pointsColor} font-semibold`}>
                  +{task.points} Points
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
