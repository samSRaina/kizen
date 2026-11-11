import { ArrowRight, Check, Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "#/components/ui/confirm-dialog";
import type { Ticket, TicketStatus } from "#/lib/types";
import { ALL_STATUS_OPTIONS } from "./types";

interface TicketContextMenuProps {
	ticket: Ticket;
	onMoveStatus: (newStatus: TicketStatus) => void;
	onDelete: () => void;
	children?: React.ReactNode;
}

export function TicketContextMenu({
	ticket,
	onMoveStatus,
	onDelete,
	children,
}: TicketContextMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
	const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);
	const [copied, setCopied] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const confirm = useConfirm();

	// Close on outside click
	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsOpen(false);
				setMenuPos(null);
				setShowMoveSubmenu(false);
			}
		};
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsOpen(false);
				setMenuPos(null);
				setShowMoveSubmenu(false);
			}
		};

		window.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setMenuPos({ x: e.clientX, y: e.clientY });
		setIsOpen(true);
		setShowMoveSubmenu(false);
	};

	const handleCopyId = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(ticket.identifier);
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
				setIsOpen(false);
			}, 600);
		} catch {
			// Fallback
			setIsOpen(false);
		}
	};

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsOpen(false);
		const ok = await confirm({
			title: "DELETE TICKET",
			message: `Delete ticket "${ticket.identifier}"? This action cannot be undone.`,
			confirmText: "DELETE",
			destructive: true,
		});
		if (ok) {
			onDelete();
		}
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: context menu handler wrapper
		<div onContextMenu={handleContextMenu} className="relative">
			{children}

			{/* Trigger Button if rendered standalone */}
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					setMenuPos(null);
					setIsOpen(!isOpen);
					setShowMoveSubmenu(false);
				}}
				className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary hover:bg-surface-elevated/70 rounded-xs transition-all cursor-pointer"
				title="Ticket actions"
			>
				<MoreHorizontal className="w-3.5 h-3.5" />
			</button>

			{/* Context / Dropdown Menu */}
			{isOpen ? (
				<div
					ref={menuRef}
					style={
						menuPos
							? {
									position: "fixed",
									top: Math.min(menuPos.y, window.innerHeight - 250),
									left: Math.min(menuPos.x, window.innerWidth - 220),
								}
							: undefined
					}
					className={`z-50 w-48 bg-surface-base font-mono text-xs shadow-2xl py-1 rounded-xs ring-1 ring-border-default/20 ${
						!menuPos ? "absolute right-0 top-full mt-1" : ""
					}`}
				>
					{/* Header with ticket identifier */}
					<div className="px-3 py-1.5 border-b border-border-default/15 text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center justify-between">
						<span>{ticket.identifier}</span>
						<span className="text-[9px] uppercase px-1.5 py-0.5 bg-surface-elevated/60 rounded-xs">
							{ticket.status}
						</span>
					</div>

					{/* Move to Column Submenu trigger */}
					{/* biome-ignore lint/a11y/noStaticElementInteractions: submenu hover trigger */}
					<div
						className="relative"
						onMouseEnter={() => setShowMoveSubmenu(true)}
						onMouseLeave={() => setShowMoveSubmenu(false)}
					>
						<button
							type="button"
							onClick={() => setShowMoveSubmenu(!showMoveSubmenu)}
							className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-elevated/70 text-text-primary text-left cursor-pointer transition-colors"
						>
							<div className="flex items-center gap-2">
								<ArrowRight className="w-3.5 h-3.5 text-text-muted" />
								<span>Move to column</span>
							</div>
							<span className="text-[10px] text-text-muted">›</span>
						</button>

						{/* Submenu of statuses */}
						{showMoveSubmenu ? (
							<div className="absolute left-full top-0 -ml-1 w-44 bg-surface-base font-mono text-xs shadow-2xl py-1 rounded-xs ring-1 ring-border-default/20">
								{ALL_STATUS_OPTIONS.map((col) => {
									const isCurrent = ticket.status === col.key;
									return (
										<button
											key={col.key}
											type="button"
											disabled={isCurrent}
											onClick={(e) => {
												e.stopPropagation();
												onMoveStatus(col.key);
												setIsOpen(false);
											}}
											className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer ${
												isCurrent
													? "opacity-40 cursor-default bg-surface-elevated/30"
													: "hover:bg-surface-elevated/70 text-text-primary"
											}`}
										>
											<div className="flex items-center gap-2">
												<span
													className={`w-2 h-2 rounded-full ${col.dotColor}`}
												/>
												<span className="capitalize">{col.label}</span>
											</div>
											{isCurrent ? (
												<Check className="w-3 h-3 text-text-muted" />
											) : null}
										</button>
									);
								})}
							</div>
						) : null}
					</div>

					{/* Copy Identifier */}
					<button
						type="button"
						onClick={handleCopyId}
						className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-elevated/70 text-text-primary text-left cursor-pointer transition-colors"
					>
						<Copy className="w-3.5 h-3.5 text-text-muted" />
						<span>{copied ? "Copied!" : "Copy ID"}</span>
					</button>

					<div className="border-t border-border-default/15 my-1" />

					{/* Delete Ticket */}
					<button
						type="button"
						onClick={handleDelete}
						className="w-full flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-red-500/10 text-left cursor-pointer transition-colors"
					>
						<Trash2 className="w-3.5 h-3.5 text-red-400" />
						<span>Delete</span>
					</button>
				</div>
			) : null}
		</div>
	);
}
