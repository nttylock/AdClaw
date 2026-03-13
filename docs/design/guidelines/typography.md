# Typography

> Font hierarchy, text treatments, and responsive sizing patterns.

## Overview

Typography system defining:

- Font families and weights
- Heading hierarchy and scales
- Text color treatments
- Responsive text sizing
- Special text effects (thick underlines, tracking)

---

## Font Stack

### Default Font

The platform uses the system font stack from Tailwind CSS:

```css
font-family:
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  "Helvetica Neue",
  Arial,
  sans-serif;
```

**Benefits:**

- Fast loading (no web fonts)
- Native OS rendering
- Excellent readability

---

## Heading Hierarchy

### H1 - Page Titles

```tsx
<h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
  Pay $0.07/Article. Not $99/Month Subscriptions.
</h1>
```

**Breakdown:**

- `text-4xl`: 36px (mobile)
- `sm:text-5xl`: 48px (small screens)
- `lg:text-6xl`: 60px (large screens)
- `font-bold`: 700 weight
- `tracking-tight`: -0.025em letter spacing

**Use Case:** Hero headlines, main page titles

---

### H2 - Section Titles

```tsx
<h2 className="text-3xl mb-4">
  <span className="font-light" style={{ fontStretch: "85%" }}>
    Start{" "}
  </span>
  <span className="font-black" style={{ fontStretch: "100%" }}>
    Stealing Traffic.
  </span>
</h2>
```

**Pattern:**

- `text-3xl`: 30px
- Mixed weights: `font-light` (300) + `font-black` (900)
- Font stretch for stylistic effect

**Alternative (Standard):**

```tsx
<h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
```

- `text-2xl`: 24px
- `font-bold`: 700 weight

---

### H3 - Subsection Titles

```tsx
<h3 className="text-xl font-bold text-slate-900 mb-2">
  What website do you want to grow?
</h3>
```

**Pattern:**

- `text-xl`: 20px
- `font-bold`: 700 weight
- `text-slate-900`: Near-black for maximum contrast
- `mb-2`: 8px bottom margin

**Context Card Variant:**

```tsx
<h3 className="text-xl font-bold text-slate-900 mb-4">Why This Matters</h3>
```

- Same sizing, larger margin (`mb-4` = 16px)

---

### H4 - Card Titles

```tsx
<h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
  Scout Agent
</h4>
```

**Pattern:**

- `text-sm`: 14px
- `font-semibold`: 600 weight
- `leading-tight`: 1.25 line height
- `mb-1`: 4px margin

---

## Body Text

### Standard Body Text

```tsx
<p className="text-lg text-muted-foreground max-w-xl">
  Cancel AI writer + SEO subscriptions. Get everything in one platform.
</p>
```

**Pattern:**

- `text-lg`: 18px (larger for landing pages)
- `text-muted-foreground`: CSS variable (typically `slate-600`)
- `max-w-xl`: 576px max width for readability

---

### Secondary Body Text

```tsx
<p className="text-slate-500">
  Enter your website and brand info. We'll track how AI platforms mention your
  brand.
</p>
```

**Pattern:**

- Default size: 16px (no class needed)
- `text-slate-500`: Medium gray

---

### Small Text / Helper Text

```tsx
<p className="text-xs text-slate-500">Comma-separated variations (optional)</p>
```

**Pattern:**

- `text-xs`: 12px
- `text-slate-500`: Medium gray
- Use for: Field helpers, disclaimers, metadata

---

### Muted Text

```tsx
<p className="text-sm text-muted-foreground">
  No credit card required • Pay what you need only
</p>
```

**Pattern:**

- `text-sm`: 14px
- `text-muted-foreground`: CSS variable
- Use for: Secondary info, disclaimers

---

## Text Colors

### Color Scale (Slate)

```tsx
// Headings
className = "text-slate-900"; // Near-black, maximum contrast

// Body text
className = "text-slate-600"; // Dark gray, high readability
className = "text-slate-700"; // Emphasis within body

// Secondary text
className = "text-slate-500"; // Medium gray
className = "text-slate-400"; // Light gray (use sparingly, low contrast)

// Muted (via CSS variable)
className = "text-muted-foreground"; // Maps to slate-600 or slate-500
```

---

### Semantic Colors

```tsx
// Primary actions
className = "text-blue-600"; // Links, primary emphasis
className = "text-blue-700"; // Hover states

// Success
className = "text-green-600";

// Error
className = "text-red-600";
className = "text-red-500"; // Required asterisk

// Warning
className = "text-amber-800"; // On amber background
```

---

## Font Weights

| Class           | Weight | Use Case                             |
| --------------- | ------ | ------------------------------------ |
| `font-light`    | 300    | Stylistic emphasis (mixed with bold) |
| `font-normal`   | 400    | Default body text                    |
| `font-medium`   | 500    | Navigation links, subtle emphasis    |
| `font-semibold` | 600    | Card titles, form labels             |
| `font-bold`     | 700    | Headings, buttons                    |
| `font-black`    | 900    | Strong emphasis, hero headlines      |

---

## Text Treatments

### 1. Thick Underline Emphasis

```tsx
const thickUnderlineStyle = {
  backgroundImage:
    "linear-gradient(to right, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4))",
  backgroundSize: "100% 40%",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0 85%",
} as const;

<h1 className="text-4xl font-bold">
  Pay <span style={thickUnderlineStyle}>$0.07/Article</span>. Not $99/Month
  Subscriptions.
</h1>;
```

**Effect:** Gradient underline below text (purple → pink)

---

### 2. Uppercase Labels

```tsx
<span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
  Step 1 of 7
</span>
```

**Pattern:**

- `uppercase`: Transforms to all caps
- `tracking-widest`: 0.1em letter spacing
- Small size (`text-xs`) + bold weight
- Often paired with accent color

**Alternative:**

```tsx
<p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
  Phase 1: Reconnaissance
</p>
```

- `text-[10px]`: Custom 10px size
- `tracking-wider`: 0.05em spacing
- Use for: Section labels, metadata

---

### 3. Line Clamping

```tsx
<p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
  Crawl and index your AI visibility footprint.
</p>
```

**Pattern:**

- `line-clamp-2`: Truncate after 2 lines with ellipsis
- `leading-relaxed`: 1.625 line height for readability

---

### 4. Text Truncation

```tsx
<p className="truncate">
  This text will be cut off with an ellipsis if too long...
</p>
```

**Use Case:** Single-line truncation (vs. `line-clamp-*` for multi-line)

---

## Responsive Typography

### Responsive Heading

```tsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
  Responsive Headline
</h1>
```

**Sizing:**

- Mobile: 36px (`text-4xl`)
- Small screens (640px+): 48px (`sm:text-5xl`)
- Large screens (1024px+): 60px (`lg:text-6xl`)

---

### Responsive Body Text

```tsx
<p className="text-base sm:text-lg lg:text-xl">Responsive paragraph text</p>
```

**Sizing:**

- Mobile: 16px (`text-base`)
- Small screens: 18px (`sm:text-lg`)
- Large screens: 20px (`lg:text-xl`)

---

### Responsive Step Title

```tsx
<h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
  Add Your Website
</h2>
```

**Sizing:**

- Mobile: 24px (`text-2xl`)
- Small screens (640px+): 30px (`sm:text-3xl`)

---

### Conditional Text (Mobile vs. Desktop)

```tsx
<Button>
  <span className="sm:hidden">Add</span>
  <span className="hidden sm:inline">Add Website</span>
  <ArrowRight className="h-4 w-4" />
</Button>
```

**Pattern:**

- `sm:hidden`: Show on mobile only
- `hidden sm:inline`: Hide on mobile, show on small+ screens
- Use for: Button text, navigation labels

---

## Line Heights

| Class             | Value | Use Case               |
| ----------------- | ----- | ---------------------- |
| `leading-tight`   | 1.25  | Headings, compact text |
| `leading-snug`    | 1.375 | Dense paragraphs       |
| Default           | 1.5   | Standard body text     |
| `leading-relaxed` | 1.625 | Long-form content      |
| `leading-loose`   | 2     | Wide spacing (rare)    |

**Example:**

```tsx
<p className="text-slate-600 leading-relaxed">
  Long-form paragraph with comfortable line height for extended reading.
</p>
```

---

## Complete Examples

### Example 1: Hero Headline with Mixed Weights

```tsx
<div className="space-y-4">
  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
    <span className="font-light" style={{ fontStretch: "85%" }}>
      Eliminate Competitors from Search Results{" "}
    </span>
    <span style={thickUnderlineStyle}>While You Sleep</span>
  </h1>
  <p className="text-lg text-muted-foreground max-w-xl">
    Multi-agent AI finds your weaknesses, creates counter-strike strategy, and
    auto-publishes hundreds of articles 24/7
  </p>
</div>
```

---

### Example 2: Form Field with Label + Helper

```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Label htmlFor="brandName">
      Brand Name <span className="text-red-500">*</span>
    </Label>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>How your brand appears in AI responses</p>
      </TooltipContent>
    </Tooltip>
  </div>
  <Input id="brandName" type="text" placeholder="My Brand Name" />
  <p className="text-xs text-slate-500">
    How AI might mention you without a link
  </p>
</div>
```

**Typography Breakdown:**

- Label: Default 14px, semibold (from `Label` component)
- Required asterisk: `text-red-500`
- Tooltip: Default 14px
- Helper text: 12px (`text-xs`), medium gray (`text-slate-500`)

---

### Example 3: Card with Title + Description

```tsx
<div className="p-8">
  <div className="max-w-[60%]">
    <h3 className="text-xl font-bold text-slate-900 mb-4">
      Why Start with a Domain?
    </h3>
    <p className="text-slate-600 leading-relaxed">
      Your domain is the foundation. We'll use it to crawl your current presence
      and identify how AI platforms perceive your brand.
    </p>
  </div>
</div>
```

**Typography Breakdown:**

- Title: 20px, bold, near-black, 16px margin
- Body: 16px (default), medium gray, relaxed line height

---

### Example 4: Step Header (Onboarding)

```tsx
<div className="flex items-center gap-4">
  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm">
    {/* Icon */}
  </div>
  <div>
    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
      Step 1 of 7
    </span>
    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
      Add Your Website
    </h2>
  </div>
</div>
```

**Typography Breakdown:**

- Label: 12px, bold, blue, uppercase, wide tracking
- Title: 24px → 30px (responsive), bold, near-black

---

## Accessibility Considerations

### Contrast Ratios

✅ **WCAG AA Compliant:**

```tsx
text-slate-900 on bg-white      // 21:1 (AAA)
text-slate-700 on bg-white      // 12.6:1 (AAA)
text-slate-600 on bg-white      // 7:1 (AA)
```

❌ **Fails WCAG AA:**

```tsx
text-slate-400 on bg-white      // 3.3:1 (Fail)
text-slate-300 on bg-white      // 2.1:1 (Fail)
```

**Rule:** Use `text-slate-500` or darker for body text

---

### Font Size Minimums

- **Body text**: Minimum 16px (default `text-base`)
- **Small text**: Minimum 12px (`text-xs`) for helper text
- **Buttons**: Minimum 14px (`text-sm`) for labels

---

### Line Length

- **Optimal**: 45-75 characters per line
- **Maximum**: 90 characters per line

```tsx
<p className="max-w-xl">  {/* 576px ≈ 60-70 chars */}
  Optimally sized paragraph for comfortable reading.
</p>

<p className="max-w-2xl">  {/* 672px ≈ 70-80 chars */}
  Slightly wider for less dense content.
</p>
```

---

## Related Patterns

- [Components](./components.md#badges) - Typography in UI components
- [Layout](./layout.md) - Text hierarchy within layouts
- [Colors & Gradients](./colors-gradients.md#thick-underline-emphasis) - Text color treatments
