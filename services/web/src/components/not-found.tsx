import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Home, Terminal } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";

export function NotFoundComponent() {
	return (
		<div className="min-h-screen w-full bg-canvas text-text-primary font-sans selection:bg-accent-primary selection:text-accent-primary-fg flex flex-col justify-between">
			{/* Top Bar */}
			<header className="w-full bg-surface-elevated text-text-primary border-b border-border-default px-4 md:px-8 py-2.5 flex items-center justify-between z-30">
				<div className="flex items-center space-x-6">
					<Logo />
					<div className="hidden lg:flex items-center space-x-1 pl-4 border-l border-border-default text-xs font-mono font-medium tracking-wide text-text-muted">
						<span className="w-2 h-2 bg-amber-500 inline-block animate-pulse-subtle" />
						<span className="text-text-primary font-bold">
							ROUTE_UNRESOLVED
						</span>
					</div>
				</div>

				<div className="flex items-center space-x-4">
					<ThemeToggleButton
						variant="rectangle"
						blur={true}
						start="right-left"
					/>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full max-w-240 mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex items-center justify-center">
				<div className="w-full border border-border-default bg-surface-base shadow-sm">
					{/* Status Bar */}
					<div className="border-b border-border-default px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-elevated/40">
						<div className="flex items-center space-x-3">
							<Terminal className="w-4 h-4 text-text-primary" />
							<span className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary">
								{"HTTP://404_PAGE_NOT_FOUND"}
							</span>
						</div>
						<div className="flex items-center space-x-2 font-mono text-xs text-amber-500">
							<AlertTriangle className="w-3.5 h-3.5" />
							<span>TARGET_NODE_MISSING</span>
						</div>
					</div>

					{/* 404 Body */}
					<div className="p-8 sm:p-12 space-y-8">
						<div className="space-y-3">
							<div className="font-mono text-xs text-text-muted tracking-widest uppercase">
								{"SYSTEM_ERROR_CODE // 0x404"}
							</div>
							<h1 className="text-4xl sm:text-5xl font-black font-sans uppercase tracking-tight text-text-primary">
								Page Not Found
							</h1>
							<p className="text-sm sm:text-base text-text-secondary leading-relaxed font-sans max-w-lg">
								The requested resource, route endpoint, or system matrix does
								not exist or may have migrated to an alternate sector.
							</p>
						</div>

						{/* Telemetry Block */}
						<div className="p-4 bg-surface-sunken border border-border-default font-mono text-xs space-y-2">
							<div className="flex justify-between items-center text-text-muted">
								<span>DISPATCH_STATUS</span>
								<span className="text-amber-500 font-bold">
									NON_EXISTENT_ROUTE
								</span>
							</div>
							<div className="flex justify-between items-center text-text-muted">
								<span>CLIENT_ACTION</span>
								<span className="text-text-primary">
									REDIRECT_TO_KNOWN_SURFACE
								</span>
							</div>
						</div>

						{/* Actions */}
						<div className="pt-2 flex flex-col sm:flex-row gap-3">
							<Link
								to="/home"
								className="inline-flex items-center justify-center space-x-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover transition-colors cursor-pointer"
							>
								<Home className="w-4 h-4" />
								<span>RETURN TO WORKSPACE</span>
							</Link>

							<Link
								to="/authenticate"
								className="inline-flex items-center justify-center space-x-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider bg-surface-base hover:bg-surface-hover border border-border-default hover:border-border-strong text-text-primary transition-colors cursor-pointer"
							>
								<ArrowLeft className="w-4 h-4" />
								<span>AUTHENTICATION PORTAL</span>
							</Link>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="w-full border-t border-border-default bg-surface-elevated/40 px-4 md:px-8 py-3 text-center sm:text-left text-xs font-mono text-text-muted flex flex-col sm:flex-row items-center justify-between">
				<span>{"KIZEN SYSTEM NODE // RECOVERY DISPATCH"}</span>
				<span className="mt-1 sm:mt-0">HTTP_STATUS: 404</span>
			</footer>
		</div>
	);
}

export default NotFoundComponent;
