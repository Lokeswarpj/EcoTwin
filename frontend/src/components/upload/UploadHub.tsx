import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Mic, Loader2, FileImage, CheckCircle2 } from 'lucide-react';
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
    title: 'Upload or drag & drop waste item photo',
    sub: 'Instant Gemini polymer breakdown, BBMP segregation & landfill diversion'
  },
  food: {
    label: 'Fridge / Receipt',
    title: 'Upload fridge photo or grocery receipt',
    sub: 'Scans perishables, estimates shelf-life & suggests low-emission recipes'
  },
  energy: {
    label: 'Electricity Bill',
    title: 'Upload BESCOM / Electricity bill PDF or photo',
    sub: 'Extracts kWh consumption & calculates peak solar load shifting'
  },
  mobility: {
    label: 'Commute Note',
    title: 'Describe your daily commute or upload transit ticket',
    sub: 'Compares Metro vs Bus vs Driving with time and emission trade-offs'
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      await processUpload(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      await processUpload(file);
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
              onClick={() => {
                setActiveTab(tab);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
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
        className={`border-2 border-dashed rounded-2xl min-h-[16rem] p-6 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer relative overflow-hidden ${
          isDragging
            ? 'border-cyan-400 bg-white/15'
            : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-sm text-white/90 font-medium">Cooperating Gemini Agents Auditing Photo...</p>
            <p className="text-xs text-white/40 font-mono">Router → Specialist → Verifier Pipeline</p>
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/20">
              <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <p className="text-sm text-green-400 font-medium flex items-center gap-1.5 justify-center">
                <CheckCircle2 className="w-4 h-4" />
                {selectedFile?.name || 'Photo Ready'}
              </p>
              <p className="text-xs text-white/40 mt-0.5">Click to choose a different photo</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-cyan-400">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="text-center px-4">
              <p className="text-white/80 font-medium text-sm md:text-base">
                {TAB_META[activeTab].title}
              </p>
              <p className="text-xs text-white/40 mt-1 max-w-md">{TAB_META[activeTab].sub}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-full bg-white text-black font-medium text-xs md:text-sm hover:bg-white/90 transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <FileImage className="w-4 h-4" />
                Browse Device Photos
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenScanner();
                }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15 cursor-pointer"
                title="Camera Scanner"
              >
                <Camera className="w-4 h-4 text-cyan-300" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateText('Commute: 12 km to work daily via car vs metro in Bengaluru');
                }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15 cursor-pointer"
                title="Voice / Text Commute Note"
              >
                <Mic className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
