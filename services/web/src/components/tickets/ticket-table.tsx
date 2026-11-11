import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, Square, Trash2 } from "lucide-react";
import { useConfirm } from "#/components/ui/confirm-dialog";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import { timeEntryKeys, timeEntryMutations } from "#/lib/queries/time-entries";
import type { Ticket, TicketStatus, TimeEntry } from "#/lib/types";

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

	const stopTimerMutation = useMutation({
		mutationFn: (id: string) => timeEntryMutations.stop(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
		},
	});

	if (tickets.length === 0) {
		return (
			<div className="py-12 px-6 bg-surface-elevated/15 text-center text-text-muted font-mono text-xs rounded-xs">
				NO TICKETS FOUND MATCHING CRITERIA
			</div>
		);
	}

	const getPriorityBadgeClass = (priority: string) => {
		switch (priority.toLowerCase()) {
			case "critical":
			case "urgent":
				return "bg-red-500/15 text-red-400";
			case "high":
				return "bg-orange-500/15 text-orange-400";
			case "medium":
				return "bg-yellow-500/15 text-yellow-400";
			default:
				return "bg-surface-elevated/70 text-text-muted";
		}
	};

	return (
		<div className="bg-surface-base overflow-x-auto rounded-xs shadow-2xs">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="h-8 border-b border-border-default/15 bg-surface-elevated/30 text-[11px] font-mono uppercase tracking-wider text-text-muted">
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
				<tbody className="divide-y divide-border-default/10 font-mono text-xs">
					{tickets.map((t) => {
						const isTrackingThis = activeTimer?.ticket_id === t.id;

						return (
							<tr
								key={t.id}
								className="h-8 hover:bg-surface-elevated/40 transition-colors group"
							>
								<td className="h-8 py-0 px-3 font-bold text-text-primary whitespace-nowrap align-middle">
									<div className="flex items-center space-x-1.5">
										<span>{t.identifier}</span>
										{isTrackingThis ? (
											<span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold rounded-xs">
												<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
												<span>TRACKING</span>
											</span>
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
										onChange={(e) =>
											updateStatusMutation.mutate({
												identifier: t.identifier,
												newStatus: e.target.value as TicketStatus,
											})
										}
										className="h-6 bg-surface-elevated/40 hover:bg-surface-elevated/70 px-2 text-xs text-text-primary uppercase font-mono cursor-pointer focus:outline-hidden rounded-xs transition-colors inline-flex items-center"
									>
										<option value="backlog">Backlog</option>
										<option value="todo">To Do</option>
										<option value="progress">In Progress</option>
										<option value="review">In Review</option>
										<option value="done">Done</option>
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
