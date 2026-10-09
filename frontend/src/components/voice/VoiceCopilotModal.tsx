import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, Send, ArrowRight, Radio } from 'lucide-react';
import { sendVoiceCommand } from '../../services/api';
import { ActionCard, TraceItem } from '../../types';

interface VoiceCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  city?: string;
  onActionCreated: (action: ActionCard, trace: TraceItem[]) => void;
}

export const VoiceCopilotModal: React.FC<VoiceCopilotModalProps> = ({
  isOpen,
  onClose,
  city = 'Bengaluru',
  onActionCreated
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentReply, setAgentReply] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      setTranscript('');
      setAgentReply(null);
      return;
    }

    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Multi-accent English/Indian

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. You can type your command below!');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      setTranscript('');
      setAgentReply(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExecuteVoice = async (textToRun = transcript) => {
    if (!textToRun.trim()) return;
    setIsProcessing(true);
    try {
      const res = await sendVoiceCommand(textToRun, city);
      const reply = `Successfully parsed action: ${res.action_card.title}. Saved ${res.action_card.co2_saving_kg} kg CO2!`;
      setAgentReply(reply);
      speakText(reply);
      onActionCreated(res.action_card, res.trace);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      console.error(e);
      setAgentReply('Could not parse speech intent. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-xl w-full rounded-[32px] p-6 lg:p-8 relative border border-cyan-400/40 shadow-[0_0_60px_rgba(34,211,238,0.25)]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Radio className="w-5 h-5 text-black animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white flex items-center gap-2">
                Gemini Ambient Voice Copilot
              </h3>
              <p className="text-xs text-white/60">
                Speak naturally in English, Kannada, or Hindi to log transit, audit bills, or get recycling steps.
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

        {/* Central Pulsing Microphone Visualizer */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping" />
                <div className="absolute -inset-4 rounded-full bg-cyan-400/20 animate-pulse" />
              </>
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-rose-500/40 scale-110'
                  : 'bg-gradient-to-tr from-cyan-400 to-emerald-400 text-black shadow-cyan-500/30 hover:scale-105'
              }`}
            >
              {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <MicOff className="w-10 h-10" />}
            </button>
          </div>

          <span className="font-mono text-xs text-white/70 mt-4 tracking-wide">
            {isListening ? 'Listening to your speech... (Speak now)' : 'Tap microphone to speak'}
          </span>
        </div>

        {/* Live Speech Transcription Box */}
        <div className="space-y-3 mb-6">
          <div className="min-h-[70px] p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center text-sm text-white/90">
            {transcript ? (
              <span className="italic font-medium text-cyan-200">"{transcript}"</span>
            ) : (
              <span className="text-white/30 text-xs">
                Example: "I took Namma Metro from Indiranagar to MG Road today" or "How to recycle broken CFL bulbs"
              </span>
            )}
          </div>

          {agentReply && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{agentReply}</span>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="mb-6 space-y-1.5">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">
            Tap Quick Voice Commands:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              "Took Metro for 12 km instead of cab",
              "Audited BESCOM power bill for 280 kWh",
              "Recycled 4 PET water bottles at DWCC kiosk",
              "Ate 2 plant-based meals today"
            ].map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(sample);
                  handleExecuteVoice(sample);
                }}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer text-left"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Submit & Run Button */}
        <button
          onClick={() => handleExecuteVoice(transcript)}
          disabled={!transcript || isProcessing}
          className={`w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            transcript && !isProcessing
              ? 'bg-white text-black hover:bg-cyan-300 shadow-lg shadow-white/10'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Gemini AI Processing Voice Action...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Execute Planetary Voice Action</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
