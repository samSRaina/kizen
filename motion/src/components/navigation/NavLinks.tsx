import React from "react";
import { NAV_ITEMS, type NavItem } from "@/data/motion-content";

interface NavLinksProps {
  className?: string;
  items?: NavItem[];
  onItemClick?: (item: NavItem) => void;
}

export function NavLinks({ className = "", items = NAV_ITEMS, onItemClick }: NavLinksProps) {
  return (
    <nav className={`hidden md:flex items-center gap-5 lg:gap-8 ${className}`}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          onClick={() => onItemClick?.(item)}
          className="font-mono text-xs font-bold tracking-widest text-black hover:opacity-60 transition-opacity uppercase"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
