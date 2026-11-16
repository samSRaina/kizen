import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "@/components/layout/loader";
import { ActiveTimerBar } from "@/components/time-entries/active-timer-bar";
import { TimeEntryTable } from "@/components/time-entries/time-entry-table";
import { WorkspaceSubNav } from "@/components/workspaces/workspace-sub-nav";
import { ticketQueries } from "@/lib/queries/tickets";
import { timeEntryQueries } from "@/lib/queries/time-entries";

export const Route = createFileRoute(
	"/_authenticated/workspaces/$workspaceId/time",
)({
	component: WorkspaceTimePage,
});

function WorkspaceTimePage() {
	const { workspaceId } = Route.useParams();

	const { data: tickets = [], isLoading: isTicketsLoading } = useQuery(
		ticketQueries.list(workspaceId),
	);
	const { data: timeEntries = [], isLoading: isTimeLoading } = useQuery(
		timeEntryQueries.list(workspaceId),
	);

	if (isTicketsLoading || isTimeLoading) {
		return <Loader size="lg" />;
	}

	const activeTimer = timeEntries.find(
		(entry) =>
			entry.timer_state === "running" ||
			entry.timer_state === "paused" ||
			(!entry.ended_at && !entry.is_manual),
	);

	return (
		<div className="flex-1 h-full min-h-0 flex flex-col overflow-y-auto w-full p-4 sm:p-6 gap-4 bg-canvas text-text-primary">
			<WorkspaceSubNav workspaceId={workspaceId} activeTab="time" />

			<div className="flex flex-col gap-5 max-w-7xl w-full">
				<div>
					<h2 className="text-base font-mono font-bold uppercase tracking-wider text-text-primary">
						Time Tracking
					</h2>
					<p className="text-xs font-mono text-text-muted mt-0.5">
						Track focus sessions, view billable hours, and analyze logged time.
					</p>
				</div>

				{activeTimer && (
					<ActiveTimerBar
						workspaceId={workspaceId}
						entry={activeTimer}
						tickets={tickets}
					/>
				)}

				<TimeEntryTable
					workspaceId={workspaceId}
					tickets={tickets}
					entries={timeEntries}
				/>
			</div>
		</div>
	);
}

export default WorkspaceTimePage;
