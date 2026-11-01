import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useConfirm } from "#/components/ui/confirm-dialog";
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
						<th className="py-3 px-4 font-semibold">Date</th>
						<th className="py-3 px-4 font-semibold">Duration</th>
						<th className="py-3 px-4 font-semibold">Rate</th>
						<th className="py-3 px-4 font-semibold text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border-default font-mono text-xs">
					{entries.map((entry) => {
						const linkedTicket = tickets.find((t) => t.id === entry.ticket_id);
						const durationMins = entry.duration_seconds
							? Math.round(entry.duration_seconds / 60)
							: null;
						const durationHours = durationMins
							? (durationMins / 60).toFixed(1)
							: null;

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
									{new Date(entry.started_at).toLocaleDateString()}
								</td>
								<td className="py-3 px-4 text-text-primary whitespace-nowrap font-bold">
									{durationHours ? `${durationHours}h` : "In Progress"}
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
