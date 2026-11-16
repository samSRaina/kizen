import { createFileRoute } from "@tanstack/react-router";
import { InteractionLayout } from "@/components/workspaces/interactions/interaction-layout";

export const Route = createFileRoute(
	"/_authenticated/workspaces/$workspaceId/interactions/list",
)({
	component: WorkspaceListPage,
});

function WorkspaceListPage() {
	const { workspaceId } = Route.useParams();

	return (
		<InteractionLayout
			workspaceId={workspaceId}
			interactionKey={`list:${workspaceId}`}
			title="Ticket List"
			description="Structured list of workspace tickets"
			context="list"
		/>
	);
}

export default WorkspaceListPage;
