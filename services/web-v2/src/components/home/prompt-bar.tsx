import { Mic, Plus, ShieldCheck } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { WaveformIcon } from "#/components/icons/waveform-icon";
import { ModelSelector } from "./model-selector";
import { ProjectSelector } from "./project-selector";

interface PromptBarProps {
	onSubmit?: (prompt: string) => void;
	placeholder?: string;
	initialProjectId?: string | null;
}

export function PromptBar({
	onSubmit,
	placeholder = "Ask anything, @ to mention, / for actions",
	initialProjectId = null,
}: PromptBarProps) {
	const [input, setInput] = useState("");
	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
		initialProjectId,
	);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (input.trim()) {
				onSubmit?.(input.trim());
				setInput("");
			}
		}
	};

	const handleWaveformClick = () => {
		if (input.trim()) {
			onSubmit?.(input.trim());
			setInput("");
		}
	};

	return (
		<div className="w-full max-w-[640px] bg-[#0c0c10] rounded-2xl pt-2 pb-2 px-2 shadow-2xl flex flex-col gap-1.5 transition-all">
			{/* Top Bar inside Container: Project Selector */}
			<div className="flex items-center px-1">
				<ProjectSelector
					selectedProjectId={selectedProjectId}
					onSelectProject={setSelectedProjectId}
				/>
			</div>

			{/* Main Input Box (seamless background) */}
			<div className="w-full bg-[#15151a] rounded-xl px-3.5 pt-2 pb-2 flex flex-col gap-1 transition-colors">
				<textarea
					ref={textareaRef}
					rows={1}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="w-full bg-transparent border-none outline-none text-[13px] text-[#ededef] placeholder-[#71717a] resize-none leading-relaxed tracking-normal font-sans py-1 field-sizing-content"
				/>

				{/* Bottom Action Controls inside Prompt Container */}
				<div className="flex items-center justify-between pt-1 select-none">
					{/* Left icons: Plus + Model Selector */}
					<div className="flex items-center gap-1 text-[#8e8e96]">
						<button
							type="button"
							title="Attach file or context"
							aria-label="Attach file or context"
							className="p-1 hover:text-[#f4f4f5] hover:bg-white/[0.04] rounded transition-colors cursor-pointer"
						>
							<Plus className="w-3.5 h-3.5" />
						</button>
						<ModelSelector />
					</div>

					{/* Right icons: Auto shield + Mic + Waveform Send */}
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="flex items-center gap-1 text-xs text-[#8e8e96] hover:text-[#ededef] hover:bg-white/[0.04] px-1.5 py-0.5 rounded transition-colors cursor-pointer select-none"
						>
							<ShieldCheck className="w-3.5 h-3.5 text-[#71717a]" />
							<span className="text-[11px] font-normal">Auto</span>
							<span className="text-[10px] opacity-60">⌄</span>
						</button>

						<button
							type="button"
							title="Voice input"
							aria-label="Voice input"
							className="p-1 text-[#8e8e96] hover:text-[#f4f4f5] hover:bg-white/[0.04] rounded transition-colors cursor-pointer"
						>
							<Mic className="w-3.5 h-3.5" />
						</button>

						<button
							type="button"
							title="Send prompt"
							aria-label="Send prompt"
							onClick={handleWaveformClick}
							className="w-7 h-7 rounded-full bg-white hover:bg-zinc-200 active:scale-95 flex items-center justify-center text-black transition-all cursor-pointer shadow-md ml-0.5"
						>
							<WaveformIcon className="w-4 h-4 text-black" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
