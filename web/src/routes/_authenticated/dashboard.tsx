import {
	BellIcon,
	ChartBarIcon,
	CheckIcon,
	ChevronDownIcon,
	EllipsisHorizontalIcon,
	FunnelIcon,
	ListBulletIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Popout } from "@/components/app-shell/popout";
import SidebarRight from "@/components/app-shell/sidebar-right";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BoardView } from "@/components/workspaces/interactions/board-view";

type Ticket = {
	id: string;
	title: string;
	type: "feature" | "bug" | "task";
	priority: "High" | "Medium" | "Low";
	points: number;
	assignee: string;
	label?: string;
};
type Column = { key: string; title: string; tone: string };

const columns: Column[] = [
	{ key: "backlog", title: "Backlog", tone: "#9a9a94" },
	{ key: "todo", title: "To do", tone: "#6d75ce" },
	{ key: "progress", title: "In progress", tone: "#d7975c" },
	{ key: "review", title: "In review", tone: "#9b7ec6" },
	{ key: "done", title: "Done", tone: "#6da488" },
];

const seedTickets: Record<string, Ticket[]> = {
	backlog: [
		{
			id: "ZED-241",
			title: "Add keyboard shortcut map to command palette",
			type: "feature",
			priority: "Low",
			points: 3,
			assignee: "JD",
		},
		{
			id: "ZED-238",
			title: "Research shared project permissions",
			type: "task",
			priority: "Medium",
			points: 5,
			assignee: "MK",
			label: "research",
		},
	],
	todo: [
		{
			id: "ZED-232",
			title: "Improve empty states for new workspaces",
			type: "feature",
			priority: "Medium",
			points: 3,
			assignee: "JD",
		},
		{
			id: "ZED-229",
			title: "Fix command palette focus on open",
			type: "bug",
			priority: "High",
			points: 2,
			assignee: "AL",
		},
		{
			id: "ZED-224",
			title: "Create release notes template",
			type: "task",
			priority: "Low",
			points: 1,
			assignee: "RM",
		},
	],
	progress: [
		{
			id: "ZED-219",
			title: "Build native sprint timeline view",
			type: "feature",
			priority: "High",
			points: 8,
			assignee: "JD",
			label: "frontend",
		},
		{
			id: "ZED-216",
			title: "Sync ticket activity to team feed",
			type: "feature",
			priority: "Medium",
			points: 5,
			assignee: "MK",
		},
	],
	review: [
		{
			id: "ZED-210",
			title: "Add project members and roles",
			type: "feature",
			priority: "Medium",
			points: 5,
			assignee: "AL",
		},
		{
			id: "ZED-207",
			title: "Refine board density on smaller screens",
			type: "bug",
			priority: "Low",
			points: 3,
			assignee: "JD",
			label: "polish",
		},
	],
	done: [
		{
			id: "ZED-201",
			title: "Set up Northwind Retail workspace",
			type: "task",
			priority: "Low",
			points: 2,
			assignee: "JD",
		},
		{
			id: "ZED-198",
			title: "Add drag and drop ticket states",
			type: "feature",
			priority: "High",
			points: 5,
			assignee: "RM",
		},
		{
			id: "ZED-193",
			title: "Create sprint planning shell",
			type: "feature",
			priority: "Medium",
			points: 3,
			assignee: "MK",
		},
	],
};

function Logo() {
	return (
		<div className="zed-mini-logo">
			<span>Z</span>zed
			<i />
		</div>
	);
}
function Avatar({
	initials,
	className = "",
}: {
	initials: string;
	className?: string;
}) {
	return <span className={`avatar ${className}`}>{initials}</span>;
}

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: Dashboard,
});

function Dashboard() {
	const [workspaces, setWorkspaces] = useState([
		["Northwind Retail", "23", "#6257d8"],
		["Halcyon Goods", "9", "#686bd9"],
		["Fernhollow Labs", "14", "#7485ed"],
		["Orso Studio", "5", "#8b9aff"],
	]);
	const [activeWorkspace, setActiveWorkspace] = useState("Northwind Retail");
	const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
	const [workspaceInputValue, setWorkspaceInputValue] = useState("");

	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (isEditingWorkspace && inputRef.current) {
			setWorkspaceInputValue(activeWorkspace);
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditingWorkspace, activeWorkspace]);
	const [activeView, setActiveView] = useState<"board" | "list">("board");
	const [activeFilter, setActiveFilter] = useState("All tickets");
	const [query, setQuery] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [tickets, setIssues] = useState(seedTickets);
	const [toast, setToast] = useState("");
	const sprintProgress = 17;

	const visibleTickets = useMemo(
		() =>
			Object.fromEntries(
				Object.entries(tickets).map(([key, list]) => [
					key,
					list.filter(
						(i) =>
							!query ||
							`${i.id} ${i.title}`.toLowerCase().includes(query.toLowerCase()),
					),
				]),
			),
		[tickets, query],
	);
	const onMoveTicket = (
		sourceCol: string,
		sourceIndex: number,
		targetCol: string,
		targetIndex?: number,
	) => {
		setIssues((prev) => {
			const next = { ...prev };
			const ticketToMove = next[sourceCol][sourceIndex];
			next[sourceCol] = next[sourceCol].filter((_, i) => i !== sourceIndex);

			if (targetIndex !== undefined) {
				next[targetCol] = [
					...next[targetCol].slice(0, targetIndex),
					ticketToMove,
					...next[targetCol].slice(targetIndex),
				];
			} else {
				next[targetCol] = [...next[targetCol], ticketToMove];
			}
			return next;
		});
		setToast(`Ticket moved`);
		setTimeout(() => setToast(""), 2000);
	};

	return (
		<div className="app-shell">
			<header className="app-topbar">
				<div className="app-brand flex items-center gap-2">
					<Logo />
					<span className="crumb text-muted-foreground">/</span>
					{isEditingWorkspace ? (
						<input
							ref={inputRef}
							type="text"
							value={workspaceInputValue}
							onChange={(e) => setWorkspaceInputValue(e.target.value)}
							className="workspace-editor crumb-current outline-none inline-block min-w-[3ch] cursor-text whitespace-nowrap bg-transparent"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									const name = workspaceInputValue.trim();
									if (name && name !== activeWorkspace) {
										setWorkspaces((prev) => [...prev, [name, "0", "#6257d8"]]);
										setActiveWorkspace(name);
										setToast(`Navigated to ${name} dashboard`);
										setTimeout(() => setToast(""), 2000);
									}
									setIsEditingWorkspace(false);
								} else if (e.key === "Escape") {
									setIsEditingWorkspace(false);
								}
							}}
							onBlur={() => setIsEditingWorkspace(false)}
						/>
					) : (
						<>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										aria-label="Select workspace"
										className="flex items-center gap-1.5 focus:outline-none crumb-current hover:text-black transition-colors"
									>
										{activeWorkspace}{" "}
										<ChevronDownIcon className="w-3.5 h-3.5 opacity-50" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="w-[220px] bg-[#fafaf7] text-black shadow-xl border border-[#d3d3cd] rounded-md z-50 p-1"
								>
									{workspaces.map(([name, count, color]) => (
										<DropdownMenuItem
											key={name}
											onClick={() => setActiveWorkspace(name)}
											className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#efefe9] rounded-sm outline-none"
										>
											<i
												style={{
													width: 8,
													height: 8,
													borderRadius: "50%",
													background: color,
												}}
											/>
											<span className="flex-1">{name}</span>
											<em className="text-xs opacity-50 not-italic">{count}</em>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
							<button
								type="button"
								aria-label="Add new workspace"
								className="opacity-40 hover:opacity-100 focus:opacity-100 transition-opacity ml-1"
								onClick={() => setIsEditingWorkspace(true)}
							>
								<PlusIcon className="w-3.5 h-3.5" />
							</button>
						</>
					)}
				</div>
				<div className="top-actions">
					<button type="button" className="quick-search">
						<MagnifyingGlassIcon className="w-4 h-4" />
						<span>Search tickets</span>
						<kbd>⌘ K</kbd>
					</button>
					<button type="button" aria-label="Notifications">
						<BellIcon className="w-4 h-4" />
					</button>
					<button type="button" className="top-avatar" aria-label="User menu">
						<Avatar initials="JD" />
					</button>
				</div>
			</header>
			<div className="app-content">
				<div className="content-main">
					<div className="page-title-row">
						<div>
							<h1>Sprint board</h1>
							<p>
								Tuesday, September 24 <span>·</span> Sprint 14
							</p>
						</div>
						<div className="title-actions">
							<button
								type="button"
								className="primary-button"
								onClick={() => setShowCreate(true)}
							>
								<PlusIcon className="w-4 h-4" /> Create ticket
							</button>
						</div>
					</div>
					<div className="sprint-summary">
						<div>
							<span className="summary-label">SPRINT 14</span>
							<strong>Northwind momentum</strong>
							<span className="summary-date">Sep 16 — Sep 27</span>
						</div>
						<div className="progress-area">
							<div className="progress-copy">
								<span>{sprintProgress} of 29 tickets complete</span>
								<strong>59%</strong>
							</div>
							<div className="progress-track">
								<i style={{ width: "59%" }} />
							</div>
						</div>
						<div className="sprint-stat">
							<span>Days left</span>
							<strong>3</strong>
						</div>
					</div>
					<div className="board-toolbar">
						<div className="view-toggle">
							<button
								type="button"
								className={activeView === "board" ? "active" : ""}
								onClick={() => setActiveView("board")}
							>
								<ViewColumnsIcon className="w-4 h-4" /> Board
							</button>
							<button
								type="button"
								className={activeView === "list" ? "active" : ""}
								onClick={() => setActiveView("list")}
							>
								<ListBulletIcon className="w-4 h-4" /> List
							</button>
						</div>
						<div className="toolbar-right">
							<div className="filter-select">
								<FunnelIcon className="w-3.5 h-3.5" />
								<select
									value={activeFilter}
									onChange={(e) => setActiveFilter(e.target.value)}
								>
									<option>All tickets</option>
									<option>My tickets</option>
									<option>High priority</option>
								</select>
							</div>
							<div className="search-tickets">
								<MagnifyingGlassIcon className="w-3.5 h-3.5" />
								<input
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Filter by title…"
								/>
							</div>
							<button
								type="button"
								className="icon-button"
								aria-label="More options"
							>
								<EllipsisHorizontalIcon className="w-4 h-4" />
							</button>
						</div>
					</div>
					{activeView === "board" ? (
						<BoardView
							columns={columns}
							visibleTickets={visibleTickets}
							onMoveTicket={onMoveTicket}
							onCreateTicket={() => setShowCreate(true)}
						/>
					) : (
						<div className="list-view">
							{columns
								.flatMap((c) =>
									visibleTickets[c.key].map((ticket) => ({
										...ticket,
										status: c.title,
									})),
								)
								.map((ticket) => (
									<div className="list-row" key={ticket.id}>
										<span className="list-status">{ticket.status}</span>
										<span className="list-type">{ticket.type}</span>
										<strong>{ticket.id}</strong>
										<span>{ticket.title}</span>
										<span className="list-priority">{ticket.priority}</span>
										<Avatar initials={ticket.assignee} />
									</div>
								))}
						</div>
					)}
				</div>
			</div>
			<SidebarRight />
			<div className="status-bar">
				<span>
					<ChartBarIcon className="w-3.5 h-3.5" /> All systems operational
				</span>
				<span>Last synced just now</span>
			</div>
			{toast && (
				<div className="toast">
					<CheckIcon className="w-4 h-4" /> {toast}
				</div>
			)}

			<Popout
				isOpen={showCreate}
				onClose={() => setShowCreate(false)}
				eyebrow="NEW TICKET"
				title="Create a ticket"
			>
				<label>
					Ticket title
					<input placeholder="What needs to be done?" />
				</label>
				<div className="form-grid">
					<label>
						Type
						<select>
							<option>Feature</option>
							<option>Bug</option>
							<option>Task</option>
						</select>
					</label>
					<label>
						Priority
						<select>
							<option>Medium</option>
							<option>High</option>
							<option>Low</option>
						</select>
					</label>
				</div>
				<label>
					Description
					<textarea placeholder="Add a little context…" />
				</label>
				<div className="modal-actions">
					<button
						type="button"
						className="secondary-button"
						onClick={() => setShowCreate(false)}
					>
						Cancel
					</button>
					<button
						type="button"
						className="primary-button"
						onClick={() => {
							setShowCreate(false);
							setToast("Ticket created in Backlog");
							setTimeout(() => setToast(""), 2000);
						}}
					>
						Create ticket
					</button>
				</div>
			</Popout>
		</div>
	);
}
