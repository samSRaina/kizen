import {
	AdjustmentsHorizontalIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	PlusCircleIcon,
	StarIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function SidebarRight() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<>
			<button
				aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				onClick={() => setCollapsed(!collapsed)}
				className="fixed right-0 top-[64px] bg-[#fafaf7] text-[#92928a] hover:text-black p-2 rounded-none border border-t-0 border-r-0 border-[#deded7] z-[60] transition-colors"
			>
				{collapsed ? (
					<ChevronLeftIcon width={24} height={24} />
				) : (
					<ChevronRightIcon width={24} height={24} />
				)}
			</button>

			<aside className={`floating-sidebar ${collapsed ? "collapsed" : ""}`}>
				<div className="h-[28px] w-full" />
				<div className="side-nav">
					<button>
						<StarIcon width={24} height={24} />
						<span>Starred</span>
					</button>
				</div>
				<div className="workspace-heading">
					<span>Agents</span>
					<button aria-label="Add agent">
						<PlusCircleIcon width={15} height={15} />
					</button>
				</div>
				<div className="side-bottom">
					<button>
						<TrashIcon width={24} height={24} />
						<span>Trash</span>
					</button>
					<button>
						<AdjustmentsHorizontalIcon width={24} height={24} />
						<span>Settings</span>
					</button>
				</div>
			</aside>
		</>
	);
}
