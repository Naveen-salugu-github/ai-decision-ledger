import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * Redirect /traces/[id] → /trace/[id] so both URLs work.
 */
export default function TracesIdRedirect() {
  const router = useRouter();
  const id = router.query.id;

  useEffect(() => {
    if (typeof id === "string" && id) {
      router.replace(`/trace/${id}`);
    }
  }, [id, router]);

  return (
    <div className="p-4 text-sm text-slate-400">Redirecting to trace…</div>
  );
}
