import { CornerDownRight } from "lucide-react";
import type { ReactNode } from "react";

interface ReferenceCardProps {
	category?: string;
	title: string;
	description?: string;
	badgeText?: string;
	badgeIcon?: ReactNode;
	badgeVariant?: "default" | "emerald" | "amber" | "rose" | "sky";
	trailingIcon?: ReactNode;
	onClick?: () => void;
	className?: string;
}

export function ReferenceCard({
	category,
	title,
	description,
	badgeText,
	badgeIcon,
	badgeVariant = "default",
	trailingIcon,
	onClick,
	className = "",
}: ReferenceCardProps) {
	const getBadgeClasses = () => {
		switch (badgeVariant) {
			case "emerald":
				return "bg-emerald-950/70 text-emerald-400";
			case "amber":
				return "bg-amber-950/70 text-amber-300";
			case "rose":
				return "bg-rose-950/70 text-rose-300";
			case "sky":
				return "bg-sky-950/70 text-sky-300";
			default:
				return "bg-[#1c1c24] text-[#a1a1aa]";
		}
	};

	return (
		<button
			type="button"
			onClick={onClick}
			className={`group w-full bg-[#121216] hover:bg-[#1a1a20] hover:-translate-y-0.5 rounded-2xl p-4 sm:p-5 transition-all duration-150 flex flex-col justify-between text-left cursor-pointer min-h-[140px] ${className}`}
		>
			<div className="w-full">
				{/* Top Category / Subtitle */}
				{category && (
					<p className="text-[11px] text-[#8e8e96] italic font-normal tracking-wide truncate">
						{category}
					</p>
				)}

				{/* Card Main Title */}
				<h3 className="text-sm sm:text-[15px] font-medium text-[#ededef] group-hover:text-white mt-1.5 leading-snug line-clamp-2">
					{title}
				</h3>

				{/* Optional Description */}
				{description && (
					<p className="text-xs text-[#71717a] mt-1.5 line-clamp-2 leading-relaxed">
						{description}
					</p>
				)}
			</div>

			{/* Bottom Action Row (seamless without separating border) */}
			<div className="w-full mt-4 flex items-center justify-between pt-1">
				{badgeText ? (
					<span
						className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center gap-1.5 ${getBadgeClasses()}`}
					>
						{badgeIcon}
						<span>{badgeText}</span>
					</span>
				) : (
					<span />
				)}

				<span className="text-[#71717a] group-hover:text-white transition-colors p-1">
					{trailingIcon || (
						<CornerDownRight className="w-4 h-4 stroke-[1.75]" />
					)}
				</span>
			</div>
		</button>
	);
}
