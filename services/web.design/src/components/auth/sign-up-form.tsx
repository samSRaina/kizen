import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { FormInput } from "@/components/ui/form-input";
import { authClient } from "@/lib/auth-client";

export interface SignUpFormProps {
	onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
	const navigate = useNavigate();
	const [displayName, setDisplayName] = useState("");
	const [email, setEmail] = useState("");
	const [secret, setSecret] = useState("");
	const [confirmSecret, setConfirmSecret] = useState("");
	const [acceptTerms, setAcceptTerms] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const clearError = () => {
		if (errorMessage) setErrorMessage(null);
	};

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		if (!email || !secret) {
			setErrorMessage("Email and master secret are required.");
			return;
		}

		if (secret !== confirmSecret) {
			setErrorMessage("Master secrets do not match.");
			return;
		}

		if (!acceptTerms) {
			setErrorMessage("You must accept workspace policies & terms.");
			return;
		}

		setIsLoading(true);
		setErrorMessage(null);

		try {
			const formattedUsername = displayName.trim()
				? displayName.toLowerCase().replace(/[^a-z0-9_-]/g, "_")
				: email.split("@")[0].replace(/[^a-z0-9_-]/g, "_");

			const { error } = await authClient.signUp.email({
				name: displayName || formattedUsername,
				email,
				password: secret,
				username: formattedUsername,
			});

			if (error) {
				setErrorMessage(error.message || "Account provisioning rejected.");
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
					: "Network error during account registration.";
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
			className="space-y-4"
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
					id="sign-up-name"
					label="OPERATOR HANDLE"
					type="text"
					value={displayName}
					onChange={(e) => {
						clearError();
						setDisplayName(e.target.value);
					}}
					placeholder="alex.vance"
					disabled={isLoading}
					required
				/>
			</motion.div>

			<motion.div
				layout="position"
				transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
			>
				<FormInput
					id="sign-up-email"
					label="EMAIL"
					type="email"
					value={email}
					onChange={(e) => {
						clearError();
						setEmail(e.target.value);
					}}
					placeholder="alex@domain.network"
					disabled={isLoading}
					required
				/>
			</motion.div>

			<motion.div
				layout="position"
				transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
				className="grid grid-cols-1 sm:grid-cols-2 gap-3"
			>
				<FormInput
					id="sign-up-secret"
					label="MASTER SECRET"
					type="password"
					value={secret}
					onChange={(e) => {
						clearError();
						setSecret(e.target.value);
					}}
					placeholder="••••••••••••"
					disabled={isLoading}
					required
				/>

				<FormInput
					id="sign-up-confirm-secret"
					label="CONFIRM SECRET"
					type="password"
					value={confirmSecret}
					onChange={(e) => {
						clearError();
						setConfirmSecret(e.target.value);
					}}
					placeholder="••••••••••••"
					disabled={isLoading}
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
						checked={acceptTerms}
						onChange={(e) => {
							clearError();
							setAcceptTerms(e.target.checked);
						}}
						disabled={isLoading}
						required
						className="w-4 h-4 bg-surface-elevated border border-border-default text-accent-primary rounded-none focus:ring-0 focus:ring-offset-0 cursor-pointer accent-accent-primary"
					/>
					<span className="text-[11px] tracking-wide">
						ACCEPT ACCESS POLICIES & TERMS
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
					className="w-full group bg-accent-primary text-accent-primary-fg font-mono font-bold text-xs uppercase tracking-widest py-3.5 px-5 flex items-center justify-between border border-accent-primary hover:bg-accent-primary-hover active:bg-accent-primary-active transition-colors cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<span className="flex items-center space-x-2">
						{isLoading ? (
							<Loader2 className="w-4 h-4 text-accent-primary-fg animate-spin" />
						) : (
							<UserPlus className="w-4 h-4 text-accent-primary-fg" />
						)}
						<span>
							{isLoading
								? "PROVISIONING_OPERATOR..."
								: "CREATE_OPERATOR_ACCOUNT"}
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

export default SignUpForm;
