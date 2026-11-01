import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, Play, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { FormInput } from "#/components/ui/form-input";
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
	const [manualMinutes, setManualMinutes] = useState("60");
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

	const handleStartTimer = (e: React.FormEvent) => {
		e.preventDefault();
		createTimerMutation.mutate({
			description: desc.trim() || undefined,
			ticket_id: selectedTicketId || undefined,
			started_at: new Date().toISOString(),
			billable,
		});
	};

	const handleManualSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const now = new Date();
		const durationSeconds = (Number(manualMinutes) || 60) * 60;
		const started = new Date(now.getTime() - durationSeconds * 1000);

		createTimerMutation.mutate({
			description: desc.trim() || undefined,
			ticket_id: selectedTicketId || undefined,
			started_at: started.toISOString(),
			ended_at: now.toISOString(),
			duration_seconds: durationSeconds,
			billable,
			hourly_rate: workspace.default_hourly_rate,
		});
	};

	return (
		<div className="border border-border-default bg-surface-base p-6 space-y-6">
			{/* Mode Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-default pb-4">
				<div>
					<h3 className="font-bold text-sm uppercase tracking-wider text-text-primary font-mono flex items-center space-x-2">
						<Clock className="w-4 h-4 text-text-muted" />
						<span>
							{isManualMode ? "Log Manual Entry" : "Start Live Session"}
						</span>
					</h3>
					{activeTimer ? (
						<p className="text-xs text-amber-500 font-mono mt-0.5">
							Notice: An active timer is already running for this workspace.
						</p>
					) : null}
				</div>

				<button
					type="button"
					onClick={() => setIsManualMode((prev) => !prev)}
					className="px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider border border-border-default hover:bg-surface-hover text-text-secondary transition-colors cursor-pointer enabled:active:scale-[0.96] self-start sm:self-auto"
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
							className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-text-secondary"
						>
							ASSOCIATED TICKET (OPTIONAL)
						</label>
						<select
							id="timer-ticket"
							value={selectedTicketId}
							onChange={(e) => setSelectedTicketId(e.target.value)}
							disabled={createTimerMutation.isPending}
							className="w-full px-3 py-2 text-xs bg-surface-elevated/40 border border-border-default text-text-primary focus:outline-hidden focus:border-text-primary font-mono cursor-pointer"
						>
							<option value="">None / General</option>
							{tickets.map((t) => (
								<option key={t.id} value={t.id}>
									[{t.identifier}] {t.title}
								</option>
							))}
						</select>
					</div>

					{isManualMode ? (
						<FormInput
							id="timer-duration"
							label="DURATION (MINUTES)"
							type="text"
							inputMode="numeric"
							value={manualMinutes}
							onChange={(e) => setManualMinutes(e.target.value)}
							disabled={createTimerMutation.isPending}
							required
						/>
					) : (
						<div className="flex items-center pt-6">
							<label className="flex items-center space-x-2.5 font-mono text-xs text-text-secondary cursor-pointer">
								<input
									type="checkbox"
									checked={billable}
									onChange={(e) => setBillable(e.target.checked)}
									className="w-4 h-4 bg-surface-elevated border border-border-default text-accent-primary rounded-none focus:ring-0 focus:ring-offset-0 cursor-pointer accent-accent-primary"
								/>
								<span className="text-[11px] tracking-wide">
									BILLABLE (RATE: {workspace.default_hourly_rate}/HR)
								</span>
							</label>
						</div>
					)}
				</div>

				{isManualMode ? (
					<div className="pt-2">
						<label className="flex items-center space-x-2.5 font-mono text-xs text-text-secondary cursor-pointer">
							<input
								type="checkbox"
								checked={billable}
								onChange={(e) => setBillable(e.target.checked)}
								className="w-4 h-4 bg-surface-elevated border border-border-default text-accent-primary rounded-none focus:ring-0 focus:ring-offset-0 cursor-pointer accent-accent-primary"
							/>
							<span className="text-[11px] tracking-wide">
								BILLABLE AT WORKSPACE RATE ({workspace.default_hourly_rate}/HR)
							</span>
						</label>
					</div>
				) : null}

				<div className="pt-2 flex justify-end">
					<button
						type="submit"
						disabled={createTimerMutation.isPending}
						className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover enabled:active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50"
					>
						{createTimerMutation.isPending ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : isManualMode ? (
							<Save className="w-3.5 h-3.5" />
						) : (
							<Play className="w-3.5 h-3.5 fill-current" />
						)}
						<span>{isManualMode ? "Save Log Entry" : "Start Live Timer"}</span>
					</button>
				</div>
			</form>
		</div>
	);
}

export default TimeEntryForm;
