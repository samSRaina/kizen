import {
  ArrowRight,
  CircleDot,
  Gauge,
  LayoutPanelTop,
  MousePointer2,
  Move,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "DOCS", href: "#features" },
  { label: "EXAMPLES", href: "#examples" },
  { label: "UI", href: "#ui" },
  { label: "AI KIT", href: "#ai" },
];

export interface FeatureItem {
  number: string;
  title: string;
  description: string;
  code: string;
  icon: LucideIcon;
  color: "lime" | "blue" | "purple" | "orange" | "yellow" | "pink" | "cyan" | "green";
}

export const FEATURES: FeatureItem[] = [
  {
    number: "01",
    title: "Independent transforms",
    description: "Animate x, y, rotate, and scale on the same element, without wrappers.",
    code: '{ rotate: 15, x: "50%" }',
    icon: Move,
    color: "lime",
  },
  {
    number: "02",
    title: "Scroll animation",
    description: "Hardware-accelerated scroll-linked motion via the ScrollTimeline API.",
    code: "scroll()",
    icon: ArrowRight,
    color: "blue",
  },
  {
    number: "03",
    title: "Native gestures",
    description: "Hover, press, and drag interactions that feel native, not bolted on.",
    code: "drag = true",
    icon: MousePointer2,
    color: "purple",
  },
  {
    number: "04",
    title: "Layout animation",
    description: "Animate between any two layouts with a single layout prop.",
    code: "layout = true",
    icon: LayoutPanelTop,
    color: "orange",
  },
  {
    number: "05",
    title: "Spring physics",
    description: "Real spring math for animations that naturally react to user input.",
    code: 'type = "spring"',
    icon: Zap,
    color: "yellow",
  },
  {
    number: "06",
    title: "Exit animation",
    description: "Keep elements alive so they can animate as they leave the DOM.",
    code: "exit = { ... }",
    icon: CircleDot,
    color: "pink",
  },
  {
    number: "07",
    title: "Timeline sequences",
    description: "Variants, stagger, and timelines orchestrate complex motion.",
    code: "stagger(0.04)",
    icon: Sparkles,
    color: "cyan",
  },
  {
    number: "08",
    title: "Motion values",
    description: "Use live motion values to drive animations and derived state.",
    code: "useTransform(() => x.get())",
    icon: Gauge,
    color: "green",
  },
];

export interface ExampleItem {
  title: string;
  type: "JS" | "React";
  className: string;
}

export const EXAMPLES: ExampleItem[] = [
  { title: "Three.js TSL particle morph", type: "JS", className: "example-particles" },
  { title: "Confetti", type: "React", className: "example-confetti" },
  { title: "Typewriter", type: "React", className: "example-typewriter" },
  { title: "iOS App Folder", type: "React", className: "example-folder" },
  { title: "iOS pointer animation", type: "React", className: "example-pointer" },
  { title: "Pokopia: Modal", type: "React", className: "example-modal" },
];

export interface ReleaseItem {
  version: string;
  title: string;
  date: string;
}

export const RELEASES: ReleaseItem[] = [
  { version: "13.2.0", title: "Added threeEffect and vgpuEffect", date: "NEW" },
  { version: "13.1.1", title: "Improved React 19 compatibility", date: "18 AUG" },
  { version: "13.1.0", title: "Multidimensional reorder support", date: "10 AUG" },
  { version: "13.0.0", title: "Smaller, faster, more capable", date: "05 AUG" },
];
