# Navigation Patterns

> Tab navigation, pill styles, and section navigation patterns.

## Overview

This document defines the standard navigation patterns used across the platform:

- Tab navigation (primary sections)
- Pill-style tabs
- Breadcrumbs
- Section indicators

---

## Tab Navigation: Dark Pill Style

The primary tab navigation pattern uses a **dark pill style** for clear visual hierarchy and modern aesthetics.

### Visual Characteristics

| State        | Background     | Text Color       | Border Radius  | Shadow      |
| ------------ | -------------- | ---------------- | -------------- | ----------- |
| **Active**   | `bg-slate-900` | `text-white`     | `rounded-full` | `shadow-sm` |
| **Inactive** | transparent    | `text-slate-500` | `rounded-full` | none        |
| **Hover**    | `bg-slate-100` | `text-slate-900` | `rounded-full` | none        |

### Implementation

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, Sparkles, Swords, AlertTriangle } from "lucide-react";

// Dark Pill Tab Navigation
<TabsList className="flex w-fit min-h-[44px] h-auto flex-nowrap justify-start gap-2 overflow-x-auto scrollbar-hide bg-transparent p-0">
  <TabsTrigger
    value="visibility"
    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
  >
    <Eye className="h-4 w-4" />
    Visibility
  </TabsTrigger>
  {/* ... more tabs */}
</TabsList>;
```

### CSS Classes Breakdown

**TabsList Container:**

```css
flex                    /* Flexbox layout */
w-fit                  /* Shrink to content width */
min-h-[44px]           /* 44px touch target (accessibility) */
h-auto                 /* Allow height to grow */
flex-nowrap            /* Prevent wrapping */
justify-start          /* Always left-aligned */
gap-2                  /* 8px spacing between tabs */
overflow-x-auto        /* Horizontal scroll on mobile */
scrollbar-hide         /* Hide scrollbar */
bg-transparent         /* Override default shadcn bg */
p-0                    /* Remove default padding */
```

**TabsTrigger:**

```css
/* Base styles */
flex items-center justify-center gap-2   /* Icon + text layout */
px-5 py-2.5                              /* Padding (40px × 40px min) */
rounded-full                             /* Pill shape */
text-sm font-medium                      /* Typography */
transition-all duration-200              /* Smooth transitions */

/* Inactive state */
text-slate-500                           /* Muted text */
hover:text-slate-900                     /* Hover: darker text */
hover:bg-slate-100                       /* Hover: subtle background */

/* Active state (using data attributes) */
data-[state=active]:bg-slate-900         /* Dark background */
data-[state=active]:text-white           /* White text */
data-[state=active]:shadow-sm            /* Subtle shadow */
```

---

## Secondary Tab Navigation: Gray Pill Style

For nested/inner navigation within sections, use a lighter gray pill style with contained background.

### Visual Characteristics

| State        | Background  | Text Color       | Container                   |
| ------------ | ----------- | ---------------- | --------------------------- |
| **Active**   | `bg-white`  | `text-slate-900` | `bg-slate-100 rounded-full` |
| **Inactive** | transparent | `text-slate-500` | —                           |
| **Hover**    | —           | `text-slate-700` | —                           |

### Implementation

```tsx
<TabsList className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-full h-auto">
  <TabsTrigger
    value="all"
    className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-slate-500 hover:text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
  >
    All (28)
  </TabsTrigger>
  <TabsTrigger
    value="pending"
    className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-slate-500 hover:text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
  >
    Pending (28)
  </TabsTrigger>
  {/* ... more tabs */}
</TabsList>
```

### CSS Classes Breakdown

**TabsList Container (Secondary):**

```css
inline-flex items-center  /* Inline flex layout */
gap-1                     /* 4px spacing */
p-1                       /* 4px padding (container) */
bg-slate-100              /* Light gray background */
rounded-full              /* Pill container shape */
h-auto                    /* Auto height */
```

**TabsTrigger (Secondary):**

```css
px-4 py-1.5              /* Smaller padding (16px × 6px) */
rounded-full             /* Pill shape */
text-xs font-medium      /* Smaller text */
transition-all duration-200

/* Inactive */
text-slate-500           /* Muted text */
hover:text-slate-700     /* Darker on hover */

/* Active */
data-[state=active]:bg-white         /* White background */
data-[state=active]:text-slate-900   /* Dark text */
data-[state=active]:shadow-sm        /* Subtle lift */
```

### When to Use Secondary Tabs

✅ **Use for:**

- Filter options within a section (All, Pending, Active, Done)
- Sub-navigation inside cards
- Segmented controls

❌ **Don't use for:**

- Primary page navigation (use Dark Pill)
- More than 5 items

---

## Alternative Styles

### Gradient Pill (Variant A)

For more vibrant UI, use gradient background on active state:

```tsx
<TabsTrigger
  className="... data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25"
>
```

### Blue Accent Pill (Variant C3)

Brand-colored active state:

```tsx
<TabsTrigger
  className="... data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30"
>
```

### Contained Pill (Variant C2)

White pill on gray container:

```tsx
<TabsList className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-full">
  <TabsTrigger
    className="... data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
  >
```

---

## Accessibility Requirements

### Touch Targets

- Minimum height: `44px` (`min-h-[44px]`)
- Minimum padding: `px-5 py-2.5` (20px × 10px)

### Keyboard Navigation

- Tabs component handles arrow key navigation automatically
- Focus states inherited from shadcn/ui

### Color Contrast

- Active: white on slate-900 = 21:1 ratio (AAA)
- Inactive: slate-500 on white = 4.5:1 ratio (AA)
- Hover: slate-900 on slate-100 = 15:1 ratio (AAA)

---

## Usage Guidelines

### When to Use Dark Pill Tabs

✅ **Use for:**

- Primary section navigation (dashboard tabs)
- Feature area switching
- Multi-step wizards

❌ **Don't use for:**

- Nested/secondary navigation (use underline tabs)
- More than 5-6 items (consider dropdown)
- Mobile-first layouts with many items (use bottom nav)

### Icon Guidelines

- Always include icons for visual scanning
- Icon size: `h-4 w-4` (16px)
- Icon position: before label with `gap-2`
- Icon inherits text color automatically

---

## Demo Page

A live demo of all tab variants is available at:

```
/demo/tabs
```

This page shows interactive examples of:

- Variant A: Gradient Active Tab
- Variant A2: Softer Gradient
- Variant C: Pill Style (Dark) ← **Current Standard**
- Variant C2: Pill with Container
- Variant C3: Blue Accent Pill
- Current baseline for comparison

---

## Related Patterns

- [Components](./components.md) - Button and card patterns
- [Typography](./typography.md) - Text sizing for navigation
- [Layout](./layout.md) - Page structure with navigation
