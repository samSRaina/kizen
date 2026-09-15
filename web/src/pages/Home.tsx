import { useState } from "react";
import { ArrowDown, ArrowUpRight, ChevronDown, Command, Download, GitBranch, Play, Search, Sparkles, Users } from "lucide-react";

const commits = [
  ["Add AccessKit support to GPUI elements", "gpui-accesskit", "4m"],
  ["Fix panic in buffer rope on large paste", "rope-panic-fix", "12m"],
  ["Add vim motion for surround pairs", "+23-2", "48m"],
  ["Workspace close button hidden with single tab", "", "2h"],
  ["GPUI text shaping perf regression", "text-shaping-opt", "5h"],
  ["LSP hover tooltip positioning off-screen", "", "1d"],
];

function Logo() {
  return <div className="logo-mark" aria-label="Zed home"><span className="logo-z">Z</span><span>zed</span><i /></div>;
}

function EditorMockup() {
  return (
    <div className="editor-wrap">
      <div className="editor-shadow" />
      <div className="editor-window">
        <div className="editor-topbar">
          <div className="traffic"><b /><b /><b /></div>
          <div className="search-box"><Search size={12} /> Search...</div>
          <div className="branch"><GitBranch size={12} /> zed <span>main</span> <em>/</em> main</div>
          <div className="window-actions">＋　↔　⌕　⌘</div>
        </div>
        <div className="editor-body">
          <aside className="commit-list">
            <div className="repo-label">zed <span>⌄</span></div>
            {commits.map(([title, branch, time], i) => <div className={`commit ${i === 0 ? "selected" : ""}`} key={title}><strong>{title}</strong><small>{branch && <>{branch} <i>•</i></>} {time}</small></div>)}
          </aside>
          <section className="agent-pane">
            <div className="pane-tabs"><span>Add AccessKit support to GPUI elements</span><span>＋　•••　×</span></div>
            <div className="agent-copy">
              <p>I want to add AccessKit support to GPUI so screen readers can traverse the element tree. Can you start by figuring out where the accessibility tree should be built and how elements currently expose their roles?</p>
              <div className="agent-actions"><div><span>Read</span> crates/gpui/src/element.rs</div><div><span>Search</span> "accessibility" in crates/gpui/</div><div><span>List</span> crates/gpui/src/platform/</div></div>
              <p className="muted">Let me look at the GPUI element trait and the window's paint cycle to understand where we can hook into the tree. I'll also check if there's any existing accessibility scaffolding.</p>
              <div className="model-pill"><Sparkles size={12} /> Claude Opus 4.6</div>
            </div>
          </section>
          <section className="code-pane">
            <div className="code-tabs"><span>scheduler.tsx</span><span>catware.rs</span><span>Uncommitted Changes</span><b>×</b></div>
            <div className="code-lines">
              <div><i>1</i><span className="pink">"use client"</span></div>
              <div><i>2</i></div><div><i>3</i><span className="blue">import</span> * <span className="blue">as</span> React <span className="blue">from</span> <span className="pink">"react"</span></div>
              <div><i>4</i><span className="blue">import</span> &#123; format, addMinutes, isAfter &#125; <span className="blue">from</span> <span className="pink">"date-fns"</span></div>
              <div><i>5</i></div><div><i>6</i><span className="gray">// Types for your essential meeting system</span></div>
              <div><i>7</i><span className="blue">interface</span> Meeting &#123;</div>
              <div><i>8</i>　 id: <span className="blue">string</span></div>
              <div><i>9</i>　 title: <span className="blue">string</span></div>
              <div className="warn"><i>10</i>　 couldHaveBeenAnEmail: <span className="blue">boolean</span> <small>‘couldHaveBeenAnEmail’ is declared but its value is never read.</small></div>
              <div><i>11</i>　 attendees: <span className="blue">string</span>[]</div>
              <div><i>12</i>　 snacksProvided: <span className="blue">boolean</span></div>
              <div><i>13</i>　 actuallyStartsOnTime: <span className="blue">number</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Agentic Editing");
  return (
    <main>
      <header className="site-header">
        <div className="nav-inner">
          <a href="#top"><Logo /></a>
          <nav className={mobileOpen ? "nav-links open" : "nav-links"}>
            <button>Product <ChevronDown size={12} /></button>
            <button>Resources <ChevronDown size={12} /></button>
            <a href="#extensions">Extensions</a><a href="#docs">Docs</a><a href="#pricing">Pricing</a><a href="#delta">Delta</a>
          </nav>
          <div className="nav-actions"><button className="command"><Command size={12} /> <span>Ctrl + Shift + P</span></button><a href="#signup" className="signup">Sign up <kbd>S</kbd></a><a className="download-top" href="#download">Download <kbd>D</kbd></a><button className="menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">☰</button></div>
        </div>
        <a className="announcement" href="#delta"><span>Introducing: Delta, a multiplayer environment for coding with agents</span> <ArrowUpRight size={13} /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow" />
        <div className="hero-content">
          <p className="eyebrow">THE EDITOR FOR WHAT'S NEXT</p>
          <h1>Your last next editor</h1>
          <p className="hero-sub">Zed is a minimal code editor crafted for<br className="desktop" /> speed and collaboration with humans and AI.</p>
          <div className="hero-actions"><a href="#download" className="button-primary"><Download size={14} /> Download now <kbd>D</kbd></a><a href="https://github.com/zed-industries/zed" className="button-secondary"><GitBranch size={14} /> Clone source <kbd>C</kbd></a></div>
          <p className="platforms">Available for macOS, Linux, and Windows</p>
        </div>
      </section>

      <section className="feature-strip">
        {[{title:"Fast", text:"Written from scratch in Rust to efficiently leverage multiple CPU cores and your GPU."}, {title:"Agentic", text:"Run agents in parallel to smoothly edit files, navigate code, and run tools at native speed."}, {title:"Collaborative", text:"Chat with teammates, code together, and share your screen and project."}].map((item, i) => <div className="feature" key={item.title}><span className="feature-index">0{i + 1}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}
      </section>

      <section className="showcase-section">
        <div className="section-heading"><div><p className="eyebrow">BUILT FOR THE FLOW STATE</p><h2>Everything you need.<br /><em>Nothing you don't.</em></h2></div><a href="#demo" className="watch-button"><Play size={13} fill="currentColor" /> Watch Demo</a></div>
        <EditorMockup />
      </section>

      <section className="ai-section" id="docs"><div className="section-heading centered"><p className="eyebrow">AI, WITHOUT THE FRICTION</p><h2>Work with your agents,<br /><em>not around them.</em></h2><p>Delegate work, follow progress live, and review changes with ease.</p></div><div className="tabs">{["Agentic Editing","Edit Prediction","Inline Assistant","Any Agent, Any Tool"].map(t => <button className={activeTab === t ? "active" : ""} onClick={() => setActiveTab(t)} key={t}>{t}</button>)}</div><div className="ai-card"><div className="ai-card-copy"><span className="mini-number">0{["Agentic Editing","Edit Prediction","Inline Assistant","Any Agent, Any Tool"].indexOf(activeTab)+1}</span><h3>{activeTab}</h3><p>{activeTab === "Agentic Editing" ? "Delegate work to the agent, follow their progress live and review changes with ease." : "A native, considered workflow that keeps you in control while the work moves forward."}</p><a href="#learn">Learn More <ArrowUpRight size={13} /></a></div><div className="ai-graphic"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="ai-core"><Sparkles size={28} /></div><div className="node node-1">agent</div><div className="node node-2">code</div><div className="node node-3">review</div></div></div></section>

      <footer><div className="footer-brand"><Logo /><p>Minimal code editor crafted for speed<br />and collaboration with humans and AI.</p></div><div className="footer-links"><div><h4>Product</h4><a>Download</a><a>Pricing</a><a>Business</a><a>Releases</a></div><div><h4>Explore</h4><a>Extensions</a><a>Roadmap</a><a>Docs</a><a>Compare</a></div><div><h4>Company</h4><a>Blog</a><a>About</a><a>Values</a><a>Jobs</a></div></div><div className="footer-bottom"><span>© 2026 Zed Industries</span><span>Privacy　 Terms　 GitHub ↗</span></div></footer>
    </main>
  );
}

export { ArrowDown, Users };
