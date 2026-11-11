import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Square, Trash2 } from "lucide-react";
import { useConfirm } from "#/components/ui/confirm-dialog";
import { formatSeconds } from "#/lib/format-duration";
import { timeEntryKeys, timeEntryMutations } from "#/lib/queries/time-entries";
import type { Ticket, TimeEntry } from "#/lib/types";

export function TimeEntryTable({
	workspaceId,
	tickets,
	entries,
}: {
	workspaceId: string;
	tickets: Ticket[];
	entries: TimeEntry[];
}) {
	const queryClient = useQueryClient();
	const confirm = useConfirm();

	const deleteEntryMutation = useMutation({
		mutationFn: (id: string) => timeEntryMutations.delete(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
		},
	});

	const stopEntryMutation = useMutation({
		mutationFn: (id: string) => timeEntryMutations.stop(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
		},
	});

	if (entries.length === 0) {
		return (
			<div className="py-12 px-6 bg-surface-elevated/15 text-center text-text-muted font-mono text-xs rounded-xs">
				NO TIME ENTRIES RECORDED FOR THIS WORKSPACE
			</div>
		);
	}

	return (
		<div className="bg-surface-base overflow-x-auto rounded-xs shadow-2xs">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="h-8 border-b border-border-default/15 bg-surface-elevated/30 text-[11px] font-mono uppercase tracking-wider text-text-muted">
						<th className="h-8 py-0 px-3 font-semibold align-middle">
							Description
						</th>
						<th className="h-8 py-0 px-3 font-semibold align-middle">Ticket</th>
						<th className="h-8 py-0 px-3 font-semibold align-middle">
							Date & Time
						</th>
						<th className="h-8 py-0 px-3 font-semibold align-middle">
							Duration
						</th>
						<th className="h-8 py-0 px-3 font-semibold align-middle">Rate</th>
						<th className="h-8 py-0 px-3 font-semibold text-right align-middle">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border-default/10 font-mono text-xs">
					{entries.map((entry) => {
						const linkedTicket = tickets.find((t) => t.id === entry.ticket_id);
						const isRunning = !entry.ended_at;

						const durationSeconds =
							entry.duration_seconds ??
							(entry.ended_at
								? Math.max(
										0,
										Math.floor(
											(new Date(entry.ended_at).getTime() -
												new Date(entry.started_at).getTime()) /
												1000,
										),
									)
								: null);

						const formatted =
							durationSeconds !== null ? formatSeconds(durationSeconds) : null;

						return (
							<tr
								key={entry.id}
								className="h-8 hover:bg-surface-elevated/40 transition-colors group"
							>
								<td className="h-8 py-0 px-3 text-text-primary max-w-xs truncate align-middle">
									<span className="truncate">
										{entry.description || "No description"}
									</span>
								</td>
								<td className="h-8 py-0 px-3 text-text-secondary whitespace-nowrap align-middle">
									{linkedTicket ? (
										<span className="inline-block px-1.5 py-0.5 bg-surface-elevated/60 text-[11px] rounded-xs">
											{linkedTicket.identifier}
										</span>
									) : (
										"—"
									)}
								</td>
								<td className="h-8 py-0 px-3 text-text-muted whitespace-nowrap text-[11px] align-middle">
									<span>{new Date(entry.started_at).toLocaleDateString()}</span>{" "}
									<span className="text-text-muted/60">
										{new Date(entry.started_at).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</td>
								<td className="h-8 py-0 px-3 whitespace-nowrap align-middle">
									{isRunning ? (
										<span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-500/15 text-emerald-400 font-bold text-[11px] rounded-xs">
											<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
											<span>IN PROGRESS</span>
										</span>
									) : (
										<span
											className="font-bold text-text-primary"
											title={formatted?.digital}
										>
											{formatted?.human ?? "0s"}
										</span>
									)}
								</td>
								<td className="h-8 py-0 px-3 whitespace-nowrap align-middle">
									{entry.hourly_rate ? (
										<span className="text-text-secondary text-[11px]">
											Rate: {entry.hourly_rate}
										</span>
									) : (
										<span className="text-text-muted text-[11px]">
											Non-billable
										</span>
									)}
								</td>
								<td className="h-8 py-0 px-3 text-right whitespace-nowrap align-middle">
									<div className="inline-flex items-center space-x-1.5">
										{isRunning ? (
											<button
												type="button"
												onClick={() => stopEntryMutation.mutate(entry.id)}
												disabled={stopEntryMutation.isPending}
												className="h-6 inline-flex items-center space-x-1 px-2 text-[11px] font-bold uppercase tracking-wider bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-xs transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
												title="Stop Active Timer"
											>
												{stopEntryMutation.isPending ? (
													<Loader2 className="w-3 h-3 animate-spin" />
												) : (
													<Square className="w-3 h-3 fill-current" />
												)}
												<span>Stop</span>
											</button>
										) : null}

										<button
											type="button"
											onClick={async () => {
												const ok = await confirm({
													title: "DELETE TIME ENTRY",
													message:
														"Delete this time entry permanently? This action cannot be undone.",
													confirmText: "DELETE",
													destructive: true,
												});
												if (ok) {
													deleteEntryMutation.mutate(entry.id);
												}
											}}
											disabled={deleteEntryMutation.isPending}
											className="h-6 w-6 inline-flex items-center justify-center p-0 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xs transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
											title="Delete Time Entry"
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

export default TimeEntryTable;
