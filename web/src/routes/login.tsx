import { createFileRoute } from "@tanstack/react-router";
import { signInWithGithub } from "../lib/auth-client";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	component: Login,
});

function Login() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGithubLogin = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await signInWithGithub();
			if (res.error) {
				setError(res.error.message || "Failed to login with GitHub");
			}
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
					<p className="text-gray-600">Sign in to your account to continue</p>
				</div>

				{error && (
					<div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm mb-6 border border-red-100">
						{error}
					</div>
				)}

				<div className="space-y-4">
					<button
						onClick={handleGithubLogin}
						disabled={loading}
						className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
					>
						{loading ? (
							<span className="animate-pulse">Connecting...</span>
						) : (
							<>
								<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
									<path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.814 1.102.814 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
								</svg>
								Continue with GitHub
							</>
						)}
					</button>
				</div>

				<p className="mt-8 text-center text-sm text-gray-500">
					By signing in, you agree to our Terms of Service and Privacy Policy.
				</p>
			</div>
		</div>
	);
}
