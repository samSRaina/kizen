import React from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function MotionUiSection() {
  const notify = (label: string) => toast(`${label} is a placeholder in this reference build.`);

  return (
    <section id="ui" className="split-feature section-frame">
      <div className="split-visual">
        <div className="ui-window">
          <div className="window-bar">
            <span />
            <span />
            <span />
            <small>motion-ui / hero-editorial</small>
          </div>
          <div className="ui-canvas">
            <div className="ui-poster-copy">
              <p>Make an entrance.</p>
              <strong>With intention.</strong>
              <div className="ui-progress">
                <span />
              </div>
            </div>
            <div className="ui-poster-shape shape-a" />
            <div className="ui-poster-shape shape-b" />
            <div className="ui-poster-orbit" />
          </div>
        </div>
      </div>
      <div className="split-copy">
        <p className="section-kicker">03 / Motion UI</p>
        <h2>
          Start with
          <br />
          <span>production-ready</span> motion.
        </h2>
        <p>
          Browse carefully crafted animated sections. Install the source, then make it yours with
          the design tokens you already use.
        </p>
        <button
          type="button"
          className="button button-lime"
          onClick={() => notify("Motion UI")}
        >
          Explore Motion UI <ArrowUpRight size={15} />
        </button>
        <div className="split-note">
          <ShieldCheck size={17} />
          <span>Performance-rated and built for real products.</span>
        </div>
      </div>
    </section>
  );
}
