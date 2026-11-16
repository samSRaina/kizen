import { User } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const SIZES = {
	xs: "size-5 text-[9px]",
	sm: "size-6 text-[10px]",
	md: "size-7 text-xs",
	default: "size-8 text-xs",
	lg: "size-10 text-sm",
	xl: "size-14 text-lg",
} as const;

const RADII = {
	circle: "rounded-full",
	rounded: "rounded-lg",
	inherit: "rounded-[inherit]",
} as const;

export type EntityAvatarSize = keyof typeof SIZES;

export interface EntityAvatarProps {
	name: string;
	avatarUrl?: string | null;
	size?: EntityAvatarSize;
	shape?: "circle" | "rounded" | "inherit";
	fallback?: ReactNode;
	className?: string;
}

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length === 0 || !parts[0]) return "U";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function EntityAvatar({
	name,
	avatarUrl,
	size = "default",
	shape = "circle",
	fallback,
	className,
}: EntityAvatarProps) {
	const radius = RADII[shape];
	const initials = getInitials(name);

	return (
		<Avatar className={cn(SIZES[size], radius, className)}>
			{avatarUrl && (
				<AvatarImage src={avatarUrl} alt={name} className={radius} />
			)}
			<AvatarFallback
				className={cn(
					"bg-surface-elevated text-text-primary font-medium",
					radius,
				)}
			>
				{fallback || (name ? initials : <User className="size-3.5" />)}
			</AvatarFallback>
		</Avatar>
	);
}

export default EntityAvatar;
