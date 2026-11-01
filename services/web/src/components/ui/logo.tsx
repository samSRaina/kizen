import { cn } from "#/lib/utils";

export interface LogoProps {
	className?: string;
	size?: "sm" | "md" | "lg";
	showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
	const iconSizes = {
		sm: "w-4 h-4",
		md: "w-5 h-5",
		lg: "w-7 h-7",
	}[size];

	const textSizes = {
		sm: "text-sm",
		md: "text-base",
		lg: "text-xl",
	}[size];

	return (
		<div
			className={cn(
				"flex items-center space-x-2 group cursor-pointer select-none",
				className,
			)}
		>
			{/* Industrial Brutalist Mark */}
			<div
				className={cn(
					"bg-text-primary text-canvas flex items-center justify-center font-mono font-black shrink-0 tracking-tighter",
					iconSizes,
				)}
			>
				<span className="text-[10px] leading-none">KZ</span>
			</div>
			{showText ? (
				<span
					className={cn(
						"font-extrabold tracking-tight uppercase font-sans text-text-primary",
						textSizes,
					)}
				>
					Kizen
				</span>
			) : null}
		</div>
	);
}

export default Logo;
