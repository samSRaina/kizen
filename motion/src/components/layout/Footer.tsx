import React from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const notify = (label: string) => toast(`${label} is a placeholder in this reference build.`);

  return (
    <footer className="site-footer section-frame">
      <div className="footer-top">
        <div>
          <a className="brand footer-brand" href="#top">
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>
            <span>
              Motion<span className="brand-plus">+</span>
            </span>
          </a>
          <p>Make it move.</p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Explore</strong>
            <button type="button" onClick={() => notify("Docs")}>Docs</button>
            <button type="button" onClick={() => notify("Examples")}>Examples</button>
            <button type="button" onClick={() => notify("Motion UI")}>Motion UI</button>
          </div>
          <div>
            <strong>Community</strong>
            <button type="button" onClick={() => notify("GitHub")}>
              GitHub <ExternalLink size={11} />
            </button>
            <button type="button" onClick={() => notify("Discord")}>
              Discord <ExternalLink size={11} />
            </button>
            <button type="button" onClick={() => notify("X")}>
              X / Twitter <ExternalLink size={11} />
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Motion</span>
        <span>Open source, by design.</span>
        <span>
          Privacy <span className="footer-separator">/</span> Terms
        </span>
      </div>
    </footer>
  );
}
