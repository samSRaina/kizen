import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Loader } from "@/components/layout/loader";
import { workspaceQueries } from "@/lib/queries/workspaces";

export const Route = createFileRoute("/_authenticated/workspaces/$workspaceId")(
	{
		loader: async ({ context: { queryClient }, params: { workspaceId } }) => {
			await queryClient
				.ensureQueryData(workspaceQueries.detail(workspaceId))
				.catch(() => {
					throw redirect({ to: "/workspaces" });
				});
		},
		component: WorkspaceLayout,
	},
);

function WorkspaceLayout() {
	const { workspaceId } = Route.useParams();
	const {
		data: workspace,
		isError,
		isLoading,
	} = useQuery(workspaceQueries.detail(workspaceId));

	if (isLoading) {
		return <Loader size="lg" />;
	}

	if (isError || !workspace) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-text-muted">
				<AlertCircle className="size-8 opacity-40 text-red-500" />
				<p className="text-sm">Workspace not found or access denied</p>
			</div>
		);
	}

	return <Outlet />;
}

export default WorkspaceLayout;
