import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMatches } from "@tanstack/react-router";
import { Pause, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { formatSeconds } from "@/lib/format-duration";
import { ticketKeys } from "@/lib/queries/tickets";
import {
	timeEntryKeys,
	timeEntryMutations,
	timeEntryQueries,
} from "@/lib/queries/time-entries";

export function HeaderActiveTimer() {
	const matches = useMatches();
	const queryClient = useQueryClient();

	const workspaceMatch = matches.find(
		(m) =>
			m.routeId.includes("/workspaces/$workspaceId") ||
			m.pathname.startsWith("/workspaces/"),
	);
	const currentWorkspaceId = (
		workspaceMatch?.params as { workspaceId?: string }
	)?.workspaceId;

	const { data: entries = [] } = useQuery({
		...timeEntryQueries.list(currentWorkspaceId || ""),
		enabled: Boolean(currentWorkspaceId),
	});

	const activeEntry = entries.find(
		(e) =>
			e.timer_state === "running" ||
			e.timer_state === "paused" ||
			(!e.ended_at && !e.is_manual),
	);

	const isPaused = activeEntry?.timer_state === "paused";
	const isRunning =
		activeEntry?.timer_state === "running" ||
		(!activeEntry?.ended_at && !isPaused);

	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	useEffect(() => {
		if (!activeEntry) {
			setElapsedSeconds(0);
			return;
		}

		const accrued = activeEntry.duration_seconds || 0;
		if (isPaused) {
			setElapsedSeconds(accrued);
			return;
		}

		const startMs = new Date(
			activeEntry.updated_at || activeEntry.started_at,
		).getTime();
		const update = () => {
			const currentRun = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
			setElapsedSeconds(accrued + currentRun);
		};

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [activeEntry, isPaused]);

	const pauseMutation = useMutation({
		mutationFn: () => {
			if (!currentWorkspaceId || !activeEntry)
				throw new Error("No active timer");
			return timeEntryMutations.pause(currentWorkspaceId, activeEntry.id);
		},
		onSuccess: () => {
			if (!currentWorkspaceId) return;
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(currentWorkspaceId),
			});
		},
	});

	const resumeMutation = useMutation({
		mutationFn: () => {
			if (!currentWorkspaceId || !activeEntry)
				throw new Error("No active timer");
			return timeEntryMutations.resume(currentWorkspaceId, activeEntry.id);
		},
		onSuccess: () => {
			if (!currentWorkspaceId) return;
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(currentWorkspaceId),
			});
		},
	});

	const stopMutation = useMutation({
		mutationFn: () => {
			if (!currentWorkspaceId || !activeEntry)
				throw new Error("No active timer");
			return timeEntryMutations.stop(currentWorkspaceId, activeEntry.id);
		},
		onSuccess: () => {
			if (!currentWorkspaceId) return;
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(currentWorkspaceId),
			});
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(currentWorkspaceId),
			});
		},
	});

	if (!activeEntry) return null;

	const { digital } = formatSeconds(elapsedSeconds);

	return (
		<div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-elevated border border-border-default text-xs shadow-2xs">
			<span className="flex items-center gap-1.5 font-medium">
				{isRunning && (
					<span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
				)}
				{isPaused && <span className="size-2 rounded-full bg-amber-500" />}
				<span className="font-mono font-bold text-text-primary">{digital}</span>
			</span>

			<div className="flex items-center gap-1 border-l border-border-subtle pl-2">
				{isRunning && (
					<button
						type="button"
						onClick={() => pauseMutation.mutate()}
						disabled={pauseMutation.isPending}
						className="p-1 text-text-muted hover:text-text-primary rounded-sm transition-colors cursor-pointer"
						title="Pause focus session"
					>
						<Pause className="size-3" />
					</button>
				)}
				{isPaused && (
					<button
						type="button"
						onClick={() => resumeMutation.mutate()}
						disabled={resumeMutation.isPending}
						className="p-1 text-emerald-600 hover:text-emerald-500 rounded-sm transition-colors cursor-pointer"
						title="Resume focus session"
					>
						<Play className="size-3" />
					</button>
				)}
				<button
					type="button"
					onClick={() => stopMutation.mutate()}
					disabled={stopMutation.isPending}
					className="p-1 text-red-600 hover:text-red-500 rounded-sm transition-colors cursor-pointer"
					title="Stop focus session"
				>
					<Square className="size-3" />
				</button>
			</div>
		</div>
	);
}

export default HeaderActiveTimer;
