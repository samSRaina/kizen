import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import type { TicketPriority, TicketStatus } from "@/lib/types";
import { PRIORITY_LEVELS } from "./priority";

interface AddTicketRowProps {
	status: TicketStatus;
	onAdd: (title: string, priority: TicketPriority) => Promise<void>;
}

export function AddTicketRow({ status, onAdd }: AddTicketRowProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [priority, setPriority] = useState<TicketPriority>("Low");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleOpen = () => {
		setIsOpen(true);
		setTimeout(() => inputRef.current?.focus(), 30);
	};

	const handleClose = () => {
		setIsOpen(false);
		setTitle("");
		setPriority("Low");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = title.trim();
		if (!trimmed || isSubmitting) return;

		setIsSubmitting(true);
		try {
			await onAdd(trimmed, priority);
			setTitle("");
			setPriority("Low");
			inputRef.current?.focus();
		} catch (err) {
			console.error("Failed to add ticket:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) {
		return (
			<button
				type="button"
				onClick={handleOpen}
				className="w-full h-8 flex items-center justify-center gap-1.5 px-3 rounded-xs border border-dashed border-border-default hover:border-text-primary bg-surface-base hover:bg-surface-elevated text-xs font-mono font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors cursor-pointer"
			>
				<Plus className="size-3.5" />
				<span>Add Ticket</span>
			</button>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-2 p-2.5 rounded-xs bg-surface-base border border-border-default shadow-xs font-mono"
		>
			<input
				ref={inputRef}
				type="text"
				placeholder={`Ticket title for ${status}...`}
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				disabled={isSubmitting}
				className="w-full h-7 px-2 text-xs font-mono rounded-xs border border-border-default bg-surface-base text-text-primary placeholder:text-text-muted focus:border-text-primary outline-none"
			/>

			<div className="flex items-center justify-between gap-2 pt-1">
				<select
					value={priority}
					onChange={(e) => setPriority(e.target.value as TicketPriority)}
					disabled={isSubmitting}
					className="h-7 px-2 text-xs font-mono font-bold uppercase rounded-xs border border-border-default bg-surface-base text-text-primary focus:border-text-primary outline-none cursor-pointer"
				>
					{PRIORITY_LEVELS.map((p) => (
						<option key={p.value} value={p.value}>
							{p.label.toUpperCase()}
						</option>
					))}
				</select>

				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={handleClose}
						disabled={isSubmitting}
						className="h-7 px-2 text-text-muted hover:text-text-primary rounded-xs hover:bg-surface-elevated transition-colors cursor-pointer text-xs"
						title="Cancel"
					>
						<X className="size-3.5" />
					</button>
					<button
						type="submit"
						disabled={!title.trim() || isSubmitting}
						className="h-7 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xs bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
					>
						{isSubmitting ? "Adding..." : "Add"}
					</button>
				</div>
			</div>
		</form>
	);
}

export default AddTicketRow;
