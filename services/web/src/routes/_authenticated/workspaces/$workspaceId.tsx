import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Loader } from "#/components/layout/loader";
import { TicketCreateForm } from "#/components/tickets/ticket-create-form";
import { TicketTable } from "#/components/tickets/ticket-table";
import { ActiveTimerBar } from "#/components/time-entries/active-timer-bar";
import { TimeEntryForm } from "#/components/time-entries/time-entry-form";
import { TimeEntryTable } from "#/components/time-entries/time-entry-table";
import { WorkspaceSettings } from "#/components/workspaces/workspace-settings";
import { ticketQueries } from "#/lib/queries/tickets";
import { timeEntryQueries } from "#/lib/queries/time-entries";
import { workspaceQueries } from "#/lib/queries/workspaces";

export const Route = createFileRoute("/_authenticated/workspaces/$workspaceId")(
	{
		component: WorkspaceDetailPage,
	},
);

function WorkspaceDetailPage() {
	const { workspaceId } = Route.useParams();
	const navigate = useNavigate();

	const {
		data: workspace,
		isPending: isWsPending,
		isError: isWsError,
		error: wsError,
	} = useQuery(workspaceQueries.detail(workspaceId));

	const { data: tickets = [], isPending: isTicketsPending } = useQuery(
		ticketQueries.list(workspaceId),
	);
	const { data: timeEntries = [], isPending: isTimePending } = useQuery(
		timeEntryQueries.list(workspaceId),
	);

	type Tab = "tickets" | "time" | "settings";
	const [activeTab, setActiveTab] = useState<Tab>("tickets");
	const [isCreatingTicket, setIsCreatingTicket] = useState(false);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [preselectedTicketId, setPreselectedTicketId] = useState<string>("");

	if (isWsPending) {
		return <Loader size="lg" />;
	}

	if (isWsError || !workspace) {
		return (
			<div className="p-8 border border-border-default bg-surface-base text-center space-y-4">
				<p className="font-mono text-sm text-red-400">
					Error: {String(wsError || "Workspace not found")}
				</p>
				<Link
					to="/workspaces"
					className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-surface-elevated hover:bg-surface-hover border border-border-default text-text-primary transition-colors cursor-pointer"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					<span>Back to Workspaces</span>
				</Link>
			</div>
		);
	}

	const activeTimer = timeEntries.find((entry) => !entry.ended_at);
	const filteredTickets =
		filterStatus === "all"
			? tickets
			: tickets.filter((t) => t.status === filterStatus);

	return (
		<div className="space-y-8">
			{/* Breadcrumb Navigation */}
			<nav className="flex items-center space-x-2 font-mono text-xs text-text-muted">
				<Link
					to="/workspaces"
					className="hover:text-text-primary transition-colors flex items-center space-x-1"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					<span>WORKSPACES</span>
				</Link>
				<span>/</span>
				<span className="text-text-primary font-bold uppercase truncate max-w-xs">
					{workspace.name}
				</span>
			</nav>

			{/* Workspace Header */}
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-border-default">
				<div className="space-y-1">
					<div className="flex items-center space-x-3">
						<h1 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-text-primary">
							{workspace.name}
						</h1>
						<span className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-surface-sunken border border-border-default text-text-primary">
							Rate: {workspace.default_hourly_rate}/hr
						</span>
					</div>
					{workspace.description ? (
						<p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
							{workspace.description}
						</p>
					) : null}
				</div>
			</div>

			{/* Active Live Timer Notification */}
			{activeTimer ? (
				<ActiveTimerBar
					workspaceId={workspaceId}
					entry={activeTimer}
					tickets={tickets}
				/>
			) : null}

			{/* Segmented Navigation Tabs */}
			<div className="flex items-center border border-border-default bg-surface-sunken w-fit">
				<button
					type="button"
					onClick={() => setActiveTab("tickets")}
					className={`py-2 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer enabled:active:scale-[0.96] ${
						activeTab === "tickets"
							? "bg-accent-primary text-accent-primary-fg"
							: "text-text-muted hover:text-text-primary hover:bg-surface-hover"
					}`}
				>
					Tickets ({tickets.length})
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("time")}
					className={`py-2 px-4 font-mono text-xs font-bold uppercase tracking-wider border-l border-border-default transition-all cursor-pointer enabled:active:scale-[0.96] ${
						activeTab === "time"
							? "bg-accent-primary text-accent-primary-fg"
							: "text-text-muted hover:text-text-primary hover:bg-surface-hover"
					}`}
				>
					Time Tracking ({timeEntries.length})
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("settings")}
					className={`py-2 px-4 font-mono text-xs font-bold uppercase tracking-wider border-l border-border-default transition-all cursor-pointer enabled:active:scale-[0.96] ${
						activeTab === "settings"
							? "bg-accent-primary text-accent-primary-fg"
							: "text-text-muted hover:text-text-primary hover:bg-surface-hover"
					}`}
				>
					Settings
				</button>
			</div>

			{/* Tab 1: Tickets */}
			{activeTab === "tickets" ? (
				<section className="space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						{/* Filters */}
						<div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
							<span className="text-text-muted mr-1 uppercase text-[11px]">
								FILTER:
							</span>
							{["all", "backlog", "todo", "progress", "review", "done"].map(
								(s) => (
									<button
										key={s}
										type="button"
										onClick={() => setFilterStatus(s)}
										className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border transition-colors cursor-pointer enabled:active:scale-[0.96] ${
											filterStatus === s
												? "bg-text-primary text-canvas border-text-primary"
												: "bg-surface-elevated hover:bg-surface-hover border-border-default text-text-muted"
										}`}
									>
										{s}
									</button>
								),
							)}
						</div>

						{/* Action */}
						<button
							type="button"
							onClick={() => setIsCreatingTicket(true)}
							className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover enabled:active:scale-[0.96] transition-all cursor-pointer shadow-sm self-start sm:self-auto"
						>
							<Plus className="w-3.5 h-3.5" />
							<span>New Ticket</span>
						</button>
					</div>

					{isCreatingTicket ? (
						<TicketCreateForm
							workspaceId={workspaceId}
							onDone={() => setIsCreatingTicket(false)}
						/>
					) : null}

					{isTicketsPending ? (
						<Loader />
					) : (
						<TicketTable
							workspaceId={workspaceId}
							tickets={filteredTickets}
							activeTimer={activeTimer}
							onStartTimer={(ticketId) => {
								setPreselectedTicketId(ticketId);
								setActiveTab("time");
							}}
						/>
					)}
				</section>
			) : null}

			{/* Tab 2: Time Tracking */}
			{activeTab === "time" ? (
				<section className="space-y-8">
					<TimeEntryForm
						workspaceId={workspaceId}
						workspace={workspace}
						tickets={tickets}
						activeTimer={activeTimer}
						preselectedTicketId={preselectedTicketId}
					/>

					<div className="space-y-4">
						<h2 className="font-bold text-sm uppercase tracking-wider font-mono text-text-primary">
							Logged Time History
						</h2>
						{isTimePending ? (
							<Loader />
						) : (
							<TimeEntryTable
								workspaceId={workspaceId}
								tickets={tickets}
								entries={timeEntries}
							/>
						)}
					</div>
				</section>
			) : null}

			{/* Tab 3: Settings */}
			{activeTab === "settings" ? (
				<section>
					<WorkspaceSettings
						workspace={workspace}
						onDeleted={() => navigate({ to: "/workspaces" })}
					/>
				</section>
			) : null}
		</div>
	);
}

export default WorkspaceDetailPage;
