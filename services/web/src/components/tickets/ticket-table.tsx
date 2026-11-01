import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Trash2 } from "lucide-react";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import type { Ticket, TicketStatus } from "#/lib/types";

export function TicketTable({
	workspaceId,
	tickets,
	onStartTimer,
}: {
	workspaceId: string;
	tickets: Ticket[];
	onStartTimer: (ticketId: string) => void;
}) {
	const queryClient = useQueryClient();

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

	if (tickets.length === 0) {
		return (
			<div className="py-12 px-6 border border-dashed border-border-default bg-surface-base/50 text-center text-text-muted font-mono text-xs">
				NO TICKETS FOUND IN THIS SECTOR
			</div>
		);
	}

	return (
		<div className="border border-border-default bg-surface-base overflow-x-auto">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="border-b border-border-default bg-surface-elevated/40 text-[11px] font-mono uppercase tracking-wider text-text-muted">
						<th className="py-3 px-4 font-semibold">Identifier</th>
						<th className="py-3 px-4 font-semibold">Title</th>
						<th className="py-3 px-4 font-semibold">Type</th>
						<th className="py-3 px-4 font-semibold">Priority</th>
						<th className="py-3 px-4 font-semibold">Status</th>
						<th className="py-3 px-4 font-semibold text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border-default font-mono text-xs">
					{tickets.map((t) => (
						<tr
							key={t.id}
							className="hover:bg-surface-hover/60 transition-colors group"
						>
							<td className="py-3 px-4 text-text-muted font-bold whitespace-nowrap">
								{t.identifier}
							</td>
							<td className="py-3 px-4">
								<div className="font-sans font-semibold text-text-primary text-sm">
									{t.title}
								</div>
								{t.description ? (
									<p className="font-sans text-xs text-text-secondary mt-0.5 line-clamp-1">
										{t.description}
									</p>
								) : null}
							</td>
							<td className="py-3 px-4 uppercase text-text-secondary text-[11px]">
								{t.type}
							</td>
							<td className="py-3 px-4">
								<span
									className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold border ${
										t.priority === "Critical"
											? "border-red-800 bg-red-950/40 text-red-300"
											: t.priority === "High"
												? "border-amber-800 bg-amber-950/40 text-amber-300"
												: t.priority === "Medium"
													? "border-border-default bg-surface-sunken text-text-primary"
													: "border-border-subtle bg-surface-base text-text-muted"
									}`}
								>
									{t.priority}
								</span>
							</td>
							<td className="py-3 px-4">
								<select
									value={t.status}
									onChange={(e) =>
										updateStatusMutation.mutate({
											identifier: t.identifier,
											newStatus: e.target.value as TicketStatus,
										})
									}
									className="px-2 py-1 text-xs bg-surface-elevated border border-border-default text-text-primary focus:outline-hidden focus:border-text-primary font-mono cursor-pointer"
								>
									<option value="backlog">Backlog</option>
									<option value="todo">Todo</option>
									<option value="progress">In Progress</option>
									<option value="review">Review</option>
									<option value="done">Done</option>
								</select>
							</td>
							<td className="py-3 px-4 text-right whitespace-nowrap">
								<div className="inline-flex items-center space-x-2">
									<button
										type="button"
										onClick={() => onStartTimer(t.id)}
										className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-surface-elevated hover:bg-surface-hover border border-border-default text-text-primary transition-colors cursor-pointer enabled:active:scale-[0.96]"
										title="Start tracking time on this ticket"
									>
										<Clock className="w-3 h-3 text-text-muted" />
										<span>Track</span>
									</button>

									<button
										type="button"
										onClick={() => {
											if (
												window.confirm(
													`Delete ticket ${t.identifier}? This cannot be undone.`,
												)
											) {
												deleteTicketMutation.mutate(t.identifier);
											}
										}}
										disabled={deleteTicketMutation.isPending}
										className="p-1 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
										title="Delete Ticket"
									>
										<Trash2 className="w-3.5 h-3.5" />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default TicketTable;
