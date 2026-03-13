# Colors & Gradients

> Color palette, gradient patterns, and opacity usage across the platform.

## Overview

The Citedy design system uses a sophisticated color approach combining:

- **Slate** as the primary neutral scale
- **Blue/Purple** for accents
- **Pastel gradients** for headers and panels
- **Semantic colors** (green, red, amber) for states
- **Multi-stop gradients** for visual interest
- **Low-opacity overlays** for depth

---

## Color Palette

### Primary Neutrals (Slate)

```css
/* Slate scale - used throughout */
slate-50    /* #f8fafc */ - Backgrounds
slate-100   /* #f1f5f9 */ - Borders, subtle cards
slate-200   /* #e2e8f0 */ - Dividers
slate-400   /* #94a3b8 */ - Muted text
slate-500   /* #64748b */ - Secondary text
slate-600   /* #475569 */ - Body text
slate-700   /* #334155 */ - Emphasis text
slate-900   /* #0f172a */ - Headings
```

**Usage:**

```tsx
<h1 className="text-slate-900">Heading</h1>
<p className="text-slate-600">Body text</p>
<span className="text-slate-500">Secondary text</span>
<div className="bg-slate-50/50">Light background</div>
```

---

### Accent Colors

#### Blue (Primary Actions)

```css
blue-50     /* #eff6ff */ - Hover states, selected backgrounds
blue-500    /* #3b82f6 */ - Primary buttons, links
blue-600    /* #2563eb */ - Button hover
blue-700    /* #1d4ed8 */ - Active states
```

#### Purple (Premium/Pro Features)

```css
purple-100  /* #f3e8ff */
purple-600  /* #9333ea */
purple-700  /* #7e22ce */
```

#### Pastel Gradients (Headers/Panels)

Soft pastel gradients for widget headers and panel backgrounds:

```tsx
// Blue-Indigo-Purple (AI Visibility Checker)
className =
  "bg-gradient-to-r from-blue-100/80 via-indigo-50/60 to-purple-100/80";

// Emerald-Green-Teal (AI Chat)
className =
  "bg-gradient-to-r from-emerald-100/80 via-green-50/60 to-teal-100/80";

// Purple-Violet (Referral/Premium)
className =
  "bg-gradient-to-r from-purple-100/80 via-violet-50/60 to-purple-100/80";
```

**Pattern:** `from-{color}-100/80 via-{color}-50/60 to-{color}-100/80`

- Base colors at 80% opacity on edges
- Lighter middle at 60% opacity
- Creates soft, non-intrusive header backgrounds

#### Indigo-Purple (CTA Buttons)

```tsx
// Primary CTA gradient button
className =
  "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600";
```

#### Glassmorphism Modal Backgrounds

```tsx
// Modal shell (white glass effect)
className =
  "bg-gradient-to-br from-white/95 via-slate-50/90 to-gray-50/95 backdrop-blur-md";

// Subtle overlay accent (inside modal)
className =
  "bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-violet-500/5";
```

See: `docs/design/popup/pattern-team-invite-dialog.md`

#### Green (Success/Growth)

```css
green-50    /* #f0fdf4 */
green-500   /* #22c55e */
emerald-500 /* #10b981 */
```

#### Multi-Agent Accent Colors

```tsx
const AGENT_COLORS = {
  scout: "#06B6D4", // cyan
  strategy: "#10B981", // emerald
  writer: "#84CC16", // lime
  publisher: "#F97316", // orange
};
```

---

## Gradient Patterns

### 1. Final CTA Gradient Background

**Pattern:** Subtle warm diagonal gradient (gold → orange → coral)

```tsx
<section
  className="py-20 relative overflow-hidden"
  style={{
    background:
      "linear-gradient(135deg, rgba(253,230,138,0.1) 0%, rgba(253,186,116,0.1) 50%, rgba(252,165,165,0.08) 100%)",
  }}
>
  {/* Content */}
</section>
```

**Colors:**

- `rgba(253,230,138,0.1)` - Gold/amber at 10% opacity
- `rgba(253,186,116,0.1)` - Orange at 10% opacity
- `rgba(252,165,165,0.08)` - Coral/red at 8% opacity

**Use Case:** Large CTA sections, final conversion areas

---

### 2. Hero Top Glow

**Pattern:** Warm horizontal gradient with heavy blur (gold → orange → coral)

```tsx
<div
  className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] max-w-6xl h-48 pointer-events-none"
  style={{
    background:
      "linear-gradient(90deg, rgba(253,230,138,0.4) 0%, rgba(254,215,170,0.45) 25%, rgba(253,186,116,0.5) 50%, rgba(252,165,165,0.45) 75%, rgba(254,202,202,0.35) 100%)",
    filter: "blur(80px)",
    borderRadius: "50%",
    zIndex: 0,
  }}
/>
```

**Key Features:**

- 5-stop gradient for smooth color transitions
- `blur(80px)` for soft glow effect
- `borderRadius: 50%` creates elliptical shape
- `pointer-events-none` prevents interaction

**Use Case:** Hero sections, top-of-page visual interest

---

### 3. Thick Underline Emphasis

**Pattern:** Text background gradient for highlighting

```tsx
const thickUnderlineStyle = {
  backgroundImage:
    "linear-gradient(to right, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4))",
  backgroundSize: "100% 40%",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0 85%",
} as const;

// Usage:
<span style={thickUnderlineStyle}>Emphasized Text</span>;
```

**Key Features:**

- Purple to pink gradient (`#8b5cf6` → `#ec4899`)
- 40% opacity for subtle effect
- `backgroundSize: 100% 40%` makes it cover 40% of text height
- `backgroundPosition: 0 85%` positions near bottom

**Visual Effect:** Creates thick colored underline below text

---

### 4. Dialog/Modal Gradient Background

```tsx
<DialogContent className="bg-gradient-to-br from-white/95 via-slate-50/90 to-gray-50/95 backdrop-blur-md">
  {/* Content */}
</DialogContent>
```

**Pattern:** Diagonal gradient with multiple transparency stops

- `from-white/95` - Top-left: Almost opaque white
- `via-slate-50/90` - Middle: 90% opacity slate
- `to-gray-50/95` - Bottom-right: 95% opacity gray

**Effect:** Subtle depth with glass morphism

---

### 5. Card Glow Effects

**Outer Glow (Hover State):**

```tsx
<div className="relative group">
  <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
  <div className="relative bg-white rounded-3xl border border-slate-100">
    {/* Card content */}
  </div>
</div>
```

**Key Features:**

- `-inset-1` extends glow 4px beyond card
- `blur` + opacity creates soft halo
- `group-hover:opacity-50` intensifies on hover
- `duration-1000` for slow, smooth transition

---

### 6. Multi-Agent Background Shapes

**Top Shape (Scout + Strategy colors):**

```tsx
<div
  className="absolute -top-8 left-1/2 -translate-x-1/2 w-[80%] h-24 blur-3xl opacity-30"
  style={{
    background: "linear-gradient(90deg, #06B6D4 0%, #10B981 100%)",
    borderRadius: "50%",
  }}
/>
```

**Bottom Shape (Writer + Publisher colors):**

```tsx
<div
  className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-24 blur-3xl opacity-30"
  style={{
    background: "linear-gradient(90deg, #84CC16 0%, #F97316 100%)",
    borderRadius: "50%",
  }}
/>
```

**Pattern:** Horizontal gradients blurred to create convex lighting effect

---

### 7. Image Overlay Gradient (Onboarding Context Card)

```tsx
<div className="absolute inset-0 bg-gradient-to-r from-white via-white via-60% to-transparent" />
```

**Purpose:** Smooth transition from text area to background image

- `from-white` - Full opacity on left
- `via-white via-60%` - Maintains white until 60% across
- `to-transparent` - Fades to reveal image on right

**Use Case:** Cards with text on left, decorative image on right

---

## Decorative Blurred Shapes

### Large Background Circles

```tsx
{
  /* Decorative blurred shapes */
}
<div className="absolute inset-0 pointer-events-none overflow-hidden">
  <div
    className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-30"
    style={{ background: "rgba(16, 185, 129, 0.3)" }}
  />
  <div
    className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-30"
    style={{ background: "rgba(59, 130, 246, 0.3)" }}
  />
</div>;
```

**Pattern:**

- Positioned partially off-screen (`-top-20`, `-left-20`)
- Large size (`w-80 h-80` = 320px)
- Heavy blur (`blur-3xl` = 64px)
- Low opacity for subtlety

---

### Stats Section Background Shapes

**Top Shape:**

```tsx
<div
  className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] max-w-3xl h-24 -z-10"
  style={{
    background:
      "linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.12) 100%)",
    borderRadius: "50%",
    filter: "blur(30px)",
  }}
/>
```

**Bottom Shape:**

```tsx
<div
  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] max-w-3xl h-24 -z-10"
  style={{
    background:
      "linear-gradient(90deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.15) 100%)",
    borderRadius: "50%",
    filter: "blur(30px)",
  }}
/>
```

**Purpose:** Create subtle "glow" above and below content sections

---

## Opacity Best Practices

### Background Opacity Levels

| Opacity       | Use Case                       | Example          |
| ------------- | ------------------------------ | ---------------- |
| `/30` - `/40` | Decorative overlays            | `bg-blue-500/30` |
| `/50`         | Light backgrounds              | `bg-slate-50/50` |
| `/60` - `/70` | Glassmorphism cards            | `bg-white/70`    |
| `/80`         | Sticky headers                 | `bg-white/80`    |
| `/90` - `/95` | Navigation, high-content areas | `bg-white/95`    |

### Border Opacity

```tsx
border - white / 20; // Light on dark or glass
border - gray - 200 / 50; // Standard dividers
border - slate - 200 / 60; // Headers, strong separation
```

---

## Blur Effects Scale

| Class               | Blur Radius | Use Case                    |
| ------------------- | ----------- | --------------------------- |
| `blur`              | 8px         | Standard decorative shapes  |
| `blur-xl`           | 24px        | Medium background elements  |
| `blur-2xl`          | 40px        | Large glows                 |
| `blur-3xl`          | 64px        | Heavy background decoration |
| Custom `blur(80px)` | 80px        | Hero glow effects           |

---

## Complete Pattern Examples

### Example 1: CTA Section with Gradient + Decorative Shapes

```tsx
<section
  className="py-20 relative overflow-hidden"
  style={{
    background:
      "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(139, 92, 246, 0.08) 100%)",
  }}
>
  {/* Decorative blurred shapes */}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div
      className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-30"
      style={{ background: "rgba(16, 185, 129, 0.3)" }}
    />
    <div
      className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-30"
      style={{ background: "rgba(59, 130, 246, 0.3)" }}
    />
  </div>

  <div className="container mx-auto px-4 text-center relative z-10">
    <h2 className="text-3xl mb-4">Your CTA Here</h2>
    <Button>Get Started</Button>
  </div>
</section>
```

---

### Example 2: Agent Card with Underglow

```tsx
<div className="group relative h-[100px] transition-all duration-300 hover:-translate-y-0.5">
  {/* Underglow effect */}
  <div
    className="absolute left-1/2 -translate-x-1/2 w-[90%] h-8 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300"
    style={{
      zIndex: 0,
      bottom: "-12px",
      background:
        "radial-gradient(ellipse 100% 100% at center top, #06B6D460 0%, transparent 70%)",
      filter: "blur(8px)",
    }}
  />

  {/* Card content */}
  <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80">
    {/* Content */}
  </div>
</div>
```

**Pattern:** Radial gradient creates spotlight effect below card

---

## Color Accessibility

### Contrast Ratios

✅ **Do:**

- Use `text-slate-900` on `bg-white` (21:1 ratio)
- Use `text-slate-600` on `bg-white` (7:1 ratio)
- Test all gradient backgrounds with contrast tools

❌ **Don't:**

- Use `text-slate-400` on `bg-white` (< 4.5:1, fails WCAG AA)
- Rely on color alone for critical information

### Testing Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colorable](https://colorable.jxnblk.com/)
- Browser DevTools (Lighthouse)

---

## Related Patterns

- [Glassmorphism](./glassmorphism.md) - Uses opacity and blur
- [Components](./components.md#badges) - Badge color variants
- [Layout](./layout.md) - Background section patterns
