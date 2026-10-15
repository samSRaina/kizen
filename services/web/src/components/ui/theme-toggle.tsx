import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";

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
       ::view-transition-group(root) {\n        animation-duration: 0.65s;\n        animation-timing-function: var(--expo-out);\n      }\n            \n      ::view-transition-new(root) {\n        animation-name: reveal-light-${start}${blur ? "-blur" : ""};\n        ${blur ? "filter: blur(2px);" : ""}\n      }\n\n      ::view-transition-old(root),\n      .dark::view-transition-old(root) {\n        animation: none;\n        z-index: -1;\n      }\n      .dark::view-transition-new(root) {\n        animation-name: reveal-dark-${start}${blur ? "-blur" : ""};\n        ${blur ? "filter: blur(2px);" : ""}\n      }\n\n      @keyframes reveal-dark-${start}${blur ? "-blur" : ""} {\n        from {\n          clip-path: ${clipPath.from};\n          ${blur ? "filter: blur(8px);" : ""}\n        }\n        ${blur ? "50% { filter: blur(4px); }" : ""}\n        to {\n          clip-path: ${clipPath.to};\n          ${blur ? "filter: blur(0px);" : ""}\n        }\n      }\n\n      @keyframes reveal-light-${start}${blur ? "-blur" : ""} {\n        from {\n          clip-path: ${clipPath.from};\n          ${blur ? "filter: blur(8px);" : ""}\n        }\n        ${blur ? "50% { filter: blur(4px); }" : ""}\n        to {\n          clip-path: ${clipPath.to};\n          ${blur ? "filter: blur(0px);" : ""}\n        }\n      }\n      `,
		};
	}

	if (variant === "circle" && start === "center") {
		return {
			name: `${variant}-${start}${blur ? "-blur" : ""}`,
			css: `
       ::view-transition-group(root) {\n        animation-duration: 0.7s;\n        animation-timing-function: var(--expo-out);\n      }\n            \n      ::view-transition-new(root) {\n        animation-name: reveal-light${blur ? "-blur" : ""};\n        ${blur ? "filter: blur(2px);" : ""}\n      }\n\n      ::view-transition-old(root),\n      .dark::view-transition-old(root) {\n        animation: none;\n        z-index: -1;\n      }\n      .dark::view-transition-new(root) {\n        animation-name: reveal-dark${blur ? "-blur" : ""};\n        ${blur ? "filter: blur(2px);" : ""}\n      }\n\n      @keyframes reveal-dark${blur ? "-blur" : ""} {\n        from {\n          clip-path: circle(0% at 50% 50%);\n          ${blur ? "filter: blur(8px);" : ""}\n        }\n        ${blur ? "50% { filter: blur(4px); }" : ""}\n        to {\n          clip-path: circle(100.0% at 50% 50%);\n          ${blur ? "filter: blur(0px);" : ""}\n        }\n      }\n\n      @keyframes reveal-light${blur ? "-blur" : ""} {\n        from {\n           clip-path: circle(0% at 50% 50%);\n           ${blur ? "filter: blur(8px);" : ""}\n        }\n        ${blur ? "50% { filter: blur(4px); }" : ""}\n        to {\n          clip-path: circle(100.0% at 50% 50%);\n          ${blur ? "filter: blur(0px);" : ""}\n        }\n      }\n      `,
		};
	}

	if (variant === "gif") {
		return {
			name: `${variant}-${start}`,
			css: `
      ::view-transition-group(root) {\n  animation-timing-function: var(--expo-in);\n}\n\n::view-transition-new(root) {\n  mask: url('${url}') center / 0 no-repeat;\n  animation: scale 3s;\n}\n\n::view-transition-old(root),\n.dark::view-transition-old(root) {\n  animation: scale 3s;\n}\n\n@keyframes scale {\n  0% {\n    mask-size: 0;\n  }\n  10% {\n    mask-size: 50vmax;\n  }\n  90% {\n    mask-size: 50vmax;\n  }\n  100% {\n    mask-size: 2000vmax;\n  }\n}`,
		};
	}

	if (variant === "circle-blur") {
		if (start === "center") {
			return {
				name: `${variant}-${start}`,
				css: `
        ::view-transition-group(root) {\n          animation-timing-function: var(--expo-out);\n        }\n\n        ::view-transition-new(root) {\n          mask: url('${svg}') center / 0 no-repeat;\n          mask-origin: content-box;\n          animation: scale 1s;\n          transform-origin: center;\n        }\n\n        ::view-transition-old(root),\n        .dark::view-transition-old(root) {\n          animation: scale 1s;\n          transform-origin: center;\n          z-index: -1;\n        }\n\n        @keyframes scale {\n          to {\n            mask-size: 350vmax;\n          }\n        }\n        `,
			};
		}

		return {
			name: `${variant}-${start}`,
			css: `
      ::view-transition-group(root) {\n        animation-timing-function: var(--expo-out);\n      }\n\n      ::view-transition-new(root) {\n        mask: url('${svg}') ${start.replace("-", " ")} / 0 no-repeat;\n        mask-origin: content-box;\n        animation: scale 1s;\n        transform-origin: ${transformOrigin};\n      }\n\n      ::view-transition-old(root),\n      .dark::view-transition-old(root) {\n        animation: scale 1s;\n        transform-origin: ${transformOrigin};\n        z-index: -1;\n      }\n\n      @keyframes scale {\n        to {\n          mask-size: 350vmax;\n        }\n      }\n      `,
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
       ::view-transition-group(root) {\n        animation-duration: 0.7s;\n        animation-timing-function: var(--expo-out);\n      }\n            \n      ::view-transition-new(root) {\n        animation-name: reveal-light-${start}${blur ? "-blur" : ""};\n        ${blur ? "filter: blur(2px);" : ""}\n      }\n\n      ::view-transition-old(root),\n      .dark::view-transition-old(root) {\n        animation: none;\n        z-index: -1;\n      }\n      .dark::view-transition-new(root) {\n        animation-name: reveal-dark-${start}${blur ? "-blur" : ""};\n        ${blur ? "filter: blur(2px);" : ""}\n      }\n\n      @keyframes reveal-dark-${start}${blur ? "-blur" : ""} {\n        from {\n          clip-path: ${clipPaths.darkFrom};\n          ${blur ? "filter: blur(8px);" : ""}\n        }\n        ${blur ? "50% { filter: blur(4px); }" : ""}\n        to {\n          clip-path: ${clipPaths.darkTo};\n          ${blur ? "filter: blur(0px);" : ""}\n        }\n      }\n\n      @keyframes reveal-light-${start}${blur ? "-blur" : ""} {\n        from {\n          clip-path: ${clipPaths.lightFrom};\n          ${blur ? "filter: blur(8px);" : ""}\n        }\n        ${blur ? "50% { filter: blur(4px); }" : ""}\n        to {\n          clip-path: ${clipPaths.lightTo};\n          ${blur ? "filter: blur(0px);" : ""}\n        }\n      }\n      `,
		};
	}

	return {
		name: `${variant}-${start}${blur ? "-blur" : ""}`,
		css: `
      ::view-transition-group(root) {\n        animation-timing-function: var(--expo-in);\n      }\n      ::view-transition-new(root) {\n        mask: url('${svg}') ${start.replace("-", " ")} / 0 no-repeat;\n        mask-origin: content-box;\n        animation: scale-${start}${blur ? "-blur" : ""} 1s;\n        transform-origin: ${transformOrigin};\n        ${blur ? "filter: blur(2px);" : ""}\n      }\n      ::view-transition-old(root),\n      .dark::view-transition-old(root) {\n        animation: scale-${start}${blur ? "-blur" : ""} 1s;\n        transform-origin: ${transformOrigin};\n        z-index: -1;\n      }\n      @keyframes scale-${start}${blur ? "-blur" : ""} {\n        from {\n          ${blur ? "filter: blur(8px);" : ""}\n        }\n        ${blur ? "50% { filter: blur(4px); }" : ""}\n        to {\n          mask-size: 2000vmax;\n          ${blur ? "filter: blur(0px);" : ""}\n        }\n      }\n    `,
	};
};

export const useThemeToggle = ({
	variant = "rectangle",
	start = "right-left",
	blur = true,
	gifUrl = "",
}: {
	variant?: AnimationVariant;
	start?: AnimationStart;
	blur?: boolean;
	gifUrl?: string;
} = {}) => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		const currentDark =
			resolvedTheme === "dark" ||
			document.documentElement.classList.contains("dark");
		setIsDark(currentDark);
	}, [resolvedTheme]);

	const styleId = "theme-transition-styles";

	const updateStyles = useCallback((css: string) => {
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
		const currentIsDark =
			(resolvedTheme ?? theme ?? "dark") === "dark" ||
			document.documentElement.classList.contains("dark");
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
	}, [
		theme,
		resolvedTheme,
		setTheme,
		variant,
		start,
		blur,
		gifUrl,
		updateStyles,
	]);

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
				"w-7 h-7 flex items-center justify-center cursor-pointer bg-transparent text-text-primary hover:bg-surface-hover transition-colors p-1 rounded-full",
				className,
			)}
			onClick={toggleTheme}
			aria-label="Toggle theme"
			title="Toggle theme"
		>
			<svg
				viewBox="0 0 240 240"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="w-4 h-4"
				aria-hidden="true"
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
						fill="currentColor"
						className="opacity-25"
					/>
				</motion.g>
				<motion.path
					animate={{ rotate: isDark ? 180 : 0 }}
					transition={{ ease: "easeInOut", duration: 0.5 }}
					d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
					fill="currentColor"
				/>
			</svg>
		</button>
	);
};

export default ThemeToggleButton;
