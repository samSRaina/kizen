import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authenticated/workspaces/$workspaceId/",
)({
	beforeLoad: ({ params }) => {
		throw redirect({
			to: "/workspaces/$workspaceId/interactions/board",
			params: { workspaceId: params.workspaceId },
		});
	},
});
