import { createFileRoute } from "@tanstack/react-router";
import { InteractionLayout } from "@/components/workspaces/interactions/interaction-layout";

export const Route = createFileRoute(
	"/_authenticated/workspaces/$workspaceId/interactions/board",
)({
	component: WorkspaceBoardPage,
});

function WorkspaceBoardPage() {
	const { workspaceId } = Route.useParams();

	return (
		<InteractionLayout
			workspaceId={workspaceId}
			interactionKey={`board:${workspaceId}`}
			title="Ticket Board"
			description="Manage workspace workflow and tickets"
			context="board"
		/>
	);
}

export default WorkspaceBoardPage;
