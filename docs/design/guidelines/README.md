# Design System Guidelines

> **Version**: 1.0.0
> **Last Updated**: December 25, 2025
> **Status**: Production

## Overview

This design system documentation captures the complete visual language and component patterns used across the Citedy platform. All patterns are production-tested and optimized for modern web applications.

### Design Philosophy

- **Glassmorphism First**: Frosted glass aesthetics for depth and hierarchy
- **Gradient Accents**: Subtle color gradients for visual interest
- **Spatial Depth**: Blur effects and layered shadows create 3D perception
- **Responsive by Default**: Mobile-first approach with progressive enhancement
- **Accessibility Built-in**: WCAG 2.1 AA compliance as baseline

### Technology Stack

- **Framework**: Next.js 15.3.3 + React 18
- **Styling**: Tailwind CSS 3.x + CSS-in-JS for complex patterns
- **UI Library**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React for small icons, Heroicons for larger icons
- **Images**: Next.js Image component with optimization

---

## Documentation Structure

### Core Guidelines

1. **[Glassmorphism](./glassmorphism.md)** ⭐
   - Frosted glass effects for cards, navigation, and overlays
   - Backdrop blur techniques
   - Border and shadow patterns

2. **[Colors & Gradients](./colors-gradients.md)**
   - Color palette and semantic usage
   - Gradient backgrounds and accents
   - Opacity levels and blur effects

3. **[Layout Patterns](./layout.md)**
   - Two-column responsive layouts
   - Card compositions
   - Spacing systems and grid structures

4. **[Buttons](./buttons.md)** ⭐ CRITICAL
   - **Pill-стиль (rounded-full) — ЕДИНСТВЕННЫЙ ДОПУСТИМЫЙ**
   - Варианты: default, secondary, outline, ghost, destructive, glassmorphism
   - Размеры, состояния, примеры использования

5. **[Components](./components.md)**
   - Badges, cards, forms
   - Navigation patterns

6. **[Typography](./typography.md)**
   - Font hierarchy and scales
   - Text treatments and emphasis
   - Responsive text sizing

7. **[Navigation](./navigation.md)**
   - Dark Pill tab navigation (primary pattern)
   - Alternative tab styles (gradient, blue accent)
   - Accessibility requirements

8. **[Dashboard Cards](./dashboard-cards.md)**
   - Типовые карточки дашборда (cardBase pattern)
   - Standard vs Elevated варианты
   - Декоративные иконки и цветовая палитра

---

## Quick Reference

### Common Patterns

#### Glassmorphism Card

```tsx
<div className="backdrop-blur-md bg-white/70 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl p-6">
  {/* Content */}
</div>
```

#### Sticky Header

```tsx
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
  {/* Header content */}
</header>
```

#### Two-Column Layout

```tsx
<div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

#### Gradient Background

```tsx
<section
  className="py-20 relative overflow-hidden"
  style={{
    background:
      "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(139, 92, 246, 0.08) 100%)",
  }}
>
  {/* Content */}
</section>
```

---

## Design Tokens

### Spacing Scale

- `space-y-8`: Standard section spacing
- `space-y-6`: Form field spacing
- `gap-4`: Grid/flex gap for related items
- `gap-12 lg:gap-16`: Large responsive gaps

### Border Radius

- `rounded-full`: Pills, buttons, badges
- `rounded-2xl`: Standard cards (16px)
- `rounded-3xl`: Large feature cards (24px)
- `rounded-lg`: Small elements (8px)

### Shadow Layers

- `shadow-sm`: Subtle elevation
- `shadow-lg`: Floating elements
- `shadow-[0_8px_32px_rgba(0,0,0,0.08)]`: Glassmorphism depth

---

## Contributing

When adding new patterns:

1. Extract from production code
2. Document with copy-paste examples
3. Include responsive variants
4. Note accessibility considerations
5. Add visual examples where helpful

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
