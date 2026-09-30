---
name: radix-heroicons-motion
description: Design system and frontend component guidelines for Kizen using Radix UI primitives, Heroicons (@heroicons/react), and Motion (motion.dev). Use when authoring, modifying, or reviewing React frontend components, animations, dropdowns, dialogs, icons, and interactive elements.
metadata:
  version: "1.0.0"
---

# Kizen Frontend Architecture: Radix UI, Heroicons, & Motion

All frontend components and pages across Kizen must strictly use **Radix UI**, **Heroicons**, and **Motion** (`motion/react`).

## 1. Component Primitives: Radix UI
- Build accessible, unstyled UI primitives via `@radix-ui/react-*` wrapped cleanly under `@/components/ui/`.
- Accessible components already wrapped include:
  - `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator` (`@/components/ui/dropdown-menu`)
  - `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` (`@/components/ui/dialog`)
  - `Avatar`, `AvatarImage`, `AvatarFallback` (`@/components/ui/avatar`)
  - `Popover`, `Tooltip`, `Select`, `Tabs`, `Separator`, `ScrollArea`
- Always preserve keyboard navigation, focus management (`outline-none focus:ring-*`), and ARIA attributes supplied by Radix.

## 2. Iconography: Heroicons
- Exclusively import icons from `@heroicons/react/24/outline` (or `/solid` when filled contrast is required).
- Do NOT use Lucide, FontAwesome, or ad-hoc SVG paths for standard UI actions.
- Standard mappings:
  - User sign out: `ArrowRightStartOnRectangleIcon`
  - Chevrons & Carets: `ChevronDownIcon`, `ChevronRightIcon`, `ChevronUpIcon`
  - Actions: `TrashIcon`, `PlusIcon`, `CheckIcon`, `XMarkIcon`
  - Loading: `ArrowPathIcon` with `animate-spin`
  - Details / External: `ArrowUpRightIcon`
  - Money / Billing: `CurrencyDollarIcon`

## 3. Micro-Interactions & Animations: Motion (motion.dev)
- Use `motion` (imported from `motion/react`) for page transitions, element mounting/unmounting, list staggering, hover lifts, and modals.
- Common patterns:
  - Dropdown & popover entrance:
    ```tsx
    import { motion } from "motion/react";

    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    />
    ```
  - Card hover lifting:
    ```tsx
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    />
    ```
  - AnimatePresence for conditional banners, toasts, and modals:
    ```tsx
    import { AnimatePresence, motion } from "motion/react";

    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        />
      )}
    </AnimatePresence>
    ```

## 4. Visual Language & Aesthetics
- High-density, minimal, editorial aesthetics:
  - Monospace tags: `font-mono text-[11px] uppercase tracking-wider`
  - Backgrounds: `bg-[var(--paper)]`, `bg-[var(--card)]`, `bg-white`
  - Inks: `text-[var(--ink)]`, muted subtitles `text-[var(--muted)]`
  - Borders: `border border-[var(--line)]`
  - Crisp corners: `rounded-none` or `rounded-sm` (sharp edges align with Kizen's Swiss architectural feel).
