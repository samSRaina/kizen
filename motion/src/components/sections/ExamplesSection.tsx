import React from "react";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { EXAMPLES } from "@/data/motion-content";

export function ExamplesSection() {
  const notify = (label: string) => toast(`${label} is a placeholder in this reference build.`);

  return (
    <section id="examples" className="examples-section section-frame">
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">02 / Examples</p>
          <h2>
            Playable interactions
            <br />
            <span>ready to inspect.</span>
          </h2>
        </div>
        <button
          type="button"
          className="button button-outline"
          onClick={() => notify("Browse all examples")}
        >
          Browse all 450+ examples <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="examples-grid">
        {EXAMPLES.map((example) => (
          <div
            className="example-card"
            key={example.title}
            onClick={() => notify(example.title)}
          >
            <div className={`example-art ${example.className}`}>
              <div className="example-overlay">
                <span className="badge">{example.type}</span>
                <span className="badge-preview">Inspect</span>
              </div>
            </div>
            <div className="example-meta">
              <strong>{example.title}</strong>
              <span>Live preview</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
