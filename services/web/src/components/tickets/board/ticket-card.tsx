import {
	Bug,
	CheckSquare,
	Clock,
	GripVertical,
	Layers,
	Loader2,
	Square,
} from "lucide-react";
import type {
	Ticket,
	TicketPriority,
	TicketStatus,
	TimeEntry,
} from "#/lib/types";
import { cn } from "#/lib/utils";
import { TicketContextMenu } from "./ticket-context-menu";

interface TicketCardProps {
	ticket: Ticket;
	workspaceId: string;
	activeTimer?: TimeEntry;
	onStartTimer: (ticketId: string) => void;
	onStopTimer: (timeEntryId: string) => void;
	isStoppingTimer?: boolean;
	onMoveStatus: (newStatus: TicketStatus) => void;
	onDelete: () => void;
	isDragging?: boolean;
	onDragStart?: (e: React.DragEvent) => void;
	onDragEnd?: (e: React.DragEvent) => void;
}

export function TicketCard({
	ticket,
	activeTimer,
	onStartTimer,
	onStopTimer,
	isStoppingTimer = false,
	onMoveStatus,
	onDelete,
	isDragging = false,
	onDragStart,
	onDragEnd,
}: TicketCardProps) {
	const isTrackingThis = activeTimer?.ticket_id === ticket.id;
	const isTimerPaused = isTrackingThis && activeTimer?.timer_state === "paused";

	const getPriorityBadgeClass = (priority: TicketPriority) => {
		switch (priority) {
			case "Critical":
				return "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/25";
			case "High":
				return "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/25";
			case "Medium":
				return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25";
			case "Low":
				return "bg-surface-elevated text-text-secondary border border-border-subtle";
			default:
				return "bg-surface-elevated text-text-secondary border border-border-subtle";
		}
	};

	const renderTypeIcon = () => {
		switch (ticket.type) {
			case "feature":
				return <Layers className="w-3 h-3 text-purple-400 shrink-0" />;
			case "bug":
				return <Bug className="w-3 h-3 text-red-400 shrink-0" />;
			default:
				return <CheckSquare className="w-3 h-3 text-blue-400 shrink-0" />;
		}
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: draggable card container
		<div
			draggable
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			className={cn(
				"group relative bg-surface-base hover:bg-surface-hover/80 p-3 transition-all duration-150 border border-border-default hover:border-border-strong shadow-xs hover:shadow-sm select-none cursor-grab active:cursor-grabbing rounded-md",
				isDragging && "opacity-30 scale-[0.98]",
				isTrackingThis &&
					(isTimerPaused
						? "ring-2 ring-amber-500/80 bg-amber-500/10 border-amber-500/50"
						: "ring-2 ring-emerald-500/80 bg-emerald-500/10 border-emerald-500/50"),
			)}
		>
			{/* Header: Grip, Identifier, Type Icon, Actions Menu */}
			<div className="flex items-center justify-between gap-1.5 mb-2">
				<div className="flex items-center gap-1.5 min-w-0">
					<GripVertical className="w-3 h-3 text-text-muted/30 group-hover:text-text-muted shrink-0 -ml-1 transition-colors" />
					<span className="text-[11px] font-bold text-text-secondary tracking-wider truncate">
						{ticket.identifier}
					</span>
					{isTrackingThis ? (
						isTimerPaused ? (
							<span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[9px] font-bold rounded-xs">
								<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
								<span>PAUSED</span>
							</span>
						) : (
							<span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[9px] font-bold rounded-xs">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								<span>LIVE</span>
							</span>
						)
					) : null}
				</div>

				<div className="flex items-center gap-1">
					<div title={`Type: ${ticket.type}`} className="flex items-center">
						{renderTypeIcon()}
					</div>
					<TicketContextMenu
						ticket={ticket}
						onMoveStatus={onMoveStatus}
						onDelete={onDelete}
					/>
				</div>
			</div>

			{/* Title */}
			<h4 className="text-xs font-semibold text-text-primary leading-snug break-words mb-1">
				{ticket.title}
			</h4>

			{/* Description preview */}
			{ticket.description ? (
				<p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed mb-2.5">
					{ticket.description}
				</p>
			) : (
				<div className="mb-2" />
			)}

			{/* Tags if any */}
			{ticket.tags && ticket.tags.length > 0 ? (
				<div className="flex flex-wrap gap-1 mb-2">
					{ticket.tags.map((tag) => (
						<span
							key={tag}
							className="px-1.5 py-0.5 text-[9px] font-medium bg-surface-elevated text-text-secondary border border-border-subtle rounded-xs"
						>
							#{tag}
						</span>
					))}
				</div>
			) : null}

			{/* Footer: Priority Badge, Points, Time Tracker Quick Action */}
			<div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle text-[10px]">
				<div className="flex items-center gap-1.5">
					<span
						className={`px-1.5 py-0.5 uppercase font-bold rounded-xs ${getPriorityBadgeClass(
							ticket.priority,
						)}`}
					>
						{ticket.priority}
					</span>

					{typeof ticket.points === "number" && ticket.points > 0 ? (
						<span
							title="Story Points"
							className="px-1.5 py-0.5 text-text-secondary bg-surface-elevated border border-border-subtle rounded-xs"
						>
							{ticket.points} pt{ticket.points !== 1 ? "s" : ""}
						</span>
					) : null}
				</div>

				{/* Time Tracking Action Button */}
				<div>
					{isTrackingThis && activeTimer ? (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onStopTimer(activeTimer.id);
							}}
							disabled={isStoppingTimer}
							className="inline-flex items-center gap-1 px-2 py-0.5 font-bold uppercase tracking-wider bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-xs transition-colors cursor-pointer disabled:opacity-50"
							title="Stop tracking time on this ticket"
						>
							{isStoppingTimer ? (
								<Loader2 className="w-2.5 h-2.5 animate-spin" />
							) : (
								<Square className="w-2.5 h-2.5 fill-current" />
							)}
							<span>Stop</span>
						</button>
					) : (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onStartTimer(ticket.id);
							}}
							className="inline-flex items-center gap-1 px-2 py-0.5 font-bold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-elevated/80 rounded-xs transition-colors cursor-pointer"
							title="Start tracking time on this ticket"
						>
							<Clock className="w-2.5 h-2.5 text-text-muted" />
							<span>Track</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export default TicketCard;
