const LEDGER_API_URL =
  process.env.AI_DECISION_LEDGER_API_URL || "http://localhost:4000";

export interface TraceData {
  agent: string;
  model: string;
  prompt: string;
  response: string;
  latency: number;
  /** Optional: prompt token count */
  tokens_prompt?: number;
  /** Optional: completion token count */
  tokens_completion?: number;
  /** Optional: temperature used */
  temperature?: number;
  timestamp?: string;
  tool_calls?: string[];
  risk_flag?: boolean;
}

/**
 * Send a trace event to the AI Decision Ledger backend.
 * Fires-and-forget; does not throw on network errors.
 */
export async function trace(data: TraceData): Promise<void> {
  const body = {
    agent: data.agent,
    model: data.model,
    prompt: data.prompt,
    response: data.response,
    latency: data.latency,
    timestamp: data.timestamp || new Date().toISOString(),
    tool_calls: data.tool_calls ?? [],
    risk_flag: data.risk_flag ?? false,
    ...(data.tokens_prompt != null && { tokens_prompt: data.tokens_prompt }),
    ...(data.tokens_completion != null && { tokens_completion: data.tokens_completion }),
    ...(data.temperature != null && { temperature: data.temperature }),
  };

  try {
    const res = await fetch(`${LEDGER_API_URL}/trace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn("[ai-decision-ledger] trace failed:", res.status, await res.text());
    }
  } catch (err) {
    console.warn("[ai-decision-ledger] trace error:", err);
  }
}
