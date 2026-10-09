import React from 'react';
import { X, Camera, Scan } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onCapture }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-[32px] p-6 relative border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h3 className="font-display text-2xl text-white">Live AI Planetary Scanner</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Preview */}
        <div className="relative w-full h-64 rounded-2xl bg-black/50 border border-white/20 overflow-hidden flex items-center justify-center mb-6">
          <div className="scan-beam" />
          <div className="text-center p-6 space-y-2">
            <Scan className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
            <p className="text-sm text-white/80">
              Point at recyclable packaging, receipt, appliance, or water fixture
            </p>
            <p className="text-xs text-white/40 font-mono">
              Gemini Vision 1.5 Flash • 98.4% Confidence
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCapture}
            className="w-full bg-white text-black py-3 rounded-full font-medium btn-hover flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            Capture &amp; Run Multi-Agent Audit
          </button>
        </div>
      </div>
    </div>
  );
};
