import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import {
	Check,
	ChevronsUpDown,
	Clock,
	FolderKanban,
	KanbanSquare,
	ListTodo,
	Plus,
	Settings,
} from "lucide-react";
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
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import {
	workspaceKeys,
	workspaceMutations,
	workspaceQueries,
} from "@/lib/queries/workspaces";
import type { Workspace } from "@/lib/types";
import { UserMenu } from "./user-menu";

export function AppSidebar() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const matches = useMatches();

	// Find workspaceId from active route params
	const currentWorkspaceId = (
		matches.find((m) => m.params && "workspaceId" in m.params)?.params as
			| { workspaceId?: string }
			| undefined
	)?.workspaceId;

	// Load workspaces
	const { data: workspaces = [] } = useQuery(workspaceQueries.list());

	const activeWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

	// Quick workspace creation state
	const [isCreatingWs, setIsCreatingWs] = useState(false);

	const handleCreateInstantWorkspace = async () => {
		try {
			setIsCreatingWs(true);
			const newWs = await workspaceMutations.create({
				name: `Workspace ${workspaces.length + 1}`,
				default_hourly_rate: 75,
			});
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			navigate({
				to: "/workspaces/$workspaceId/interactions/board",
				params: { workspaceId: newWs.id },
			});
		} catch (e) {
			console.error("Failed to create workspace:", e);
		} finally {
			setIsCreatingWs(false);
		}
	};

	return (
		<Sidebar collapsible="icon">
			{/* Header with Workspace Switcher */}
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger
								className="w-full"
								render={
									<SidebarMenuButton
										size="lg"
										className="data-[state=open]:bg-surface-elevated data-[state=open]:text-text-primary"
									/>
								}
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent-primary text-accent-primary-fg font-black text-xs">
									{activeWorkspace
										? activeWorkspace.name.slice(0, 2).toUpperCase()
										: "KZ"}
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
									<span className="truncate font-semibold">
										{activeWorkspace ? activeWorkspace.name : "Kizen"}
									</span>
									<span className="truncate text-xs text-text-muted">
										{activeWorkspace
											? `$${activeWorkspace.default_hourly_rate}/hr`
											: "Select workspace"}
									</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-data-[collapsible=icon]:hidden" />
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-60"
								align="start"
								side="bottom"
								sideOffset={4}
							>
								<DropdownMenuLabel className="text-xs text-text-muted">
									Workspaces
								</DropdownMenuLabel>
								{workspaces.map((ws: Workspace) => (
									<DropdownMenuItem
										key={ws.id}
										onClick={() =>
											navigate({
												to: "/workspaces/$workspaceId/interactions/board",
												params: { workspaceId: ws.id },
											})
										}
										className="gap-2 p-2 cursor-pointer"
									>
										<div className="flex size-6 items-center justify-center rounded-sm border border-border-default font-mono text-[10px] font-bold">
											{ws.name.slice(0, 2).toUpperCase()}
										</div>
										<span className="flex-1 truncate">{ws.name}</span>
										{ws.id === currentWorkspaceId && (
											<Check className="size-4 ml-auto text-emerald-600" />
										)}
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleCreateInstantWorkspace}
									disabled={isCreatingWs}
									className="gap-2 p-2 cursor-pointer font-medium"
								>
									<div className="flex size-6 items-center justify-center rounded-md border border-dashed border-border-default bg-surface-base">
										<Plus className="size-4" />
									</div>
									<span>{isCreatingWs ? "Creating..." : "New Workspace"}</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => navigate({ to: "/workspaces" })}
									className="gap-2 p-2 cursor-pointer text-text-muted hover:text-text-primary"
								>
									<FolderKanban className="size-4" />
									<span>All Workspaces</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			{/* Main Navigation */}
			<SidebarContent>
				{currentWorkspaceId ? (
					<SidebarGroup>
						<SidebarGroupLabel className="text-xs text-text-muted">
							Workspace Views
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										tooltip="Ticket Board"
										render={
											<Link
												to="/workspaces/$workspaceId/interactions/board"
												params={{ workspaceId: currentWorkspaceId }}
												activeProps={{
													className:
														"bg-surface-elevated text-text-primary font-semibold",
												}}
											/>
										}
									>
										<KanbanSquare className="size-4" />
										<span>Board</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										tooltip="List View"
										render={
											<Link
												to="/workspaces/$workspaceId/interactions/list"
												params={{ workspaceId: currentWorkspaceId }}
												activeProps={{
													className:
														"bg-surface-elevated text-text-primary font-semibold",
												}}
											/>
										}
									>
										<ListTodo className="size-4" />
										<span>List</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										tooltip="Time Tracking"
										render={
											<Link
												to="/workspaces/$workspaceId/time"
												params={{ workspaceId: currentWorkspaceId }}
												activeProps={{
													className:
														"bg-surface-elevated text-text-primary font-semibold",
												}}
											/>
										}
									>
										<Clock className="size-4" />
										<span>Track Time</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										tooltip="Settings"
										render={
											<Link
												to="/workspaces/$workspaceId/settings"
												params={{ workspaceId: currentWorkspaceId }}
												activeProps={{
													className:
														"bg-surface-elevated text-text-primary font-semibold",
												}}
											/>
										}
									>
										<Settings className="size-4" />
										<span>Settings</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				) : (
					<SidebarGroup>
						<SidebarGroupLabel className="text-xs text-text-muted">
							Navigation
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										tooltip="Workspaces"
										render={
											<Link
												to="/workspaces"
												activeProps={{
													className:
														"bg-surface-elevated text-text-primary font-semibold",
												}}
											/>
										}
									>
										<FolderKanban className="size-4" />
										<span>Workspaces</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>

			{/* Footer User Menu */}
			<SidebarFooter>
				<UserMenu />
			</SidebarFooter>

			{/* Collapse Rail */}
			<SidebarRail />
		</Sidebar>
	);
}

export default AppSidebar;
