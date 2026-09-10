import React from "react";
import { NAV_ITEMS, type NavItem } from "@/data/motion-content";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  items?: NavItem[];
}

export function MobileNav({ isOpen, onClose, items = NAV_ITEMS }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 right-0 bg-[#ffd000] border-t border-black/15 p-4 flex flex-col gap-2 shadow-xl z-50 rounded-none animate-in fade-in slide-in-from-top-2 duration-150">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <a
            key={item.label}
            href={item.href}
            onClick={onClose}
            className={`font-mono text-xs font-bold tracking-widest text-black uppercase py-2.5 ${
              isLast ? "" : "border-b border-black/10"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}
