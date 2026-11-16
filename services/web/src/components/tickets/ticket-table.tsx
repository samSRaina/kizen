import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, Square, Trash2 } from "lucide-react";
import { useConfirm } from "#/components/ui/confirm-dialog";
import { useToast } from "#/components/ui/toast";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import { timeEntryKeys, timeEntryMutations } from "#/lib/queries/time-entries";
import type { Ticket, TicketStatus, TimeEntry } from "#/lib/types";
import { ALL_STATUS_OPTIONS, validateTicketTransition } from "./board/types";

export function TicketTable({
	workspaceId,
	tickets,
	activeTimer,
	onStartTimer,
}: {
	workspaceId: string;
	tickets: Ticket[];
	activeTimer?: TimeEntry;
	onStartTimer: (ticketId: string) => void;
}) {
	const queryClient = useQueryClient();
	const confirm = useConfirm();
	const toast = useToast();

	const updateStatusMutation = useMutation({
		mutationFn: ({
			identifier,
			newStatus,
		}: {
			identifier: string;
			newStatus: TicketStatus;
		}) =>
			ticketMutations.update(workspaceId, identifier, { status: newStatus }),
		onSuccess: () => {
			toast.success("Ticket status updated");
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to update ticket status", {
				title: "Update Failed",
			});
		},
	});

	const deleteTicketMutation = useMutation({
		mutationFn: (identifier: string) =>
			ticketMutations.delete(workspaceId, identifier),
		onSuccess: () => {
			toast.success("Ticket deleted");
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

	if (tickets.length === 0) {
		return (
			<div className="py-12 px-6 bg-surface-elevated/15 text-center text-text-muted text-xs rounded-xs">
				NO TICKETS FOUND MATCHING CRITERIA
			</div>
		);
	}

	const getPriorityBadgeClass = (priority: string) => {
		switch (priority.toLowerCase()) {
			case "critical":
			case "urgent":
				return "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/25";
			case "high":
				return "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/25";
			case "medium":
				return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25";
			default:
				return "bg-surface-elevated text-text-secondary border border-border-subtle";
		}
	};

	return (
		<div className="bg-surface-base border border-border-default overflow-x-auto rounded-md shadow-xs">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="h-9 border-b border-border-default bg-surface-elevated text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
						<th className="h-8 py-0 px-3 font-semibold align-middle">
							Identifier
						</th>
						<th className="h-8 py-0 px-3 font-semibold align-middle">Title</th>
						<th className="h-8 py-0 px-3 font-semibold align-middle">Status</th>
						<th className="h-8 py-0 px-3 font-semibold align-middle">
							Priority
						</th>
						<th className="h-8 py-0 px-3 font-semibold align-middle">Type</th>
						<th className="h-8 py-0 px-3 font-semibold text-right align-middle">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border-subtle text-xs">
					{tickets.map((t) => {
						const isTrackingThis = activeTimer?.ticket_id === t.id;
						const isTimerPaused =
							isTrackingThis && activeTimer?.timer_state === "paused";

						return (
							<tr
								key={t.id}
								className="h-9 hover:bg-surface-hover/70 transition-colors group"
							>
								<td className="h-8 py-0 px-3 font-bold text-text-primary whitespace-nowrap align-middle">
									<div className="flex items-center space-x-1.5">
										<span>{t.identifier}</span>
										{isTrackingThis ? (
											isTimerPaused ? (
												<span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-xs">
													<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
													<span>PAUSED</span>
												</span>
											) : (
												<span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-xs">
													<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
													<span>TRACKING</span>
												</span>
											)
										) : null}
									</div>
								</td>
								<td className="h-8 py-0 px-3 max-w-sm truncate text-text-primary align-middle">
									<span className="truncate">{t.title}</span>
								</td>
								<td className="h-8 py-0 px-3 whitespace-nowrap align-middle">
									<select
										value={t.status}
										disabled={updateStatusMutation.isPending}
										onChange={(e) => {
											const nextStatus = e.target.value as TicketStatus;
											if (nextStatus === t.status) return;

											const transition = validateTicketTransition(
												t.status,
												nextStatus,
											);
											if (!transition.allowed) {
												toast.error(
													transition.reason || "Invalid status transition",
													{
														title: "Transition Not Allowed",
													},
												);
												return;
											}

											updateStatusMutation.mutate({
												identifier: t.identifier,
												newStatus: nextStatus,
											});
										}}
										className="h-6 bg-surface-elevated hover:bg-surface-hover border border-border-subtle px-2 text-xs text-text-primary uppercase cursor-pointer focus:outline-hidden rounded-xs transition-colors inline-flex items-center"
									>
										{ALL_STATUS_OPTIONS.map((opt) => {
											const isCurrent = opt.key === t.status;
											const transition = validateTicketTransition(
												t.status,
												opt.key,
											);
											const disabled = !isCurrent && !transition.allowed;

											return (
												<option
													key={opt.key}
													value={opt.key}
													disabled={disabled}
												>
													{opt.label}
													{disabled ? " (Disallowed)" : ""}
												</option>
											);
										})}
									</select>
								</td>
								<td className="h-8 py-0 px-3 whitespace-nowrap align-middle">
									<span
										className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded-xs ${getPriorityBadgeClass(
											t.priority,
										)}`}
									>
										{t.priority}
									</span>
								</td>
								<td className="h-8 py-0 px-3 uppercase text-text-muted text-[11px] whitespace-nowrap align-middle">
									{t.type}
								</td>
								<td className="h-8 py-0 px-3 text-right whitespace-nowrap align-middle">
									<div className="inline-flex items-center space-x-1.5">
										{isTrackingThis ? (
											<button
												type="button"
												onClick={() => stopTimerMutation.mutate(activeTimer.id)}
												disabled={stopTimerMutation.isPending}
												className="h-6 inline-flex items-center space-x-1 px-2 text-[11px] font-bold uppercase tracking-wider bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-xs transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
												title="Stop tracking this ticket"
											>
												{stopTimerMutation.isPending ? (
													<Loader2 className="w-3 h-3 animate-spin" />
												) : (
													<Square className="w-3 h-3 fill-current" />
												)}
												<span>Stop</span>
											</button>
										) : (
											<button
												type="button"
												onClick={() => onStartTimer(t.id)}
												className="h-6 inline-flex items-center space-x-1 px-2 text-[11px] font-bold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-elevated/70 rounded-xs transition-colors cursor-pointer enabled:active:scale-[0.96]"
												title="Start tracking time on this ticket"
											>
												<Clock className="w-3 h-3 text-text-muted" />
												<span>Track</span>
											</button>
										)}

										<button
											type="button"
											onClick={async () => {
												const ok = await confirm({
													title: "DELETE TICKET",
													message: `Delete ticket "${t.identifier}"? This action cannot be undone.`,
													confirmText: "DELETE",
													destructive: true,
												});
												if (ok) {
													deleteTicketMutation.mutate(t.identifier);
												}
											}}
											disabled={deleteTicketMutation.isPending}
											className="h-6 w-6 inline-flex items-center justify-center p-0 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xs transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
											title="Delete Ticket"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

export default TicketTable;
