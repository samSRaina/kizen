import React from "react";
import { Menu, Search, X } from "lucide-react";

interface NavbarActionsProps {
  onSearchClick: () => void;
  onMotionPlusClick: () => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
  className?: string;
}

export function NavbarActions({
  onSearchClick,
  onMotionPlusClick,
  menuOpen,
  onMenuToggle,
  className = "",
}: NavbarActionsProps) {
  return (
    <div className={`flex items-center gap-2.5 md:gap-4 ${className}`}>
      {/* Search Button */}
      <button
        type="button"
        onClick={onSearchClick}
        className="p-1.5 text-black hover:opacity-60 transition-opacity cursor-pointer flex items-center justify-center"
        aria-label="Search documentation"
      >
        <Search size={17} strokeWidth={2.4} />
      </button>

      {/* MOTION+ Sturdy Rectangular Button */}
      <button
        type="button"
        onClick={onMotionPlusClick}
        className="bg-black hover:bg-neutral-900 text-white px-3.5 md:px-4 py-1.5 md:py-2 font-mono text-[11px] md:text-xs font-bold tracking-wider uppercase rounded-none transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
      >
        MOTION+
      </button>

      {/* Mobile Menu Hamburger Button */}
      <button
        type="button"
        className="md:hidden p-1 text-black hover:opacity-60 transition-opacity cursor-pointer flex items-center justify-center"
        aria-label="Toggle mobile menu"
        onClick={onMenuToggle}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
