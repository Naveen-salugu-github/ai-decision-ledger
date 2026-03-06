import React from "react";

export interface ResponseDiffProps {
  originalResponse: string | null;
  replayResponse: string;
  latencyMs?: number;
}

function diffLines(original: string, replay: string): {
  leftLines: string[];
  rightLines: string[];
  leftClass: ("same" | "changed")[];
  rightClass: ("same" | "changed" | "new")[];
} {
  const leftLines = original.split(/\n/);
  const rightLines = replay.split(/\n/);
  const maxLen = Math.max(leftLines.length, rightLines.length, 1);
  const leftClass: ("same" | "changed")[] = [];
  const rightClass: ("same" | "changed" | "new")[] = [];

  for (let i = 0; i < maxLen; i++) {
    const l = leftLines[i] ?? "";
    const r = rightLines[i] ?? "";
    if (l === r) {
      leftClass.push("same");
      rightClass.push("same");
    } else {
      leftClass.push("changed");
      rightClass.push(i >= leftLines.length ? "new" : "changed");
    }
  }

  return { leftLines, rightLines, leftClass, rightClass };
}

export default function ResponseDiff({
  originalResponse,
  replayResponse,
  latencyMs,
}: ResponseDiffProps) {
  const left = originalResponse ?? "";
  const right = replayResponse ?? "";
  const { leftLines, rightLines, leftClass, rightClass } = diffLines(left, right);
  const maxRows = Math.max(leftLines.length, rightLines.length, 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span>Original vs Replay (line diff)</span>
        {typeof latencyMs === "number" && (
          <span className="text-sky-400">Replay: {latencyMs} ms</span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-700 bg-slate-900/60">
          <div className="border-b border-slate-700 px-3 py-2 text-xs font-medium text-slate-400">
            Original response
          </div>
          <div className="max-h-64 overflow-auto">
            {leftLines.length === 0 ? (
              <pre className="p-3 text-xs text-slate-500">(empty)</pre>
            ) : (
              <pre className="p-3 text-xs">
                {Array.from({ length: maxRows }, (_, i) => (
                  <div
                    key={i}
                    className={`whitespace-pre-wrap break-words ${
                      leftClass[i] === "changed"
                        ? "bg-rose-500/20 text-rose-200"
                        : "text-slate-200"
                    }`}
                  >
                    {(leftLines[i] ?? "") || "\n"}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-sky-500/40 bg-sky-950/20">
          <div className="border-b border-sky-500/40 px-3 py-2 text-xs font-medium text-sky-300">
            Replay response
          </div>
          <div className="max-h-64 overflow-auto">
            {rightLines.length === 0 ? (
              <pre className="p-3 text-xs text-slate-500">(empty)</pre>
            ) : (
              <pre className="p-3 text-xs">
                {Array.from({ length: maxRows }, (_, i) => (
                  <div
                    key={i}
                    className={`whitespace-pre-wrap break-words ${
                      rightClass[i] === "new"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : rightClass[i] === "changed"
                          ? "bg-rose-500/20 text-rose-200"
                          : "text-slate-200"
                    }`}
                  >
                    {(rightLines[i] ?? "") || "\n"}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
