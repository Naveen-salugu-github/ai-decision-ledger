const API_BASE =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "http://localhost:4000";

export interface TraceSummary {
  id: string;
  agent: string;
  model: string;
  created_at: string;
  max_latency_ms: number;
  has_risk: boolean;
}

export interface TraceStep {
  id: string;
  prompt?: string | null;
  response?: string | null;
  tool_call?: string | null;
  latency_ms?: number | null;
  risk_flag?: boolean;
  tokens_prompt?: number | null;
  tokens_completion?: number | null;
  temperature?: number | null;
  created_at: string;
}

export interface Trace {
  id: string;
  agent: string;
  model: string;
  created_at: string;
}

export interface TraceDetailResponse {
  trace: Trace;
  steps: TraceStep[];
}

export interface ReplayResponse {
  model: string;
  original_prompt: string;
  original_response: string | null;
  replay_response: string;
  latency_ms: number;
}

export async function fetchTraces(): Promise<TraceSummary[]> {
  const res = await fetch(`${API_BASE}/traces`);
  if (!res.ok) throw new Error(`Failed to load traces (${res.status})`);
  const data = await res.json();
  return data.traces ?? [];
}

export async function fetchTrace(id: string): Promise<TraceDetailResponse> {
  const res = await fetch(`${API_BASE}/trace/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Trace not found");
    throw new Error(`Failed to load trace (${res.status})`);
  }
  return res.json();
}

export async function replayTrace(id: string): Promise<ReplayResponse | { error: string }> {
  const res = await fetch(`${API_BASE}/trace/${id}/replay`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) return { error: data.error ?? "Replay failed" };
  return data as ReplayResponse;
}
