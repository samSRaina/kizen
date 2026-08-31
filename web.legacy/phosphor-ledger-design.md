Rebuild this design in your project. Match it exactly: same layout,
typography, color, spacing, radius, shadow, and motion. Do not invent
new visuals.

## design.md

# Phosphor Ledger — Style Reference
> Phosphor-indigo terminal grid for keyboard-first sprint tracking.

**Theme:** dark

The signature move is a dense, scanline-textured canvas where every row feels like a process list, and the active workspace in the right rail glows indigo against the near-black ground. Base is #0E0F11, surfaces step to #1A1B1E, and indigo #5E6AD2 is the sole chromatic accent on active states and sprint status chips. JetBrains Mono at weight 500 keeps all numerals and IDs sharp under dense spacing of 8-12px row gaps. The tension is that the terminal aesthetic risks feeling impersonal for freelance client work, so the user profile card at the top of the right rail humanizes the shell.

**Ground truth (computed from tokens + reference HTML):** dark theme · page #0e0f11 · ink #e7e8ea · primary #5e6ad2 · secondary #3d3f5a · applied action color #3d3f5a · display "Manrope" · body "Satoshi". Where the description above conflicts with these values or the Reference HTML, the tokens and HTML are authoritative.

## Tokens: Colors

| Name | Value | Token | Role | Usage | Contrast |
|------|-------|-------|------|-------|----------|
| Canvas | `#0e0f11` | `--gesso-canvas` | Page background, the floor everything sits on. | Outermost background: body, full-bleed sections. Mirrors Neutral 50. | n/a |
| Surface recessed | `#0b0b0d` | `--gesso-surface-recessed` | Sunken surface below the canvas. | Inset wells: input fields, progress tracks, code blocks. | n/a |
| Surface | `#1a1b1e` | `--gesso-surface` | Card and panel fill, raised above the canvas. | Cards, panels, sheets, table rows. Mirrors Neutral 100. | n/a |
| Surface elevated | `#3f3f42` | `--gesso-surface-elevated` | Top elevation tier. | Modals, dropdowns, popovers, tooltips. | n/a |
| Divider | `rgba(255,255,255,0.04)` | `--gesso-divider` | Hairline borders and separators. | 1px rules between rows and sections. Never for text. | n/a |
| Foreground | `#e7e8ea` | `--gesso-fg` | Primary text and high-emphasis icons. | Body copy, headings, primary icons. Mirrors Neutral 900. | AA 4.5:1 on canvas (guaranteed) |
| Foreground muted | `#a7aab0` | `--gesso-fg-muted` | Secondary text. | Captions, metadata, placeholders, disabled labels. Mirrors Neutral 600. | AA 3.0:1 on canvas (guaranteed) |
| Primary | `#5e6ad2` | `--gesso-primary` | Brand accent, FILL only (alias: --gesso-accent). | CTA fills, active and selected states, focus rings. 2 to 3 per screen. Do NOT use as text, reach for --gesso-accent-text. | Pair with --gesso-on-accent for the label on top. |
| On primary | `#FFFFFF` | `--gesso-on-accent` | Text and icons on a filled primary. | Label color for buttons and chips filled with --gesso-primary. | Contrast-derived against --gesso-primary. |
| Accent (as text) | `#6e79d7` | `--gesso-accent-text` | AA-safe accent for text and icons. | Use THIS for accent-colored links, headings, and icons. Use --gesso-primary for fills. | AA 4.5:1 on canvas (guaranteed). |
| Secondary | `#3d3f5a` | `--gesso-secondary` | Supporting brand accent. | Secondary fills, logo discs, supporting highlights. | Pair with on-fill text per --gesso-on-accent. |
| Secondary (as text) | `#818294` | `--gesso-accent-2-text` | AA-safe secondary for text. | Secondary accent used as text or icons. | AA 4.5:1 on canvas (guaranteed). |
| Neutral 50 | `#0e0f11` | `--gesso-neutral-50` | Page background. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 100 | `#1a1b1e` | `--gesso-neutral-100` | Surface. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 200 | `#333438` | `--gesso-neutral-200` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 300 | `#4e4f53` | `--gesso-neutral-300` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 400 | `#6a6c71` | `--gesso-neutral-400` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 500 | `#888a90` | `--gesso-neutral-500` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 600 | `#a7aab0` | `--gesso-neutral-600` | Muted text and dividers. | Ramp access by step; prefer the role token above where one exists. | AA 3.0:1 on canvas. |
| Neutral 700 | `#bcbec3` | `--gesso-neutral-700` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 800 | `#d1d3d6` | `--gesso-neutral-800` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 900 | `#e7e8ea` | `--gesso-neutral-900` | Primary text. | Ramp access by step; prefer the role token above where one exists. | AA 4.5:1 on canvas. |
| Neutral 950 | `#eaebed` | `--gesso-neutral-950` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Success | `#16A34A` | `--gesso-success` | Positive signals (gains, completed states). | Meaning only, never decoration. | AA 3.0:1 on canvas, chroma-floored distinct. |
| Warning | `#D97706` | `--gesso-warning` | Caution states. | Meaning only, never decoration. | AA 3.0:1 on canvas, chroma-floored distinct. |
| Error | `#e55c5c` | `--gesso-error` | Errors, destructive actions, negative signals. | Meaning only, never decoration. | AA 3.0:1 on canvas, chroma-floored distinct. |
| Data 1 | `#4046ab` | `--gesso-data-1` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 2 | `#545fc5` | `--gesso-data-2` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 3 | `#6a77e0` | `--gesso-data-3` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 4 | `#8090fc` | `--gesso-data-4` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 5 | `#9faeff` | `--gesso-data-5` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 6 | `#bfcbff` | `--gesso-data-6` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |

## Tokens: Typography

### Manrope — Display. Headings, hero copy, large numerical specimens. · `--gesso-font-display`
- **Weights:** 400, 500, 600, 700
- **Line height:** 1.1
- **Letter spacing:** -0.02em
- **Role:** Display. Headings, hero copy, large numerical specimens.

### Satoshi — Body. Paragraphs, labels, UI chrome. · `--gesso-font-body`
- **Weights:** 400, 500, 600, 700
- **Line height:** 1.5
- **Letter spacing:** 0em
- **Role:** Body. Paragraphs, labels, UI chrome.

### Satoshi — Mono. Code, numerical tickers, mono-spaced metadata. · `--gesso-font-mono`
- **Weights:** 400, 500, 600, 700
- **Line height:** 1.4
- **Letter spacing:** 0em
- **Role:** Mono. Code, numerical tickers, mono-spaced metadata.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| H1 | 36px | 1.2 | — | `--gesso-text-4xl` |
| H2 | 28px | 1.2 | — | `--gesso-text-3xl` |
| H3 | 22px | 1.2 | — | `--gesso-text-2xl` |
| Body | 14px | 1.5 | — | `--gesso-text-base` |
| Caption | 10px | 1.5 | — | `--gesso-text-xs` |

## Tokens: Spacing & Shapes

**Base unit:** 4px

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| space-1 | 4px | `--gesso-space-1` |
| space-2 | 8px | `--gesso-space-2` |
| space-3 | 12px | `--gesso-space-3` |
| space-4 | 16px | `--gesso-space-4` |
| space-6 | 24px | `--gesso-space-6` |
| space-8 | 32px | `--gesso-space-8` |
| space-12 | 48px | `--gesso-space-12` |
| space-16 | 64px | `--gesso-space-16` |
| space-24 | 96px | `--gesso-space-24` |
| space-32 | 128px | `--gesso-space-32` |

### Border Radius

| Element | Value |
|---------|-------|
| none | 0px |
| sm | 4px |
| md | 8px |
| lg | 12px |
| full | 9999px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| sm | `none` | `--gesso-shadow-sm` |
| md | `none` | `--gesso-shadow-md` |
| lg | `0 1px 2px rgba(0,0,0,0.04)` | `--gesso-shadow-lg` |

### Layout

- **Page max-width:** 1280px
- **Section gap:** 80px
- **Container max-width:** 1280px
- **Grid columns:** 12
- **Grid gutter:** 24px
- **Outer margin:** 64px
- **Section padding:** 80px

## Breakpoints

| Name | Min Width |
|------|-----------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

## Components

### Container
**Role:** Page-level width constraint and 12-column grid wrapper.

Max-width var(--container-max-width) (1280px), centered via margin-inline auto, horizontal padding var(--outer-margin) (64px; drop to 24-32px below the md breakpoint). Vertical rhythm var(--section-padding) (80px) per band. Multi-column regions use display:grid with grid-template-columns: repeat(var(--grid-columns), 1fr) (12) and gap var(--grid-gutter) (24px); children span column ranges (span 6 = half, span 4 = third).

### Navigation Bar
**Role:** Top-anchored primary navigation. One per page.

Full-bleed bar, height 64-72px, inner contents constrained to var(--container-max-width) with var(--outer-margin) inline padding. Logo left, primary links centered or left-grouped, one primary CTA right. Links in --gesso-font-body weight 500, color --gesso-neutral-700 (#BCBED4); hover/active resolve to --gesso-neutral-900 (#e7e8ea). CTA is the Primary Button. Transparent over a hero, then sticky with a --gesso-neutral-50 (#0e0f11) fill and 1px --gesso-neutral-200 bottom border once scrolled. z-index 100.

### Hero Section
**Role:** Above-the-fold headline band. Sets the first impression.

Fills the upper 55-70% of the viewport with var(--section-padding) vertical breathing room, constrained to the Container. Headline in --gesso-font-display (Manrope) at 2.25rem, weight 700, line-height 1.05-1.1, never italic. Subcopy in body font at --gesso-text-lg, color --gesso-neutral-600 (#8a8d96), max-width ~60ch. Primary + Secondary Button pair beneath. Left-aligned for a marketing scroll, centered for a landing hero.

### Card
**Role:** Container surface for content groupings.

Background --gesso-neutral-50 (#0e0f11), border 1px solid --gesso-neutral-200 (#22232E), border-radius var(--gesso-radius-md) (8px), padding 24px, --gesso-shadow-sm. Body font for content; display font for any embedded headline. Text fg --gesso-neutral-900 (#e7e8ea). In a grid, cards span 3-6 of the 12 columns.

### Primary Button
**Role:** Highest-emphasis action. Reserved for the main CTA per section.

Background --gesso-primary (#5e6ad2), text auto-picked for max contrast (white or near-black), padding 12px 24px, border-radius var(--gesso-radius-md) (8px), font-family --gesso-font-body, font-weight 600. Hover: mix toward --gesso-fg by 10-12%. Use 1-2 per section, never more. The reference screen applies #3d3f5a as its dominant on-screen action color; follow the Reference HTML for color application.

### Secondary Button
**Role:** Supporting action next to a primary CTA.

Background transparent, border 1.5px solid --gesso-primary (#5e6ad2), text --gesso-primary, padding 12px 24px (minus 1.5px each axis to compensate for the border), border-radius var(--gesso-radius-md) (8px), body font, weight 600.

### Input
**Role:** Single-line text entry. Default form field.

Background --gesso-neutral-100 (#1a1b1e), border 1px solid --gesso-neutral-300 (#33354A), border-radius var(--gesso-radius-md) (8px), padding 12px 16px, body font. Focus: border --gesso-primary, ring 3px --gesso-primary at 14% alpha.

### Footer
**Role:** Page-closing navigation and legal. One per page.

Full-bleed block with a top 1px --gesso-neutral-200 (#22232E) divider, var(--section-padding) vertical padding, contents constrained to var(--container-max-width). Multi-column link groups (grid, 2-4 columns): group headings at body weight 600, links --gesso-neutral-600 (#8a8d96) resolving to --gesso-neutral-900 on hover. Logo and copyright row pinned along the bottom.

### Badge
**Role:** Compact label for status, tags, counts.

Background --gesso-primary (#5e6ad2) at 12% alpha, text --gesso-primary, padding 8px 12px, border-radius var(--gesso-radius-full) (9999px), font-size 12px, body font, weight 600, uppercase, letter-spacing 0.04em.

## Do's and Don'ts

### Do

- One clean grotesque/geometric sans across the board (Inter / SF / system-ui), with at most a mono only for codes. Display = semibold-to-bold (600-700) headlines at comfortable but not oversized scale; body = regular 400 charcoal; metadata labels = regular in muted grey, often slightly smaller. Tight-to-normal tracking, no all-caps except tiny section eyebrows (DEPART / ARRIVE) which get +0.04em.
- Tone-locked light. canvas = #FFFFFF to #F7F7F5 (near-white, faintly warm-neutral ground); surface = pure #FFFFFF flat cards lifted off canvas; ink = charcoal #1A1A1A / #222 (never pure black for body); muted = grey #8A8A8E for labels and inactive nav. One sparing accent only, an orange (#E8632A-ish) OR a muted moss green (#5A6B2F) used for the single primary CTA, active tab, and key data emphasis; semantic green/red reserved for status deltas. Accent occupies <=10% of any screen.
- Generous whitespace is the defining posture; layout is functional and grid-aligned on an 8px rhythm. Web (1280): calm multi-column shell, slim left nav, list column, roomy detail pane, with numbered/stepped content blocks separated by hairlines and lots of air. Never crowd; let labels breathe.
- Apply --gesso-primary (#5e6ad2) to a maximum of 2-3 elements per screen: a button, a highlight, a badge. Never paint large areas with primary.
- Use --gesso-radius-md (8px) for cards and inputs, --gesso-radius-full for badges and avatars. Inner radii inside a parent: subtract the parent's padding from its radius.
- Build hierarchy with the neutral scale, not extra hues. 90%+ of any screen should be neutrals; chromatic colors carry meaning, never decoration.

### Don't

- Never use playful multi-color blocks or filled colored cards, accent appears on at most ONE element per region
- Never use raw/oversized display type or heavy black weights as decoration
- Never add drop shadows beyond a single near-invisible ambient lift; no stacked or colored shadows
- Never wrap cards in visible borders, use a white-on-near-white ground and hairline dividers instead
- Don't use Inter as the display font. It's the most overused font in tech. Pick something with character from the fontHints display list.
- Don't use #3B82F6 / indigo-600 as primary unless explicitly briefed. Default blue is the hallmark of a generic SaaS aesthetic.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Page | `#0e0f11` | Default page background. The lightest surface. |
| 1 | Raised | `#1a1b1e` | Cards, panels, sidebars: anything that sits on top of the page. |
| 2 | Sunken | `#22232E` | Inset surfaces (search bars, code blocks, disabled fields). |
| 3 | Overlay | `#0e0f11` | Modals and floating panels. Same hue as page; depth comes from --gesso-shadow-lg. |

## Agent Prompt Guide

**Quick Color Reference**

- Primary: #5e6ad2
- Secondary: #3d3f5a
- Page bg: #0e0f11
- Body fg: #e7e8ea
- Muted fg: #a7aab0
- Success: #16A34A

**Example Component Prompts**

1. Build a content container. max-width var(--container-max-width) (1280px), margin-inline auto, padding-inline var(--outer-margin) (64px, 24px below md). Wrap every section in it so the page shares one measure.

2. Build a responsive top navigation bar. Full-bleed, height 64-72px, inner row capped at var(--container-max-width) with var(--outer-margin) inline padding. Logo left, links centered (color #BCBED4, hover #e7e8ea), primary CTA right (bg #5e6ad2, weight 600). Transparent over the hero, sticky #0e0f11 fill + 1px #22232E border on scroll. Collapse links to a menu button below 768px.

3. Build a hero band. Constrain to var(--container-max-width) with var(--section-padding) vertical padding. Headline display font (Manrope) at 2.25rem weight 700, never italic; subcopy body font (Satoshi) max-width 60ch color #8a8d96; primary + secondary CTA row beneath.

4. Build a 12-column responsive grid section. display:grid; grid-template-columns: repeat(12, 1fr); gap var(--grid-gutter) (24px); inside var(--container-max-width) + var(--outer-margin). Cards span 4 columns (3-up) on desktop, span 6 (2-up) at md, span 12 below sm.

5. Build a footer. Full-bleed with a top 1px #22232E divider, var(--section-padding) vertical padding, contents at var(--container-max-width). 3-4 link-group columns (headings weight 600, links #8a8d96), logo + copyright row pinned along the bottom.

## Similar Brands

- **Linear** — Modern SaaS reference: restrained palette, gridded layout.
- **Stripe** — Clean, confident system with strong type hierarchy.
- **Vercel** — Black-and-white discipline with a single high-impact accent.

## Screens

### 1. Phosphor Ledger

- Role: screen

<details><summary>HTML</summary>

```html
<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<style id="gesso-foundation">*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}html,body{width: 100%;min-height: 100vh;overflow-x:clip;max-width:100%;}body{font-family:var(--gesso-font-body,system-ui),sans-serif;color:var(--gesso-fg,#0a0a0a);background:var(--gesso-canvas,#ffffff);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.4;}img,svg{display:block;max-width:100%;}button{font:inherit;color:inherit;background:none;border:none;cursor:pointer;}a{color:inherit;text-decoration:none;}</style>
<style id="gesso-text-wrap">h1,h2,h3{text-wrap:balance}p,li,figcaption,blockquote{text-wrap:pretty}</style>
<style id="gesso-font-smoothing">html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}</style>
<style>/* gesso-icon-base v1 */
.ic { display: inline-block; width: 16px; height: 16px; vertical-align: -0.125em; flex-shrink: 0; line-height: 0; }
.ic svg { width: 100%; height: 100%; display: block; }
svg.ic { width: 16px; height: 16px; display: inline-block; vertical-align: -0.125em; flex-shrink: 0; }
.ic[data-icon-style="line"] { stroke-width: var(--ic-stroke, 2); }
.ic[data-icon-style="line"] svg path, .ic[data-icon-style="line"] svg circle, .ic[data-icon-style="line"] svg rect, .ic[data-icon-style="line"] svg line, .ic[data-icon-style="line"] svg polyline, .ic[data-icon-style="line"] svg polygon { stroke-width: inherit; }
.ic-sm { --ic-stroke: 2.25; }
.ic-xs { --ic-stroke: 2.5; }
svg.ic-lg, .ic-lg svg { width: 24px; height: 24px; }
svg.ic-xl, .ic-xl svg { width: 32px; height: 32px; }
svg.ic-2xl, .ic-2xl svg { width: 32px; height: 32px; }
.ic-lg { --ic-stroke: 1.75; }
.ic-xl { --ic-stroke: 1.5; }
.ic-2xl { --ic-stroke: 1.5; }
button { border: 0; background: transparent; padding: 0; font: inherit; color: inherit; cursor: pointer; -webkit-appearance: none; appearance: none; }
</style>

<style id="gesso-responsive-shell">html,body{width:100%!important;max-width:100%!important;min-width:0;overflow-x:hidden}@media (max-width:1279.98px){*{min-width:0}h1,h2,h3,h4,h5,h6,p,td,th{min-width:min-content}}@media (min-width:1280px){*{min-width:auto}:where(nav,header){column-gap:24px}:where(nav a,header a){white-space:nowrap}}img,svg,video,canvas,iframe,table{max-width:100%}</style><style id="gesso-mobile-web-layer">.gesso-nav-check,.gesso-nav-burger{display:none}@media (max-width: 640px){.rail{grid-column:1/-1!important;grid-row:auto!important}}@media (max-width: 480px){nav,nav ul,header ul{flex-wrap:wrap}nav a,header ul a{display:inline-block}table{display:block;overflow-x:auto;min-width:0!important;max-width:100%}[data-gesso-flexwrap]{flex-wrap:wrap}h1,h2,h3{overflow-wrap:break-word}[data-gesso-pinned-height]{height:auto!important;min-height:0!important}.gesso-nav-check{display:block;position:absolute;width:1px;height:1px;margin:0;opacity:0;pointer-events:none}.gesso-nav-check:focus-visible+.gesso-nav-burger{outline:2px solid currentColor;outline-offset:2px}.gesso-nav-burger{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;cursor:pointer;flex-shrink:0;border-radius:8px}.gesso-nav-burger span{display:block;position:relative;width:18px;height:2px;border-radius:1px;background:currentColor}.gesso-nav-burger span::before,.gesso-nav-burger span::after{content:"";position:absolute;left:0;width:18px;height:2px;border-radius:1px;background:currentColor;transition:transform 150ms ease}.gesso-nav-burger span::before{top:-6px}.gesso-nav-burger span::after{top:6px}.gesso-nav-check:checked~.gesso-nav-burger span{background:transparent}.gesso-nav-check:checked~.gesso-nav-burger span::before{transform:translateY(6px) rotate(45deg)}.gesso-nav-check:checked~.gesso-nav-burger span::after{transform:translateY(-6px) rotate(-45deg)}[data-gesso-navlinks]{display:none!important}.gesso-nav-check:checked~[data-gesso-navlinks]{display:flex!important;flex-direction:column;align-items:stretch;flex-basis:100%;min-width:100%;order:99}.shell{width:100%!important;max-width:100%!important}.shell{grid-template-columns:1fr!important}.shell>*{grid-column:1/-1!important;grid-row:auto!important}.topbar-actions{flex-wrap:wrap}.btn{flex-wrap:wrap}.status-row{grid-template-columns:1fr!important}.status-row>*{grid-column:1/-1!important;grid-row:auto!important}.tabs{flex-wrap:wrap}.toolbar-actions{flex-wrap:wrap}.icon-btn{flex-wrap:wrap}.composer{flex-wrap:wrap}.list-panel-head{flex-wrap:wrap}.issue-row{flex-wrap:wrap}.issue-priority{flex-wrap:wrap}.issue-assignee{flex-wrap:wrap}.project-row{flex-wrap:wrap}.rail-profile{flex-wrap:wrap}.rail-avatar{flex-wrap:wrap}.rail-item{flex-wrap:wrap}.rail-workspace{flex-wrap:wrap}}@media (prefers-reduced-motion: reduce){.gesso-nav-burger span::before,.gesso-nav-burger span::after{transition:none}}</style><style id="comment-css-rail-nav-mtdwuk60">[data-brief-id="rail-nav"] button[aria-label="Enter fullscreen"] svg {
  display: none !important;
}

[data-brief-id="rail-nav"] button[aria-label="Enter fullscreen"]::after {
  content: ">>" !important;
  font-family: var(--gesso-font-mono) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  color: inherit !important;
  letter-spacing: -1px !important;
}
</style><!--gesso-fonts:start--><style>@font-face{font-family:"Manrope";font-style:normal;font-weight:200 800;font-display:swap;src:url(/fonts/Manrope-Variable.woff2) format("woff2");}@font-face{font-family:"Satoshi";font-style:normal;font-weight:300;font-display:swap;src:url(/fonts/Satoshi-300.woff2) format("woff2");}@font-face{font-family:"Satoshi";font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/Satoshi-400.woff2) format("woff2");}@font-face{font-family:"Satoshi";font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/Satoshi-500.woff2) format("woff2");}@font-face{font-family:"Satoshi";font-style:normal;font-weight:700;font-display:swap;src:url(/fonts/Satoshi-700.woff2) format("woff2");}@font-face{font-family:"Satoshi";font-style:normal;font-weight:900;font-display:swap;src:url(/fonts/Satoshi-900.woff2) format("woff2");}</style><style id="gesso-font-lock">:root{--gesso-font-display:"Manrope", system-ui, -apple-system, sans-serif !important;--gesso-font-body:"Satoshi", system-ui, -apple-system, sans-serif !important;--gesso-font-mono:"Satoshi", ui-monospace, "JetBrains Mono", monospace !important;}</style><!--gesso-fonts:end-->
</head>
<body>
<meta name="x-visual-moves" content="Channeled Charcoal Shell's dark near-black canvas + Violet Ledger's electric indigo accent (#5E6AD2) as the single interactive signal — muted highlight row for active nav, thin line icons beside labels. Fused Mercury's account-list rail density with ElevenLabs' analytics header pattern into a sidebar-on-right dashboard: workspace switcher pinned above icon nav, issues list as the dense work surface, sprint metrics as a quiet status row. JetBrains Mono carries every numeral for that terminal-ledger precision.">

<style>
:root{
  --gesso-canvas:#0E0F11;
  --gesso-surface:#1A1B1E;
  --gesso-surface-elevated:#212328;
  --gesso-surface-recessed:#131417;
  --gesso-fg:#E7E8EA;
  --gesso-fg-muted:#8A8D96;
  --gesso-divider:rgba(255,255,255,0.05);
  --gesso-accent:#5E6AD2;
  --gesso-accent-2:#3D3F5A;
  --gesso-on-accent:#FFFFFF;
  --gesso-success:#3DCB7A;
  --gesso-warning:#E0A93D;
  --gesso-error:#EF4444;
  --gesso-data-1:#4046ab;
  --gesso-data-2:#545fc5;
  --gesso-data-3:#6a77e0;
  --gesso-data-4:#8090fc;
  --gesso-data-5:#9faeff;
  --gesso-data-6:#bfcbff;
  --gesso-primary:var(--gesso-accent);
  --gesso-secondary:var(--gesso-accent-2);
  --gesso-neutral-50:var(--gesso-canvas);
  --gesso-neutral-900:var(--gesso-fg);
  --gesso-radius-sm:4px; --gesso-radius-md:8px; --gesso-radius-lg:12px; --gesso-radius-full:9999px;
  --gesso-shadow-sm:none; --gesso-shadow-md:none; --gesso-shadow-lg:0 1px 2px rgba(0,0,0,0.3);
  --gesso-duration-fast:120ms; --gesso-easing-default:ease-out;
  --gesso-font-display:"Manrope", system-ui, -apple-system, sans-serif;
  --gesso-font-body:"Satoshi", system-ui, -apple-system, sans-serif;
  --gesso-mono:"JetBrains Mono",monospace;
}
*{box-sizing:border-box}
html,body{width:100%;min-height:100%;overflow-x:hidden}
body{
  background:var(--gesso-canvas);color:var(--gesso-fg);
  font-family:var(--gesso-font-body);
  padding-inline:clamp(20px,5vw,64px);
  padding-block:24px;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.shell{
  max-width:1280px;margin-inline:auto;
  display:grid;
  grid-template-columns:1fr 240px;
  gap:24px;
  min-height:calc(100vh - 48px);
}
@media (max-width:1024px){ .shell{grid-template-columns:1fr 200px; gap:16px;} }
@media (max-width:640px){ .shell{grid-template-columns:1fr;} .rail{order:-1; flex-direction:row; height:auto; padding:12px;} }

/* TOPBAR */
.topbar{
  grid-column:1/-1;
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 4px 20px;
  flex-wrap:wrap;gap:16px;
}
.topbar .title-group{display:flex;flex-direction:column;gap:4px}
.topbar h1{font-family:var(--gesso-font-display);font-weight:700;font-size:clamp(22px,2vw,26px);line-height:1.15;margin:0}
.topbar .sub{color:var(--gesso-fg-muted);font-size:13px}
.topbar-actions{display:flex;align-items:center;gap:12px}
.btn{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--gesso-font-body);font-size:13px;font-weight:500;
  padding:8px 20px;border-radius:var(--gesso-radius-full);
  cursor:pointer;border:none;white-space:nowrap;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default), opacity var(--gesso-duration-fast) var(--gesso-easing-default), transform 80ms ease-out;
}
.btn-primary{background:var(--gesso-accent);color:var(--gesso-on-accent)}
.btn-primary:hover{background:color-mix(in oklch, var(--gesso-accent) 88%, black)}
.btn-primary:active{transform:translateY(1px) scale(0.98)}
.btn-primary:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.btn-ghost{background:transparent;color:var(--gesso-accent);padding:8px 16px}
.btn-ghost:hover{background:rgba(255,255,255,0.05)}
.btn-ghost:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}

/* HEADER band (status row + toolbar) */
.header-band{grid-column:1/2;display:flex;flex-direction:column;gap:20px;margin-bottom:4px}
.status-row{
  display:grid;grid-template-columns:repeat(3,1fr);gap:32px;
  padding-bottom:20px;border-bottom:1px solid var(--gesso-divider);
}
.status-cell{display:flex;flex-direction:column;gap:8px}
.status-num{font-family:var(--gesso-mono);font-weight:700;font-size:32px;line-height:34px;color:var(--gesso-fg);font-variant-numeric:tabular-nums}
.status-label{font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--gesso-fg-muted)}
.status-delta{font-size:12px;color:var(--gesso-fg-muted);font-family:var(--gesso-mono)}
.status-delta.up{color:var(--gesso-success)}

.toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.tabs{display:flex;gap:4px}
.tab{
  font-family:var(--gesso-font-body);font-size:13px;font-weight:500;color:var(--gesso-fg-muted);
  background:transparent;border:none;padding:8px 16px;border-radius:var(--gesso-radius-full);cursor:pointer;
  transition:color var(--gesso-duration-fast) var(--gesso-easing-default), background var(--gesso-duration-fast) var(--gesso-easing-default);
}
.tab:hover{background:rgba(255,255,255,0.05)}
.tab[aria-selected="true"]{color:var(--gesso-accent);background:rgba(94,106,210,0.1)}
.tab:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.toolbar-actions{display:flex;align-items:center;gap:8px}
.icon-btn{
  display:inline-flex;align-items:center;justify-content:center;
  width:32px;height:32px;border-radius:var(--gesso-radius-md);
  background:transparent;border:none;color:var(--gesso-fg-muted);cursor:pointer;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default), color var(--gesso-duration-fast) var(--gesso-easing-default);
}
.icon-btn:hover{background:rgba(255,255,255,0.05);color:var(--gesso-fg)}
.icon-btn:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}

/* WORK SURFACE */
.work-surface{grid-column:1/2;display:flex;flex-direction:column;gap:24px}

.composer{
  display:flex;align-items:center;gap:12px;
  padding:16px 16px;background:var(--gesso-surface-recessed);
  border-radius:var(--gesso-radius-md);
}
.composer svg{color:var(--gesso-fg-muted);flex-shrink:0}
.composer input{
  flex:1;background:transparent;border:none;color:var(--gesso-fg);
  font-family:var(--gesso-font-body);font-size:14px;outline:none;
}
.composer input::placeholder{color:var(--gesso-fg-muted)}
.composer .btn-primary{padding:8px 16px;font-size:12px}

.list-panel{display:flex;flex-direction:column}
.list-panel-head{display:flex;align-items:center;justify-content:space-between;padding:4px 0 12px}
.list-panel-head h2{font-family:var(--gesso-font-display);font-size:15px;font-weight:700;margin:0}
.list-panel-head .count{font-family:var(--gesso-mono);font-size:12px;color:var(--gesso-fg-muted)}

.issue-row{
  display:flex;align-items:center;gap:16px;
  padding:16px 4px;
  border-top:1px solid var(--gesso-divider);
  cursor:pointer;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default);
}
.issue-row:first-child{border-top:none}
.issue-row:hover{background:linear-gradient(rgba(255,255,255,0.04),rgba(255,255,255,0.04))}
.issue-key{font-family:var(--gesso-mono);font-size:12px;color:var(--gesso-fg-muted);flex-shrink:0;width:64px}
.issue-priority{flex-shrink:0;display:flex;align-items:center;color:var(--gesso-fg-muted)}
.issue-priority.high{color:var(--gesso-error)}
.issue-priority.med{color:var(--gesso-warning)}
.issue-title{flex:1;font-size:14px;color:var(--gesso-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.issue-status{
  flex-shrink:0;font-family:var(--gesso-mono);font-size:11px;letter-spacing:0.04em;
  padding:4px 12px;border-radius:var(--gesso-radius-full);text-transform:uppercase;
  background:rgba(255,255,255,0.05);color:var(--gesso-fg-muted);white-space:nowrap;
}
.issue-status.progress{color:var(--gesso-accent);background:rgba(94,106,210,0.12)}
.issue-status.review{color:var(--gesso-warning);background:rgba(224,169,61,0.12)}
.issue-due{flex-shrink:0;font-family:var(--gesso-mono);font-size:12px;color:var(--gesso-fg-muted);width:56px;text-align:right}
.issue-assignee{
  flex-shrink:0;width:28px;height:28px;border-radius:50%;
  background:var(--gesso-surface-elevated);color:var(--gesso-fg);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--gesso-font-body);font-size:11px;font-weight:600;
}

.project-rows{display:flex;flex-direction:column}
.project-row{
  display:flex;align-items:center;gap:16px;padding:16px 4px;
  border-top:1px solid var(--gesso-divider);
}
.project-row:first-child{border-top:none}
.project-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.project-name{flex:1;font-size:14px;color:var(--gesso-fg)}
.project-client{font-size:12px;color:var(--gesso-fg-muted);width:160px;flex-shrink:0}
.project-bar-track{width:120px;height:4px;border-radius:var(--gesso-radius-full);background:var(--gesso-surface-recessed);overflow:hidden;flex-shrink:0}
.project-bar-fill{height:100%;background:var(--gesso-accent);border-radius:var(--gesso-radius-full)}
.project-pct{font-family:var(--gesso-mono);font-size:12px;color:var(--gesso-fg-muted);width:36px;text-align:right;flex-shrink:0}

/* RAIL — right side */
.rail{
  grid-column:2/3;
  display:flex;flex-direction:column;
  background:var(--gesso-surface);
  border-radius:var(--gesso-radius-lg);
  padding:16px 12px;
  height:fit-content;
  gap:4px;
}
.rail-profile{
  display:flex;align-items:center;gap:12px;
  padding:12px 8px;border-radius:var(--gesso-radius-md);
  cursor:pointer;margin-bottom:8px;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default);
}
.rail-profile:hover{background:rgba(255,255,255,0.05)}
.rail-profile:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.rail-avatar{width:32px;height:32px;border-radius:50%;background:var(--gesso-accent-2);color:var(--gesso-fg);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;font-family:var(--gesso-font-body)}
.rail-profile-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.rail-profile-name{font-size:13px;font-weight:600;color:var(--gesso-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rail-profile-role{font-size:11px;color:var(--gesso-fg-muted)}
.rail-profile svg:last-child{color:var(--gesso-fg-muted);flex-shrink:0}

.rail-section-label{
  font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--gesso-fg-muted);
  padding:16px 8px 8px;
}
.rail-item{
  display:flex;align-items:center;gap:12px;
  padding:8px 8px;border-radius:var(--gesso-radius-md);
  color:var(--gesso-fg-muted);font-size:13px;font-weight:500;
  cursor:pointer;text-decoration:none;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default), color var(--gesso-duration-fast) var(--gesso-easing-default);
}
.rail-item svg{flex-shrink:0}
.rail-item:hover{background:rgba(255,255,255,0.05);color:var(--gesso-fg)}
.rail-item:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.rail-item[aria-current="true"]{background:rgba(94,106,210,0.12);color:var(--gesso-accent)}
.rail-item .badge-count{
  margin-left:auto;font-family:var(--gesso-mono);font-size:11px;color:var(--gesso-fg-muted);
}

.rail-workspace{
  display:flex;align-items:center;gap:12px;
  padding:8px 8px;border-radius:var(--gesso-radius-md);
  cursor:pointer;transition:background var(--gesso-duration-fast) var(--gesso-easing-default);
}
.rail-workspace:hover{background:rgba(255,255,255,0.05)}
.rail-workspace:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.rail-workspace[aria-current="true"]{background:rgba(94,106,210,0.12)}
.ws-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.rail-workspace-name{flex:1;min-width:0;font-size:13px;color:var(--gesso-fg-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rail-workspace[aria-current="true"] .rail-workspace-name{color:var(--gesso-fg);font-weight:600}
.rail-workspace-count{font-family:var(--gesso-mono);font-size:11px;color:var(--gesso-fg-muted);flex-shrink:0}
.rail-spacer{flex:1}
.rail-bottom{display:flex;flex-direction:column;gap:2px;margin-top:8px;padding-top:8px;border-top:1px solid var(--gesso-divider)}
</style>

<script data-gesso-contrast="">(function(){
function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}
var run=function(){
  function lin(c){c=c/255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
  function lum(rgb){return 0.2126*lin(rgb[0])+0.7152*lin(rgb[1])+0.0722*lin(rgb[2]);}
  function ratio(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
  // Computed colors are NOT always rgb(): color-mix / relative-color /
  // wide-gamut authored values serialize as color(srgb r g b / a) (and
  // exotic spaces as their own functions). The old rgb-only regex made
  // every such element INVISIBLE to this floor (field bug 2026-08-18:
  // 1.05:1 filter chips authored via color-mix shipped unremediated).
  // Fast paths for rgb()/color(srgb); everything else resolves through
  // a 1x1 canvas, memoized per unique string.
  var colorCanvas=null,colorMemo={};
  function parseRgb(s){curl -fsSL https://code.kimi.com/kimi-code/install.sh | bash
    if(!s)return null;
    if(Object.prototype.hasOwnProperty.call(colorMemo,s))return colorMemo[s];
    var out=null;
    var m=s.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if(m){out=[+m[1],+m[2],+m[3],m[4]!=null?+m[4]:1];}
    else{
      m=s.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\)$/);
      if(m){
        var al=m[4]!=null?(m[4].indexOf('%')>=0?parseFloat(m[4])/100:+m[4]):1;
        out=[Math.round(+m[1]*255),Math.round(+m[2]*255),Math.round(+m[3]*255),al];
      }else if(s!=='transparent'&&s.indexOf('url(')<0){
        try{
          if(!colorCanvas)colorCanvas=document.createElement('canvas');
          colorCanvas.width=1;colorCanvas.height=1;
          var cx2=colorCanvas.getContext('2d',{willReadFrequently:true});
          if(cx2){
            cx2.clearRect(0,0,1,1);
            cx2.fillStyle=s;
            cx2.fillRect(0,0,1,1);
            var px=cx2.getImageData(0,0,1,1).data;
            out=[px[0],px[1],px[2],px[3]/255];
          }
        }catch(e){out=null;}
      }
    }
    colorMemo[s]=out;
    return out;
  }
  // One stop matcher for gradient strings: rgb() and color(srgb) forms.
  var STOP_RE_SRC="(rgba?\\([^)]*\\)|color\\(srgb[^)]*\\))(?:\\s+(-?[\\d.]+)%)?";
  // The LAST linear-gradient in a background-image shorthand paints at the
  // BOTTOM of the stack: that is the base page/card color layer.
  function lastLinearGradient(bi){
    var at=bi.lastIndexOf('linear-gradient(');
    if(at<0)return null;
    var i=at+16,depth=1;
    while(i<bi.length&&depth>0){var ch=bi[i];if(ch==='(')depth++;else if(ch===')')depth--;i++;}
    return bi.slice(at+16,i-1);
  }
  // The gradient's color AT the element's position. A page-scale dusk
  // gradient can span 1.2:1-dark at the top and 4.5:1-light at the bottom;
  // sampling one stop for every element (the old behavior) measured all of
  // them against the same color and passed genuinely unreadable text.
  function gradientColorAt(bi,host,cx,cy){
    var g=lastLinearGradient(bi);
    if(g==null)return null;
    var hr=host.getBoundingClientRect();
    if(!hr.width||!hr.height)return null;
    var tx=Math.min(1,Math.max(0,(cx-hr.left)/hr.width));
    var ty=Math.min(1,Math.max(0,(cy-hr.top)/hr.height));
    var t=ty; // default axis: to bottom
    var head=g.split(',')[0]||'';
    var ang=head.match(/^\s*(-?[\d.]+)deg/);
    if(/^\s*to top\b/.test(head))t=1-ty;
    else if(/^\s*to right\b/.test(head))t=tx;
    else if(/^\s*to left\b/.test(head))t=1-tx;
    else if(ang){
      var a=((+ang[1])%360+360)%360;
      if(a<45||a>=315)t=1-ty;
      else if(a<135)t=tx;
      else if(a<225)t=ty;
      else t=1-tx;
    }
    var re=new RegExp(STOP_RE_SRC,"g"),mm;
    var stops=[];
    while((mm=re.exec(g))!==null){
      var c=parseRgb(mm[1]);
      if(c)stops.push({c:c,p:mm[2]!=null?(+mm[2])/100:null});
    }
    if(!stops.length)return null;
    if(stops[0].p==null)stops[0].p=0;
    if(stops[stops.length-1].p==null)stops[stops.length-1].p=1;
    for(var i2=1;i2<stops.length;i2++){
      if(stops[i2].p==null)stops[i2].p=stops[i2-1].p+(1-stops[i2-1].p)/(stops.length-i2);
    }
    var a1=stops[0],b1=stops[stops.length-1];
    for(var j=0;j<stops.length-1;j++){
      if(t>=stops[j].p&&t<=stops[j+1].p){a1=stops[j];b1=stops[j+1];break;}
    }
    var span=b1.p-a1.p;
    var f=span>0?(t-a1.p)/span:0;
    return[
      a1.c[0]+(b1.c[0]-a1.c[0])*f,
      a1.c[1]+(b1.c[1]-a1.c[1])*f,
      a1.c[2]+(b1.c[2]-a1.c[2])*f,
      a1.c[3]+(b1.c[3]-a1.c[3])*f
    ];
  }
  // Effective background at the element's own position: walk up compositing
  // EVERY paint layer (translucent card washes included; the old walk
  // ignored anything below 0.5 alpha, so a 0.3-alpha haze over a gradient
  // never entered the measurement) and interpolate gradients where the text
  // actually sits.
  function bgOf(el){
    var er=el.getBoundingClientRect();
    var cx=er.left+er.width/2,cy=er.top+er.height/2;
    var acc=null; // [r,g,b,coverage], layers accumulated top-down
    function put(c){
      if(!acc){acc=[c[0],c[1],c[2],c[3]];return;}
      var a1=acc[3],a2=c[3]*(1-a1),ao=a1+a2;
      if(ao<=0)return;
      acc=[(acc[0]*a1+c[0]*a2)/ao,(acc[1]*a1+c[1]*a2)/ao,(acc[2]*a1+c[2]*a2)/ao,ao];
    }
    for(var n=el;n&&n!==document.documentElement;n=n.parentElement){
      var cs=getComputedStyle(n);
      var bi=cs.backgroundImage;
      if(bi&&bi!=='none'&&bi.indexOf('gradient')>=0){
        var gc=gradientColorAt(bi,n,cx,cy);
        if(!gc){
          // Radial/conic or unparseable: keep the old base-layer heuristic
          // (last >= 0.5-alpha stop; low-alpha stops are overlays).
          var re2=new RegExp(STOP_RE_SRC,"g"),m2,op=null,any=null;
          while((m2=re2.exec(bi))!==null){
            var c2=parseRgb(m2[1]);
            if(!c2)continue;
            if(c2[3]>=0.5)op=c2;
            else if(c2[3]>0&&!any)any=c2;
          }
          gc=op||any;
        }
        if(gc){put([gc[0],gc[1],gc[2],Math.min(1,gc[3])]);if(acc&&acc[3]>=0.99)break;}
      }
      var c=parseRgb(cs.backgroundColor);
      if(c&&c[3]>0){put(c);if(acc[3]>=0.99)break;}
    }
    if(!acc)return[255,255,255];
    if(acc[3]<0.99)put([255,255,255,1]);
    return[Math.round(acc[0]),Math.round(acc[1]),Math.round(acc[2])];
  }
  function opaqueBg(cs){
    var c=parseRgb(cs.backgroundColor);
    if(c&&c[3]>0.5)return true;
    var bi=cs.backgroundImage;
    if(bi&&bi!=='none'&&bi.indexOf('gradient')>=0){
      var re=new RegExp(STOP_RE_SRC,"g"), mm;
      while((mm=re.exec(bi))!==null){var cc=parseRgb(mm[1]);if(cc&&cc[3]>=0.5)return true;}
    }
    return false;
  }
  // The element whose opaque background the text visually sits on (nearest
  // opaque ancestor; the page body as the floor).
  function bgHostOf(el){
    for(var n=el;n&&n!==document.documentElement;n=n.parentElement){
      if(opaqueBg(getComputedStyle(n)))return n;
    }
    return document.body;
  }
  // Is this text painted OVER a raster photo? bgOf() only sees solid/gradient
  // backgrounds, so without this an authored light-on-photo headline reads as
  // light-on-the-card-color, fails contrast, and gets flipped to BLACK — which
  // then lands unreadable on the actual photo. The photo covers the text's
  // bg-host only when a media box (img/video/picture, >=24px) is a DESCENDANT
  // of that host (so it paints over the host's background, under the text) and
  // its rect contains the text's center. This excludes: text in a sibling block
  // BELOW a hero image (geometry), and text inside its OWN opaque pill/chip
  // that floats over a photo (the pill, not the photo, is the bg-host — its
  // media set is empty), so those keep normal contrast remediation.
  function overImage(el){
    var er=el.getBoundingClientRect();
    if(!er.width||!er.height)return false;
    var cx=er.left+er.width/2, cy=er.top+er.height/2;
    var host=bgHostOf(el);
    var medias=host.querySelectorAll('img,video,picture');
    for(var j=0;j<medias.length;j++){
      var m=medias[j];
      if(m.contains(el))continue;
      var mr=m.getBoundingClientRect();
      if(mr.width<24||mr.height<24)continue;
      if(cx>=mr.left&&cx<=mr.right&&cy>=mr.top&&cy<=mr.bottom)return true;
    }
    return false;
  }
  // Walk leaf-text elements only. Skip status-bar (its fg is intentionally
  // light over arbitrary content), the tab bar (handled by its own pass below
  // so label and icon move TOGETHER), and elements the screen marked opt-out
  // via data-allow-low-contrast.
  // The bar selector must match every way the bar gets tagged: the addressable
  // pass labels it data-brief-role="nav-bottom" (NOT "tab-bar"), buttons carry
  // role "tab", and some bars only carry the class / id — guarding on the lone
  // role "tab-bar" lets a "nav-bottom" bar's labels through and splits them.
  var els=document.querySelectorAll('body *');
  var TAB_BAR_SKIP='[data-brief-role="tab-bar"],[data-brief-role="nav-bottom"],[data-brief-role="tab"],[data-brief-id="tab-bar"],nav.tab-bar,nav.tabbar,nav.bottom-nav,nav.nav-bar,nav.navbar';
  // Catastrophic-only floor. WCAG-level thresholds (4.5:1 / 3:1) made this
  // script re-litigate authored muted/tinted text tiers; readability belongs
  // to the scorer's contrast dimension. Below 2:1 the text is genuinely
  // unreadable, so only then do we intervene — but we remediate the whole
  // AUTHORED INK, not the lone element. One ink painted across a page-scale
  // gradient fails at the dark end and squeaks past the floor at the light
  // end; flipping only the sub-2 elements leaves the same paragraph half
  // white, half black. So: group leaf text by (bg-host, computed color); a
  // group with any sub-2 member flips per-element to the better pole, and
  // only where that pole IMPROVES the element's own local ratio (a member
  // already better off stays put).
  var groups={},order=[];
  for(var i=0;i<els.length;i++){
    var el=els[i];
    if(el.children.length||!el.textContent||!el.textContent.trim())continue;
    if(el.closest&&(el.closest('[data-brief-role="status-bar"]')||el.closest(TAB_BAR_SKIP)||el.closest('[data-allow-low-contrast]')))continue;
    var cs=getComputedStyle(el);
    var fg=parseRgb(cs.color);
    if(!fg||fg[3]<0.1)continue;
    if(overImage(el)){
      // Text over a photo: bgOf() measured the card color, not the photo, so
      // any verdict here is a guess. Do NOTHING: never flip to black (the old
      // bug) and never force light either (the forced rgba(255,255,255,.94)
      // misfired on light photos and authored scrims). The designer owns
      // photo-overlay treatment.
      continue;
    }
    var bg=bgOf(el);
    // Measure the ink the user SEES: low-alpha text sits far closer to its
    // background than its raw color claims (0.62-alpha cream on tan reads
    // 2.2:1 raw but 1.7:1 composited).
    var eff=fg[3]<1?[fg[0]*fg[3]+bg[0]*(1-fg[3]),fg[1]*fg[3]+bg[1]*(1-fg[3]),fg[2]*fg[3]+bg[2]*(1-fg[3])]:fg;
    var r=ratio([eff[0],eff[1],eff[2]],bg);
    var host=bgHostOf(el);
    var key=(host.getAttribute&&host.getAttribute('data-brief-id')||host.tagName)+'|'+cs.color;
    if(!groups[key]){groups[key]={members:[],bad:false};order.push(key);}
    groups[key].members.push({el:el,bg:bg,r:r});
    if(r<2)groups[key].bad=true;
  }
  for(var k=0;k<order.length;k++){
    var g2=groups[order[k]];
    if(!g2.bad)continue;
    for(var m3=0;m3<g2.members.length;m3++){
      var mem=g2.members[m3];
      var rB=ratio([0,0,0],mem.bg),rW=ratio([255,255,255],mem.bg);
      var best=Math.max(rB,rW);
      if(best<=mem.r)continue;
      mem.el.style.color=rB>rW?'rgba(0,0,0,0.92)':'rgba(255,255,255,0.92)';
    }
  }
  // Tab bar: label and icon are PINNED to one color (enforceTabBarLabelColor),
  // so the main pass skips the bar rather than split them. But a pinned pair
  // can still be pinned to an unreadable color (cream labels over a light
  // gradient tail). Remediate per tab ITEM, moving label + icon together:
  // inherited color for everything riding currentColor, plus explicit
  // fill/stroke attributes (fill="none" stays none). The original alpha keeps
  // the active/inactive hierarchy, floored at 0.85 so the flip actually reads.
  var bars=document.querySelectorAll(TAB_BAR_SKIP);
  for(var b3=0;b3<bars.length;b3++){
    var bar=bars[b3];
    if(bar.closest('[data-allow-low-contrast]'))continue;
    var labels=bar.querySelectorAll('*');
    var seen=[];
    for(var l3=0;l3<labels.length;l3++){
      var lab=labels[l3];
      if(lab.children.length||!lab.textContent||!lab.textContent.trim())continue;
      var lcs=getComputedStyle(lab);
      var lfg=parseRgb(lcs.color);
      if(!lfg||lfg[3]<0.1)continue;
      var lbg=bgOf(lab);
      var leff=lfg[3]<1?[lfg[0]*lfg[3]+lbg[0]*(1-lfg[3]),lfg[1]*lfg[3]+lbg[1]*(1-lfg[3]),lfg[2]*lfg[3]+lbg[2]*(1-lfg[3])]:lfg;
      if(ratio([leff[0],leff[1],leff[2]],lbg)>=2)continue;
      var item=lab;
      for(var p3=lab.parentElement;p3&&p3!==bar;p3=p3.parentElement)item=p3;
      if(seen.indexOf(item)>=0)continue;
      seen.push(item);
      var pole=ratio([0,0,0],lbg)>ratio([255,255,255],lbg)?[0,0,0]:[255,255,255];
      var subs=item.querySelectorAll('*');
      for(var s3=-1;s3<subs.length;s3++){
        var sub=s3<0?item:subs[s3];
        var scs=getComputedStyle(sub);
        var sfg=parseRgb(scs.color);
        var al2=Math.max(sfg?sfg[3]:1,0.85);
        sub.style.color='rgba('+pole[0]+','+pole[1]+','+pole[2]+','+al2+')';
        if(sub.tagName==='path'||sub.tagName==='PATH'||sub.getAttribute){
          var fa=sub.getAttribute&&sub.getAttribute('fill');
          if(fa&&fa!=='none'&&fa!=='currentColor')sub.style.fill='currentColor';
          var sa=sub.getAttribute&&sub.getAttribute('stroke');
          if(sa&&sa!=='none'&&sa!=='currentColor')sub.style.stroke='currentColor';
        }
      }
    }
  }
};
ready(run);
// Single pass, on purpose. The old window.load re-run (added so overImage()
// saw decoded media geometry) visibly re-flipped text after the user was
// already reading the screen. overImage() is now skip-only, so a missed
// photo at DOMContentLoaded costs at most one skipped remediation, not a
// wrong recolor; that trade is worth losing the late flip.
})();</script><script id="__GESSO_TOKEN_BRIDGE__">
window.addEventListener("message", function(e) {
  var d = e && e.data;
  if (!d || d.type !== "gesso-tokens" || !d.vars) return;
  var root = document.documentElement;
  for (var k in d.vars) {
    if (Object.prototype.hasOwnProperty.call(d.vars, k)) {
      root.style.setProperty(k, d.vars[k]);
    }
  }
});
</script><div class="shell" data-brief-id="screen-root" data-brief-role="screen">

  <header class="topbar" data-app-region="topbar" data-brief-id="topbar" data-brief-role="header">
    <div class="title-group">
      <h1>Sprint 24 — Northwind Retainer</h1>
      <span class="sub">4 client workspaces · 3 active sprints</span>
    </div>
    <div class="topbar-actions">
      <section data-component="Button" data-brief-id="auto-button-9" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"></section>
      <section data-component="Button" data-brief-id="auto-button-8" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="btn btn-primary">
        <svg data-icon="lucide/plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7v14"></path></svg>
        New issue
      </button></section>
    </div>
  </header>

  <section class="header-band" data-brief-id="header-band" data-brief-role="section">
    <div class="status-row" data-app-region="status" data-brief-id="status-row" data-brief-role="metrics-row">
      <div class="status-cell" data-brief-id="metric-open" data-brief-role="metric">
        <span class="status-num">23</span>
        <span class="status-label">Open issues</span>
        <span class="status-delta up">+3 this week</span>
      </div>
      <div class="status-cell" data-brief-id="metric-review" data-brief-role="metric">
        <span class="status-num">6</span>
        <span class="status-label">In review</span>
        <span class="status-delta">unchanged</span>
      </div>
      <div class="status-cell" data-brief-id="metric-due" data-brief-role="metric">
        <span class="status-num">4</span>
        <span class="status-label">Due this week</span>
        <span class="status-delta">2 overdue</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="tabs" role="tablist">
        <section data-component="Button" data-brief-id="auto-button-7" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="tab" role="tab" aria-selected="false">All</button></section>
        <section data-component="Button" data-brief-id="auto-button-6" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="tab" role="tab" aria-selected="true">Assigned to me</button></section>
        <section data-component="Button" data-brief-id="auto-button-5" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="tab" role="tab" aria-selected="false">In progress</button></section>
      </div>
      <div class="toolbar-actions">
        <section data-component="Button" data-brief-id="auto-button-4" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="icon-btn" aria-label="Filter"><svg data-icon="lucide/filter" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M22 3H2l8 9.46V19l4 2v-8.54z"></path></svg></button></section>
        <section data-component="Button" data-brief-id="auto-button-3" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="icon-btn" aria-label="Sort"><svg data-icon="lucide/arrow-up-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"></path></svg></button></section>
      </div>
    </div>
  </section>

  <main class="work-surface" data-app-region="work-surface" data-brief-id="work-surface" data-brief-role="section">

    <div class="composer" data-brief-id="composer-issue" data-brief-role="input">
      <svg data-icon="heroicons/plus-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0a9 9 0 0 1 18 0"></path></svg>
      <section data-component="Input" data-brief-id="auto-input-2" data-brief-role="input" data-gesso-marker-wrap="" style="display: contents"><input type="text" placeholder="Add issue title, press enter to create…"></section>
      <section data-component="Button" data-brief-id="auto-button-1" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="btn btn-primary">Create</button></section>
    </div>

    <section class="list-panel" data-component="IssueList" data-brief-id="list-assigned-issues" data-brief-role="list">
      <div class="list-panel-head">
        <h2>Assigned to you</h2>
        <span class="count">8 issues</span>
      </div>

      <div class="issue-row" role="listitem" data-brief-id="issue-0" data-brief-role="list-item">
        <span class="issue-key">NW-142</span>
        <span class="issue-priority high"><svg data-icon="lucide/arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m5 12l7-7l7 7m-7 7V5"></path></svg></span>
        <span class="issue-title">Fix invoice PDF export losing line-item tax breakdown</span>
        <span class="issue-status progress">In progress</span>
        <span class="issue-due">Fri</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-1" data-brief-role="list-item">
        <span class="issue-key">NW-138</span>
        <span class="issue-priority med"><svg data-icon="lucide/minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path></svg></span>
        <span class="issue-title">Migrate client portal auth to OAuth2 refresh tokens</span>
        <span class="issue-status">Todo</span>
        <span class="issue-due">Mon</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-2" data-brief-role="list-item">
        <span class="issue-key">NW-135</span>
        <span class="issue-priority high"><svg data-icon="lucide/arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m5 12l7-7l7 7m-7 7V5"></path></svg></span>
        <span class="issue-title">Retainer dashboard: weekly hours chart renders blank on Safari</span>
        <span class="issue-status review">In review</span>
        <span class="issue-due">Today</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-3" data-brief-role="list-item">
        <span class="issue-key">NW-129</span>
        <span class="issue-priority med"><svg data-icon="lucide/minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path></svg></span>
        <span class="issue-title">Add webhook for this app invoice.paid to update project status</span>
        <span class="issue-status">Todo</span>
        <span class="issue-due">Wed</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-4" data-brief-role="list-item">
        <span class="issue-key">NW-121</span>
        <span class="issue-priority"><svg data-icon="lucide/arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7l-7 7l-7-7"></path></svg></span>
        <span class="issue-title">Write onboarding doc for new client handoff checklist</span>
        <span class="issue-status progress">In progress</span>
        <span class="issue-due">Thu</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-5" data-brief-role="list-item">
        <span class="issue-key">NW-117</span>
        <span class="issue-priority med"><svg data-icon="lucide/minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path></svg></span>
        <span class="issue-title">Rebuild timesheet CSV export to include billable flag</span>
        <span class="issue-status">Todo</span>
        <span class="issue-due">Fri</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-6" data-brief-role="list-item">
        <span class="issue-key">NW-110</span>
        <span class="issue-priority"><svg data-icon="lucide/arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7l-7 7l-7-7"></path></svg></span>
        <span class="issue-title">Polish empty states across settings pages</span>
        <span class="issue-status">Backlog</span>
        <span class="issue-due">—</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-7" data-brief-role="list-item">
        <span class="issue-key">NW-104</span>
        <span class="issue-priority high"><svg data-icon="lucide/arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m5 12l7-7l7 7m-7 7V5"></path></svg></span>
        <span class="issue-title">Investigate slow query on projects list for large workspaces</span>
        <span class="issue-status review">In review</span>
        <span class="issue-due">Mon</span>
        <span class="issue-assignee">JD</span>
      </div>
    </section>

    

  </main>

  <nav class="rail" data-app-region="rail" data-brief-id="rail-nav" data-brief-role="nav-top" style="position:relative;">
    <!-- Fullscreen toggle button -->
    <button aria-label="Enter fullscreen" title="Enter fullscreen" style="
        position:absolute;
        top:12px;
        right:12px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:24px;
        height:24px;
        border-radius:var(--gesso-radius-sm);
        background:transparent;
        border:none;
        color:var(--gesso-fg-muted);
        cursor:pointer;
        padding:0;
        transition:background var(--gesso-duration-fast) var(--gesso-easing-default), color var(--gesso-duration-fast) var(--gesso-easing-default);
      " onmouseenter="this.style.background='rgba(255,255,255,0.07)';this.style.color='var(--gesso-fg)'" onmouseleave="this.style.background='transparent';this.style.color='var(--gesso-fg-muted)'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
        <polyline points="13 5 19 5 19 11"></polyline>
        <polyline points="11 19 5 19 5 13"></polyline>
        <line x1="19" y1="5" x2="12" y2="12"></line>
        <line x1="5" y1="19" x2="12" y2="12"></line>
      </svg>
    </button>

    <div class="rail-profile" tabindex="0" data-brief-id="rail-profile" data-brief-role="avatar">
      <span class="rail-avatar">JD</span>
      <span class="rail-profile-text">
        <span class="rail-profile-name">Jordan Diaz</span>
        <span class="rail-profile-role">Freelance dev</span>
      </span>
    </div>

    <a class="rail-item" href="#" data-brief-id="nav-dashboard" data-brief-role="tab">
      <svg data-icon="lucide/layout-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></g></svg>
      Dashboard
    </a>
    <a class="rail-item" href="#" data-brief-id="nav-starred" data-brief-role="tab">
      <svg data-icon="lucide/star" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"></path></svg>
      Starred
    </a>

    <div class="rail-section-label">Workspaces</div>
    <div class="rail-workspace" tabindex="0" aria-current="true" data-brief-id="workspace-northwind" data-brief-role="button">
      <span class="ws-dot" style="background:var(--gesso-data-1)"></span>
      <span class="rail-workspace-name">Northwind Retail</span>
      <span class="rail-workspace-count">23</span>
    </div>
    <div class="rail-workspace" tabindex="0" data-brief-id="workspace-halcyon" data-brief-role="button">
      <span class="ws-dot" style="background:var(--gesso-data-2)"></span>
      <span class="rail-workspace-name">Halcyon Goods</span>
      <span class="rail-workspace-count">9</span>
    </div>
    <div class="rail-workspace" tabindex="0" data-brief-id="workspace-fernhollow" data-brief-role="button">
      <span class="ws-dot" style="background:var(--gesso-data-3)"></span>
      <span class="rail-workspace-name">Fernhollow Labs</span>
      <span class="rail-workspace-count">14</span>
    </div>
    <div class="rail-workspace" tabindex="0" data-brief-id="workspace-orso" data-brief-role="button">
      <span class="ws-dot" style="background:var(--gesso-data-4)"></span>
      <span class="rail-workspace-name">Orso Studio</span>
      <span class="rail-workspace-count">5</span>
    </div>

    <div class="rail-spacer"></div>
    <div class="rail-bottom">
      <a class="rail-item" href="#" data-brief-id="nav-trash" data-brief-role="tab">
        <svg data-icon="lucide/trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        Trash
      </a>
      <a class="rail-item" href="#" data-brief-id="nav-settings" data-brief-role="tab">
        <svg data-icon="lucide/settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path><circle cx="12" cy="12" r="3"></circle></g></svg>
        Settings
      </a>
    </div>
  </nav>

</div></body></html>
```

</details>

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --gesso-canvas: #0e0f11;
  --gesso-surface-recessed: #0b0b0d;
  --gesso-surface: #1a1b1e;
  --gesso-surface-elevated: #3f3f42;
  --gesso-divider: rgba(255,255,255,0.04);
  --gesso-fg: #e7e8ea;
  --gesso-fg-muted: #a7aab0;
  --gesso-primary: #5e6ad2;
  --gesso-on-accent: #FFFFFF;
  --gesso-accent-text: #6e79d7;
  --gesso-secondary: #3d3f5a;
  --gesso-accent-2-text: #818294;
  --gesso-neutral-50: #0e0f11;
  --gesso-neutral-100: #1a1b1e;
  --gesso-neutral-200: #333438;
  --gesso-neutral-300: #4e4f53;
  --gesso-neutral-400: #6a6c71;
  --gesso-neutral-500: #888a90;
  --gesso-neutral-600: #a7aab0;
  --gesso-neutral-700: #bcbec3;
  --gesso-neutral-800: #d1d3d6;
  --gesso-neutral-900: #e7e8ea;
  --gesso-neutral-950: #eaebed;
  --gesso-success: #16A34A;
  --gesso-warning: #D97706;
  --gesso-error: #e55c5c;
  --gesso-data-1: #4046ab;
  --gesso-data-2: #545fc5;
  --gesso-data-3: #6a77e0;
  --gesso-data-4: #8090fc;
  --gesso-data-5: #9faeff;
  --gesso-data-6: #bfcbff;

  /* Typography — Font Families */
  --gesso-font-display: 'Manrope', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --gesso-font-body: 'Satoshi', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --gesso-font-mono: 'Satoshi', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --gesso-text-4xl: 36px;
  --gesso-leading-4xl: 1.2;
  --gesso-text-3xl: 28px;
  --gesso-leading-3xl: 1.2;
  --gesso-text-2xl: 22px;
  --gesso-leading-2xl: 1.2;
  --gesso-text-base: 14px;
  --gesso-leading-base: 1.5;
  --gesso-text-xs: 10px;
  --gesso-leading-xs: 1.5;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-unit: 4px;
  --gesso-space-1: 4px;
  --gesso-space-2: 8px;
  --gesso-space-3: 12px;
  --gesso-space-4: 16px;
  --gesso-space-6: 24px;
  --gesso-space-8: 32px;
  --gesso-space-12: 48px;
  --gesso-space-16: 64px;
  --gesso-space-24: 96px;
  --gesso-space-32: 128px;

  /* Layout */
  --page-max-width: 1280px;
  --container-max-width: 1280px;
  --grid-columns: 12;
  --grid-gutter: 24px;
  --outer-margin: 64px;
  --section-padding: 80px;
  --section-gap: 80px;

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;

  /* Border Radius */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --gesso-shadow-sm: none;
  --gesso-shadow-md: none;
  --gesso-shadow-lg: 0 1px 2px rgba(0,0,0,0.04);

  /* Surfaces */
  --surface-page: #0e0f11;
  --surface-raised: #1a1b1e;
  --surface-sunken: #22232E;
  --surface-overlay: #0e0f11;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --gesso-canvas: #0e0f11;
  --gesso-surface-recessed: #0b0b0d;
  --gesso-surface: #1a1b1e;
  --gesso-surface-elevated: #3f3f42;
  --gesso-divider: rgba(255,255,255,0.04);
  --gesso-fg: #e7e8ea;
  --gesso-fg-muted: #a7aab0;
  --gesso-primary: #5e6ad2;
  --gesso-on-accent: #FFFFFF;
  --gesso-accent-text: #6e79d7;
  --gesso-secondary: #3d3f5a;
  --gesso-accent-2-text: #818294;
  --gesso-neutral-50: #0e0f11;
  --gesso-neutral-100: #1a1b1e;
  --gesso-neutral-200: #333438;
  --gesso-neutral-300: #4e4f53;
  --gesso-neutral-400: #6a6c71;
  --gesso-neutral-500: #888a90;
  --gesso-neutral-600: #a7aab0;
  --gesso-neutral-700: #bcbec3;
  --gesso-neutral-800: #d1d3d6;
  --gesso-neutral-900: #e7e8ea;
  --gesso-neutral-950: #eaebed;
  --gesso-success: #16A34A;
  --gesso-warning: #D97706;
  --gesso-error: #e55c5c;
  --gesso-data-1: #4046ab;
  --gesso-data-2: #545fc5;
  --gesso-data-3: #6a77e0;
  --gesso-data-4: #8090fc;
  --gesso-data-5: #9faeff;
  --gesso-data-6: #bfcbff;

  /* Typography */
  --gesso-font-display: 'Manrope', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --gesso-font-body: 'Satoshi', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --gesso-font-mono: 'Satoshi', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --gesso-text-4xl: 36px;
  --gesso-leading-4xl: 1.2;
  --gesso-text-3xl: 28px;
  --gesso-leading-3xl: 1.2;
  --gesso-text-2xl: 22px;
  --gesso-leading-2xl: 1.2;
  --gesso-text-base: 14px;
  --gesso-leading-base: 1.5;
  --gesso-text-xs: 10px;
  --gesso-leading-xs: 1.5;

  /* Spacing */
  --gesso-space-1: 4px;
  --gesso-space-2: 8px;
  --gesso-space-3: 12px;
  --gesso-space-4: 16px;
  --gesso-space-6: 24px;
  --gesso-space-8: 32px;
  --gesso-space-12: 48px;
  --gesso-space-16: 64px;
  --gesso-space-24: 96px;
  --gesso-space-32: 128px;

  /* Border Radius */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --gesso-shadow-sm: none;
  --gesso-shadow-md: none;
  --gesso-shadow-lg: 0 1px 2px rgba(0,0,0,0.04);

  /* Layout */
  --container-max-width: 1280px;
  --grid-columns: 12;
  --grid-gutter: 24px;
  --outer-margin: 64px;
  --section-padding: 80px;

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```


## Tokens (JSON)

```json
{
  "color": {
    "neutral": {
      "50": "#0e0f11",
      "100": "#1a1b1e",
      "200": "#22232E",
      "300": "#33354A",
      "400": "#52547A",
      "500": "#7577A0",
      "600": "#8a8d96",
      "700": "#BCBED4",
      "800": "#D8DAF0",
      "900": "#e7e8ea",
      "950": "#F8F8FC"
    },
    "primary": "#5e6ad2",
    "semantic": {
      "error": "#E85C5C",
      "success": "#34C78A",
      "warning": "#E8A84C"
    },
    "secondary": "#3d3f5a"
  },
  "motion": {
    "easing": {
      "default": "linear",
      "emphasis": "cubic-bezier(0.4,0,0.2,1)"
    },
    "duration": {
      "base": "120ms",
      "fast": "60ms",
      "slow": "200ms"
    }
  },
  "radius": {
    "lg": "12px",
    "md": "8px",
    "sm": "4px",
    "full": "9999px",
    "none": "0px"
  },
  "shadow": {
    "lg": "0 1px 2px rgba(0,0,0,0.04)",
    "md": "none",
    "sm": "none"
  },
  "spacing": {
    "unit": 4,
    "scale": {
      "1": "4px",
      "2": "8px",
      "3": "12px",
      "4": "16px",
      "6": "24px",
      "8": "32px",
      "12": "48px",
      "16": "64px",
      "24": "96px",
      "32": "128px"
    }
  },
  "approach": {
    "mood": "dense, terminal, disciplined, keyboard-first",
    "name": "Phosphor Ledger",
    "anchor": "Process manager / war room terminal for engineering leads"
  },
  "extended": {
    "glow": {
      "color": "#5E6AD2",
      "spread": "0px",
      "enabled": false
    },
    "border": {
      "color": "#22232E",
      "style": "solid",
      "width": "1px"
    },
    "texture": {
      "type": "scanline",
      "opacity": 0.03
    },
    "gradient": {
      "style": "none",
      "enabled": false
    }
  },
  "typeface": {
    "body": "Satoshi",
    "mono": "Satoshi",
    "scale": {
      "lg": "1rem",
      "sm": "0.75rem",
      "xl": "1.125rem",
      "xs": "0.625rem",
      "2xl": "1.375rem",
      "3xl": "1.75rem",
      "4xl": "2.25rem",
      "base": "0.875rem"
    },
    "display": "Manrope",
    "weights": [
      400,
      500,
      600,
      700
    ],
    "bodyWeight": 500,
    "displayWeight": 700
  },
  "surfacePack": "web-minimal-airy"
}
```

## Reference HTML

```html
<!doctype html>
<html lang="en"><head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<style id="gesso-foundation">*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}html,body{width: 100%;min-height: 100vh;overflow-x:clip;max-width:100%;}body{font-family:var(--gesso-font-body,system-ui),sans-serif;color:var(--gesso-fg,#0a0a0a);background:var(--gesso-canvas,#ffffff);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.4;}img,svg{display:block;max-width:100%;}button{font:inherit;color:inherit;background:none;border:none;cursor:pointer;}a{color:inherit;text-decoration:none;}</style>
<style id="gesso-text-wrap">h1,h2,h3{text-wrap:balance}p,li,figcaption,blockquote{text-wrap:pretty}</style>
<style id="gesso-font-smoothing">html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}</style>
<style>/* gesso-icon-base v1 */
.ic { display: inline-block; width: 16px; height: 16px; vertical-align: -0.125em; flex-shrink: 0; line-height: 0; }
.ic svg { width: 100%; height: 100%; display: block; }
svg.ic { width: 16px; height: 16px; display: inline-block; vertical-align: -0.125em; flex-shrink: 0; }
.ic[data-icon-style="line"] { stroke-width: var(--ic-stroke, 2); }
.ic[data-icon-style="line"] svg path, .ic[data-icon-style="line"] svg circle, .ic[data-icon-style="line"] svg rect, .ic[data-icon-style="line"] svg line, .ic[data-icon-style="line"] svg polyline, .ic[data-icon-style="line"] svg polygon { stroke-width: inherit; }
.ic-sm { --ic-stroke: 2.25; }
.ic-xs { --ic-stroke: 2.5; }
svg.ic-lg, .ic-lg svg { width: 24px; height: 24px; }
svg.ic-xl, .ic-xl svg { width: 32px; height: 32px; }
svg.ic-2xl, .ic-2xl svg { width: 32px; height: 32px; }
.ic-lg { --ic-stroke: 1.75; }
.ic-xl { --ic-stroke: 1.5; }
.ic-2xl { --ic-stroke: 1.5; }
button { border: 0; background: transparent; padding: 0; font: inherit; color: inherit; cursor: pointer; -webkit-appearance: none; appearance: none; }
</style>

<style id="gesso-responsive-shell">html,body{width:100%!important;max-width:100%!important;min-width:0;overflow-x:hidden}@media (max-width:1279.98px){*{min-width:0}h1,h2,h3,h4,h5,h6,p,td,th{min-width:min-content}}@media (min-width:1280px){*{min-width:auto}:where(nav,header){column-gap:24px}:where(nav a,header a){white-space:nowrap}}img,svg,video,canvas,iframe,table{max-width:100%}</style><style id="gesso-mobile-web-layer">.gesso-nav-check,.gesso-nav-burger{display:none}@media (max-width: 640px){.rail{grid-column:1/-1!important;grid-row:auto!important}}@media (max-width: 480px){nav,nav ul,header ul{flex-wrap:wrap}nav a,header ul a{display:inline-block}table{display:block;overflow-x:auto;min-width:0!important;max-width:100%}[data-gesso-flexwrap]{flex-wrap:wrap}h1,h2,h3{overflow-wrap:break-word}[data-gesso-pinned-height]{height:auto!important;min-height:0!important}.gesso-nav-check{display:block;position:absolute;width:1px;height:1px;margin:0;opacity:0;pointer-events:none}.gesso-nav-check:focus-visible+.gesso-nav-burger{outline:2px solid currentColor;outline-offset:2px}.gesso-nav-burger{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;cursor:pointer;flex-shrink:0;border-radius:8px}.gesso-nav-burger span{display:block;position:relative;width:18px;height:2px;border-radius:1px;background:currentColor}.gesso-nav-burger span::before,.gesso-nav-burger span::after{content:"";position:absolute;left:0;width:18px;height:2px;border-radius:1px;background:currentColor;transition:transform 150ms ease}.gesso-nav-burger span::before{top:-6px}.gesso-nav-burger span::after{top:6px}.gesso-nav-check:checked~.gesso-nav-burger span{background:transparent}.gesso-nav-check:checked~.gesso-nav-burger span::before{transform:translateY(6px) rotate(45deg)}.gesso-nav-check:checked~.gesso-nav-burger span::after{transform:translateY(-6px) rotate(-45deg)}[data-gesso-navlinks]{display:none!important}.gesso-nav-check:checked~[data-gesso-navlinks]{display:flex!important;flex-direction:column;align-items:stretch;flex-basis:100%;min-width:100%;order:99}.shell{width:100%!important;max-width:100%!important}.shell{grid-template-columns:1fr!important}.shell>*{grid-column:1/-1!important;grid-row:auto!important}.topbar-actions{flex-wrap:wrap}.btn{flex-wrap:wrap}.status-row{grid-template-columns:1fr!important}.status-row>*{grid-column:1/-1!important;grid-row:auto!important}.tabs{flex-wrap:wrap}.toolbar-actions{flex-wrap:wrap}.icon-btn{flex-wrap:wrap}.composer{flex-wrap:wrap}.list-panel-head{flex-wrap:wrap}.issue-row{flex-wrap:wrap}.issue-priority{flex-wrap:wrap}.issue-assignee{flex-wrap:wrap}.project-row{flex-wrap:wrap}.rail-profile{flex-wrap:wrap}.rail-avatar{flex-wrap:wrap}.rail-item{flex-wrap:wrap}.rail-workspace{flex-wrap:wrap}}@media (prefers-reduced-motion: reduce){.gesso-nav-burger span::before,.gesso-nav-burger span::after{transition:none}}</style><style id="comment-css-rail-nav-mtdwuk60">[data-brief-id="rail-nav"] button[aria-label="Enter fullscreen"] svg {
  display: none !important;
}

[data-brief-id="rail-nav"] button[aria-label="Enter fullscreen"]::after {
  content: ">>" !important;
  font-family: var(--gesso-font-mono) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  color: inherit !important;
  letter-spacing: -1px !important;
}
</style><!--gesso-fonts:start--><style id="gesso-font-lock">:root{--gesso-font-display:"Manrope", system-ui, -apple-system, sans-serif !important;--gesso-font-body:"Satoshi", system-ui, -apple-system, sans-serif !important;--gesso-font-mono:"Satoshi", ui-monospace, "JetBrains Mono", monospace !important;}</style><!--gesso-fonts:end-->
</head>
<body>
<meta name="x-visual-moves" content="Channeled Charcoal Shell's dark near-black canvas + Violet Ledger's electric indigo accent (#5E6AD2) as the single interactive signal — muted highlight row for active nav, thin line icons beside labels. Fused Mercury's account-list rail density with ElevenLabs' analytics header pattern into a sidebar-on-right dashboard: workspace switcher pinned above icon nav, issues list as the dense work surface, sprint metrics as a quiet status row. JetBrains Mono carries every numeral for that terminal-ledger precision.">

<style>
:root{
  --gesso-canvas:#0E0F11;
  --gesso-surface:#1A1B1E;
  --gesso-surface-elevated:#212328;
  --gesso-surface-recessed:#131417;
  --gesso-fg:#E7E8EA;
  --gesso-fg-muted:#8A8D96;
  --gesso-divider:rgba(255,255,255,0.05);
  --gesso-accent:#5E6AD2;
  --gesso-accent-2:#3D3F5A;
  --gesso-on-accent:#FFFFFF;
  --gesso-success:#3DCB7A;
  --gesso-warning:#E0A93D;
  --gesso-error:#EF4444;
  --gesso-data-1:#4046ab;
  --gesso-data-2:#545fc5;
  --gesso-data-3:#6a77e0;
  --gesso-data-4:#8090fc;
  --gesso-data-5:#9faeff;
  --gesso-data-6:#bfcbff;
  --gesso-primary:var(--gesso-accent);
  --gesso-secondary:var(--gesso-accent-2);
  --gesso-neutral-50:var(--gesso-canvas);
  --gesso-neutral-900:var(--gesso-fg);
  --gesso-radius-sm:4px; --gesso-radius-md:8px; --gesso-radius-lg:12px; --gesso-radius-full:9999px;
  --gesso-shadow-sm:none; --gesso-shadow-md:none; --gesso-shadow-lg:0 1px 2px rgba(0,0,0,0.3);
  --gesso-duration-fast:120ms; --gesso-easing-default:ease-out;
  --gesso-font-display:"Manrope", system-ui, -apple-system, sans-serif;
  --gesso-font-body:"Satoshi", system-ui, -apple-system, sans-serif;
  --gesso-mono:"JetBrains Mono",monospace;
}
*{box-sizing:border-box}
html,body{width:100%;min-height:100%;overflow-x:hidden}
body{
  background:var(--gesso-canvas);color:var(--gesso-fg);
  font-family:var(--gesso-font-body);
  padding-inline:clamp(20px,5vw,64px);
  padding-block:24px;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.shell{
  max-width:1280px;margin-inline:auto;
  display:grid;
  grid-template-columns:1fr 240px;
  gap:24px;
  min-height:calc(100vh - 48px);
}
@media (max-width:1024px){ .shell{grid-template-columns:1fr 200px; gap:16px;} }
@media (max-width:640px){ .shell{grid-template-columns:1fr;} .rail{order:-1; flex-direction:row; height:auto; padding:12px;} }

/* TOPBAR */
.topbar{
  grid-column:1/-1;
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 4px 20px;
  flex-wrap:wrap;gap:16px;
}
.topbar .title-group{display:flex;flex-direction:column;gap:4px}
.topbar h1{font-family:var(--gesso-font-display);font-weight:700;font-size:clamp(22px,2vw,26px);line-height:1.15;margin:0}
.topbar .sub{color:var(--gesso-fg-muted);font-size:13px}
.topbar-actions{display:flex;align-items:center;gap:12px}
.btn{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--gesso-font-body);font-size:13px;font-weight:500;
  padding:8px 20px;border-radius:var(--gesso-radius-full);
  cursor:pointer;border:none;white-space:nowrap;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default), opacity var(--gesso-duration-fast) var(--gesso-easing-default), transform 80ms ease-out;
}
.btn-primary{background:var(--gesso-accent);color:var(--gesso-on-accent)}
.btn-primary:hover{background:color-mix(in oklch, var(--gesso-accent) 88%, black)}
.btn-primary:active{transform:translateY(1px) scale(0.98)}
.btn-primary:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.btn-ghost{background:transparent;color:var(--gesso-accent);padding:8px 16px}
.btn-ghost:hover{background:rgba(255,255,255,0.05)}
.btn-ghost:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}

/* HEADER band (status row + toolbar) */
.header-band{grid-column:1/2;display:flex;flex-direction:column;gap:20px;margin-bottom:4px}
.status-row{
  display:grid;grid-template-columns:repeat(3,1fr);gap:32px;
  padding-bottom:20px;border-bottom:1px solid var(--gesso-divider);
}
.status-cell{display:flex;flex-direction:column;gap:8px}
.status-num{font-family:var(--gesso-mono);font-weight:700;font-size:32px;line-height:34px;color:var(--gesso-fg);font-variant-numeric:tabular-nums}
.status-label{font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--gesso-fg-muted)}
.status-delta{font-size:12px;color:var(--gesso-fg-muted);font-family:var(--gesso-mono)}
.status-delta.up{color:var(--gesso-success)}

.toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.tabs{display:flex;gap:4px}
.tab{
  font-family:var(--gesso-font-body);font-size:13px;font-weight:500;color:var(--gesso-fg-muted);
  background:transparent;border:none;padding:8px 16px;border-radius:var(--gesso-radius-full);cursor:pointer;
  transition:color var(--gesso-duration-fast) var(--gesso-easing-default), background var(--gesso-duration-fast) var(--gesso-easing-default);
}
.tab:hover{background:rgba(255,255,255,0.05)}
.tab[aria-selected="true"]{color:var(--gesso-accent);background:rgba(94,106,210,0.1)}
.tab:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.toolbar-actions{display:flex;align-items:center;gap:8px}
.icon-btn{
  display:inline-flex;align-items:center;justify-content:center;
  width:32px;height:32px;border-radius:var(--gesso-radius-md);
  background:transparent;border:none;color:var(--gesso-fg-muted);cursor:pointer;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default), color var(--gesso-duration-fast) var(--gesso-easing-default);
}
.icon-btn:hover{background:rgba(255,255,255,0.05);color:var(--gesso-fg)}
.icon-btn:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}

/* WORK SURFACE */
.work-surface{grid-column:1/2;display:flex;flex-direction:column;gap:24px}

.composer{
  display:flex;align-items:center;gap:12px;
  padding:16px 16px;background:var(--gesso-surface-recessed);
  border-radius:var(--gesso-radius-md);
}
.composer svg{color:var(--gesso-fg-muted);flex-shrink:0}
.composer input{
  flex:1;background:transparent;border:none;color:var(--gesso-fg);
  font-family:var(--gesso-font-body);font-size:14px;outline:none;
}
.composer input::placeholder{color:var(--gesso-fg-muted)}
.composer .btn-primary{padding:8px 16px;font-size:12px}

.list-panel{display:flex;flex-direction:column}
.list-panel-head{display:flex;align-items:center;justify-content:space-between;padding:4px 0 12px}
.list-panel-head h2{font-family:var(--gesso-font-display);font-size:15px;font-weight:700;margin:0}
.list-panel-head .count{font-family:var(--gesso-mono);font-size:12px;color:var(--gesso-fg-muted)}

.issue-row{
  display:flex;align-items:center;gap:16px;
  padding:16px 4px;
  border-top:1px solid var(--gesso-divider);
  cursor:pointer;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default);
}
.issue-row:first-child{border-top:none}
.issue-row:hover{background:linear-gradient(rgba(255,255,255,0.04),rgba(255,255,255,0.04))}
.issue-key{font-family:var(--gesso-mono);font-size:12px;color:var(--gesso-fg-muted);flex-shrink:0;width:64px}
.issue-priority{flex-shrink:0;display:flex;align-items:center;color:var(--gesso-fg-muted)}
.issue-priority.high{color:var(--gesso-error)}
.issue-priority.med{color:var(--gesso-warning)}
.issue-title{flex:1;font-size:14px;color:var(--gesso-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.issue-status{
  flex-shrink:0;font-family:var(--gesso-mono);font-size:11px;letter-spacing:0.04em;
  padding:4px 12px;border-radius:var(--gesso-radius-full);text-transform:uppercase;
  background:rgba(255,255,255,0.05);color:var(--gesso-fg-muted);white-space:nowrap;
}
.issue-status.progress{color:var(--gesso-accent);background:rgba(94,106,210,0.12)}
.issue-status.review{color:var(--gesso-warning);background:rgba(224,169,61,0.12)}
.issue-due{flex-shrink:0;font-family:var(--gesso-mono);font-size:12px;color:var(--gesso-fg-muted);width:56px;text-align:right}
.issue-assignee{
  flex-shrink:0;width:28px;height:28px;border-radius:50%;
  background:var(--gesso-surface-elevated);color:var(--gesso-fg);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--gesso-font-body);font-size:11px;font-weight:600;
}

.project-rows{display:flex;flex-direction:column}
.project-row{
  display:flex;align-items:center;gap:16px;padding:16px 4px;
  border-top:1px solid var(--gesso-divider);
}
.project-row:first-child{border-top:none}
.project-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.project-name{flex:1;font-size:14px;color:var(--gesso-fg)}
.project-client{font-size:12px;color:var(--gesso-fg-muted);width:160px;flex-shrink:0}
.project-bar-track{width:120px;height:4px;border-radius:var(--gesso-radius-full);background:var(--gesso-surface-recessed);overflow:hidden;flex-shrink:0}
.project-bar-fill{height:100%;background:var(--gesso-accent);border-radius:var(--gesso-radius-full)}
.project-pct{font-family:var(--gesso-mono);font-size:12px;color:var(--gesso-fg-muted);width:36px;text-align:right;flex-shrink:0}

/* RAIL — right side */
.rail{
  grid-column:2/3;
  display:flex;flex-direction:column;
  background:var(--gesso-surface);
  border-radius:var(--gesso-radius-lg);
  padding:16px 12px;
  height:fit-content;
  gap:4px;
}
.rail-profile{
  display:flex;align-items:center;gap:12px;
  padding:12px 8px;border-radius:var(--gesso-radius-md);
  cursor:pointer;margin-bottom:8px;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default);
}
.rail-profile:hover{background:rgba(255,255,255,0.05)}
.rail-profile:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.rail-avatar{width:32px;height:32px;border-radius:50%;background:var(--gesso-accent-2);color:var(--gesso-fg);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;font-family:var(--gesso-font-body)}
.rail-profile-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.rail-profile-name{font-size:13px;font-weight:600;color:var(--gesso-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rail-profile-role{font-size:11px;color:var(--gesso-fg-muted)}
.rail-profile svg:last-child{color:var(--gesso-fg-muted);flex-shrink:0}

.rail-section-label{
  font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--gesso-fg-muted);
  padding:16px 8px 8px;
}
.rail-item{
  display:flex;align-items:center;gap:12px;
  padding:8px 8px;border-radius:var(--gesso-radius-md);
  color:var(--gesso-fg-muted);font-size:13px;font-weight:500;
  cursor:pointer;text-decoration:none;
  transition:background var(--gesso-duration-fast) var(--gesso-easing-default), color var(--gesso-duration-fast) var(--gesso-easing-default);
}
.rail-item svg{flex-shrink:0}
.rail-item:hover{background:rgba(255,255,255,0.05);color:var(--gesso-fg)}
.rail-item:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.rail-item[aria-current="true"]{background:rgba(94,106,210,0.12);color:var(--gesso-accent)}
.rail-item .badge-count{
  margin-left:auto;font-family:var(--gesso-mono);font-size:11px;color:var(--gesso-fg-muted);
}

.rail-workspace{
  display:flex;align-items:center;gap:12px;
  padding:8px 8px;border-radius:var(--gesso-radius-md);
  cursor:pointer;transition:background var(--gesso-duration-fast) var(--gesso-easing-default);
}
.rail-workspace:hover{background:rgba(255,255,255,0.05)}
.rail-workspace:focus-visible{outline:2px solid var(--gesso-fg);outline-offset:2px}
.rail-workspace[aria-current="true"]{background:rgba(94,106,210,0.12)}
.ws-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.rail-workspace-name{flex:1;min-width:0;font-size:13px;color:var(--gesso-fg-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rail-workspace[aria-current="true"] .rail-workspace-name{color:var(--gesso-fg);font-weight:600}
.rail-workspace-count{font-family:var(--gesso-mono);font-size:11px;color:var(--gesso-fg-muted);flex-shrink:0}
.rail-spacer{flex:1}
.rail-bottom{display:flex;flex-direction:column;gap:2px;margin-top:8px;padding-top:8px;border-top:1px solid var(--gesso-divider)}
</style>

<div class="shell" data-brief-id="screen-root" data-brief-role="screen">

  <header class="topbar" data-app-region="topbar" data-brief-id="topbar" data-brief-role="header">
    <div class="title-group">
      <h1>Sprint 24 — Northwind Retainer</h1>
      <span class="sub">4 client workspaces · 3 active sprints</span>
    </div>
    <div class="topbar-actions">
      <section data-component="Button" data-brief-id="auto-button-9" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"></section>
      <section data-component="Button" data-brief-id="auto-button-8" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="btn btn-primary">
        <svg data-icon="lucide/plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7v14"></path></svg>
        New issue
      </button></section>
    </div>
  </header>

  <section class="header-band" data-brief-id="header-band" data-brief-role="section">
    <div class="status-row" data-app-region="status" data-brief-id="status-row" data-brief-role="metrics-row">
      <div class="status-cell" data-brief-id="metric-open" data-brief-role="metric">
        <span class="status-num">23</span>
        <span class="status-label">Open issues</span>
        <span class="status-delta up">+3 this week</span>
      </div>
      <div class="status-cell" data-brief-id="metric-review" data-brief-role="metric">
        <span class="status-num">6</span>
        <span class="status-label">In review</span>
        <span class="status-delta">unchanged</span>
      </div>
      <div class="status-cell" data-brief-id="metric-due" data-brief-role="metric">
        <span class="status-num">4</span>
        <span class="status-label">Due this week</span>
        <span class="status-delta">2 overdue</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="tabs" role="tablist">
        <section data-component="Button" data-brief-id="auto-button-7" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="tab" role="tab" aria-selected="false">All</button></section>
        <section data-component="Button" data-brief-id="auto-button-6" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="tab" role="tab" aria-selected="true">Assigned to me</button></section>
        <section data-component="Button" data-brief-id="auto-button-5" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="tab" role="tab" aria-selected="false">In progress</button></section>
      </div>
      <div class="toolbar-actions">
        <section data-component="Button" data-brief-id="auto-button-4" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="icon-btn" aria-label="Filter"><svg data-icon="lucide/filter" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M22 3H2l8 9.46V19l4 2v-8.54z"></path></svg></button></section>
        <section data-component="Button" data-brief-id="auto-button-3" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="icon-btn" aria-label="Sort"><svg data-icon="lucide/arrow-up-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"></path></svg></button></section>
      </div>
    </div>
  </section>

  <main class="work-surface" data-app-region="work-surface" data-brief-id="work-surface" data-brief-role="section">

    <div class="composer" data-brief-id="composer-issue" data-brief-role="input">
      <svg data-icon="heroicons/plus-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0a9 9 0 0 1 18 0"></path></svg>
      <section data-component="Input" data-brief-id="auto-input-2" data-brief-role="input" data-gesso-marker-wrap="" style="display: contents"><input type="text" placeholder="Add issue title, press enter to create…"></section>
      <section data-component="Button" data-brief-id="auto-button-1" data-brief-role="button" data-gesso-marker-wrap="" style="display: contents"><button class="btn btn-primary">Create</button></section>
    </div>

    <section class="list-panel" data-component="IssueList" data-brief-id="list-assigned-issues" data-brief-role="list">
      <div class="list-panel-head">
        <h2>Assigned to you</h2>
        <span class="count">8 issues</span>
      </div>

      <div class="issue-row" role="listitem" data-brief-id="issue-0" data-brief-role="list-item">
        <span class="issue-key">NW-142</span>
        <span class="issue-priority high"><svg data-icon="lucide/arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m5 12l7-7l7 7m-7 7V5"></path></svg></span>
        <span class="issue-title">Fix invoice PDF export losing line-item tax breakdown</span>
        <span class="issue-status progress">In progress</span>
        <span class="issue-due">Fri</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-1" data-brief-role="list-item">
        <span class="issue-key">NW-138</span>
        <span class="issue-priority med"><svg data-icon="lucide/minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path></svg></span>
        <span class="issue-title">Migrate client portal auth to OAuth2 refresh tokens</span>
        <span class="issue-status">Todo</span>
        <span class="issue-due">Mon</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-2" data-brief-role="list-item">
        <span class="issue-key">NW-135</span>
        <span class="issue-priority high"><svg data-icon="lucide/arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m5 12l7-7l7 7m-7 7V5"></path></svg></span>
        <span class="issue-title">Retainer dashboard: weekly hours chart renders blank on Safari</span>
        <span class="issue-status review">In review</span>
        <span class="issue-due">Today</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-3" data-brief-role="list-item">
        <span class="issue-key">NW-129</span>
        <span class="issue-priority med"><svg data-icon="lucide/minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path></svg></span>
        <span class="issue-title">Add webhook for this app invoice.paid to update project status</span>
        <span class="issue-status">Todo</span>
        <span class="issue-due">Wed</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-4" data-brief-role="list-item">
        <span class="issue-key">NW-121</span>
        <span class="issue-priority"><svg data-icon="lucide/arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7l-7 7l-7-7"></path></svg></span>
        <span class="issue-title">Write onboarding doc for new client handoff checklist</span>
        <span class="issue-status progress">In progress</span>
        <span class="issue-due">Thu</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-5" data-brief-role="list-item">
        <span class="issue-key">NW-117</span>
        <span class="issue-priority med"><svg data-icon="lucide/minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path></svg></span>
        <span class="issue-title">Rebuild timesheet CSV export to include billable flag</span>
        <span class="issue-status">Todo</span>
        <span class="issue-due">Fri</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-6" data-brief-role="list-item">
        <span class="issue-key">NW-110</span>
        <span class="issue-priority"><svg data-icon="lucide/arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7l-7 7l-7-7"></path></svg></span>
        <span class="issue-title">Polish empty states across settings pages</span>
        <span class="issue-status">Backlog</span>
        <span class="issue-due">—</span>
        <span class="issue-assignee">JD</span>
      </div>
      <div class="issue-row" role="listitem" data-brief-id="issue-7" data-brief-role="list-item">
        <span class="issue-key">NW-104</span>
        <span class="issue-priority high"><svg data-icon="lucide/arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-xs" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m5 12l7-7l7 7m-7 7V5"></path></svg></span>
        <span class="issue-title">Investigate slow query on projects list for large workspaces</span>
        <span class="issue-status review">In review</span>
        <span class="issue-due">Mon</span>
        <span class="issue-assignee">JD</span>
      </div>
    </section>

    

  </main>

  <nav class="rail" data-app-region="rail" data-brief-id="rail-nav" data-brief-role="nav-top" style="position:relative;">
    <!-- Fullscreen toggle button -->
    <button aria-label="Enter fullscreen" title="Enter fullscreen" style="
        position:absolute;
        top:12px;
        right:12px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:24px;
        height:24px;
        border-radius:var(--gesso-radius-sm);
        background:transparent;
        border:none;
        color:var(--gesso-fg-muted);
        cursor:pointer;
        padding:0;
        transition:background var(--gesso-duration-fast) var(--gesso-easing-default), color var(--gesso-duration-fast) var(--gesso-easing-default);
      " onmouseenter="this.style.background='rgba(255,255,255,0.07)';this.style.color='var(--gesso-fg)'" onmouseleave="this.style.background='transparent';this.style.color='var(--gesso-fg-muted)'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
        <polyline points="13 5 19 5 19 11"></polyline>
        <polyline points="11 19 5 19 5 13"></polyline>
        <line x1="19" y1="5" x2="12" y2="12"></line>
        <line x1="5" y1="19" x2="12" y2="12"></line>
      </svg>
    </button>

    <div class="rail-profile" tabindex="0" data-brief-id="rail-profile" data-brief-role="avatar">
      <span class="rail-avatar">JD</span>
      <span class="rail-profile-text">
        <span class="rail-profile-name">Jordan Diaz</span>
        <span class="rail-profile-role">Freelance dev</span>
      </span>
    </div>

    <a class="rail-item" href="#" data-brief-id="nav-dashboard" data-brief-role="tab">
      <svg data-icon="lucide/layout-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></g></svg>
      Dashboard
    </a>
    <a class="rail-item" href="#" data-brief-id="nav-starred" data-brief-role="tab">
      <svg data-icon="lucide/star" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"></path></svg>
      Starred
    </a>

    <div class="rail-section-label">Workspaces</div>
    <div class="rail-workspace" tabindex="0" aria-current="true" data-brief-id="workspace-northwind" data-brief-role="button">
      <span class="ws-dot" style="background:var(--gesso-data-1)"></span>
      <span class="rail-workspace-name">Northwind Retail</span>
      <span class="rail-workspace-count">23</span>
    </div>
    <div class="rail-workspace" tabindex="0" data-brief-id="workspace-halcyon" data-brief-role="button">
      <span class="ws-dot" style="background:var(--gesso-data-2)"></span>
      <span class="rail-workspace-name">Halcyon Goods</span>
      <span class="rail-workspace-count">9</span>
    </div>
    <div class="rail-workspace" tabindex="0" data-brief-id="workspace-fernhollow" data-brief-role="button">
      <span class="ws-dot" style="background:var(--gesso-data-3)"></span>
      <span class="rail-workspace-name">Fernhollow Labs</span>
      <span class="rail-workspace-count">14</span>
    </div>
    <div class="rail-workspace" tabindex="0" data-brief-id="workspace-orso" data-brief-role="button">
      <span class="ws-dot" style="background:var(--gesso-data-4)"></span>
      <span class="rail-workspace-name">Orso Studio</span>
      <span class="rail-workspace-count">5</span>
    </div>

    <div class="rail-spacer"></div>
    <div class="rail-bottom">
      <a class="rail-item" href="#" data-brief-id="nav-trash" data-brief-role="tab">
        <svg data-icon="lucide/trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        Trash
      </a>
      <a class="rail-item" href="#" data-brief-id="nav-settings" data-brief-role="tab">
        <svg data-icon="lucide/settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-icon-style="line" class="ic ic-sm" style="max-width:32px;max-height:32px"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path><circle cx="12" cy="12" r="3"></circle></g></svg>
        Settings
      </a>
    </div>
  </nav>

</div></body></html>
```

Use the tokens as CSS variables. Treat the reference HTML as the visual
source of truth; adapt structure to your framework, but do not deviate
from the visual system.
