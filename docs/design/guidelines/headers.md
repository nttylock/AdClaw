# Page Headers Design Guidelines

## Overview

Page headers use a consistent pattern with large icons, gradient text, and glassmorphism effects. **NO hover effects or transitions.**

## Standard Header Pattern

### Container

- **Border radius**: `rounded-3xl`
- **Background**: `bg-white/90` with optional gradient overlay
- **Border**: `border border-slate-200/50`
- **Shadow**: `shadow-sm`
- **NO fixed height** - height is determined by content padding
- **NO hover effects** - headers are static

### Icon Configuration

- **Size**: Reduced 10% from original for better balance
  - Mobile: `h-[126px] w-[126px]`
  - sm: `h-[139px] w-[139px]`
  - md: `h-[151px] w-[151px]`
- **Position**: Absolute, negative left offset
  - Mobile: `-left-[13px]`
  - sm: `-left-[20px]`
  - md: `-left-[27px]`
- **Vertical**: `top-1/2 -translate-y-[45%]` (centered to text block)
- **Container**: `overflow-hidden` to clip icon edges

### Fade Gradient

Creates smooth transition from icon to content:

```tsx
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-[25%] to-white to-[40%]" />
```

### Text Styling

- **Title**: `text-gradient-genius` class + responsive sizes
  - Mobile: `text-lg`
  - sm: `text-2xl`
  - md: `text-3xl`
- **Description**: `text-muted-foreground text-sm` (NOT responsive - matches billing)
- **Left margin** (from icon): `ml-[80px] sm:ml-[85px] md:ml-[80px]`

### Code Example

```tsx
<div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/90 shadow-sm">
  {/* Background gradient overlay */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-100/50 via-transparent to-purple-100/50 opacity-70" />

  {/* Icon - larger than container */}
  <div className="absolute -left-[13px] sm:-left-[20px] md:-left-[27px] top-1/2 -translate-y-[45%] h-[126px] sm:h-[139px] md:h-[151px] w-[126px] sm:w-[139px] md:w-[151px]">
    <Image
      src="/new-icons/header-example.webp"
      alt=""
      fill
      className="object-contain"
    />
  </div>

  {/* Fade gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-[25%] to-white to-[40%]" />

  {/* Content */}
  <div className="relative z-10">
    <div className="p-4 sm:p-6 md:p-8 ml-[80px] sm:ml-[85px] md:ml-[80px]">
      <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gradient-genius">
        Page Title
      </h1>
      <p className="text-muted-foreground text-sm">Page description</p>
    </div>
  </div>
</div>
```

## Onboarding Header (Non-Standard)

Onboarding pages use a taller header variant with larger padding.

### Configuration

- **Icon size** (reduced 10%):
  - Mobile: `h-[162px] w-[162px]`
  - sm: `h-[180px] w-[180px]`
  - md: `h-[198px] w-[198px]`
- **Icon offset**: `-left-7 sm:-left-9 md:-left-11`
- **Text margin**: `ml-[130px] sm:ml-[145px] md:ml-[160px]`

## Navbar-Style Header (Compact)

For pages with sticky navigation headers (like onboarding wizard).

### Dimensions

- **Height**: `h-16` (64px) - fixed height for navbar consistency
- **Icon size**: `h-[72px] w-[72px]`
- **Icon offset**: `-left-3`
- **Text margin**: `ml-[51px] sm:ml-[55px] md:ml-[59px]`

## Icon Assets

All header icons located in `/public/new-icons/`:

- `header-contact.webp`
- `header-privacy.webp`
- `header-terms.webp`
- `header-dashboard-welcome.webp`
- `header-dashboard-blog.webp`
- `header-dashboard-writer.webp`
- `header-dashboard-design.webp`
- `header-dashboard-editor.webp`
- `header-dashboard-ai-insights.webp`
- `header-dashboard-ai-readiness.webp`
- `header-dashboard-autopilot.webp`
- `header-dashboard-billing.webp`
- `header-dashboard-exports.webp`
- `header-dashboard-settings.webp`
- `header-dashboard-calendar.webp` ⚠️ edge-to-edge artwork, uses `scale-75`
- `header-onboarding.webp`

## Demo Page

View all headers: `/demo`

---

_Last updated: December 26, 2025 (v6 - icon vertical centering fix: -translate-y-[45%])_

## Special Cases

### Terms page (`/terms`)

The terms icon is visually larger than others, so it uses an additional 10% reduction:

- **Icon size**: `h-[113px] sm:h-[125px] md:h-[136px]`
- **Icon offset**: `-left-[11px] sm:-left-[18px] md:-left-[24px]`

### Edge-to-edge artwork (e.g. Calendar)

Some icon artworks fill the entire 1024x1024 canvas with no built-in transparent padding (unlike most icons which have ~30% padding). This causes the icon to appear visually much larger than others at the same container size.

**Fix**: Add `scale-75` to the `<Image>` `className` to visually shrink the artwork to match icons that have built-in padding. Keep the standard container size unchanged.

```tsx
<Image
  src="/new-icons/header-dashboard-calendar.webp"
  alt=""
  fill
  className="object-contain scale-75"
/>
```

**Affected icons**:

- `header-dashboard-calendar.webp` — uses `scale-75`

**How to check**: Compare the new icon visually against Blog Posts or Settings on mobile (390px). If the icon fills the entire container edge-to-edge, it needs `scale-75`.
