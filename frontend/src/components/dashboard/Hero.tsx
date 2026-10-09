import React from 'react';
import { Camera, PlayCircle } from 'lucide-react';

interface HeroProps {
  onSnapScan: () => void;
  onViewDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSnapScan, onViewDemo }) => {
  return (
    <section className="hero mb-24 max-w-4xl">
      <h1 className="h1-display font-display text-white mb-6 fade-rise">
        Your Planet Budget,<br />run by an AI Autopilot.
      </h1>
      <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-10 fade-rise delay-200">
        One score for your daily carbon, waste, and water. Driven by cooperating Gemini AI agents to keep your lifestyle within planetary boundaries.
      </p>
      <div className="flex flex-wrap gap-4 fade-rise delay-400">
        <button
          onClick={onSnapScan}
          className="bg-white text-black px-8 py-4 rounded-full flex items-center gap-3 font-medium text-[16px] btn-hover shadow-xl shadow-white/5"
        >
          <Camera className="w-5 h-5" />
          Snap &amp; Scan Item
        </button>
        <button
          onClick={onViewDemo}
          className="border border-white/20 hover:bg-white/5 px-8 py-4 rounded-full font-medium text-[16px] transition-all flex items-center gap-2"
        >
          <PlayCircle className="w-5 h-5 text-sky-400" />
          View Live Demo
        </button>
      </div>
    </section>
  );
};
