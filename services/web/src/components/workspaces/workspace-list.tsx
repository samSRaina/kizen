import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useConfirm } from "#/components/ui/confirm-dialog";
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
	const confirm = useConfirm();

	const deleteMutation = useMutation({
		mutationFn: (id: string) => workspaceMutations.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
		},
	});

	const handleDelete = async (ws: Workspace) => {
		const ok = await confirm({
			title: "DELETE WORKSPACE",
			message: `Delete workspace "${ws.name}"? All associated tickets and time logs will be deleted. This action cannot be undone.`,
			confirmText: "DELETE WORKSPACE",
			destructive: true,
		});
		if (ok) {
			deleteMutation.mutate(ws.id);
		}
	};

	if (workspaces.length === 0) {
		return (
			<div className="empty-state">
				<p>No workspaces available yet.</p>
				{onCreateClick && (
					<button
						type="button"
						onClick={onCreateClick}
						className="ghost-btn font-semibold mt-2"
					>
						+ Create Workspace
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="flex-col-gap-xs">
			{workspaces.map((ws) => (
				<div
					key={ws.id}
					className="ghost-card ghost-card-hover flex-row-between"
				>
					<Link
						to="/workspaces/$workspaceId"
						params={{ workspaceId: ws.id }}
						className="flex-col-gap-xs flex-1-min text-inherit no-underline"
					>
						<div className="flex-row-center">
							<span className="text-title-sm">{ws.name}</span>
							<span className="badge-tag">{ws.default_hourly_rate}/hr</span>
						</div>
						{ws.description && (
							<div className="text-muted-sm truncate-text">
								{ws.description}
							</div>
						)}
					</Link>

					<div className="flex-row-center">
						<Link
							to="/workspaces/$workspaceId"
							params={{ workspaceId: ws.id }}
							className="ghost-btn-sm"
						>
							Open →
						</Link>
						<button
							type="button"
							onClick={() => handleDelete(ws)}
							disabled={deleteMutation.isPending}
							className="ghost-btn-sm ghost-btn-danger"
							title="Delete workspace"
						>
							✕
						</button>
					</div>
				</div>
			))}
		</div>
	);
}

export default WorkspaceList;
