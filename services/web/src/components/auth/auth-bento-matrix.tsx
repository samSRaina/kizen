import { useState } from "react";

export function AuthBentoMatrix() {
	const [tile1Angle, setTile1Angle] = useState(15);
	const [tile1X, setTile1X] = useState("50%");
	const [activeGesture, setActiveGesture] = useState<
		"hover" | "press" | "drag"
	>("hover");

	return (
		<div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border-default select-none">
			{/* ──────── CARD 01: INDEPENDENT TRANSFORMS / TELEMETRY ──────── */}
			<div className="p-6 sm:p-8 border-b border-border-default flex flex-col justify-between bg-surface-base hover:bg-surface-hover transition-colors group">
				<div>
					<div className="flex items-center justify-between font-mono text-[11px] text-text-muted mb-6">
						<span className="text-text-primary font-bold">01</span>
						<span>INDEPENDENT TRANSFORMS</span>
					</div>

					{/* Interactive Sandbox Canvas */}
					<section
						aria-label="Interactive transform sandbox"
						className="h-44 w-full bg-surface-sunken border border-border-default relative flex items-center justify-center overflow-hidden cursor-crosshair"
						onMouseMove={(e) => {
							const rect = e.currentTarget.getBoundingClientRect();
							const xPercent = Math.round(
								((e.clientX - rect.left) / rect.width) * 100,
							);
							const angle = Math.round(
								((e.clientX - rect.left) / rect.width) * 45,
							);
							setTile1Angle(angle);
							setTile1X(`${xPercent}%`);
						}}
						onMouseLeave={() => {
							setTile1Angle(15);
							setTile1X("50%");
						}}
					>
						{/* Subtle Dynamic Grid Reticle */}
						<div
							className="absolute inset-0 bg-[size:16px_16px] opacity-40 pointer-events-none"
							style={{
								backgroundImage:
									"linear-gradient(to right, color-mix(in srgb, var(--text-primary) 9%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 9%, transparent) 1px, transparent 1px)",
							}}
						/>
						<div className="absolute w-full h-[1px] bg-border-default" />
						<div className="absolute h-full w-[1px] bg-border-default" />

						{/* Transforming Monochrome Node */}
						<div
							className="w-12 h-12 bg-accent-primary shadow-[0_0_15px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-transform duration-150 ease-out flex items-center justify-center font-mono text-[9px] font-bold text-accent-primary-fg"
							style={{
								transform: `rotate(${tile1Angle}deg)`,
							}}
						>
							NODE
						</div>

						<span className="absolute bottom-2 left-2 font-mono text-[9px] text-text-muted">
							MOVE_CURSOR_TO_TEST
						</span>
					</section>

					<div className="mt-6">
						<div className="flex items-center justify-between">
							<h3 className="font-bold text-text-primary text-base font-sans">
								Independent transforms
							</h3>
							<span className="text-text-muted font-mono text-xs">→</span>
						</div>
						<p className="text-xs text-text-secondary mt-1 font-sans leading-relaxed">
							Animate x, y, rotate, scale on the same element, without wrappers.
						</p>
					</div>
				</div>

				<div className="mt-6 pt-4 border-t border-border-subtle">
					<code className="text-text-primary font-mono text-xs block">
						{`{rotate:${tile1Angle}, x:"${tile1X}"}`}
					</code>
				</div>
			</div>

			{/* ──────── CARD 02: ORBITAL ROTATION / INVERTED MONOCHROME ──────── */}
			<div className="p-6 sm:p-8 border-b border-border-default flex flex-col justify-between bg-text-primary text-canvas">
				<div>
					<div className="flex items-center justify-between font-mono text-[11px] font-bold text-canvas/70 mb-6">
						<span>02</span>
						<span>CRYPTOGRAPHIC ORBIT</span>
					</div>

					{/* Inverted Orbital Animation Canvas */}
					<div className="h-44 w-full relative flex items-center justify-center">
						{/* Outer Concentric Target Ring */}
						<div className="w-28 h-28 border-2 border-canvas/20 rounded-full flex items-center justify-center">
							{/* Rotating Dashed / Solid Orbital Loop */}
							<div className="w-24 h-24 border border-canvas rounded-full relative animate-spin-slow">
								{/* Orbital Satellite Node */}
								<span className="w-3 h-3 bg-canvas rounded-full absolute -top-1.5 left-1/2 transform -translate-x-1/2 shadow-sm" />
							</div>
						</div>
						{/* Inner Solid Hub */}
						<div className="absolute w-8 h-8 border border-canvas/40 rounded-full flex items-center justify-center">
							<div className="w-2.5 h-2.5 bg-canvas rounded-full" />
						</div>
					</div>

					<div className="mt-6">
						<div className="flex items-center justify-between">
							<h3 className="font-bold text-canvas text-base font-sans uppercase">
								Scroll animation
							</h3>
							<span className="text-canvas font-mono text-xs font-bold">→</span>
						</div>
						<p className="text-xs text-canvas/80 mt-1 font-sans leading-relaxed font-medium">
							Hardware-accelerated continuous validation linked via
							ScrollTimeline.
						</p>
					</div>
				</div>

				<div className="mt-6 pt-4 border-t border-canvas/20">
					<code className="text-canvas font-mono text-xs font-bold block">
						scroll()
					</code>
				</div>
			</div>

			{/* ──────── CARD 03: NATIVE GESTURES SANDBOX ──────── */}
			<div className="p-6 sm:p-8 flex flex-col justify-between bg-surface-base hover:bg-surface-hover transition-colors group">
				<div>
					<div className="flex items-center justify-between font-mono text-[11px] text-text-muted mb-6">
						<span className="text-text-primary font-bold">03</span>
						<span>NATIVE GESTURES</span>
					</div>

					{/* Gesture Canvas Container */}
					<div className="h-44 w-full bg-surface-sunken border border-border-default p-4 relative flex items-center justify-between">
						{/* Bounded Dashed Box with Active State Indicator */}
						<div className="w-24 h-24 border border-dashed border-border-strong p-2 flex items-center justify-center">
							<div
								className={`w-12 h-12 transition-all duration-200 flex items-center justify-center font-mono text-[9px] font-bold ${
									activeGesture === "hover"
										? "bg-surface-elevated border border-border-strong text-text-primary"
										: activeGesture === "press"
											? "bg-accent-primary text-accent-primary-fg scale-90"
											: "bg-surface-elevated border border-border-strong text-text-primary translate-x-2"
								}`}
							>
								{activeGesture.toUpperCase()}
							</div>
						</div>

						{/* Interactive Radio Selectors */}
						<div className="space-y-2 font-mono text-xs">
							<button
								type="button"
								onClick={() => setActiveGesture("hover")}
								className={`flex items-center space-x-2 transition-colors cursor-pointer ${
									activeGesture === "hover"
										? "text-text-primary font-bold"
										: "text-text-muted"
								}`}
							>
								<span className="text-xs">•</span>
								<span>hover</span>
							</button>
							<button
								type="button"
								onClick={() => setActiveGesture("press")}
								className={`flex items-center space-x-2 transition-colors cursor-pointer ${
									activeGesture === "press"
										? "text-text-primary font-bold"
										: "text-text-muted"
								}`}
							>
								<span className="text-xs">•</span>
								<span>press</span>
							</button>
							<button
								type="button"
								onClick={() => setActiveGesture("drag")}
								className={`flex items-center space-x-2 transition-colors cursor-pointer ${
									activeGesture === "drag"
										? "text-text-primary font-bold"
										: "text-text-muted"
								}`}
							>
								<span className="text-xs">•</span>
								<span>drag</span>
							</button>
						</div>
					</div>

					<div className="mt-6">
						<div className="flex items-center justify-between">
							<h3 className="font-bold text-text-primary text-base font-sans">
								Native gestures
							</h3>
							<span className="text-text-muted font-mono text-xs">→</span>
						</div>
						<p className="text-xs text-text-secondary mt-1 font-sans leading-relaxed">
							hover, press, and drag that feel native, not bolted on.
						</p>
					</div>
				</div>

				<div className="mt-6 pt-4 border-t border-border-subtle">
					<code className="text-text-primary font-mono text-xs block">
						drag = true
					</code>
				</div>
			</div>

			{/* ──────── CARD 04: LAYOUT ANIMATION ──────── */}
			<div className="p-6 sm:p-8 flex flex-col justify-between bg-surface-base hover:bg-surface-hover transition-colors group">
				<div>
					<div className="flex items-center justify-between font-mono text-[11px] text-text-muted mb-6">
						<span className="text-text-primary font-bold">04</span>
						<span>LAYOUT MATRIX</span>
					</div>

					{/* Layout Canvas with 4 Geometric Blocks */}
					<div className="h-44 w-full bg-surface-sunken border border-border-default relative flex items-center justify-center p-4">
						<div className="grid grid-cols-2 gap-2.5">
							<div className="w-9 h-9 bg-text-primary dark:bg-white transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 duration-300" />
							<div className="w-9 h-9 bg-text-primary dark:bg-white transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-300" />
							<div className="w-9 h-9 bg-text-primary dark:bg-white transition-transform group-hover:-translate-x-1 group-hover:translate-y-1 duration-300" />
							<div className="w-9 h-9 bg-text-secondary dark:bg-neutral-400 transition-transform group-hover:translate-x-1 group-hover:translate-y-1 duration-300" />
						</div>
					</div>

					<div className="mt-6">
						<div className="flex items-center justify-between">
							<h3 className="font-bold text-text-primary text-base font-sans">
								Layout animation
							</h3>
							<span className="text-text-muted font-mono text-xs">→</span>
						</div>
						<p className="text-xs text-text-secondary mt-1 font-sans leading-relaxed">
							Animate between any two layouts with a single layout prop.
						</p>
					</div>
				</div>

				<div className="mt-6 pt-4 border-t border-border-subtle">
					<code className="text-text-primary font-mono text-xs block">
						layout = true
					</code>
				</div>
			</div>
		</div>
	);
}

export default AuthBentoMatrix;
