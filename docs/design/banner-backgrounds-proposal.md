# Banner Backgrounds - Analysis & Proposal

## Current State

### Background Styling (FloatingActionBanners.tsx)

```tsx
className={cn(
  "relative overflow-hidden rounded-xl",
  "border border-slate-200/80 backdrop-blur-md",
  "bg-white/95 shadow-sm",  // <-- Current: almost opaque white
  "transition-all duration-200",
  hoveredId === banner.id && "shadow-md border-slate-300/80",
)}
```

**Problem**: All banners have identical `bg-white/95` background, making them blend with the page's white/light gradient background.

---

## Banner Inventory

| Section      | Banner ID          | Gradient | Icon Image                 | Button Color |
| ------------ | ------------------ | -------- | -------------------------- | ------------ |
| visibility   | find-enemy         | `cyan`   | competitor-discovery.webp  | cyan-700     |
| visibility   | ai-chat            | `blue`   | keyword-analysis.webp      | violet-700   |
| visibility   | llms-export        | `green`  | ai-readiness-enhanced.webp | emerald-700  |
| visibility   | ai-readiness       | `amber`  | ai-readiness-basic.webp    | amber-700    |
| content-gaps | find-enemy-gaps    | `cyan`   | competitor-discovery.webp  | cyan-700     |
| content-gaps | ai-chat-gaps       | `blue`   | keyword-analysis.webp      | violet-700   |
| battlefield  | battlefield-launch | `amber`  | competitor-analysis.webp   | amber-700    |
| ai-readiness | ai-readiness-chat  | `green`  | ai-readiness-enhanced.webp | emerald-700  |

---

## Proposal: Subtle Gradient Backgrounds

### Option A: Left-to-Right Gradient (Recommended)

```tsx
const backgroundVariants: Record<string, string> = {
  cyan: "bg-gradient-to-r from-cyan-50/80 via-white/90 to-white/95",
  blue: "bg-gradient-to-r from-violet-50/80 via-white/90 to-white/95",
  amber: "bg-gradient-to-r from-amber-50/80 via-white/90 to-white/95",
  green: "bg-gradient-to-r from-emerald-50/80 via-white/90 to-white/95",
};
```

**Visual Effect**: Soft colored glow on the left (icon side) fading to white on the right (button side).

---

### Option B: Radial Gradient from Icon

```tsx
const backgroundVariants: Record<string, string> = {
  cyan: "bg-[radial-gradient(circle_at_10%_50%,rgba(6,182,212,0.12),transparent_60%)] bg-white/90",
  blue: "bg-[radial-gradient(circle_at_10%_50%,rgba(139,92,246,0.12),transparent_60%)] bg-white/90",
  amber:
    "bg-[radial-gradient(circle_at_10%_50%,rgba(245,158,11,0.12),transparent_60%)] bg-white/90",
  green:
    "bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.12),transparent_60%)] bg-white/90",
};
```

**Visual Effect**: Circular glow emanating from the icon position.

---

### Option C: Bottom Border Accent + Subtle Fill

```tsx
const backgroundVariants: Record<string, string> = {
  cyan: "bg-cyan-50/40 border-b-2 border-b-cyan-300/60",
  blue: "bg-violet-50/40 border-b-2 border-b-violet-300/60",
  amber: "bg-amber-50/40 border-b-2 border-b-amber-300/60",
  green: "bg-emerald-50/40 border-b-2 border-b-emerald-300/60",
};
```

**Visual Effect**: Very subtle tinted background with colored accent border at bottom.

---

### Option D: Full Subtle Tint

```tsx
const backgroundVariants: Record<string, string> = {
  cyan: "bg-cyan-50/60",
  blue: "bg-violet-50/60",
  amber: "bg-amber-50/60",
  green: "bg-emerald-50/60",
};
```

**Visual Effect**: Uniformly tinted background, most distinct from page.

---

## Hover State Enhancement

Current hover only changes shadow. Proposal to enhance:

```tsx
// Normal state
backgroundVariants[banner.gradient];

// Hover state (intensify)
const hoverBackgroundVariants: Record<string, string> = {
  cyan: "hover:from-cyan-100/90",
  blue: "hover:from-violet-100/90",
  amber: "hover:from-amber-100/90",
  green: "hover:from-emerald-100/90",
};
```

---

## My Recommendation

**Option A (Left-to-Right Gradient)** is the best choice because:

1. Gradient starts from icon side - creates visual connection with the colored icon
2. Fades to white - keeps text readable, button area clean
3. Subtle but noticeable - banners stand out without being distracting
4. Consistent with modern UI trends (glassmorphism + color accents)

### Implementation Preview

```tsx
// In FloatingActionBanners.tsx
const backgroundVariants: Record<string, string> = {
  cyan: "bg-gradient-to-r from-cyan-50/80 via-white/90 to-white/95",
  blue: "bg-gradient-to-r from-violet-50/80 via-white/90 to-white/95",
  amber: "bg-gradient-to-r from-amber-50/80 via-white/90 to-white/95",
  green: "bg-gradient-to-r from-emerald-50/80 via-white/90 to-white/95",
};

// Replace bg-white/95 with:
className={cn(
  "relative overflow-hidden rounded-xl",
  "border border-slate-200/80 backdrop-blur-md",
  backgroundVariants[banner.gradient], // <-- Dynamic gradient
  "shadow-sm transition-all duration-200",
  hoveredId === banner.id && "shadow-md border-slate-300/80",
)}
```

---

## Color Reference

| Gradient        | Tailwind Color | Hex     | Use Case                         |
| --------------- | -------------- | ------- | -------------------------------- |
| cyan            | cyan-50        | #ecfeff | Find Competitors                 |
| blue (violet)   | violet-50      | #f5f3ff | AI Chat                          |
| amber           | amber-50       | #fffbeb | Launch Mission, AI Readiness tab |
| green (emerald) | emerald-50     | #ecfdf5 | LLMS Export, AI Readiness Help   |
