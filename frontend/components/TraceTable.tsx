import Link from "next/link";
import type { TraceSummary } from "@/api/traces";
import LatencyBadge from "./LatencyBadge";

interface TraceTableProps {
  traces: TraceSummary[];
  loading: boolean;
  error: string | null;
}

export default function TraceTable({ traces, loading, error }: TraceTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
        Loading traces…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-rose-400">
        {error}
      </div>
    );
  }

  if (traces.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
        No traces yet. Use the SDK: <code className="mt-2 block text-sky-300">wrapOllama().generate(...)</code>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Agent</th>
            <th className="px-4 py-3 font-medium">Model</th>
            <th className="px-4 py-3 font-medium">Latency</th>
            <th className="px-4 py-3 font-medium">Risk</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {traces.map((trace) => (
            <tr
              key={trace.id}
              className="border-b border-slate-900/60 hover:bg-slate-800/50"
            >
              <td className="px-4 py-3 text-slate-100">{trace.agent}</td>
              <td className="px-4 py-3 font-mono text-slate-300">{trace.model}</td>
              <td className="px-4 py-3">
                <LatencyBadge latencyMs={trace.max_latency_ms ?? 0} />
              </td>
              <td className="px-4 py-3">
                {trace.has_risk ? (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs text-rose-300">
                    High
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400">
                    Normal
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(trace.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/trace/${trace.id}`}
                  className="rounded border border-slate-600 bg-slate-800/80 px-2 py-1.5 text-xs text-sky-300 hover:border-sky-500 hover:bg-slate-800"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
