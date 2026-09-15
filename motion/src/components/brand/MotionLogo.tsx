import React from "react";

interface MotionLogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function MotionLogo({ className = "", showWordmark = true }: MotionLogoProps) {
  return (
    <a
      href="#top"
      className={`inline-flex items-center gap-2.5 group cursor-pointer select-none ${className}`}
      aria-label="Motion home"
    >
      {/* Motion Brand Icon: 3 parallel slanted strokes + dot */}
      <svg
        className="w-7 h-4 text-black shrink-0"
        viewBox="0 0 28 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line
          x1="3.5"
          y1="14"
          x2="8"
          y2="2"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <line
          x1="10.5"
          y1="14"
          x2="15"
          y2="2"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <line
          x1="17.5"
          y1="14"
          x2="22"
          y2="2"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="26" cy="5.5" r="2.2" fill="currentColor" />
      </svg>

      {showWordmark && (
        <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-black">
          Motion
        </span>
      )}
    </a>
  );
}
