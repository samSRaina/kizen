import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Info,
	X,
} from "lucide-react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

export type ToastType = "info" | "success" | "error" | "warning";

export interface ToastItem {
	id: string;
	title?: string;
	message: string;
	type: ToastType;
	durationMs?: number;
}

export interface ToastOptions {
	id?: string;
	title?: string;
	durationMs?: number;
}

interface ToastContextType {
	showToast: (
		message: string,
		type?: ToastType,
		options?: ToastOptions,
	) => string;
	error: (message: string, options?: ToastOptions) => string;
	success: (message: string, options?: ToastOptions) => string;
	info: (message: string, options?: ToastOptions) => string;
	warning: (message: string, options?: ToastOptions) => string;
	dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let globalToastId = 0;

export function useToast(): ToastContextType {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const showToast = useCallback(
		(message: string, type: ToastType = "info", options?: ToastOptions) => {
			const id = options?.id || `toast-${Date.now()}-${++globalToastId}`;
			const durationMs = options?.durationMs ?? 4500;

			const newToast: ToastItem = {
				id,
				title: options?.title,
				message,
				type,
				durationMs,
			};

			setToasts((prev) => {
				// Don't duplicate exact same message if already shown
				const filtered = prev.filter(
					(t) => t.id !== id && t.message !== message,
				);
				return [...filtered, newToast];
			});

			if (durationMs > 0) {
				setTimeout(() => {
					dismiss(id);
				}, durationMs);
			}

			return id;
		},
		[dismiss],
	);

	const error = useCallback(
		(message: string, options?: ToastOptions) =>
			showToast(message, "error", options),
		[showToast],
	);

	const success = useCallback(
		(message: string, options?: ToastOptions) =>
			showToast(message, "success", options),
		[showToast],
	);

	const info = useCallback(
		(message: string, options?: ToastOptions) =>
			showToast(message, "info", options),
		[showToast],
	);

	const warning = useCallback(
		(message: string, options?: ToastOptions) =>
			showToast(message, "warning", options),
		[showToast],
	);

	const contextValue = useMemo(
		() => ({
			showToast,
			error,
			success,
			info,
			warning,
			dismiss,
		}),
		[showToast, error, success, info, warning, dismiss],
	);

	return (
		<ToastContext.Provider value={contextValue}>
			{children}

			{/* Toast Viewport at top-center */}
			<div
				aria-live="polite"
				aria-atomic="true"
				className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4"
			>
				<AnimatePresence initial={false}>
					{toasts.map((toast) => {
						const isError = toast.type === "error";
						const isSuccess = toast.type === "success";
						const isWarning = toast.type === "warning";

						return (
							<motion.div
								key={toast.id}
								layout
								initial={{ opacity: 0, y: -16, scale: 0.96 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -12, scale: 0.94 }}
								transition={{ duration: 0.18, ease: "easeOut" }}
								className={`pointer-events-auto w-full flex items-start gap-3 p-3 rounded border shadow-xl backdrop-blur-md text-xs ${
									isError
										? "bg-red-950/90 border-red-500/50 text-red-200"
										: isSuccess
											? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
											: isWarning
												? "bg-amber-950/90 border-amber-500/50 text-amber-200"
												: "bg-surface-elevated/95 border-border-default text-text-primary"
								}`}
							>
								<div className="shrink-0 mt-0.5">
									{isError && <AlertCircle className="w-4 h-4 text-red-400" />}
									{isSuccess && (
										<CheckCircle2 className="w-4 h-4 text-emerald-400" />
									)}
									{isWarning && (
										<AlertTriangle className="w-4 h-4 text-amber-400" />
									)}
									{!isError && !isSuccess && !isWarning && (
										<Info className="w-4 h-4 text-sky-400" />
									)}
								</div>

								<div className="flex-1 min-w-0">
									{toast.title && (
										<div className="font-semibold text-xs mb-0.5 tracking-tight">
											{toast.title}
										</div>
									)}
									<div className="text-[11px] leading-relaxed break-words font-sans">
										{toast.message}
									</div>
								</div>

								<button
									type="button"
									onClick={() => dismiss(toast.id)}
									className="shrink-0 text-text-muted hover:text-text-primary p-0.5 transition-colors cursor-pointer rounded"
									title="Dismiss notification"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</ToastContext.Provider>
	);
}

export default ToastProvider;
