import { useHotkey } from "@tanstack/react-hotkeys";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
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
		data: workspaces = [],
		isLoading,
		isFetching,
		isError,
		error,
		refetch,
	} = useQuery(workspaceQueries.list(userId));

	const [isCreating, setIsCreating] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebouncedValue(search, { wait: 200 });

	const searchInputRef = useRef<HTMLInputElement>(null);

	// Shortcuts: '/' focuses search input, 'c' / 'C' opens create modal
	useHotkey("/", (e) => {
		e.preventDefault();
		searchInputRef.current?.focus();
	});

	useHotkey("C", (e) => {
		e.preventDefault();
		setIsCreating(true);
	});

	const filteredWorkspaces = workspaces.filter(
		(w) =>
			w.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
			w.description?.toLowerCase().includes(debouncedSearch.toLowerCase()),
	);

	return (
		<div className="flex-1 h-full min-h-0 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full flex flex-col gap-5">
			{/* Top action row */}
			<div className="flex-row-between flex-wrap-gap">
				<div className="flex-row-center flex-1-min">
					<input
						ref={searchInputRef}
						type="text"
						placeholder="Filter workspaces... (/)"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="ghost-input"
					/>
					{search && (
						<button
							type="button"
							onClick={() => setSearch("")}
							className="ghost-btn-sm"
						>
							Clear
						</button>
					)}
				</div>

				<div className="flex-row-center">
					{isFetching && !isLoading && (
						<span className="text-muted-xs">Syncing...</span>
					)}
					<button
						type="button"
						onClick={() => refetch()}
						disabled={isFetching}
						className="ghost-btn-sm"
					>
						↻ Refresh
					</button>
					<button
						type="button"
						onClick={() => setIsCreating(true)}
						className="ghost-btn-sm font-semibold"
					>
						+ Create Workspace
					</button>
				</div>
			</div>

			{/* Modal Dialog for workspace creation */}
			{isCreating && (
				<WorkspaceCreateForm onDone={() => setIsCreating(false)} />
			)}

			{/* Main Workspace List */}
			{isLoading ? (
				<div className="empty-state">Loading workspaces...</div>
			) : isError ? (
				<div className="error-banner">
					<div className="text-title-sm">Failed to load workspaces</div>
					<div className="text-muted-sm">
						{error instanceof Error ? error.message : String(error)}
					</div>
					<button
						type="button"
						onClick={() => refetch()}
						className="ghost-btn-sm ghost-btn-danger"
					>
						Retry
					</button>
				</div>
			) : (
				<WorkspaceList
					workspaces={filteredWorkspaces}
					onCreateClick={() => setIsCreating(true)}
				/>
			)}
		</div>
	);
}

export default WorkspacesListPage;
