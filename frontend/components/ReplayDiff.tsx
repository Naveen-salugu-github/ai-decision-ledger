import React from "react";

export interface ReplayDiffProps {
  originalResponse: string | null;
  replayResponse: string;
  latencyMs?: number;
}

export default function ReplayDiff({
  originalResponse,
  replayResponse,
  latencyMs,
}: ReplayDiffProps) {
  const left = originalResponse ?? "(no original response)";
  const right = replayResponse ?? "(no replay response)";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span>Original vs Replay</span>
        {typeof latencyMs === "number" && (
          <span className="text-sky-400">Replay: {latencyMs} ms</span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-700 bg-slate-900/60">
          <div className="border-b border-slate-700 px-3 py-2 text-xs font-medium text-slate-400">
            Original response
          </div>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-3 text-xs text-slate-200">
            {left}
          </pre>
        </div>
        <div className="rounded-lg border border-sky-500/40 bg-sky-950/20">
          <div className="border-b border-sky-500/40 px-3 py-2 text-xs font-medium text-sky-300">
            Replay response
          </div>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-3 text-xs text-slate-200">
            {right}
          </pre>
        </div>
      </div>
    </div>
  );
}
