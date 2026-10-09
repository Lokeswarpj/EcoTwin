import React, { useEffect, useState } from 'react';
import { CelestialCanvas } from './components/CelestialCanvas';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/dashboard/Hero';
import { MetricCards } from './components/dashboard/MetricCards';
import { ScoreGauge } from './components/dashboard/ScoreGauge';
import { SolarPanel } from './components/solar/SolarPanel';
import { ActionStream } from './components/actions/ActionStream';
import { AgentTraceDrawer } from './components/agents/AgentTraceDrawer';
import { ScannerModal } from './components/modals/ScannerModal';
import { AutopilotModal } from './components/modals/AutopilotModal';
import { LocationModal } from './components/modals/LocationModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { DigitalTwinSimulatorModal } from './components/simulator/DigitalTwinSimulatorModal';
import { CircularDropOffModal } from './components/map/CircularDropOffModal';
import { VoiceCopilotModal } from './components/voice/VoiceCopilotModal';
import { ImpactCertificateModal } from './components/certificate/ImpactCertificateModal';
import { Footer } from './components/layout/Footer';
import { fetchDashboard, toggleActionStep, analyzeMedia } from './services/api';
import { DashboardResponse, ActionCard, TraceItem } from './types';
import { LanguageCode } from './i18n/translations';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [city, setCity] = useState<string>('Bengaluru');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [actions, setActions] = useState<ActionCard[]>([]);
  const [agentTrace, setAgentTrace] = useState<TraceItem[]>([]);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);

  // Modals state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [autopilotOpen, setAutopilotOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  const loadData = async (selectedCity = city) => {
    try {
      const data = await fetchDashboard(selectedCity);
      setDashboardData(data);
      setActions((prev) => {
        if (prev.length === 0) return data.recent_actions;
        const incomingIds = new Set(data.recent_actions.map((a) => a.id));
        const userCustom = prev.filter((a) => !incomingIds.has(a.id));
        return [...userCustom, ...data.recent_actions];
      });
    } catch (e) {
      console.error('Failed to load dashboard', e);
    }
  };

  useEffect(() => {
    loadData(city);
  }, [city]);

  const showNotification = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleToggleStep = async (actionId: string, stepIdx: number, currentDone: boolean) => {
    const nextDone = !currentDone;
    // Optimistic UI update
    setActions((prev) =>
      prev.map((a) => {
        if (a.id === actionId) {
          const newSteps = [...a.steps];
          newSteps[stepIdx].done = nextDone;
          return { ...a, steps: newSteps };
        }
        return a;
      })
    );

    try {
      const res = await toggleActionStep(actionId, stepIdx, nextDone);
      if (res.success) {
        showNotification(
          nextDone ? 'Action Step Completed!' : 'Step Reset',
          nextDone
            ? `+25 Eco Points awarded! Planet Score improved to ${res.updated_planet_score}.`
            : 'Step unmarked.'
        );
      }
    } catch (e) {
      console.error('Step toggle error', e);
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisSuccess = (newAction: ActionCard, trace: TraceItem[]) => {
    setIsAnalyzing(false);
    // Prepend new action card immediately
    setActions((prev) => [newAction, ...prev.filter((a) => a.id !== newAction.id)]);
    setAgentTrace(trace);
    showNotification('AI Agent Audit Complete', `New action card: ${newAction.title} created!`);

    // Optimistically update dashboard stats with this action's impact
    setDashboardData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          planet_score: Math.min(100, Number((prev.metrics.planet_score + (newAction.points / 25)).toFixed(1))),
          points: prev.metrics.points + newAction.points,
          monthly_waste_diverted_kg: Number((prev.metrics.monthly_waste_diverted_kg + (newAction.category.includes('Recycle') ? 0.35 : 0)).toFixed(1)),
          monthly_carbon_used_kg: Math.max(0, Number((prev.metrics.monthly_carbon_used_kg - (newAction.co2_saving_kg || 0)).toFixed(1)))
        }
      };
    });

    // Scroll cleanly to the action stream section
    setTimeout(() => {
      const el = document.getElementById('action-stream-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleUploadFileScanner = async (file: File) => {
    setScannerOpen(false);
    setIsAnalyzing(true);
    try {
      showNotification('Analyzing Photo with Gemini AI...', 'Identifying material polymers, carbon footprint, and local recycling rules.');
      const res = await analyzeMedia('waste', file, undefined, city);
      handleAnalysisSuccess(res.action_card, res.trace);
    } catch (e) {
      console.error(e);
      setIsAnalyzing(false);
      showNotification('Analysis Error', 'Could not complete scan. Please try again.');
    }
  };

  const handleSimulateCapture = async () => {
    setScannerOpen(false);
    setIsAnalyzing(true);
    try {
      showNotification('Running AI Planetary Audit...', 'Auditing Tetra Pak packaging sample.');
      const res = await analyzeMedia('waste', null, 'Tetra Pak Milk Carton dry packaging', city);
      handleAnalysisSuccess(res.action_card, res.trace);
    } catch (e) {
      console.error(e);
      setIsAnalyzing(false);
    }
  };

  const handleUploadBillScanner = async (file: File) => {
    setScannerOpen(false);
    setIsAnalyzing(true);
    try {
      showNotification('Auditing Utility / Grocery Bill...', 'Gemini OCR extracting tariffs, line-item footprints, and instant greener swaps.');
      const res = await analyzeMedia('bill', file, undefined, city);
      handleAnalysisSuccess(res.action_card, res.trace);
    } catch (e) {
      console.error(e);
      setIsAnalyzing(false);
      showNotification('Bill Audit Error', 'Could not process bill. Please try again.');
    }
  };

  const handleSimulateBill = async () => {
    setScannerOpen(false);
    setIsAnalyzing(true);
    try {
      showNotification('Auditing BESCOM Power Statement...', 'Extracting 340 kWh consumption & peak thermal coal emission tiers.');
      const res = await analyzeMedia('bill', null, 'BESCOM 340 kWh monthly bill', city);
      handleAnalysisSuccess(res.action_card, res.trace);
    } catch (e) {
      console.error(e);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative selection:bg-white/20">
      {/* Dynamic Celestial Background Canvas & Parallax */}
      <CelestialCanvas />

      {/* Floating Global Analyzing HUD */}
      {isAnalyzing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 rounded-full border border-cyan-400/50 shadow-2xl flex items-center gap-3 bg-black/80 backdrop-blur-xl animate-pulse">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-sm font-medium text-cyan-200">
            Gemini Vision AI: Auditing footprint &amp; calculating municipal rules...
          </span>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 glass px-5 py-4 rounded-2xl flex items-center gap-3.5 shadow-2xl border border-green-400/40 text-green-300 max-w-sm fade-rise">
          <div className="p-2 rounded-xl bg-white/10 text-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h5 className="text-sm font-semibold text-white">{toastMsg.title}</h5>
            <p className="text-xs text-white/70">{toastMsg.desc}</p>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        cityContext={dashboardData?.city_context}
        language={language}
        onOpenLocation={() => setLocationOpen(true)}
        onOpenAutopilot={() => setAutopilotOpen(true)}
        onSelectLanguage={(l) => setLanguage(l)}
        onOpenSimulator={() => setSimulatorOpen(true)}
        onOpenMap={() => setMapOpen(true)}
        onOpenVoice={() => setVoiceOpen(true)}
        onOpenCertificate={() => setCertOpen(true)}
      />

      {/* Main Container */}
      <main className="pt-32 px-6 lg:px-20 max-w-[1440px] mx-auto pb-16">
        {/* Hero Section */}
        <Hero
          language={language}
          city={city}
          onSnapScan={() => setScannerOpen(true)}
          onViewDemo={() => setAutopilotOpen(true)}
        />

        {/* Dashboard Grid: Metrics & Solar + Score Gauge */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          <section className="lg:col-span-8 space-y-8">
            <MetricCards metrics={dashboardData?.metrics} language={language} city={city} />
            <SolarPanel city={city} />
          </section>

          <aside className="lg:col-span-4 space-y-8">
            <ScoreGauge metrics={dashboardData?.metrics} />
          </aside>
        </div>

        {/* AI Action Stream */}
        <ActionStream
          actions={actions}
          language={language}
          city={city}
          onToggleStep={handleToggleStep}
          onOpenHistory={() => setHistoryOpen(true)}
        />
      </main>

      {/* Expandable Agent Trace Drawer for Judges */}
      <AgentTraceDrawer trace={agentTrace} />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onUploadFile={handleUploadFileScanner}
        onSimulateCapture={handleSimulateCapture}
        onUploadBill={handleUploadBillScanner}
        onSimulateBill={handleSimulateBill}
      />
      <AutopilotModal
        isOpen={autopilotOpen}
        city={city}
        language={language}
        onClose={() => setAutopilotOpen(false)}
        onPlanGenerated={() => {
          loadData(city);
          showNotification('Autopilot Plan Synchronized', 'Weekly sustainability plan updated.');
        }}
      />
      <LocationModal
        isOpen={locationOpen}
        selectedCity={city}
        selectedLanguage={language}
        onSelectCity={(newCity) => setCity(newCity)}
        onSelectLanguage={(l) => setLanguage(l)}
        onClose={() => setLocationOpen(false)}
      />
      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
      <DigitalTwinSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        currentPlanetScore={dashboardData?.metrics?.planet_score || 78.5}
        onApplyToAutopilot={(settings) => {
          showNotification('Digital Twin Settings Applied', 'Monthly autopilot budget updated with your new lifestyle targets.');
          loadData(city);
        }}
      />
      <CircularDropOffModal
        isOpen={mapOpen}
        city={city}
        onClose={() => setMapOpen(false)}
      />
      <VoiceCopilotModal
        isOpen={voiceOpen}
        city={city}
        onClose={() => setVoiceOpen(false)}
        onActionCreated={(newAction, trace) => {
          handleAnalysisSuccess(newAction, trace);
        }}
      />
      <ImpactCertificateModal
        isOpen={certOpen}
        dashboardData={dashboardData}
        city={city}
        onClose={() => setCertOpen(false)}
      />
    </div>
  );
};

export default App;
