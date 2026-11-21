export function WaveformIcon({
	className = "w-3.5 h-3.5",
}: {
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			role="img"
			aria-label="Gemini Waveform"
		>
			<title>Gemini Waveform</title>
			{/* 3 audio wave bars */}
			<rect x="5" y="8" width="2.5" height="9" rx="1.25" />
			<rect x="10" y="5" width="2.5" height="15" rx="1.25" />
			<rect x="15" y="9" width="2.5" height="8" rx="1.25" />
			{/* Sparkle in top-right */}
			<path d="M20 3C20 4.2 20.8 5 22 5C20.8 5 20 5.8 20 7C20 5.8 19.2 5 18 5C19.2 5 20 4.2 20 3Z" />
		</svg>
	);
}
