import { cn } from "@/lib/utils";

export interface LogoProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
	const sizeClasses = {
		sm: "text-base",
		md: "text-lg",
		lg: "text-2xl",
	}[size];

	return (
		<div
			className={cn(
				"flex items-center space-x-2.5 group cursor-pointer select-none",
				className,
			)}
		>
			<span
				className={cn("font-extrabold tracking-tight uppercase", sizeClasses)}
			>
				Kizen
			</span>
		</div>
	);
}

export default Logo;
