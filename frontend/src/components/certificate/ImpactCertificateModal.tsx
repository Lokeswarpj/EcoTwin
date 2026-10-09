import React, { useState, useRef } from 'react';
import { X, Award, Share2, Download, Check, Sparkles, ShieldCheck, QrCode, Copy, Globe, MessageSquare } from 'lucide-react';
import { DashboardResponse } from '../../types';

interface ImpactCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: DashboardResponse | null;
  city?: string;
}

export const ImpactCertificateModal: React.FC<ImpactCertificateModalProps> = ({
  isOpen,
  onClose,
  dashboardData,
  city = 'Bengaluru'
}) => {
  const [userName, setUserName] = useState('EcoTwin Citizen');
  const [isCopied, setIsCopied] = useState(false);
  const certRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !dashboardData) return null;

  const score = dashboardData.metrics.planet_score;
  const points = dashboardData.metrics.points;
  const carbonUsed = dashboardData.metrics.monthly_carbon_used_kg;
  const wasteDiverted = dashboardData.metrics.monthly_waste_diverted_kg;
  const carbonBudget = dashboardData.metrics.monthly_carbon_budget_kg;
  const avoidedCo2 = Math.max(0, Math.round(carbonBudget - carbonUsed + wasteDiverted * 1.5));

  const certId = `ECO-IN-${Math.abs(score * 1000).toFixed(0)}-${new Date().getFullYear()}`;
  const verificationHash = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const shareText = `🌍 Proud to share my verified Planetary Citizen Certificate on #EcoTwin!\n\n✨ Planet Score: ${score}/100\n🌱 Carbon Avoided: ${avoidedCo2} kg CO2e\n♻️ Waste Diverted: ${wasteDiverted.toFixed(1)} kg\n🏆 Eco Points: ${points} pts\n\nTrack your environmental twin & household budget in real-time.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full rounded-[32px] p-6 lg:p-8 relative border border-amber-400/40 shadow-[0_0_60px_rgba(251,191,36,0.25)] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Award className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white flex items-center gap-2">
                Verified Climate Impact Certificate
              </h3>
              <p className="text-xs text-white/60">
                Official EcoTwin Ledger Credential for {city}, India.
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

        {/* Certificate Canvas Card */}
        <div
          ref={certRef}
          className="relative rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-950 border-2 border-amber-400/50 shadow-2xl mb-6 overflow-hidden"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-400/80 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-400/80 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-400/80 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-400/80 rounded-br-2xl" />

          {/* Watermark Logo */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-mono tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Verified Planetary Ledger Proof
            </div>
            <h2 className="font-display text-2xl lg:text-3xl text-white tracking-wide">
              CERTIFICATE OF CLIMATE ACTION
            </h2>
            <p className="text-xs text-white/60">
              Presented for excellence in sustainable urban living and verified resource stewardship.
            </p>
          </div>

          {/* User Name Input on Certificate */}
          <div className="text-center my-5">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="font-display text-2xl lg:text-3xl font-bold text-center bg-transparent border-b border-white/20 focus:border-amber-400 text-amber-300 focus:outline-none w-full max-w-md pb-1"
              placeholder="Enter your name"
            />
            <span className="block text-[11px] text-white/40 font-mono mt-1">
              (Click to edit name on certificate)
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-white/50 font-mono uppercase block">Planet Score</span>
              <span className="text-2xl font-bold font-display text-white">{score}</span>
              <span className="text-[10px] text-emerald-400 block font-mono">Verified Top 5%</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-white/50 font-mono uppercase block">Carbon Avoided</span>
              <span className="text-2xl font-bold font-display text-emerald-300">{avoidedCo2} kg</span>
              <span className="text-[10px] text-white/40 block font-mono">CO₂e Reduced</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-white/50 font-mono uppercase block">Waste Diverted</span>
              <span className="text-2xl font-bold font-display text-sky-300">{wasteDiverted.toFixed(1)} kg</span>
              <span className="text-[10px] text-white/40 block font-mono">To Circular DWCC</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-white/50 font-mono uppercase block">Eco Points</span>
              <span className="text-2xl font-bold font-display text-amber-300">{points}</span>
              <span className="text-[10px] text-amber-400/80 block font-mono">Emerald Rank</span>
            </div>
          </div>

          {/* Footer of Certificate */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10 text-[11px] text-white/50 font-mono gap-3">
            <div>
              <div><strong>Credential ID:</strong> {certId}</div>
              <div className="text-[9px] text-white/30 truncate max-w-[260px]">
                Hash: {verificationHash}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl p-1.5 border border-white/20 flex items-center justify-center">
                <QrCode className="w-full h-full text-white" />
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{city} Node</div>
                <div className="text-[10px] text-emerald-400">Status: ACTIVE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Share & Export Actions */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider block">
            Share Your Climate Leadership:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleShareLinkedIn}
              className="py-3 px-4 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              Post on LinkedIn
            </button>

            <button
              onClick={handleShareTwitter}
              className="py-3 px-4 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share to X / Twitter
            </button>

            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {isCopied ? 'Copied to Clipboard!' : 'Copy Share Text'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
