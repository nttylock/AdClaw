# Layout Patterns

> Responsive grid systems, spacing conventions, and structural patterns.

## Overview

Layout patterns define the spatial organization of components, including:

- Two-column responsive layouts
- Card grid systems
- Form layouts
- Header/footer structures
- Spacing conventions

---

## Core Layout Principles

1. **Mobile-First**: Design for small screens, progressively enhance
2. **Container Widths**: Use semantic container classes
3. **Consistent Spacing**: Follow spacing scale (`space-y-*`, `gap-*`)
4. **Responsive Breakpoints**: `sm:`, `md:`, `lg:`, `xl:` prefixes
5. **Grid-Based**: Use CSS Grid for two-dimensional layouts

---

## Container Patterns

### Standard Container

```tsx
<div className="container mx-auto px-4">{/* Content */}</div>
```

**Breakdown:**

- `container`: Responsive max-width at each breakpoint
- `mx-auto`: Centers container horizontally
- `px-4`: 16px horizontal padding (responsive with `sm:px-6 lg:px-8`)

**Responsive Container:**

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">{/* Content */}</div>
```

---

### Constrained Content Width

```tsx
<div className="max-w-2xl w-full mx-auto lg:mx-0">
  {/* Constrained content */}
</div>
```

**Use Case:** Form sections, article content

- `max-w-2xl`: Maximum 672px width
- `w-full`: Full width up to max
- `lg:mx-0`: Remove auto margin on large screens (for two-column layouts)

---

## Two-Column Layouts

### 1. Hero Layout (Landing Page)

```tsx
<div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
  {/* Left Column - Content */}
  <div className="space-y-8">{/* Headline, subheadline, CTA */}</div>

  {/* Right Column - Visual */}
  <div className="relative">{/* Image, diagram, or illustration */}</div>
</div>
```

**Key Features:**

- `grid`: CSS Grid layout
- `gap-12`: 48px gap on mobile
- `lg:grid-cols-2`: Two columns on large screens
- `lg:gap-16`: 64px gap on large screens
- `items-center`: Vertically center both columns

---

### 2. Onboarding Layout (Action + Context)

```tsx
<main className="flex-1 flex flex-col lg:flex-row w-full">
  {/* Left Column: Action Zone */}
  <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
    <div className="max-w-2xl w-full mx-auto lg:mx-0">{/* Step content */}</div>
  </div>

  {/* Right Column: Context Zone */}
  <aside className="w-full lg:w-[450px] bg-white border-l border-slate-200/60 p-4 sm:p-6 lg:p-8 hidden lg:flex flex-col">
    <div className="sticky top-28 space-y-8">{/* Context cards */}</div>
  </aside>
</main>
```

**Pattern Breakdown:**

**Left Column:**

- `flex-1`: Takes remaining space
- `overflow-y-auto`: Scrollable content
- `max-w-2xl mx-auto lg:mx-0`: Centered on mobile, left-aligned on desktop

**Right Column:**

- `w-full lg:w-[450px]`: Full width on mobile, fixed 450px on desktop
- `hidden lg:flex`: Hidden on mobile, visible on large screens
- `sticky top-28`: Sticks to top with 112px offset (below header)
- `border-l`: Left border for separation

---

### 3. FAQ Two-Column Layout

```tsx
<div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-0">
  {/* Left Column */}
  <div className="divide-y divide-muted">
    {leftColumnItems.map((item) => (
      <FAQItem key={item.id} item={item} />
    ))}
  </div>

  {/* Right Column */}
  <div className="divide-y divide-muted">
    {rightColumnItems.map((item) => (
      <FAQItem key={item.id} item={item} />
    ))}
  </div>
</div>
```

**Key Features:**

- `max-w-5xl`: Container for readability
- `md:grid-cols-2`: Two columns on medium screens
- `gap-x-12`: 48px horizontal gap between columns
- `gap-y-0`: No vertical gap (dividers handle spacing)
- `divide-y divide-muted`: Dividers between items within columns

---

## Card Layouts

### 1. Grid of Cards (Multi-Agent)

```tsx
<div className="grid grid-cols-2 gap-4 pb-4">
  {AGENT_CARDS.map((agent) => (
    <div
      key={agent.id}
      className="group relative h-[100px] transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Card content */}
    </div>
  ))}
</div>
```

**Pattern:**

- `grid-cols-2`: Two columns (fixed, not responsive in this case)
- `gap-4`: 16px gap between cards
- `h-[100px]`: Fixed height for consistency
- `hover:-translate-y-0.5`: Subtle lift on hover

---

### 2. Card with Image Overlay

```tsx
<div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
  {/* Background image on the right */}
  <div className="absolute right-0 top-0 h-full w-[45%]">
    <Image
      src={contextIcon}
      alt="Context"
      fill
      className="object-contain object-right p-6"
    />
  </div>

  {/* Gradient overlay for smooth transition */}
  <div className="absolute inset-0 bg-gradient-to-r from-white via-white via-60% to-transparent" />

  {/* Content */}
  <div className="relative z-10 p-8">
    <div className="max-w-[60%]">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Title</h3>
      <p className="text-slate-600 leading-relaxed">Description</p>
    </div>
  </div>
</div>
```

**Layering (bottom to top):**

1. Base card (white background)
2. Background image (right side, 45% width)
3. Gradient overlay (white to transparent)
4. Text content (constrained to 60% width)

---

### 3. Intelligence Briefing Cards (Onboarding Sidebar)

```tsx
<div className="grid gap-3">
  <div className="group/item relative h-[78px] rounded-2xl bg-white border border-slate-100 overflow-hidden hover:shadow-md transition-all">
    {/* Background image */}
    <div className="absolute right-0 top-0 h-full w-[42%]">
      <Image
        src="/agent-icons/onboarding/onboarding-step2-scan.webp"
        alt="Scan"
        fill
        className="object-contain object-right p-2"
      />
    </div>

    {/* Gradient overlay */}
    <div className="absolute left-0 top-0 h-full w-[70%] bg-gradient-to-r from-white via-white to-transparent" />

    {/* Content */}
    <div className="relative z-10 flex items-center h-full">
      <div className="w-[70%] px-4">
        <p className="text-sm font-medium text-slate-700">
          Deep AI Mentions Analysis
        </p>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          Crawl and index your AI visibility footprint.
        </p>
      </div>
    </div>
  </div>
</div>
```

**Pattern:**

- Fixed height: `h-[78px]` for consistency
- Image: 42% width on right
- Gradient: 70% width on left (creates fade)
- Content: Constrained to 70% to avoid image overlap
- `line-clamp-2`: Truncate description after 2 lines

---

## Form Layouts

### Standard Form Spacing

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Field group */}
  <div className="space-y-2">
    <Label htmlFor="field">Field Label</Label>
    <Input id="field" />
    <p className="text-xs text-slate-500">Helper text</p>
  </div>

  {/* Another field */}
  <div className="space-y-2">
    <Label htmlFor="field2">Field 2</Label>
    <Input id="field2" />
  </div>

  <Button type="submit">Submit</Button>
</form>
```

**Spacing Conventions:**

- `space-y-6`: 24px between field groups
- `space-y-2`: 8px within field group (label, input, helper)

---

### Form with Section Grouping

```tsx
<form className="space-y-8">
  {/* Section 1 */}
  <div className="space-y-6">
    <h3 className="text-xl font-bold">Basic Info</h3>
    <div className="space-y-2">{/* Fields */}</div>
  </div>

  {/* Section 2 */}
  <div className="space-y-6">
    <h3 className="text-xl font-bold">Advanced Settings</h3>
    <div className="space-y-2">{/* Fields */}</div>
  </div>

  <Button type="submit">Save</Button>
</form>
```

**Hierarchy:**

- `space-y-8`: 32px between sections
- `space-y-6`: 24px between section heading and fields
- `space-y-2`: 8px within field groups

---

### Input with Icon

```tsx
<div className="relative">
  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
    <Image src="/icon.webp" alt="Icon" width={16} height={16} />
  </div>
  <Input id="domain" type="text" placeholder="example.com" className="pl-10" />
</div>
```

**Pattern:**

- Icon: Absolutely positioned `left-3` (12px from left)
- `top-1/2 -translate-y-1/2`: Vertically centered
- Input: `pl-10` (40px padding-left) to make room for icon

---

### Grid Button Selector (Languages)

```tsx
<div className="grid grid-cols-5 gap-1.5 sm:gap-2">
  {TARGET_MARKETS.map((market) => (
    <button
      key={market.code}
      type="button"
      onClick={() => setLanguage(market.code)}
      className={`
        flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg border-2 transition-all
        ${
          language === market.code
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-slate-200 hover:border-slate-300 text-slate-600"
        }
      `}
    >
      <span className="text-base sm:text-lg">{market.flag}</span>
      <span className="text-[9px] sm:text-[10px] font-medium mt-0.5">
        {market.code.toUpperCase()}
      </span>
    </button>
  ))}
</div>
```

**Pattern:**

- `grid-cols-5`: 5 columns for flags
- `gap-1.5 sm:gap-2`: Responsive gap (6px → 8px)
- Selected state: `border-blue-500 bg-blue-50 text-blue-700`
- Unselected: `border-slate-200 hover:border-slate-300`

---

## Header Patterns

### Sticky Header with Progress

```tsx
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
  <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    {/* Left: Logo + Title */}
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
        G
      </div>
      <div className="hidden sm:block">
        <h1 className="text-sm font-semibold text-slate-900">
          Mission Control
        </h1>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
          Phase 1: Reconnaissance
        </p>
      </div>
    </div>

    {/* Right: Progress + Actions */}
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end mr-4">
        <span className="text-xs font-medium text-slate-600">
          Progress: 42%
        </span>
        <Progress value={42} className="w-32 h-1.5 mt-1" />
      </div>
      <Button variant="ghost" size="sm">
        Reset
      </Button>
      <Button variant="ghost" size="sm">
        Exit
      </Button>
    </div>
  </div>
</header>
```

**Key Features:**

- `sticky top-0 z-50`: Stays at top, high z-index
- `h-16`: Fixed height (64px)
- Responsive padding: `px-4 sm:px-6 lg:px-8`
- `hidden sm:block`: Hide title on mobile
- `hidden md:flex`: Hide progress on mobile/tablet

---

### Step Header (Onboarding)

```tsx
<div className="mb-8 flex items-center gap-4">
  {/* Icon */}
  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm shrink-0 overflow-hidden">
    <Image
      src={stepIcon}
      alt={stepTitle}
      width={48}
      height={48}
      className="object-contain"
    />
  </div>

  {/* Text */}
  <div>
    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
      Step 1 of 7
    </span>
    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
      {stepTitle}
    </h2>
  </div>
</div>
```

**Pattern:**

- Icon: `w-16 h-16` (64px) with `rounded-2xl`
- Label: Small, bold, uppercase with extra tracking
- Title: Responsive size (`text-2xl sm:text-3xl`)

---

## Footer Patterns

### Standard Footer

```tsx
<footer className="py-8 border-t">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Logo + Tagline */}
      <div className="flex items-center gap-2">
        <Image
          src="/logo.webp"
          alt="Citedy"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <span className="font-bold text-lg">Citedy</span>
        <Badge variant="secondary">Be the AI's Answer</Badge>
      </div>

      {/* Center: Navigation */}
      <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground transition-colors">
          Blog
        </Link>
        <Link
          href="/contact"
          className="hover:text-foreground transition-colors"
        >
          Contact
        </Link>
        <Link
          href="/privacy"
          className="hover:text-foreground transition-colors"
        >
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-foreground transition-colors">
          Terms
        </Link>
      </nav>

      {/* Right: Copyright */}
      <p className="text-sm text-muted-foreground">
        &copy; 2025 Citedy. All rights reserved.
      </p>
    </div>
  </div>
</footer>
```

**Pattern:**

- `py-8`: 32px vertical padding
- `border-t`: Top border for separation
- Responsive: Stacked on mobile (`flex-col`), horizontal on desktop (`md:flex-row`)
- `items-center justify-between`: Distribute space evenly

---

## Spacing Scale Reference

### Vertical Spacing (`space-y-*`)

| Class        | Spacing | Use Case                          |
| ------------ | ------- | --------------------------------- |
| `space-y-1`  | 4px     | Tight grouping (label + sublabel) |
| `space-y-2`  | 8px     | Form field groups                 |
| `space-y-3`  | 12px    | Related items                     |
| `space-y-4`  | 16px    | Standard card content             |
| `space-y-6`  | 24px    | Form fields, list items           |
| `space-y-8`  | 32px    | Sections within page              |
| `space-y-12` | 48px    | Major sections                    |

### Gap (`gap-*`)

| Class     | Gap  | Use Case                            |
| --------- | ---- | ----------------------------------- |
| `gap-1.5` | 6px  | Tight grids (badges, small buttons) |
| `gap-2`   | 8px  | Icons + text                        |
| `gap-3`   | 12px | Sidebar items                       |
| `gap-4`   | 16px | Card grids                          |
| `gap-6`   | 24px | Footer nav links                    |
| `gap-12`  | 48px | Two-column layouts (mobile)         |
| `gap-16`  | 64px | Two-column layouts (desktop)        |

---

## Responsive Breakpoints

```tsx
// Tailwind default breakpoints
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
```

**Common Patterns:**

```tsx
className = "px-4 sm:px-6 lg:px-8"; // Responsive padding
className = "text-2xl sm:text-3xl lg:text-4xl"; // Responsive text
className = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; // Responsive grid
className = "hidden lg:flex"; // Show on large screens only
```

---

## Complete Layout Examples

### Example 1: Full Landing Page Structure

```tsx
<main className="min-h-screen relative">
  {/* Hero */}
  <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 pt-20 pb-10 lg:pt-28 lg:pb-16">
    <div className="container mx-auto px-4">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        {/* Content + Visual */}
      </div>
    </div>
  </section>

  {/* Features */}
  <section className="py-12">
    <div className="container mx-auto px-4">{/* Features content */}</div>
  </section>

  {/* FAQ */}
  <section className="py-10">
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-x-12">
        {/* FAQ columns */}
      </div>
    </div>
  </section>

  {/* Footer */}
  <footer className="py-8 border-t">{/* Footer content */}</footer>
</main>
```

---

## Accessibility Considerations

✅ **Do:**

- Use semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`)
- Maintain logical heading hierarchy (`h1` → `h2` → `h3`)
- Ensure sufficient touch target sizes (minimum 44px × 44px)
- Test responsive layouts at multiple breakpoints

❌ **Don't:**

- Nest interactive elements (e.g., button inside button)
- Use `fixed` positioning excessively (blocks content)
- Rely on visual spacing alone (use semantic markup)

---

## Related Patterns

- [Components](./components.md) - Individual component layouts
- [Glassmorphism](./glassmorphism.md) - Header transparency patterns
- [Typography](./typography.md) - Text hierarchy within layouts
