import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	ChevronsUpDown,
	LogOut,
	Moon,
	Sun,
	User as UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { clearCachedAuthToken } from "@/lib/goapi-client";
import { authKeys, authQueries } from "@/lib/queries/auth";

export function UserMenu() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: sessionData } = useQuery(authQueries.session());
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const user = sessionData?.user;
	const currentTheme = theme === "system" ? resolvedTheme : theme;
	const nextTheme = currentTheme === "dark" ? "light" : "dark";

	if (!user) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						onClick={() => navigate({ to: "/authenticate" })}
						className="text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
					>
						<UserIcon className="size-4" />
						<span>Sign In</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	const displayName = user.name || user.email;

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await authClient.signOut();
			clearCachedAuthToken();
			queryClient.clear();
			await queryClient.invalidateQueries({ queryKey: authKeys.session() });
			await navigate({ to: "/authenticate", replace: true });
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						className="w-full"
						render={
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-surface-elevated data-[state=open]:text-text-primary group-data-[collapsible=icon]:justify-center"
							/>
						}
					>
						<EntityAvatar name={displayName} size="sm" shape="rounded" />
						<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
							<span className="truncate font-semibold">{displayName}</span>
							<span className="truncate text-xs text-text-muted">
								{user.email}
							</span>
						</div>
						<ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-data-[collapsible=icon]:hidden" />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side="top"
						sideOffset={4}
						align="end"
						className="w-56"
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col gap-0.5">
									<span className="font-medium text-sm">{displayName}</span>
									<span className="text-xs text-text-muted">{user.email}</span>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => setTheme(nextTheme)}
								className="cursor-pointer"
							>
								{currentTheme === "dark" ? (
									<Sun className="mr-2 size-4" />
								) : (
									<Moon className="mr-2 size-4" />
								)}
								<span>Switch to {nextTheme} mode</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => navigate({ to: "/user" })}
								className="cursor-pointer"
							>
								<UserIcon className="mr-2 size-4" />
								<span>Account Profile</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							disabled={isLoggingOut}
							onClick={handleLogout}
							className="text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-600"
						>
							<LogOut className="mr-2 size-4" />
							<span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

export default UserMenu;
