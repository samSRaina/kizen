import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Taskbar } from "./taskbar";

export function AppShell({ children }: { children: ReactNode }) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<div className="h-screen w-screen overflow-hidden flex flex-col bg-canvas text-text-primary select-none font-sans">
			{/* Top Brutalist Taskbar */}
			<Taskbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

			{/* Floating Right Workspace Creation Sidebar */}
			<Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

			{/* Main Viewport: Fits desktop screen cleanly with zero unwanted outer scrolling */}
			<main className="flex-1 min-h-0 overflow-hidden flex flex-col bg-canvas">
				{children}
			</main>
		</div>
	);
}

export default AppShell;
