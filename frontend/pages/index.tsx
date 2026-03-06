import Link from "next/link";
import { useTraces } from "@/hooks/useTraces";
import TraceTable from "@/components/TraceTable";
import LatencyBadge from "@/components/LatencyBadge";

export default function IndexPage() {
  const { traces, loading, error } = useTraces();

  const totalTraces = traces.length;
  const highRiskCount = traces.filter((t) => t.has_risk).length;
  const avgLatency =
    traces.length > 0
      ? Math.round(
          traces.reduce((acc, t) => acc + (t.max_latency_ms || 0), 0) / traces.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">AI Decision Ledger</h1>
        <p className="mt-1 text-sm text-slate-400">
          Local AI observability — trace, debug, and replay Ollama calls.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total Traces
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-50">{totalTraces}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            High-Risk
          </div>
          <div className="mt-2 text-2xl font-semibold text-rose-400">{highRiskCount}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Avg Latency
          </div>
          <div className="mt-2">
            <LatencyBadge latencyMs={avgLatency} className="text-lg" />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-100">Recent Traces</h2>
          <Link href="/traces" className="text-xs text-sky-400 hover:underline">
            View all →
          </Link>
        </div>
        <TraceTable traces={traces.slice(0, 10)} loading={loading} error={error} />
      </div>
    </div>
  );
}
