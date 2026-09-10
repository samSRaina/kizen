import React, { useState } from "react";
import { Plus, X, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Workspace, CreateWorkspaceRequest, ProblemDetail } from "../../lib/kizen-store";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ws: Workspace) => void;
}

export function CreateWorkspaceModal({ isOpen, onClose, onCreated }: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number | "">(150);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<ProblemDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulateServerError, setSimulateServerError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Schema validation strictly mirroring api/openapi.yaml
    if (!name.trim()) {
      setError({
        type: "https://kizen.dev/problems/invalid-payload",
        title: "Bad Request",
        status: 400,
        detail: "Workspace name is required and must contain at least 1 non-whitespace character.",
        errors: { name: "Name cannot be blank" },
      });
      return;
    }

    const rateNum = Number(hourlyRate);
    if (isNaN(rateNum) || rateNum < 0) {
      setError({
        type: "https://kizen.dev/problems/invalid-payload",
        title: "Bad Request",
        status: 400,
        detail: "default_hourly_rate must be an integer greater than or equal to 0.",
        errors: { default_hourly_rate: "Hourly rate cannot be negative" },
      });
      return;
    }

    if (simulateServerError) {
      setError({
        type: "https://kizen.dev/problems/internal-server-error",
        title: "Internal Server Error",
        status: 500,
        detail: "Simulated RFC 7807/9457 internal server error for demonstration.",
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newWs: Workspace = {
        id: `ws-${name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim(),
        default_hourly_rate: rateNum,
        description: description.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onCreated(newWs);
      setIsSubmitting(false);
      setName("");
      setDescription("");
      setHourlyRate(150);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0e121a] p-6 shadow-2xl relative text-left"
        style={{ background: "var(--surface-1)" }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono tracking-wider text-[var(--brand-accent-text)] uppercase font-medium">
              OpenAPI: POST /workspaces
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5 font-['Space_Grotesk']">
              Create Client Workspace
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Client / Project Name <span className="text-[var(--brand-accent)]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme FinTech Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Default Hourly Rate (USD) <span className="text-[var(--brand-accent)]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-sm text-gray-500 font-mono">$</span>
              <input
                type="number"
                min="0"
                required
                placeholder="150"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full pl-8 pr-16 py-2 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 text-sm font-mono focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] tabular-nums"
              />
              <span className="absolute right-3.5 top-2 text-xs text-gray-500 font-mono">/ hr</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Baseline rate applied automatically when tracking tickets in this workspace.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Scope / Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Deliverables, repository links, contract milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] font-sans resize-none"
            />
          </div>

          {/* RFC 9457 Error Simulation Toggle */}
          <div className="p-3 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between text-xs">
            <label htmlFor="sim-error" className="flex items-center gap-2 cursor-pointer text-gray-300 select-none">
              <ShieldAlert size={14} className="text-amber-400" />
              <span>Simulate RFC 9457 500 error response</span>
            </label>
            <input
              id="sim-error"
              type="checkbox"
              checked={simulateServerError}
              onChange={(e) => setSimulateServerError(e.target.checked)}
              className="accent-[var(--brand-accent)] cursor-pointer"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 font-mono">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-red-300">
                  {error.status} {error.title} ({error.type})
                </div>
                <div>{error.detail}</div>
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--brand-accent)] text-black hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Plus size={14} />
              <span>{isSubmitting ? "Creating..." : "Create Workspace"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
