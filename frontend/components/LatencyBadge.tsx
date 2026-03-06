import React from "react";

interface LatencyBadgeProps {
  latencyMs: number;
  className?: string;
}

/**
 * Color code: <2000ms green, 2000–5000ms yellow, >5000ms red
 */
export default function LatencyBadge({ latencyMs, className = "" }: LatencyBadgeProps) {
  const colorClass =
    latencyMs < 2000
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
      : latencyMs <= 5000
        ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
        : "bg-rose-500/15 text-rose-300 border-rose-500/40";

  const display =
    latencyMs < 1000
      ? `${latencyMs} ms`
      : `${(latencyMs / 1000).toFixed(1)} s`;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass} ${className}`}
      title={`${latencyMs} ms`}
    >
      {display}
    </span>
  );
}
