import { Brand } from "@/components/ui/brand";
import {
	ArrowRightStartOnRectangleIcon,
	Bars3Icon,
	HomeIcon,
	SparklesIcon,
	UserCircleIcon,
    ChevronDownIcon
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import React, { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggleButton, ThemeToggleDropdownRow } from "@/components/ui/theme-toggle";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { components } from "@/types/api.gen";

type Workspace = components["schemas"]["Workspace"];

export function Logo({ className }: { className?: string }) {
	return <Brand className={className} />;
}

export function Avatar({
	initials,
	image,
}: {
	initials: string;
	image?: string | null;
}) {
	if (image) {
		return (
			<img
				src={image}
				alt="User avatar"
				className="w-8 h-8 rounded-full border border-[var(--line)] object-cover flex-none"
			/>
		);
	}
	return (
		<div className="grid place-items-center w-8 h-8 rounded-full bg-[#ced6ff] text-[#3448aa] dark:bg-[#202850] dark:text-[#a0b0ff] font-mono text-[11px] font-medium flex-none">
			{initials}
		</div>
	);
}

interface AppLayoutProps {
	children: React.ReactNode;
	workspaces?: Workspace[];
	activeWorkspace?: Workspace | null;
	showWorkspaceSwitcher?: boolean;
}

export function AppLayout({ children, workspaces = [], activeWorkspace, showWorkspaceSwitcher = false }: AppLayoutProps) {
	const navigate = useNavigate();
	const { data: session } = useSession();

	const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("kizen_sidebar_open") === "true";
		}
		return false;
	});

	const handleSetSidebarOpen = (open: boolean) => {
		setIsSidebarOpen(open);
		if (typeof window !== "undefined") {
			localStorage.setItem("kizen_sidebar_open", open ? "true" : "false");
		}
	};

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/" });
				},
			},
		});
	};

	const userName =
		(session?.user as { username?: string; name?: string })?.username ||
		session?.user?.name ||
		"User";
	const userEmail = session?.user?.email;
	const userInitials = userName.slice(0, 2).toUpperCase();
	const userImage = session?.user?.image;

    const currentWorkspaceName = activeWorkspace?.name || "Select workspace";

	return (
		<div className="min-h-screen bg-[var(--paper)] dark:bg-[#0c0c0e] text-[var(--ink)] dark:text-[#f4f4f5] font-sans relative flex">
			{/* Collapsed Top Right Navigation */}
			{!isSidebarOpen && (
                showWorkspaceSwitcher ? (
                    <div className="fixed top-6 right-8 z-30 flex items-center gap-2 bg-[var(--paper)]/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md rounded-md pl-3 pr-1 py-1 border border-[var(--line)] dark:border-white/10 shadow-sm transition-all duration-300">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 focus:outline-none hover:text-black dark:hover:text-white transition-colors text-[13px] font-medium"
                            >
                                {currentWorkspaceName}
                                <ChevronDownIcon className="w-3 h-3 opacity-50" />
                            </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-[220px] bg-white dark:bg-[#151517] text-black dark:text-white shadow-xl border border-[var(--line)] dark:border-white/10 rounded-md z-50 p-1"
                            >
                            {workspaces.map((w) => (
                                <DropdownMenuItem
                                    key={w.id}
                                    onSelect={() => navigate({ to: `/workspaces/${w.id}` })}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm outline-none text-[13px]"
                                >
                                    <span className="flex-1 truncate">{w.name}</span>
                                </DropdownMenuItem>
                            ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="w-px h-4 bg-[var(--line)] dark:bg-white/10 mx-1" />

                        <button
                            type="button"
                            onClick={() => handleSetSidebarOpen(true)}
                            className="p-1.5 text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer rounded-sm"
                            title="Open menu"
                        >
                            <Bars3Icon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => handleSetSidebarOpen(true)}
                        className="fixed top-6 right-8 z-30 p-2 text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="Open menu"
                        aria-label="Open menu"
                    >
                        <Bars3Icon className="w-5 h-5" />
                    </button>
                )
			)}

			<main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
				{children}
			</main>

			{/* Collapsible Right Sidebar */}
			<aside
				className={cn(
					"bg-[#fbfbf9] dark:bg-[#151517] h-screen sticky top-0 flex flex-col justify-between transition-[width,opacity] duration-300 z-20 flex-shrink-0",
					isSidebarOpen
						? "w-72 border-l border-[var(--line)] dark:border-white/10 opacity-100"
						: "w-0 overflow-hidden border-l-0 opacity-0 pointer-events-none",
				)}
			>
				{/* Top Section */}
				<div className="flex flex-col p-4 gap-2 overflow-y-auto flex-1">
					<div className="flex items-center justify-between min-h-[36px] mb-3 px-1">
						<Link to="/home" className="text-inherit no-underline">
							<Logo />
						</Link>
						<div className="flex items-center gap-1">
                            {showWorkspaceSwitcher && (
                                <button
                                    type="button"
                                    onClick={() => navigate({ to: "/home" })}
                                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[var(--muted)] dark:text-[#a1a1aa] hover:text-[var(--ink)] dark:hover:text-[#f4f4f5]"
                                    title="Go to Home"
                                >
                                    <HomeIcon className="w-5 h-5" />
                                </button>
                            )}
							<ThemeToggleButton className="w-7 h-7 rounded-none border border-transparent hover:border-[var(--line)] dark:hover:border-white/10" />
							<button
								type="button"
								onClick={() => handleSetSidebarOpen(false)}
								className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[var(--muted)] dark:text-[#a1a1aa] hover:text-[var(--ink)] dark:hover:text-[#f4f4f5]"
								title="Collapse sidebar"
								aria-label="Collapse sidebar"
							>
								<Bars3Icon className="w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Agents Section */}
					<div className="mt-4 flex flex-col gap-1.5">
						<div className="flex items-center justify-between px-3 py-1">
							<span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] dark:text-[#a1a1aa]">
								Agents
							</span>
							<span className="text-[9px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[var(--muted)] dark:text-[#a1a1aa]">
								Standby
							</span>
						</div>

						{/* Placeholder Agent Item */}
						<div
							className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-[var(--muted)] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5 rounded-none transition-colors"
							title="Agent Worker (Placeholder)"
						>
							<SparklesIcon className="w-4 h-4 flex-shrink-0 text-[#6257d8]" />
							<div className="flex flex-col min-w-0">
								<span className="truncate font-medium text-[var(--ink)] dark:text-[#f4f4f5] leading-tight">
									Agent Runner
								</span>
								<span className="text-[10px] text-[var(--soft)] dark:text-[#71717a] truncate leading-tight mt-0.5">
									Awaiting deployment
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* User Profile Clickable Row */}
				<div className="p-4 border-t border-[var(--line)] dark:border-white/10">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<motion.button
								type="button"
								whileHover={{ y: -1 }}
								whileTap={{ scale: 0.98 }}
								transition={{ duration: 0.15, ease: "easeOut" }}
								className="group w-full flex items-center gap-2.5 p-2 transition-all cursor-pointer outline-none min-w-0 text-left rounded-none text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 data-[state=open]:bg-black/5 dark:data-[state=open]:bg-white/5 focus-visible:ring-1 focus-visible:ring-[var(--blue)]"
								aria-label="User account menu"
							>
								<motion.div
									whileHover={{ scale: 1.05 }}
									transition={{ duration: 0.15 }}
									className="flex-none"
								>
									<Avatar initials={userInitials} image={userImage} />
								</motion.div>
								<div className="flex-1 min-w-0">
									<p className="text-[13px] font-medium text-[var(--ink)] dark:text-[#f4f4f5] truncate leading-tight group-hover:text-[var(--blue)] transition-colors">
										{userName}
									</p>
									{userEmail && (
										<p className="text-[11px] text-[var(--soft)] dark:text-[#71717a] truncate leading-tight mt-0.5">
											{userEmail}
										</p>
									)}
								</div>
							</motion.button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							side="top"
							sideOffset={10}
							className="w-56 bg-[var(--card)] dark:bg-[#18181b] border border-[var(--line)] dark:border-white/10 shadow-lg rounded-none p-1 z-50 font-sans text-[var(--ink)] dark:text-[#f4f4f5]"
						>
							<DropdownMenuLabel className="font-normal px-2.5 py-2">
								<div className="flex flex-col space-y-0.5">
									<p className="text-[13px] font-medium text-[var(--ink)] dark:text-[#f4f4f5] leading-snug">
										{userName}
									</p>
									{userEmail && (
										<p className="text-[11px] text-[var(--soft)] dark:text-[#71717a] leading-snug truncate">
											{userEmail}
										</p>
									)}
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator className="bg-[var(--line)] dark:bg-white/10 my-1 -mx-1" />

							<DropdownMenuItem
								className="flex items-center justify-between px-2.5 py-2 text-[12px] text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-none outline-none transition-colors"
							>
								<div className="flex items-center gap-2">
									<UserCircleIcon className="w-4 h-4 text-[var(--soft)] dark:text-[#71717a]" />
									<span>Account</span>
								</div>
								<span className="text-[10px] font-mono text-[var(--soft)] dark:text-[#71717a]">
									Settings
								</span>
							</DropdownMenuItem>

							<DropdownMenuSeparator className="bg-[var(--line)] dark:bg-white/10 my-1 -mx-1" />
                            <ThemeToggleDropdownRow />
							<DropdownMenuItem
								onClick={handleSignOut}
								className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-none outline-none transition-colors"
							>
                                <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-[var(--soft)] dark:text-[#71717a]" />
								<span>Sign out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</aside>
		</div>
	);
}
