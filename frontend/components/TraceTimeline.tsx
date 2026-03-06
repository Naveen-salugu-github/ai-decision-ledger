import React from "react";
import type { Trace } from "@/api/traces";
import type { TraceStep } from "@/api/traces";
import LatencyBadge from "./LatencyBadge";

export interface TraceTimelineProps {
  trace: Trace;
  steps: TraceStep[];
  /** When replay has been run, pass the replay result for "Replay Executed" step */
  replayExecutedAt?: string;
  replayLatencyMs?: number;
}

type TimelineEventType =
  | "Trace Created"
  | "Prompt Sent"
  | "Model Response"
  | "Latency Recorded"
  | "Replay Executed";

interface TimelineStep {
  type: TimelineEventType;
  timestamp: string;
  content: string;
}

function buildTimelineSteps(
  trace: Trace,
  steps: TraceStep[],
  replayExecutedAt?: string,
  replayLatencyMs?: number
): TimelineStep[] {
  const result: TimelineStep[] = [];

  result.push({
    type: "Trace Created",
    timestamp: trace.created_at,
    content: `Trace ${trace.id.slice(0, 8)}… · Agent: ${trace.agent}, Model: ${trace.model}`,
  });

  const mainStep = steps.find((s) => s.prompt != null || s.response != null) ?? steps[0];
  if (mainStep) {
    if (mainStep.prompt) {
      result.push({
        type: "Prompt Sent",
        timestamp: mainStep.created_at,
        content: mainStep.prompt.slice(0, 200) + (mainStep.prompt.length > 200 ? "…" : ""),
      });
    }
    if (mainStep.response) {
      result.push({
        type: "Model Response",
        timestamp: mainStep.created_at,
        content: mainStep.response.slice(0, 200) + (mainStep.response.length > 200 ? "…" : ""),
      });
    }
    if (typeof mainStep.latency_ms === "number") {
      result.push({
        type: "Latency Recorded",
        timestamp: mainStep.created_at,
        content: `${mainStep.latency_ms} ms`,
      });
    }
  }

  if (replayExecutedAt) {
    result.push({
      type: "Replay Executed",
      timestamp: replayExecutedAt,
      content:
        typeof replayLatencyMs === "number"
          ? `Replay completed in ${replayLatencyMs} ms`
          : "Replay completed",
    });
  }

  return result;
}

export default function TraceTimeline({
  trace,
  steps,
  replayExecutedAt,
  replayLatencyMs,
}: TraceTimelineProps) {
  const timelineSteps = buildTimelineSteps(
    trace,
    steps,
    replayExecutedAt,
    replayLatencyMs
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700" />
      <ul className="space-y-0">
        {timelineSteps.map((step, index) => (
          <li key={`${step.type}-${index}`} className="relative flex gap-4 pb-4 last:pb-0">
            <div className="relative z-10 mt-1 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-slate-600 ring-4 ring-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                  {step.type}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(step.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-300">
                {step.type === "Latency Recorded" ? (
                  <LatencyBadge latencyMs={Number(step.content) || 0} />
                ) : (
                  <pre className="whitespace-pre-wrap break-words text-xs">
                    {step.content}
                  </pre>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
