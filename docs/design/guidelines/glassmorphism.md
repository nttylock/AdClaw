# Glassmorphism Design Pattern

> Frosted glass aesthetic with backdrop blur, transparency, and subtle borders.

## Overview

Glassmorphism creates depth and hierarchy through semi-transparent backgrounds with blur effects. This pattern is used extensively for navigation, cards, popups, and overlays throughout the platform.

---

## When to Use

✅ **Use glassmorphism for:**

- Floating navigation bars
- Modal popups and dialogs
- Cards that overlay images or gradients
- Sticky headers that scroll over content
- Badge overlays and notification panels
- Context menus and tooltips

❌ **Avoid glassmorphism for:**

- Primary content areas with heavy text
- Form inputs (can reduce readability)
- Areas without visual background variation
- Mobile devices with limited GPU (use sparingly)

---

## Core Pattern

### Standard Glassmorphism Classes

```tsx
const glassStyles = cn(
  "backdrop-blur-md bg-white/70", // Blur + semi-transparent background
  "border border-white/20", // Subtle border
  "shadow-[0_8px_32px_rgba(0,0,0,0.04)]", // Soft shadow for depth
);
```

**Breakdown:**

- `backdrop-blur-md`: 12px blur on background
- `bg-white/70`: 70% opacity white background
- `border border-white/20`: 20% opacity white border
- Custom shadow: Soft, large spread for floating effect

---

## Shadow Intensity Guide

| Variant | Shadow | Use Case |
|---------|--------|----------|
| Minimal | `shadow-[0_2px_8px_rgba(0,0,0,0.02)]` | Trust badges, subtle cards |
| Light | `shadow-[0_4px_16px_rgba(0,0,0,0.04)]` | Stats cards, small elements |
| Standard | `shadow-[0_8px_32px_rgba(0,0,0,0.04)]` | Default cards, content blocks |
| Sidebar | `shadow-[0_8px_32px_rgba(0,0,0,0.06)]` | Navigation sidebars |
| Popup/Dialog | `shadow-[0_8px_40px_rgba(0,0,0,0.08)]` | Modals, dialogs, overlays |

⚠️ **ВАЖНО:** Избегайте теней с opacity выше `0.08` — они выглядят слишком тяжело и "приподнято". Продакшен использует `0.04-0.06` для большинства элементов

---

## Variants by Use Case

### 1. Floating Navigation (Landing Page)

**Desktop Navigation:**

```tsx
<nav className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50">
  {/* Navigation items */}
</nav>
```

**Mobile Menu Button:**

```tsx
<Button
  size="icon"
  className="h-12 w-12 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 hover:bg-gray-100/80 transition-all duration-200"
  variant="ghost"
>
  <Menu className="h-5 w-5" />
</Button>
```

**Key Features:**

- Higher opacity (`bg-white/95`) for better readability
- `rounded-full` for pill shape
- `shadow-lg` for strong floating effect
- Smooth transitions on hover

---

### 2. Sticky Header (Onboarding Wizard)

```tsx
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
  <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    {/* Header content */}
  </div>
</header>
```

**Key Features:**

- `backdrop-blur-xl`: Maximum blur (24px) for smooth overlay
- `bg-white/80`: 80% opacity balances visibility and transparency
- `border-b`: Bottom border only for separation
- `sticky top-0 z-50`: Stays at top, high z-index

---

### 3. Badge with Glass Effect

```tsx
<Badge
  variant="secondary"
  className="gap-1.5 backdrop-blur-md bg-white/70 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] whitespace-nowrap"
>
  <Bot className="h-3.5 w-3.5" />
  8+ AI Providers
</Badge>
```

**Key Features:**

- Combines variant styling with glass overlay
- Icon + text layout with `gap-1.5`
- Small elements (icons `h-3.5 w-3.5`)
- **`whitespace-nowrap`** — предотвращает перенос текста на новую строку

---

### 4. Popup/Dialog (AI Readiness Demo)

```tsx
<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-white/95 via-slate-50/90 to-gray-50/95 backdrop-blur-md border border-white/50 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
  {/* Dialog content */}
</DialogContent>
```

**Key Features:**

- **Large rounded corners**: `rounded-3xl` (24px) for modern feel
- **Gradient background**: Adds depth to glass effect
- **Multiple opacity layers**: Different sections with varied transparency
- **Popup shadow**: `shadow-[0_8px_40px_rgba(0,0,0,0.08)]` — максимум для модалов
- **Constrained height**: `max-h-[90vh] overflow-y-auto` for scroll

---

### 5. Static Elements (Login Button)

```tsx
<button className="p-2 lg:p-3 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:bg-gray-100 transition-colors">
  <LogIn className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
</button>
```

**Key Features:**

- Lower blur (`backdrop-blur-sm`) for subtle effect
- Responsive padding (`p-2 lg:p-3`)
- Icon size scales with breakpoint
- Hover state transitions smoothly

---

## Blur Intensity Guide

| Class               | Blur Amount | Use Case                      |
| ------------------- | ----------- | ----------------------------- |
| `backdrop-blur-sm`  | 4px         | Subtle hints, static elements |
| `backdrop-blur`     | 8px         | Default cards                 |
| `backdrop-blur-md`  | 12px        | Standard glass effect         |
| `backdrop-blur-lg`  | 16px        | Strong overlay                |
| `backdrop-blur-xl`  | 24px        | Navigation, sticky headers    |
| `backdrop-blur-2xl` | 40px        | Modals, full-screen overlays  |

---

## Opacity Levels

### Background Opacity

```tsx
bg - white / 50; // 50% - Very transparent, needs strong background
bg - white / 70; // 70% - Standard glassmorphism
bg - white / 80; // 80% - Sticky headers, readable text
bg - white / 90; // 90% - Cards with important content
bg - white / 95; // 95% - Navigation, high readability
```

### Border Opacity

```tsx
border - white / 20; // Subtle on light backgrounds
border - gray - 200 / 50; // Standard card borders
border - slate - 200 / 60; // Headers with separation
```

---

## Complete Examples

### Example 1: Floating CTA Card

```tsx
<div className="relative">
  {/* Background gradient for glass to overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl" />

  {/* Glass card */}
  <div className="relative backdrop-blur-lg bg-white/20 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl p-8">
    <h3 className="text-2xl font-bold text-white mb-4">Get Started Today</h3>
    <p className="text-white/90 mb-6">
      Join thousands of companies using AI to dominate search.
    </p>
    <Button className="bg-white text-gray-900 hover:bg-white/90">
      Start Free Trial
    </Button>
  </div>
</div>
```

---

### Example 2: Context Card with Image Overlay (Onboarding)

```tsx
<div className="relative group">
  {/* Outer glow effect */}
  <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />

  {/* Main card */}
  <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
    {/* Background image */}
    <div className="absolute right-0 top-0 h-full w-[45%]">
      <Image
        src="/context-icon.webp"
        alt="Context"
        fill
        className="object-contain object-right p-6"
      />
    </div>

    {/* Gradient overlay for smooth text transition */}
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white via-60% to-transparent" />

    {/* Content */}
    <div className="relative z-10 p-8">
      <div className="max-w-[60%]">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Why This Matters
        </h3>
        <p className="text-slate-600 leading-relaxed">
          Context and explanation text here.
        </p>
      </div>
    </div>
  </div>
</div>
```

**Pattern Breakdown:**

1. **Outer glow**: Blurred gradient creates halo effect
2. **Image placement**: Right side, 45% width
3. **Gradient overlay**: `via-60%` creates smooth left-to-right fade
4. **Content constraint**: `max-w-[60%]` prevents text overlap with image

---

## Accessibility Considerations

### Contrast Requirements

✅ **Do:**

- Use `bg-white/80` or higher for text-heavy areas
- Test contrast ratios with WebAIM tools
- Provide solid fallback backgrounds for critical text

❌ **Don't:**

- Use low opacity (`< 60%`) with important text
- Rely on blur alone for separation
- Stack multiple glass layers (reduces readability)

### Performance

- Use CSS `will-change: transform` for animated glass elements
- Limit blur on mobile devices (can cause lag)
- Prefer `backdrop-blur-sm` or `backdrop-blur-md` over `xl/2xl`

---

## Dark Mode Variants

```tsx
// Light mode
className = "backdrop-blur-md bg-white/70 border border-white/20";

// Dark mode
className =
  "backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30";
```

---

## Related Patterns

- [Gradient Backgrounds](./colors-gradients.md#gradient-backgrounds) - For backgrounds behind glass
- [Cards](./components.md#cards) - Standard card patterns
- [Navigation](./components.md#navigation) - Floating nav examples
