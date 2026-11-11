import { useEffect, useRef } from "react";

interface CelestialSphereProps {
	className?: string;
	/** Optional phase or stage (0 to 2) to subtly alter camera focal length or tilt */
	phase?: number;
	stage?: number;
}

interface Particle {
	x: number;
	y: number;
	z: number;
	baseSize: number;
	colorType: "core" | "surface" | "ambient";
	alpha: number;
}

export function CelestialSphere({
	className = "",
	phase,
	stage = 0,
}: CelestialSphereProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
	const resolvedPhase = phase ?? stage;
	const phaseRef = useRef(resolvedPhase);

	useEffect(() => {
		phaseRef.current = resolvedPhase;
	}, [resolvedPhase]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationId: number;
		let angleY = 0;
		const tiltX = 0.28; // ~16 deg tilt like celestial ring
		const tiltZ = -0.15;

		// High-density micro-particle cloud (matches Motion.dev stardust)
		const particles: Particle[] = [];
		const TOTAL_SURFACE = 4800;
		const TOTAL_CORE = 4200;

		// 1. Outer Spherical Shell Particles (Micro stardust dots)
		for (let i = 0; i < TOTAL_SURFACE; i++) {
			const theta = Math.acos(2 * Math.random() - 1);
			const phi = Math.random() * Math.PI * 2;
			const radius = 175 + (Math.random() - 0.5) * 20;

			particles.push({
				x: radius * Math.sin(theta) * Math.cos(phi),
				y: radius * Math.sin(theta) * Math.sin(phi),
				z: radius * Math.cos(theta),
				baseSize: 0.35 + Math.random() * 0.45,
				colorType: Math.random() > 0.82 ? "core" : "surface",
				alpha: 0.3 + Math.random() * 0.6,
			});
		}

		// 2. Dense Luminous Core & Equatorial Accretion Disc (Amber micro-points)
		for (let i = 0; i < TOTAL_CORE; i++) {
			const r = 20 + Math.random() ** 0.75 * 125;
			const phi = Math.random() * Math.PI * 2;
			const thickness = (1 - r / 145) * 14 * (Math.random() - 0.5);

			particles.push({
				x: r * Math.cos(phi),
				y: thickness,
				z: r * Math.sin(phi),
				baseSize: 0.4 + Math.random() * 0.55,
				colorType: "core",
				alpha: 0.5 + Math.random() * 0.5,
			});
		}

		const render = () => {
			animationId = requestAnimationFrame(render);

			const width = canvas.width;
			const height = canvas.height;
			if (width === 0 || height === 0) return;

			ctx.clearRect(0, 0, width, height);

			// Smooth cursor lerp
			mouseRef.current.x +=
				(mouseRef.current.targetX - mouseRef.current.x) * 0.04;
			mouseRef.current.y +=
				(mouseRef.current.targetY - mouseRef.current.y) * 0.04;

			angleY += 0.0032;

			const currentTiltX = tiltX + mouseRef.current.y * 0.2;
			const currentTiltY = angleY + mouseRef.current.x * 0.35;

			const cosY = Math.cos(currentTiltY);
			const sinY = Math.sin(currentTiltY);
			const cosX = Math.cos(currentTiltX);
			const sinX = Math.sin(currentTiltX);
			const cosZ = Math.cos(tiltZ);
			const sinZ = Math.sin(tiltZ);

			const centerX = width / 2;
			const centerY = height * 0.45;
			const fov = Math.min(width, height) * 0.95;
			const cameraZ = 380 + phaseRef.current * 25;

			// Project and sort particles by depth
			const projected: {
				x2d: number;
				y2d: number;
				size: number;
				alpha: number;
				depth: number;
				colorType: "core" | "surface" | "ambient";
			}[] = [];

			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];

				// Rotate around Y (yaw)
				let x1 = p.x * cosY - p.z * sinY;
				const y1 = p.y;
				let z1 = p.x * sinY + p.z * cosY;

				// Rotate around X (pitch tilt)
				const x2 = x1;
				const y2 = y1 * cosX - z1 * sinX;
				const z2 = y1 * sinX + z1 * cosX;

				// Rotate around Z (roll tilt)
				x1 = x2 * cosZ - y2 * sinZ;
				const py = x2 * sinZ + y2 * cosZ;
				z1 = z2;

				const depth = z1 + cameraZ;
				if (depth > 1) {
					const scale = fov / depth;
					const x2d = centerX + x1 * scale;
					const y2d = centerY + py * scale;
					const size = Math.max(0.4, p.baseSize * scale * 0.75);

					// Atmospheric depth attenuation
					const depthFactor = (z1 + 180) / 360; // 0 (back) to 1 (front)
					const alpha = Math.min(
						1,
						Math.max(0.08, p.alpha * (0.25 + depthFactor * 0.8)),
					);

					projected.push({
						x2d,
						y2d,
						size,
						alpha,
						depth: z1,
						colorType: p.colorType,
					});
				}
			}

			// Sort back-to-front
			projected.sort((a, b) => a.depth - b.depth);

			// Render high-performance micro-dots
			for (let i = 0; i < projected.length; i++) {
				const pt = projected[i];

				if (pt.colorType === "core") {
					// Warm amber/gold luminous glow
					const r = 255;
					const g = Math.floor(215 + pt.alpha * 35);
					const b = Math.floor(40 + (1 - pt.alpha) * 40);
					ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pt.alpha})`;
				} else {
					// Celestial cool white/stardust
					const v = Math.floor(220 + pt.alpha * 35);
					ctx.fillStyle = `rgba(${v}, ${v}, ${v}, ${pt.alpha * 0.75})`;
				}

				// Crisp micro-square stardust points
				ctx.fillRect(
					pt.x2d - pt.size / 2,
					pt.y2d - pt.size / 2,
					pt.size,
					pt.size,
				);
			}
		};

		// Resize observer with high DPI support
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.floor(rect.width * dpr);
			canvas.height = Math.floor(rect.height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		resize();
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvas);

		const handleMouseMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const normX = (e.clientX - rect.left) / rect.width - 0.5;
			const normY = (e.clientY - rect.top) / rect.height - 0.5;
			mouseRef.current.targetX = normX;
			mouseRef.current.targetY = normY;
		};

		window.addEventListener("mousemove", handleMouseMove);
		animationId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(animationId);
			resizeObserver.disconnect();
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	return (
		<div
			className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
		>
			{/* Celestial Core Radial Glow backdrop (Single source of truth in styles.css) */}
			<div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full pointer-events-none opacity-20 blur-3xl celestial-radial-glow" />

			<canvas ref={canvasRef} className="w-full h-full block" />
		</div>
	);
}
