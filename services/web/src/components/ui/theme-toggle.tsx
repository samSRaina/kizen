import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "#/lib/utils";

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
			return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="20" cy="20" r="18" fill="white" filter="url(%23blur)"/></svg>';
		}
		const positionCoords = getPositionCoords(start);
		if (!positionCoords) {
			throw new Error(`Invalid start position: ${start}`);
		}
		const { cx, cy } = positionCoords;
		return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>`;
	}

	if (start === "center") return "";
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
				default:
					return {
						from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
						to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					};
			}
		};

		const clipPath = getClipPath(start);

		return {
			name: `rectangle-${start}`,
			css: `
        ::view-transition-group(root) {
          animation-duration: 0.7s;
          animation-timing-function: var(--expo-out);
        }
        ::view-transition-new(root) {
          animation-name: reveal-${start};
          ${blur ? "filter: blur(2px);" : ""}
        }
        ::view-transition-old(root) {
          animation: none;
        }
        @keyframes reveal-${start} {
          from {
            clip-path: ${clipPath.from};
          }
          to {
            clip-path: ${clipPath.to};
            ${blur ? "filter: blur(0px);" : ""}
          }
        }
      `,
		};
	}

	if (variant === "circle-blur") {
		return {
			name: `circle-blur-${start}`,
			css: `
        ::view-transition-group(root) {
          animation-duration: 0.7s;
          animation-timing-function: var(--expo-out);
        }
        ::view-transition-new(root) {
          animation-name: reveal-${start};
          mask: url('${svg}') ${transformOrigin} / 0% 0% no-repeat;
        }
        ::view-transition-old(root) {
          animation: none;
        }
        @keyframes reveal-${start} {
          from {
            mask-size: 0% 0%;
          }
          to {
            mask-size: 300% 300%;
          }
        }
      `,
		};
	}

	if (variant === "gif") {
		return {
			name: `gif-${start}`,
			css: `
        ::view-transition-group(root) {
          animation-duration: 0.7s;
          animation-timing-function: var(--expo-out);
        }
        ::view-transition-new(root) {
          animation-name: reveal-${start};
          mask: url('${url}') center / 0% 0% no-repeat;
        }
        ::view-transition-old(root) {
          animation: none;
        }
        @keyframes reveal-${start} {
          from {
            mask-size: 0% 0%;
          }
          to {
            mask-size: 100% 100%;
          }
        }
      `,
		};
	}

	if (variant === "polygon") {
		return {
			name: `polygon-${start}`,
			css: `
        ::view-transition-group(root) {
          animation-duration: 0.7s;
          animation-timing-function: var(--expo-out);
        }
        ::view-transition-new(root) {
          animation-name: reveal-${start};
        }
        ::view-transition-old(root) {
          animation: none;
        }
        @keyframes reveal-${start} {
          from {
            clip-path: polygon(50% 50%, 50% 50%, 50% 50%);
          }
          to {
            clip-path: polygon(50% -100%, -100% 150%, 200% 150%);
          }
        }
      `,
		};
	}

	if (variant === "circle") {
		return {
			name: `circle-${start}`,
			css: `
        ::view-transition-group(root) {
          animation-duration: 0.7s;
          animation-timing-function: var(--expo-out);
        }
        ::view-transition-new(root) {
          animation-name: reveal-${start};
          mask: url('${svg}') ${transformOrigin} / 0% 0% no-repeat;
        }
        ::view-transition-old(root) {
          animation: none;
        }
        @keyframes reveal-${start} {
          from {
            mask-size: 0% 0%;
          }
          to {
            mask-size: 300% 300%;
          }
        }
      `,
		};
	}

	return {
		name: "default",
		css: "",
	};
};

export const useThemeToggle = ({
	variant = "circle",
	start = "center",
	blur = false,
	gifUrl = "",
}: {
	variant?: AnimationVariant;
	start?: AnimationStart;
	blur?: boolean;
	gifUrl?: string;
} = {}) => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		setIsDark(resolvedTheme === "dark");
	}, [resolvedTheme]);

	const updateStyles = useCallback((css: string) => {
		if (typeof document === "undefined") return;

		let styleElement = document.getElementById("theme-transition-styles");

		if (!styleElement) {
			styleElement = document.createElement("style");
			styleElement.id = "theme-transition-styles";
			document.head.appendChild(styleElement);
		}

		styleElement.textContent = css;
	}, []);

	const toggleTheme = useCallback(() => {
		const currentIsDark =
			theme === "dark" ||
			(!theme &&
				window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);
		const nextTheme = currentIsDark ? "light" : "dark";

		const animation = createAnimation(variant, start, blur, gifUrl);
		updateStyles(animation.css);

		if (typeof window === "undefined") return;

		const applyThemeSwitch = () => {
			flushSync(() => {
				if (nextTheme === "dark") {
					document.documentElement.classList.add("dark");
				} else {
					document.documentElement.classList.remove("dark");
				}
				setTheme(nextTheme);
				setIsDark(nextTheme === "dark");
			});
		};

		if (!document.startViewTransition) {
			applyThemeSwitch();
			return;
		}

		document.startViewTransition(applyThemeSwitch);
	}, [theme, setTheme, variant, start, blur, gifUrl, updateStyles]);

	return {
		isDark,
		toggleTheme,
	};
};

export const ThemeToggleButton = ({
	className = "",
	variant = "rectangle",
	start = "right-left",
	blur = true,
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
		<button
			type="button"
			className={cn(
				"h-8 px-2.5 inline-flex items-center justify-center text-xs font-mono font-bold uppercase tracking-wider bg-surface-elevated/40 hover:bg-surface-hover text-text-primary transition-colors cursor-pointer enabled:active:scale-[0.96] rounded-xs",
				className,
			)}
			onClick={toggleTheme}
			aria-label={`Shift to ${isDark ? "light" : "dark"} mode`}
			title={`Shift to ${isDark ? "light" : "dark"} mode`}
		>
			{isDark ? "light" : "dark"}
		</button>
	);
};
export default ThemeToggleButton;
