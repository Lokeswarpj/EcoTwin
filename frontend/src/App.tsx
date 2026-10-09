import React, { useEffect, useState } from 'react';
import { CelestialCanvas } from './components/CelestialCanvas';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/dashboard/Hero';
import { MetricCards } from './components/dashboard/MetricCards';
import { ScoreGauge } from './components/dashboard/ScoreGauge';
import { UploadHub } from './components/upload/UploadHub';
import { SolarPanel } from './components/solar/SolarPanel';
import { ActionStream } from './components/actions/ActionStream';
import { AgentTraceDrawer } from './components/agents/AgentTraceDrawer';
import { ScannerModal } from './components/modals/ScannerModal';
import { AutopilotModal } from './components/modals/AutopilotModal';
import { LocationModal } from './components/modals/LocationModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { Footer } from './components/layout/Footer';
import { fetchDashboard, toggleActionStep, analyzeMedia } from './services/api';
import { DashboardResponse, ActionCard, TraceItem } from './types';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [city, setCity] = useState<string>('Bengaluru');
  const [language, setLanguage] = useState<string>('en');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [actions, setActions] = useState<ActionCard[]>([]);
  const [agentTrace, setAgentTrace] = useState<TraceItem[]>([]);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);

  // Modals state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [autopilotOpen, setAutopilotOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadData = async (selectedCity = city) => {
    try {
      const data = await fetchDashboard(selectedCity);
      setDashboardData(data);
      setActions(data.recent_actions);
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
        loadData(city);
      }
    } catch (e) {
      console.error('Step toggle error', e);
    }
  };

  const handleAnalysisSuccess = (newAction: ActionCard, trace: TraceItem[]) => {
    setActions((prev) => [newAction, ...prev]);
    setAgentTrace(trace);
    showNotification('AI Agent Audit Complete', `New action card: ${newAction.title} created!`);
    loadData(city);
    document.getElementById('action-stream-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCaptureScanner = async () => {
    setScannerOpen(false);
    try {
      const res = await analyzeMedia('waste', null, 'Tetra Pak Milk Carton dry packaging', city);
      handleAnalysisSuccess(res.action_card, res.trace);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen relative selection:bg-white/20">
      {/* Dynamic Celestial Background Canvas & Parallax */}
      <CelestialCanvas />

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
      />

      {/* Main Container */}
      <main className="pt-32 px-6 lg:px-20 max-w-[1440px] mx-auto pb-16">
        {/* Hero Section */}
        <Hero
          onSnapScan={() => setScannerOpen(true)}
          onViewDemo={() => setAutopilotOpen(true)}
        />

        {/* Dashboard Grid: Uploader & Stats + Score & Solar Panel */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          <section className="lg:col-span-8 space-y-8">
            <UploadHub
              city={city}
              onAnalysisSuccess={handleAnalysisSuccess}
              onOpenScanner={() => setScannerOpen(true)}
            />
            <MetricCards metrics={dashboardData?.metrics} />
          </section>

          <aside className="lg:col-span-4 space-y-8">
            <ScoreGauge metrics={dashboardData?.metrics} />
            <SolarPanel city={city} />
          </aside>
        </div>

        {/* AI Action Stream */}
        <ActionStream
          actions={actions}
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
        onCapture={handleCaptureScanner}
      />
      <AutopilotModal
        isOpen={autopilotOpen}
        city={city}
        onClose={() => setAutopilotOpen(false)}
        onPlanGenerated={() => {
          loadData(city);
          showNotification('Autopilot Plan Synchronized', 'Weekly sustainability plan updated.');
        }}
      />
      <LocationModal
        isOpen={locationOpen}
        selectedCity={city}
        onSelectCity={(newCity) => setCity(newCity)}
        onClose={() => setLocationOpen(false)}
      />
      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
};

export default App;
