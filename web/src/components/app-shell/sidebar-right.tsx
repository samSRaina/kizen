import {
	ChevronLeftIcon,
	ChevronRightIcon,
	Cog6ToothIcon,
	PlusIcon,
	StarIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function SidebarRight() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<>
			<button
				type="button"
				aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				onClick={() => setCollapsed(!collapsed)}
				className="fixed right-0 top-[64px] bg-[#fafaf7] text-[#92928a] hover:text-black p-2 rounded-none border border-t-0 border-r-0 border-[#deded7] z-[60] transition-colors"
			>
				{collapsed ? (
					<ChevronLeftIcon className="w-4 h-4" />
				) : (
					<ChevronRightIcon className="w-4 h-4" />
				)}
			</button>

			<aside className={`floating-sidebar ${collapsed ? "collapsed" : ""}`}>
				<div className="h-[28px] w-full" />
				<div className="side-nav">
					<button type="button">
						<StarIcon className="w-[18px] h-[18px]" />
						<span>Starred</span>
					</button>
				</div>
				<div className="workspace-heading">
					<span>Agents</span>
					<button type="button" aria-label="Add agent">
						<PlusIcon className="w-[15px] h-[15px]" />
					</button>
				</div>
				<div className="side-bottom">
					<button type="button">
						<TrashIcon className="w-[18px] h-[18px]" />
						<span>Trash</span>
					</button>
					<button type="button">
						<Cog6ToothIcon className="w-[18px] h-[18px]" />
						<span>Settings</span>
					</button>
				</div>
			</aside>
		</>
	);
}
