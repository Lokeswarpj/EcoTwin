import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 py-12 px-6 lg:px-20 mt-20 text-center">
      <div className="font-display text-3xl mb-4">EcoTwin</div>
      <p className="text-white/40 text-sm mb-8">
        Architected for planetary resilience. © 2024-2026 EcoTwin AI. Powered by Cooperating Gemini Agents.
      </p>
      <div className="flex justify-center gap-6 text-white/30 text-sm">
        <span>Bengaluru Regional Grid</span>
        <span>•</span>
        <span>1.5°C Paris Accord Budget Engine</span>
        <span>•</span>
        <span>Hasiru Dala &amp; BBMP DWCC Guidelines</span>
      </div>
    </footer>
  );
};
