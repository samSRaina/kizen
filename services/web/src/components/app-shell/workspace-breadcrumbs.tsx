import { useQuery } from "@tanstack/react-query";
import { Link, useMatches } from "@tanstack/react-router";
import { ChevronRight, FolderKanban } from "lucide-react";
import { workspaceQueries } from "@/lib/queries/workspaces";

export function WorkspaceBreadcrumbs() {
	const matches = useMatches();

	const workspaceMatch = matches.find(
		(m) =>
			m.routeId.includes("/workspaces/$workspaceId") ||
			m.pathname.startsWith("/workspaces/"),
	);
	const currentWorkspaceId = (
		workspaceMatch?.params as { workspaceId?: string }
	)?.workspaceId;

	const { data: workspace } = useQuery({
		...workspaceQueries.detail(currentWorkspaceId || ""),
		enabled: Boolean(currentWorkspaceId),
	});

	const lastMatch = matches[matches.length - 1];
	let currentViewLabel = "";
	if (
		lastMatch?.pathname.includes("/interactions/board") ||
		lastMatch?.pathname.endsWith(currentWorkspaceId || "___")
	) {
		currentViewLabel = "Board";
	} else if (lastMatch?.pathname.includes("/interactions/list")) {
		currentViewLabel = "List";
	} else if (lastMatch?.pathname.includes("/time")) {
		currentViewLabel = "Track Time";
	} else if (lastMatch?.pathname.includes("/settings")) {
		currentViewLabel = "Settings";
	}

	if (!currentWorkspaceId) {
		return (
			<div className="flex items-center gap-2 text-sm">
				<FolderKanban className="size-4 text-text-muted" />
				<span className="font-semibold text-text-primary">Workspaces</span>
			</div>
		);
	}

	return (
		<nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs">
			<Link
				to="/workspaces"
				className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
			>
				<FolderKanban className="size-3.5" />
				<span>Workspaces</span>
			</Link>
			<ChevronRight className="size-3 text-border-strong" />
			<Link
				to="/workspaces/$workspaceId/interactions/board"
				params={{ workspaceId: currentWorkspaceId }}
				className="font-medium text-text-primary hover:underline truncate max-w-[160px]"
			>
				{workspace?.name || "Workspace"}
			</Link>
			{currentViewLabel && (
				<>
					<ChevronRight className="size-3 text-border-strong" />
					<span className="text-text-muted capitalize">{currentViewLabel}</span>
				</>
			)}
		</nav>
	);
}

export default WorkspaceBreadcrumbs;
