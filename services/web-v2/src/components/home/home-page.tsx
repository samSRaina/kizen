import { useNavigate } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { ReferenceCard } from "#/components/common/reference-card";
import { MOCK_WORKSPACES } from "#/lib/mock-data";
import { CenterHero } from "./center-hero";

export function HomePage() {
	const navigate = useNavigate();

	const handleSelectWorkspace = (workspaceId: string) => {
		navigate({
			to: "/ws/$workspaceId",
			params: { workspaceId },
		});
	};

	return (
		<div className="h-full w-full overflow-y-auto px-4 sm:px-6 pt-16 pb-12 max-w-5xl mx-auto flex flex-col justify-start gap-12">
			{/* Center Hero Greeting (Clean, logo-free) */}
			<CenterHero />

			{/* Workspaces Selection Grid matching reference design */}
			<div className="w-full flex flex-col gap-3">
				<div className="flex items-center justify-between px-1">
					<div className="flex items-center gap-2">
						<Briefcase className="w-4 h-4 text-[#8e8e96]" />
						<h2 className="text-xs font-medium uppercase tracking-wider text-[#8e8e96]">
							Workspaces
						</h2>
					</div>
					<span className="text-xs text-[#71717a] font-mono">
						Select a workspace to open
					</span>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
					{MOCK_WORKSPACES.map((ws) => (
						<ReferenceCard
							key={ws.id}
							category={ws.category || "Freelance Workspace"}
							title={ws.name}
							description={
								ws.description ||
								"Workspace overview and active client projects."
							}
							badgeText={`$${ws.default_hourly_rate}/hr`}
							badgeVariant="emerald"
							onClick={() => handleSelectWorkspace(ws.id)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default HomePage;
