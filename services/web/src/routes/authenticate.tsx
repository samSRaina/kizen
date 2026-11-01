import { createFileRoute, redirect } from "@tanstack/react-router";
import { KeyRound, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { SignInForm } from "#/components/auth/sign-in-form";
import { SignUpForm } from "#/components/auth/sign-up-form";
import { Logo } from "#/components/ui/logo";
import { ThemeToggleButton } from "#/components/ui/theme-toggle";
import { authQueries } from "#/lib/queries/auth";

export interface AuthenticateSearch {
	mode?: "sign-in" | "sign-up";
}

export const Route = createFileRoute("/authenticate")({
	validateSearch: (search: Record<string, unknown>): AuthenticateSearch => {
		return {
			mode: search.mode === "sign-up" ? "sign-up" : "sign-in",
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

	const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">(() => {
		if (search.mode === "sign-up" || search.mode === "sign-in") {
			return search.mode;
		}
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("kizen_auth_mode");
			if (saved === "sign-up" || saved === "sign-in") {
				return saved;
			}
		}
		return "sign-in";
	});

	useEffect(() => {
		if (search.mode && search.mode !== authMode) {
			setAuthMode(search.mode);
		}
	}, [search.mode, authMode]);

	const handleModeChange = (mode: "sign-in" | "sign-up") => {
		setAuthMode(mode);
		if (typeof window !== "undefined") {
			localStorage.setItem("kizen_auth_mode", mode);
		}
		void navigate({
			search: { mode },
			replace: true,
		});
	};

	return (
		<div className="min-h-screen w-full bg-canvas text-text-primary font-sans selection:bg-accent-primary selection:text-accent-primary-fg flex flex-col justify-between overflow-x-hidden">
			{/* Main Content Area */}
			<main className="flex-1 w-full max-w-md mx-auto px-4 py-12 sm:py-20 flex flex-col justify-center">
				{/* Brand Mark (No duplicate text) */}
				<div className="mb-8 flex flex-col items-center text-center">
					<Logo size="lg" />
					<p className="mt-2 text-xs text-text-secondary font-mono uppercase tracking-wider">
						Workspace & Time Tracking Platform
					</p>
				</div>

				{/* Auth Console Box */}
				<div className="border border-border-default bg-surface-base p-6 sm:p-8 shadow-sm">
					{/* Mode Toggle Tabs */}
					<div className="grid grid-cols-2 gap-0 border border-border-default mb-6 bg-surface-sunken">
						<button
							type="button"
							onClick={() => handleModeChange("sign-in")}
							className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer enabled:active:scale-[0.96] ${
								authMode === "sign-in"
									? "bg-accent-primary text-accent-primary-fg"
									: "text-text-muted hover:text-text-primary hover:bg-surface-hover"
							}`}
						>
							<KeyRound className="w-3.5 h-3.5" />
							<span>SIGN IN</span>
						</button>

						<button
							type="button"
							onClick={() => handleModeChange("sign-up")}
							className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-l border-border-default transition-all cursor-pointer enabled:active:scale-[0.96] ${
								authMode === "sign-up"
									? "bg-accent-primary text-accent-primary-fg"
									: "text-text-muted hover:text-text-primary hover:bg-surface-hover"
							}`}
						>
							<UserPlus className="w-3.5 h-3.5" />
							<span>SIGN UP</span>
						</button>
					</div>

					{/* Form Switcher */}
					{authMode === "sign-in" ? <SignInForm /> : <SignUpForm />}
				</div>
			</main>

			{/* White Footer on Auth Page */}
			<footer className="w-full border-t border-neutral-300 bg-white text-neutral-900 px-4 sm:px-8 py-3.5 text-xs font-mono flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<span className="font-bold text-neutral-900">KIZEN</span>
					<span className="text-neutral-400">/</span>
				</div>

				<div className="flex items-center space-x-4">
					<a
						href="https://github.com/samSRaina/kizen"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center space-x-1.5 text-neutral-800 hover:text-black transition-colors uppercase font-bold"
						title="View on GitHub"
					>
						<svg
							viewBox="0 0 24 24"
							fill="currentColor"
							className="w-3.5 h-3.5"
							aria-hidden="true"
						>
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						<span>GITHUB</span>
					</a>

					<ThemeToggleButton
						variant="rectangle"
						blur={true}
						start="right-left"
					/>
				</div>
			</footer>
		</div>
	);
}

export default AuthenticateComponent;
