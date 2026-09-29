import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signInWithGithub, useSession } from "../lib/auth-client";

function GithubIcon() {
	return (
		<svg
			className="github-mark"
			width="17"
			height="17"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path d="M12 .7a11.3 11.3 0 0 0-3.58 22.02c.57.1.78-.25.78-.55v-2.16c-3.18.7-3.85-1.34-3.85-1.34-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.72-1.54-2.54-.29-5.2-1.27-5.2-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.12 1.17a10.9 10.9 0 0 1 5.68 0c2.16-1.48 3.12-1.17 3.12-1.17.62 1.57.23 2.73.11 3.02.73.8 1.18 1.82 1.18 3.07 0 4.4-2.67 5.36-5.21 5.65.41.36.77 1.07.77 2.16v3.2c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z" />
		</svg>
	);
}

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
	const [submitted, setSubmitted] = useState(false);
	const { data: session } = useSession();

	const isSignup = mode === "signup";

	useEffect(() => {
		setMode(initialMode);
		setSubmitted(false);
		setError(null);
	}, [initialMode]);

	useEffect(() => {
		if (session) {
			navigate({ to: "/dashboard" });
		}
	}, [session, navigate]);

	const switchMode = (next: "signin" | "signup") => {
		setMode(next);
		setSubmitted(false);
		setError(null);
		navigate({ to: next === "signup" ? "/signup" : "/login" });
	};

	const handleGithubLogin = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await signInWithGithub();
			if (res?.error) {
				setError(res.error.message || "Failed to authenticate with GitHub");
				setLoading(false);
			} else if (res?.data?.url) {
				setSubmitted(true);
				window.location.href = res.data.url;
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
					Back to dashboard{" "}
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

					{submitted ? (
						<div className="minimal-auth-success">
							<strong>You're all set.</strong>
							<span>GitHub authentication is connecting...</span>
							<Link to="/dashboard">
								Continue to dashboard{" "}
								<ArrowRightIcon className="w-3.5 h-3.5 inline-block" />
							</Link>
						</div>
					) : (
						<button
							type="button"
							className="github-auth-button"
							onClick={handleGithubLogin}
							disabled={loading}
						>
							<GithubIcon />
							{loading
								? "Connecting..."
								: isSignup
									? "Sign up with GitHub"
									: "Sign in with GitHub"}
						</button>
					)}

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
