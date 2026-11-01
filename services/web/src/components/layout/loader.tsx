import { Loader2 } from "lucide-react";
import { cn } from "#/lib/utils";

export interface LoaderProps {
	className?: string;
	size?: "sm" | "md" | "lg";
	message?: string;
}

export function Loader({ className, size = "md", message }: LoaderProps) {
	const iconSizes = {
		sm: "w-4 h-4",
		md: "w-6 h-6",
		lg: "w-8 h-8",
	}[size];

	return (
		<div
			className={cn(
				"py-12 flex flex-col items-center justify-center space-y-3 text-text-muted select-none",
				className,
			)}
		>
			<Loader2 className={cn("animate-spin text-text-primary", iconSizes)} />
			{message ? (
				<span className="text-xs font-mono tracking-wider uppercase text-text-secondary">
					{message}
				</span>
			) : null}
		</div>
	);
}

export default Loader;
