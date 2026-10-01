import { Brand } from "@/components/ui/brand";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-up")({
	component: SignUpRoute,
});

function SignUpRoute() {
	const navigate = useNavigate();
	const { data: session } = useSession();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	useEffect(() => {
		if (session) {
			navigate({ to: "/home" });
		}
	}, [session, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
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
					<Brand />
				</Link>
				<Link to="/" className="minimal-back">
					Back to home{" "}
					<ArrowRightIcon className="w-3.5 h-3.5 inline-block" />
				</Link>
			</header>

			<section className="minimal-auth-stage">
				<div className="minimal-auth-card">
					<div className="minimal-auth-logo">
						<Brand />
					</div>
					<p className="minimal-auth-eyebrow">
						<SparklesIcon className="w-3 h-3 inline-block" /> KIZEN APP
					</p>
					<h1>Welcome to Kizen</h1>
					<p className="minimal-auth-subtitle">
						Create your account to get started.
					</p>

					{error && <div className="minimal-auth-error">{error}</div>}

					<form className="minimal-auth-form" onSubmit={handleSubmit}>
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

						<button
							type="submit"
							className="minimal-auth-submit"
							disabled={loading}
						>
							{loading ? "Authenticating..." : "Create account"}
							{!loading && (
								<ArrowRightIcon className="w-3.5 h-3.5 inline-block" />
							)}
						</button>
					</form>

					<div className="minimal-auth-switch">
						Already have an account?{" "}
						<Link to="/sign-in">
							Sign in <ArrowRightIcon className="w-3.5 h-3.5 inline-block" />
						</Link>
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
