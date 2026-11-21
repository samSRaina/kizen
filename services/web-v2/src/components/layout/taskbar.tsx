import { MoreVertical } from "lucide-react";
import { BreadcrumbTree } from "./breadcrumb-tree";

interface TaskbarProps {
	isSidebarOpen: boolean;
	onToggleSidebar: () => void;
}

export function Taskbar({ isSidebarOpen, onToggleSidebar }: TaskbarProps) {
	return (
		<header className="h-9 w-full bg-[#111114] flex items-center justify-between px-3 z-40 select-none">
			{/* Left controls: Sidebar toggle + Breadcrumb Tree */}
			<div className="flex items-center gap-2.5">
				<button
					type="button"
					onClick={onToggleSidebar}
					title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
					aria-controls="app-sidebar"
					aria-expanded={isSidebarOpen}
					className="text-[#8e8e96] hover:text-[#f4f4f5] transition-colors cursor-pointer p-0.5 rounded"
					aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
				>
					<svg
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="w-4 h-4"
						role="img"
						aria-label="Toggle Sidebar"
					>
						<title>Toggle Sidebar</title>
						<rect
							x="2"
							y="2.5"
							width="12"
							height="11"
							rx="2"
							stroke="currentColor"
							strokeWidth="1.2"
						/>
						<rect
							x="2.5"
							y="3"
							width="3.5"
							height="10"
							fill="currentColor"
							rx="0.5"
						/>
					</svg>
				</button>

				{/* {Home symbol} / {workspaces toggle} / {projects toggle} */}
				<BreadcrumbTree />
			</div>

			{/* Right controls: 3 dots */}
			<div className="flex items-center gap-2">
				<button
					type="button"
					title="More options"
					aria-label="More options"
					className="text-[#8e8e96] hover:text-[#f4f4f5] transition-colors cursor-pointer p-0.5 rounded"
				>
					<MoreVertical className="w-3.5 h-3.5" />
				</button>
			</div>
		</header>
	);
}
