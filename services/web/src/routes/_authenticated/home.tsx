import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	CheckCircle2,
	Code2,
	Cpu,
	Layers,
	LogOut,
	ShieldCheck,
	Terminal,
	User,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated/home")({
	component: AuthenticatedHomeComponent,
});

export function AuthenticatedHomeComponent() {
	const navigate = useNavigate();
	const { session: initialSession } = Route.useRouteContext();
	const { data: liveSession } = authClient.useSession();

	const user = liveSession?.user ?? initialSession?.user;

	const handleSignOut = async () => {
		await authClient.signOut();
		await navigate({ to: "/authenticate" });
	};

	return (
		<div className="min-h-screen w-full bg-canvas text-text-primary font-sans selection:bg-accent-primary selection:text-accent-primary-fg flex flex-col justify-between">
			{/* Top Bar */}
			<header className="w-full bg-surface-elevated text-text-primary border-b border-border-default px-4 md:px-8 py-2.5 flex items-center justify-between z-30">
				<div className="flex items-center space-x-6">
					<Logo />

					<div className="hidden lg:flex items-center space-x-1 pl-4 border-l border-border-default text-xs font-mono font-medium tracking-wide text-text-muted">
						<span className="w-2 h-2 bg-emerald-500 inline-block animate-pulse-subtle" />
						<span className="text-text-primary font-bold">NODE_ONLINE</span>
					</div>
				</div>

				<div className="flex items-center space-x-4">
					<div className="hidden sm:flex items-center space-x-2 font-mono text-xs text-text-secondary border-r border-border-default pr-4">
						<User className="w-3.5 h-3.5 text-text-muted" />
						<span>{user?.name || user?.email || "OPERATOR"}</span>
					</div>

					<ThemeToggleButton
						variant="rectangle"
						blur={true}
						start="right-left"
					/>

					<button
						type="button"
						onClick={handleSignOut}
						className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-surface-base hover:bg-surface-hover border border-border-default hover:border-border-strong text-text-primary transition-colors cursor-pointer"
					>
						<LogOut className="w-3.5 h-3.5" />
						<span className="hidden sm:inline">SIGN OUT</span>
					</button>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
				<div className="border border-border-default bg-surface-base">
					{/* Status Bar */}
					<div className="border-b border-border-default px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-elevated/40">
						<div className="flex items-center space-x-3">
							<Terminal className="w-4 h-4 text-text-primary" />
							<span className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary">
								SYSTEM://WORKSPACE_STATUS
							</span>
						</div>
						<div className="flex items-center space-x-4 font-mono text-xs text-text-muted">
							<span className="flex items-center space-x-1.5">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
								<span>SESSION_VALIDATED</span>
							</span>
							<span>CLUSTER: AP-SOUTH-1</span>
						</div>
					</div>

					{/* Workspace Welcome Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
						{/* Operator Identity Panel */}
						<div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
							<div>
								<div className="font-mono text-[11px] text-text-muted mb-4">
									OPERATOR_TELEMETRY
								</div>

								<h1 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-text-primary">
									Welcome back,{" "}
									<span className="underline decoration-border-strong decoration-2 underline-offset-4">
										{user?.name || user?.email || "Operator"}
									</span>
								</h1>

								<p className="mt-3 text-sm text-text-secondary leading-relaxed font-sans">
									Your identity token is verified. Hardware-accelerated runtime
									and cryptographic RPC endpoints are active.
								</p>

								<div className="mt-8 space-y-3 font-mono text-xs">
									<div className="p-3 bg-surface-sunken border border-border-default flex items-center justify-between">
										<span className="text-text-muted">IDENTIFIER</span>
										<span className="font-bold text-text-primary truncate max-w-[200px]">
											{user?.email || "loading..."}
										</span>
									</div>
									<div className="p-3 bg-surface-sunken border border-border-default flex items-center justify-between">
										<span className="text-text-muted">AUTH_SCHEME</span>
										<span className="font-bold text-text-primary">
											BEARER (SET-AUTH-TOKEN)
										</span>
									</div>
									<div className="p-3 bg-surface-sunken border border-border-default flex items-center justify-between">
										<span className="text-text-muted">CLIENT_CORE</span>
										<span className="font-bold text-text-primary">
											HEY-API FETCH & TANSTACK QUERY
										</span>
									</div>
								</div>
							</div>

							<div className="mt-8 pt-4 border-t border-border-subtle flex items-center justify-between font-mono text-xs text-text-muted">
								<span>STATUS: READY</span>
								<span className="text-emerald-500 font-bold flex items-center space-x-1">
									<CheckCircle2 className="w-3.5 h-3.5" />
									<span>SYNCHRONIZED</span>
								</span>
							</div>
						</div>

						{/* Quick Action Bento Grid */}
						<div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border-default">
							<div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-surface-hover/50 transition-colors">
								<div>
									<div className="w-8 h-8 bg-surface-elevated border border-border-default flex items-center justify-center text-text-primary mb-4">
										<ShieldCheck className="w-4 h-4" />
									</div>
									<h2 className="font-bold text-base text-text-primary font-sans uppercase">
										Better-Auth Security
									</h2>
									<p className="mt-1 text-xs text-text-secondary leading-relaxed font-sans">
										Dual authentication mechanism supporting both email and
										handle, protected by encrypted bearer headers.
									</p>
								</div>
								<div className="mt-6 pt-3 border-t border-border-subtle font-mono text-xs text-text-muted">
									MODULE: AUTH_CORE_V1
								</div>
							</div>

							<div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-surface-hover/50 transition-colors">
								<div>
									<div className="w-8 h-8 bg-surface-elevated border border-border-default flex items-center justify-center text-text-primary mb-4">
										<Code2 className="w-4 h-4" />
									</div>
									<h2 className="font-bold text-base text-text-primary font-sans uppercase">
										Type-Safe OpenAPI
									</h2>
									<p className="mt-1 text-xs text-text-secondary leading-relaxed font-sans">
										Zero-boilerplate RPC client with TanStack Query hooks
										generated directly from OpenAPI spec.
									</p>
								</div>
								<div className="mt-6 pt-3 border-t border-border-subtle font-mono text-xs text-text-muted">
									MODULE: TANSTACK_QUERY_RPC
								</div>
							</div>

							<div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-surface-hover/50 transition-colors border-t border-border-default">
								<div>
									<div className="w-8 h-8 bg-surface-elevated border border-border-default flex items-center justify-center text-text-primary mb-4">
										<Cpu className="w-4 h-4" />
									</div>
									<h2 className="font-bold text-base text-text-primary font-sans uppercase">
										Smooth Inputs
									</h2>
									<p className="mt-1 text-xs text-text-secondary leading-relaxed font-sans">
										Physics-based spring caret with precise canvas text
										measurement and dynamic glyph metrics.
									</p>
								</div>
								<div className="mt-6 pt-3 border-t border-border-subtle font-mono text-xs text-text-muted">
									MODULE: FRAMER_SPRING
								</div>
							</div>

							<div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-surface-hover/50 transition-colors border-t border-border-default">
								<div>
									<div className="w-8 h-8 bg-surface-elevated border border-border-default flex items-center justify-center text-text-primary mb-4">
										<Layers className="w-4 h-4" />
									</div>
									<h2 className="font-bold text-base text-text-primary font-sans uppercase">
										Monochrome Theme
									</h2>
									<p className="mt-1 text-xs text-text-secondary leading-relaxed font-sans">
										High-contrast architectural design system with preserved
										yellow tokens for quick accent toggling.
									</p>
								</div>
								<div className="mt-6 pt-3 border-t border-border-subtle font-mono text-xs text-text-muted">
									MODULE: THEME_PALETTE
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="w-full border-t border-border-default bg-surface-elevated/40 px-4 md:px-8 py-3 text-center sm:text-left text-xs font-mono text-text-muted flex flex-col sm:flex-row items-center justify-between">
				<span>{"KIZEN SYSTEM NODE // SECURE SESSION ACTIVE"}</span>
				<span className="mt-1 sm:mt-0">VERSION: 1.0.0-PROD</span>
			</footer>
		</div>
	);
}

export default AuthenticatedHomeComponent;
