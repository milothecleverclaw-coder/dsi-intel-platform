# DSI Intel Platform — Design System

## Brand Identity
- **Organization**: Department of Special Investigation (DSI), Thailand
- **Vibe**: Professional, authoritative, serious — like a government investigation tool
- **Reference**: Think police/intelligence software — dark, focused, data-dense

## Color Palette

### Primary Colors
- **Background**: `#0f172a` (slate-900) — deep navy/black
- **Surface**: `#1e293b` (slate-800) — card backgrounds
- **Surface Elevated**: `#334155` (slate-700) — hover states, modals

### Accent Colors
- **Primary Action**: `#fde047` (yellow-300) — CTAs, active states
- **Secondary Action**: `#3b82f6` (blue-500) — links, secondary buttons
- **Success**: `#22c55e` (green-500) — success states
- **Warning**: `#f59e0b` (amber-500) — warnings
- **Destructive**: `#dc2626` (red-600) — errors, delete actions

### Text Colors
- **Primary Text**: `#f8fafc` (slate-50) — headings, important text
- **Secondary Text**: `#94a3b8` (slate-400) — labels, metadata
- **Muted Text**: `#64748b` (slate-500) — placeholders, disabled

### Semantic Colors
- **Suspect**: `#dc2626` (red) — personas marked as suspect
- **Victim**: `#3b82f6` (blue) — personas marked as victim  
- **Witness**: `#22c55e` (green) — personas marked as witness

## Typography

### Font Stack
- **Primary**: `Inter`, system-ui, sans-serif
- **Monospace**: `JetBrains Mono`, monospace — for case numbers, IDs

### Hierarchy
- **H1**: 24px, font-weight 700, slate-50
- **H2**: 20px, font-weight 600, slate-50
- **H3**: 16px, font-weight 600, slate-50
- **Body**: 14px, font-weight 400, slate-300
- **Label**: 12px, font-weight 500, slate-400, uppercase tracking-wide
- **Monospace**: 14px, monospace — case numbers, pin IDs

## Layout

### Grid
- **Max Width**: 1400px content area
- **Gutter**: 24px
- **Card Padding**: 20px
- **Section Gap**: 24px

### Sidebar
- **Width**: 280px fixed
- **Background**: slate-900 with 1px right border slate-800
- **Active Item**: red-600 background with white text
- **Hover**: slate-800 background

### Cards
- **Background**: slate-800
- **Border**: 1px solid slate-700
- **Border Radius**: 8px
- **Shadow**: none (flat design)
- **Hover**: border-color slate-600

## Components

### Buttons
**Primary**
- Background: red-600
- Text: white
- Hover: red-700
- Padding: 10px 16px
- Border Radius: 6px

**Secondary**
- Background: slate-700
- Text: slate-50
- Hover: slate-600

**Ghost**
- Background: transparent
- Text: slate-300
- Hover: slate-800 background

### Forms
**Input**
- Background: slate-900
- Border: 1px solid slate-700
- Text: slate-50
- Placeholder: slate-500
- Focus: border-red-600, ring-red-600/20
- Border Radius: 6px

**Label**
- Text: slate-400
- Font Size: 12px
- Uppercase, letter-spacing 0.05em
- Margin Bottom: 6px

### Tables
- Header: slate-800 background, slate-400 text, uppercase
- Row: slate-900/transparent alternating
- Border: 1px solid slate-800
- Hover Row: slate-800/50

### Badges
- **High Priority**: bg-red-900/30, text-red-400, border-red-800
- **Medium**: bg-amber-900/30, text-amber-400, border-amber-800
- **Low**: bg-green-900/30, text-green-400, border-green-800

## Interactions

### Hover States
- Cards: border lightens, subtle lift
- Buttons: darken 10%
- Links: red-400 with underline

### Focus States
- Ring: 2px red-600 with 20% opacity
- All interactive elements must have visible focus

### Loading States
- Skeleton: slate-800 background, animate-pulse
- Spinner: red-600

## Dark Mode Only
This is a **dark mode only** application. No light mode toggle.

All backgrounds are dark (slate-900 base) with light text (slate-50/slate-300).
