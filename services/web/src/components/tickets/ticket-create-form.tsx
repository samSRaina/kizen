import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { AuthErrorAlert } from "#/components/auth/auth-error-alert";
import { FormInput } from "#/components/ui/form-input";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import type {
	CreateTicketRequest,
	TicketPriority,
	TicketStatus,
	TicketType,
} from "#/lib/types";

export function TicketCreateForm({
	workspaceId,
	onDone,
}: {
	workspaceId: string;
	onDone: () => void;
}) {
	const queryClient = useQueryClient();
	const [title, setTitle] = useState("");
	const [type, setType] = useState<TicketType>("feature");
	const [priority, setPriority] = useState<TicketPriority>("Medium");
	const [status, setStatus] = useState<TicketStatus>("todo");
	const [description, setDescription] = useState("");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const createTicketMutation = useMutation({
		mutationFn: (newTicket: CreateTicketRequest) =>
			ticketMutations.create(workspaceId, newTicket),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
			setTitle("");
			setDescription("");
			setErrorMsg(null);
			onDone();
		},
		onError: (err) => {
			setErrorMsg(err.message || "Failed to create ticket");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg(null);
		if (!title.trim()) {
			setErrorMsg("Ticket title is required.");
			return;
		}
		createTicketMutation.mutate({
			title: title.trim(),
			type,
			priority,
			status,
			description: description.trim() || undefined,
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
			<div className="w-full max-w-lg bg-surface-base shadow-2xl rounded-xs ring-1 ring-border-default/20">
				{/* Modal Header */}
				<div className="px-6 py-4 flex items-center justify-between bg-surface-elevated/30 border-b border-border-default/15">
					<h2 className="font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
						Create New Ticket
					</h2>
					<button
						type="button"
						onClick={onDone}
						className="text-text-muted hover:text-text-primary hover:bg-surface-elevated/60 cursor-pointer p-1 rounded-xs transition-colors enabled:active:scale-[0.96]"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Modal Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<AuthErrorAlert
						message={errorMsg}
						onClear={() => setErrorMsg(null)}
					/>

					<FormInput
						id="ticket-title"
						label="TICKET TITLE *"
						type="text"
						required
						placeholder="e.g. Implement OIDC token exchange"
						value={title}
						onChange={(e) => {
							if (errorMsg) setErrorMsg(null);
							setTitle(e.target.value);
						}}
						disabled={createTicketMutation.isPending}
					/>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<div className="space-y-1.5">
							<label
								htmlFor="ticket-type"
								className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-text-secondary"
							>
								TYPE
							</label>
							<select
								id="ticket-type"
								value={type}
								onChange={(e) => setType(e.target.value as TicketType)}
								disabled={createTicketMutation.isPending}
								className="w-full px-3 py-2 text-xs bg-surface-elevated/40 hover:bg-surface-elevated/70 text-text-primary focus:outline-hidden font-mono rounded-xs transition-colors cursor-pointer"
							>
								<option value="feature">Feature</option>
								<option value="bug">Bug</option>
								<option value="task">Task</option>
							</select>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="ticket-priority"
								className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-text-secondary"
							>
								PRIORITY
							</label>
							<select
								id="ticket-priority"
								value={priority}
								onChange={(e) => setPriority(e.target.value as TicketPriority)}
								disabled={createTicketMutation.isPending}
								className="w-full px-3 py-2 text-xs bg-surface-elevated/40 hover:bg-surface-elevated/70 text-text-primary focus:outline-hidden font-mono rounded-xs transition-colors cursor-pointer"
							>
								<option value="Low">Low</option>
								<option value="Medium">Medium</option>
								<option value="High">High</option>
								<option value="Critical">Critical</option>
							</select>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="ticket-status"
								className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-text-secondary"
							>
								STATUS
							</label>
							<select
								id="ticket-status"
								value={status}
								onChange={(e) => setStatus(e.target.value as TicketStatus)}
								disabled={createTicketMutation.isPending}
								className="w-full px-3 py-2 text-xs bg-surface-elevated/40 hover:bg-surface-elevated/70 text-text-primary focus:outline-hidden font-mono rounded-xs transition-colors cursor-pointer"
							>
								<option value="backlog">Backlog</option>
								<option value="todo">Todo</option>
								<option value="progress">In Progress</option>
								<option value="review">Review</option>
								<option value="done">Done</option>
							</select>
						</div>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="ticket-desc"
							className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-text-secondary"
						>
							DESCRIPTION (OPTIONAL)
						</label>
						<textarea
							id="ticket-desc"
							rows={3}
							placeholder="Technical requirements and acceptance criteria..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={createTicketMutation.isPending}
							className="w-full px-3 py-2 text-sm bg-surface-elevated/40 focus:bg-surface-elevated/70 text-text-primary focus:outline-hidden font-mono placeholder:text-text-muted/40 transition-colors rounded-xs"
						/>
					</div>

					{/* Actions */}
					<div className="pt-3 flex justify-end items-center space-x-3">
						<button
							type="button"
							onClick={onDone}
							disabled={createTicketMutation.isPending}
							className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-elevated/60 rounded-xs transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={createTicketMutation.isPending}
							className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover enabled:active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50 rounded-xs"
						>
							{createTicketMutation.isPending ? (
								<Loader2 className="w-3.5 h-3.5 animate-spin" />
							) : (
								<Plus className="w-3.5 h-3.5" />
							)}
							<span>Create Ticket</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default TicketCreateForm;
