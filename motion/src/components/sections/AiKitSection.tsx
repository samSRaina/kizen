import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AiKitSection() {
  const notify = (label: string) => toast(`${label} is a placeholder in this reference build.`);

  return (
    <section id="ai" className="ai-section section-frame">
      <div className="ai-glow" />
      <div className="ai-icon">
        <Sparkles size={21} />
      </div>
      <p className="section-kicker">04 / AI Kit</p>
      <h2>
        Give your agent
        <br />
        <span>specialist judgement.</span>
      </h2>
      <p>
        Send the latest docs, 450+ example sources, performance audits, and production-ready CSS
        springs directly to your agent.
      </p>
      <button
        type="button"
        className="button button-outline"
        onClick={() => notify("AI Kit")}
      >
        Explore AI Kit <ArrowUpRight size={15} />
      </button>
      <div className="ai-code">
        <span>motion.</span>
        <span>skills</span>
        <span>performance</span>
        <span>→</span>
      </div>
    </section>
  );
}
