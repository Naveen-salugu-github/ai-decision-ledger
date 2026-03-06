import { useRouter } from "next/router";
import Link from "next/link";
import { useTrace, useReplay } from "@/hooks/useTraces";
import TraceDetails from "@/components/TraceDetails";
import ReplayDiff from "@/components/ReplayDiff";

export default function TraceDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const { trace, steps, loading, error } = useTrace(id);
  const { result: replayResult, replaying, replay } = useReplay(id);

  if (loading && !trace) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
        Loading trace…
      </div>
    );
  }

  if (error || (!loading && id && !trace)) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-rose-400">{error ?? "Trace not found."}</div>
        <Link href="/traces" className="text-sm text-sky-400 hover:underline">
          ← Back to traces
        </Link>
      </div>
    );
  }

  if (!trace) return null;

  const replayData = replayResult && "replay_response" in replayResult ? replayResult : null;
  const replayError = replayResult && "error" in replayResult ? replayResult.error : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/traces" className="text-xs text-slate-500 hover:text-sky-400">
            ← Traces
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-50">Trace</h1>
          <p className="mt-1 text-sm text-slate-400">
            {trace.agent} · {trace.model}
          </p>
        </div>
        <button
          type="button"
          onClick={() => replay()}
          disabled={replaying}
          className="rounded border border-sky-600 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 hover:bg-sky-500/20 disabled:opacity-50"
        >
          {replaying ? "Replaying…" : "Replay Trace"}
        </button>
      </div>

      <TraceDetails trace={trace} steps={steps} />

      {replayError && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-4 text-sm text-rose-300">
          {replayError}
        </div>
      )}

      {replayData && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <ReplayDiff
            originalResponse={replayData.original_response}
            replayResponse={replayData.replay_response}
            latencyMs={replayData.latency_ms}
          />
        </div>
      )}
    </div>
  );
}
