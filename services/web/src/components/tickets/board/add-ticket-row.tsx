import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SmoothInput } from "#/components/ui/smooth-input";
import { ticketKeys, ticketMutations } from "#/lib/queries/tickets";
import type {
	Ticket,
	TicketPriority,
	TicketStatus,
	TicketType,
} from "#/lib/types";

interface AddTicketRowProps {
	workspaceId: string;
	status: TicketStatus;
	onCreated?: (ticket: Ticket) => void;
}

export function AddTicketRow({
	workspaceId,
	status,
	onCreated,
}: AddTicketRowProps) {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [type, setType] = useState<TicketType>("task");
	const [priority, setPriority] = useState<TicketPriority>("Medium");
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen) {
			inputRef.current?.focus();
		}
	}, [isOpen]);

	const createMutation = useMutation({
		mutationFn: () =>
			ticketMutations.create(workspaceId, {
				title: title.trim(),
				type,
				priority,
				status,
			}),
		onSuccess: (newTicket) => {
			queryClient.invalidateQueries({
				queryKey: ticketKeys.lists(workspaceId),
			});
			setTitle("");
			setError(null);
			setIsOpen(false);
			onCreated?.(newTicket);
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : "Failed to create ticket");
		},
	});

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!title.trim()) {
			setError("Title required");
			return;
		}
		createMutation.mutate();
	};

	const handleCancel = () => {
		setTitle("");
		setError(null);
		setIsOpen(false);
	};

	if (!isOpen) {
		return (
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="w-full h-8 flex items-center justify-center gap-1.5 px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-elevated/70 rounded-xs transition-all cursor-pointer group"
			>
				<Plus className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
				<span>Add Ticket</span>
			</button>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-surface-base shadow-lg p-2.5 space-y-2.5 font-mono text-xs rounded-xs"
		>
			<div className="flex items-center justify-between gap-2">
				<span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
					New {status} ticket
				</span>
				<button
					type="button"
					onClick={handleCancel}
					className="text-text-muted hover:text-text-primary hover:bg-surface-elevated/60 p-0.5 rounded-xs cursor-pointer transition-colors"
					title="Cancel"
				>
					<X className="w-3.5 h-3.5" />
				</button>
			</div>

			<SmoothInput
				ref={inputRef}
				type="text"
				value={title}
				onChange={(e) => {
					if (error) setError(null);
					setTitle(e.target.value);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						handleSubmit();
					} else if (e.key === "Escape") {
						e.preventDefault();
						handleCancel();
					}
				}}
				placeholder="Ticket title..."
				disabled={createMutation.isPending}
				wrapperClassName="h-8 bg-surface-elevated/40 focus-within:bg-surface-elevated/80 px-2.5 rounded-xs transition-colors flex items-center"
				className="text-xs"
			/>

			{error ? (
				<p className="text-[10px] text-red-400 font-bold uppercase">{error}</p>
			) : null}

			<div className="flex items-center justify-between gap-2 pt-1">
				<div className="flex items-center gap-1.5">
					<select
						value={type}
						onChange={(e) => setType(e.target.value as TicketType)}
						disabled={createMutation.isPending}
						className="h-6 bg-surface-elevated/40 hover:bg-surface-elevated/70 px-2 text-[10px] uppercase font-mono cursor-pointer focus:outline-hidden rounded-xs transition-colors inline-flex items-center"
					>
						<option value="task">Task</option>
						<option value="feature">Feature</option>
						<option value="bug">Bug</option>
					</select>

					<select
						value={priority}
						onChange={(e) => setPriority(e.target.value as TicketPriority)}
						disabled={createMutation.isPending}
						className="h-6 bg-surface-elevated/40 hover:bg-surface-elevated/70 px-2 text-[10px] uppercase font-mono cursor-pointer focus:outline-hidden rounded-xs transition-colors inline-flex items-center"
					>
						<option value="Low">Low</option>
						<option value="Medium">Medium</option>
						<option value="High">High</option>
						<option value="Critical">Critical</option>
					</select>
				</div>

				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={handleCancel}
						className="h-6 px-2 inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-elevated/60 rounded-xs transition-colors cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={createMutation.isPending || !title.trim()}
						className="h-6 px-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover disabled:opacity-50 rounded-xs transition-colors cursor-pointer"
					>
						{createMutation.isPending ? (
							<Loader2 className="w-3 h-3 animate-spin" />
						) : (
							<Plus className="w-3 h-3" />
						)}
						<span>Add</span>
					</button>
				</div>
			</div>
		</form>
	);
}
