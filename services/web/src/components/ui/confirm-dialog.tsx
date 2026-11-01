import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

export interface ConfirmOptions {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	destructive?: boolean;
}

interface ConfirmContextType {
	confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
	const context = useContext(ConfirmContext);
	if (!context) {
		throw new Error("useConfirm must be used within a ConfirmProvider");
	}
	return context.confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
	const [dialog, setDialog] = useState<
		(ConfirmOptions & { resolve: (value: boolean) => void }) | null
	>(null);

	const confirmBtnRef = useRef<HTMLButtonElement>(null);

	const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
		return new Promise<boolean>((resolve) => {
			setDialog({
				...options,
				resolve,
			});
		});
	}, []);

	const handleConfirm = useCallback(() => {
		if (dialog) {
			dialog.resolve(true);
			setDialog(null);
		}
	}, [dialog]);

	const handleCancel = useCallback(() => {
		if (dialog) {
			dialog.resolve(false);
			setDialog(null);
		}
	}, [dialog]);

	// Handle Escape / Enter keyboard shortcuts
	useEffect(() => {
		if (!dialog) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				handleCancel();
			} else if (e.key === "Enter") {
				e.preventDefault();
				handleConfirm();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [dialog, handleCancel, handleConfirm]);

	return (
		<ConfirmContext.Provider value={{ confirm }}>
			{children}

			{/* Browser-style custom deterring notification bar at top of window */}
			<AnimatePresence>
				{dialog ? (
					<>
						{/* Subtle backdrop overlay */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							onClick={handleCancel}
							className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
						/>

						{/* Notification Bar anchored at top (like browser notification/permission bar) */}
						<aside
							role="alertdialog"
							aria-modal="true"
							aria-labelledby="confirm-dialog-title"
							aria-describedby="confirm-dialog-desc"
							className="fixed top-0 left-0 right-0 z-50 w-full bg-surface-elevated border-b-2 border-red-500/80 shadow-2xl text-text-primary px-4 sm:px-8 py-3.5"
						>
							<div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
								{/* Icon & Message */}
								<div className="flex items-start sm:items-center space-x-3 text-xs flex-1">
									<div className="p-1.5 bg-red-500/10 border border-red-500/40 text-red-500 shrink-0">
										{dialog.destructive ? (
											<Trash2 className="w-4 h-4" />
										) : (
											<AlertTriangle className="w-4 h-4" />
										)}
									</div>
									<div>
										<h2
											id="confirm-dialog-title"
											className="font-bold uppercase tracking-wider text-text-primary text-xs flex items-center gap-2"
										>
											<span>{dialog.title || "CONFIRM ACTION"}</span>
											<span className="text-[10px] px-1.5 py-0.2 bg-red-500/20 text-red-400 font-normal">
												DETERRENT
											</span>
										</h2>
										<p
											id="confirm-dialog-desc"
											className="text-text-secondary text-xs mt-0.5"
										>
											{dialog.message}
										</p>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
									<button
										type="button"
										onClick={handleCancel}
										className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-surface-base hover:bg-surface-hover border border-border-default text-text-secondary hover:text-text-primary transition-colors cursor-pointer enabled:active:scale-[0.96]"
									>
										{dialog.cancelText || "CANCEL"}
									</button>

									<button
										ref={confirmBtnRef}
										type="button"
										onClick={handleConfirm}
										className="px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white border border-red-600 shadow-sm transition-colors cursor-pointer enabled:active:scale-[0.96]"
									>
										{dialog.confirmText || "PROCEED"}
									</button>

									<button
										type="button"
										onClick={handleCancel}
										className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer ml-1"
										title="Dismiss"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							</div>
						</aside>
					</>
				) : null}
			</AnimatePresence>
		</ConfirmContext.Provider>
	);
}

export default ConfirmProvider;
