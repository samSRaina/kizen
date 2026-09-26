import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession, signOut } from "../lib/auth-client";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const { data: session, isPending } = useSession();

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.reload();
				}
			}
		});
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-10 text-center">
				<h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to Kizen</h1>

				{isPending ? (
					<p className="text-gray-500 animate-pulse">Loading session...</p>
				) : session ? (
					<div className="space-y-6">
						<div className="p-6 bg-blue-50 text-blue-900 rounded-lg text-left shadow-inner border border-blue-100">
							<div className="flex items-center gap-4 mb-4">
								{session.user.image && (
									<img src={session.user.image} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
								)}
								<div>
									<p className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-1">Session Active</p>
									<h2 className="text-xl font-bold">Hello, {session.user.name}!</h2>
								</div>
							</div>
							<p className="text-blue-700 text-sm">{session.user.email}</p>
						</div>

						<button
							onClick={handleSignOut}
							className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
						>
							Sign Out
						</button>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-gray-600 mb-8">You are not authenticated. Please log in to continue.</p>
						<div className="flex justify-center">
							<Link
								to="/login"
								className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
							>
								Go to Login
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
