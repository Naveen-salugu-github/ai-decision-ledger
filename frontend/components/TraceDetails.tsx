import type { Trace, TraceStep } from "@/api/traces";
import LatencyBadge from "./LatencyBadge";

interface TraceDetailsProps {
  trace: Trace;
  steps: TraceStep[];
}

function StepCard({
  title,
  children,
  risk,
}: {
  title: string;
  children: React.ReactNode;
  risk?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        risk ? "border-rose-500/40 bg-rose-950/20" : "border-slate-700 bg-slate-900/60"
      }`}
    >
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </div>
      <div className="text-sm text-slate-200">{children}</div>
    </div>
  );
}

export default function TraceDetails({ trace, steps }: TraceDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div>
          <div className="text-xs text-slate-500">Trace</div>
          <div className="font-mono text-sm text-slate-300">{trace.id}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Agent</div>
          <div className="text-sm font-medium text-slate-100">{trace.agent}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Model</div>
          <div className="font-mono text-sm text-sky-300">{trace.model}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Created</div>
          <div className="text-sm text-slate-400">
            {new Date(trace.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="text-sm font-medium text-slate-300">Timeline</div>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="space-y-2">
            {step.prompt != null && step.prompt !== "" && (
              <StepCard title="Prompt" risk={step.risk_flag}>
                <pre className="whitespace-pre-wrap break-words rounded bg-slate-950/70 p-3 text-xs">
                  {step.prompt}
                </pre>
              </StepCard>
            )}
            {step.response != null && step.response !== "" && (
              <StepCard title="Model response" risk={step.risk_flag}>
                <pre className="whitespace-pre-wrap break-words rounded bg-slate-950/70 p-3 text-xs">
                  {step.response}
                </pre>
              </StepCard>
            )}
            {step.tool_call != null && step.tool_call !== "" && (
              <StepCard title="Tool call" risk={step.risk_flag}>
                <pre className="whitespace-pre-wrap break-words rounded bg-slate-950/70 p-3 text-xs font-mono">
                  {step.tool_call}
                </pre>
              </StepCard>
            )}
            <div className="flex flex-wrap items-center gap-2 pl-2 text-xs text-slate-500">
              {typeof step.latency_ms === "number" && (
                <LatencyBadge latencyMs={step.latency_ms} />
              )}
              {step.risk_flag && (
                <span className="rounded border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-rose-300">
                  High risk
                </span>
              )}
              {(step.tokens_prompt != null || step.tokens_completion != null) && (
                <span>
                  Tokens: {step.tokens_prompt ?? "—"} in / {step.tokens_completion ?? "—"} out
                </span>
              )}
              {step.temperature != null && (
                <span>Temp: {step.temperature}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
