import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { Loader } from "#/components/layout/loader";
import { WorkspaceCreateForm } from "#/components/workspaces/workspace-create-form";
import { WorkspaceList } from "#/components/workspaces/workspace-list";
import { authQueries } from "#/lib/queries/auth";
import { workspaceQueries } from "#/lib/queries/workspaces";

export const Route = createFileRoute("/_authenticated/workspaces/")({
	component: WorkspacesListPage,
});

function WorkspacesListPage() {
	const { data: session } = useQuery(authQueries.session());
	const userId = session?.user?.id;

	const {
		data: workspaces,
		isPending,
		isError,
		error,
	} = useQuery(workspaceQueries.list(userId));

	const [isCreating, setIsCreating] = useState(false);

	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-border-default">
				<div>
					<h1 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-text-primary">
						Workspaces
					</h1>
					<p className="mt-1 text-sm text-text-secondary font-sans max-w-xl">
						Manage your client workspaces, configure hourly billing rates, and
						track project assignments.
					</p>
				</div>

				<div>
					<button
						type="button"
						onClick={() => setIsCreating(true)}
						className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover enabled:active:scale-[0.96] transition-all cursor-pointer shadow-sm"
					>
						<Plus className="w-4 h-4" />
						<span>Create Workspace</span>
					</button>
				</div>
			</div>

			{/* Modal Dialog */}
			{isCreating ? (
				<WorkspaceCreateForm onDone={() => setIsCreating(false)} />
			) : null}

			{/* Main Workspace Grid Content */}
			{isPending ? (
				<Loader size="lg" />
			) : isError ? (
				<div className="p-8 border border-border-default bg-surface-base text-center space-y-4">
					<AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
					<div className="space-y-1">
						<h2 className="font-bold text-base text-text-primary uppercase font-sans">
							Error Loading Workspaces
						</h2>
						<p className="text-sm text-text-secondary max-w-md mx-auto">
							{String(error)}
						</p>
					</div>
				</div>
			) : (
				<WorkspaceList
					workspaces={workspaces ?? []}
					onCreateClick={() => setIsCreating(true)}
				/>
			)}
		</div>
	);
}

export default WorkspacesListPage;
