import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "#/components/ui/toast";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import { timeEntryKeys, timeEntryMutations } from "#/lib/queries/time-entries";
import type { Ticket, TicketStatus, TimeEntry } from "#/lib/types";
import { cn } from "#/lib/utils";
import { AddTicketRow } from "./add-ticket-row";
import { CompletedTicketsModal } from "./completed-tickets-modal";
import { TicketCard } from "./ticket-card";
import { TICKET_COLUMNS, validateTicketTransition } from "./types";

interface TicketBoardViewProps {
	workspaceId: string;
	tickets: Ticket[];
	activeTimer?: TimeEntry;
	onStartTimer: (ticketId: string) => void;
}

export function TicketBoardView({
	workspaceId,
	tickets,
	activeTimer,
	onStartTimer,
}: TicketBoardViewProps) {
	const queryClient = useQueryClient();
	const toast = useToast();
	const [draggingIdentifier, setDraggingIdentifier] = useState<string | null>(
		null,
	);
	const [overColumnKey, setOverColumnKey] = useState<TicketStatus | null>(null);
	const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
	const [isOverDoneBtn, setIsOverDoneBtn] = useState(false);

	const doneTickets = tickets.filter((t) => t.status === "done");
	const activeTicketsCount = tickets.length - doneTickets.length;

	// Update Ticket Status Mutation with Optimistic Cache Update and Error Rollback
	const updateStatusMutation = useMutation({
		mutationFn: ({
			identifier,
			newStatus,
		}: {
			identifier: string;
			newStatus: TicketStatus;
		}) =>
			ticketMutations.update(workspaceId, identifier, { status: newStatus }),
		onMutate: async ({ identifier, newStatus }) => {
			await queryClient.cancelQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
			const previousTickets = queryClient.getQueryData<Ticket[]>(
				ticketKeys.lists(workspaceId),
			);
			queryClient.setQueryData<Ticket[]>(
				ticketKeys.lists(workspaceId),
				(old = []) =>
					old.map((t) =>
						t.identifier === identifier ? { ...t, status: newStatus } : t,
					),
			);
			return { previousTickets };
		},
		onError: (err: Error, _variables, context) => {
			if (context?.previousTickets) {
				queryClient.setQueryData(
					ticketKeys.lists(workspaceId),
					context.previousTickets,
				);
			}
			toast.error(err.message || "Failed to update ticket status", {
				title: "Transition Error",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
	});

	// Delete Ticket Mutation
	const deleteTicketMutation = useMutation({
		mutationFn: (identifier: string) =>
			ticketMutations.delete(workspaceId, identifier),
		onSuccess: () => {
			toast.success("Ticket deleted successfully");
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to delete ticket", {
				title: "Delete Failed",
			});
		},
	});

	// Stop Timer Mutation - automatically advances linked in-progress ticket to review
	const stopTimerMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await timeEntryMutations.stop(workspaceId, id);
			if (activeTimer?.ticket_id) {
				const linked = tickets.find((t) => t.id === activeTimer.ticket_id);
				if (linked && linked.status === "progress") {
					try {
						await ticketMutations.update(workspaceId, linked.identifier, {
							status: "review",
						});
					} catch (e) {
						console.error("Failed to advance ticket to review:", e);
					}
				}
			}
			return res;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
	});

	// DnD Handlers
	const handleDragStart = (e: React.DragEvent, ticket: Ticket) => {
		setDraggingIdentifier(ticket.identifier);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", ticket.identifier);
	};

	const handleDragEnd = () => {
		setDraggingIdentifier(null);
		setOverColumnKey(null);
		setIsOverDoneBtn(false);
	};

	const handleDropOnColumn = (
		e: React.DragEvent,
		targetStatus: TicketStatus,
	) => {
		e.preventDefault();
		const identifier =
			e.dataTransfer.getData("text/plain") || draggingIdentifier;
		setOverColumnKey(null);
		setDraggingIdentifier(null);

		if (!identifier) return;

		const currentTicket = tickets.find((t) => t.identifier === identifier);
		if (!currentTicket || currentTicket.status === targetStatus) return;

		const transition = validateTicketTransition(
			currentTicket.status,
			targetStatus,
		);
		if (!transition.allowed) {
			toast.error(transition.reason || "Invalid status transition", {
				title: "Transition Not Allowed",
			});
			return;
		}

		updateStatusMutation.mutate({ identifier, newStatus: targetStatus });
	};

	const handleDropOnDone = (e: React.DragEvent) => {
		e.preventDefault();
		setIsOverDoneBtn(false);
		const identifier =
			e.dataTransfer.getData("text/plain") || draggingIdentifier;
		setDraggingIdentifier(null);

		if (!identifier) return;

		const currentTicket = tickets.find((t) => t.identifier === identifier);
		if (!currentTicket || currentTicket.status === "done") return;

		const transition = validateTicketTransition(currentTicket.status, "done");
		if (!transition.allowed) {
			toast.error(transition.reason || "Invalid status transition", {
				title: "Transition Not Allowed",
			});
			return;
		}

		updateStatusMutation.mutate({
			identifier,
			newStatus: "done",
		});
	};

	const handleMoveStatus = (ticket: Ticket, newStatus: TicketStatus) => {
		const transition = validateTicketTransition(ticket.status, newStatus);
		if (!transition.allowed) {
			toast.error(transition.reason || "Invalid status transition", {
				title: "Transition Not Allowed",
			});
			return;
		}
		updateStatusMutation.mutate({
			identifier: ticket.identifier,
			newStatus,
		});
	};

	const handleReopen = (identifier: string, targetStatus: TicketStatus) => {
		const currentTicket = tickets.find((t) => t.identifier === identifier);
		if (currentTicket) {
			const transition = validateTicketTransition(
				currentTicket.status,
				targetStatus,
			);
			if (!transition.allowed) {
				toast.error(transition.reason || "Invalid status transition", {
					title: "Reopen Not Allowed",
				});
				return;
			}
		}
		updateStatusMutation.mutate({ identifier, newStatus: targetStatus });
	};

	return (
		<div className="w-full space-y-3 select-none">
			{/* Board Toolbar: Status Counts & Finished (DONE) Button (32px row) */}
			<div className="h-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="text-[11px] text-text-muted uppercase tracking-wider flex items-center space-x-2">
					<span>Workflow Columns</span>
					<span>•</span>
					<span className="font-bold text-text-primary">
						{activeTicketsCount} Active Tickets
					</span>
				</div>

				{/* Separate button that lists all tickets finished working on (DONE) */}
				<button
					type="button"
					onClick={() => setIsDoneModalOpen(true)}
					onDragOver={(e) => {
						e.preventDefault();
						e.dataTransfer.dropEffect = "move";
						setIsOverDoneBtn(true);
					}}
					onDragLeave={() => setIsOverDoneBtn(false)}
					onDrop={handleDropOnDone}
					className={cn(
						"h-8 inline-flex items-center space-x-2 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md self-start sm:self-auto border border-border-default bg-surface-base hover:bg-surface-hover text-text-primary shadow-2xs",
						isOverDoneBtn
							? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30"
							: "border-border-default bg-surface-base hover:bg-surface-hover text-text-primary",
					)}
					title="View Finished / Completed Tickets (Drop tickets here to mark DONE)"
				>
					<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
					<span>Completed</span>
					<span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xs">
						{doneTickets.length}
					</span>
				</button>
			</div>

			{/* Horizontally scrollable 4-column container */}
			<div className="w-full overflow-x-auto pb-6 pt-1">
				<div className="flex items-start gap-4 min-w-max">
					{TICKET_COLUMNS.map((col) => {
						const colTickets = tickets.filter((t) => t.status === col.key);
						const isOver = overColumnKey === col.key;

						return (
							// biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop drop zone column container
							<div
								key={col.key}
								className={cn(
									"w-64 sm:w-72 shrink-0 bg-surface-elevated border border-border-default rounded-md flex flex-col h-[calc(100vh-270px)] min-h-[480px] transition-all duration-150 shadow-2xs",
									isOver &&
										"ring-2 ring-accent-yellow border-accent-yellow/60 bg-accent-yellow/5",
								)}
								onDragOver={(e) => {
									e.preventDefault();
									e.dataTransfer.dropEffect = "move";
									setOverColumnKey(col.key);
								}}
								onDragLeave={(e) => {
									if (!e.currentTarget.contains(e.relatedTarget as Node)) {
										setOverColumnKey(null);
									}
								}}
								onDrop={(e) => handleDropOnColumn(e, col.key)}
							>
								{/* Column Header (Pinned Top, Clean Surface - 36px height row) */}
								<div className="h-9 flex items-center justify-between px-3 bg-surface-base/60 border-b border-border-subtle shrink-0 rounded-t-md">
									<div className="flex items-center gap-2">
										<span
											className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shrink-0`}
										/>
										<span className="text-xs font-bold uppercase tracking-wider text-text-primary">
											{col.label}
										</span>
										<span className="text-[10px] font-bold text-text-secondary px-1.5 py-0.2 bg-surface-sunken border border-border-subtle rounded-xs">
											{colTickets.length}
										</span>
									</div>
								</div>

								{/* Scrollable Card Stack (Flex-1) */}
								<div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-0">
									{colTickets.length === 0 ? (
										<div className="py-8 px-4 border border-dashed border-border-default bg-surface-sunken/40 text-center text-[10px] font-semibold text-text-muted uppercase rounded-md">
											Drop tickets here
										</div>
									) : (
										colTickets.map((ticket) => (
											<TicketCard
												key={ticket.id}
												ticket={ticket}
												workspaceId={workspaceId}
												activeTimer={activeTimer}
												onStartTimer={onStartTimer}
												onStopTimer={(timeEntryId) =>
													stopTimerMutation.mutate(timeEntryId)
												}
												isStoppingTimer={stopTimerMutation.isPending}
												onMoveStatus={(newStatus) =>
													handleMoveStatus(ticket, newStatus)
												}
												onDelete={() =>
													deleteTicketMutation.mutate(ticket.identifier)
												}
												isDragging={draggingIdentifier === ticket.identifier}
												onDragStart={(e) => handleDragStart(e, ticket)}
												onDragEnd={handleDragEnd}
											/>
										))
									)}
								</div>

								{/* Add Ticket Inline Trigger at bottom of column */}
								<div className="p-2 border-t border-border-default/15 bg-transparent shrink-0">
									<AddTicketRow workspaceId={workspaceId} status={col.key} />
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Modal for finished/done tickets */}
			<CompletedTicketsModal
				isOpen={isDoneModalOpen}
				onClose={() => setIsDoneModalOpen(false)}
				tickets={doneTickets}
				workspaceId={workspaceId}
				onReopen={handleReopen}
				onDelete={(identifier) => deleteTicketMutation.mutate(identifier)}
			/>
		</div>
	);
}

export default TicketBoardView;
