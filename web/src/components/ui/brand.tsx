import { cn } from "@/lib/utils";

interface BrandProps {
	className?: string;
}

export function Brand({ className }: BrandProps) {
	return (
		<div className={cn("logo-mark text-[var(--ink)] dark:text-[#f4f4f5]", className)}>
			<span className="logo-k">K</span>
			<span>izen</span>
			<i />
		</div>
	);
}

export default Brand;
