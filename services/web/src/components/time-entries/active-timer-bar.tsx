import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Square } from "lucide-react";
import { useEffect, useState } from "react";
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
	const hours = Math.floor(elapsedSeconds / 3600);
	const minutes = Math.floor((elapsedSeconds % 3600) / 60);
	const seconds = elapsedSeconds % 60;
	const timeFormatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

	return (
		<div className="border border-border-strong bg-surface-elevated p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-xs">
			<div className="flex items-center space-x-3">
				<span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse-subtle shrink-0" />
				<div>
					<span className="font-bold text-text-primary text-sm tracking-wider mr-2">
						{timeFormatted}
					</span>
					<span className="text-text-muted">
						{linkedTicket
							? `[${linkedTicket.identifier}] ${linkedTicket.title}`
							: entry.description || "General session"}
					</span>
				</div>
			</div>

			<button
				type="button"
				disabled={stopMutation.isPending}
				onClick={() => stopMutation.mutate()}
				className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
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
