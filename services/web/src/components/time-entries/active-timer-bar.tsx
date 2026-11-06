import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Square, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { formatSeconds } from "#/lib/format-duration";
import { timeEntryKeys, timeEntryMutations } from "#/lib/queries/time-entries";
import type { Ticket, TimeEntry } from "#/lib/types";

export function ActiveTimerBar({
	workspaceId,
	entry,
	tickets,
}: {
	workspaceId: string;
	entry: TimeEntry;
	tickets: Ticket[];
}) {
	const queryClient = useQueryClient();
	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	useEffect(() => {
		const startMs = new Date(entry.started_at).getTime();
		const update = () => {
			setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
		};
		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [entry.started_at]);

	const stopMutation = useMutation({
		mutationFn: () => timeEntryMutations.stop(workspaceId, entry.id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
		},
	});

	const linkedTicket = tickets.find((t) => t.id === entry.ticket_id);
	const { digital } = formatSeconds(elapsedSeconds);

	return (
		<div className="border border-border-strong bg-surface-elevated p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-xs shadow-sm">
			<div className="flex items-center space-x-3.5">
				<div className="relative flex items-center justify-center shrink-0">
					<span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping absolute opacity-75" />
					<span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" />
				</div>

				<div className="space-y-0.5">
					<div className="flex items-center space-x-2">
						<span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-800/80">
							ACTIVE SESSION
						</span>
						<span className="font-bold text-text-primary text-base tracking-wider font-mono">
							{digital}
						</span>
					</div>

					<div className="flex items-center space-x-2 text-text-muted text-[11px]">
						{linkedTicket ? (
							<span className="inline-flex items-center space-x-1 text-text-secondary">
								<Tag className="w-3 h-3" />
								<span className="font-bold">{linkedTicket.identifier}</span>
								<span>—</span>
								<span className="truncate max-w-xs">{linkedTicket.title}</span>
							</span>
						) : (
							<span>{entry.description || "General session"}</span>
						)}

						{entry.hourly_rate ? (
							<>
								<span>•</span>
								<span>Rate: {entry.hourly_rate}</span>
							</>
						) : null}
					</div>
				</div>
			</div>

			<button
				type="button"
				disabled={stopMutation.isPending}
				onClick={() => stopMutation.mutate()}
				className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50 self-start sm:self-auto"
			>
				{stopMutation.isPending ? (
					<Loader2 className="w-3.5 h-3.5 animate-spin" />
				) : (
					<Square className="w-3.5 h-3.5 fill-current" />
				)}
				<span>Stop Timer</span>
			</button>
		</div>
	);
}

export default ActiveTimerBar;
