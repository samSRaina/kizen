import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { FormInput } from "@/components/ui/form-input";
import { authClient } from "@/lib/auth-client";

export interface SignInFormProps {
	onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
	const navigate = useNavigate();
	const [identifier, setIdentifier] = useState("");
	const [secret, setSecret] = useState("");
	const [rememberMe, setRememberMe] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const clearError = () => {
		if (errorMessage) setErrorMessage(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedIdentifier = identifier.trim();
		if (!trimmedIdentifier || !secret) {
			setErrorMessage("Identifier and secret are required.");
			return;
		}

		setIsLoading(true);
		setErrorMessage(null);

		try {
			const isEmail = trimmedIdentifier.includes("@");
			const { error } = isEmail
				? await authClient.signIn.email({
						email: trimmedIdentifier,
						password: secret,
						rememberMe,
					})
				: await authClient.signIn.username({
						username: trimmedIdentifier,
						password: secret,
						rememberMe,
					});

			if (error) {
				setErrorMessage(
					error.message || "Invalid email/username or secret credentials.",
				);
				setIsLoading(false);
				return;
			}

			if (onSuccess) {
				onSuccess();
			} else {
				await navigate({ to: "/home" });
			}
		} catch (err: unknown) {
			const msg =
				err instanceof Error
					? err.message
					: "Network error during authentication handshake.";
			setErrorMessage(msg);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<motion.form
			layout
			transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
			onSubmit={handleSubmit}
			className="space-y-5"
		>
			<AuthErrorAlert
				message={errorMessage}
				onClear={() => setErrorMessage(null)}
			/>

			<motion.div
				layout="position"
				transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
			>
				<FormInput
					id="sign-in-identifier"
					label="EMAIL OR USERNAME"
					type="text"
					value={identifier}
					onChange={(e) => {
						clearError();
						setIdentifier(e.target.value);
					}}
					placeholder="operator@domain.network or username"
					disabled={isLoading}
					required
				/>
			</motion.div>

			<motion.div
				layout="position"
				transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
			>
				<FormInput
					id="sign-in-secret"
					label="AUTHENTICATOR SECRET"
					type="password"
					value={secret}
					onChange={(e) => {
						clearError();
						setSecret(e.target.value);
					}}
					placeholder="••••••••••••••••"
					disabled={isLoading}
					trailingAction={
						<button
							type="button"
							className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
						>
							[RECOVER_KEY?]
						</button>
					}
					required
				/>
			</motion.div>

			<motion.div
				layout="position"
				transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
				className="flex items-center justify-between pt-1 font-mono text-xs text-text-secondary"
			>
				<label className="flex items-center space-x-2.5 cursor-pointer">
					<input
						type="checkbox"
						checked={rememberMe}
						onChange={(e) => setRememberMe(e.target.checked)}
						disabled={isLoading}
						className="w-4 h-4 bg-surface-elevated border border-border-default text-accent-primary rounded-none focus:ring-0 focus:ring-offset-0 cursor-pointer accent-accent-primary"
					/>
					<span className="text-[11px] tracking-wide">
						MAINTAIN SESSION TOKEN (24H)
					</span>
				</label>
			</motion.div>

			<motion.div
				layout="position"
				transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
			>
				<button
					type="submit"
					disabled={isLoading}
					className="w-full group bg-accent-primary text-accent-primary-fg font-mono font-bold text-xs uppercase tracking-widest py-3.5 px-5 flex items-center justify-between border border-accent-primary hover:bg-accent-primary-hover active:bg-accent-primary-active transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<span className="flex items-center space-x-2">
						{isLoading ? (
							<Loader2 className="w-4 h-4 text-accent-primary-fg animate-spin" />
						) : (
							<ShieldCheck className="w-4 h-4 text-accent-primary-fg" />
						)}
						<span>
							{isLoading
								? "AUTHENTICATING_HANDSHAKE..."
								: "AUTHENTICATE_IDENTITY"}
						</span>
					</span>
					<div className="w-7 h-7 bg-accent-primary-fg text-accent-primary flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
						<ArrowRight className="w-3.5 h-3.5" />
					</div>
				</button>
			</motion.div>
		</motion.form>
	);
}

export default SignInForm;
