import { DashboardResponse, SolarSimulationResult, AnalyzeResult, ActionCard, EventItem, CityContext, WeeklyPlan } from '../types';

const API_BASE = '/api';

export async function fetchDashboard(city: string = 'Bengaluru'): Promise<DashboardResponse> {
  const res = await fetch(`${API_BASE}/dashboard?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchContext(city: string = 'Bengaluru'): Promise<CityContext> {
  const res = await fetch(`${API_BASE}/context?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error('Failed to fetch context');
  return res.json();
}

export async function simulateSolar(roofAreaKw: number, city: string = 'Bengaluru'): Promise<SolarSimulationResult> {
  const res = await fetch(`${API_BASE}/solar/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roof_area_kw: roofAreaKw, city })
  });
  if (!res.ok) throw new Error('Failed to simulate solar');
  return res.json();
}

export async function toggleActionStep(actionId: string, stepIdx: number, done: boolean): Promise<any> {
  const res = await fetch(`${API_BASE}/actions/${actionId}/step/${stepIdx}?done=${done}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to toggle action step');
  return res.json();
}

export async function analyzeMedia(
  type: 'waste' | 'food' | 'energy' | 'mobility',
  file?: File | null,
  text?: string,
  city: string = 'Bengaluru'
): Promise<AnalyzeResult> {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (text) formData.append('input_text', text);
  formData.append('city', city);

  const res = await fetch(`${API_BASE}/analyze/${type}`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(`Analysis failed for ${type}`);
  return res.json();
}

export async function generateWeeklyPlan(city: string = 'Bengaluru'): Promise<WeeklyPlan> {
  const res = await fetch(`${API_BASE}/planner/generate?city=${encodeURIComponent(city)}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to generate weekly plan');
  return res.json();
}

export async function fetchHistory(): Promise<EventItem[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}
