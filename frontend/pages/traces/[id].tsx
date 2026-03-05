import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TraceTimeline, { TraceStep } from "@/components/TraceTimeline";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface Trace {
  id: string;
  agent: string;
  model: string;
  created_at: string;
}

interface TraceResponse {
  trace: Trace;
  steps: TraceStep[];
}

export default function TraceDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState<TraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replayResult, setReplayResult] = useState<any | null>(null);
  const [replaying, setReplaying] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/trace/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to load trace (${res.status})`);
        }
        const body = await res.json();
        setData(body);
      } catch (err: any) {
        setError(err.message || "Failed to load trace");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const onReplay = async () => {
    if (!id || typeof id !== "string") return;
    setReplaying(true);
    setReplayResult(null);
    try {
      const res = await fetch(`${API_BASE}/trace/${id}/replay`, {
        method: "POST"
      });
      const body = await res.json();
      setReplayResult(body);
    } catch (err: any) {
      setReplayResult({ error: err.message || "Replay failed" });
    } finally {
      setReplaying(false);
    }
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="text-sm text-slate-400">Loading trace…</div>
      ) : error ? (
        <div className="text-sm text-rose-400">{error}</div>
      ) : !data ? (
        <div className="text-sm text-slate-400">Trace not found.</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-50">
                Trace Timeline
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Agent <span className="font-medium">{data.trace.agent}</span> ·
                Model <span className="font-mono">{data.trace.model}</span>
              </p>
              <p className="text-xs text-slate-500">
                {new Date(data.trace.created_at).toLocaleString()} · ID{" "}
                <code className="rounded bg-slate-950/70 px-1.5 py-0.5">
                  {data.trace.id}
                </code>
              </p>
            </div>
            <button
              type="button"
              onClick={onReplay}
              disabled={replaying}
              className="inline-flex items-center gap-2 rounded border border-sky-600 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {replaying ? "Replaying…" : "Replay Trace"}
            </button>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <TraceTimeline steps={data.steps} />
          </div>

          {replayResult && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Replay Result (MVP)
              </div>
              <pre className="max-h-64 overflow-auto rounded bg-slate-950/80 p-3 text-xs text-slate-100">
{JSON.stringify(replayResult, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

