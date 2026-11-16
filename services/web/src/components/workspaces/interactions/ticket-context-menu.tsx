import { Play, Trash2 } from "lucide-react";
import type React from "react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Ticket, TicketStatus } from "@/lib/types";
import { ALL_STATUSES, getStatusLabel } from "./view-utils";

interface TicketContextMenuProps {
	ticket: Ticket;
	isTracking?: boolean;
	children: React.ReactNode;
	onStartTimer?: () => void;
	onStatusChange?: (newStatus: TicketStatus) => void;
	onDelete?: () => void;
}

export function TicketContextMenu({
	ticket,
	isTracking = false,
	children,
	onStartTimer,
	onStatusChange,
	onDelete,
}: TicketContextMenuProps) {
	return (
		<ContextMenu>
			<ContextMenuTrigger>{children}</ContextMenuTrigger>
			<ContextMenuContent className="w-52">
				{onStartTimer && !isTracking && ticket.status !== "done" && (
					<ContextMenuItem onClick={onStartTimer} className="cursor-pointer">
						<Play className="mr-2 size-4 text-emerald-600 fill-current" />
						<span>Start Focus Session</span>
					</ContextMenuItem>
				)}

				<ContextMenuSub>
					<ContextMenuSubTrigger className="cursor-pointer">
						<span>Move to Status</span>
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-40">
						{ALL_STATUSES.map((status) => (
							<ContextMenuItem
								key={status}
								disabled={status === ticket.status}
								onClick={() => onStatusChange?.(status)}
								className="cursor-pointer"
							>
								<span>{getStatusLabel(status)}</span>
							</ContextMenuItem>
						))}
					</ContextMenuSubContent>
				</ContextMenuSub>

				{onDelete && (
					<>
						<ContextMenuSeparator />
						<ContextMenuItem
							onClick={onDelete}
							className="text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 cursor-pointer"
						>
							<Trash2 className="mr-2 size-4" />
							<span>Delete Ticket</span>
						</ContextMenuItem>
					</>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
}

export default TicketContextMenu;
