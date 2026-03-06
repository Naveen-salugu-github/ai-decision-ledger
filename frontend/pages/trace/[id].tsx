import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTrace, useReplay } from "@/hooks/useTraces";
import TraceDetails from "@/components/TraceDetails";
import ResponseDiff from "@/components/ResponseDiff";
import TraceTimeline from "@/components/TraceTimeline";
import LatencyBadge from "@/components/LatencyBadge";

export default function TraceDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const { trace, steps, loading, error } = useTrace(id);
  const { result: replayResult, replaying, replay } = useReplay(id);
  const [replayCompletedAt, setReplayCompletedAt] = useState<string | null>(null);

  const hasRisk = steps.some((s) => s.risk_flag);
  const maxLatencyMs = steps.reduce(
    (max, s) => (typeof s.latency_ms === "number" && s.latency_ms > max ? s.latency_ms : max),
    0
  );
  const primaryStep = steps.find((s) => s.prompt != null || s.response != null);

  useEffect(() => {
    if (replayResult && "replay_response" in replayResult) {
      setReplayCompletedAt(new Date().toISOString());
    }
  }, [replayResult]);

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
          {replaying ? "Replaying…" : "Replay with Local Model"}
        </button>
      </div>

      {hasRisk && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-amber-200">
          <span className="text-lg" aria-hidden>⚠</span>
          <span className="text-sm font-medium">Risk Detected</span>
        </div>
      )}

      {/* Trace Info card */}
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Trace Info
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs text-slate-500">Agent</div>
            <div className="text-sm font-medium text-slate-100">{trace.agent}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Model</div>
            <div className="font-mono text-sm text-sky-300">{trace.model}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Created At</div>
            <div className="text-sm text-slate-300">
              {new Date(trace.created_at).toLocaleString()}
            </div>
          </div>
          {maxLatencyMs > 0 && (
            <div>
              <div className="text-xs text-slate-500">Latency</div>
              <LatencyBadge latencyMs={maxLatencyMs} />
            </div>
          )}
        </div>
      </div>

      {/* Prompt Card */}
      {primaryStep?.prompt != null && primaryStep.prompt !== "" && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Prompt
          </h2>
          <pre className="whitespace-pre-wrap break-words rounded bg-slate-950/70 p-3 text-xs text-slate-200">
            {primaryStep.prompt}
          </pre>
        </div>
      )}

      {/* Response Card */}
      {primaryStep?.response != null && primaryStep.response !== "" && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Response
          </h2>
          <pre className="whitespace-pre-wrap break-words rounded bg-slate-950/70 p-3 text-xs text-slate-200">
            {primaryStep.response}
          </pre>
        </div>
      )}

      {/* Replay Section */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Replay Section
        </h2>
        {replayError && (
          <div className="mb-4 rounded border border-rose-500/40 bg-rose-950/20 p-3 text-sm text-rose-300">
            {replayError}
          </div>
        )}
        {replayData && (
          <ResponseDiff
            originalResponse={replayData.original_response}
            replayResponse={replayData.replay_response}
            latencyMs={replayData.latency_ms}
          />
        )}
        {!replayData && !replayError && (
          <p className="text-sm text-slate-500">
            Click &quot;Replay with Local Model&quot; to re-run the prompt and compare outputs.
          </p>
        )}
      </div>

      {/* Trace Timeline */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Timeline
        </h2>
        <TraceTimeline
          trace={trace}
          steps={steps}
          replayExecutedAt={replayData ? replayCompletedAt ?? undefined : undefined}
          replayLatencyMs={replayData?.latency_ms}
        />
      </div>
    </div>
  );
}
