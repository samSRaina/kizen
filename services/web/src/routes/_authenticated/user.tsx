import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	Calendar,
	Hash,
	Loader2,
	LogOut,
	Mail,
	User,
} from "lucide-react";
import { Loader } from "#/components/layout/loader";
import { authClient } from "#/lib/auth-client";
import { authKeys, authQueries } from "#/lib/queries/auth";

export const Route = createFileRoute("/_authenticated/user")({
	component: UserDetailsPage,
});

function UserDetailsPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data, isPending, isError, error } = useQuery(authQueries.session());

	const signOut = useMutation({
		mutationFn: async () => {
			const { error } = await authClient.signOut();
			if (error) throw new Error(error.message ?? "Sign out failed");
		},
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: authKeys.all });
			navigate({ to: "/authenticate" });
		},
	});

	if (isPending) return <Loader size="lg" />;
	if (isError) {
		return (
			<div className="p-8 border border-border-default bg-surface-base text-center space-y-4">
				<AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
				<p className="font-mono text-sm text-red-400">Error: {String(error)}</p>
			</div>
		);
	}
	if (!data?.user) {
		return (
			<div className="p-8 border border-border-default bg-surface-base text-center font-mono text-xs text-text-muted">
				NO ACTIVE OPERATOR SESSION
			</div>
		);
	}

	const user = data.user;

	return (
		<div className="space-y-8 max-w-2xl">
			{/* Page Header */}
			<div className="pb-6 border-b border-border-default">
				<h1 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-text-primary">
					Operator Profile
				</h1>
				<p className="mt-1 text-sm text-text-secondary font-sans">
					Telemetry details and authentication credentials for this operator
					node.
				</p>
			</div>

			{/* User Details Matrix */}
			<div className="border border-border-default bg-surface-base p-6 sm:p-8 space-y-6">
				<div className="flex items-center space-x-4 border-b border-border-default pb-6">
					<div className="w-14 h-14 bg-surface-elevated border border-border-default flex items-center justify-center text-text-muted">
						<User className="w-7 h-7 text-text-primary" />
					</div>
					<div>
						<h2 className="text-lg font-bold uppercase tracking-tight text-text-primary font-sans">
							{user.name}
						</h2>
						<span className="font-mono text-xs text-text-muted">
							@{(user as { username?: string }).username ?? "operator"}
						</span>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
					<div className="p-3 bg-surface-sunken border border-border-default space-y-1">
						<span className="text-text-muted text-[11px] uppercase flex items-center space-x-1.5">
							<Mail className="w-3.5 h-3.5" />
							<span>Email Address</span>
						</span>
						<p className="font-semibold text-text-primary truncate">
							{user.email}
						</p>
					</div>

					<div className="p-3 bg-surface-sunken border border-border-default space-y-1">
						<span className="text-text-muted text-[11px] uppercase flex items-center space-x-1.5">
							<Hash className="w-3.5 h-3.5" />
							<span>Operator ID</span>
						</span>
						<p className="font-semibold text-text-primary truncate">
							{user.id}
						</p>
					</div>

					<div className="p-3 bg-surface-sunken border border-border-default space-y-1 sm:col-span-2">
						<span className="text-text-muted text-[11px] uppercase flex items-center space-x-1.5">
							<Calendar className="w-3.5 h-3.5" />
							<span>Provisioned Date</span>
						</span>
						<p className="font-semibold text-text-primary">
							{new Date(user.createdAt).toLocaleString()}
						</p>
					</div>
				</div>

				{signOut.isError ? (
					<p className="font-mono text-xs text-red-400">
						Error: {String(signOut.error)}
					</p>
				) : null}

				<div className="pt-4 border-t border-border-subtle flex justify-end">
					<button
						type="button"
						onClick={() => signOut.mutate()}
						disabled={signOut.isPending}
						className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
					>
						{signOut.isPending ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : (
							<LogOut className="w-3.5 h-3.5" />
						)}
						<span>Sign Out Node</span>
					</button>
				</div>
			</div>
		</div>
	);
}

export default UserDetailsPage;
