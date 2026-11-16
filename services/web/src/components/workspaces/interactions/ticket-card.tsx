import { Play } from "lucide-react";
import type { Ticket, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getPriorityMeta } from "./priority";
import { TicketContextMenu } from "./ticket-context-menu";

interface TicketCardProps {
	ticket: Ticket;
	isTracking?: boolean;
	onClick: () => void;
	onStartTimer?: () => void;
	onStatusChange?: (newStatus: TicketStatus) => void;
	onDelete?: () => void;
	onDragStart?: (e: React.DragEvent) => void;
	onDragEnd?: (e: React.DragEvent) => void;
}

export function TicketCard({
	ticket,
	isTracking = false,
	onClick,
	onStartTimer,
	onStatusChange,
	onDelete,
	onDragStart,
	onDragEnd,
}: TicketCardProps) {
	const priorityMeta = getPriorityMeta(ticket.priority);

	return (
		<TicketContextMenu
			ticket={ticket}
			isTracking={isTracking}
			onStartTimer={onStartTimer}
			onStatusChange={onStatusChange}
			onDelete={onDelete}
		>
			{/* biome-ignore lint/a11y/useSemanticElements: interactive ticket card container with nested timer action */}
			<div
				role="button"
				tabIndex={0}
				draggable
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				onClick={onClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick();
					}
				}}
				className={cn(
					"group relative flex flex-col gap-2 p-3 rounded-xs bg-surface-base border border-border-default shadow-xs hover:border-text-primary hover:shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing text-left select-none font-mono",
					isTracking &&
						"border-emerald-500/80 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] bg-emerald-500/5",
				)}
			>
				{/* Header: Identifier & Priority Badge */}
				<div className="flex items-center justify-between gap-2">
					<span className="font-mono text-xs font-bold text-text-primary tracking-tight">
						{ticket.identifier}
					</span>
					<span
						className={cn(
							"px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider",
							priorityMeta.badgeClass,
						)}
					>
						{priorityMeta.label}
					</span>
				</div>

				{/* Title */}
				<p className="text-xs font-sans font-semibold text-text-primary line-clamp-2 leading-snug">
					{ticket.title}
				</p>

				{/* Footer: Tags or Timer Trigger */}
				<div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border-subtle/60 text-[10px] font-mono text-text-muted">
					<span className="uppercase font-bold tracking-wider">
						{ticket.type}
					</span>

					<div className="flex items-center gap-1.5">
						{onStartTimer && !isTracking && ticket.status !== "done" && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onStartTimer();
								}}
								className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-surface-elevated hover:bg-surface-hover border border-border-default text-text-secondary hover:text-text-primary transition-all cursor-pointer font-bold uppercase text-[9px]"
								title="Start focus timer"
							>
								<Play className="size-2.5 fill-current text-emerald-600" />
								<span>Track</span>
							</button>
						)}

						{isTracking && (
							<span className="inline-flex items-center gap-1 font-bold text-emerald-600 uppercase text-[10px]">
								<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
								Tracking
							</span>
						)}
					</div>
				</div>
			</div>
		</TicketContextMenu>
	);
}

export default TicketCard;
