import { Link } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { Logo } from "#/components/ui/logo";
import { ThemeToggleButton } from "#/components/ui/theme-toggle";

export function NotFoundComponent() {
	return (
		<div className="min-h-screen w-full bg-canvas text-text-primary font-sans selection:bg-accent-primary selection:text-accent-primary-fg flex flex-col justify-between">
			{/* Top Bar */}
			<header className="w-full bg-surface-base border-b border-border-default px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
				<Link to="/workspaces">
					<Logo size="md" />
				</Link>

				<ThemeToggleButton variant="rectangle" blur={true} start="right-left" />
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full max-w-xl mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
				<div className="w-full border border-border-default bg-surface-base p-8 sm:p-12 shadow-sm space-y-8">
					<div className="space-y-3">
						<div className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-surface-sunken border border-border-default text-text-muted uppercase tracking-wider">
							404 / NOT FOUND
						</div>

						<h1 className="text-4xl sm:text-5xl font-black font-sans uppercase tracking-tight text-text-primary">
							Page Not Found
						</h1>

						<p className="text-sm text-text-secondary leading-relaxed font-sans max-w-md">
							The page you are looking for does not exist or may have been
							moved. Check the URL or return to your workspaces.
						</p>
					</div>

					{/* Action Links */}
					<div className="pt-2 flex flex-col sm:flex-row gap-3">
						<Link
							to="/workspaces"
							className="inline-flex items-center justify-center space-x-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover enabled:active:scale-[0.96] transition-all cursor-pointer"
						>
							<Home className="w-4 h-4" />
							<span>Return to Workspaces</span>
						</Link>

						<Link
							to="/authenticate"
							className="inline-flex items-center justify-center space-x-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider bg-surface-elevated hover:bg-surface-hover border border-border-default text-text-primary enabled:active:scale-[0.96] transition-all cursor-pointer"
						>
							<ArrowLeft className="w-4 h-4" />
							<span>Sign In</span>
						</Link>
					</div>
				</div>
			</main>

			{/* Minimalist Brutalist Footer */}
			<footer className="w-full border-t border-border-default bg-surface-base px-4 sm:px-8 py-3.5 text-xs font-mono text-text-muted flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<span className="font-bold text-text-primary">KIZEN</span>
					<span className="text-border-strong">/</span>
					<span>SYSTEMS</span>
				</div>
				<span>404 NOT FOUND</span>
			</footer>
		</div>
	);
}

export default NotFoundComponent;
