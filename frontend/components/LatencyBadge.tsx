import React from "react";

interface LatencyBadgeProps {
  latencyMs: number;
  className?: string;
}

/**
 * Color code: <1s green, 1–5s yellow, >5s red
 */
export default function LatencyBadge({ latencyMs, className = "" }: LatencyBadgeProps) {
  const s = latencyMs / 1000;
  const colorClass =
    s < 1
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
      : s <= 5
        ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
        : "bg-rose-500/15 text-rose-300 border-rose-500/40";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass} ${className}`}
      title={`${latencyMs} ms`}
    >
      {s < 1 ? `${latencyMs} ms` : `${s.toFixed(1)} s`}
    </span>
  );
}
