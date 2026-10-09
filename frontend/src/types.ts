export interface TraceItem {
  agent_name: string;
  status: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  explanation: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface ActionStep {
  text: string;
  done: boolean;
}

export interface TradeOffData {
  option_a: string;
  fare_a: string;
  option_b: string;
  fare_b: string;
  recommendation: string;
}

export interface ActionCard {
  id: string;
  category: string;
  title: string;
  description: string;
  co2_saving_kg: number;
  points: number;
  color: 'green' | 'amber' | 'blue';
  agent_name: string;
  status: 'pending' | 'completed';
  in_plan: boolean;
  trade_off?: TradeOffData | null;
  steps: ActionStep[];
  created_at: string;
}

export interface EventItem {
  id: string;
  timestamp: string;
  activity_type: string;
  source: string;
  description: string;
  carbon_impact_kg: number;
  waste_diverted_kg: number;
  water_consumed_l: number;
  confidence: number;
  assumptions: string;
  is_demo: boolean;
}

export interface DashboardMetrics {
  planet_score: number;
  monthly_carbon_used_kg: number;
  monthly_carbon_budget_kg: number;
  monthly_waste_diverted_kg: number;
  monthly_waste_budget_kg: number;
  monthly_water_consumed_l: number;
  monthly_water_budget_l: number;
  points: number;
  streak_days: number;
  days_left_in_month: number;
  budget_forecast_alert: string;
  forecast_overshoot_days?: number | null;
}

export interface CityContext {
  city: string;
  temperature_c: number;
  condition: string;
  humidity_pct?: number;
  wind_speed_kmh?: number;
  aqi: number;
  aqi_category: string;
  dominant_pollutant: string;
  recommendation: string;
  source: string;
  is_live: boolean;
  last_updated: string;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  recent_actions: ActionCard[];
  recent_events: EventItem[];
  city_context: CityContext;
  trace: TraceItem[];
}

export interface SolarSimulationResult {
  roof_area_kw: number;
  annual_generation_kwh: number;
  annual_co2e_avoided_tons: number;
  annual_savings_inr: number;
  estimated_payback_years: number;
  trees_equivalent: number;
  methodology_note: string;
}

export interface AnalyzeResult {
  input_type: string;
  specialist: string;
  data: Record<string, any>;
  action_card: ActionCard;
  event_logged?: EventItem;
  trace: TraceItem[];
  is_live_ai: boolean;
}

export interface WeeklyPlan {
  week_id: string;
  title: string;
  summary: string;
  projected_co2e_reduction_kg: number;
  actions: ActionCard[];
  context_notes: string;
  trace: TraceItem[];
}

