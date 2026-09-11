import React from "react";
import { toast } from "sonner";
import { FEATURES } from "@/data/motion-content";

export function FeaturesSection() {
  const notify = (label: string) => toast(`${label} is a placeholder in this reference build.`);

  return (
    <section id="features" className="feature-section section-frame">
      <div className="section-intro">
        <p className="section-kicker">01 / The core</p>
        <h2>
          Everything you need
          <br />
          <span>to make UI feel alive.</span>
        </h2>
        <p className="section-body">
          Motion gives you the primitives to build expressive, performant interactions without
          fighting the browser.
        </p>
      </div>
      <div className="feature-grid">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              className={`feature-card accent-${feature.color}`}
              key={feature.number}
              onClick={() => notify(feature.title)}
            >
              <div className="feature-top">
                <span className="feature-number">{feature.number}</span>
                <Icon size={19} strokeWidth={1.6} />
              </div>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <code>{feature.code}</code>
            </article>
          );
        })}
      </div>
    </section>
  );
}
