import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient, useSession } from "../lib/auth-client";

function Logo() {
	return (
		<div className="logo-mark">
			<span className="logo-k">K</span>
			<span>izen</span>
			<i />
		</div>
	);
}

interface AuthFormProps {
	initialMode: "signin" | "signup";
}

export function AuthForm({ initialMode }: AuthFormProps) {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"signin" | "signup">(initialMode);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Form fields
	const [identifier, setIdentifier] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { data: session } = useSession();
	const isSignup = mode === "signup";

	useEffect(() => {
		setMode(initialMode);
		setError(null);
	}, [initialMode]);

	useEffect(() => {
		if (session) {
			navigate({ to: "/home" });
		}
	}, [session, navigate]);

	const switchMode = (next: "signin" | "signup") => {
		setMode(next);
		setError(null);
		navigate({ to: next === "signup" ? "/signup" : "/login" });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			if (isSignup) {
				const trimmedUsername = username.trim();
				const trimmedEmail = email.trim();

				if (!trimmedUsername) {
					setError("Username is required");
					setLoading(false);
					return;
				}
				if (!trimmedEmail) {
					setError("Email is required");
					setLoading(false);
					return;
				}
				if (!password) {
					setError("Password is required");
					setLoading(false);
					return;
				}
				if (password.length < 6) {
					setError("Password must be at least 6 characters");
					setLoading(false);
					return;
				}

				const res = await authClient.signUp.email({
					email: trimmedEmail,
					password,
					name: trimmedUsername,
					username: trimmedUsername,
				});

				if (res?.error) {
					setError(res.error.message || "Failed to create account");
					setLoading(false);
					return;
				}

				navigate({ to: "/home" });
			} else {
				const trimmedIdentifier = identifier.trim();
				if (!trimmedIdentifier) {
					setError("Username or email is required");
					setLoading(false);
					return;
				}
				if (!password) {
					setError("Password is required");
					setLoading(false);
					return;
				}

				let res:
					| { error?: { message?: string } | null }
					| undefined;

				if (trimmedIdentifier.includes("@")) {
					res = await authClient.signIn.email({
						email: trimmedIdentifier,
						password,
					});
				} else {
					res = await authClient.signIn.username({
						username: trimmedIdentifier,
						password,
					});
				}

				if (res?.error) {
					setError(res.error.message || "Invalid username or password");
					setLoading(false);
					return;
				}

				navigate({ to: "/home" });
			}
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred",
			);
			setLoading(false);
		}
	};

	return (
		<main className="minimal-auth-shell">
			<div className="minimal-auth-grid" />
			<header className="minimal-auth-header">
				<Link to="/" aria-label="Back to home">
					<Logo />
				</Link>
				<Link to="/" className="minimal-back">
					Back to home{" "}
					<ArrowRightIcon className="w-3.5 h-3.5 inline-block" />
				</Link>
			</header>

			<section className="minimal-auth-stage">
				<div className="minimal-auth-card">
					<div className="minimal-auth-logo">
						<Logo />
					</div>
					<p className="minimal-auth-eyebrow">
						<SparklesIcon className="w-3 h-3 inline-block" /> KIZEN APP
					</p>
					<h1>{isSignup ? "Welcome to Kizen" : "Welcome back"}</h1>
					<p className="minimal-auth-subtitle">
						{isSignup
							? "Create your account to get started."
							: "Sign in to continue to your workspace."}
					</p>

					{error && <div className="minimal-auth-error">{error}</div>}

					<form className="minimal-auth-form" onSubmit={handleSubmit}>
						{isSignup ? (
							<>
								<div className="minimal-auth-field">
									<label htmlFor="auth-username" className="minimal-auth-label">
										Username
									</label>
									<input
										id="auth-username"
										type="text"
										className="minimal-auth-input"
										placeholder="e.g. johndoe"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										autoComplete="username"
										required
										autoFocus
									/>
								</div>

								<div className="minimal-auth-field">
									<label htmlFor="auth-email" className="minimal-auth-label">
										Email
									</label>
									<input
										id="auth-email"
										type="email"
										className="minimal-auth-input"
										placeholder="e.g. john@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										autoComplete="email"
										required
									/>
								</div>

								<div className="minimal-auth-field">
									<label htmlFor="auth-password" className="minimal-auth-label">
										Password
									</label>
									<input
										id="auth-password"
										type="password"
										className="minimal-auth-input"
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										autoComplete="new-password"
										required
									/>
								</div>
							</>
						) : (
							<>
								<div className="minimal-auth-field">
									<label htmlFor="auth-identifier" className="minimal-auth-label">
										Username or Email
									</label>
									<input
										id="auth-identifier"
										type="text"
										className="minimal-auth-input"
										placeholder="e.g. johndoe"
										value={identifier}
										onChange={(e) => setIdentifier(e.target.value)}
										autoComplete="username"
										required
										autoFocus
									/>
								</div>

								<div className="minimal-auth-field">
									<label htmlFor="auth-password" className="minimal-auth-label">
										Password
									</label>
									<input
										id="auth-password"
										type="password"
										className="minimal-auth-input"
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										autoComplete="current-password"
										required
									/>
								</div>
							</>
						)}

						<button
							type="submit"
							className="minimal-auth-submit"
							disabled={loading}
						>
							{loading
								? "Authenticating..."
								: isSignup
									? "Create account"
									: "Sign in"}
							{!loading && <ArrowRightIcon className="w-3.5 h-3.5 inline-block" />}
						</button>
					</form>

					<div className="minimal-auth-switch">
						{isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
						<button
							type="button"
							onClick={() => switchMode(isSignup ? "signin" : "signup")}
						>
							{isSignup ? "Sign in" : "Sign up"}{" "}
							<ArrowRightIcon className="w-3 h-3 inline-block" />
						</button>
					</div>
				</div>
			</section>

			<footer className="minimal-auth-footer">
				<span>© 2026 Kizen Industries</span>
				<span>Privacy　 Terms　 Support</span>
			</footer>
		</main>
	);
}
