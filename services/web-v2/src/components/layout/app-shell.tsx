import { useLocation } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Taskbar } from "./taskbar";

interface AppShellProps {
	children: ReactNode;
}

const STORAGE_KEY = "kizen:sidebar:collapsed";

export function AppShell({ children }: AppShellProps) {
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const urlCollapsed = searchParams.get("collapsed");

	// Default to false so SSR and client initial hydration match
	const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
		if (urlCollapsed !== null) {
			return urlCollapsed === "true";
		}
		return false;
	});

	// On client mount, sync with localStorage if no explicit URL param was provided
	useEffect(() => {
		if (urlCollapsed !== null) {
			setIsCollapsed(urlCollapsed === "true");
			return;
		}
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored !== null) {
				setIsCollapsed(JSON.parse(stored));
			}
		} catch {
			// ignore storage errors
		}
	}, [urlCollapsed]);

	const isSidebarOpen = !isCollapsed;

	const handleToggleSidebar = () => {
		setIsCollapsed((prev) => {
			const next = !prev;
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {
				// ignore storage errors
			}
			return next;
		});
	};

	return (
		<div className="h-dvh w-full overflow-hidden flex flex-col bg-[#111114] text-[#f4f4f5] font-sans">
			{/* Top persistent taskbar */}
			<Taskbar
				isSidebarOpen={isSidebarOpen}
				onToggleSidebar={handleToggleSidebar}
			/>

			{/* Shell Body: Sidebar + Floating Main Viewport Window */}
			<div className="flex-1 min-h-0 relative flex overflow-hidden">
				{/* Left collapsible sidebar */}
				<Sidebar id="app-sidebar" isOpen={isSidebarOpen} />

				{/* Floating main layout window with seamless rounded corners */}
				<div
					className={`flex-1 min-h-0 mr-2 mb-2 flex flex-col bg-[#070708] rounded-xl overflow-hidden shadow-2xl transition-all duration-200 ease-in-out ${
						isSidebarOpen ? "ml-[210px]" : "ml-2"
					}`}
				>
					<main className="flex-1 min-h-0 overflow-y-auto flex flex-col">
						{children}
					</main>
				</div>
			</div>
		</div>
	);
}

export default AppShell;
