import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Logo } from "#/components/ui/logo";
import { authClient } from "#/lib/auth-client";
import { clearCachedAuthToken } from "#/lib/goapi-client";
import { authKeys, authQueries } from "#/lib/queries/auth";

export interface AuthenticateSearch {
	mode?: "sign-in" | "sign-up";
	redirect?: string;
}

export const Route = createFileRoute("/authenticate")({
	validateSearch: (search: Record<string, unknown>): AuthenticateSearch => {
		return {
			mode: search.mode === "sign-up" ? "sign-up" : "sign-in",
			redirect:
				typeof search.redirect === "string" ? search.redirect : undefined,
		};
	},
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.query(authQueries.session());
		if (session?.user) {
			throw redirect({ to: "/workspaces" });
		}
	},
	component: AuthenticateComponent,
});

export function AuthenticateComponent() {
	const navigate = Route.useNavigate();
	const search = Route.useSearch();
	const queryClient = useQueryClient();
	const { theme, setTheme, resolvedTheme } = useTheme();

	const [isSignUp, setIsSignUp] = useState(search.mode === "sign-up");
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const currentTheme = theme === "system" ? resolvedTheme : theme;
	const nextTheme = currentTheme === "dark" ? "light" : "dark";

	const toggleTheme = () => {
		setTheme(nextTheme);
	};

	const redirectTarget = search.redirect || "/workspaces";

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (isSignUp) {
			const trimmedUsername = username.trim();
			const trimmedEmail = email.trim();
			if (!trimmedUsername || !trimmedEmail || !password) {
				setError("Username, email, and password are required.");
				return;
			}

			setIsLoading(true);
			try {
				const res = await authClient.signUp.email({
					name: name.trim() || trimmedUsername,
					email: trimmedEmail,
					username: trimmedUsername,
					password,
				});

				if (res.error) {
					setError(res.error.message || "Failed to create account.");
					return;
				}

				clearCachedAuthToken();
				queryClient.clear();
				await queryClient.invalidateQueries({ queryKey: authKeys.session() });

				navigate({ to: redirectTarget });
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to create account.",
				);
			} finally {
				setIsLoading(false);
			}
		} else {
			const trimmedIdentifier = identifier.trim();
			if (!trimmedIdentifier || !password) {
				setError("Username and password are required.");
				return;
			}

			setIsLoading(true);
			try {
				const isEmail = trimmedIdentifier.includes("@");
				const res = isEmail
					? await authClient.signIn.email({
							email: trimmedIdentifier,
							password,
						})
					: await authClient.signIn.username({
							username: trimmedIdentifier,
							password,
						});

				if (res.error) {
					setError(res.error.message || "Invalid username or password.");
					return;
				}

				clearCachedAuthToken();
				queryClient.clear();
				await queryClient.invalidateQueries({ queryKey: authKeys.session() });

				navigate({ to: redirectTarget });
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to sign in.");
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<div className="auth-wrapper">
			<div className="auth-card">
				{/* Top bar with Logo only (no text) and Theme Toggle */}
				<div className="flex-row-between">
					<Logo size="md" showText={false} />
					<button
						type="button"
						onClick={toggleTheme}
						className="ghost-btn-sm flex items-center gap-1.5"
						title={`Switch to ${nextTheme} theme`}
					>
						{currentTheme === "dark" ? (
							<Sun className="w-3.5 h-3.5" />
						) : (
							<Moon className="w-3.5 h-3.5" />
						)}
						<span className="capitalize">{nextTheme}</span>
					</button>
				</div>

				{/* Title and subtitle */}
				<div className="pt-1">
					<h2 className="text-title-md font-semibold">
						{isSignUp ? "Create an Account" : "Sign In"}
					</h2>
					<p className="text-muted-xs mt-0.5">
						{isSignUp
							? "Enter your details below to create your account"
							: "Enter your username and password to access your workspaces"}
					</p>
				</div>

				{error && <div className="error-banner">{error}</div>}

				<form onSubmit={handleAuth} className="auth-form">
					{isSignUp ? (
						<>
							<div className="auth-field">
								<label htmlFor="signup-name" className="auth-label">
									Full Name
								</label>
								<input
									id="signup-name"
									type="text"
									placeholder="Alex Smith"
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={isLoading}
									className="ghost-input"
								/>
							</div>

							<div className="auth-field">
								<label htmlFor="signup-username" className="auth-label">
									Username
								</label>
								<input
									id="signup-username"
									type="text"
									placeholder="alex_smith"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									disabled={isLoading}
									className="ghost-input"
									required
								/>
							</div>

							<div className="auth-field">
								<label htmlFor="signup-email" className="auth-label">
									Email Address
								</label>
								<input
									id="signup-email"
									type="email"
									placeholder="alex@domain.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={isLoading}
									className="ghost-input"
									required
								/>
							</div>

							<div className="auth-field">
								<label htmlFor="signup-password" className="auth-label">
									Password
								</label>
								<input
									id="signup-password"
									type="password"
									placeholder="••••••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isLoading}
									className="ghost-input"
									required
								/>
							</div>
						</>
					) : (
						<>
							<div className="auth-field">
								<label htmlFor="signin-username" className="auth-label">
									Username
								</label>
								<input
									id="signin-username"
									type="text"
									placeholder="username or email"
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									disabled={isLoading}
									className="ghost-input"
									required
								/>
							</div>

							<div className="auth-field">
								<label htmlFor="signin-password" className="auth-label">
									Password
								</label>
								<input
									id="signin-password"
									type="password"
									placeholder="••••••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isLoading}
									className="ghost-input"
									required
								/>
							</div>
						</>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="auth-submit-btn"
					>
						{isLoading
							? isSignUp
								? "Creating Account..."
								: "Signing In..."
							: isSignUp
								? "Sign Up"
								: "Sign In"}
					</button>

					<div className="flex justify-center mt-2">
						<button
							type="button"
							onClick={() => {
								setIsSignUp(!isSignUp);
								setError(null);
							}}
							className="text-xs text-muted-xs hover:underline cursor-pointer"
						>
							{isSignUp
								? "Already have an account? Sign In"
								: "Need an account? Sign Up"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default AuthenticateComponent;
