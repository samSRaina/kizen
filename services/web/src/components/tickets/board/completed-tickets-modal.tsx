import {
	AlertCircle,
	Bug,
	CheckSquare,
	Copy,
	Layers,
	RotateCcw,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useConfirm } from "#/components/ui/confirm-dialog";
import type { Ticket, TicketPriority, TicketStatus } from "#/lib/types";

interface CompletedTicketsModalProps {
	isOpen: boolean;
	onClose: () => void;
	workspaceId: string;
	tickets: Ticket[];
	onReopen: (identifier: string, targetStatus: TicketStatus) => void;
	onDelete: (identifier: string) => void;
}

export function CompletedTicketsModal({
	isOpen,
	onClose,
	tickets,
	onReopen,
	onDelete,
}: CompletedTicketsModalProps) {
	const confirm = useConfirm();
	const [copiedId, setCopiedId] = useState<string | null>(null);

	// Close on Escape key
	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const handleCopyId = async (identifier: string) => {
		try {
			await navigator.clipboard.writeText(identifier);
			setCopiedId(identifier);
			setTimeout(() => setCopiedId(null), 800);
		} catch {
			// fallback
		}
	};

	const handleDelete = async (ticket: Ticket) => {
		const ok = await confirm({
			title: "DELETE COMPLETED TICKET",
			message: `Permanently delete ticket "${ticket.identifier}"? This cannot be undone.`,
			confirmText: "DELETE",
			destructive: true,
		});
		if (ok) {
			onDelete(ticket.identifier);
		}
	};

	const getPriorityBadgeClass = (priority: TicketPriority) => {
		switch (priority) {
			case "Critical":
				return "bg-red-500/15 text-red-400";
			case "High":
				return "bg-orange-500/15 text-orange-400";
			case "Medium":
				return "bg-yellow-500/15 text-yellow-400";
			default:
				return "bg-surface-elevated/70 text-text-muted";
		}
	};

	const renderTypeIcon = (type: string) => {
		switch (type) {
			case "feature":
				return <Layers className="w-3 h-3 text-purple-400 shrink-0" />;
			case "bug":
				return <Bug className="w-3 h-3 text-red-400 shrink-0" />;
			default:
				return <CheckSquare className="w-3 h-3 text-blue-400 shrink-0" />;
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
			<div className="w-full max-w-3xl bg-surface-base shadow-2xl rounded-xs flex flex-col max-h-[85vh] ring-1 ring-border-default/20">
				{/* Modal Header */}
				<div className="px-6 py-4 flex items-center justify-between bg-surface-elevated/30 border-b border-border-default/15">
					<div className="flex items-center space-x-3">
						<span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
						<h2 className="font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
							Completed Tickets (DONE)
						</h2>
						<span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-xs">
							{tickets.length}
						</span>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="text-text-muted hover:text-text-primary hover:bg-surface-elevated/60 cursor-pointer p-1 rounded-xs transition-colors enabled:active:scale-[0.96]"
						title="Close"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Modal Content / Ticket List */}
				<div className="p-6 overflow-y-auto space-y-2.5 font-mono">
					{tickets.length === 0 ? (
						<div className="py-16 px-6 bg-surface-elevated/15 text-center text-text-muted font-mono text-xs space-y-2 rounded-xs">
							<AlertCircle className="w-5 h-5 mx-auto text-text-muted/60" />
							<p className="uppercase">No completed tickets found</p>
							<p className="text-[11px] text-text-muted/70">
								Move tickets to DONE from the board context menu or drop them on
								the Completed button.
							</p>
						</div>
					) : (
						tickets.map((t) => (
							<div
								key={t.id}
								className="bg-surface-elevated/30 hover:bg-surface-elevated/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xs transition-colors"
							>
								{/* Left: Info */}
								<div className="space-y-1.5 min-w-0 flex-1">
									<div className="flex items-center space-x-2">
										<span className="text-xs font-bold text-text-primary tracking-wider">
											{t.identifier}
										</span>
										<div title={`Type: ${t.type}`}>
											{renderTypeIcon(t.type)}
										</div>
										<span
											className={`px-1.5 py-0.2 text-[9px] uppercase font-bold rounded-xs ${getPriorityBadgeClass(
												t.priority,
											)}`}
										>
											{t.priority}
										</span>
										{typeof t.points === "number" && t.points > 0 ? (
											<span className="text-[9px] px-1.5 py-0.2 bg-surface-elevated/70 text-text-muted rounded-xs">
												{t.points} pts
											</span>
										) : null}
										<span className="inline-flex items-center space-x-1 px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 text-[9px] font-bold rounded-xs">
											DONE
										</span>
									</div>

									<h4 className="text-xs font-semibold text-text-primary line-clamp-1">
										{t.title}
									</h4>

									{t.description ? (
										<p className="text-[11px] text-text-muted line-clamp-1">
											{t.description}
										</p>
									) : null}
								</div>

								{/* Right: Actions */}
								<div className="flex items-center space-x-1.5 self-start sm:self-center shrink-0">
									{/* Reopen Action */}
									<button
										type="button"
										onClick={() => onReopen(t.identifier, "review")}
										className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-surface-elevated/60 hover:bg-surface-elevated text-text-primary rounded-xs transition-colors cursor-pointer"
										title="Reopen ticket to IN REVIEW"
									>
										<RotateCcw className="w-3 h-3 text-amber-400" />
										<span>Reopen</span>
									</button>

									{/* Copy ID */}
									<button
										type="button"
										onClick={() => handleCopyId(t.identifier)}
										className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-xs transition-colors cursor-pointer"
										title="Copy Identifier"
									>
										<Copy className="w-3.5 h-3.5" />
										{copiedId === t.identifier ? (
											<span className="sr-only">Copied</span>
										) : null}
									</button>

									{/* Delete */}
									<button
										type="button"
										onClick={() => handleDelete(t)}
										className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xs transition-colors cursor-pointer"
										title="Delete ticket permanently"
									>
										<Trash2 className="w-3.5 h-3.5 text-red-400" />
									</button>
								</div>
							</div>
						))
					)}
				</div>

				{/* Modal Footer */}
				<div className="border-t border-border-default/15 px-6 py-3 flex items-center justify-between bg-surface-elevated/30 font-mono text-[11px] text-text-muted">
					<span>FINISHED TICKETS ARCHIVE</span>
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-surface-elevated/60 hover:bg-surface-elevated text-text-primary rounded-xs transition-colors cursor-pointer"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

export default CompletedTicketsModal;
