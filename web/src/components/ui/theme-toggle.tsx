"use client";

import { EllipsisHorizontalIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type AnimationVariant =
	| "circle"
	| "rectangle"
	| "gif"
	| "polygon"
	| "circle-blur";

export type AnimationStart =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right"
	| "center"
	| "top-center"
	| "bottom-center"
	| "bottom-up"
	| "top-down"
	| "left-right"
	| "right-left";

interface Animation {
	name: string;
	css: string;
}

const getCircleCenter = (position: AnimationStart): string => {
	switch (position) {
		case "top-right":
			return "100% 0%";
		case "top-left":
			return "0% 0%";
		case "bottom-right":
			return "100% 100%";
		case "bottom-left":
			return "0% 100%";
		case "top-center":
		case "top-down":
			return "50% 0%";
		case "bottom-center":
		case "bottom-up":
			return "50% 100%";
		case "left-right":
			return "0% 50%";
		case "right-left":
			return "100% 50%";
		case "center":
		default:
			return "50% 50%";
	}
};

const getPositionCoords = (position: AnimationStart) => {
	switch (position) {
		case "top-left":
			return { cx: "0", cy: "0" };
		case "top-right":
			return { cx: "40", cy: "0" };
		case "bottom-left":
			return { cx: "0", cy: "40" };
		case "bottom-right":
			return { cx: "40", cy: "40" };
		case "top-center":
			return { cx: "20", cy: "0" };
		case "bottom-center":
			return { cx: "20", cy: "40" };
		case "bottom-up":
		case "top-down":
		case "left-right":
		case "right-left":
			return { cx: "20", cy: "20" };
	}
};

const generateSVG = (variant: AnimationVariant, start: AnimationStart) => {
	if (variant === "circle-blur") {
		if (start === "center") {
			return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="20" cy="20" r="18" fill="white" filter="url(%23blur)"/></svg>`;
		}
		const positionCoords = getPositionCoords(start);
		if (!positionCoords) {
			throw new Error(`Invalid start position: ${start}`);
		}
		const { cx, cy } = positionCoords;
		return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>`;
	}

	if (start === "center") return;

	if (variant === "rectangle") return "";

	const positionCoords = getPositionCoords(start);
	if (!positionCoords) {
		throw new Error(`Invalid start position: ${start}`);
	}
	const { cx, cy } = positionCoords;

	if (variant === "circle") {
		return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
	}

	return "";
};

const getTransformOrigin = (start: AnimationStart) => {
	switch (start) {
		case "top-left":
			return "top left";
		case "top-right":
			return "top right";
		case "bottom-left":
			return "bottom left";
		case "bottom-right":
			return "bottom right";
		case "top-center":
			return "top center";
		case "bottom-center":
			return "bottom center";
		case "bottom-up":
		case "top-down":
		case "left-right":
		case "right-left":
			return "center";
	}
};

export const createAnimation = (
	variant: AnimationVariant,
	start: AnimationStart = "center",
	blur = false,
	url?: string,
): Animation => {
	const svg = generateSVG(variant, start);
	const transformOrigin = getTransformOrigin(start);

	if (variant === "rectangle") {
		const getClipPath = (direction: AnimationStart) => {
			switch (direction) {
				case "bottom-up":
					return {
						from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
				case "top-down":
					return {
						from: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
				case "left-right":
					return {
						from: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
				case "right-left":
					return {
						from: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
				case "top-left":
					return {
						from: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
				case "top-right":
					return {
						from: "polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
				case "bottom-left":
					return {
						from: "polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
				case "bottom-right":
					return {
						from: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
				default:
					return {
						from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
			}
		};

		const clipPath = getClipPath(start);

		return {
			name: `${variant}-${start}${blur ? "-blur" : ""}`,
			css: `
       ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
        pointer-events: none !important;
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }

      @keyframes reveal-dark-${start}${blur ? "-blur" : ""} {
        from {
          clip-path: ${clipPath.from};
          ${blur ? "filter: blur(8px);" : ""}
        }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to {
          clip-path: ${clipPath.to};
          ${blur ? "filter: blur(0px);" : ""}
        }
      }

      @keyframes reveal-light-${start}${blur ? "-blur" : ""} {
        from {
          clip-path: ${clipPath.from};
          ${blur ? "filter: blur(8px);" : ""}
        }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to {
          clip-path: ${clipPath.to};
          ${blur ? "filter: blur(0px);" : ""}
        }
      }
      `,
		};
	}

	if (variant === "circle") {
		const center = getCircleCenter(start);
		return {
			name: `${variant}-${start}${blur ? "-blur" : ""}`,
			css: `
      ::view-transition-group(root) {
        animation: none;
        pointer-events: none !important;
      }

      ::view-transition-old(root) {
        animation: none;
        z-index: 1;
        pointer-events: none !important;
      }

      ::view-transition-new(root) {
        animation: reveal-circle-${start}${blur ? "-blur" : ""} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none !important;
        z-index: 2;
      }

      @keyframes reveal-circle-${start}${blur ? "-blur" : ""} {
        from {
          clip-path: circle(0% at ${center});
          ${blur ? "filter: blur(8px);" : ""}
        }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to {
          clip-path: circle(150vmax at ${center});
          ${blur ? "filter: blur(0px);" : ""}
        }
      }
      `,
		};
	}

	if (variant === "gif") {
		return {
			name: `${variant}-${start}`,
			css: `
      ::view-transition-group(root) {
  animation-timing-function: var(--expo-in);
}

::view-transition-new(root) {
  mask: url('${url}') center / 0 no-repeat;
  animation: scale 3s;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: scale 3s;
}

@keyframes scale {
  0% {
    mask-size: 0;
  }
  10% {
    mask-size: 50vmax;
  }
  90% {
    mask-size: 50vmax;
  }
  100% {
    mask-size: 2000vmax;
  }
}`,
		};
	}

	if (variant === "circle-blur") {
		const center = getCircleCenter(start);
		return {
			name: `${variant}-${start}`,
			css: `
      ::view-transition-group(root) {
        animation: none;
        pointer-events: none !important;
      }

      ::view-transition-old(root) {
        animation: none;
        z-index: 1;
        pointer-events: none !important;
      }

      ::view-transition-new(root) {
        animation: reveal-circle-blur-${start} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none !important;
        z-index: 2;
      }

      @keyframes reveal-circle-blur-${start} {
        from {
          clip-path: circle(0% at ${center});
          filter: blur(8px);
        }
        50% {
          filter: blur(4px);
        }
        to {
          clip-path: circle(150vmax at ${center});
          filter: blur(0px);
        }
      }
      `,
		};
	}

	if (variant === "polygon") {
		const getPolygonClipPaths = (position: AnimationStart) => {
			switch (position) {
				case "top-left":
					return {
						darkFrom: "polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)",
						darkTo: "polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)",
						lightFrom: "polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)",
						lightTo: "polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)",
					};
				case "top-right":
					return {
						darkFrom: "polygon(150% -71%, 250% 71%, 250% 71%, 150% -71%)",
						darkTo: "polygon(150% -71%, 250% 71%, 50% 171%, -71% 50%)",
						lightFrom: "polygon(-71% 50%, 50% 171%, 50% 171%, -71% 50%)",
						lightTo: "polygon(-71% 50%, 50% 171%, 250% 71%, 150% -71%)",
					};
				default:
					return {
						darkFrom: "polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)",
						darkTo: "polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)",
						lightFrom: "polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)",
						lightTo: "polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)",
					};
			}
		};

		const clipPaths = getPolygonClipPaths(start);

		return {
			name: `${variant}-${start}${blur ? "-blur" : ""}`,
			css: `
      ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
        pointer-events: none !important;
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }

      @keyframes reveal-dark-${start}${blur ? "-blur" : ""} {
        from {
          clip-path: ${clipPaths.darkFrom};
          ${blur ? "filter: blur(8px);" : ""}
        }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to {
          clip-path: ${clipPaths.darkTo};
          ${blur ? "filter: blur(0px);" : ""}
        }
      }

      @keyframes reveal-light-${start}${blur ? "-blur" : ""} {
        from {
          clip-path: ${clipPaths.lightFrom};
          ${blur ? "filter: blur(8px);" : ""}
        }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to {
          clip-path: ${clipPaths.lightTo};
          ${blur ? "filter: blur(0px);" : ""}
        }
      }
      `,
		};
	}

	if (variant === "circle" && start !== "center") {
		const getClipPathPosition = (position: AnimationStart) => {
			switch (position) {
				case "top-left":
					return "0% 0%";
				case "top-right":
					return "100% 0%";
				case "bottom-left":
					return "0% 100%";
				case "bottom-right":
					return "100% 100%";
				case "top-center":
					return "50% 0%";
				case "bottom-center":
					return "50% 100%";
				default:
					return "50% 50%";
			}
		};

		const clipPosition = getClipPathPosition(start);

		return {
			name: `${variant}-${start}${blur ? "-blur" : ""}`,
			css: `
       ::view-transition-group(root) {
        animation-duration: 1s;
        animation-timing-function: var(--expo-out);
        pointer-events: none !important;
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }

      @keyframes reveal-dark-${start}${blur ? "-blur" : ""} {
        from {
          clip-path: circle(0% at ${clipPosition});
          ${blur ? "filter: blur(8px);" : ""}
        }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to {
          clip-path: circle(150.0% at ${clipPosition});
          ${blur ? "filter: blur(0px);" : ""}
        }
      }

      @keyframes reveal-light-${start}${blur ? "-blur" : ""} {
        from {
           clip-path: circle(0% at ${clipPosition});
           ${blur ? "filter: blur(8px);" : ""}
        }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to {
          clip-path: circle(150.0% at ${clipPosition});
          ${blur ? "filter: blur(0px);" : ""}
        }
      }
      `,
		};
	}

	return {
		name: `${variant}-${start}${blur ? "-blur" : ""}`,
		css: `
      ::view-transition-group(root) {
        animation-timing-function: var(--expo-in);
      }
      ::view-transition-new(root) {
        mask: url('${svg}') ${start.replace("-", " ")} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale-${start}${blur ? "-blur" : ""} 1s;
        transform-origin: ${transformOrigin};
        ${blur ? "filter: blur(2px);" : ""}
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: scale-${start}${blur ? "-blur" : ""} 1s;
        transform-origin: ${transformOrigin};
        z-index: -1;
      }
      @keyframes scale-${start}${blur ? "-blur" : ""} {
        from {
          ${blur ? "filter: blur(8px);" : ""}
        }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to {
          mask-size: 2000vmax;
          ${blur ? "filter: blur(0px);" : ""}
        }
      }
    `,
	};
};

/**
 * Custom hook for theme toggle functionality with view transition effects.
 *
 * Configured by default to:
 * - variant: "circle-blur" (alternatives: "circle" | "rectangle" | "gif" | "polygon")
 * - blur: true (alternative: false)
 * - start: "top-right" (alternatives: "center" | "top-left" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center" | "bottom-up" | "top-down" | "left-right" | "right-left")
 */
export const useThemeToggle = ({
	// Configured Options:
	variant = "circle-blur",
	// variant = "circle",
	// variant = "rectangle",
	// variant = "polygon",
	// variant = "gif",

	start = "top-right",
	// start = "bottom-right",
	// start = "center",
	// start = "top-left",
	// start = "bottom-left",
	// start = "top-center",
	// start = "bottom-center",
	// start = "bottom-up",
	// start = "top-down",
	// start = "left-right",
	// start = "right-left",

	blur = true,
	// blur = false,

	gifUrl = "",
}: {
	variant?: AnimationVariant;
	start?: AnimationStart;
	blur?: boolean;
	gifUrl?: string;
} = {}) => {
	const { setTheme, resolvedTheme } = useTheme();
	const [isDark, setIsDark] = useState(false);
	const activeTransitionRef = useRef<{ skipTransition?: () => void } | null>(null);

	useEffect(() => {
		setIsDark(resolvedTheme === "dark");
	}, [resolvedTheme]);

	const styleId = "theme-transition-styles";

	const updateStyles = useCallback((css: string, _name: string) => {
		if (typeof window === "undefined") return;

		let styleElement = document.getElementById(styleId) as HTMLStyleElement;

		if (!styleElement) {
			styleElement = document.createElement("style");
			styleElement.id = styleId;
			document.head.appendChild(styleElement);
		}

		styleElement.textContent = css;
	}, []);

	const toggleTheme = useCallback(() => {
		if (typeof window === "undefined") return;

		// Read single source of truth directly from DOM to prevent closure/double-click desync
		const isCurrentlyDark = document.documentElement.classList.contains("dark");
		const nextTheme = isCurrentlyDark ? "light" : "dark";

		// Abort previous transition if user clicks rapidly
		if (activeTransitionRef.current?.skipTransition) {
			try {
				activeTransitionRef.current.skipTransition();
			} catch {}
			activeTransitionRef.current = null;
		}

		const animation = createAnimation(variant, start, blur, gifUrl);
		updateStyles(animation.css, animation.name);

		const switchTheme = () => {
			document.documentElement.classList.add("theme-transitioning");
			if (nextTheme === "dark") {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			setTheme(nextTheme);
			setIsDark(nextTheme === "dark");
			requestAnimationFrame(() => {
				document.documentElement.classList.remove("theme-transitioning");
			});
		};

		const doc = document as unknown as {
			startViewTransition?: (callback: () => void) => {
				skipTransition?: () => void;
				finished?: Promise<void>;
			};
		};

		if (!doc.startViewTransition) {
			switchTheme();
			return;
		}

		try {
			const transition = doc.startViewTransition(switchTheme);
			activeTransitionRef.current = transition;
			transition?.finished?.finally?.(() => {
				document.documentElement.classList.remove("theme-transitioning");
				if (activeTransitionRef.current === transition) {
					activeTransitionRef.current = null;
				}
			});
		} catch {
			document.documentElement.classList.remove("theme-transitioning");
			switchTheme();
		}
	}, [setTheme, variant, start, blur, gifUrl, updateStyles]);

	const setCrazyLightTheme = useCallback(() => {
		setIsDark(false);
		const animation = createAnimation(variant, start, blur, gifUrl);
		updateStyles(animation.css, animation.name);

		if (typeof window === "undefined") return;
		const switchTheme = () => {
			setTheme("light");
		};

		const doc = document as unknown as {
			startViewTransition?: (callback: () => void) => void;
		};
		if (!doc.startViewTransition) {
			switchTheme();
			return;
		}
		doc.startViewTransition(switchTheme);
	}, [setTheme, variant, start, blur, gifUrl, updateStyles]);

	const setCrazyDarkTheme = useCallback(() => {
		setIsDark(true);
		const animation = createAnimation(variant, start, blur, gifUrl);
		updateStyles(animation.css, animation.name);

		if (typeof window === "undefined") return;
		const switchTheme = () => {
			setTheme("dark");
		};

		const doc = document as unknown as {
			startViewTransition?: (callback: () => void) => void;
		};
		if (!doc.startViewTransition) {
			switchTheme();
			return;
		}
		doc.startViewTransition(switchTheme);
	}, [setTheme, variant, start, blur, gifUrl, updateStyles]);

	const setCrazySystemTheme = useCallback(() => {
		if (typeof window === "undefined") return;

		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		setIsDark(prefersDark);

		const animation = createAnimation(variant, start, blur, gifUrl);
		updateStyles(animation.css, animation.name);

		const switchTheme = () => {
			setTheme("system");
		};

		const doc = document as unknown as {
			startViewTransition?: (callback: () => void) => void;
		};
		if (!doc.startViewTransition) {
			switchTheme();
			return;
		}
		doc.startViewTransition(switchTheme);
	}, [setTheme, variant, start, blur, gifUrl, updateStyles]);

	return {
		isDark,
		setIsDark,
		toggleTheme,
		setCrazyLightTheme,
		setCrazyDarkTheme,
		setCrazySystemTheme,
	};
};

export const ThemeToggleButton = ({
	className = "",
	// Default requested settings:
	variant = "circle-blur",
	// variant = "circle",
	// variant = "rectangle",
	// variant = "polygon",
	// variant = "gif",

	start = "top-right",
	// start = "bottom-right",
	// start = "center",
	// start = "top-left",
	// start = "bottom-left",
	// start = "top-center",
	// start = "bottom-center",
	// start = "bottom-up",
	// start = "top-down",
	// start = "left-right",
	// start = "right-left",

	blur = true,
	// blur = false,

	gifUrl = "",
}: {
	className?: string;
	variant?: AnimationVariant;
	start?: AnimationStart;
	blur?: boolean;
	gifUrl?: string;
}) => {
	const { isDark, toggleTheme } = useThemeToggle({
		variant,
		start,
		blur,
		gifUrl,
	});

	return (
		<motion.button
			type="button"
			whileHover={{ scale: 1.06 }}
			whileTap={{ scale: 0.94 }}
			className={cn(
				"size-8 cursor-pointer rounded-none border border-[var(--line)] bg-[var(--card)] p-1.5 transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/5 hover:border-[var(--blue)] text-[var(--ink)] flex items-center justify-center",
				className,
			)}
			onClick={toggleTheme}
			aria-label="Toggle theme"
		>
			<span className="sr-only">Toggle theme</span>
			<svg
				aria-hidden="true"
				viewBox="0 0 240 240"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="w-full h-full"
			>
				<motion.g
					animate={{ rotate: isDark ? -180 : 0 }}
					transition={{ ease: "easeInOut", duration: 0.5 }}
				>
					<path
						d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
						fill="currentColor"
					/>
					<path
						d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
						fill="none"
						stroke="currentColor"
						strokeWidth="12"
					/>
				</motion.g>
				<motion.path
					animate={{ rotate: isDark ? 180 : 0 }}
					transition={{ ease: "easeInOut", duration: 0.5 }}
					d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
					fill="currentColor"
				/>
			</svg>
		</motion.button>
	);
};

export const ThemeToggleDropdownRow = ({
	className = "",
}: {
	className?: string;
}) => {
	const { isDark, toggleTheme } = useThemeToggle({
		variant: "circle-blur",
		// variant: "circle",
		// variant: "rectangle",
		// variant: "polygon",
		// variant: "gif",

		start: "top-right",
		// start: "bottom-right",
		// start: "center",
		// start: "top-left",
		// start: "bottom-left",

		blur: true,
		// blur: false,
	});

	return (
		<motion.div
			whileHover={{ x: 2 }}
			whileTap={{ scale: 0.98 }}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				toggleTheme();
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					toggleTheme();
				}
			}}
			role="menuitem"
			tabIndex={0}
			className={cn(
				"group flex items-center justify-between w-full px-2.5 py-2 text-[12px] text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-none outline-none select-none transition-colors",
				className,
			)}
		>
			<span className="flex items-center gap-2">
				<motion.div
					animate={{ rotate: isDark ? 360 : 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					whileHover={{ rotate: 20, scale: 1.15 }}
					className="flex items-center justify-center text-[var(--blue)]"
				>
					{isDark ? (
						<MoonIcon className="w-4 h-4 text-inherit" />
					) : (
						<SunIcon className="w-4 h-4 text-inherit" />
					)}
				</motion.div>
				<span className="font-medium">Theme</span>
			</span>
			<span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10 text-[var(--muted)] group-hover:text-[var(--ink)] transition-colors">
				{isDark ? "Dark" : "Light"}
			</span>
		</motion.div>
	);
};

const Options = ({
	variant,
	start,
	blur,
	gifType,
	gifUrl,
	setVariant,
	setStart,
	setBlur,
	setGifType,
	setGifUrl,
}: {
	variant: AnimationVariant;
	start: AnimationStart;
	blur: boolean;
	gifType: "1" | "2" | "3" | "custom";
	gifUrl: string;
	setVariant: (variant: AnimationVariant) => void;
	setStart: (start: AnimationStart) => void;
	setBlur: (blur: boolean) => void;
	setGifType: (type: "1" | "2" | "3" | "custom") => void;
	setGifUrl: (url: string) => void;
}) => {
	return (
		<motion.div
			drag
			className="top-30 border-foreground/10 bg-muted2 absolute right-1/2 flex w-[245px] translate-x-1/2 flex-col gap-3 rounded-none border border-[var(--line)] p-3 backdrop-blur-sm lg:right-4 lg:translate-x-0"
		>
			<div className="flex items-center justify-between">
				<span className="size-4 cursor-grab active:cursor-grabbing">
					<EllipsisHorizontalIcon className="size-4 opacity-50" />
				</span>

				<p className="group flex cursor-pointer items-center justify-center gap-1 rounded-none px-2 py-1 text-sm opacity-50">
					Options
				</p>
			</div>

			<div className="flex flex-col">
				<div className="mt-1 flex justify-between py-1">
					<p className="w-20 whitespace-nowrap text-sm opacity-50">variant :</p>
					<div className="flex flex-wrap items-center justify-end gap-1">
						<button
							type="button"
							onClick={() => setVariant("circle")}
							className={cn(
								"cursor-pointer px-1 text-sm transition-opacity rounded-none",
								variant === "circle"
									? "opacity-100"
									: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
							)}
						>
							circle
						</button>
						<button
							type="button"
							onClick={() => setVariant("rectangle")}
							className={cn(
								"cursor-pointer px-1 text-sm transition-opacity rounded-none",
								variant === "rectangle"
									? "opacity-100"
									: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
							)}
						>
							rectangle
						</button>
						<button
							type="button"
							onClick={() => setVariant("gif")}
							className={cn(
								"cursor-pointer px-1 text-sm transition-opacity rounded-none",
								variant === "gif"
									? "opacity-100"
									: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
							)}
						>
							gif
						</button>
						<button
							type="button"
							onClick={() => setVariant("polygon")}
							className={cn(
								"cursor-pointer px-1 text-sm transition-opacity rounded-none",
								variant === "polygon"
									? "opacity-100"
									: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
							)}
						>
							polygon
						</button>
						<button
							type="button"
							onClick={() => setVariant("circle-blur")}
							className={cn(
								"cursor-pointer px-1 text-sm transition-opacity rounded-none",
								variant === "circle-blur"
									? "opacity-100"
									: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
							)}
						>
							circle-blur
						</button>
					</div>
				</div>

				<div className="mt-1 flex justify-between py-1">
					<p className="w-20 whitespace-nowrap text-sm opacity-50">blur :</p>
					<div className="flex flex-wrap items-center justify-end gap-1">
						<button
							type="button"
							onClick={() => setBlur(false)}
							className={cn(
								"cursor-pointer px-1 text-sm transition-opacity rounded-none",
								!blur
									? "opacity-100"
									: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
							)}
						>
							off
						</button>
						<button
							type="button"
							onClick={() => setBlur(true)}
							className={cn(
								"cursor-pointer px-1 text-sm transition-opacity rounded-none",
								blur
									? "opacity-100"
									: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
							)}
						>
							on
						</button>
					</div>
				</div>

				{(variant === "circle" ||
					variant === "rectangle" ||
					variant === "polygon" ||
					variant === "circle-blur") && (
					<div className="mt-1 flex justify-between py-1">
						<p className="w-20 whitespace-nowrap text-sm opacity-50">start :</p>
						<div className="flex flex-wrap items-center justify-end gap-1">
							{(variant === "circle" || variant === "circle-blur") && (
								<button
									type="button"
									onClick={() => setStart("center")}
									className={cn(
										"cursor-pointer px-1 text-sm transition-opacity rounded-none",
										start === "center"
											? "opacity-100"
											: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
									)}
								>
									center
								</button>
							)}

							{variant === "rectangle" && (
								<>
									<button
										type="button"
										onClick={() => setStart("bottom-up")}
										className={cn(
											"cursor-pointer px-1 text-sm transition-opacity rounded-none",
											start === "bottom-up"
												? "opacity-100"
												: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
										)}
									>
										bottom-up
									</button>
									<button
										type="button"
										onClick={() => setStart("top-down")}
										className={cn(
											"cursor-pointer px-1 text-sm transition-opacity rounded-none",
											start === "top-down"
												? "opacity-100"
												: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
										)}
									>
										top-down
									</button>
									<button
										type="button"
										onClick={() => setStart("left-right")}
										className={cn(
											"cursor-pointer px-1 text-sm transition-opacity rounded-none",
											start === "left-right"
												? "opacity-100"
												: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
										)}
									>
										left-right
									</button>
									<button
										type="button"
										onClick={() => setStart("right-left")}
										className={cn(
											"cursor-pointer px-1 text-sm transition-opacity rounded-none",
											start === "right-left"
												? "opacity-100"
												: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
										)}
									>
										right-left
									</button>
								</>
							)}

							{(variant === "circle" ||
								variant === "polygon" ||
								variant === "circle-blur") && (
								<>
									<button
										type="button"
										onClick={() => setStart("top-left")}
										className={cn(
											"cursor-pointer px-1 text-sm transition-opacity rounded-none",
											start === "top-left"
												? "opacity-100"
												: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
										)}
									>
										top-left
									</button>
									<button
										type="button"
										onClick={() => setStart("top-right")}
										className={cn(
											"cursor-pointer px-1 text-sm transition-opacity rounded-none",
											start === "top-right"
												? "opacity-100"
												: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
										)}
									>
										top-right
									</button>
									{variant !== "polygon" && (
										<>
											<button
												type="button"
												onClick={() => setStart("bottom-left")}
												className={cn(
													"cursor-pointer px-1 text-sm transition-opacity rounded-none",
													start === "bottom-left"
														? "opacity-100"
														: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
												)}
											>
												bottom-left
											</button>
											<button
												type="button"
												onClick={() => setStart("bottom-right")}
												className={cn(
													"cursor-pointer px-1 text-sm transition-opacity rounded-none",
													start === "bottom-right"
														? "opacity-100"
														: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
												)}
											>
												bottom-right
											</button>
										</>
									)}
								</>
							)}

							{(variant === "circle" || variant === "circle-blur") && (
								<>
									<button
										type="button"
										onClick={() => setStart("top-center")}
										className={cn(
											"cursor-pointer px-1 text-sm transition-opacity rounded-none",
											start === "top-center"
												? "opacity-100"
												: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
										)}
									>
										top-center
									</button>
									<button
										type="button"
										onClick={() => setStart("bottom-center")}
										className={cn(
											"cursor-pointer px-1 text-sm transition-opacity rounded-none",
											start === "bottom-center"
												? "opacity-100"
												: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
										)}
									>
										bottom-center
									</button>
								</>
							)}
						</div>
					</div>
				)}

				{variant === "gif" && (
					<div className="mt-1 flex justify-between py-1">
						<p className="w-20 text-sm opacity-50">gif type :</p>
						<div className="flex flex-wrap items-center justify-end gap-1">
							<button
								type="button"
								onClick={() => {
									setGifType("1");
									setGifUrl(
										"https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif?cid=790b76112m5eeeydoe7et0cr3j3ekb1erunxozyshuhxx2vl&ep=v1_stickers_search&rid=giphy.gif&ct=s",
									);
								}}
								className={cn(
									"cursor-pointer px-1 text-sm transition-opacity rounded-none",
									gifType === "1"
										? "opacity-100"
										: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
								)}
							>
								1
							</button>
							<button
								type="button"
								onClick={() => {
									setGifType("2");
									setGifUrl(
										"https://media.giphy.com/media/5PncuvcXbBuIZcSiQo/giphy.gif?cid=ecf05e47j7vdjtytp3fu84rslaivdun4zvfhej6wlvl6qqsz&ep=v1_stickers_search&rid=giphy.gif&ct=s",
									);
								}}
								className={cn(
									"cursor-pointer px-1 text-sm transition-opacity rounded-none",
									gifType === "2"
										? "opacity-100"
										: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
								)}
							>
								2
							</button>
							<button
								type="button"
								onClick={() => {
									setGifType("3");
									setGifUrl(
										"https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3JwcXdzcHd5MW92NWprZXVpcTBtNXM5cG9obWh0N3I4NzFpaDE3byZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/WgsVx6C4N8tjy/giphy.gif",
									);
								}}
								className={cn(
									"cursor-pointer px-1 text-sm transition-opacity rounded-none",
									gifType === "3"
										? "opacity-100"
										: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
								)}
							>
								3
							</button>
							<button
								type="button"
								onClick={() => setGifType("custom")}
								className={cn(
									"cursor-pointer px-1 text-sm transition-opacity rounded-none",
									gifType === "custom"
										? "opacity-100"
										: "hover:bg-foreground/10 opacity-50 hover:opacity-100",
								)}
							>
								custom
							</button>
						</div>
					</div>
				)}

				{variant === "gif" && gifType === "custom" && (
					<div className="mt-1 flex flex-col gap-1 py-1">
						<p className="text-sm opacity-50">gif url :</p>
						<input
							type="text"
							value={gifUrl}
							onChange={(e) => setGifUrl(e.target.value)}
							placeholder="Enter GIF URL"
							className="text-foreground placeholder:text-foreground/50 w-full rounded-none bg-transparent px-2 py-1 text-xs focus:outline-none border border-[var(--line)]"
						/>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export const Skiper26 = () => {
	// Configured to circle-blur, blur: on, start: top-right by default
	const [variant, setVariant] = useState<AnimationVariant>("circle-blur");
	// const [variant, setVariant] = useState<AnimationVariant>("rectangle");
	// const [variant, setVariant] = useState<AnimationVariant>("circle");
	// const [variant, setVariant] = useState<AnimationVariant>("polygon");
	// const [variant, setVariant] = useState<AnimationVariant>("gif");

	const [start, setStart] = useState<AnimationStart>("top-right");
	// const [start, setStart] = useState<AnimationStart>("bottom-right");
	// const [start, setStart] = useState<AnimationStart>("bottom-up");
	// const [start, setStart] = useState<AnimationStart>("center");
	// const [start, setStart] = useState<AnimationStart>("top-left");
	// const [start, setStart] = useState<AnimationStart>("bottom-left");
	// const [start, setStart] = useState<AnimationStart>("bottom-right");

	const [blur, setBlur] = useState<boolean>(true);
	// const [blur, setBlur] = useState<boolean>(false);

	const [gifType, setGifType] = useState<"1" | "2" | "3" | "custom">("1");
	const [gifUrl, setGifUrl] = useState<string>(
		"https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif?cid=790b76112m5eeeydoe7et0cr3j3ekb1erunxozyshuhxx2vl&ep=v1_stickers_search&rid=giphy.gif&ct=s",
	);

	return (
		<div className="relative flex h-full w-full flex-col items-center justify-center">
			<div className="mx-auto max-w-lg space-y-5">
				<h2 className="mt-36 text-4xl font-medium tracking-tight">
					07.09.2025 <br />
					Skiper ui is live now
				</h2>
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, ex
					eligendi veniam praesentium temporibus natus quae laborum nemo
					repellendus cum!
				</p>
			</div>

			<div className="text-foreground grid content-start justify-items-center gap-6 py-20 text-center">
				<span className="after:from-background after:to-foreground relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:content-['']">
					Click to toggle the theme
				</span>
			</div>

			<ThemeToggleButton
				variant={variant}
				start={start}
				blur={blur}
				gifUrl={gifUrl}
			/>
			<Options
				variant={variant}
				start={start}
				blur={blur}
				gifType={gifType}
				gifUrl={gifUrl}
				setVariant={setVariant}
				setStart={setStart}
				setBlur={setBlur}
				setGifType={setGifType}
				setGifUrl={setGifUrl}
			/>
		</div>
	);
};
