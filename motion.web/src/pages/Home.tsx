import React from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { ExamplesSection } from "@/components/sections/ExamplesSection";
import { MotionUiSection } from "@/components/sections/MotionUiSection";
import { AiKitSection } from "@/components/sections/AiKitSection";
import { ReleasesSection } from "@/components/sections/ReleasesSection";

export default function Home() {
  return (
    <div className="site-shell">
      <div className="top-noise" />

      {/* Top Framing and Announcement Bar */}
      {/*<div className="w-full border-b border-white/[0.08] bg-[#080909] text-xs text-neutral-400 py-1.5 px-4 text-center font-mono select-none hidden md:block">
        <span className="opacity-75">
          with Motion's easy-to-use API, from simple transitions to complex gestures
        </span>
      </div>*/}

      {/* Sturdy Rectangular Navigation Bar */}
      <Navbar />

      {/* Semantic Page Content Sections */}
      <main id="top">
        <HeroSection />
        <FeaturesSection />
        <ExamplesSection />
        <MotionUiSection />
        <AiKitSection />
        <ReleasesSection />
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
