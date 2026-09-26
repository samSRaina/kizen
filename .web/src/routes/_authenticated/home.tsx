import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/home")({
	component: HomePage,
});

import {
	ArrowUpRightIcon,
	ChartBarIcon,
	ChevronRightIcon,
	Cog6ToothIcon,
	EllipsisHorizontalIcon,
	MagnifyingGlassIcon,
	PlayCircleIcon,
	PlusIcon,
	SparklesIcon,
	Squares2X2Icon,
	TicketIcon,
	UsersIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

const workspaceSeed = [
	{
		name: "Northwind Retail",
		slug: "northwind-retail",
		tickets: 23,
		open: 14,
		color: "#6257d8",
		initials: "NR",
		description: "Retail operations and commerce platform",
	},
	{
		name: "Halcyon Goods",
		slug: "halcyon-goods",
		tickets: 9,
		open: 6,
		color: "#686bd9",
		initials: "HG",
		description: "Brand, product, and growth initiatives",
	},
	{
		name: "Fernhollow Labs",
		slug: "fernhollow-labs",
		tickets: 14,
		open: 8,
		color: "#7485ed",
		initials: "FL",
		description: "Experiments, research, and prototyping",
	},
	{
		name: "Orso Studio",
		slug: "orso-studio",
		tickets: 5,
		open: 3,
		color: "#8b9aff",
		initials: "OS",
		description: "Creative production and client delivery",
	},
];

function Logo() {
	return (
		<div className="zed-mini-logo">
			<span>Z</span>zed
			<i />
		</div>
	);
}
function Avatar({ initials }: { initials: string }) {
	return <span className="avatar w-8 h-8">{initials}</span>;
}

export default function HomePage() {
	const [query, setQuery] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [workspaces, setWorkspaces] = useState(workspaceSeed);
	const [toast, setToast] = useState("");
	const filtered = useMemo(
		() =>
			workspaces.filter((w) =>
				`${w.name} ${w.description}`
					.toLowerCase()
					.includes(query.toLowerCase()),
			),
		[workspaces, query],
	);
	const totalTickets = workspaces.reduce(
		(sum, workspace) => sum + workspace.tickets,
		0,
	);
	const totalOpen = workspaces.reduce(
		(sum, workspace) => sum + workspace.open,
		0,
	);

	const createWorkspace = () => {
		const next = {
			name: "New workspace",
			slug: "new-workspace",
			tickets: 0,
			open: 0,
			color: "#7b86eb",
			initials: "NW",
			description: "A fresh space for your next project",
		};
		setWorkspaces((current) => [...current, next]);
		setShowCreate(false);
		setToast("Workspace created");
		setTimeout(() => setToast(""), 2200);
	};

	return (
		<div className="app-shell">
			<header className="app-topbar">
				<Link href="/" className="app-brand">
					<Logo />
				</Link>
				<div className="top-actions">
					<button className="quick-search">
						<MagnifyingGlassIcon width={15} height={15} />
						<span>Search workspaces</span>
						<kbd>⌘ K</kbd>
					</button>
					<button className="icon-button">
						<Cog6ToothIcon width={16} height={16} />
					</button>
					<Avatar initials="JD" />
				</div>
			</header>
			<main className="dashboard-content">
				<div className="dashboard-intro">
					<div>
						<p className="dashboard-eyebrow">YOUR WORKSPACE HOME</p>
						<h1>Good afternoon, Jordan.</h1>
						<p className="dashboard-subtitle">
							Pick up where you left off, or start something new.
						</p>
					</div>
					<button
						className="primary-button"
						onClick={() => setShowCreate(true)}
					>
						<PlusIcon width={16} height={16} /> Create workspace
					</button>
				</div>
				<section className="dashboard-stats">
					<div className="dashboard-stat primary-stat">
						<div className="stat-icon">
							<Squares2X2Icon width={18} height={18} />
						</div>
						<div>
							<span>Total workspaces</span>
							<strong>{workspaces.length}</strong>
							<small>Across your account</small>
						</div>
					</div>
					<div className="dashboard-stat">
						<div className="stat-icon blue">
							<TicketIcon width={18} height={18} />
						</div>
						<div>
							<span>Total tickets created</span>
							<strong>{totalTickets}</strong>
							<small>{totalOpen} currently open</small>
						</div>
					</div>
					<div className="dashboard-stat">
						<div className="stat-icon green">
							<ChartBarIcon width={18} height={18} />
						</div>
						<div>
							<span>Active this week</span>
							<strong>18</strong>
							<small>+12% from last week</small>
						</div>
					</div>
				</section>
				<div className="workspace-toolbar">
					<div>
						<h2>Your workspaces</h2>
						<span>{filtered.length} spaces</span>
					</div>
					<div className="workspace-controls">
						<div className="dashboard-filter">
							<MagnifyingGlassIcon width={14} height={14} />
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Filter workspaces..."
							/>
						</div>
						<button className="dashboard-more">
							<EllipsisHorizontalIcon width={17} height={17} />
						</button>
					</div>
				</div>
				<section className="workspace-grid">
					{filtered.map((workspace) => (
						<Link
							href={`/app?workspace=${workspace.slug}`}
							className="workspace-card"
							key={workspace.slug}
						>
							<div className="workspace-card-head">
								<span
									className="workspace-symbol"
									style={{ background: workspace.color }}
								>
									{workspace.initials}
								</span>
								<button
									className="card-more"
									onClick={(e) => e.preventDefault()}
								>
									<EllipsisHorizontalIcon width={16} height={16} />
								</button>
							</div>
							<div className="workspace-card-title">
								<h3>{workspace.name}</h3>
								<ArrowUpRightIcon width={15} height={15} />
							</div>
							<p>{workspace.description}</p>
							<div className="workspace-card-meta">
								<span>
									<TicketIcon width={13} height={13} /> {workspace.tickets}{" "}
									tickets
								</span>
								<span>
									<PlayCircleIcon width={12} height={12} /> {workspace.open}{" "}
									open
								</span>
							</div>
							<div className="workspace-card-footer">
								<div className="avatar-stack">
									<Avatar initials="JD" />
									<Avatar initials="MK" />
									<Avatar initials="AL" />
									<span>+4</span>
								</div>
								<span className="workspace-updated">
									Updated today <ChevronRightIcon width={13} height={13} />
								</span>
							</div>
						</Link>
					))}
					<button
						className="new-workspace-card"
						onClick={() => setShowCreate(true)}
					>
						<span>
							<PlusIcon width={20} height={20} />
						</span>
						<strong>Create a workspace</strong>
						<small>Start organizing a new team or project</small>
					</button>
				</section>
				<section className="dashboard-lower">
					<div className="activity-panel">
						<div className="lower-heading">
							<div>
								<p className="dashboard-eyebrow">RECENT ACTIVITY</p>
								<h2>Keep the momentum</h2>
							</div>
							<button>
								View all <ArrowUpRightIcon width={13} height={13} />
							</button>
						</div>
						<div className="activity-row">
							<span className="activity-dot purple" />
							<div>
								<strong>Jordan moved ZED-219 to In progress</strong>
								<small>Northwind Retail · 18 minutes ago</small>
							</div>
							<Avatar initials="JD" />
						</div>
						<div className="activity-row">
							<span className="activity-dot orange" />
							<div>
								<strong>New sprint started in Halcyon Goods</strong>
								<small>Halcyon Goods · 2 hours ago</small>
							</div>
							<Avatar initials="MK" />
						</div>
						<div className="activity-row">
							<span className="activity-dot green" />
							<div>
								<strong>Fernhollow Labs reached 80% completion</strong>
								<small>Fernhollow Labs · Yesterday</small>
							</div>
							<Avatar initials="AL" />
						</div>
					</div>
					<div className="tip-panel">
						<SparklesIcon width={17} height={17} />
						<p className="dashboard-eyebrow">A SMALL IDEA</p>
						<h3>Make your work visible.</h3>
						<p>
							Invite collaborators to turn project updates into shared momentum.
						</p>
						<button>
							<UsersIcon width={14} height={14} /> Invite teammates
						</button>
					</div>
				</section>
			</main>
			<footer className="dashboard-footer">
				<span>
					<Logo /> <em>Minimal project management for focused teams.</em>
				</span>
				<span>All systems operational · 2026</span>
			</footer>
			{toast && (
				<div className="dashboard-toast">
					<PlayCircleIcon width={14} height={14} /> {toast}
				</div>
			)}
			{showCreate && (
				<div
					className="dashboard-modal-backdrop"
					onClick={() => setShowCreate(false)}
				>
					<div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
						<div className="dashboard-modal-head">
							<div>
								<p className="dashboard-eyebrow">NEW SPACE</p>
								<h2>Create a workspace</h2>
							</div>
							<button onClick={() => setShowCreate(false)}>×</button>
						</div>
						<label>
							Workspace name
							<input placeholder="e.g. Product design" />
						</label>
						<label>
							Short description
							<textarea placeholder="What will this workspace help your team organize?" />
						</label>
						<div className="dashboard-modal-actions">
							<button
								className="secondary-button"
								onClick={() => setShowCreate(false)}
							>
								Cancel
							</button>
							<button className="primary-button" onClick={createWorkspace}>
								<PlusIcon width={15} height={15} /> Create workspace
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
