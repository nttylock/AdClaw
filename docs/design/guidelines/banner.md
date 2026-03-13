# Promo Banner Guidelines

> Glassmorphism promo banners with floating images for CTAs and feature highlights.

## Overview

This document defines the standard pattern for creating promotional banners with:

- Floating images (left-aligned, overlapping container)
- Glassmorphism gradient backgrounds
- Fade gradient overlays
- Dark pill-style CTA buttons

---

## Visual Characteristics

| Element            | Style                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| **Container**      | `rounded-2xl border border-white/20 backdrop-blur-sm overflow-hidden` |
| **Background**     | Gradient with `opacity-70` (cyan/indigo/purple or brand colors)       |
| **Floating Image** | Absolute positioned, `-left-[10px]`, larger than container height     |
| **Fade Gradient**  | `bg-gradient-to-r from-transparent via-white/80 to-white/95`          |
| **CTA Button**     | Dark pill: `bg-slate-900 text-white rounded-full`                     |

---

## Structure

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────┐                                                    │
│  │     │   Title text here                    ┌──────────┐  │
│  │ IMG │   Description text                   │  Button  │  │
│  │     │                                      └──────────┘  │
│  └─────┘                                                    │
│     ↑                                                       │
│  Floating (absolute, overlaps left edge)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Basic Banner Structure

```tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

<div className="relative overflow-hidden rounded-2xl border border-white/20 backdrop-blur-sm">
  {/* 1. Gradient background */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-100/50 via-indigo-100/30 to-purple-100/50 opacity-70" />

  {/* 2. Floating image on left */}
  <div className="absolute -left-[10px] sm:-left-[15px] top-1/2 -translate-y-1/2 h-[80px] sm:h-[90px] w-[80px] sm:w-[90px]">
    <Image
      src="/ai-insights-icons/keyword-analysis.webp"
      alt=""
      fill
      className="object-contain"
    />
  </div>

  {/* 3. Fade gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-[20%] to-white/95 to-[35%]" />

  {/* 4. Optional: Decorative blur orb */}
  <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />

  {/* 5. Content */}
  <div className="relative z-10 flex items-center min-h-[80px] sm:min-h-[90px]">
    <div className="py-4 px-4 sm:px-6 ml-[55px] sm:ml-[60px] flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-800">
          Banner Title Here
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Supporting description text
        </p>
      </div>

      <div className="flex-shrink-0">
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-sm transition-all duration-300 gap-2">
          <Search className="h-4 w-4" />
          Action Label
        </Button>
      </div>
    </div>
  </div>
</div>;
```

---

## Layer Breakdown

### Layer 1: Container

```css
relative              /* Position context for absolute children */
overflow-hidden       /* Clip floating image at edges */
rounded-2xl           /* Rounded corners (16px) */
border border-white/20  /* Subtle glassmorphism border */
backdrop-blur-sm      /* Glass effect blur */
```

### Layer 2: Gradient Background

```css
pointer-events-none   /* Don't block clicks */
absolute inset-0      /* Fill container */
bg-gradient-to-r      /* Horizontal gradient */
from-cyan-100/50      /* Start color (50% opacity) */
via-indigo-100/30     /* Middle color */
to-purple-100/50      /* End color */
opacity-70            /* Overall opacity */
```

### Layer 3: Floating Image

```css
absolute              /* Remove from flow */
-left-[10px]          /* Overlap left edge (negative margin) */
sm:-left-[15px]       /* More overlap on larger screens */
top-1/2               /* Vertical center */
-translate-y-1/2      /* Perfect centering */
h-[80px] w-[80px]     /* Fixed dimensions for Image fill */
sm:h-[90px] sm:w-[90px]  /* Larger on sm+ screens */
```

**Image component:**

```tsx
<Image
  src="/path/to/image.webp"
  alt="" // Decorative, empty alt
  fill // Fill parent container
  className="object-contain" // Maintain aspect ratio
/>
```

### Layer 4: Fade Gradient

This creates a smooth transition from the image to the content area:

```css
absolute inset-0      /* Fill container */
bg-gradient-to-r      /* Horizontal gradient */
from-transparent      /* Start: fully transparent (image visible) */
via-white/80          /* Middle: semi-opaque white */
via-[20%]             /* Position of middle stop */
to-white/95           /* End: nearly opaque white */
to-[35%]              /* Position of end stop */
```

### Layer 5: Content

```css
relative z-10         /* Above all overlays */
flex items-center     /* Vertical centering */
min-h-[80px]          /* Minimum height matching image */
ml-[55px]             /* Left margin to clear floating image */
sm:ml-[60px]          /* More margin on larger screens */
```

---

## Button Styles

### Dark Pill (Primary CTA)

```tsx
<Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-sm transition-all duration-300 gap-2">
  <Search className="h-4 w-4" />
  Find Competitors
</Button>
```

**CSS breakdown:**

```css
bg-slate-900          /* Dark background */
hover:bg-slate-800    /* Slightly lighter on hover */
text-white            /* White text */
rounded-full          /* Pill shape */
shadow-sm             /* Subtle shadow */
transition-all duration-300  /* Smooth transitions */
gap-2                 /* Space between icon and text */
```

### Alternative: Gradient Button

```tsx
<Button className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 hover:from-cyan-600 hover:via-indigo-600 hover:to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/25">
  <Sparkles className="h-4 w-4" />
  Discover Now
</Button>
```

---

## Gradient Color Presets

### Cyan → Indigo → Purple (Default)

```tsx
// Background
from-cyan-100/50 via-indigo-100/30 to-purple-100/50

// Decorative orb
bg-purple-400/20
```

### Blue → Purple (Alternative)

```tsx
// Background
from-blue-100/50 via-violet-100/30 to-purple-100/50

// Decorative orb
bg-violet-400/20
```

### Amber → Orange (Warning/Notification)

```tsx
// Background
from-amber-100/50 via-orange-100/30 to-red-100/50

// Decorative orb
bg-orange-400/20
```

### Green → Emerald (Success)

```tsx
// Background
from-green-100/50 via-emerald-100/30 to-teal-100/50

// Decorative orb
bg-emerald-400/20
```

---

## Responsive Behavior

| Breakpoint | Image Size      | Image Offset   | Content Margin |
| ---------- | --------------- | -------------- | -------------- |
| Mobile     | `80px × 80px`   | `-left-[10px]` | `ml-[55px]`    |
| sm+        | `90px × 90px`   | `-left-[15px]` | `ml-[60px]`    |
| md+        | `100px × 100px` | `-left-[20px]` | `ml-[70px]`    |

### Mobile Layout

On mobile, the banner stacks vertically:

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div>{/* Title and description */}</div>
  <div className="flex-shrink-0">{/* Button - full width on mobile */}</div>
</div>
```

---

## Accessibility

### Image Alt Text

- Decorative images: use `alt=""`
- Meaningful images: provide descriptive alt text

### Color Contrast

- Title: `text-slate-800` on white/light gradient = 12:1 ratio (AAA)
- Description: `text-slate-600` = 5.5:1 ratio (AA)
- Button: `text-white` on `bg-slate-900` = 21:1 ratio (AAA)

### Touch Targets

- Minimum button height: 44px (achieved via Button component defaults)
- Adequate padding: `py-4 px-4 sm:px-6`

---

## Usage Examples

### Find Competitors CTA

```tsx
{
  competitors.length === 0 && (
    <PromoBanner
      image="/ai-insights-icons/keyword-analysis.webp"
      title="Don't know your competitors?"
      description="AI will find them based on your keywords and industry"
      buttonLabel="Find Competitors"
      buttonIcon={<Search className="h-4 w-4" />}
      onClick={onFindEnemy}
    />
  );
}
```

### Upgrade Prompt

```tsx
<PromoBanner
  image="/icons/upgrade-rocket.webp"
  title="Unlock Premium Features"
  description="Get unlimited checks, advanced analytics, and priority support"
  buttonLabel="Upgrade Now"
  buttonIcon={<Zap className="h-4 w-4" />}
  onClick={onUpgrade}
  gradient="amber"
/>
```

---

## Related Patterns

- [Navigation](./navigation.md) - Dark pill button style reference
- [Headers](../app-pages-headers.md) - Floating image pattern origin
- [Components](./components.md) - Button and card patterns
