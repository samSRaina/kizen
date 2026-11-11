import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Check,
	CheckCircle2,
	Clock,
	Copy,
	Cpu,
	Database,
	Flame,
	Key,
	Layers,
	ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CelestialSphere } from "#/components/landing/celestial-sphere";
import { Logo } from "#/components/ui/logo";
import { ThemeToggleButton } from "#/components/ui/theme-toggle";
import { authQueries } from "#/lib/queries/auth";

export const Route = createFileRoute("/")({
	component: LandingPageComponent,
});

function LandingPageComponent() {
	const { data: session } = useQuery(authQueries.session());
	const isAuthenticated = Boolean(session?.user);

	const primaryTarget = isAuthenticated ? "/workspaces" : "/sign-in";
	const primaryLabel = isAuthenticated ? "Console" : "Get Started";

	// 3-Stage Lazy Loader Scroller:
	// Stage 0: Overview (Motion-inspired hero + live sphere canvas)
	// Stage 1: Core System Features
	// Stage 2: Technical Architecture & Instant Launch
	const [activeStage, setActiveStage] = useState(0);
	const [copiedCmd, setCopiedCmd] = useState(false);
	const isTransitioningRef = useRef(false);
	const touchStartY = useRef(0);

	const stages = [
		{ label: "OVERVIEW", index: 0 },
		{ label: "FEATURES", index: 1 },
		{ label: "ARCHITECTURE", index: 2 },
	];

	const goToStage = useCallback((index: number) => {
		const target = Math.max(0, Math.min(2, index));
		setActiveStage(target);
	}, []);

	// Smooth inertial wheel listener with debounce
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			if (Math.abs(e.deltaY) < 25) return;
			if (isTransitioningRef.current) return;

			isTransitioningRef.current = true;
			setTimeout(() => {
				isTransitioningRef.current = false;
			}, 600);

			if (e.deltaY > 0) {
				setActiveStage((prev) => Math.min(2, prev + 1));
			} else {
				setActiveStage((prev) => Math.max(0, prev - 1));
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
				e.preventDefault();
				setActiveStage((prev) => Math.min(2, prev + 1));
			} else if (e.key === "ArrowUp" || e.key === "PageUp") {
				e.preventDefault();
				setActiveStage((prev) => Math.max(0, prev - 1));
			}
		};

		const handleTouchStart = (e: TouchEvent) => {
			touchStartY.current = e.touches[0].clientY;
		};

		const handleTouchEnd = (e: TouchEvent) => {
			const deltaY = touchStartY.current - e.changedTouches[0].clientY;
			if (Math.abs(deltaY) < 40) return;
			if (isTransitioningRef.current) return;

			isTransitioningRef.current = true;
			setTimeout(() => {
				isTransitioningRef.current = false;
			}, 600);

			if (deltaY > 0) {
				setActiveStage((prev) => Math.min(2, prev + 1));
			} else {
				setActiveStage((prev) => Math.max(0, prev - 1));
			}
		};

		window.addEventListener("wheel", handleWheel, { passive: true });
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("touchstart", handleTouchStart, { passive: true });
		window.addEventListener("touchend", handleTouchEnd, { passive: true });

		return () => {
			window.removeEventListener("wheel", handleWheel);
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, []);

	const copyCommand = async () => {
		try {
			await navigator.clipboard.writeText(
				"git clone https://github.com/samSRaina/kizen.git",
			);
			setCopiedCmd(true);
			setTimeout(() => setCopiedCmd(false), 2000);
		} catch {
			// ignore fallback
		}
	};

	return (
		<div className="relative h-screen w-screen overflow-hidden bg-canvas text-text-primary flex flex-col justify-between select-none">
			{/* ──────── CELESTIAL PARTICLE SPHERE CANVAS (Interactive Centerpiece) ──────── */}
			<div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
				<CelestialSphere />
			</div>

			{/* Subtle Radial Glow Backing */}
			<div
				aria-hidden="true"
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] bg-accent-yellow/5 rounded-full blur-[140px] pointer-events-none"
			/>

			{/* ──────── MINIMALIST TOP HEADER (32px Row) ──────── */}
			<header className="relative z-30 w-full h-8 px-6 sm:px-12 mt-4 flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<Logo size="md" showText={true} />
				</div>

				<div className="flex items-center space-x-2 sm:space-x-3 h-8">
					<ThemeToggleButton
						variant="rectangle"
						blur={true}
						start="right-left"
						className="h-8"
					/>

					<Link
						to={primaryTarget}
						className="h-8 px-3.5 flex items-center border border-border-default hover:border-text-primary text-xs font-mono font-medium transition-colors cursor-pointer text-text-primary rounded-xs"
					>
						{isAuthenticated ? "CONSOLE" : "SIGN IN"}
					</Link>
				</div>
			</header>

			{/* ──────── SMOOTH STAGE DATA CANVAS ──────── */}
			<main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-12 sm:pb-16 pointer-events-auto">
				{/* ── STAGE 0: OVERVIEW (Clean, Human, Motion.dev Inspired) ── */}
				<div
					className={`w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
						activeStage === 0
							? "opacity-100 translate-y-0 pointer-events-auto"
							: "opacity-0 translate-y-8 pointer-events-none absolute inset-x-6 sm:inset-x-12 bottom-12 sm:bottom-16 max-w-7xl mx-auto"
					}`}
				>
					{/* Left Typography */}
					<div className="max-w-2xl">
						<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-text-primary leading-[1.05] mb-4">
							Track time. Manage client work.
							<br />
							Built for freelance developers.
						</h1>

						<p className="text-sm sm:text-base text-text-secondary font-sans leading-relaxed max-w-xl">
							Organize client workspaces, log billable hours down to the second,
							and keep your projects on track without bloated project management
							tools.
						</p>
					</div>

					{/* Right Command Box + Action Button (32px row controls) */}
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
						<div className="h-8 flex items-center justify-between border border-border-default bg-surface-base/90 backdrop-blur-md px-3 font-mono text-xs text-text-primary rounded-xs shadow-2xs">
							<span className="text-text-muted mr-3">$</span>
							<span className="select-all">
								git clone https://github.com/samSRaina/kizen.git
							</span>
							<button
								type="button"
								onClick={copyCommand}
								className="ml-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded-xs"
								title="Copy command"
							>
								{copiedCmd ? (
									<Check className="w-3.5 h-3.5 text-emerald-400" />
								) : (
									<Copy className="w-3.5 h-3.5" />
								)}
							</button>
						</div>

						<Link
							to={primaryTarget}
							className="h-8 px-5 font-mono text-xs font-bold uppercase tracking-wider bg-accent-yellow hover:bg-[#ffea33] text-black transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98] rounded-xs"
						>
							<span>{primaryLabel}</span>
							<ArrowRight className="w-3.5 h-3.5" />
						</Link>
					</div>
				</div>

				{/* ── STAGE 1: CORE FEATURES (Simplified, Clean, Human) ── */}
				<div
					className={`w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
						activeStage === 1
							? "opacity-100 translate-y-0 pointer-events-auto"
							: "opacity-0 translate-y-8 pointer-events-none absolute inset-x-6 sm:inset-x-12 bottom-12 sm:bottom-16 max-w-7xl mx-auto"
					}`}
				>
					<div className="mb-6">
						<h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-text-primary">
							EVERYTHING YOU NEED TO SHIP ON TIME
						</h2>
						<p className="text-xs sm:text-sm text-text-secondary mt-1">
							Simple tools that work together seamlessly.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="border border-border-default bg-surface-base/90 backdrop-blur-md p-5 flex flex-col justify-between rounded-xs shadow-2xs">
							<div>
								<Layers className="w-5 h-5 text-accent-yellow mb-3" />
								<h3 className="font-bold text-sm text-text-primary font-display mb-1.5">
									Team Workspaces
								</h3>
								<p className="text-xs text-text-secondary leading-relaxed">
									Keep separate spaces for every client, team, or project with
									clear permissions.
								</p>
							</div>
							<div className="mt-4 pt-3 border-t border-border-subtle font-mono text-[11px] text-text-muted">
								WORKSPACE ISOLATION
							</div>
						</div>

						<div className="border border-border-default bg-surface-base/90 backdrop-blur-md p-5 flex flex-col justify-between rounded-xs shadow-2xs">
							<div>
								<Clock className="w-5 h-5 text-accent-yellow mb-3" />
								<h3 className="font-bold text-sm text-text-primary font-display mb-1.5">
									One-Click Timer
								</h3>
								<p className="text-xs text-text-secondary leading-relaxed">
									Start and stop timers instantly. Precise down to the second,
									synced and saved automatically.
								</p>
							</div>
							<div className="mt-4 pt-3 border-t border-border-subtle font-mono text-[11px] text-text-muted">
								EXACT SECONDS
							</div>
						</div>

						<div className="border border-border-default bg-surface-base/90 backdrop-blur-md p-5 flex flex-col justify-between rounded-xs shadow-2xs">
							<div>
								<CheckCircle2 className="w-5 h-5 text-accent-yellow mb-3" />
								<h3 className="font-bold text-sm text-text-primary font-display mb-1.5">
									Clean Task Boards
								</h3>
								<p className="text-xs text-text-secondary leading-relaxed">
									Track tasks from backlog to completion. Connect timers
									directly to your tickets.
								</p>
							</div>
							<div className="mt-4 pt-3 border-t border-border-subtle font-mono text-[11px] text-text-muted">
								LINKED TICKETS
							</div>
						</div>

						<div className="border border-border-default bg-surface-base/90 backdrop-blur-md p-5 flex flex-col justify-between rounded-xs shadow-2xs">
							<div>
								<ShieldCheck className="w-5 h-5 text-accent-yellow mb-3" />
								<h3 className="font-bold text-sm text-text-primary font-display mb-1.5">
									Flexible Hourly Rates
								</h3>
								<p className="text-xs text-text-secondary leading-relaxed">
									Set custom rates per task or project, and calculate project
									totals effortlessly.
								</p>
							</div>
							<div className="mt-4 pt-3 border-t border-border-subtle font-mono text-[11px] text-text-muted">
								CUSTOM RATES
							</div>
						</div>
					</div>
				</div>

				{/* ── STAGE 2: ARCHITECTURE & LAUNCH ── */}
				<div
					className={`w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
						activeStage === 2
							? "opacity-100 translate-y-0 pointer-events-auto"
							: "opacity-0 translate-y-8 pointer-events-none absolute inset-x-6 sm:inset-x-12 bottom-12 sm:bottom-16 max-w-7xl mx-auto"
					}`}
				>
					<div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
						<div>
							<h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-text-primary">
								FAST, RELIABLE, AND OPEN SOURCE
							</h2>
							<p className="text-xs sm:text-sm text-text-secondary mt-1">
								Engineered for performance with a modern full-stack foundation.
							</p>
						</div>

						<Link
							to={primaryTarget}
							className="h-8 px-5 font-mono text-xs font-bold uppercase tracking-wider bg-accent-yellow hover:bg-[#ffea33] text-black transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto shadow-sm rounded-xs"
						>
							<span>{primaryLabel}</span>
							<ArrowRight className="w-3.5 h-3.5" />
						</Link>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="border border-border-default bg-surface-base/90 backdrop-blur-md p-5 rounded-xs shadow-2xs">
							<Cpu className="w-5 h-5 text-accent-yellow mb-3" />
							<h3 className="font-bold text-sm text-text-primary font-display mb-1">
								Go 1.24 Backend
							</h3>
							<p className="text-xs text-text-secondary leading-relaxed mb-3">
								Sub-millisecond API response times powered by high-throughput
								concurrent Go services.
							</p>
							<span className="font-mono text-[10px] text-text-muted uppercase">
								FAST & CONCURRENT
							</span>
						</div>

						<div className="border border-border-default bg-surface-base/90 backdrop-blur-md p-5 rounded-xs shadow-2xs">
							<Database className="w-5 h-5 text-accent-yellow mb-3" />
							<h3 className="font-bold text-sm text-text-primary font-display mb-1">
								PostgreSQL 18
							</h3>
							<p className="text-xs text-text-secondary leading-relaxed mb-3">
								Reliable database with automated migrations that keep your logs
								and workspaces safe.
							</p>
							<span className="font-mono text-[10px] text-text-muted uppercase">
								ACID RELIABILITY
							</span>
						</div>

						<div className="border border-border-default bg-surface-base/90 backdrop-blur-md p-5 rounded-xs shadow-2xs">
							<Key className="w-5 h-5 text-accent-yellow mb-3" />
							<h3 className="font-bold text-sm text-text-primary font-display mb-1">
								Key-Based Auth
							</h3>
							<p className="text-xs text-text-secondary leading-relaxed mb-3">
								Modern cryptographic authentication with instant, stateless
								session verification.
							</p>
							<span className="font-mono text-[10px] text-text-muted uppercase">
								STATELESS SECURITY
							</span>
						</div>

						<div className="border border-border-default bg-surface-base/90 backdrop-blur-md p-5 rounded-xs shadow-2xs">
							<Flame className="w-5 h-5 text-accent-yellow mb-3" />
							<h3 className="font-bold text-sm text-text-primary font-display mb-1">
								React 19 & TanStack
							</h3>
							<p className="text-xs text-text-secondary leading-relaxed mb-3">
								Instant page loads, smooth client transitions, and full
								type-safety from API to UI.
							</p>
							<span className="font-mono text-[10px] text-text-muted uppercase">
								ZERO WATERFALL SSR
							</span>
						</div>
					</div>
				</div>
			</main>

			{/* ──────── BOTTOM NAVIGATION & STAGE INDICATOR (32px Row) ──────── */}
			<footer className="relative z-30 w-full h-8 px-6 sm:px-12 flex items-center justify-between text-xs font-mono text-text-muted mb-3">
				<div className="flex items-center space-x-2">
					<span className="font-bold text-text-primary">KIZEN</span>
					<span>/</span>
					<span>{"GO 1.24 + PG 18 + REACT 19"}</span>
				</div>

				{/* Scroll Navigation / Stage Stepper */}
				<div className="flex items-center space-x-2 h-8">
					<span className="text-[10px] text-text-muted hidden sm:inline mr-2">
						SCROLL OR CLICK TO NAVIGATE
					</span>

					{stages.map((st) => (
						<button
							type="button"
							key={st.label}
							onClick={() => goToStage(st.index)}
							className={`h-6 px-2 flex items-center transition-colors cursor-pointer rounded-xs text-xs ${
								activeStage === st.index
									? "text-black bg-accent-yellow font-bold"
									: "text-text-muted hover:text-text-primary"
							}`}
							title={`Go to ${st.label}`}
						>
							0{st.index + 1}
						</button>
					))}
				</div>
			</footer>
		</div>
	);
}

export default LandingPageComponent;
