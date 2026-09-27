import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowUpRight,
	BarChart3,
	ChevronRight,
	CircleDot,
	DollarSign,
	Grid2X2,
	Loader2,
	LogOut,
	Plus,
	Search,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	createWorkspace,
	deleteWorkspace,
	listWorkspaces,
	type Workspace,
} from "@/lib/api";
import { authClient, useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: Dashboard,
});

const PALETTE = [
	"#2f5fe6",
	"#6257d8",
	"#686bd9",
	"#7485ed",
	"#8b9aff",
	"#328f97",
	"#2f6a4a",
	"#d7975c",
];

function getWorkspaceColor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash << 5) - hash + name.charCodeAt(i);
		hash |= 0;
	}
	return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}

function formatRelativeTime(dateStr: string): string {
	try {
		const date = new Date(dateStr);
		const diffMs = Date.now() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		});
	} catch {
		return "Recently";
	}
}

function getTimeOfDayGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}

function Logo() {
	return (
		<div className="logo-mark">
			<span className="logo-k">K</span>
			<span>izen</span>
			<i />
		</div>
	);
}

function Avatar({
	initials,
	image,
}: {
	initials: string;
	image?: string | null;
}) {
	if (image) {
		return (
			<img
				src={image}
				alt={initials}
				className="dashboard-avatar w-8 h-8 rounded-full object-cover border border-[#d9d9d2]"
			/>
		);
	}
	return <span className="dashboard-avatar">{initials}</span>;
}

export default function Dashboard() {
	const navigate = useNavigate();
	const { data: session } = useSession();

	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	const [query, setQuery] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [nameInput, setNameInput] = useState("");
	const [rateInput, setRateInput] = useState("50");
	const [descInput, setDescInput] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [toast, setToast] = useState("");

	const showToast = (message: string) => {
		setToast(message);
		setTimeout(() => setToast(""), 2500);
	};

	const fetchAllWorkspaces = useCallback(async () => {
		try {
			setIsLoading(true);
			setFetchError(null);
			const data = await listWorkspaces();
			setWorkspaces(Array.isArray(data) ? data : []);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to load workspaces";
			setFetchError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAllWorkspaces();
	}, [fetchAllWorkspaces]);

	const filtered = useMemo(() => {
		if (!query.trim()) return workspaces;
		const q = query.toLowerCase();
		return workspaces.filter(
			(w) =>
				w.name.toLowerCase().includes(q) ||
				w.description?.toLowerCase().includes(q),
		);
	}, [workspaces, query]);

	const totalWorkspaces = workspaces.length;
	const avgRate = useMemo(() => {
		if (workspaces.length === 0) return 0;
		const sum = workspaces.reduce(
			(acc, curr) => acc + (curr.default_hourly_rate || 0),
			0,
		);
		return Math.round(sum / workspaces.length);
	}, [workspaces]);

	const userName = session?.user?.name || "Developer";
	const userFirstName = userName.split(" ")[0];
	const userInitials = getInitials(userName);
	const userImage = session?.user?.image;

	const handleCreateWorkspace = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!nameInput.trim()) {
			setFormError("Workspace name is required");
			return;
		}

		const parsedRate = Number.parseInt(rateInput, 10);
		if (Number.isNaN(parsedRate) || parsedRate < 0) {
			setFormError("Hourly rate must be a non-negative number");
			return;
		}

		try {
			setIsSubmitting(true);
			setFormError(null);
			const created = await createWorkspace({
				name: nameInput.trim(),
				default_hourly_rate: parsedRate,
				description: descInput.trim() || null,
			});

			setWorkspaces((prev) => [created, ...prev]);
			setShowCreate(false);
			setNameInput("");
			setDescInput("");
			setRateInput("50");
			showToast(`Created workspace "${created.name}"`);
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to create workspace";
			setFormError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		if (!confirm(`Are you sure you want to delete workspace "${name}"?`)) {
			return;
		}
		try {
			setDeletingId(id);
			await deleteWorkspace(id);
			setWorkspaces((prev) => prev.filter((w) => w.id !== id));
			showToast(`Deleted workspace "${name}"`);
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to delete workspace";
			showToast(msg);
		} finally {
			setDeletingId(null);
		}
	};

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/" });
				},
			},
		});
	};

	return (
		<div className="dashboard-shell">
			<header className="dashboard-topbar">
				<Link to="/dashboard" className="dashboard-logo">
					<Logo />
				</Link>
				<div className="dashboard-top-actions">
					<div className="dashboard-search">
						<Search size={15} />
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search workspaces…"
							className="bg-transparent border-none outline-none text-xs w-32 md:w-48"
						/>
						<kbd>⌘ K</kbd>
					</div>
					<button
						type="button"
						onClick={handleSignOut}
						title="Sign out"
						className="dashboard-icon"
						aria-label="Sign out"
					>
						<LogOut size={16} />
					</button>
					<Avatar initials={userInitials} image={userImage} />
				</div>
			</header>

			<main className="dashboard-content">
				<div className="dashboard-intro">
					<div>
						<p className="dashboard-eyebrow">YOUR WORKSPACE HOME</p>
						<h1>
							{getTimeOfDayGreeting()}, {userFirstName}.
						</h1>
						<p className="dashboard-subtitle">
							Pick up where you left off, or start something new.
						</p>
					</div>
					<button
						type="button"
						className="dashboard-primary flex items-center gap-1.5"
						onClick={() => setShowCreate(true)}
					>
						<Plus size={16} /> Create workspace
					</button>
				</div>

				<section className="dashboard-stats">
					<div className="dashboard-stat primary-stat">
						<div className="stat-icon">
							<Grid2X2 size={18} />
						</div>
						<div>
							<span>Total workspaces</span>
							<strong>{totalWorkspaces}</strong>
							<small>Across your account</small>
						</div>
					</div>
					<div className="dashboard-stat">
						<div className="stat-icon blue">
							<DollarSign size={18} />
						</div>
						<div>
							<span>Avg. hourly rate</span>
							<strong>${avgRate}/hr</strong>
							<small>Configured baseline</small>
						</div>
					</div>
					<div className="dashboard-stat">
						<div className="stat-icon green">
							<BarChart3 size={18} />
						</div>
						<div>
							<span>Status</span>
							<strong>Active</strong>
							<small>Workspace backend connected</small>
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
							<Search size={14} />
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Filter workspaces..."
							/>
						</div>
					</div>
				</div>

				{isLoading ? (
					<div className="flex flex-col items-center justify-center p-16 text-[#74746e]">
						<Loader2 className="w-6 h-6 animate-spin mb-2" />
						<span className="text-sm">Loading your workspaces…</span>
					</div>
				) : fetchError ? (
					<div className="border border-red-200 bg-red-50 text-red-700 p-6 rounded-md mb-6 flex flex-col items-start gap-2">
						<strong>Could not load workspaces</strong>
						<p className="text-sm">{fetchError}</p>
						<button
							type="button"
							onClick={fetchAllWorkspaces}
							className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
						>
							Try again
						</button>
					</div>
				) : (
					<section className="workspace-grid">
						{filtered.map((workspace) => {
							const color = getWorkspaceColor(workspace.name);
							const initials = getInitials(workspace.name);
							return (
								<div className="workspace-card" key={workspace.id}>
									<div className="workspace-card-head">
										<span
											className="workspace-symbol"
											style={{ background: color }}
										>
											{initials}
										</span>
										<button
											type="button"
											className="card-more hover:text-red-600 transition-colors"
											title="Delete workspace"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleDelete(workspace.id, workspace.name);
											}}
											disabled={deletingId === workspace.id}
										>
											{deletingId === workspace.id ? (
												<Loader2 size={15} className="animate-spin" />
											) : (
												<Trash2 size={15} />
											)}
										</button>
									</div>
									<div className="workspace-card-title">
										<h3>{workspace.name}</h3>
										<ArrowUpRight size={15} />
									</div>
									<p>
										{workspace.description ||
											"A dedicated workspace for your project management and tracking."}
									</p>
									<div className="workspace-card-meta">
										<span>
											<DollarSign size={13} className="inline-block" /> $
											{workspace.default_hourly_rate}/hr
										</span>
									</div>
									<div className="workspace-card-footer">
										<div className="avatar-stack">
											<Avatar initials={userInitials} image={userImage} />
										</div>
										<span className="workspace-updated">
											Updated {formatRelativeTime(workspace.updated_at)}{" "}
											<ChevronRight size={13} />
										</span>
									</div>
								</div>
							);
						})}

						<button
							type="button"
							className="new-workspace-card"
							onClick={() => setShowCreate(true)}
						>
							<span>
								<Plus size={20} />
							</span>
							<strong>Create a workspace</strong>
							<small>Start organizing a new team or project</small>
						</button>
					</section>
				)}

				<section className="dashboard-lower">
					<div className="activity-panel">
						<div className="lower-heading">
							<div>
								<p className="dashboard-eyebrow">WORKSPACE SUMMARY</p>
								<h2>Multi-tenant Encapsulation Active</h2>
							</div>
						</div>
						<div className="activity-row">
							<span className="activity-dot green" />
							<div>
								<strong>Owner Scoped Queries</strong>
								<small>
									All workspace operations strictly authenticated via JWT
								</small>
							</div>
						</div>
						<div className="activity-row">
							<span className="activity-dot purple" />
							<div>
								<strong>Golang Workspace Microservice</strong>
								<small>
									PostgreSQL storage with connection pooling & transactions
								</small>
							</div>
						</div>
					</div>
					<div className="tip-panel">
						<Sparkles size={17} />
						<p className="dashboard-eyebrow">A SMALL IDEA</p>
						<h3>Make your work visible.</h3>
						<p>
							Organize your billable hours and team priorities across dedicated
							workspaces.
						</p>
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
					<CircleDot size={14} /> {toast}
				</div>
			)}

			{showCreate && (
				<div className="dashboard-modal-backdrop">
					<button
						type="button"
						aria-label="Close backdrop"
						className="fixed inset-0 w-full h-full cursor-default bg-transparent border-none p-0 m-0 -z-10"
						onClick={() => !isSubmitting && setShowCreate(false)}
					/>
					<div className="dashboard-modal" role="dialog" aria-modal="true">
						<div className="dashboard-modal-head">
							<div>
								<p className="dashboard-eyebrow">NEW SPACE</p>
								<h2>Create a workspace</h2>
							</div>
							<button
								type="button"
								onClick={() => setShowCreate(false)}
								disabled={isSubmitting}
								aria-label="Close modal"
							>
								×
							</button>
						</div>

						{formError && (
							<div className="bg-red-50 text-red-700 text-xs p-2.5 rounded border border-red-200 mb-2">
								{formError}
							</div>
						)}

						<form
							onSubmit={handleCreateWorkspace}
							className="flex flex-col gap-3"
						>
							<label>
								Workspace name *
								<input
									type="text"
									required
									value={nameInput}
									onChange={(e) => setNameInput(e.target.value)}
									placeholder="e.g. Acme Studio"
									disabled={isSubmitting}
								/>
							</label>

							<label>
								Default hourly rate ($/hr)
								<input
									type="number"
									min="0"
									value={rateInput}
									onChange={(e) => setRateInput(e.target.value)}
									placeholder="e.g. 75"
									disabled={isSubmitting}
								/>
							</label>

							<label>
								Short description
								<textarea
									rows={3}
									value={descInput}
									onChange={(e) => setDescInput(e.target.value)}
									placeholder="What will this workspace help organize?"
									disabled={isSubmitting}
								/>
							</label>

							<div className="dashboard-modal-actions mt-2">
								<button
									type="button"
									className="dashboard-secondary"
									onClick={() => setShowCreate(false)}
									disabled={isSubmitting}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="dashboard-primary flex items-center justify-center gap-1.5"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2 size={15} className="animate-spin" /> Creating…
										</>
									) : (
										<>
											<Plus size={15} /> Create workspace
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
