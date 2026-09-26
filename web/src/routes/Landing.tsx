import {
	ArrowDownTrayIcon,
	ChevronDownIcon,
	CodeBracketIcon,
	CommandLineIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/Landing")({ component: Landing });

function Logo() {
	return (
		<div className="logo-mark">
			<span className="logo-k">K</span>
			<span>izen</span>
			<i />
		</div>
	);
}

function Landing() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<main>
			<header className="site-header">
				<div className="nav-inner">
					<a href="#top">
						<Logo />
					</a>
					<nav className={mobileOpen ? "nav-links open" : "nav-links"}>
						<button type="button">
							Product{" "}
							<ChevronDownIcon className="w-3 h-3 inline-block ml-0.5" />
						</button>
						<button type="button">
							Resources{" "}
							<ChevronDownIcon className="w-3 h-3 inline-block ml-0.5" />
						</button>
						<a href="#extensions">Extensions</a>
						<a href="#docs">Docs</a>
						<a href="#pricing">Pricing</a>
						<a href="#delta">Delta</a>
					</nav>
					<div className="nav-actions">
						<button type="button" className="command">
							<CommandLineIcon className="w-3.5 h-3.5" />{" "}
							<span>Ctrl + Shift + P</span>
						</button>
						<Link to="/login" className="signup">
							Sign up <kbd>S</kbd>
						</Link>
						<a className="download-top" href="#download">
							Download <kbd>D</kbd>
						</a>
						<button
							type="button"
							className="menu-toggle"
							onClick={() => setMobileOpen(!mobileOpen)}
							aria-label="Toggle menu"
						>
							☰
						</button>
					</div>
				</div>
				<a className="announcement" href="#delta">
					<span>
						Stay tuned: multiplayer environment for workings with agents [in
						developement]
					</span>
				</a>
			</header>

			<section className="hero" id="top">
				<div className="hero-glow" />
				<div className="hero-content">
					<p className="eyebrow">ALM for whats next</p>
					<h1>
						Your last pitstop for
						<br /> "MOST" of your needs [:]
					</h1>
					<p className="hero-sub">
						Kizen is a minimal task master crafted for
						<br className="desktop" /> solo devs.
					</p>
					<div className="hero-actions">
						<a href="#download" className="button-primary">
							<ArrowDownTrayIcon className="w-3.5 h-3.5 inline-block mr-1" />{" "}
							Download now <kbd>D</kbd>
						</a>
						<a
							href="https://github.com/samSRaina/kizen"
							className="button-secondary"
						>
							<CodeBracketIcon className="w-3.5 h-3.5 inline-block mr-1" />{" "}
							Clone source <kbd>C</kbd>
						</a>
					</div>
					<p className="platforms">Available for macOS, Linux, and Windows</p>
				</div>
			</section>

			<section className="feature-strip">
				{[
					{
						title: "FREE",
						text: "Completely free to use, MIT liicensed and open source.",
					},
					{
						title: "MODERATELY FAST",
						text: "Written from scratch in Go to efficiently leverage multi-core CPU's.",
					},
					{
						title: "POSTGRES",
						text: "To maintain smooth state transitions at native speed.",
					},
					{ title: "REDIS [IN DEV]", text: "For caching." },
					{
						title: "SQLC",
						text: "single source of truth for database schemas",
					},
					{
						title: "OPEN API",
						text: "single source of truth for API definitions",
					},
					{ title: "DOCKER", text: "One command to Launch" },
				].map((item, i) => (
					<div className="feature" key={item.title}>
						<span className="feature-index">0{i + 1}</span>
						<h3>{item.title}</h3>
						<p>{item.text}</p>
					</div>
				))}
			</section>

			<footer>
				<div className="footer-brand">
					<Logo />
					<p>
						Minimal task manager crafted for{" "}
						<a href="https://github.com/samsraina">@samRaina</a>
					</p>
				</div>
				<div className="footer-links">
					<div>
						<h4>Product</h4>
						<a href="#download">Download</a>
					</div>
					<div>
						<h4>Explore</h4>
						<a href="#docs">Docs</a>
					</div>
				</div>
				<div className="footer-bottom">
					<span>2026 Kizen</span>
					<a href="https://github.com/samSRaina/kizen">GitHub ↗</a>
				</div>
			</footer>
		</main>
	);
}
