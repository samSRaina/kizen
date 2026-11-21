import { ChevronDown, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface AIModel {
	id: string;
	name: string;
	tier: "Flash" | "Pro";
	speed: "High" | "Standard";
	contextWindow: string;
	default?: boolean;
}

export const AVAILABLE_MODELS: AIModel[] = [
	{
		id: "gemini-3.8-flash-high",
		name: "Gemini 3.8 Flash",
		tier: "Flash",
		speed: "High",
		contextWindow: "1M tokens",
		default: true,
	},
	{
		id: "gemini-3.8-pro",
		name: "Gemini 3.8 Pro",
		tier: "Pro",
		speed: "Standard",
		contextWindow: "2M tokens",
	},
	{
		id: "gemini-3.0-flash",
		name: "Gemini 3.0 Flash",
		tier: "Flash",
		speed: "High",
		contextWindow: "1M tokens",
	},
];

interface ModelSelectorProps {
	selectedModelId?: string;
	onSelectModel?: (model: AIModel) => void;
}

export function ModelSelector({
	selectedModelId = "gemini-3.8-flash-high",
	onSelectModel,
}: ModelSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedModel =
		AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ||
		AVAILABLE_MODELS[0];

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative inline-block" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-[#a1a1aa] hover:text-[#ededef] hover:bg-white/[0.04] transition-colors cursor-pointer select-none"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
			>
				<span className="font-normal text-[12px]">{selectedModel.name}</span>
				{selectedModel.speed && (
					<span className="text-[10px] text-[#71717a] font-normal">
						{selectedModel.speed}
					</span>
				)}
				<ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
			</button>

			{isOpen && (
				<div
					role="listbox"
					className="absolute left-0 bottom-full mb-1.5 w-60 rounded-lg bg-[#18181f] shadow-2xl p-1 z-50 text-xs"
				>
					<div className="px-2 py-1 text-[10px] uppercase font-semibold text-[#71717a] tracking-wider">
						Model Selection
					</div>
					{AVAILABLE_MODELS.map((model) => (
						<button
							key={model.id}
							type="button"
							role="option"
							aria-selected={model.id === selectedModel.id}
							onClick={() => {
								onSelectModel?.(model);
								setIsOpen(false);
							}}
							className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-white/[0.06] transition-colors flex items-center justify-between ${
								model.id === selectedModel.id
									? "text-white font-medium bg-white/[0.04]"
									: "text-[#a1a1aa]"
							}`}
						>
							<div className="flex flex-col">
								<span className="font-medium text-[12px]">{model.name}</span>
								<span className="text-[10px] text-[#71717a]">
									{model.speed} · {model.contextWindow}
								</span>
							</div>
							{model.tier === "Pro" && (
								<ShieldCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
