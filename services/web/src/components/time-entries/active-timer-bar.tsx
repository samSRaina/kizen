import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { formatSeconds } from "#/lib/format-duration";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import { timeEntryKeys, timeEntryMutations } from "#/lib/queries/time-entries";
import type { Ticket, TimeEntry } from "#/lib/types";

interface ActiveTimerBarProps {
	workspaceId: string;
	entry: TimeEntry;
	tickets: Ticket[];
}

export function ActiveTimerBar({
	workspaceId,
	entry,
	tickets,
}: ActiveTimerBarProps) {
	const queryClient = useQueryClient();
	const isPaused = entry.timer_state === "paused";
	const isRunning =
		entry.timer_state === "running" || (!entry.ended_at && !isPaused);

	const [elapsedSeconds, setElapsedSeconds] = useState(() => {
		const accrued = entry.duration_seconds || 0;
		if (isPaused) return accrued;
		const startMs = new Date(entry.updated_at || entry.started_at).getTime();
		const currentRun = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
		return accrued + currentRun;
	});

	useEffect(() => {
		if (isPaused) {
			setElapsedSeconds(entry.duration_seconds || 0);
			return;
		}

		const accrued = entry.duration_seconds || 0;
		const startMs = new Date(entry.updated_at || entry.started_at).getTime();

		const update = () => {
			const currentRun = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
			setElapsedSeconds(accrued + currentRun);
		};

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [entry.started_at, entry.updated_at, entry.duration_seconds, isPaused]);

	const pauseMutation = useMutation({
		mutationFn: () => timeEntryMutations.pause(workspaceId, entry.id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
		},
	});

	const resumeMutation = useMutation({
		mutationFn: () => timeEntryMutations.resume(workspaceId, entry.id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
		},
	});

	const stopMutation = useMutation({
		mutationFn: async () => {
			const stopped = await timeEntryMutations.stop(workspaceId, entry.id);
			if (entry.ticket_id) {
				const linked = tickets.find((t) => t.id === entry.ticket_id);
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
			return stopped;
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

	const linkedTicket = tickets.find((t) => t.id === entry.ticket_id);
	const { digital } = formatSeconds(elapsedSeconds);

	return (
		<div className="ghost-card flex-row-between flex-wrap-gap">
			<div className="flex-row-center">
				<span className="badge-tag flex-row-center font-bold">
					{isRunning && (
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
					)}
					{isRunning ? "Running" : "❚❚ Paused"}
				</span>
				<span className="text-title-md font-mono">{digital}</span>
				{linkedTicket ? (
					<div className="flex-row-center">
						<span className="badge-tag font-mono">
							{linkedTicket.identifier}
						</span>
						<span className="text-muted-sm truncate-text max-w-xs">
							{linkedTicket.title}
						</span>
					</div>
				) : (
					<span className="text-muted-sm">
						{entry.description || "General timer"}
					</span>
				)}
				{entry.hourly_rate ? (
					<span className="badge-tag">${entry.hourly_rate}/hr</span>
				) : null}
			</div>

			<div className="flex-row-center">
				{isRunning && (
					<button
						type="button"
						disabled={pauseMutation.isPending}
						onClick={() => pauseMutation.mutate()}
						className="ghost-btn-sm"
						title="Pause timer"
					>
						{pauseMutation.isPending ? "Pausing..." : "❚❚ Pause"}
					</button>
				)}

				{isPaused && (
					<button
						type="button"
						disabled={resumeMutation.isPending}
						onClick={() => resumeMutation.mutate()}
						className="ghost-btn-sm font-semibold text-emerald-600"
						title="Resume timer"
					>
						{resumeMutation.isPending ? "Resuming..." : "▶ Resume"}
					</button>
				)}

				<button
					type="button"
					disabled={stopMutation.isPending}
					onClick={() => stopMutation.mutate()}
					className="ghost-btn-sm ghost-btn-danger font-semibold"
					title="Stop timer (moves ticket to In Review)"
				>
					{stopMutation.isPending ? "Stopping..." : "■ Stop"}
				</button>
			</div>
		</div>
	);
}

export default ActiveTimerBar;
