import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { clearCachedAuthToken } from "#/lib/goapi-client";
import { authQueries } from "#/lib/queries/auth";

export const Route = createFileRoute("/_authenticated/user")({
	component: UserPage,
});

function UserPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: sessionData, isLoading } = useQuery(authQueries.session());

	const handleSignOut = async () => {
		try {
			await authClient.signOut();
		} catch (e) {
			console.error("Sign out error:", e);
		} finally {
			clearCachedAuthToken();
			queryClient.clear();
			navigate({ to: "/authenticate" });
		}
	};

	if (isLoading) {
		return <div className="empty-state">Loading user profile...</div>;
	}

	const user = sessionData?.user;

	if (!user) {
		return (
			<div className="empty-state">
				<p>No active user session found.</p>
				<button
					type="button"
					onClick={() => navigate({ to: "/authenticate" })}
					className="ghost-btn mt-2"
				>
					Sign In
				</button>
			</div>
		);
	}

	return (
		<div className="flex-col-gap-md max-w-xl">
			<section className="ghost-card flex-col-gap-sm">
				<h1 className="text-title-md">Account Profile</h1>
				<p className="text-muted-xs">
					Manage your credentials and active authentication session.
				</p>

				<div className="flex-col-gap-xs mt-2">
					<div className="ghost-card flex-row-between p-2">
						<span className="text-muted-xs">Full Name</span>
						<span className="text-title-sm">{user.name}</span>
					</div>

					<div className="ghost-card flex-row-between p-2">
						<span className="text-muted-xs">Email Address</span>
						<span className="text-title-sm">{user.email}</span>
					</div>

					{"username" in user &&
						Boolean((user as { username?: string }).username) && (
							<div className="ghost-card flex-row-between p-2">
								<span className="text-muted-xs">Username</span>
								<span className="text-title-sm">
									@{(user as { username: string }).username}
								</span>
							</div>
						)}

					<div className="ghost-card flex-row-between p-2">
						<span className="text-muted-xs">User ID</span>
						<span className="text-muted-xs font-mono">{user.id}</span>
					</div>
				</div>

				<div className="flex justify-end mt-4">
					<button
						type="button"
						onClick={handleSignOut}
						className="ghost-btn ghost-btn-danger"
					>
						Sign Out
					</button>
				</div>
			</section>
		</div>
	);
}

export default UserPage;
