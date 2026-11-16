import { Play } from "lucide-react";
import type { Ticket, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getPriorityMeta } from "./priority";
import { TicketContextMenu } from "./ticket-context-menu";
import { DEFAULT_COLUMNS } from "./view-utils";

interface ListViewProps {
	tickets: Ticket[];
	activeTimerTicketId?: string | null;
	onSelectTicket: (ticket: Ticket) => void;
	onStartTimer?: (ticketId: string) => void;
	onStatusChange: (
		ticketIdentifier: string,
		newStatus: TicketStatus,
	) => Promise<void>;
	onDeleteTicket: (ticketIdentifier: string) => Promise<void>;
}

export function ListView({
	tickets,
	activeTimerTicketId,
	onSelectTicket,
	onStartTimer,
	onStatusChange,
	onDeleteTicket,
}: ListViewProps) {
	if (tickets.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center p-8 text-center rounded-xs border border-dashed border-border-default bg-surface-base text-text-muted text-xs font-mono uppercase tracking-wider">
				No tickets match your filters.
			</div>
		);
	}

	return (
		<div className="flex-1 h-full min-h-0 overflow-y-auto flex flex-col gap-5 p-1 select-none font-mono">
			{DEFAULT_COLUMNS.map((col) => {
				const groupTickets = tickets.filter((t) => t.status === col.id);
				if (groupTickets.length === 0) return null;

				return (
					<div key={col.id} className="flex flex-col gap-2">
						{/* Group Header */}
						<div className="flex items-center gap-2 px-1">
							<span
								className="size-2 rounded-xs"
								style={{ backgroundColor: col.dotColor }}
							/>
							<span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
								{col.title}
							</span>
							<span className="text-[11px] font-mono font-bold text-text-muted">
								({groupTickets.length})
							</span>
						</div>

						{/* Brutalist Table / List Container */}
						<div className="rounded-xs border border-border-default bg-surface-base overflow-hidden shadow-2xs divide-y divide-border-default">
							{groupTickets.map((ticket) => {
								const priorityMeta = getPriorityMeta(ticket.priority);
								const isTracking = activeTimerTicketId === ticket.id;

								return (
									<TicketContextMenu
										key={ticket.id}
										ticket={ticket}
										isTracking={isTracking}
										onStartTimer={
											onStartTimer ? () => onStartTimer(ticket.id) : undefined
										}
										onStatusChange={(newStatus) =>
											onStatusChange(ticket.identifier, newStatus)
										}
										onDelete={() => onDeleteTicket(ticket.identifier)}
									>
										{/* biome-ignore lint/a11y/useSemanticElements: interactive ticket row with nested track button */}
										<div
											role="button"
											tabIndex={0}
											onClick={() => onSelectTicket(ticket)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													onSelectTicket(ticket);
												}
											}}
											className={cn(
												"group flex items-center justify-between gap-4 px-4 py-2 text-xs hover:bg-surface-elevated/60 transition-colors cursor-pointer text-left select-none font-mono",
												isTracking && "bg-emerald-500/5",
											)}
										>
											<div className="flex items-center gap-3 min-w-0 flex-1">
												<span className="font-mono font-bold text-text-primary shrink-0 w-16">
													{ticket.identifier}
												</span>
												<span className="font-sans font-medium text-text-primary truncate">
													{ticket.title}
												</span>
											</div>

											<div className="flex items-center gap-3 shrink-0">
												<span
													className={cn(
														"px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider",
														priorityMeta.badgeClass,
													)}
												>
													{priorityMeta.label}
												</span>

												{onStartTimer &&
													!isTracking &&
													ticket.status !== "done" && (
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																onStartTimer(ticket.id);
															}}
															className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-0.5 rounded-xs bg-surface-elevated hover:bg-surface-hover border border-border-default text-text-secondary hover:text-text-primary transition-all cursor-pointer font-bold uppercase text-[9px]"
														>
															<Play className="size-2.5 fill-current text-emerald-600" />
															<span>Track</span>
														</button>
													)}

												{isTracking && (
													<span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase">
														<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
														Tracking
													</span>
												)}
											</div>
										</div>
									</TicketContextMenu>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default ListView;
