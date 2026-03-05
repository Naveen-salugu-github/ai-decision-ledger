import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-sky-500/80" />
            <span className="text-sm font-semibold text-slate-100">
              AI Decision Ledger
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link href="/" className="hover:text-sky-400">
              Dashboard
            </Link>
            <Link href="/traces" className="hover:text-sky-400">
              Traces
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

