import { useEffect, useState } from "react";

interface TraceSummary {
  id: string;
  agent: string;
  model: string;
  created_at: string;
  max_latency_ms: number;
  has_risk: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function IndexPage() {
  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/traces`);
        if (!res.ok) {
          throw new Error(`Failed to load traces (${res.status})`);
        }
        const data = await res.json();
        setTraces(data.traces || []);
      } catch (err: any) {
        setError(err.message || "Failed to load traces");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalTraces = traces.length;
  const highRiskCount = traces.filter((t) => t.has_risk).length;
  const avgLatency =
    traces.length > 0
      ? Math.round(
          traces.reduce((acc, t) => acc + (t.max_latency_ms || 0), 0) /
            traces.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">
          AI Decision Ledger
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Observability and debugging infrastructure for AI workflows.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total Traces
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-50">
            {totalTraces}
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              High-Risk Actions
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-rose-400">
            {highRiskCount}
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Avg Latency (ms)
          </div>
          <div className="mt-2 text-2xl font-semibold text-sky-400">
            {avgLatency}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h2 className="text-sm font-medium text-slate-100">
            Recent Traces
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-sm text-slate-400">Loading traces…</div>
          ) : error ? (
            <div className="p-4 text-sm text-rose-400">{error}</div>
          ) : traces.length === 0 ? (
            <div className="p-4 text-sm text-slate-400">
              No traces yet. Instrument your AI calls with the Python SDK.
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Agent</th>
                  <th className="px-4 py-2 font-medium">Model</th>
                  <th className="px-4 py-2 font-medium">Time</th>
                  <th className="px-4 py-2 font-medium">Latency</th>
                  <th className="px-4 py-2 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {traces.slice(0, 10).map((trace) => (
                  <tr
                    key={trace.id}
                    className="border-b border-slate-900/60 hover:bg-slate-900/60"
                  >
                    <td className="px-4 py-2 text-slate-100">
                      {trace.agent}
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {trace.model}
                    </td>
                    <td className="px-4 py-2 text-slate-400">
                      {new Date(trace.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {trace.max_latency_ms ?? 0} ms
                    </td>
                    <td className="px-4 py-2">
                      {trace.has_risk ? (
                        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs text-rose-300">
                          High
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

