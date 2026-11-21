import { createFileRoute } from "@tanstack/react-router";
import { Activity, Clock, DollarSign } from "lucide-react";
import { ReferenceBanner } from "#/components/common/reference-banner";
import { ReferenceCard } from "#/components/common/reference-card";
import { MOCK_TRACKS, MOCK_WORKSPACES } from "#/lib/mock-data";

export const Route = createFileRoute("/_authenticated/ws/$workspaceId/track/")({
	component: WorkspaceTrackingPage,
});

function WorkspaceTrackingPage() {
	const { workspaceId } = Route.useParams();

	const workspace = MOCK_WORKSPACES.find((w) => w.id === workspaceId) ?? {
		id: workspaceId,
		owner_id: "usr_skylar",
		name: workspaceId,
		default_hourly_rate: 120,
		category: "Active Workspace",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	const workspaceTracks = MOCK_TRACKS.filter(
		(t) => t.workspace_id === workspace.id,
	);
	const displayedTracks =
		workspaceTracks.length > 0 ? workspaceTracks : MOCK_TRACKS;

	return (
		<div className="h-full w-full overflow-y-auto px-4 sm:px-8 pt-8 pb-12 max-w-5xl mx-auto flex flex-col gap-9">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="w-11 h-11 rounded-2xl bg-emerald-950/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/20 shrink-0">
						<Activity className="w-5 h-5" />
					</div>
					<div>
						<h1 className="text-2xl sm:text-3xl font-semibold text-[#f4f4f5] tracking-tight">
							Time Tracking
						</h1>
						<p className="text-xs text-[#8e8e96] mt-0.5">
							Live tracking sessions & billable logs for {workspace.name}.
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs font-mono px-3 py-1.5 rounded-full bg-[#16161b] text-emerald-400">
						Rate: ${workspace.default_hourly_rate}/hr baseline
					</span>
				</div>
			</div>

			{/* Active Live Session Banner */}
			<ReferenceBanner
				title="Stopwatch in progress: KZ-104"
				description="OpenAPI routes & frontend craftsmanship · Elapsed: 01:20:20 (Billable @ $120/hr)"
				buttonText="Stop & Save Session"
				icon={<Clock className="w-5 h-5 text-emerald-400 animate-pulse" />}
				onButtonClick={() => {
					console.log("Stop timer");
				}}
			/>

			{/* Recent Time Logs Section (seamless) */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between px-0.5">
					<h2 className="text-xs font-medium uppercase tracking-wider text-[#8e8e96]">
						Recent time sessions
					</h2>
					<span className="text-[11px] text-[#71717a] font-mono">
						{displayedTracks.length} logged
					</span>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
					{displayedTracks.map((trk) => (
						<ReferenceCard
							key={trk.id}
							category={
								trk.billable
									? `Billable @ $${trk.hourly_rate}/hr`
									: "Non-billable"
							}
							title={trk.description || "Unlabeled tracking block"}
							badgeText={
								trk.timer_state === "running" ? "Active Now" : "Logged"
							}
							badgeVariant={
								trk.timer_state === "running" ? "emerald" : "default"
							}
							badgeIcon={
								trk.timer_state === "running" ? (
									<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
								) : (
									<DollarSign className="w-3 h-3 text-[#71717a]" />
								)
							}
							onClick={() => {
								console.log("Inspect session:", trk.id);
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
