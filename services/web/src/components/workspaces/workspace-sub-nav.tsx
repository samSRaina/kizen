import { Link } from "@tanstack/react-router";
import { Clock, KanbanSquare, ListTodo, Settings } from "lucide-react";
import type React from "react";

interface WorkspaceSubNavProps {
	workspaceId: string;
	activeTab: "board" | "list" | "time" | "settings";
	children?: React.ReactNode;
}

export function WorkspaceSubNav({
	workspaceId,
	activeTab,
	children,
}: WorkspaceSubNavProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border-default shrink-0 select-none font-mono">
			{/* Left View Tabs */}
			<div className="flex items-center gap-1.5 flex-wrap">
				<Link
					to="/workspaces/$workspaceId/interactions/board"
					params={{ workspaceId }}
					className={`h-8 px-3 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border transition-colors cursor-pointer ${
						activeTab === "board"
							? "bg-accent-primary text-accent-primary-fg border-accent-primary"
							: "border-border-default bg-surface-base text-text-muted hover:text-text-primary hover:border-text-primary"
					}`}
				>
					<KanbanSquare className="size-3.5" />
					<span>Board</span>
				</Link>

				<Link
					to="/workspaces/$workspaceId/interactions/list"
					params={{ workspaceId }}
					className={`h-8 px-3 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border transition-colors cursor-pointer ${
						activeTab === "list"
							? "bg-accent-primary text-accent-primary-fg border-accent-primary"
							: "border-border-default bg-surface-base text-text-muted hover:text-text-primary hover:border-text-primary"
					}`}
				>
					<ListTodo className="size-3.5" />
					<span>List</span>
				</Link>

				<Link
					to="/workspaces/$workspaceId/time"
					params={{ workspaceId }}
					className={`h-8 px-3 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border transition-colors cursor-pointer ${
						activeTab === "time"
							? "bg-accent-primary text-accent-primary-fg border-accent-primary"
							: "border-border-default bg-surface-base text-text-muted hover:text-text-primary hover:border-text-primary"
					}`}
				>
					<Clock className="size-3.5" />
					<span>Track Time</span>
				</Link>

				<Link
					to="/workspaces/$workspaceId/settings"
					params={{ workspaceId }}
					className={`h-8 px-3 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border transition-colors cursor-pointer ${
						activeTab === "settings"
							? "bg-accent-primary text-accent-primary-fg border-accent-primary"
							: "border-border-default bg-surface-base text-text-muted hover:text-text-primary hover:border-text-primary"
					}`}
				>
					<Settings className="size-3.5" />
					<span>Settings</span>
				</Link>
			</div>

			{/* Optional Right Action Controls (Search, Filters, Action Triggers) */}
			{children && (
				<div className="flex items-center gap-2 flex-wrap">{children}</div>
			)}
		</div>
	);
}

export default WorkspaceSubNav;
