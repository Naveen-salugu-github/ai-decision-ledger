import React from "react";

export interface TraceStep {
  id: string;
  prompt?: string | null;
  response?: string | null;
  tool_call?: string | null;
  latency_ms?: number | null;
  risk_flag?: boolean;
  created_at: string;
}

interface TraceTimelineProps {
  steps: TraceStep[];
}

const humanLabelForStep = (step: TraceStep, index: number) => {
  if (step.tool_call) {
    return `Tool Call – ${step.tool_call}`;
  }
  if (index === 0 && step.prompt) {
    return "Prompt Sent to Model";
  }
  if (step.response && !step.prompt) {
    return "Model Response";
  }
  if (step.prompt && step.response) {
    return "Model Call";
  }
  return "Step";
};

export default function TraceTimeline({ steps }: TraceTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-800" />
      <ul className="space-y-4">
        <li className="relative flex gap-3">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              User Request
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Request entered by the calling service / developer.
            </div>
          </div>
        </li>
        {steps.map((step, index) => (
          <li key={step.id} className="relative flex gap-3">
            <div
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                step.risk_flag ? "bg-rose-500" : "bg-slate-500"
              }`}
            />
            <div className="flex-1 rounded-md border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  {humanLabelForStep(step, index)}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>
                    {new Date(step.created_at).toLocaleTimeString(undefined, {
                      hour12: false
                    })}
                  </span>
                  {typeof step.latency_ms === "number" && (
                    <span className="rounded border border-slate-700 px-1.5 py-0.5 text-[10px]">
                      {step.latency_ms} ms
                    </span>
                  )}
                  {step.risk_flag && (
                    <span className="rounded border border-rose-500/50 bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-300">
                      High Risk
                    </span>
                  )}
                </div>
              </div>
              {step.prompt && (
                <div className="mt-2">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Prompt
                  </div>
                  <pre className="mt-1 overflow-x-auto rounded bg-slate-950/70 p-2 text-xs text-slate-200">
{step.prompt}
                  </pre>
                </div>
              )}
              {step.response && (
                <div className="mt-2">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Response
                  </div>
                  <pre className="mt-1 overflow-x-auto rounded bg-slate-950/70 p-2 text-xs text-slate-200">
{step.response}
                  </pre>
                </div>
              )}
            </div>
          </li>
        ))}
        <li className="relative flex gap-3">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Final Decision
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Downstream service consumes the AI output and tool results.
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

