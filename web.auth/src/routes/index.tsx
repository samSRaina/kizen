import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Command, Download, GitBranch } from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "#/lib/auth-client";
import "../landing.css";

export const Route = createFileRoute("/")({ component: Home });

function Logo() {
	return (
		<div className="logo-mark" role="img" aria-label="Kizen home">
			<span className="logo-z">Z</span>
			<span>zed</span>
			<i />
		</div>
	);
}

function Home() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const { data: session, isPending } = useSession();

	return (
		<main className="landing-wrapper">
			<header className="site-header">
				<div className="nav-inner">
					<a href="#top">
						<Logo />
					</a>
					<nav className={mobileOpen ? "nav-links open" : "nav-links"}>
						<button type="button">
							Product <ChevronDown size={12} />
						</button>
						<button type="button">
							Resources <ChevronDown size={12} />
						</button>
						<a href="#extensions">Extensions</a>
						<a href="#docs">Docs</a>
						<a href="#pricing">Pricing</a>
						<a href="#delta">Delta</a>
					</nav>
					<div className="nav-actions">
						<button type="button" className="command">
							<Command size={12} /> <span>Ctrl + Shift + P</span>
						</button>

						{/* AUTH WIRING */}
						{isPending ? (
							<span className="text-xs text-gray-500">Loading...</span>
						) : session ? (
							<div className="flex items-center gap-3">
								<span className="text-xs font-medium text-gray-600 hidden sm:inline-block">
									{session.user.name}
								</span>
								<button
									type="button"
									onClick={async () => {
										await signOut();
									}}
									className="text-xs text-red-600 hover:text-red-700 font-medium"
								>
									Log Out
								</button>
								<Link
									to="/_authenticated"
									className="download-top"
									style={{ padding: "7px 11px", textDecoration: "none" }}
								>
									Dashboard <kbd>⌘</kbd>
								</Link>
							</div>
						) : (
							<>
								<Link
									to="/login"
									className="signup text-xs"
									style={{ textDecoration: "none" }}
								>
									Log in
								</Link>
								<Link
									to="/sign-up"
									className="download-top"
									style={{ textDecoration: "none" }}
								>
									Sign up <kbd>S</kbd>
								</Link>
							</>
						)}

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
						Your last pitstop for<br></br> "MOST" of your needs [:"]
					</h1>
					<p className="hero-sub">
						Kizen is a minimal task master crafted for
						<br className="desktop" /> solo devs.
					</p>
					<div className="hero-actions">
						<a
							href="#download"
							className="button-primary"
							style={{ textDecoration: "none" }}
						>
							<Download size={14} /> Download now <kbd>D</kbd>
						</a>
						<a
							href="https://github.com/samSRaina/kizen"
							className="button-secondary"
							style={{ textDecoration: "none" }}
						>
							<GitBranch size={14} /> Clone source <kbd>C</kbd>
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
					<span>GitHub ↗</span>
				</div>
			</footer>
		</main>
	);
}
