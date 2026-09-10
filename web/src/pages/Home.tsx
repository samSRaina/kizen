import React, { useState } from "react";
import { 
  Check, 
  Copy, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Layers, 
  DollarSign, 
  Database, 
  GitFork, 
  ArrowUpRight, 
  ChevronRight,
  Sparkles,
  Command,
  ExternalLink,
  Cpu,
  FolderLock,
  Boxes
} from "lucide-react";
import { ThemeToggle } from "../components/kizen/ThemeToggle";
import { KizenCockpitDemo } from "../components/kizen/KizenCockpitDemo";
import { OpenApiShowcase } from "../components/kizen/OpenApiShowcase";

function KizenLogo() {
  return (
    <div className="flex items-center gap-2.5 font-['Space_Grotesk'] font-bold text-lg tracking-tight text-white group select-none">
      <div className="w-8 h-8 rounded-lg bg-[var(--brand-accent)] text-black flex items-center justify-center font-mono font-black text-base shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
        K
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-white text-lg">kizen</span>
        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/10 text-gray-400 border border-white/5">
          v1.0
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [copiedDocker, setCopiedDocker] = useState(false);

  const dockerCommand = "docker run -d -p 8080:8080 -v kizen_data:/data ghcr.io/samraina/kizen:latest";

  const handleCopyDocker = () => {
    navigator.clipboard.writeText(dockerCommand);
    setCopiedDocker(true);
    setTimeout(() => setCopiedDocker(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--surface-base)] text-gray-200 transition-colors duration-200 bg-grid-pattern selection:bg-[var(--brand-accent)] selection:text-black">
      {/* Site Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[var(--surface-base)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#top" className="flex items-center">
              <KizenLogo />
            </a>
            
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-400">
              <a href="#cockpit" className="hover:text-white transition-colors">Live Cockpit</a>
              <a href="#features" className="hover:text-white transition-colors">Freelance Isolation</a>
              <a href="#openapi" className="hover:text-white transition-colors">OpenAPI Spec</a>
              <a href="#comparison" className="hover:text-white transition-colors">Why Not Jira?</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://github.com/samSRaina/kizen"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
            >
              <GitFork size={13} />
              <span>GitHub</span>
            </a>
            <a
              href="#openapi"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--brand-accent)] text-black hover:brightness-110 shadow-sm shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Deploy Local</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="relative pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[var(--brand-accent-text)] mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-accent)] inline-block animate-ping" />
          <span>Single-Tenant Freelance Ticket Manager</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-['Space_Grotesk'] text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Stop paying the <span className="text-[var(--brand-accent-text)] italic font-serif">Jira enterprise tax.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Kizen is a lightning-fast, self-hosted issue tracker and billable rate manager engineered for solo developers managing multiple clients with strict workspace boundaries.
        </p>

        {/* Quick Docker Deployment Pill */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
          <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-gray-300 shadow-lg">
            <div className="flex items-center gap-2 truncate">
              <Terminal size={14} className="text-[var(--brand-accent)] shrink-0" />
              <span className="truncate">{dockerCommand}</span>
            </div>
            <button
              onClick={handleCopyDocker}
              className="ml-2 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy Command"
            >
              {copiedDocker ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedDocker ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-gray-500">
          <span className="flex items-center gap-1.5"><Zap size={13} className="text-amber-400" /> Sub-10ms Go Engine</span>
          <span className="flex items-center gap-1.5"><Database size={13} className="text-sky-400" /> SQLite & PostgreSQL</span>
          <span className="flex items-center gap-1.5"><FolderLock size={13} className="text-emerald-400" /> Multi-Client Isolation</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-purple-400" /> RFC 9457 Error Spec</span>
        </div>
      </section>

      {/* Interactive Live Cockpit Demo */}
      <section id="cockpit" className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto mb-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-white">
            Interactive Freelance Cockpit
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 font-mono">
            Switch workspaces, triage tickets, log billable time, or create a new client space.
          </p>
        </div>
        <KizenCockpitDemo />
      </section>

      {/* Core Architectural Pillars */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-left mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent-text)] font-semibold">
            Product Philosophy
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] text-white mt-1">
            Built for how freelance developers actually work.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#0f131c] hover:border-[var(--brand-accent-border)] transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[var(--brand-accent-text)] flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
              Strict Client Isolation
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              No shared boards, no accidental client leaks. Each workspace maintains its own hourly rate card, milestone scopes, and exportable invoice records.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#0f131c] hover:border-[var(--brand-accent-border)] transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
              Embedded Time & Rate Math
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tired of syncing Jira tickets to Harvest or Toggl? Kizen embeds granular hourly rate calculations directly into every ticket and milestone summary.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#0f131c] hover:border-[var(--brand-accent-border)] transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
              Contract-First OpenAPI
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fully specified in <code className="text-gray-200">api/openapi.yaml</code>. Automate ticket creation from Git commit hooks or generate typed SDKs in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* OpenAPI & Deployment Section */}
      <section id="openapi" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-black/40">
        <div className="max-w-5xl mx-auto mb-8 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent-text)] font-semibold">
            Single Source of Truth
          </span>
          <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-white mt-1">
            Contract-First API & Self-Hosting
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl mx-auto font-sans">
            Kizen adheres to strict OpenAPI 3.1 specifications and RFC 9457 Problem Details error formats.
          </p>
        </div>

        <OpenApiShowcase />
      </section>

      {/* Comparison: Jira vs Kizen */}
      <section id="comparison" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-white">
            Why freelance engineers choose Kizen
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Cut the enterprise bloat and keep 100% control over your data.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0f131c] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#141824] text-gray-400 font-mono">
                <th className="py-3 px-4 font-medium">Feature / Metric</th>
                <th className="py-3 px-4 font-medium text-gray-400">Enterprise Jira</th>
                <th className="py-3 px-4 font-semibold text-[var(--brand-accent-text)]">Kizen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Deployment Model</td>
                <td className="py-3.5 px-4 text-gray-400">Cloud Lock-in / Heavy JVM</td>
                <td className="py-3.5 px-4 text-emerald-400 font-mono font-medium">Single Go Binary / Docker</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Multi-Client Rate Tracking</td>
                <td className="py-3.5 px-4 text-gray-400">Requires $15/mo marketplace plugins</td>
                <td className="py-3.5 px-4 text-emerald-400 font-mono font-medium">Built-in per-workspace rates</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">API Contract</td>
                <td className="py-3.5 px-4 text-gray-400">Complex legacy REST endpoints</td>
                <td className="py-3.5 px-4 text-emerald-400 font-mono font-medium">OpenAPI 3.1 + RFC 9457</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Average Response Time</td>
                <td className="py-3.5 px-4 text-gray-400">1,200ms – 3,500ms</td>
                <td className="py-3.5 px-4 text-emerald-400 font-mono font-medium">&lt; 10ms local response</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Monthly Seat Cost</td>
                <td className="py-3.5 px-4 text-gray-400">Per-user monthly subscription</td>
                <td className="py-3.5 px-4 text-emerald-400 font-mono font-medium">$0 (100% Free & Open Source)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#080b11] py-12 px-4 sm:px-6 lg:px-8 text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KizenLogo />
            <span className="text-gray-600">|</span>
            <span>Self-hosted ticket manager for solo contractors</span>
          </div>

          <div className="flex items-center gap-6 text-gray-400">
            <a href="https://github.com/samSRaina/kizen" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#openapi" className="hover:text-white transition-colors">
              api/openapi.yaml
            </a>
            <a href="#top" className="hover:text-white transition-colors">
              Back to Top
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-600">
          <span>MIT Licensed. Built by samRaina.</span>
          <span>OpenAPI 3.1 & RFC 9457 Compliant.</span>
        </div>
      </footer>
    </div>
  );
}
