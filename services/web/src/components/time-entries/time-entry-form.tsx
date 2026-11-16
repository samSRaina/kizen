import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, Play, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { FormInput } from "#/components/ui/form-input";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import { timeEntryKeys, timeEntryMutations } from "#/lib/queries/time-entries";
import type {
	CreateTimeEntryRequest,
	Ticket,
	TimeEntry,
	Workspace,
} from "#/lib/types";

export function TimeEntryForm({
	workspaceId,
	workspace,
	tickets,
	activeTimer,
	preselectedTicketId,
}: {
	workspaceId: string;
	workspace: Workspace;
	tickets: Ticket[];
	activeTimer?: TimeEntry;
	preselectedTicketId?: string;
}) {
	const queryClient = useQueryClient();
	const [desc, setDesc] = useState("");
	const [selectedTicketId, setSelectedTicketId] = useState<string>(
		preselectedTicketId || "",
	);
	const [isManualMode, setIsManualMode] = useState(false);
	const [manualHours, setManualHours] = useState("1");
	const [manualMinutes, setManualMinutes] = useState("0");
	const [manualDate, setManualDate] = useState(() =>
		new Date().toISOString().slice(0, 10),
	);
	const [billable, setBillable] = useState(true);

	useEffect(() => {
		if (preselectedTicketId) {
			setSelectedTicketId(preselectedTicketId);
		}
	}, [preselectedTicketId]);

	const createTimerMutation = useMutation({
		mutationFn: (body: CreateTimeEntryRequest) =>
			timeEntryMutations.create(workspaceId, body),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: timeEntryKeys.lists(workspaceId),
			});
			setDesc("");
			setSelectedTicketId("");
		},
	});

	const handleStartTimer = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedTicketId) {
			const ticket = tickets.find((t) => t.id === selectedTicketId);
			if (ticket && ticket.status !== "progress") {
				try {
					await ticketMutations.update(workspaceId, ticket.identifier, {
						status: "progress",
					});
					queryClient.invalidateQueries({
						queryKey: ticketKeys.lists(workspaceId),
					});
				} catch (err) {
					console.error("Failed to advance ticket to progress:", err);
				}
			}
		}
		createTimerMutation.mutate({
			description: desc.trim() || undefined,
			ticket_id: selectedTicketId || undefined,
			started_at: new Date().toISOString(),
			billable,
			hourly_rate: billable ? workspace.default_hourly_rate : 0,
			is_manual: false,
			timer_state: "running",
		});
	};

	const handleManualSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const hours = Math.max(0, Number(manualHours) || 0);
		const minutes = Math.max(0, Number(manualMinutes) || 0);
		const durationSeconds = Math.max(60, hours * 3600 + minutes * 60);

		// Calculate timestamps based on chosen date
		const baseDate = manualDate
			? new Date(`${manualDate}T12:00:00Z`)
			: new Date();
		const started = new Date(baseDate.getTime() - durationSeconds * 1000);
		const ended = baseDate;

		createTimerMutation.mutate({
			description: desc.trim() || undefined,
			ticket_id: selectedTicketId || undefined,
			started_at: started.toISOString(),
			ended_at: ended.toISOString(),
			duration_seconds: durationSeconds,
			billable,
			hourly_rate: billable ? workspace.default_hourly_rate : 0,
			is_manual: true,
			timer_state: "stopped",
		});
	};

	return (
		<div className="bg-surface-base border border-border-default shadow-xs p-6 space-y-6 rounded-md transition-all">
			{/* Mode Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-subtle pb-4">
				<div>
					<h3 className="font-bold text-sm uppercase tracking-wider text-text-primary flex items-center space-x-2">
						<Clock className="w-4 h-4 text-text-muted" />
						<span>
							{isManualMode
								? "Log Manual Time Entry"
								: "Start Live Timer Session"}
						</span>
					</h3>
					{activeTimer && !isManualMode ? (
						<p className="text-xs text-amber-500 mt-0.5">
							Notice: Starting a new timer will auto-finalize and archive the
							currently active session.
						</p>
					) : null}
				</div>

				<button
					type="button"
					onClick={() => setIsManualMode((prev) => !prev)}
					className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-surface-elevated hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle rounded-md transition-colors cursor-pointer enabled:active:scale-[0.96] self-start sm:self-auto"
				>
					Switch to {isManualMode ? "Live Timer" : "Manual Log"}
				</button>
			</div>

			<form
				onSubmit={isManualMode ? handleManualSubmit : handleStartTimer}
				className="space-y-4"
			>
				<FormInput
					id="timer-desc"
					label="ACTIVITY DESCRIPTION"
					type="text"
					value={desc}
					onChange={(e) => setDesc(e.target.value)}
					placeholder="What are you working on?"
					disabled={createTimerMutation.isPending}
				/>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-1.5">
						<label
							htmlFor="timer-ticket"
							className="block text-[11px] uppercase tracking-wider font-semibold text-text-secondary"
						>
							ASSOCIATED TICKET (OPTIONAL)
						</label>
						<select
							id="timer-ticket"
							value={selectedTicketId}
							onChange={(e) => setSelectedTicketId(e.target.value)}
							disabled={createTimerMutation.isPending}
							className="w-full px-3 py-2 text-xs bg-surface-base hover:bg-surface-elevated text-text-primary border border-border-default focus:border-border-strong focus:outline-hidden cursor-pointer rounded-xs transition-colors"
						>
							<option value="">No linked ticket</option>
							{tickets.map((t) => (
								<option key={t.id} value={t.id}>
									[{t.identifier}] {t.title}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="timer-billable"
							className="block text-[11px] uppercase tracking-wider font-semibold text-text-secondary"
						>
							BILLABLE
						</label>
						<div className="flex items-center h-9">
							<label className="flex items-center space-x-2 cursor-pointer text-xs text-text-primary">
								<input
									type="checkbox"
									id="timer-billable"
									checked={billable}
									onChange={(e) => setBillable(e.target.checked)}
									className="accent-accent-yellow rounded-xs w-4 h-4 cursor-pointer"
								/>
								<span>Mark this session as billable</span>
							</label>
						</div>
					</div>
				</div>

				{isManualMode ? (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border-default/10">
						<FormInput
							id="manual-date"
							label="LOG DATE"
							type="date"
							value={manualDate}
							onChange={(e) => setManualDate(e.target.value)}
							disabled={createTimerMutation.isPending}
						/>
						<FormInput
							id="manual-hours"
							label="HOURS"
							type="number"
							min="0"
							max="24"
							value={manualHours}
							onChange={(e) => setManualHours(e.target.value)}
							disabled={createTimerMutation.isPending}
						/>
						<FormInput
							id="manual-minutes"
							label="MINUTES"
							type="number"
							min="0"
							max="59"
							value={manualMinutes}
							onChange={(e) => setManualMinutes(e.target.value)}
							disabled={createTimerMutation.isPending}
						/>
					</div>
				) : null}

				<div className="flex justify-end pt-2">
					<button
						type="submit"
						disabled={createTimerMutation.isPending}
						className="h-8 btn-kizen-primary"
					>
						{createTimerMutation.isPending ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : isManualMode ? (
							<Save className="w-3.5 h-3.5" />
						) : (
							<Play className="w-3.5 h-3.5" />
						)}
						<span>
							{isManualMode ? "Save Manual Entry" : "Start Live Timer"}
						</span>
					</button>
				</div>
			</form>
		</div>
	);
}

export default TimeEntryForm;
