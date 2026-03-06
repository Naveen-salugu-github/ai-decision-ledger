import { useTraces } from "@/hooks/useTraces";
import TraceTable from "@/components/TraceTable";

export default function TracesPage() {
  const { traces, loading, error } = useTraces();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Traces</h1>
        <p className="mt-1 text-sm text-slate-400">
          Inspect AI executions, latency, risk, and replay with the local model.
        </p>
      </div>
      <TraceTable traces={traces} loading={loading} error={error} />
    </div>
  );
}
