import { createFileRoute, redirect } from "@tanstack/react-router";
import { KeyRound, Terminal, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthBentoMatrix } from "#/components/auth/auth-bento-matrix";
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
			{/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION / STATUS BAR
      ───────────────────────────────────────────────────────────── */}
			<header className="w-full bg-surface-elevated text-text-primary border-b border-border-default px-4 md:px-8 py-2.5 flex items-center justify-between z-30">
				<div className="flex items-center space-x-6">
					<Logo />

					<div className="hidden lg:flex items-center space-x-1 pl-4 border-l border-border-default text-xs font-mono font-medium tracking-wide text-text-muted">
						<span className="w-2 h-2 bg-text-primary inline-block animate-pulse-subtle" />
						<span className="text-text-primary font-bold">AUTH_CONSOLE</span>
					</div>
				</div>

				<nav className="flex items-center space-x-3 text-xs font-mono font-bold tracking-wider">
					{/* GitHub Action Link */}
					<a
						href="https://github.com/samSRaina/kizen"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center space-x-1.5 px-2.5 py-1 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors uppercase border border-transparent hover:border-border-default"
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
						<span className="hidden sm:inline">GITHUB</span>
					</a>

					{/* Theme Toggle */}
					<ThemeToggleButton
						variant="rectangle"
						blur={true}
						start="right-left"
					/>
				</nav>
			</header>

			{/* ─────────────────────────────────────────────────────────────
          2. MAIN AUTHENTICATION MATRIX (STRICT SPLIT GRID)
      ───────────────────────────────────────────────────────────── */}
			<main className="flex-1 w-full max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col justify-center">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-border-default bg-surface-base">
					{/* ─────────────────────────────────────────────────────────────
              LEFT AREA: REUSABLE AUTH CONSOLE (COLS 1-6)
          ───────────────────────────────────────────────────────────── */}
					<div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-border-default flex flex-col justify-between">
						<div>
							{/* Monospace System Header */}
							<div className="flex items-center justify-between border-b border-border-default pb-3 mb-6 font-mono text-[11px] text-text-muted">
								<span className="flex items-center space-x-2">
									<Terminal className="w-3.5 h-3.5 text-text-primary" />
									<span className="text-text-primary font-bold uppercase">
										{authMode === "sign-in"
											? "PROMPT://SIGNIN"
											: "PROMPT://SIGNUP"}
									</span>
								</span>
								<span className="text-text-muted">
									{authMode === "sign-in"
										? "SESSION_GATEWAY"
										: "OPERATOR_REGISTRATION"}
								</span>
							</div>

							{/* Mode Toggle Tabs (Sign In vs Sign Up) */}
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

							{/* Reusable Form Switcher */}
							{authMode === "sign-in" ? <SignInForm /> : <SignUpForm />}
						</div>
					</div>

					{/* ─────────────────────────────────────────────────────────────
              RIGHT AREA: INTERACTIVE 4-CARD BENTO MATRIX
          ───────────────────────────────────────────────────────────── */}
					<AuthBentoMatrix />
				</div>
			</main>
		</div>
	);
}

export default AuthenticateComponent;
