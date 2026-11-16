import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { formatSeconds } from "#/lib/format-duration";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import { timeEntryKeys, timeEntryMutations } from "#/lib/queries/time-entries";
import type {
	CreateTimeEntryRequest,
	Ticket,
	TimeEntry,
	UpdateTicketRequest,
} from "#/lib/types";

interface TimeEntryTableProps {
	workspaceId: string;
	tickets: Ticket[];
	entries: TimeEntry[];
}

export function TimeEntryTable({
	workspaceId,
	tickets,
	entries,
}: TimeEntryTableProps) {
	const queryClient = useQueryClient();

	const pauseMutation = useMutation({
		mutationFn: (id: string) => timeEntryMutations.pause(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
		},
	});

	const resumeMutation = useMutation({
		mutationFn: (id: string) => timeEntryMutations.resume(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
		},
	});

	const stopMutation = useMutation({
		mutationFn: (id: string) => timeEntryMutations.stop(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
	});

	const createMutation = useMutation({
		mutationFn: (req: CreateTimeEntryRequest) =>
			timeEntryMutations.create(workspaceId, req),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
		},
	});

	const updateTicketMutation = useMutation({
		mutationFn: ({
			identifier,
			data,
		}: {
			identifier: string;
			data: UpdateTicketRequest;
		}) => ticketMutations.update(workspaceId, identifier, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
		},
	});

	// Ticking clock for running timers
	const [nowMs, setNowMs] = useState(Date.now());
	const hasRunning = entries.some(
		(e) =>
			e.timer_state === "running" ||
			(!e.ended_at && e.timer_state !== "paused"),
	);

	useEffect(() => {
		if (!hasRunning) return;
		const interval = setInterval(() => {
			setNowMs(Date.now());
		}, 1000);
		return () => clearInterval(interval);
	}, [hasRunning]);

	// Expanded state for ticket dropdowns
	const [expandedTicketIds, setExpandedTicketIds] = useState<
		Record<string, boolean>
	>({});

	const toggleExpand = (ticketId: string) => {
		setExpandedTicketIds((prev) => ({
			...prev,
			[ticketId]: !prev[ticketId],
		}));
	};

	// Manual Log Time Form State
	const [selectedTicketId, setSelectedTicketId] = useState("");
	const [hours, setHours] = useState("");
	const [minutes, setMinutes] = useState("");
	const [logDate, setLogDate] = useState(() =>
		new Date().toISOString().slice(0, 10),
	);
	const [logError, setLogError] = useState("");

	const handleLogManualTime = (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedTicketId) {
			setLogError("A ticket must be selected to log manual time.");
			return;
		}

		const hrs = Number.parseInt(hours, 10) || 0;
		const mins = Number.parseInt(minutes, 10) || 0;
		const totalSeconds = hrs * 3600 + mins * 60;

		if (totalSeconds <= 0) {
			setLogError("Please enter a valid time duration (hours or minutes).");
			return;
		}

		setLogError("");
		const startTime = new Date(
			logDate ? `${logDate}T12:00:00` : new Date().toISOString(),
		);
		const endTime = new Date(startTime.getTime() + totalSeconds * 1000);

		createMutation.mutate(
			{
				ticket_id: selectedTicketId,
				duration_seconds: totalSeconds,
				started_at: startTime.toISOString(),
				ended_at: endTime.toISOString(),
				billable: true,
				is_manual: true,
				timer_state: "stopped",
			},
			{
				onSuccess: () => {
					setHours("");
					setMinutes("");
					setLogError("");
					setExpandedTicketIds((prev) => ({
						...prev,
						[selectedTicketId]: true,
					}));
				},
				onError: (err) => {
					setLogError(
						err instanceof Error ? err.message : "Failed to log time.",
					);
				},
			},
		);
	};

	const getEntryDurationSeconds = (entry: TimeEntry) => {
		const isPaused = entry.timer_state === "paused";
		const isRunning =
			entry.timer_state === "running" ||
			(!entry.ended_at && !isPaused && !entry.is_manual);

		if (isPaused) {
			return entry.duration_seconds || 0;
		}
		if (isRunning) {
			const startMs = new Date(entry.updated_at || entry.started_at).getTime();
			const liveElapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000));
			return (entry.duration_seconds || 0) + liveElapsed;
		}
		return entry.duration_seconds || 0;
	};

	const handleStopSession = (session: TimeEntry) => {
		stopMutation.mutate(session.id, {
			onSuccess: () => {
				if (session.ticket_id) {
					const linkedTicket = tickets.find((t) => t.id === session.ticket_id);
					if (linkedTicket && linkedTicket.status === "progress") {
						updateTicketMutation.mutate({
							identifier: linkedTicket.identifier,
							data: { status: "review" },
						});
					}
				}
			},
		});
	};

	// Group entries by ticket
	const entriesByTicket = new Map<string, TimeEntry[]>();
	for (const entry of entries) {
		const tId = entry.ticket_id || "general";
		const list = entriesByTicket.get(tId) || [];
		list.push(entry);
		entriesByTicket.set(tId, list);
	}

	const ticketsWithTime = tickets.filter(
		(t) => (entriesByTicket.get(t.id) || []).length > 0,
	);

	const totalWorkspaceSeconds = entries.reduce(
		(sum, e) => sum + getEntryDurationSeconds(e),
		0,
	);

	return (
		<div className="flex-col-gap-md">
			{/* Manual Log Time Form */}
			<section className="ghost-card flex-col-gap-sm">
				<div className="text-title-sm">Log Manual Time</div>
				<p className="text-muted-xs">
					Record past focus sessions directly against a ticket.
				</p>

				{logError && <div className="error-banner">{logError}</div>}

				<form onSubmit={handleLogManualTime} className="flex-col-gap-sm">
					<div className="flex-wrap-gap">
						<div className="flex-1-min">
							<label htmlFor="log-ticket-select" className="auth-label">
								Ticket *
							</label>
							<select
								id="log-ticket-select"
								value={selectedTicketId}
								onChange={(e) => setSelectedTicketId(e.target.value)}
								className="ghost-select w-full"
								required
							>
								<option value="">Select a ticket to log time against...</option>
								{tickets.map((t) => (
									<option key={t.id} value={t.id}>
										[{t.identifier}] {t.title}
									</option>
								))}
							</select>
						</div>

						<div className="w-24">
							<label htmlFor="log-hours" className="auth-label">
								Hours
							</label>
							<input
								id="log-hours"
								type="number"
								min="0"
								max="240"
								placeholder="0"
								value={hours}
								onChange={(e) => setHours(e.target.value)}
								className="ghost-input"
							/>
						</div>

						<div className="w-24">
							<label htmlFor="log-minutes" className="auth-label">
								Minutes
							</label>
							<input
								id="log-minutes"
								type="number"
								min="0"
								max="59"
								placeholder="0"
								value={minutes}
								onChange={(e) => setMinutes(e.target.value)}
								className="ghost-input"
							/>
						</div>

						<div className="w-36">
							<label htmlFor="log-date" className="auth-label">
								Date
							</label>
							<input
								id="log-date"
								type="date"
								value={logDate}
								onChange={(e) => setLogDate(e.target.value)}
								className="ghost-input"
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={createMutation.isPending}
							className="ghost-btn font-semibold"
						>
							{createMutation.isPending ? "Logging..." : "Log Time"}
						</button>
					</div>
				</form>
			</section>

			{/* Total Workspace Time Header */}
			<div className="flex-row-between text-muted-xs uppercase tracking-wider">
				<span>Tickets Tracked</span>
				<span className="font-semibold text-text-primary">
					Total Time: {formatSeconds(totalWorkspaceSeconds).digital}
				</span>
			</div>

			{/* Ticket Grouped Time Entries */}
			{ticketsWithTime.length === 0 ? (
				<div className="empty-state">
					No time tracked in this workspace yet. Start a focus session from an
					in-progress ticket on the Board or log manual time above.
				</div>
			) : (
				<div className="flex-col-gap-sm">
					{ticketsWithTime.map((ticket) => {
						const ticketEntries = entriesByTicket.get(ticket.id) || [];
						const ticketTotalSeconds = ticketEntries.reduce(
							(sum, e) => sum + getEntryDurationSeconds(e),
							0,
						);
						const isExpanded = Boolean(expandedTicketIds[ticket.id]);
						const isCurrentlyTracking = ticketEntries.some(
							(e) =>
								e.timer_state === "running" ||
								(!e.ended_at && e.timer_state !== "paused"),
						);
						const hasPaused = ticketEntries.some(
							(e) => e.timer_state === "paused",
						);

						return (
							<div key={ticket.id} className="track-ticket-card">
								{/* biome-ignore lint/a11y/noStaticElementInteractions: accordion header */}
								<div
									onClick={() => toggleExpand(ticket.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											toggleExpand(ticket.id);
										}
									}}
									className="track-ticket-header"
								>
									<div className="flex-row-center flex-1-min">
										<span className="badge-tag font-mono text-xs">
											{ticket.identifier}
										</span>
										<span className="text-title-sm font-semibold truncate-text">
											{ticket.title}
										</span>
										<span className="badge-tag capitalize text-xs">
											{ticket.status.replace("_", " ")}
										</span>
										{isCurrentlyTracking && (
											<span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-xs">
												<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
												Running
											</span>
										)}
										{hasPaused && (
											<span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-xs">
												❚❚ Paused
											</span>
										)}
									</div>

									<div className="flex-row-center">
										<span className="font-mono text-sm font-bold text-text-primary mr-2">
											{formatSeconds(ticketTotalSeconds).digital}
										</span>
										<span className="text-muted-xs">
											{ticketEntries.length}{" "}
											{ticketEntries.length === 1 ? "session" : "sessions"}
										</span>
										<span className="text-subtle-xs ml-1 font-mono">
											{isExpanded ? "▲" : "▼"}
										</span>
									</div>
								</div>

								{/* Dropdown showing all timers started against this ticket */}
								{isExpanded && (
									<div className="track-sessions-dropdown">
										{ticketEntries.map((session) => {
											const sessionDuration = getEntryDurationSeconds(session);
											const isSessionRunning =
												session.timer_state === "running" ||
												(!session.ended_at && session.timer_state !== "paused");
											const isSessionPaused = session.timer_state === "paused";

											return (
												<div key={session.id} className="track-session-item">
													<div className="flex-row-center flex-1-min">
														{isSessionRunning ? (
															<span className="badge-tag text-emerald-600 font-bold flex-row-center">
																<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
																Running
															</span>
														) : isSessionPaused ? (
															<span className="badge-tag text-amber-600 font-bold">
																❚❚ Paused
															</span>
														) : (
															<span className="badge-tag">✓ Completed</span>
														)}

														<span className="text-muted-xs">
															Started:{" "}
															{new Date(session.started_at).toLocaleString([], {
																month: "short",
																day: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															})}
														</span>
													</div>

													<div className="flex-row-center">
														<span className="font-mono text-xs font-bold mr-2">
															{formatSeconds(sessionDuration).digital}
														</span>

														{/* Pause / Resume / Stop Controls */}
														{isSessionRunning && (
															<>
																<button
																	type="button"
																	onClick={() =>
																		pauseMutation.mutate(session.id)
																	}
																	disabled={pauseMutation.isPending}
																	className="ghost-btn-sm"
																	title="Pause timer"
																>
																	❚❚ Pause
																</button>
																<button
																	type="button"
																	onClick={() => handleStopSession(session)}
																	disabled={stopMutation.isPending}
																	className="ghost-btn-sm ghost-btn-danger font-semibold"
																	title="Stop timer (moves ticket to In Review)"
																>
																	■ Stop
																</button>
															</>
														)}

														{isSessionPaused && (
															<>
																<button
																	type="button"
																	onClick={() =>
																		resumeMutation.mutate(session.id)
																	}
																	disabled={resumeMutation.isPending}
																	className="ghost-btn-sm font-semibold text-emerald-600"
																	title="Resume timer"
																>
																	▶ Resume
																</button>
																<button
																	type="button"
																	onClick={() => handleStopSession(session)}
																	disabled={stopMutation.isPending}
																	className="ghost-btn-sm ghost-btn-danger"
																	title="Stop timer (moves ticket to In Review)"
																>
																	■ Stop
																</button>
															</>
														)}
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default TimeEntryTable;
