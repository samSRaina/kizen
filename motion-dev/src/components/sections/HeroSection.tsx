import React from "react";
import { ArrowRight, Check, Code2, Play } from "lucide-react";
import { toast } from "sonner";

export function HeroSection() {
  const notify = (label: string) => toast(`${label} is a placeholder in this reference build.`);

  return (
    <section className="hero-section section-frame">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> The open source animation library
        </div>
        <h1>
          Make it <em>move.</em>
        </h1>
        <p className="hero-lede">
          A production-ready animation library for React, JavaScript, and Vue. Build smooth
          interfaces that feel as good as they look.
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="button button-lime"
            onClick={() => notify("Quick start")}
          >
            Quick start <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className="button button-outline"
            onClick={() => notify("View on GitHub")}
          >
            <Code2 size={16} /> View on GitHub
          </button>
        </div>
        <div className="hero-meta">
          <span>
            <Check size={14} /> Free forever
          </span>
          <span>
            <Check size={14} /> MIT licensed
          </span>
          <span>
            <Check size={14} /> Tiny footprint
          </span>
        </div>
      </div>

      <div className="hero-stage" aria-label="Abstract animation demo placeholder">
        <div className="stage-grid" />
        <div className="stage-orbit orbit-one" />
        <div className="stage-orbit orbit-two" />
        <div className="stage-line line-one" />
        <div className="stage-line line-two" />
        <div className="hero-cube">
          <div className="cube-face cube-top" />
          <div className="cube-face cube-front" />
          <div className="cube-face cube-side" />
        </div>
        <div className="stage-label label-top">spring / 0.8</div>
        <div className="stage-label label-bottom">
          x: 50% <span>●</span> y: 24
        </div>
        <button
          type="button"
          className="stage-play"
          onClick={() => notify("Animation demo")}
          aria-label="Play animation demo"
        >
          <Play size={18} fill="currentColor" />
        </button>
        <div className="stage-corner corner-tl" />
        <div className="stage-corner corner-br" />
      </div>
    </section>
  );
}
