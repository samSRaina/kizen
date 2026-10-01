import { Brand } from "@/components/ui/brand";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-in")({
	component: SignInRoute,
});

function SignInRoute() {
	const navigate = useNavigate();
	const { data: session } = useSession();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [identifier, setIdentifier] = useState("");
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

			let res: { error?: { message?: string } | null } | undefined;

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
					<h1>Welcome back</h1>
					<p className="minimal-auth-subtitle">
						Sign in to continue to your workspace.
					</p>

					{error && <div className="minimal-auth-error">{error}</div>}

					<form className="minimal-auth-form" onSubmit={handleSubmit}>
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

						<button
							type="submit"
							className="minimal-auth-submit"
							disabled={loading}
						>
							{loading ? "Authenticating..." : "Sign in"}
							{!loading && (
								<ArrowRightIcon className="w-3.5 h-3.5 inline-block" />
							)}
						</button>
					</form>

					<div className="minimal-auth-switch">
						Don't have an account?{" "}
						<Link to="/sign-up">
							Sign up <ArrowRightIcon className="w-3.5 h-3.5 inline-block" />
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
