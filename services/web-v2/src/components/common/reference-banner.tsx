import type { ReactNode } from "react";

interface ReferenceBannerProps {
	title: string;
	description: string;
	buttonText: string;
	onButtonClick?: () => void;
	icon?: ReactNode;
}

export function ReferenceBanner({
	title,
	description,
	buttonText,
	onButtonClick,
	icon,
}: ReferenceBannerProps) {
	return (
		<div className="w-full bg-[#131317] hover:bg-[#18181f] rounded-2xl p-5 sm:p-6 transition-colors duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div className="flex items-start gap-4">
				{icon && (
					<div className="w-10 h-10 rounded-xl bg-[#1c1c24] flex items-center justify-center text-[#d4d4d8] shrink-0 mt-0.5">
						{icon}
					</div>
				)}
				<div>
					<h3 className="text-base sm:text-lg font-semibold text-[#f4f4f5]">
						{title}
					</h3>
					<p className="text-xs sm:text-sm text-[#8e8e96] mt-1 max-w-xl leading-relaxed">
						{description}
					</p>
				</div>
			</div>

			<button
				type="button"
				onClick={onButtonClick}
				className="h-9 px-4 rounded-xl bg-[#22222b] hover:bg-[#2c2c36] active:scale-95 text-xs font-medium text-[#f4f4f5] transition-all cursor-pointer shrink-0 self-start sm:self-auto"
			>
				{buttonText}
			</button>
		</div>
	);
}
