import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Briefcase, FolderGit2, Plus } from "lucide-react";
import { ReferenceBanner } from "#/components/common/reference-banner";
import { ReferenceCard } from "#/components/common/reference-card";
import { MOCK_WORKSPACES } from "#/lib/mock-data";

export const Route = createFileRoute("/_authenticated/ws/")({
	component: WorkspacesDirectoryPage,
});

function WorkspacesDirectoryPage() {
	const navigate = useNavigate();

	return (
		<div className="h-full w-full overflow-y-auto px-4 sm:px-8 pt-8 pb-12 max-w-5xl mx-auto flex flex-col gap-9">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="w-11 h-11 rounded-2xl bg-[#1d4ed8]/20 flex items-center justify-center text-[#60a5fa] shadow-lg shadow-blue-950/20 shrink-0">
						<Briefcase className="w-5 h-5" />
					</div>
					<div>
						<h1 className="text-2xl sm:text-3xl font-semibold text-[#f4f4f5] tracking-tight">
							Workspaces
						</h1>
						<p className="text-xs text-[#8e8e96] mt-0.5">
							Select an active client account or operational workspace.
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs font-mono px-3 py-1.5 rounded-full bg-[#16161b] text-[#d4d4d8]">
						{MOCK_WORKSPACES.length} total workspaces
					</span>
				</div>
			</div>

			{/* Workspaces Grid (seamless) */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between px-0.5">
					<h2 className="text-xs font-medium uppercase tracking-wider text-[#8e8e96]">
						All workspaces
					</h2>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
					{MOCK_WORKSPACES.map((ws) => (
						<ReferenceCard
							key={ws.id}
							category={ws.category || "Freelance Workspace"}
							title={ws.name}
							description={
								ws.description || "Workspace overview and client projects."
							}
							badgeText={`$${ws.default_hourly_rate}/hr baseline`}
							badgeVariant="emerald"
							badgeIcon={<FolderGit2 className="w-3 h-3 text-emerald-400" />}
							onClick={() =>
								navigate({
									to: "/ws/$workspaceId",
									params: { workspaceId: ws.id },
								})
							}
						/>
					))}
				</div>
			</div>

			{/* Seamless Action Banner */}
			<ReferenceBanner
				title="Create a new client workspace"
				description="Configure a custom baseline hourly rate, invite collaborators, and setup project prefixes."
				buttonText="New Workspace"
				icon={<Plus className="w-5 h-5 text-emerald-400" />}
				onButtonClick={() => {
					console.log("Create new workspace modal");
				}}
			/>
		</div>
	);
}
