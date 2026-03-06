import { useState, useEffect, useCallback } from "react";
import {
  fetchTraces,
  fetchTrace,
  replayTrace,
  type TraceSummary,
  type TraceDetailResponse,
  type ReplayResponse,
} from "@/api/traces";

export function useTraces() {
  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTraces();
      setTraces(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load traces");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { traces, loading, error, reload: load };
}

export function useTrace(id: string | null) {
  const [data, setData] = useState<TraceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTrace(id)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load trace");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { trace: data?.trace ?? null, steps: data?.steps ?? [], loading, error };
}

export function useReplay(traceId: string | null) {
  const [result, setResult] = useState<ReplayResponse | { error: string } | null>(null);
  const [replaying, setReplaying] = useState(false);

  const replay = useCallback(async () => {
    if (!traceId) return;
    setReplaying(true);
    setResult(null);
    try {
      const data = await replayTrace(traceId);
      setResult(data);
    } finally {
      setReplaying(false);
    }
  }, [traceId]);

  return { result, replaying, replay };
}
