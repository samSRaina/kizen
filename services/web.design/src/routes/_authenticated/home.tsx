import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowRight,
	Briefcase,
	DollarSign,
	FolderPlus,
	Loader2,
	LogOut,
	Plus,
	Trash2,
	User,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import {
	createWorkspaceMutation,
	deleteWorkspaceMutation,
	listWorkspacesOptions,
} from "@/lib/api-client/@tanstack/react-query.gen";
import type { Workspace } from "@/lib/api-client/types.gen";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated/home")({
	component: AuthenticatedHomeComponent,
});

function AuthenticatedHomeComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { session: initialSession } = Route.useRouteContext();
	const { data: liveSession } = authClient.useSession();

	const user = liveSession?.user ?? initialSession?.user;

	// Query for workspaces from the backend
	const {
		data: serverWorkspaces,
		isLoading,
		isError,
	} = useQuery({
		...listWorkspacesOptions(),
		refetchOnMount: true,
	});

	// Immediate local state for instant visibility of any action
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

	// Synchronize with server data when loaded
	useEffect(() => {
		if (serverWorkspaces && Array.isArray(serverWorkspaces)) {
			setWorkspaces(serverWorkspaces);
		}
	}, [serverWorkspaces]);

	// Mutation for creating a workspace
	const createMutation = useMutation({
		...createWorkspaceMutation(),
		onSuccess: (data) => {
			if (data?.id) {
				// Reconcile optimistic item with server item
				setWorkspaces((prev) =>
					prev.map((ws) => (ws.name === data.name ? data : ws)),
				);
			}
			queryClient.invalidateQueries({
				queryKey: listWorkspacesOptions().queryKey,
			});
		},
		onError: () => {
			queryClient.invalidateQueries({
				queryKey: listWorkspacesOptions().queryKey,
			});
		},
	});

	// Mutation for deleting a workspace
	const deleteMutation = useMutation({
		...deleteWorkspaceMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: listWorkspacesOptions().queryKey,
			});
		},
		onError: () => {
			queryClient.invalidateQueries({
				queryKey: listWorkspacesOptions().queryKey,
			});
		},
	});

	// Form & UI state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [name, setName] = useState("");
	const [hourlyRate, setHourlyRate] = useState("75");
	const [description, setDescription] = useState("");
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
		null,
	);

	const resetForm = () => {
		setName("");
		setHourlyRate("75");
		setDescription("");
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		await navigate({ to: "/authenticate" });
	};

	const handleCreateWorkspace = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) return;

		const rateNum = Number.parseInt(hourlyRate, 10) || 0;
		const descVal = description.trim() || undefined;

		// 1. Immediate UI visibility
		const optimisticWorkspace: Workspace = {
			id:
				typeof crypto !== "undefined" && crypto.randomUUID
					? crypto.randomUUID()
					: `ws_${Date.now()}`,
			name: trimmedName,
			default_hourly_rate: rateNum,
			description: descVal,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			owner_id: user?.id || "",
		};

		setWorkspaces((prev) => [optimisticWorkspace, ...prev]);
		setIsModalOpen(false);
		resetForm();

		// 2. Dispatch backend creation request
		createMutation.mutate({
			body: {
				name: trimmedName,
				default_hourly_rate: rateNum,
				description: descVal,
			},
		});
	};

	const handleDeleteWorkspace = (id: string, wsName: string) => {
		if (
			window.confirm(
				`Are you sure you want to delete workspace "${wsName}"? This action cannot be undone.`,
			)
		) {
			// 1. Immediate UI visibility
			setWorkspaces((prev) => prev.filter((ws) => ws.id !== id));

			// 2. Dispatch backend deletion request
			deleteMutation.mutate({
				path: { id },
			});
		}
	};

	return (
		<div className="min-h-screen w-full bg-canvas text-text-primary font-sans selection:bg-accent-primary selection:text-accent-primary-fg flex flex-col justify-between">
			{/* Top Bar */}
			<header className="w-full bg-surface-base border-b border-border-default px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
				<div className="flex items-center space-x-3">
					<Logo />
				</div>

				<div className="flex items-center space-x-3 sm:space-x-4">
					<div className="flex items-center space-x-2 text-xs text-text-secondary border-r border-border-default pr-3 sm:pr-4">
						<User className="w-4 h-4 text-text-muted" />
						<span className="font-medium max-w-[140px] sm:max-w-none truncate">
							{user?.name || user?.email || "Account"}
						</span>
					</div>

					<ThemeToggleButton
						variant="rectangle"
						blur={true}
						start="right-left"
					/>

					<button
						type="button"
						onClick={handleSignOut}
						className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-surface-elevated hover:bg-surface-hover border border-border-default text-text-primary transition-colors cursor-pointer"
					>
						<LogOut className="w-3.5 h-3.5" />
						<span className="hidden sm:inline">Sign Out</span>
					</button>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				{/* Header Section */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-border-default">
					<div>
						<h1 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-text-primary">
							Workspaces
						</h1>
						<p className="mt-1 text-sm text-text-secondary font-sans max-w-xl">
							Manage your client workspaces, configure hourly billing rates, and
							track project assignments.
						</p>
					</div>

					<div>
						<button
							type="button"
							onClick={() => setIsModalOpen(true)}
							className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover transition-colors cursor-pointer shadow-sm"
						>
							<Plus className="w-4 h-4" />
							<span>Create Workspace</span>
						</button>
					</div>
				</div>

				{/* Workspaces List / Grid */}
				<div className="mt-8">
					{isLoading && workspaces.length === 0 ? (
						<div className="py-20 flex flex-col items-center justify-center space-y-3 text-text-muted">
							<Loader2 className="w-8 h-8 animate-spin text-text-primary" />
							<p className="text-sm">Loading workspaces...</p>
						</div>
					) : isError && workspaces.length === 0 ? (
						<div className="p-8 border border-border-default bg-surface-base text-center space-y-4">
							<AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
							<div className="space-y-1">
								<h2 className="font-bold text-base text-text-primary uppercase font-sans">
									No Workspaces Found
								</h2>
								<p className="text-sm text-text-secondary max-w-md mx-auto">
									Create your first workspace to start organizing client tasks.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsModalOpen(true)}
								className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover transition-colors cursor-pointer"
							>
								Create Workspace
							</button>
						</div>
					) : workspaces.length === 0 ? (
						<div className="py-16 px-6 border border-dashed border-border-default bg-surface-base/50 text-center space-y-4">
							<div className="w-12 h-12 bg-surface-elevated border border-border-default flex items-center justify-center mx-auto text-text-muted">
								<Briefcase className="w-6 h-6" />
							</div>
							<div className="space-y-1">
								<h2 className="font-bold text-base text-text-primary uppercase font-sans">
									No Workspaces Yet
								</h2>
								<p className="text-sm text-text-secondary max-w-md mx-auto">
									Create your first workspace to start organizing client tasks
									and tracking project billables.
								</p>
							</div>
							<div className="pt-2">
								<button
									type="button"
									onClick={() => setIsModalOpen(true)}
									className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover transition-colors cursor-pointer"
								>
									<FolderPlus className="w-4 h-4" />
									<span>Create First Workspace</span>
								</button>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
							{workspaces.map((ws) => {
								const isSelected = selectedWorkspaceId === ws.id;

								return (
									<div
										key={ws.id}
										className={`border p-6 bg-surface-base flex flex-col justify-between transition-all ${
											isSelected
												? "border-border-strong ring-1 ring-border-strong"
												: "border-border-default hover:border-border-strong"
										}`}
									>
										<div>
											<div className="flex items-start justify-between gap-2 mb-3">
												<h3 className="font-bold text-lg uppercase text-text-primary font-sans tracking-tight">
													{ws.name}
												</h3>
												<span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-bold bg-surface-sunken border border-border-default text-text-primary shrink-0">
													<DollarSign className="w-3 h-3 text-text-muted" />
													<span>{ws.default_hourly_rate}/hr</span>
												</span>
											</div>

											{ws.description ? (
												<p className="text-sm text-text-secondary line-clamp-3">
													{ws.description}
												</p>
											) : (
												<p className="text-xs text-text-muted italic">
													No description provided
												</p>
											)}
										</div>

										<div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between gap-2">
											<button
												type="button"
												onClick={() => setSelectedWorkspaceId(ws.id)}
												className={`flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
													isSelected
														? "bg-accent-primary text-accent-primary-fg border-accent-primary"
														: "bg-surface-elevated hover:bg-surface-hover border-border-default text-text-primary"
												}`}
											>
												<span>{isSelected ? "Selected" : "Open"}</span>
												<ArrowRight className="w-3.5 h-3.5" />
											</button>

											<button
												type="button"
												onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
												disabled={deleteMutation.isPending}
												className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
												title="Delete Workspace"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</main>

			{/* Create Workspace Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
					<div className="w-full max-w-md border border-border-default bg-surface-base shadow-2xl">
						{/* Modal Header */}
						<div className="border-b border-border-default px-6 py-4 flex items-center justify-between bg-surface-elevated/40">
							<h2 className="font-bold text-sm uppercase tracking-wider text-text-primary font-sans">
								Create New Workspace
							</h2>
							<button
								type="button"
								onClick={() => {
									setIsModalOpen(false);
									resetForm();
								}}
								className="text-text-muted hover:text-text-primary cursor-pointer p-1"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Modal Form */}
						<form onSubmit={handleCreateWorkspace} className="p-6 space-y-4">
							<div>
								<label
									htmlFor="workspace-name"
									className="block text-xs font-semibold uppercase text-text-secondary mb-1.5"
								>
									Workspace Name *
								</label>
								<input
									id="workspace-name"
									type="text"
									required
									placeholder="e.g. Acme Corporation"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full px-3 py-2 text-sm bg-surface-sunken border border-border-default text-text-primary focus:outline-hidden focus:border-border-strong"
								/>
							</div>

							<div>
								<label
									htmlFor="hourly-rate"
									className="block text-xs font-semibold uppercase text-text-secondary mb-1.5"
								>
									Default Hourly Rate (USD) *
								</label>
								<input
									id="hourly-rate"
									type="number"
									min="0"
									required
									placeholder="75"
									value={hourlyRate}
									onChange={(e) => setHourlyRate(e.target.value)}
									className="w-full px-3 py-2 text-sm bg-surface-sunken border border-border-default text-text-primary focus:outline-hidden focus:border-border-strong font-mono"
								/>
							</div>

							<div>
								<label
									htmlFor="workspace-desc"
									className="block text-xs font-semibold uppercase text-text-secondary mb-1.5"
								>
									Description (Optional)
								</label>
								<textarea
									id="workspace-desc"
									rows={3}
									placeholder="Brief details about this client or project scope..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="w-full px-3 py-2 text-sm bg-surface-sunken border border-border-default text-text-primary focus:outline-hidden focus:border-border-strong"
								/>
							</div>

							{/* Actions */}
							<div className="pt-3 flex justify-end items-center space-x-3">
								<button
									type="button"
									onClick={() => {
										setIsModalOpen(false);
										resetForm();
									}}
									className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-border-default hover:bg-surface-hover text-text-secondary transition-colors cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover transition-colors cursor-pointer"
								>
									<span>Create Workspace</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Footer */}
			<footer className="w-full border-t border-border-default bg-surface-base px-4 sm:px-8 py-4 text-center sm:text-left text-xs text-text-muted flex flex-col sm:flex-row items-center justify-between">
				<span>Kizen Systems</span>
				<span className="mt-1 sm:mt-0">Production Client</span>
			</footer>
		</div>
	);
}

export default AuthenticatedHomeComponent;
