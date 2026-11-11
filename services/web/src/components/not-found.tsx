import { Link } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { ThemeToggleButton } from "#/components/ui/theme-toggle";

export function NotFoundComponent() {
	return (
		<div className="min-h-screen w-full bg-canvas text-text-primary font-sans selection:bg-accent-primary selection:text-accent-primary-fg flex flex-col justify-between">
			{/* Top Bar */}
			<header className="w-full bg-surface-base/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
				<Link
					to="/workspaces"
					className="flex items-center justify-center p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated/70 rounded-xs transition-colors cursor-pointer"
					title="Home"
				>
					<Home className="w-4 h-4" />
				</Link>

				<ThemeToggleButton variant="rectangle" blur={true} start="right-left" />
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full max-w-xl mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
				<div className="w-full bg-surface-base/80 p-8 sm:p-12 shadow-sm space-y-8 rounded-xs ring-1 ring-border-default/20">
					<div className="space-y-3">
						<div className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-surface-elevated/70 text-text-muted uppercase tracking-wider rounded-xs">
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
							className="inline-flex items-center justify-center space-x-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover enabled:active:scale-[0.96] transition-all cursor-pointer rounded-xs"
						>
							<Home className="w-4 h-4" />
							<span>Workspaces Dashboard</span>
						</Link>

						<button
							type="button"
							onClick={() => window.history.back()}
							className="inline-flex items-center justify-center space-x-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider bg-surface-elevated/60 hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-xs"
						>
							<ArrowLeft className="w-4 h-4" />
							<span>Go Back</span>
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}

export default NotFoundComponent;
