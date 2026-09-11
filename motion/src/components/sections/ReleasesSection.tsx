import React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { RELEASES } from "@/data/motion-content";

export function ReleasesSection() {
  const notify = (label: string) => toast(`${label} is a placeholder in this reference build.`);

  return (
    <section id="news" className="release-section section-frame">
      <div className="release-copy">
        <p className="section-kicker">05 / Always evolving</p>
        <h2>
          Made for the
          <br />
          <span>next interaction.</span>
        </h2>
        <p>
          New APIs, better performance, and more ways to bring your interfaces to life. Follow along
          as the library grows.
        </p>
        <button
          type="button"
          className="button button-outline"
          onClick={() => notify("Changelog")}
        >
          Read the changelog <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="release-list">
        <div className="release-list-header">
          <span>Latest releases</span>
          <span>2026</span>
        </div>
        {RELEASES.map((rel) => (
          <button
            type="button"
            className="release-row"
            key={rel.version}
            onClick={() => notify(`Release ${rel.version}`)}
          >
            <span className="release-version">{rel.version}</span>
            <span className="release-title">{rel.title}</span>
            <span className="release-date">{rel.date}</span>
            <ArrowRight size={15} />
          </button>
        ))}
      </div>
    </section>
  );
}
