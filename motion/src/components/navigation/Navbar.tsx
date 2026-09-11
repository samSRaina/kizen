import React, { useState } from "react";
import { toast } from "sonner";
import { MotionLogo } from "@/components/brand/MotionLogo";
import { NavLinks } from "./NavLinks";
import { NavbarActions } from "./NavbarActions";
import { MobileNav } from "./MobileNav";

interface NavbarProps {
  className?: string;
  onSearch?: () => void;
  onMotionPlus?: () => void;
}

export function Navbar({ className = "", onSearch, onMotionPlus }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    } else {
      toast("Search is ready — type to find documentation and examples");
    }
  };

  const handleMotionPlus = () => {
    if (onMotionPlus) {
      onMotionPlus();
    } else {
      toast("Motion+ Early Access reference");
    }
  };

  return (
    <div
      className={`w-full sticky top-2.5 md:top-3.5 z-50 pointer-events-none select-none ${className}`}
    >
      <header className="section-frame pointer-events-auto bg-[#ffd000] text-black h-12 md:h-14 px-3.5 md:px-5 flex items-center justify-between rounded-none shadow-xl relative">
        {/* Brand Logo & Wordmark */}
        <MotionLogo />

        {/* Navigation Links */}
        <NavLinks />

        {/* Search & Actions */}
        <NavbarActions
          onSearchClick={handleSearch}
          onMotionPlusClick={handleMotionPlus}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((prev) => !prev)}
        />

        {/* Mobile Navigation Drawer */}
        <MobileNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </header>
    </div>
  );
}
