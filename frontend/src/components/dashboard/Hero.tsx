import React from 'react';
import { Camera, PlayCircle } from 'lucide-react';
import { LanguageCode, getTranslation } from '../../i18n/translations';

interface HeroProps {
  language: LanguageCode;
  city: string;
  onSnapScan: () => void;
  onViewDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ language, city, onSnapScan, onViewDemo }) => {
  const title = getTranslation('hero.title', language, city);
  const subtitle = getTranslation('hero.subtitle', language, city);
  const scanText = getTranslation('hero.btn.scan', language, city);
  const demoText = getTranslation('hero.btn.demo', language, city);

  return (
    <section className="hero mb-24 max-w-4xl">
      <h1 className="h1-display font-display text-white mb-6 fade-rise leading-tight">
        {title}
      </h1>
      <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-10 fade-rise delay-200 leading-relaxed">
        {subtitle}
      </p>
      <div className="flex flex-wrap gap-4 fade-rise delay-400">
        <button
          onClick={onSnapScan}
          className="bg-white text-black px-8 py-4 rounded-full flex items-center gap-3 font-semibold text-[15px] md:text-[16px] btn-hover shadow-xl shadow-white/5 cursor-pointer"
        >
          <Camera className="w-5 h-5 text-black" />
          <span>{scanText}</span>
        </button>
        <button
          onClick={onViewDemo}
          className="border border-white/20 hover:bg-white/5 px-8 py-4 rounded-full font-medium text-[15px] md:text-[16px] transition-all flex items-center gap-2 cursor-pointer text-white"
        >
          <PlayCircle className="w-5 h-5 text-sky-400" />
          <span>{demoText}</span>
        </button>
      </div>
    </section>
  );
};
