import {
	ArrowRightStartOnRectangleIcon,
	Bars3Icon,
	BriefcaseIcon,
	CheckIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpDownIcon,
	FolderIcon,
	PlusIcon,
	TicketIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggleButton, ThemeToggleDropdownRow } from "@/components/ui/theme-toggle";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const PALETTE = [
	"#2f5fe6",
	"#6257d8",
	"#686bd9",
	"#7485ed",
	"#8b9aff",
	"#328f97",
	"#2f6a4a",
	"#d7975c",
];

function getWorkspaceColor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash << 5) - hash + name.charCodeAt(i);
		hash |= 0;
	}
	return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}

function WorkspaceSwitcher() {
	const { workspaces, activeWorkspace, setActiveWorkspace, isLoading } =
		useWorkspaces();
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	if (isCollapsed) {
		return (
			<div className="flex justify-center py-2">
				{activeWorkspace ? (
					<div
						className="size-8 rounded-none flex items-center justify-center text-white font-mono text-[11px] font-bold shadow-xs flex-none"
						style={{
							backgroundColor: getWorkspaceColor(activeWorkspace.name),
						}}
						title={activeWorkspace.name}
					>
						{getInitials(activeWorkspace.name)}
					</div>
				) : (
					<div className="size-8 rounded-none border border-[var(--line)] bg-[var(--card)] flex items-center justify-center text-[var(--muted)]">
						<BriefcaseIcon className="size-4" />
					</div>
				)}
			</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="w-full flex items-center gap-2.5 p-2 rounded-none border border-[var(--line)] bg-[var(--card)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left outline-none min-w-0"
					disabled={isLoading}
				>
					{activeWorkspace ? (
						<div
							className="size-7 rounded-none flex items-center justify-center text-white font-mono text-[11px] font-bold shadow-xs flex-none"
							style={{
								backgroundColor: getWorkspaceColor(activeWorkspace.name),
							}}
						>
							{getInitials(activeWorkspace.name)}
						</div>
					) : (
						<div className="size-7 rounded-none border border-[var(--line)] bg-[var(--paper)] flex items-center justify-center text-[var(--muted)] flex-none">
							<BriefcaseIcon className="size-3.5" />
						</div>
					)}
					<div className="flex-1 min-w-0">
						<p className="text-[13px] font-medium text-[var(--ink)] truncate leading-tight">
							{activeWorkspace?.name || "Select Workspace"}
						</p>
						<p className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-mono leading-tight mt-0.5">
							{activeWorkspace ? "Active" : "None"}
						</p>
					</div>
					<ChevronUpDownIcon className="size-4 text-[var(--muted)] flex-none opacity-60" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				sideOffset={6}
				className="w-60 bg-[var(--card)] border border-[var(--line)] shadow-none rounded-none p-1 z-50 font-sans"
			>
				<DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] px-2.5 py-1.5">
					Workspaces
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-[var(--line)] my-1 -mx-1" />
				{workspaces.map((ws) => {
					const isSelected = activeWorkspace?.id === ws.id;
					return (
						<DropdownMenuItem
							key={ws.id}
							onClick={() => setActiveWorkspace(ws)}
							className={cn(
								"flex items-center gap-2.5 px-2.5 py-2 text-[13px] cursor-pointer rounded-none outline-none transition-colors",
								isSelected
									? "bg-[var(--blue)] text-white hover:bg-[var(--blue)]"
									: "text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5",
							)}
						>
							<div
								className="size-6 rounded-none flex items-center justify-center text-white font-mono text-[10px] font-bold flex-none"
								style={{ backgroundColor: getWorkspaceColor(ws.name) }}
							>
								{getInitials(ws.name)}
							</div>
							<span className="flex-1 truncate">{ws.name}</span>
							{isSelected && <CheckIcon className="size-3.5 flex-none" />}
						</DropdownMenuItem>
					);
				})}
				<DropdownMenuSeparator className="bg-[var(--line)] my-1 -mx-1" />
				<DropdownMenuItem asChild>
					<Link
						to="/home"
						className="flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-none outline-none transition-colors"
					>
						<PlusIcon className="size-3.5" />
						<span>Manage workspaces</span>
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SidebarNav({ workspaceId }: { workspaceId?: string }) {
	const location = useLocation();
	const pathname = location.pathname;

	const navItems = [
		{
			title: "Tickets",
			href: workspaceId ? `/workspaces/${workspaceId}/tickets` : "/home",
			icon: TicketIcon,
			badge: undefined,
		},
		{
			title: "Projects",
			href: workspaceId ? `/workspaces/${workspaceId}/projects` : "/home",
			icon: FolderIcon,
			badge: undefined,
		},
	];

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] px-3 mb-1">
				Platform
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{navItems.map((item) => {
						const isActive = pathname.startsWith(item.href);
						const Icon = item.icon;
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									isActive={isActive}
									tooltip={item.title}
									className={cn(
										"h-9 px-3 text-[13px] font-medium rounded-none transition-colors border-l-2",
										isActive
											? "border-[var(--blue)] bg-black/5 dark:bg-white/5 text-[var(--ink)]"
											: "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5",
									)}
								>
									<Link to={item.href} className="flex items-center gap-2.5">
										<Icon className="size-4 flex-none" />
										<span>{item.title}</span>
										{item.badge && (
											<span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-none bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)]">
												{item.badge}
											</span>
										)}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function UserMenu() {
	const navigate = useNavigate();
	const { data: session } = useSession();
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	const userName = session?.user?.name || "Developer";
	const userEmail = session?.user?.email;
	const userInitials = getInitials(userName);
	const userImage = session?.user?.image;

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/" });
				},
			},
		});
	};

	if (isCollapsed) {
		return (
			<div className="flex flex-col items-center gap-2">
				<ThemeToggleButton className="w-8 h-8 rounded-none border border-[var(--line)] flex-none" />

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="size-8 rounded-none p-0 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer outline-none"
							aria-label="User account menu"
						>
							{userImage ? (
								<img
									src={userImage}
									alt="User avatar"
									className="size-7 rounded-full object-cover"
								/>
							) : (
								<div className="size-7 rounded-full bg-[#ced6ff] dark:bg-[#202850] text-[#3448aa] dark:text-[#a0b0ff] font-mono text-[10px] font-medium flex items-center justify-center">
									{userInitials}
								</div>
							)}
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						side="left"
						sideOffset={10}
						className="w-56 bg-[var(--card)] border border-[var(--line)] shadow-none rounded-none p-1 z-50 font-sans"
					>
						<DropdownMenuLabel className="font-normal px-2.5 py-2">
							<div className="flex flex-col space-y-0.5">
								<p className="text-[13px] font-medium text-[var(--ink)] leading-snug">
									{userName}
								</p>
								{userEmail && (
									<p className="text-[11px] text-[var(--soft)] leading-snug truncate">
										{userEmail}
									</p>
								)}
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator className="bg-[var(--line)] my-1 -mx-1" />
						<DropdownMenuItem
							onSelect={(e) => {
								e.preventDefault();
							}}
							className="p-0 focus:bg-transparent"
							asChild
						>
							<ThemeToggleDropdownRow />
						</DropdownMenuItem>
						<DropdownMenuSeparator className="bg-[var(--line)] my-1 -mx-1" />
						<DropdownMenuItem
							onClick={handleSignOut}
							className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 cursor-pointer rounded-none outline-none transition-colors"
						>
							<ArrowRightStartOnRectangleIcon className="w-4 h-4 text-inherit" />
							<span>Sign out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<ThemeToggleButton className="w-8 h-8 rounded-none border border-[var(--line)] flex-none" />

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="flex-1 flex items-center gap-2.5 p-1.5 border border-transparent hover:border-[var(--line)] bg-[var(--card)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer rounded-none min-w-0"
						aria-label="User account menu"
					>
						{userImage ? (
							<img
								src={userImage}
								alt="User avatar"
								className="size-7 rounded-full object-cover flex-none"
							/>
						) : (
							<div className="size-7 rounded-full bg-[#ced6ff] dark:bg-[#202850] text-[#3448aa] dark:text-[#a0b0ff] font-mono text-[10px] font-medium flex items-center justify-center flex-none">
								{userInitials}
							</div>
						)}
						<div className="flex-1 min-w-0 text-left">
							<p className="text-[12px] font-medium text-[var(--ink)] truncate leading-tight">
								{userName}
							</p>
							{userEmail && (
								<p className="text-[10px] text-[var(--soft)] truncate leading-tight mt-0.5">
									{userEmail}
								</p>
							)}
						</div>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					side="top"
					sideOffset={8}
					className="w-56 bg-[var(--card)] border border-[var(--line)] shadow-none rounded-none p-1 z-50 font-sans"
				>
					<DropdownMenuLabel className="font-normal px-2.5 py-2">
						<div className="flex flex-col space-y-0.5">
							<p className="text-[13px] font-medium text-[var(--ink)] leading-snug">
								{userName}
							</p>
							{userEmail && (
								<p className="text-[11px] text-[var(--soft)] leading-snug truncate">
									{userEmail}
								</p>
							)}
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator className="bg-[var(--line)] my-1 -mx-1" />
					<DropdownMenuItem asChild>
						<ThemeToggleDropdownRow />
					</DropdownMenuItem>
					<DropdownMenuSeparator className="bg-[var(--line)] my-1 -mx-1" />
					<DropdownMenuItem
						onClick={handleSignOut}
						className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 cursor-pointer rounded-none outline-none transition-colors"
					>
						<ArrowRightStartOnRectangleIcon className="w-4 h-4 text-inherit" />
						<span>Sign out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider defaultOpen={true}>
			<AppShellContent>{children}</AppShellContent>
		</SidebarProvider>
	);
}

function AppShellContent({ children }: { children: React.ReactNode }) {
	const { activeWorkspace } = useWorkspaces();
	const { toggleSidebar, state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<div className="flex min-h-screen w-full bg-[var(--paper)] text-[var(--ink)]">
			<Sidebar collapsible="icon" className="border-r border-[var(--line)]">
				<SidebarHeader className="p-3 border-b border-[var(--line)]">
					<div className="flex items-center justify-between mb-3 px-1">
						{!isCollapsed && (
							<Link to="/home" className="no-underline text-inherit">
								<div className="flex items-center gap-[3px] font-bold text-[16px] tracking-tight">
									<span className="grid place-items-center w-[18px] h-[19px] border border-[var(--blue)] text-[var(--blue)] font-serif text-[15px]">
										K
									</span>
									<span>izen</span>
									<i className="w-[4px] h-[4px] border border-[var(--blue)] ml-[1px]" />
								</div>
							</Link>
						)}
						<button
							type="button"
							onClick={toggleSidebar}
							className={cn(
								"p-1.5 rounded-none text-[var(--muted)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer",
								isCollapsed && "mx-auto",
							)}
							title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						>
							<Bars3Icon className="size-4" />
						</button>
					</div>
					<WorkspaceSwitcher />
				</SidebarHeader>

				<SidebarContent className="p-2">
					<SidebarNav workspaceId={activeWorkspace?.id} />
				</SidebarContent>

				<SidebarFooter className="p-3 border-t border-[var(--line)]">
					<UserMenu />
				</SidebarFooter>
			</Sidebar>

			<SidebarInset className="flex-1 flex flex-col min-w-0 bg-[var(--paper)]">
				{/* Top bar when sidebar is collapsed or on mobile */}
				<header className="h-12 border-b border-[var(--line)] flex items-center justify-between px-4 bg-[var(--card)] sm:hidden">
					<button
						type="button"
						onClick={toggleSidebar}
						className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
					>
						<Bars3Icon className="size-4" />
					</button>
					<Link to="/home" className="no-underline text-inherit">
						<span className="font-bold text-[14px]">Kizen</span>
					</Link>
					<div className="w-8" />
				</header>

				<main className="flex-1 p-6 md:p-8 overflow-y-auto">
					{children}
				</main>
			</SidebarInset>
		</div>
	);
}
