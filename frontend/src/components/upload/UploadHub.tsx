import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Mic, Loader2 } from 'lucide-react';
import { analyzeMedia } from '../../services/api';
import { ActionCard, TraceItem } from '../../types';

interface UploadHubProps {
  city?: string;
  onAnalysisSuccess: (action: ActionCard, trace: TraceItem[]) => void;
  onOpenScanner: () => void;
}

type TabType = 'waste' | 'food' | 'energy' | 'mobility';

const TAB_META: Record<TabType, { label: string; title: string; sub: string }> = {
  waste: {
    label: 'Waste Photo',
    title: 'Drag & drop waste photo or snap live',
    sub: 'Supports JPG, PNG, WebP — Instant Gemini 1.5 item classifier'
  },
  food: {
    label: 'Fridge / Receipt',
    title: 'Upload fridge picture or grocery receipt',
    sub: 'Scans perishables, estimates spoilage risk & suggests low-emission recipes'
  },
  energy: {
    label: 'Electricity Bill',
    title: 'Upload Electricity / Utility bill PDF or image',
    sub: 'Extracts kWh peak tariff usage & benchmarks against 1.5°C neighborhood target'
  },
  mobility: {
    label: 'Commute Note',
    title: 'Dictate or write commute route notes',
    sub: 'Calculate multimodal transit routes with lowest carbon-to-cost ratio'
  }
};

export const UploadHub: React.FC<UploadHubProps> = ({
  city = 'Bengaluru',
  onAnalysisSuccess,
  onOpenScanner
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('waste');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const res = await analyzeMedia(activeTab, file, undefined, city);
      onAnalysisSuccess(res.action_card, res.trace);
    } catch (err) {
      console.error('Upload analysis failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateText = async (textDescription: string) => {
    setIsLoading(true);
    try {
      const res = await analyzeMedia(activeTab, null, textDescription, city);
      onAnalysisSuccess(res.action_card, res.trace);
    } catch (err) {
      console.error('Text analysis failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-[32px] fade-rise delay-600">
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {(Object.keys(TAB_META) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'text-white font-medium border-b-2 border-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {TAB_META[tab].label}
            </button>
          ))}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer relative overflow-hidden ${
          isDragging
            ? 'border-blue-400 bg-white/15'
            : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-sm text-white/80 font-medium">Cooperating Gemini Agents Analyzing Input...</p>
            <p className="text-xs text-white/40">Router → Specialist → Verifier Pipeline</p>
          </div>
        ) : (
          <>
            <UploadCloud className="w-10 h-10 text-white/30 group-hover:text-white/60 transition-colors" />

            <div className="text-center px-4">
              <p className="text-white/70 font-medium text-sm md:text-base">
                {TAB_META[activeTab].title}
              </p>
              <p className="text-xs text-white/40 mt-1">{TAB_META[activeTab].sub}</p>
            </div>

            <div className="flex gap-4 mt-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenScanner();
                }}
                className="p-3 rounded-full bg-white text-black btn-hover shadow-md cursor-pointer"
                title="Snap with Camera"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateText('Daily commute Indiranagar to Whitefield 12 km by car');
                }}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer"
                title="Voice Input"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
