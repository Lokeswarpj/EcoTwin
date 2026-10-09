import React, { useEffect, useState } from 'react';
import { X, Calendar, Database } from 'lucide-react';
import { fetchHistory } from '../../services/api';
import { EventItem } from '../../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchHistory()
      .then((data) => setEvents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-xl w-full rounded-[32px] p-6 relative border border-white/20">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display text-2xl text-white">Persisted Event History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-8 text-white/50 text-sm">Loading audit events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-white/50 text-sm">No recorded events yet.</div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-sm"
              >
                <div>
                  <div className="font-medium text-white">{ev.description}</div>
                  <div className="text-xs text-white/40 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{ev.source}</span>
                  </div>
                </div>
                <div className="text-right">
                  {ev.carbon_impact_kg !== 0 && (
                    <span className={`font-mono text-xs block ${ev.carbon_impact_kg < 0 ? 'text-green-400' : 'text-amber-400'}`}>
                      {ev.carbon_impact_kg > 0 ? `+${ev.carbon_impact_kg}` : ev.carbon_impact_kg} kg CO2e
                    </span>
                  )}
                  {ev.waste_diverted_kg > 0 && (
                    <span className="font-mono text-xs text-green-400 block">
                      +{ev.waste_diverted_kg} kg diverted
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
