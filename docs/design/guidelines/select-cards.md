# Select Cards (Glassmorphism)

> Beautiful card-based selectors with gradient backgrounds and glassmorphism effects.

## Overview

Select Cards are interactive card components used for single or multiple selection. They combine glassmorphism blur effects with diagonal gradient backgrounds for a premium look.

**Used in:**

- Scan Target selection (My Product / Competitor)
- Scan Depth selection (Quick / Standard / Thorough)
- Scan Intensity presets (Light / Standard / Deep / Custom)

---

## Core Pattern

### Base Structure

```tsx
<button
  onClick={() => onChange(value)}
  className={cn(
    // Base styles
    "flex flex-col items-center gap-2 rounded-xl p-4 transition-all duration-200 backdrop-blur-md",
    // Selected vs Unselected
    isSelected
      ? "border border-{color}-200/30" // Thin border when selected
      : "border-2 border-slate-200/30 bg-white/50 hover:bg-white/70",
    disabled && "cursor-not-allowed opacity-50",
  )}
  style={
    isSelected
      ? {
          background:
            "linear-gradient(135deg, rgba(R,G,B,0.08) 0%, rgba(R,G,B,0.08) 100%)",
        }
      : undefined
  }
>
  {/* Icon */}
  <div
    className={cn(
      "flex h-12 w-12 items-center justify-center rounded-full",
      isSelected ? "bg-{color}-500 text-white" : "bg-slate-100 text-slate-400",
    )}
  >
    <Icon className="h-6 w-6" />
  </div>

  {/* Label */}
  <span className="text-sm font-semibold text-slate-700">LABEL</span>

  {/* Optional description */}
  <span className="text-xs text-slate-500">Description</span>
</button>
```

---

## Key Principles

### 1. Border Width Differentiation

| State          | Border           | Why                                   |
| -------------- | ---------------- | ------------------------------------- |
| **Selected**   | `border` (1px)   | Thin, subtle — gradient does the work |
| **Unselected** | `border-2` (2px) | More visible for affordance           |

### 2. Gradient Backgrounds (Selected State)

Always use **diagonal gradient** at **135deg** with **8% opacity**:

```tsx
style={{
  background: "linear-gradient(135deg, rgba(R1,G1,B1,0.08) 0%, rgba(R2,G2,B2,0.08) 100%)"
}}
```

### 3. No Shadows on Selected

Avoid `shadow-md` on selected cards — gradients provide enough visual distinction.

### 4. Subtle Hover on Unselected

```tsx
// Unselected hover: just opacity change, no shadow
"bg-white/50 hover:bg-white/70";
```

---

## Color Palette

### Standard Colors

| Type                       | Gradient                                            | Border                 | Icon BG         |
| -------------------------- | --------------------------------------------------- | ---------------------- | --------------- |
| **Blue (Primary)**         | `rgba(59,130,246,0.08)` → `rgba(139,92,246,0.08)`   | `border-blue-200/30`   | `bg-blue-500`   |
| **Amber (Competitor)**     | `rgba(245,158,11,0.08)` → `rgba(249,115,22,0.08)`   | `border-amber-200/30`  | `bg-amber-500`  |
| **Green (Quick/Light)**    | `rgba(34,197,94,0.08)` → `rgba(16,185,129,0.08)`    | `border-green-200/30`  | `bg-green-500`  |
| **Purple (Deep/Thorough)** | `rgba(139,92,246,0.08)` → `rgba(168,85,247,0.08)`   | `border-purple-200/30` | `bg-purple-500` |
| **Slate (Custom/Neutral)** | `rgba(100,116,139,0.08)` → `rgba(148,163,184,0.08)` | `border-slate-200/30`  | `bg-slate-500`  |

### Gradient Direction

Always **135deg** (diagonal top-left to bottom-right) for consistency.

---

## Complete Examples

### Example 1: Two-Option Selector (My Product / Competitor)

```tsx
export function ProjectTypeCards({ selected, onChange }) {
  const isFavorite = selected === "favorite";

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* My Product */}
      <button
        onClick={() => onChange("favorite")}
        className={cn(
          "relative flex flex-col items-center gap-2 rounded-xl p-4 backdrop-blur-md",
          isFavorite
            ? "border border-blue-200/30"
            : "border-2 border-slate-200/30 bg-white/50 hover:bg-white/70",
        )}
        style={
          isFavorite
            ? {
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)",
              }
            : undefined
        }
      >
        {isFavorite && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
            <Check className="h-3 w-3" />
          </div>
        )}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            isFavorite
              ? "bg-blue-500 text-white"
              : "bg-slate-100 text-slate-400",
          )}
        >
          <Star className="h-6 w-6" />
        </div>
        <span className="text-sm font-semibold text-slate-700">MY PRODUCT</span>
        <span className="text-xs text-blue-600">Product Name</span>
        <span className="text-xs text-slate-400">domain.com</span>
      </button>

      {/* Competitor */}
      <button
        onClick={() => onChange("competitor")}
        className={cn(
          "relative flex flex-col items-center gap-2 rounded-xl p-4 backdrop-blur-md",
          !isFavorite
            ? "border border-amber-200/30"
            : "border-2 border-slate-200/30 bg-white/50 hover:bg-white/70",
        )}
        style={
          !isFavorite
            ? {
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(249,115,22,0.08) 100%)",
              }
            : undefined
        }
      >
        {!isFavorite && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
            <Check className="h-3 w-3" />
          </div>
        )}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            !isFavorite
              ? "bg-amber-500 text-white"
              : "bg-slate-100 text-slate-400",
          )}
        >
          <Target className="h-6 w-6" />
        </div>
        <span className="text-sm font-semibold text-slate-700">COMPETITOR</span>
      </button>
    </div>
  );
}
```

---

### Example 2: Multi-Option Selector (Scan Depth)

```tsx
const DEPTH_CONFIG = {
  quick: {
    icon: Zap,
    label: "Quick",
    gradient:
      "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.08) 100%)",
    border: "border-green-200/30",
    iconBg: "bg-green-500",
  },
  standard: {
    icon: Search,
    label: "Standard",
    gradient:
      "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)",
    border: "border-blue-200/30",
    iconBg: "bg-blue-500",
  },
  thorough: {
    icon: Telescope,
    label: "Thorough",
    gradient:
      "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(168,85,247,0.08) 100%)",
    border: "border-purple-200/30",
    iconBg: "bg-purple-500",
  },
};

export function ScanDepthCards({ selected, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(["quick", "standard", "thorough"] as const).map((depth) => {
        const config = DEPTH_CONFIG[depth];
        const Icon = config.icon;
        const isSelected = selected === depth;

        return (
          <button
            key={depth}
            onClick={() => onChange(depth)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl p-4 backdrop-blur-md",
              isSelected
                ? "border " + config.border
                : "border-2 border-slate-200/30 bg-white/50 hover:bg-white/70",
            )}
            style={isSelected ? { background: config.gradient } : undefined}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                isSelected
                  ? config.iconBg + " text-white"
                  : "bg-slate-100 text-slate-400",
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {config.label.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

---

## Accessibility

### Keyboard Navigation

- Cards should be `<button>` elements (not `<div>`)
- Support `Enter` and `Space` for selection
- If card contains nested interactive elements (like Select), use `role="button"` on `<div>` with `tabIndex` and `onKeyDown`:

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={() => onChange(value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(value);
    }
  }}
>
```

### Nested Interactive Elements

When card contains `<Select>` or other buttons, prevent event bubbling:

```tsx
<div onClick={(e) => e.stopPropagation()}>
  <Select>...</Select>
</div>
```

---

## Responsive Sizing

```tsx
// Mobile-first responsive
className={cn(
  // Mobile
  "gap-1 rounded-lg p-2",
  // Desktop
  "sm:gap-2 sm:rounded-xl sm:p-4",
)}

// Icon sizes
<div className="h-9 w-9 sm:h-12 sm:w-12">
  <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
</div>

// Text sizes
<span className="text-[10px] sm:text-sm">Label</span>
```

---

## Demo Page

**Live Preview:** [http://localhost:3000/demo/ui-components](http://localhost:3000/demo/ui-components)

All glassmorphism components can be previewed on this page:

- ProjectTypeCards, ScanDepthCards, LimitPresets (original glassmorphism)
- PresetChips, ArticleSizeSelector, IconToggleBar, FlagPills
- SERPAIPlatformSelector, ModeSlider, ProductSelectorSidebar
- ComparisonToggle, ViewToggle

---

## Related Files

### Original Glassmorphism Components

- `components/demo/casual-ui/ProjectTypeCards.tsx` — My Product / Competitor selector
- `components/demo/casual-ui/ScanDepthCards.tsx` — Quick / Standard / Thorough selector
- `components/demo/casual-ui/LimitPresets.tsx` — Light / Standard / Deep / Custom presets

### Updated Components (January 2026)

- `components/demo/casual-ui/PresetChips.tsx` — Focus Area chips (SaaS, EdTech, B2B...)
- `components/blog/ArticleSizeSelector.tsx` — Article size cards (Mini, Standard, Full, Pillar)
- `components/demo/casual-ui/IconToggleBar.tsx` — Icon toggles (Video, Image, Audio ON/OFF)
- `components/demo/casual-ui/FlagPills.tsx` — Language selector with flags
- `components/ai-insights/SERPAIPlatformSelector.tsx` — AI platform checkboxes
- `components/demo/casual-ui/ModeSlider.tsx` — Scout mode slider (Quick/Deep)
- `components/ai-insights/ProductSelectorSidebar.tsx` — Product list sidebar
- `components/demo/casual-ui/ComparisonToggle.tsx` — Classic/Casual toggle
- `components/ai-insights/ViewToggle.tsx` — List/Compact/Grid view toggle

## Related Patterns

- [Glassmorphism](./glassmorphism.md) — Core blur and transparency patterns
- [Colors & Gradients](./colors-gradients.md) — Gradient color palette
- [Components](./components.md) — General component patterns
