import { createFileRoute } from "@tanstack/react-router";
import { InteractionLayout } from "@/components/workspaces/interactions/interaction-layout";

export const Route = createFileRoute(
	"/_authenticated/workspaces/$workspaceId/interactions/timeline",
)({
	component: WorkspaceTimelinePage,
});

function WorkspaceTimelinePage() {
	const { workspaceId } = Route.useParams();

	return (
		<InteractionLayout
			workspaceId={workspaceId}
			interactionKey={`timeline:${workspaceId}`}
			title="Timeline Board"
			description="Interactive timeline and ticket workflow"
			context="timeline"
		/>
	);
}

export default WorkspaceTimelinePage;
