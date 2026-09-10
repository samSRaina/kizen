import React from "react";
import { Flame, Cpu } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center p-0.5 rounded-lg bg-black/50 border border-white/10 text-xs font-mono">
      <button
        onClick={() => setTheme("industrial")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
          theme === "industrial"
            ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm"
            : "text-gray-400 hover:text-white"
        }`}
        title="Industrial Amber Theme"
      >
        <Flame size={12} className={theme === "industrial" ? "text-amber-400" : "text-gray-500"} />
        <span>Industrial</span>
      </button>

      <button
        onClick={() => setTheme("slate")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
          theme === "slate"
            ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40 shadow-sm"
            : "text-gray-400 hover:text-white"
        }`}
        title="Engineering Slate Theme"
      >
        <Cpu size={12} className={theme === "slate" ? "text-sky-400" : "text-gray-500"} />
        <span>Slate</span>
      </button>
    </div>
  );
}
