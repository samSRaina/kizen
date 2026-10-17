import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export interface AuthErrorAlertProps {
	message: string | null;
	onClear?: () => void;
	autoDismissMs?: number;
}

export function AuthErrorAlert({
	message,
	onClear,
	autoDismissMs = 4500,
}: AuthErrorAlertProps) {
	useEffect(() => {
		if (!message || !onClear) return;
		const timer = setTimeout(() => {
			onClear();
		}, autoDismissMs);
		return () => clearTimeout(timer);
	}, [message, onClear, autoDismissMs]);

	return (
		<AnimatePresence initial={false}>
			{message && (
				<motion.div
					key="auth-error-wrapper"
					layout="position"
					initial={{ height: 0, opacity: 0 }}
					animate={{
						height: "auto",
						opacity: 1,
						transition: {
							height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
							opacity: { duration: 0.25 },
						},
					}}
					exit={{
						height: 0,
						opacity: 0,
						transition: {
							height: { duration: 0.42, delay: 0.16, ease: [0.16, 1, 0.3, 1] },
							opacity: { duration: 0.25, delay: 0.15 },
						},
					}}
					className="overflow-hidden"
				>
					<motion.div
						key="auth-error-content"
						initial={{
							clipPath: "polygon(-30% 0%, 0% 0%, -30% 100%, -60% 100%)",
							opacity: 0,
							y: -6,
						}}
						animate={{
							clipPath: "polygon(-30% 0%, 130% 0%, 100% 100%, -60% 100%)",
							opacity: 1,
							y: 0,
							transition: {
								clipPath: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
								opacity: { duration: 0.25 },
								y: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
							},
						}}
						exit={{
							clipPath: "polygon(100% 0%, 130% 0%, 130% 100%, 100% 100%)",
							opacity: 0,
							y: -4,
							transition: {
								clipPath: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
								opacity: { duration: 0.28 },
							},
						}}
						className="p-3 bg-red-950/40 border border-red-800/80 text-red-300 font-mono text-xs flex items-center space-x-2 mb-4"
					>
						<AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
						<span>{message}</span>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default AuthErrorAlert;
