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
			<div className="py-12 px-6 border border-dashed border-border-default bg-surface-base/50 text-center text-text-muted font-mono text-xs">
				NO TIME ENTRIES RECORDED FOR THIS WORKSPACE
			</div>
		);
	}

	return (
		<div className="border border-border-default bg-surface-base overflow-x-auto">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="border-b border-border-default bg-surface-elevated/40 text-[11px] font-mono uppercase tracking-wider text-text-muted">
						<th className="py-3 px-4 font-semibold">Description</th>
						<th className="py-3 px-4 font-semibold">Ticket</th>
						<th className="py-3 px-4 font-semibold">Date & Time</th>
						<th className="py-3 px-4 font-semibold">Duration</th>
						<th className="py-3 px-4 font-semibold">Rate</th>
						<th className="py-3 px-4 font-semibold text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border-default font-mono text-xs">
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
								className="hover:bg-surface-hover/60 transition-colors group"
							>
								<td className="py-3 px-4 text-text-primary max-w-xs truncate">
									{entry.description || "No description"}
								</td>
								<td className="py-3 px-4 text-text-secondary whitespace-nowrap">
									{linkedTicket ? (
										<span className="inline-block px-1.5 py-0.5 bg-surface-sunken border border-border-subtle text-[11px]">
											{linkedTicket.identifier}
										</span>
									) : (
										"—"
									)}
								</td>
								<td className="py-3 px-4 text-text-muted whitespace-nowrap text-[11px]">
									<span>{new Date(entry.started_at).toLocaleDateString()}</span>{" "}
									<span className="text-text-muted/60">
										{new Date(entry.started_at).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</td>
								<td className="py-3 px-4 whitespace-nowrap">
									{isRunning ? (
										<span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/80 font-bold text-[11px]">
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
								<td className="py-3 px-4 whitespace-nowrap">
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
								<td className="py-3 px-4 text-right whitespace-nowrap">
									<div className="inline-flex items-center space-x-1.5">
										{isRunning ? (
											<button
												type="button"
												onClick={() => stopEntryMutation.mutate(entry.id)}
												disabled={stopEntryMutation.isPending}
												className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] font-bold uppercase tracking-wider bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
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
											className="p-1 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
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
