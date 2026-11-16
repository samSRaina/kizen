import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader } from "@/components/layout/loader";
import { WorkspaceSettings } from "@/components/workspaces/workspace-settings";
import { WorkspaceSubNav } from "@/components/workspaces/workspace-sub-nav";
import { workspaceQueries } from "@/lib/queries/workspaces";

export const Route = createFileRoute(
	"/_authenticated/workspaces/$workspaceId/settings",
)({
	component: WorkspaceSettingsPage,
});

function WorkspaceSettingsPage() {
	const { workspaceId } = Route.useParams();
	const navigate = useNavigate();

	const { data: workspace, isLoading } = useQuery(
		workspaceQueries.detail(workspaceId),
	);

	if (isLoading) {
		return <Loader size="lg" />;
	}

	if (!workspace) {
		return (
			<div className="p-8 text-center text-sm font-mono text-text-muted">
				Workspace not found
			</div>
		);
	}

	return (
		<div className="flex-1 h-full min-h-0 flex flex-col overflow-y-auto w-full p-4 sm:p-6 gap-4 bg-canvas text-text-primary">
			<WorkspaceSubNav workspaceId={workspaceId} activeTab="settings" />

			<div className="flex flex-col gap-5 max-w-4xl w-full">
				<div>
					<h2 className="text-base font-mono font-bold uppercase tracking-wider text-text-primary">
						Workspace Settings
					</h2>
					<p className="text-xs font-mono text-text-muted mt-0.5">
						Manage workspace configuration, default hourly rate, and danger
						zone.
					</p>
				</div>

				<WorkspaceSettings
					workspace={workspace}
					onDeleted={() => navigate({ to: "/workspaces" })}
				/>
			</div>
		</div>
	);
}

export default WorkspaceSettingsPage;
