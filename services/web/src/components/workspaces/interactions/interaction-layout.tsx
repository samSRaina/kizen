import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	Clock,
	KanbanSquare,
	ListTodo,
	Plus,
	Search,
	Settings,
	X,
} from "lucide-react";
import { useState } from "react";
import { Loader } from "@/components/layout/loader";
import { CompletedTicketsModal } from "@/components/tickets/board/completed-tickets-modal";
import { TicketCreateForm } from "@/components/tickets/ticket-create-form";
import {
	ticketKeys,
	ticketMutations,
	ticketQueries,
} from "@/lib/queries/tickets";
import {
	timeEntryKeys,
	timeEntryMutations,
	timeEntryQueries,
} from "@/lib/queries/time-entries";
import type { Ticket, TicketPriority, TicketStatus } from "@/lib/types";
import { BoardView } from "./board-view";
import { ListView } from "./list-view";
import { TicketDetailModal } from "./ticket-detail-modal";
import { ALL_STATUSES, filterTickets, getStatusLabel } from "./view-utils";

export interface InteractionLayoutProps {
	workspaceId: string;
	interactionKey?: string;
	title?: string;
	description?: string;
	context: "board" | "list" | "timeline";
	canCreate?: boolean;
	canEdit?: boolean;
	canManageViews?: boolean;
	canManageSprints?: boolean;
	sprintId?: string | null;
}

export function InteractionLayout({
	workspaceId,
	context,
}: InteractionLayoutProps) {
	const queryClient = useQueryClient();

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [isCreatingTicket, setIsCreatingTicket] = useState(false);
	const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

	// Queries
	const { data: tickets = [], isLoading: isTicketsLoading } = useQuery(
		ticketQueries.list(workspaceId),
	);
	const { data: timeEntries = [] } = useQuery(
		timeEntryQueries.list(workspaceId),
	);

	// Find active timer ticket ID
	const activeTimer = timeEntries.find(
		(entry) =>
			entry.timer_state === "running" ||
			entry.timer_state === "paused" ||
			(!entry.ended_at && !entry.is_manual),
	);
	const activeTimerTicketId = activeTimer?.ticket_id || null;

	// Completed tickets
	const completedTickets = tickets.filter((t) => t.status === "done");
	const activeTickets = tickets.filter((t) => t.status !== "done");

	// Filter active tickets
	const filteredTickets = filterTickets(activeTickets, search, statusFilter);

	// Mutations
	const updateTicketMutation = useMutation({
		mutationFn: ({
			identifier,
			data,
		}: {
			identifier: string;
			data: {
				title?: string;
				description?: string;
				status?: TicketStatus;
				priority?: TicketPriority;
			};
		}) => ticketMutations.update(workspaceId, identifier, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
	});

	const createTicketMutation = useMutation({
		mutationFn: (data: {
			title: string;
			priority: TicketPriority;
			status?: TicketStatus;
		}) =>
			ticketMutations.create(workspaceId, {
				title: data.title,
				priority: data.priority,
				status: data.status || "backlog",
				type: "task",
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
	});

	const deleteTicketMutation = useMutation({
		mutationFn: (identifier: string) =>
			ticketMutations.delete(workspaceId, identifier),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
	});

	const startTimerMutation = useMutation({
		mutationFn: (ticketId: string) =>
			timeEntryMutations.create(workspaceId, {
				ticket_id: ticketId,
				started_at: new Date().toISOString(),
				billable: true,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
	});

	const handleOpenTicket = (ticket: Ticket) => {
		setSelectedTicket(ticket);
		setIsDetailOpen(true);
	};

	const handleCloseTicket = () => {
		setIsDetailOpen(false);
		setSelectedTicket(null);
	};

	if (isTicketsLoading) {
		return <Loader size="lg" />;
	}

	return (
		<div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden w-full p-4 sm:p-6 gap-3 bg-canvas text-text-primary">
			{/* Brutalist Action Bar / Sub-Nav (32px controls) */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border-default shrink-0">
				{/* View Tabs: Board, List, Track Time, Settings */}
				<div className="flex items-center gap-1.5 flex-wrap">
					<Link
						to="/workspaces/$workspaceId/interactions/board"
						params={{ workspaceId }}
						className={`h-8 px-3 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border transition-colors cursor-pointer ${
							context === "board"
								? "bg-accent-primary text-accent-primary-fg border-accent-primary"
								: "border-border-default bg-surface-base text-text-muted hover:text-text-primary hover:border-text-primary"
						}`}
					>
						<KanbanSquare className="size-3.5" />
						<span>Board</span>
					</Link>

					<Link
						to="/workspaces/$workspaceId/interactions/list"
						params={{ workspaceId }}
						className={`h-8 px-3 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border transition-colors cursor-pointer ${
							context === "list"
								? "bg-accent-primary text-accent-primary-fg border-accent-primary"
								: "border-border-default bg-surface-base text-text-muted hover:text-text-primary hover:border-text-primary"
						}`}
					>
						<ListTodo className="size-3.5" />
						<span>List</span>
					</Link>

					<Link
						to="/workspaces/$workspaceId/time"
						params={{ workspaceId }}
						className="h-8 px-3 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border border-border-default bg-surface-base text-text-muted hover:text-text-primary hover:border-text-primary transition-colors cursor-pointer"
					>
						<Clock className="size-3.5" />
						<span>Track Time</span>
					</Link>

					<Link
						to="/workspaces/$workspaceId/settings"
						params={{ workspaceId }}
						className="h-8 px-3 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border border-border-default bg-surface-base text-text-muted hover:text-text-primary hover:border-text-primary transition-colors cursor-pointer"
					>
						<Settings className="size-3.5" />
						<span>Settings</span>
					</Link>
				</div>

				{/* Right Utilities: Search Filter, Status Dropdown, and New Ticket Trigger */}
				<div className="flex items-center gap-2 flex-wrap">
					{/* Search Input Box */}
					<div className="relative h-8 flex-1 sm:w-56">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-text-muted pointer-events-none" />
						<input
							type="text"
							placeholder="Filter tickets..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-8 w-full pl-8 pr-7 text-xs font-mono border border-border-default bg-surface-base text-text-primary placeholder:text-text-muted rounded-xs focus:border-text-primary outline-none"
						/>
						{search && (
							<button
								type="button"
								onClick={() => setSearch("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-primary"
							>
								<X className="size-3" />
							</button>
						)}
					</div>

					{/* Status Select Filter */}
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="h-8 px-2.5 text-xs font-mono uppercase tracking-wider font-semibold border border-border-default bg-surface-base text-text-primary rounded-xs focus:border-text-primary outline-none cursor-pointer"
					>
						<option value="all">ALL STATUSES</option>
						{ALL_STATUSES.map((st) => (
							<option key={st} value={st}>
								{getStatusLabel(st).toUpperCase()}
							</option>
						))}
					</select>

					{/* New Ticket Action Button */}
					<button
						type="button"
						onClick={() => setIsCreatingTicket(true)}
						className="h-8 px-3.5 flex items-center justify-center gap-1.5 rounded-xs bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-2xs"
					>
						<Plus className="size-3.5" />
						<span>New Ticket</span>
					</button>
				</div>
			</div>

			{/* Main Interaction Viewport: Spanning Vertically to Fit the Desktop */}
			<div className="flex-1 min-h-0 h-full overflow-hidden flex flex-col">
				{context === "board" || context === "timeline" ? (
					<BoardView
						workspaceId={workspaceId}
						tickets={filteredTickets}
						activeTimerTicketId={activeTimerTicketId}
						onSelectTicket={handleOpenTicket}
						onStartTimer={(ticketId) => startTimerMutation.mutate(ticketId)}
						onStatusChange={async (identifier, newStatus) => {
							await updateTicketMutation.mutateAsync({
								identifier,
								data: { status: newStatus },
							});
						}}
						onCreateTicket={async (ticketTitle, priority, status) => {
							await createTicketMutation.mutateAsync({
								title: ticketTitle,
								priority,
								status,
							});
						}}
						onDeleteTicket={async (identifier) => {
							await deleteTicketMutation.mutateAsync(identifier);
						}}
						onOpenCompletedModal={() => setIsCompletedModalOpen(true)}
						completedCount={completedTickets.length}
					/>
				) : (
					<ListView
						tickets={filteredTickets}
						activeTimerTicketId={activeTimerTicketId}
						onSelectTicket={handleOpenTicket}
						onStartTimer={(ticketId) => startTimerMutation.mutate(ticketId)}
						onStatusChange={async (identifier, newStatus) => {
							await updateTicketMutation.mutateAsync({
								identifier,
								data: { status: newStatus },
							});
						}}
						onDeleteTicket={async (identifier) => {
							await deleteTicketMutation.mutateAsync(identifier);
						}}
					/>
				)}
			</div>

			{/* Ticket Detail Drawer/Modal */}
			<TicketDetailModal
				ticket={selectedTicket}
				isOpen={isDetailOpen}
				onClose={handleCloseTicket}
				onUpdate={async (identifier, data) => {
					await updateTicketMutation.mutateAsync({
						identifier,
						data,
					});
				}}
				onDelete={async (identifier) => {
					await deleteTicketMutation.mutateAsync(identifier);
				}}
				onStartTimer={(ticketId) => startTimerMutation.mutate(ticketId)}
			/>

			{/* Ticket Create Form Modal */}
			{isCreatingTicket && (
				<TicketCreateForm
					workspaceId={workspaceId}
					onDone={() => setIsCreatingTicket(false)}
				/>
			)}

			{/* Completed Tickets Modal */}
			<CompletedTicketsModal
				isOpen={isCompletedModalOpen}
				onClose={() => setIsCompletedModalOpen(false)}
				workspaceId={workspaceId}
				tickets={completedTickets}
				onReopen={async (identifier: string, targetStatus: TicketStatus) => {
					await updateTicketMutation.mutateAsync({
						identifier,
						data: { status: targetStatus },
					});
				}}
				onDelete={async (identifier: string) => {
					await deleteTicketMutation.mutateAsync(identifier);
				}}
			/>
		</div>
	);
}

export default InteractionLayout;
