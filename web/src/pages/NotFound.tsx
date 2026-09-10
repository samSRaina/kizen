import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Terminal } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--surface-base)] text-gray-200 p-4 bg-grid-pattern">
      <div className="w-full max-w-md p-8 rounded-xl border border-white/10 bg-[#0e121a] shadow-2xl text-center space-y-6">
        <div className="inline-flex p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Terminal size={32} />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono text-gray-500">RFC 9457: RESOURCE_NOT_FOUND</div>
          <h1 className="text-4xl font-bold font-['Space_Grotesk'] text-white">404</h1>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            The workspace or route you requested does not exist or is protected under isolated client tenant scopes.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Button
            onClick={handleGoHome}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--brand-accent)] text-black hover:brightness-110 flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <ArrowLeft size={14} />
            <span>Return to Kizen Cockpit</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
