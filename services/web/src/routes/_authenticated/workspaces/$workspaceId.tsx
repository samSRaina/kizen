import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Loader } from "#/components/layout/loader";
import { TicketBoardView } from "#/components/tickets/board";
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
	const [ticketView, setTicketView] = useState<"board" | "table">("board");
	const [isCreatingTicket, setIsCreatingTicket] = useState(false);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [preselectedTicketId, setPreselectedTicketId] = useState<string>("");

	if (isWsPending) {
		return <Loader size="lg" />;
	}

	if (isWsError || !workspace) {
		return (
			<div className="p-8 bg-surface-base shadow-lg rounded-xs text-center space-y-4 ring-1 ring-border-default/20">
				<p className="font-mono text-sm text-red-400">
					Error: {String(wsError || "Workspace not found")}
				</p>
				<Link to="/workspaces" className="h-8 btn-kizen-ghost">
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
			{/* Breadcrumb Navigation - 32px standard row */}
			<nav className="h-8 flex items-center space-x-2 font-mono text-xs text-text-muted">
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

			{/* Workspace Header - Clean without hard bottom border */}
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-2">
				<div className="space-y-1">
					<div className="flex items-center space-x-3">
						<h1 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-text-primary">
							{workspace.name}
						</h1>
						<span className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-surface-elevated/60 text-text-primary rounded-xs">
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

			{/* Segmented Navigation Ghost Tabs - 32px height row (Modular classes from styles.css) */}
			<div className="h-8 tab-group-32">
				<button
					type="button"
					onClick={() => setActiveTab("tickets")}
					className={`htab-7item-32 ${activeTab === "tickets" ? "active" : ""}`}
				>
					Tickets ({tickets.length})
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("time")}
					className={`htab-7item-32 ${activeTab === "time" ? "active" : ""}`}
				>
					Time Tracking ({timeEntries.length})
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("settings")}
					className={`htab-7item-32 ${activeTab === "settings" ? "active" : ""}`}
				>
					Settings
				</button>
			</div>

			{/* Tab 1: Tickets */}
			{activeTab === "tickets" ? (
				<section className="space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex flex-wrap items-center gap-3">
							{/* View Mode Toggle: [ BOARD ] / [ TABLE ] Ghost Pills (32px row) */}
							<div className="h-8 tab-group-32">
								<button
									type="button"
									onClick={() => setTicketView("board")}
									className={`h-7 tab-item-flex items-center32 ${ticketView === "board" ? "active" : ""}`}
								>
									BOARD
								</button>
								<button
									type="button"
									onClick={() => setTicketView("table")}
									className={`h-7 tab-item-flex items-center32 ${ticketView === "table" ? "active" : ""}`}
								>
									TABLE
								</button>
							</div>

							{/* Status Filters (active in Table view - 32px row) */}
							{ticketView === "table" ? (
								<div className="h-8 flex flex-wrap items-center gap-1.5 font-mono text-xs">
									<span className="text-text-muted mr-1 uppercase text-[11px]">
										FILTER:
									</span>
									{["all", "backlog", "todo", "progress", "review", "done"].map(
										(s) => (
											<button
												key={s}
												type="button"
												onClick={() => setFilterStatus(s)}
												className={`h-7 px-2.5 inlineinline-flex items-centerflex items-center text-[11px] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer enabled:active:scale-[0.96] ${
													filterStatus === s
														? "bg-text-primary text-canvas"
														: "bg-surface-elevated/40 hover:bg-surface-elevated text-text-muted hover:text-text-primary"
												}`}
											>
												{s}
											</button>
										),
									)}
								</div>
							) : null}
						</div>

						{/* Action: Create New Ticket Trigger (Modular 32px height button) */}
						<button
							type="button"
							onClick={() => setIsCreatingTicket(true)}
							className="h-8 px-3.5 btn-kizen-primary self-start sm:self-auto"
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
					) : ticketView === "board" ? (
						<TicketBoardView
							workspaceId={workspaceId}
							tickets={tickets}
							activeTimer={activeTimer}
							onStartTimer={(ticketId) => {
								setPreselectedTicketId(ticketId);
								setActiveTab("time");
							}}
						/>
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
