import { Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Ticket, TicketPriority, TicketStatus } from "@/lib/types";
import { PRIORITY_LEVELS } from "./priority";
import { ALL_STATUSES, getStatusLabel } from "./view-utils";

interface TicketDetailModalProps {
	ticket: Ticket | null;
	isOpen: boolean;
	onClose: () => void;
	onUpdate: (
		identifier: string,
		data: {
			title?: string;
			description?: string;
			status?: TicketStatus;
			priority?: TicketPriority;
		},
	) => Promise<void>;
	onDelete?: (identifier: string) => Promise<void>;
	onStartTimer?: (ticketId: string) => void;
}

export function TicketDetailModal({
	ticket,
	isOpen,
	onClose,
	onUpdate,
	onDelete,
	onStartTimer,
}: TicketDetailModalProps) {
	const [title, setTitle] = useState(ticket?.title || "");
	const [description, setDescription] = useState(ticket?.description || "");
	const [status, setStatus] = useState<TicketStatus>(
		ticket?.status || "backlog",
	);
	const [priority, setPriority] = useState<TicketPriority>(
		ticket?.priority || "Low",
	);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (ticket) {
			setTitle(ticket.title);
			setDescription(ticket.description || "");
			setStatus(ticket.status);
			setPriority(ticket.priority);
		}
	}, [ticket]);

	if (!ticket) return null;

	const handleSave = async () => {
		if (!title.trim() || isSaving) return;
		setIsSaving(true);
		try {
			await onUpdate(ticket.identifier, {
				title: title.trim(),
				description: description.trim(),
				status,
				priority,
			});
			onClose();
		} catch (err) {
			console.error("Failed to update ticket:", err);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!onDelete || isDeleting) return;
		if (!window.confirm("Are you sure you want to delete this ticket?")) return;
		setIsDeleting(true);
		try {
			await onDelete(ticket.identifier);
			onClose();
		} catch (err) {
			console.error("Failed to delete ticket:", err);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-surface-base border border-border-default rounded-xs shadow-2xl font-mono text-xs">
				{/* Header */}
				<DialogHeader className="px-5 py-3 border-b border-border-default bg-surface-elevated/40">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<span className="font-mono text-xs font-bold text-text-primary px-2 py-0.5 rounded-xs bg-surface-base border border-border-default">
								{ticket.identifier}
							</span>
							<DialogTitle className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
								Ticket Details
							</DialogTitle>
						</div>

						{onStartTimer && ticket.status !== "done" && (
							<button
								type="button"
								onClick={() => {
									onStartTimer(ticket.id);
									onClose();
								}}
								className="h-7 inline-flex items-center gap-1.5 px-2.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20 border border-emerald-600/20 transition-colors cursor-pointer"
							>
								<Play className="size-2.5 fill-current" />
								<span>Track Time</span>
							</button>
						)}
					</div>
					<DialogDescription className="text-[11px] font-mono text-text-muted mt-0.5">
						Update properties and information for this ticket.
					</DialogDescription>
				</DialogHeader>

				{/* Body Content */}
				<div className="p-5 flex flex-col gap-4">
					{/* Title */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="ticket-modal-title"
							className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted"
						>
							Title
						</label>
						<input
							id="ticket-modal-title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Ticket title"
							className="h-8 px-3 text-xs font-mono rounded-xs border border-border-default bg-surface-base text-text-primary focus:border-text-primary outline-none"
						/>
					</div>

					{/* Metadata Row: Status & Priority */}
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="ticket-modal-status"
								className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted"
							>
								Status
							</label>
							<select
								id="ticket-modal-status"
								value={status}
								onChange={(e) => setStatus(e.target.value as TicketStatus)}
								className="h-8 px-2.5 text-xs font-mono font-bold uppercase rounded-xs border border-border-default bg-surface-base text-text-primary focus:border-text-primary outline-none cursor-pointer"
							>
								{ALL_STATUSES.map((st) => (
									<option key={st} value={st}>
										{getStatusLabel(st).toUpperCase()}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="ticket-modal-priority"
								className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted"
							>
								Priority
							</label>
							<select
								id="ticket-modal-priority"
								value={priority}
								onChange={(e) => setPriority(e.target.value as TicketPriority)}
								className="h-8 px-2.5 text-xs font-mono font-bold uppercase rounded-xs border border-border-default bg-surface-base text-text-primary focus:border-text-primary outline-none cursor-pointer"
							>
								{PRIORITY_LEVELS.map((p) => (
									<option key={p.value} value={p.value}>
										{p.label.toUpperCase()}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Description */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="ticket-modal-desc"
							className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted"
						>
							Description
						</label>
						<textarea
							id="ticket-modal-desc"
							rows={5}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add description..."
							className="px-3 py-2 text-xs font-mono rounded-xs border border-border-default bg-surface-base text-text-primary focus:border-text-primary outline-none resize-none leading-relaxed"
						/>
					</div>
				</div>

				{/* Footer */}
				<DialogFooter className="px-5 py-3 border-t border-border-default bg-surface-elevated/40 flex items-center justify-between">
					{onDelete ? (
						<button
							type="button"
							onClick={handleDelete}
							disabled={isDeleting}
							className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-red-500 hover:text-red-400 cursor-pointer"
						>
							<Trash2 className="size-3.5" />
							<span>{isDeleting ? "Deleting..." : "Delete Ticket"}</span>
						</button>
					) : (
						<div />
					)}

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onClose}
							className="h-8 px-3.5 text-xs font-mono font-bold uppercase rounded-xs border border-border-default text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors cursor-pointer"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSave}
							disabled={!title.trim() || isSaving}
							className="h-8 px-4 text-xs font-mono font-bold uppercase tracking-wider rounded-xs bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
						>
							{isSaving ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default TicketDetailModal;
