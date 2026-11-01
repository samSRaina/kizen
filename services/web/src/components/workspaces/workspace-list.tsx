import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Trash2 } from "lucide-react";
import { workspaceKeys, workspaceMutations } from "#/lib/queries/workspaces";
import type { Workspace } from "#/lib/types";

export interface WorkspaceListProps {
	workspaces: Workspace[];
	onCreateClick?: () => void;
}

export function WorkspaceList({
	workspaces,
	onCreateClick,
}: WorkspaceListProps) {
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: (id: string) => workspaceMutations.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
		},
	});

	if (workspaces.length === 0) {
		return (
			<div className="py-16 px-6 border border-dashed border-border-default bg-surface-base/50 text-center space-y-4">
				<div className="w-12 h-12 bg-surface-elevated border border-border-default flex items-center justify-center mx-auto text-text-muted">
					<Briefcase className="w-6 h-6" />
				</div>
				<div className="space-y-1">
					<h2 className="font-bold text-base text-text-primary uppercase font-sans">
						No Workspaces Yet
					</h2>
					<p className="text-sm text-text-secondary max-w-md mx-auto">
						Create your first workspace to start organizing client tasks and
						tracking project billables.
					</p>
				</div>
				{onCreateClick ? (
					<div className="pt-2">
						<button
							type="button"
							onClick={onCreateClick}
							className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover enabled:active:scale-[0.96] transition-all cursor-pointer"
						>
							<span>+ Create First Workspace</span>
						</button>
					</div>
				) : null}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
			{workspaces.map((ws) => (
				<div
					key={ws.id}
					className="border border-border-default hover:border-border-strong p-6 bg-surface-base flex flex-col justify-between transition-colors group"
				>
					<div>
						<div className="flex items-start justify-between gap-2 mb-3">
							<h3 className="font-bold text-lg uppercase text-text-primary font-sans tracking-tight">
								{ws.name}
							</h3>
							<span className="inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold bg-surface-sunken border border-border-default text-text-primary shrink-0">
								Rate: {ws.default_hourly_rate}/hr
							</span>
						</div>

						{ws.description ? (
							<p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
								{ws.description}
							</p>
						) : (
							<p className="text-xs text-text-muted italic">
								No description provided
							</p>
						)}
					</div>

					<div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between gap-2">
						<Link
							to="/workspaces/$workspaceId"
							params={{ workspaceId: ws.id }}
							className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-surface-elevated hover:bg-surface-hover border border-border-default text-text-primary enabled:active:scale-[0.96] transition-all cursor-pointer"
						>
							<span>Open</span>
							<ArrowRight className="w-3.5 h-3.5" />
						</Link>

						<button
							type="button"
							onClick={() => {
								if (
									window.confirm(
										`Delete workspace "${ws.name}"? This action cannot be undone.`,
									)
								) {
									deleteMutation.mutate(ws.id);
								}
							}}
							disabled={deleteMutation.isPending}
							className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 enabled:active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50"
							title="Delete Workspace"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				</div>
			))}
		</div>
	);
}

export default WorkspaceList;
