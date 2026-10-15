import {
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
} from "framer-motion";
import {
	type ComponentPropsWithoutRef,
	useEffect,
	useRef,
	useState,
} from "react";

import { cn } from "@/lib/utils";

const PASSWORD_CHAR =
	typeof navigator !== "undefined" &&
	navigator.userAgent.match(/firefox|fxios/i)
		? "\u25CF"
		: "\u2022";

export type SmoothInputType = "text" | "password" | "email";

export type SmoothInputProps = Omit<
	ComponentPropsWithoutRef<"input">,
	"type"
> & {
	type?: SmoothInputType;
	wrapperClassName?: string;
};

export const SmoothInput = ({
	className,
	wrapperClassName,
	value,
	defaultValue,
	onChange,
	onBlur,
	onFocus,
	type = "text",
	placeholder,
	style,
	...props
}: SmoothInputProps) => {
	const [internalValue, setInternalValue] = useState(defaultValue ?? "");
	const caretX = useMotionValue(0);
	const caretOpacity = useMotionValue(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const measureRef = useRef<HTMLSpanElement>(null);
	const prefersReducedMotion = useReducedMotion();

	const isControlled = value !== undefined;
	const inputValue = isControlled ? String(value) : internalValue;

	const springCaretX = useSpring(
		caretX,
		prefersReducedMotion
			? { stiffness: 10000, damping: 100, mass: 0.1 }
			: { stiffness: 500, damping: 30, mass: 0.5 },
	);

	const syncMeasureSpan = () => {
		const input = inputRef.current;
		const measureSpan = measureRef.current;
		if (!input || !measureSpan) return;

		const styles = window.getComputedStyle(input);
		const isPassword = type === "password";

		let fontSize = styles.fontSize;
		if (
			PASSWORD_CHAR === "\u2022" &&
			isPassword &&
			typeof navigator !== "undefined" &&
			!navigator.userAgent.match(/chrome|chromium|crios/i)
		) {
			fontSize = `${Number.parseFloat(fontSize) + 6.25}px`;
		}

		measureSpan.style.font = `${styles.fontStyle} ${styles.fontWeight} ${fontSize} ${styles.fontFamily}`;
		measureSpan.style.letterSpacing = styles.letterSpacing;
		measureSpan.style.fontFeatureSettings = styles.fontFeatureSettings;
		measureSpan.style.fontVariationSettings = styles.fontVariationSettings;
	};

	const measurePrefixWidth = (text: string) => {
		const input = inputRef.current;
		const measureSpan = measureRef.current;
		if (!input || !measureSpan) return null;

		syncMeasureSpan();
		measureSpan.textContent = text;

		const paddingLeft =
			Number.parseFloat(window.getComputedStyle(input).paddingLeft) || 0;

		return text.length > 0
			? measureSpan.offsetWidth + paddingLeft
			: paddingLeft;
	};

	const scrollCaretIntoView = (
		target: HTMLInputElement,
		absoluteWidth: number,
	) => {
		const styles = window.getComputedStyle(target);
		const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
		const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
		const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
		const visibleRight = target.scrollLeft + target.clientWidth - paddingRight;
		const visibleLeft = target.scrollLeft + paddingLeft;

		if (absoluteWidth > visibleRight) {
			target.scrollLeft = Math.min(
				absoluteWidth - target.clientWidth + paddingRight,
				maxScroll,
			);
			return;
		}

		if (absoluteWidth < visibleLeft) {
			target.scrollLeft = Math.max(0, absoluteWidth - paddingLeft);
		}
	};

	const getCaretIndex = (target: HTMLInputElement) => {
		try {
			const selectionStart = target.selectionStart ?? 0;
			const selectionEnd = target.selectionEnd ?? 0;

			if (selectionStart === selectionEnd) {
				return selectionStart;
			}

			return target.selectionDirection === "backward"
				? selectionStart
				: selectionEnd;
		} catch {
			return target.value.length;
		}
	};

	const updateCaretFromInput = (target: HTMLInputElement) => {
		try {
			const caretIndex = getCaretIndex(target);
			let hasSelection = false;
			try {
				hasSelection =
					target.selectionStart !== null &&
					target.selectionEnd !== null &&
					target.selectionStart !== target.selectionEnd;
			} catch {
				hasSelection = false;
			}

			const isPassword = type === "password";
			const textBeforeCaret = isPassword
				? PASSWORD_CHAR.repeat(caretIndex)
				: target.value.slice(0, caretIndex);

			const absoluteWidth = measurePrefixWidth(textBeforeCaret);
			if (absoluteWidth === null) return;

			scrollCaretIntoView(target, absoluteWidth);

			const styles = window.getComputedStyle(target);
			const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
			const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
			const caretPosition = absoluteWidth - target.scrollLeft;
			const minX = paddingLeft;
			const maxX = target.clientWidth - paddingRight;
			const isCaretVisible = caretPosition >= minX && caretPosition <= maxX + 1;

			caretX.set(Math.min(caretPosition, maxX));

			if (!isCaretVisible || hasSelection) {
				caretOpacity.set(0);
				return;
			}

			caretOpacity.set(1);
		} catch {
			caretOpacity.set(0);
		}
	};

	const updateCaretRef = useRef(updateCaretFromInput);
	updateCaretRef.current = updateCaretFromInput;
	const caretOpacityRef = useRef(caretOpacity);
	caretOpacityRef.current = caretOpacity;

	useEffect(() => {
		const input = inputRef.current;
		if (input && document.activeElement === input) {
			updateCaretRef.current(input);
		}
	});

	useEffect(() => {
		const input = inputRef.current;
		const container = containerRef.current;
		if (!input || !container) return;

		const updateCaretIfFocused = () => {
			if (document.activeElement === input) {
				updateCaretRef.current(input);
			}
		};

		const handleSelectionChange = () => {
			if (document.activeElement !== input) return;

			requestAnimationFrame(() => {
				if (document.activeElement === input) {
					updateCaretRef.current(input);
				}
			});
		};

		document.addEventListener("selectionchange", handleSelectionChange);
		document.fonts.addEventListener("loadingdone", updateCaretIfFocused);
		void document.fonts.ready.then(updateCaretIfFocused);
		input.addEventListener("scroll", updateCaretIfFocused);

		const resizeObserver = new ResizeObserver(updateCaretIfFocused);
		resizeObserver.observe(container);

		updateCaretIfFocused();

		return () => {
			document.removeEventListener("selectionchange", handleSelectionChange);
			document.fonts.removeEventListener("loadingdone", updateCaretIfFocused);
			input.removeEventListener("scroll", updateCaretIfFocused);
			resizeObserver.disconnect();
		};
	}, []);

	return (
		<div
			className={cn(
				"relative w-full border-b border-border-default transition-colors duration-150 focus-within:border-text-primary bg-surface-elevated/40 hover:bg-surface-elevated/60 px-3 py-2.5",
				wrapperClassName,
			)}
		>
			<div
				ref={containerRef}
				className="relative grid grid-cols-1 p-0 font-mono text-sm"
				style={{ caretColor: "transparent" }}
			>
				<input
					{...props}
					ref={inputRef}
					type={type === "email" ? "text" : type}
					inputMode={type === "email" ? "email" : props.inputMode}
					autoCapitalize={type === "email" ? "none" : props.autoCapitalize}
					autoCorrect={type === "email" ? "off" : props.autoCorrect}
					spellCheck={type === "email" ? false : props.spellCheck}
					placeholder={placeholder}
					className={cn(
						"col-start-1 col-end-2 row-start-1 row-end-2 w-full bg-transparent border-0 outline-none text-text-primary placeholder:text-text-muted/40 font-mono text-sm p-0 m-0",
						className,
					)}
					style={style}
					value={inputValue}
					onFocus={(e) => {
						onFocus?.(e);
						requestAnimationFrame(() => {
							updateCaretRef.current(e.target);
						});
					}}
					onChange={(e) => {
						if (!isControlled) setInternalValue(e.target.value);
						onChange?.(e);
						requestAnimationFrame(() => {
							updateCaretRef.current(e.target);
						});
					}}
					onBlur={(e) => {
						caretOpacityRef.current.set(0);
						onBlur?.(e);
					}}
				/>
				<span
					ref={measureRef}
					aria-hidden
					className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre"
				/>
				<motion.div
					className="bg-text-primary pointer-events-none col-start-1 col-end-2 row-start-1 row-end-2 h-[1.15em] w-0.5 self-center shadow-[0_0_8px_var(--color-border-strong)]"
					style={{ x: springCaretX, opacity: caretOpacity }}
				/>
			</div>
		</div>
	);
};

export default SmoothInput;
