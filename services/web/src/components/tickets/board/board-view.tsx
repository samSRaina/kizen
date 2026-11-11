import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import { timeEntryKeys, timeEntryMutations } from "#/lib/queries/time-entries";
import type { Ticket, TicketStatus, TimeEntry } from "#/lib/types";
import { cn } from "#/lib/utils";
import { AddTicketRow } from "./add-ticket-row";
import { CompletedTicketsModal } from "./completed-tickets-modal";
import { TicketCard } from "./ticket-card";
import { TICKET_COLUMNS } from "./types";

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
	const [draggingIdentifier, setDraggingIdentifier] = useState<string | null>(
		null,
	);
	const [overColumnKey, setOverColumnKey] = useState<TicketStatus | null>(null);
	const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
	const [isOverDoneBtn, setIsOverDoneBtn] = useState(false);

	const doneTickets = tickets.filter((t) => t.status === "done");
	const activeTicketsCount = tickets.length - doneTickets.length;

	// Update Ticket Status Mutation with Optimistic Cache Update
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
		onError: (_err, _variables, context) => {
			if (context?.previousTickets) {
				queryClient.setQueryData(
					ticketKeys.lists(workspaceId),
					context.previousTickets,
				);
			}
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
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
	});

	// Stop Timer Mutation
	const stopTimerMutation = useMutation({
		mutationFn: (id: string) => timeEntryMutations.stop(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
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

		updateStatusMutation.mutate({ identifier, newStatus: targetStatus });
	};

	return (
		<div className="w-full space-y-3 select-none">
			{/* Board Toolbar: Status Counts & Finished (DONE) Button (32px row) */}
			<div className="h-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono">
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
					onDrop={(e) => {
						e.preventDefault();
						setIsOverDoneBtn(false);
						const identifier =
							e.dataTransfer.getData("text/plain") || draggingIdentifier;
						if (identifier) {
							updateStatusMutation.mutate({
								identifier,
								newStatus: "done",
							});
						}
					}}
					className={cn(
						"h-8 inline-flex items-center space-x-2 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xs self-start sm:self-auto",
						isOverDoneBtn
							? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500"
							: "bg-surface-elevated/40 hover:bg-surface-elevated/80 text-text-primary",
					)}
					title="View Finished / Completed Tickets (Drop tickets here to mark DONE)"
				>
					<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
					<span>Completed (DONE)</span>
					<span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 rounded-xs">
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
									"w-64 sm:w-72 shrink-0 bg-surface-elevated/25 hover:bg-surface-elevated/40 rounded-xs flex flex-col h-[calc(100vh-270px)] min-h-[480px] transition-all duration-150",
									isOver && "ring-1 ring-accent-yellow bg-accent-yellow/5",
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
								{/* Column Header (Pinned Top, Clean Ghost Surface - 32px height row) */}
								<div className="h-8 flex items-center justify-between px-3 bg-transparent font-mono shrink-0">
									<div className="flex items-center gap-2">
										<span
											className={`w-2 h-2 rounded-full ${col.dotColor} shrink-0`}
										/>
										<span className="text-xs font-bold uppercase tracking-wider text-text-primary">
											{col.label}
										</span>
										<span className="text-[10px] font-bold text-text-muted px-1.5 py-0.5 bg-surface-elevated/70 rounded-xs">
											{colTickets.length}
										</span>
									</div>
								</div>

								{/* Scrollable Card Stack (Flex-1) */}
								<div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-0">
									{colTickets.length === 0 ? (
										<div className="py-8 px-4 bg-surface-elevated/15 text-center font-mono text-[10px] text-text-muted/60 uppercase rounded-xs">
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
													updateStatusMutation.mutate({
														identifier: ticket.identifier,
														newStatus,
													})
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

								{/* Fixed Bottom Footer: Add Ticket Button pinned to bottom of entire column length */}
								<div className="p-2 bg-transparent shrink-0">
									<AddTicketRow workspaceId={workspaceId} status={col.key} />
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Modal listing all tickets that are finished working on (DONE) */}
			<CompletedTicketsModal
				isOpen={isDoneModalOpen}
				onClose={() => setIsDoneModalOpen(false)}
				workspaceId={workspaceId}
				tickets={doneTickets}
				onReopen={(identifier, targetStatus) =>
					updateStatusMutation.mutate({ identifier, newStatus: targetStatus })
				}
				onDelete={(identifier) => deleteTicketMutation.mutate(identifier)}
			/>
		</div>
	);
}

export default TicketBoardView;
