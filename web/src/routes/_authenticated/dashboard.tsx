import {
	ArrowPathIcon,
	ArrowRightStartOnRectangleIcon,
	ArrowUpRightIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ChevronRightIcon,
	CurrencyDollarIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	SparklesIcon,
	Squares2X2Icon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { authClient, useSession } from "@/lib/auth-client";
import type { components } from "@/types/api.gen";

type Workspace = components["schemas"]["Workspace"];

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
		if (diffMins < 1) return "just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	} catch {
		return "recently";
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
		<div className="flex items-center gap-[3px] font-bold text-[17px] tracking-tight">
			<span className="grid place-items-center w-[18px] h-[20px] border border-[var(--blue)] text-[var(--blue)] font-serif text-[17px]">
				K
			</span>
			<span>izen</span>
			<i className="w-[5px] h-[5px] border border-[var(--blue)] ml-[1px]" />
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
				alt="User avatar"
				className="w-8 h-8 rounded-full border border-[var(--line)] object-cover"
			/>
		);
	}
	return (
		<div className="grid place-items-center w-8 h-8 rounded-full bg-[#ced6ff] text-[#3448aa] font-mono text-[11px] font-medium flex-none">
			{initials}
		</div>
	);
}

export function Dashboard() {
	const navigate = useNavigate();
	const { data: session } = useSession();

	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	const [query, setQuery] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [nameInput, setNameInput] = useState("");
	const [descInput, setDescInput] = useState("");
	const [rateInput, setRateInput] = useState("50");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);

	const showToast = (message: string) => {
		setToast(message);
		setTimeout(() => setToast(null), 3000);
	};

	const fetchAllWorkspaces = useCallback(async () => {
		try {
			setIsLoading(true);
			setFetchError(null);
			const { data, error } = await apiClient.GET("/api/v1/workspaces");
			if (error) {
				setFetchError(
					error.detail || error.title || "Failed to load workspaces",
				);
			} else if (data) {
				setWorkspaces(data);
			}
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "An unexpected error occurred";
			setFetchError(msg);
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

			const { data: created, error } = await apiClient.POST(
				"/api/v1/workspaces",
				{
					body: {
						name: nameInput.trim(),
						default_hourly_rate: parsedRate,
						description: descInput.trim() || undefined,
					},
				},
			);

			if (error) {
				setFormError(
					error.detail || error.title || "Failed to create workspace",
				);
				return;
			}

			if (created) {
				setWorkspaces((prev) => [created, ...prev]);
				setShowCreate(false);
				setNameInput("");
				setDescInput("");
				setRateInput("50");
				showToast(`Created workspace "${created.name}"`);
			}
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "An unexpected error occurred";
			setFormError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		if (!confirm(`Are you sure you want to delete "${name}"?`)) {
			return;
		}
		try {
			setDeletingId(id);
			const { error } = await apiClient.DELETE("/api/v1/workspaces/{id}", {
				params: { path: { id } },
			});

			if (error) {
				showToast(error.detail || error.title || "Failed to delete workspace");
				return;
			}

			setWorkspaces((prev) => prev.filter((w) => w.id !== id));
			showToast(`Deleted workspace "${name}"`);
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "An unexpected error occurred";
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
		<div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans relative">
			<header className="h-[64px] flex items-center justify-between px-8 border-b border-[rgba(210,210,204,0.7)] bg-[rgba(248,248,245,0.76)] backdrop-blur-md sticky top-0 z-20">
				<Link to="/dashboard" className="text-inherit no-underline">
					<Logo />
				</Link>
				<div className="flex items-center gap-3">
					<div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[var(--line)] bg-white/50 text-[#92928c] text-xs shadow-sm shadow-black/5">
						<MagnifyingGlassIcon className="w-4 h-4" />
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search workspaces\u2026"
							className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-[var(--soft)]"
						/>
						<kbd className="ml-4 px-1.5 py-0.5 border border-[#d2d2cc] bg-[#f0f0eb] font-mono text-[9px] text-[#9a9a92]">
							\u2318K
						</kbd>
					</div>
					<button
						type="button"
						onClick={handleSignOut}
						title="Sign out"
						className="p-2 text-[#85857d] hover:text-[var(--ink)] hover:bg-black/5 transition-colors rounded-md"
						aria-label="Sign out"
					>
						<ArrowRightStartOnRectangleIcon className="w-5 h-5" />
					</button>
					<div className="ml-1">
						<Avatar initials={userInitials} image={userImage} />
					</div>
				</div>
			</header>

			<main className="w-full max-w-[1220px] mx-auto px-6 py-12 md:py-16 pb-24">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-[60px]">
					<div>
						<p className="text-[#707069] font-mono text-[11px] mb-4 tracking-widest uppercase flex items-center gap-2">
							<span className="w-[7px] h-[7px] rounded-full bg-[#6257d8] shadow-[0_0_0_4px_rgba(98,87,216,0.1)]" />
							YOUR WORKSPACE HOME
						</p>
						<h1 className="text-[40px] tracking-tight font-medium my-0 mb-2">
							{getTimeOfDayGreeting()}, {userFirstName}.
						</h1>
						<p className="text-[#8a8a83] text-[13px] m-0">
							Pick up where you left off, or start something new.
						</p>
					</div>
					<button
						type="button"
						className="inline-flex items-center gap-1.5 bg-[var(--ink)] text-white px-5 py-2.5 text-[13px] font-medium hover:scale-[0.98] transition-transform active:scale-95"
						onClick={() => setShowCreate(true)}
					>
						<PlusIcon className="w-4 h-4 text-inherit" /> Create workspace
					</button>
				</div>

				<section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
					<div className="flex items-start gap-4 p-5 border border-[var(--line)] bg-[var(--card)] shadow-sm">
						<div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-black/5 text-[var(--ink)] rounded-md">
							<Squares2X2Icon className="w-5 h-5 text-inherit" />
						</div>
						<div className="flex flex-col">
							<span className="text-[#74746d] text-xs mb-1">
								Total workspaces
							</span>
							<strong className="text-2xl font-medium">
								{totalWorkspaces}
							</strong>
							<small className="text-[#a7a7a0] text-[11px] mt-1">
								Across your account
							</small>
						</div>
					</div>
					<div className="flex items-start gap-4 p-5 border border-[var(--line)] bg-[var(--card)] shadow-sm">
						<div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md">
							<CurrencyDollarIcon className="w-5 h-5 text-inherit" />
						</div>
						<div className="flex flex-col">
							<span className="text-[#74746d] text-xs mb-1">
								Avg. hourly rate
							</span>
							<strong className="text-2xl font-medium">${avgRate}/hr</strong>
							<small className="text-[#a7a7a0] text-[11px] mt-1">
								Configured baseline
							</small>
						</div>
					</div>
					<div className="flex items-start gap-4 p-5 border border-[var(--line)] bg-[var(--card)] shadow-sm">
						<div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-md">
							<ChartBarIcon className="w-5 h-5 text-inherit" />
						</div>
						<div className="flex flex-col">
							<span className="text-[#74746d] text-xs mb-1">Status</span>
							<strong className="text-2xl font-medium">Active</strong>
							<small className="text-[#a7a7a0] text-[11px] mt-1">
								Workspace backend connected
							</small>
						</div>
					</div>
				</section>

				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h2 className="text-xl font-medium tracking-tight m-0 mb-1">
							Your workspaces
						</h2>
						<span className="text-[var(--muted)] text-[13px]">
							{filtered.length} spaces available
						</span>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 px-3 py-1.5 border border-[var(--line)] bg-white shadow-sm shadow-black/5">
							<MagnifyingGlassIcon className="w-3.5 h-3.5 text-[#92928c]" />
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Filter workspaces..."
								className="bg-transparent border-none outline-none text-xs w-40 text-[var(--ink)] placeholder:text-[#a7a7a0]"
							/>
						</div>
					</div>
				</div>

				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
						<ArrowPathIcon className="w-6 h-6 animate-spin mb-3" />
						<span className="text-[13px]">Loading your workspaces\u2026</span>
					</div>
				) : fetchError ? (
					<div className="border border-red-200 bg-red-50 text-red-700 p-6 flex flex-col items-start gap-2 mb-8">
						<strong>Could not load workspaces</strong>
						<p className="text-[13px] m-0">{fetchError}</p>
						<button
							type="button"
							onClick={fetchAllWorkspaces}
							className="mt-2 text-[11px] bg-red-600 text-white px-3 py-1.5 hover:bg-red-700 font-medium"
						>
							Try again
						</button>
					</div>
				) : (
					<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-20">
						{filtered.map((workspace) => {
							const color = getWorkspaceColor(workspace.name);
							const initials = getInitials(workspace.name);
							return (
								<div
									className="group relative flex flex-col p-5 bg-[var(--card)] border border-[var(--line)] hover:border-[#c5c5be] hover:shadow-[0_8px_30px_rgba(39,40,44,0.06)] transition-all duration-300"
									key={workspace.id}
								>
									<div className="flex justify-between items-start mb-5">
										<span
											className="w-9 h-9 flex items-center justify-center text-white text-[13px] font-semibold"
											style={{ background: color }}
										>
											{initials}
										</span>
										<button
											type="button"
											className="p-1.5 text-[var(--soft)] opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
											title="Delete workspace"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleDelete(workspace.id, workspace.name);
											}}
											disabled={deletingId === workspace.id}
										>
											{deletingId === workspace.id ? (
												<ArrowPathIcon className="w-4 h-4 animate-spin" />
											) : (
												<TrashIcon className="w-4 h-4" />
											)}
										</button>
									</div>
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-[15px] font-medium m-0 tracking-tight text-inherit">
											{workspace.name}
										</h3>
										<ArrowUpRightIcon className="w-3.5 h-3.5 text-[var(--soft)] opacity-0 group-hover:opacity-100 transition-opacity" />
									</div>
									<p className="text-[var(--muted)] text-[13px] leading-relaxed mb-6 flex-1 m-0">
										{workspace.description ||
											"A dedicated workspace for your project management and tracking."}
									</p>
									<div className="flex items-center gap-4 mb-5 text-[#74746d] text-[11px] font-medium uppercase tracking-wide">
										<span className="flex items-center gap-1.5 bg-black/5 px-2 py-1">
											<CurrencyDollarIcon className="w-3.5 h-3.5 inline-block text-[var(--soft)]" />
											{workspace.default_hourly_rate}/hr
										</span>
									</div>
									<div className="flex items-center justify-between pt-4 border-t border-[rgba(210,210,204,0.4)]">
										<div className="flex items-center -space-x-2">
											<Avatar initials={userInitials} image={userImage} />
										</div>
										<span className="text-[var(--soft)] text-[11px] flex items-center gap-1">
											Updated {formatRelativeTime(workspace.updated_at)}{" "}
											<ChevronRightIcon className="w-3 h-3 text-inherit" />
										</span>
									</div>
								</div>
							);
						})}

						<button
							type="button"
							className="flex flex-col items-center justify-center gap-3 p-6 min-h-[240px] border border-dashed border-[var(--soft)] bg-transparent text-center hover:bg-black/[0.02] hover:border-[var(--ink)] transition-all duration-300"
							onClick={() => setShowCreate(true)}
						>
							<span className="w-10 h-10 flex items-center justify-center bg-white border border-[var(--line)] shadow-sm text-[var(--muted)] mb-2">
								<PlusIcon className="w-5 h-5 text-inherit" />
							</span>
							<strong className="block text-[14px] font-medium text-inherit">
								Create a workspace
							</strong>
							<small className="block text-[var(--muted)] text-[12px]">
								Start organizing a new team
							</small>
						</button>
					</section>
				)}

				<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="p-6 border border-[var(--line)] bg-white/40 backdrop-blur-sm">
						<div className="mb-6">
							<p className="text-[#707069] font-mono text-[10px] mb-2 tracking-widest uppercase">
								WORKSPACE SUMMARY
							</p>
							<h2 className="text-[17px] font-medium m-0 tracking-tight">
								Multi-tenant Encapsulation Active
							</h2>
						</div>
						<div className="flex items-start gap-3 mb-5">
							<span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)] flex-shrink-0" />
							<div>
								<strong className="block text-[13px] font-medium mb-1">
									Owner Scoped Queries
								</strong>
								<small className="block text-[12px] text-[var(--muted)]">
									All workspace operations strictly authenticated via JWT
								</small>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1.5 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.15)] flex-shrink-0" />
							<div>
								<strong className="block text-[13px] font-medium mb-1">
									Golang Workspace Microservice
								</strong>
								<small className="block text-[12px] text-[var(--muted)]">
									PostgreSQL storage with connection pooling & transactions
								</small>
							</div>
						</div>
					</div>
					<div className="p-6 border border-[var(--line)] bg-white/40 backdrop-blur-sm flex flex-col justify-center">
						<SparklesIcon className="w-5 h-5 text-[var(--muted)] mb-4" />
						<p className="text-[#707069] font-mono text-[10px] mb-2 tracking-widest uppercase">
							A SMALL IDEA
						</p>
						<h3 className="text-[17px] font-medium m-0 mb-2 tracking-tight">
							Make your work visible.
						</h3>
						<p className="text-[13px] text-[var(--muted)] leading-relaxed m-0">
							Organize your billable hours and team priorities across dedicated
							workspaces seamlessly with multi-tenant architecture.
						</p>
					</div>
				</section>
			</main>

			<footer className="border-t border-[var(--line)] bg-white/30 backdrop-blur-sm px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--muted)] mt-auto">
				<span className="flex items-center gap-3">
					<Logo /> <em>Minimal project management for focused teams.</em>
				</span>
				<span>All systems operational \u00b7 2026 Kizen</span>
			</footer>

			{toast && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 bg-[var(--ink)] text-white text-[13px] font-medium shadow-xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
					<CheckCircleIcon className="w-4 h-4 text-inherit" /> {toast}
				</div>
			)}

			{showCreate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#212124]/30 backdrop-blur-sm p-4">
					<button
						type="button"
						aria-label="Close backdrop"
						className="absolute inset-0 w-full h-full cursor-default"
						onClick={() => !isSubmitting && setShowCreate(false)}
					/>
					<div
						className="w-full max-w-[460px] bg-[#fafaf7] border border-[#d3d3cd] shadow-[0_20px_60px_rgba(39,40,44,0.2)] p-7 relative z-10"
						role="dialog"
						aria-modal="true"
					>
						<div className="flex items-start justify-between mb-7">
							<div>
								<p className="font-mono text-[9px] tracking-[0.15em] text-[#878780] mb-2 uppercase">
									NEW SPACE
								</p>
								<h2 className="text-[25px] font-medium tracking-tight m-0">
									Create a workspace
								</h2>
							</div>
							<button
								type="button"
								className="text-[#8c8c85] hover:text-[var(--ink)] text-2xl leading-none"
								onClick={() => setShowCreate(false)}
								disabled={isSubmitting}
								aria-label="Close modal"
							>
								\u00d7
							</button>
						</div>

						{formError && (
							<div className="bg-red-50 text-red-700 text-[12px] p-3 border border-red-200 mb-4">
								{formError}
							</div>
						)}

						<form
							onSubmit={handleCreateWorkspace}
							className="flex flex-col gap-5"
						>
							<div>
								<label
									htmlFor="workspace-name"
									className="block text-[#74746d] text-[10px] uppercase tracking-wider mb-2"
								>
									Workspace name *
								</label>
								<input
									id="workspace-name"
									type="text"
									required
									value={nameInput}
									onChange={(e) => setNameInput(e.target.value)}
									placeholder="e.g. Acme Studio"
									disabled={isSubmitting}
									className="block w-full p-2.5 border border-[#d7d7d0] bg-white outline-none text-[13px] focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-all placeholder:text-[#a7a7a0]"
								/>
							</div>

							<div>
								<label
									htmlFor="hourly-rate"
									className="block text-[#74746d] text-[10px] uppercase tracking-wider mb-2"
								>
									Default hourly rate ($/hr)
								</label>
								<input
									id="hourly-rate"
									type="number"
									min="0"
									value={rateInput}
									onChange={(e) => setRateInput(e.target.value)}
									placeholder="e.g. 75"
									disabled={isSubmitting}
									className="block w-full p-2.5 border border-[#d7d7d0] bg-white outline-none text-[13px] focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-all placeholder:text-[#a7a7a0]"
								/>
							</div>

							<div>
								<label
									htmlFor="short-desc"
									className="block text-[#74746d] text-[10px] uppercase tracking-wider mb-2"
								>
									Short description
								</label>
								<textarea
									id="short-desc"
									rows={3}
									value={descInput}
									onChange={(e) => setDescInput(e.target.value)}
									placeholder="What will this workspace help organize?"
									disabled={isSubmitting}
									className="block w-full p-2.5 border border-[#d7d7d0] bg-white outline-none text-[13px] focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-all min-h-[80px] resize-y placeholder:text-[#a7a7a0]"
								/>
							</div>

							<div className="flex justify-end gap-3 mt-4">
								<button
									type="button"
									className="px-4 py-2 text-[13px] text-[#74746d] hover:bg-black/5 transition-colors font-medium"
									onClick={() => setShowCreate(false)}
									disabled={isSubmitting}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="inline-flex items-center gap-1.5 px-5 py-2 bg-[var(--ink)] text-white text-[13px] font-medium hover:bg-black transition-colors"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<ArrowPathIcon className="w-4 h-4 animate-spin text-inherit" />{" "}
											Creating\u2026
										</>
									) : (
										<>
											<PlusIcon className="w-4 h-4 text-inherit" /> Create
											workspace
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
