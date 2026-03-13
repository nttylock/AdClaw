# Feature Cards Design Guidelines

## Overview

Feature cards display content with decorative 3D/isometric images. Two main patterns exist:

1. **Phase Cards** - Timeline/evolution cards (tall, detailed)
2. **Compact Feature Cards** - Service/feature grid cards (short, concise)

**Key Principle**: Image is DECORATIVE background, content stays on LEFT side.

---

## 1. Phase Cards (Evolution Style)

Used for timeline progression, phases, or evolution steps.

### Specifications

- **Height**: Fixed `h-[170px]`
- **Image area**: Right 50% of card (`w-1/2`)
- **Content area**: Left 60% of card (`w-[60%]`)
- **Border radius**: `rounded-xl`
- **Background**: `bg-white/90 backdrop-blur-sm`
- **Border**: `border border-gray-100/80`

### Structure

```
┌────────────────────────────────────────────────────┐
│  PHASE 01           │                              │
│  The Past           │      [Isometric              │
│  ┌─────────┐        │       3D Icon]               │
│  │ SEO Ba..│        │                              │
│  └─────────┘        │                              │
│  Focus: Keywords    │                              │
│  Goal: Rank on P1   │                              │
└────────────────────────────────────────────────────┘
         60%                      50% (overlap)
```

### Code Example

```tsx
<div className="group relative h-[170px] transition-all duration-300 hover:-translate-y-0.5">
  {/* Underglow effect */}
  <div
    className="absolute left-1/2 -translate-x-1/2 w-[90%] h-8 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300"
    style={{
      zIndex: 0,
      bottom: "-12px",
      background: `radial-gradient(ellipse 100% 100% at center top, ${accentColor}60 0%, transparent 70%)`,
      filter: "blur(8px)",
    }}
  />

  {/* Card content */}
  <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 overflow-hidden">
    {/* Background image on the right */}
    <div className="absolute right-0 top-0 h-full w-1/2">
      <Image
        src={iconSrc}
        alt={title}
        fill
        className="object-contain object-right p-2"
      />
    </div>

    {/* Gradient overlay - white fades into image */}
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white via-55% to-transparent rounded-xl" />

    {/* Content */}
    <div className="relative z-10 flex flex-col justify-center h-full">
      <div className="w-[60%] p-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Phase {phase}
        </div>
        <h4 className="text-sm font-semibold text-gray-900 leading-tight">
          {title}
        </h4>
        <Badge
          variant="outline"
          className="mt-1 mb-2 text-[10px] px-1.5 py-0"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          {subtitle}
        </Badge>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          <span className="font-medium text-gray-900">Focus:</span> {focus}
        </p>
        <p className="text-[11px] text-gray-600 leading-relaxed mt-1">
          <span className="font-medium text-gray-900">Goal:</span> {goal}
        </p>
      </div>
    </div>
  </div>
</div>
```

### Grid Layout

```tsx
<div className="grid gap-4 sm:grid-cols-3 mb-16">
  {PHASES.map((phase) => (
    <PhaseCard key={phase.id} {...phase} />
  ))}
</div>
```

---

## 2. Compact Feature Cards (Service Grid)

Used for feature lists, services, or capabilities.

### Specifications

- **Height**: Fixed `h-[100px]`
- **Image area**: Right 50% of card (`w-1/2`)
- **Content area**: Left 60% of card (`w-[60%]`)
- **Border radius**: `rounded-xl`
- **Background**: `bg-white/90 backdrop-blur-sm`
- **Border**: `border border-gray-100/80`

### Structure

```
┌────────────────────────────────────────────────────┐
│  Keyword Analysis   │      [3D Icon]               │
│  Deep keyword res...│                              │
└────────────────────────────────────────────────────┘
         60%                      50% (overlap)
```

### Code Example

```tsx
<div className="group relative h-[100px] transition-all duration-300 hover:-translate-y-0.5">
  {/* Underglow effect */}
  <div
    className="absolute left-1/2 -translate-x-1/2 w-[90%] h-8 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300"
    style={{
      zIndex: 0,
      bottom: "-12px",
      background: `radial-gradient(ellipse 100% 100% at center top, ${accentColor}60 0%, transparent 70%)`,
      filter: "blur(8px)",
    }}
  />

  {/* Card content */}
  <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 overflow-hidden">
    {/* Background image on the right */}
    <div className="absolute right-0 top-0 h-full w-1/2">
      <Image
        src={iconSrc}
        alt={name}
        fill
        className="object-contain object-right p-2"
      />
    </div>

    {/* Hover color overlay (optional) */}
    <div
      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        background: `linear-gradient(to right, ${accentColor}15 0%, ${accentColor}08 40%, transparent 60%)`,
      }}
    />

    {/* Base gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white via-55% to-transparent rounded-xl" />

    {/* Content */}
    <div className="relative z-10 flex items-center h-full">
      <div className="w-[60%] p-3">
        <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
          {name}
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  </div>
</div>
```

### Grid Layout

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {SERVICES.map((service) => (
    <CompactFeatureCard key={service.id} {...service} />
  ))}
</div>
```

---

## 3. Common Elements

### Underglow Effect

Creates soft colored shadow below card:

```tsx
<div
  className="absolute left-1/2 -translate-x-1/2 w-[90%] h-8 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300"
  style={{
    zIndex: 0,
    bottom: "-12px",
    background: `radial-gradient(ellipse 100% 100% at center top, ${accentColor}60 0%, transparent 70%)`,
    filter: "blur(8px)",
  }}
/>
```

### Gradient Overlay

Creates fade from content to image:

```tsx
<div className="absolute inset-0 bg-gradient-to-r from-white via-white via-55% to-transparent rounded-xl" />
```

**Key values:**

- `from-white` - solid white on left
- `via-white via-55%` - white extends to 55%
- `to-transparent` - fades to show image

### Hover Animation

```tsx
className = "transition-all duration-300 hover:-translate-y-0.5";
```

### Highlight Ring (Featured Cards)

```tsx
className={cn(
  "group relative h-[100px]",
  featured && "ring-2 ring-purple-400 ring-offset-2 rounded-xl"
)}
```

---

## 4. Image Assets

### Existing Icon Libraries

Search for existing icons in these directories:

| Directory                    | Contents                 | Example                         |
| ---------------------------- | ------------------------ | ------------------------------- |
| `/public/new-icons/`         | Header icons, general UI | `header-dashboard-*.webp`       |
| `/public/agent-icons/`       | Agent/bot illustrations  | `multiagent/`, `llm-dominance/` |
| `/public/ai-insights-icons/` | AI services icons        | `keyword-analysis.png`          |

**Subdirectories in `/public/agent-icons/`:**

- `multiagent/` - Scout, Strategy, Writer, Publisher, Linker agents
- `llm-dominance/` - Phase icons (past, present, future), Pillar icons
- `onboarding/` - Onboarding step illustrations
- `stats/` - Statistics/metrics icons

### Generate New Icons

Use scripts in `/scripts/` to generate AI-powered icons:

```bash
# Generate header icons (3D isometric style)
npx tsx scripts/generate-header-icons.ts [--test]

# Generate AI insights service icons
npx tsx scripts/generate-ai-insights-icons.ts

# Generate multiagent icons
npx tsx scripts/generate-multiagent-icons.ts

# Generate LLM dominance phase/pillar icons
npx tsx scripts/generate-llm-dominance-icons.ts
```

### Process Existing Icons

```bash
# Remove background from PNG
npx tsx scripts/process-single-icon.ts <icon-name>

# Convert to WebP (optimized)
npx tsx scripts/convert-header-icons-to-webp.ts
```

### Full Documentation

See **[/docs/design/icons/README.md](/docs/design/icons/README.md)** for:

- Complete script reference
- Style guidelines (3D isometric, glassmorphism)
- Generation workflow
- Reference images for consistency

### Icon Requirements

- **Format**: PNG with transparency (source), WebP (production)
- **Size**: 512x512 generated, scaled by `object-contain`
- **Style**: 3D isometric, glassmorphism, soft shadows
- **Background**: Transparent (auto-removed by scripts)
- **Position**: Icons should face/extend LEFT for best composition

### Image Placement

```tsx
<Image
  src={iconSrc}
  alt={title}
  fill
  className="object-contain object-right p-2"
/>
```

**Key classes:**

- `fill` - fills container
- `object-contain` - maintains aspect ratio
- `object-right` - aligns to right edge
- `p-2` - padding from edges

---

## 5. Typography Scale

### Phase Cards

| Element     | Class                                 | Size |
| ----------- | ------------------------------------- | ---- |
| Phase label | `text-[10px] uppercase tracking-wide` | 10px |
| Title       | `text-sm font-semibold`               | 14px |
| Badge       | `text-[10px] px-1.5 py-0`             | 10px |
| Focus/Goal  | `text-[11px]`                         | 11px |

### Compact Cards

| Element     | Class                   | Size |
| ----------- | ----------------------- | ---- |
| Title       | `text-sm font-semibold` | 14px |
| Description | `text-xs line-clamp-2`  | 12px |

---

## 6. Accent Colors

Use consistent accent colors from design system:

```tsx
const ACCENT_COLORS = {
  gray: "#6B7280",
  orange: "#F97316",
  emerald: "#10B981",
  cyan: "#06B6D4",
  violet: "#8B5CF6",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  red: "#EF4444",
  green: "#22C55E",
  indigo: "#6366F1",
  pink: "#EC4899",
  teal: "#14B8A6",
};
```

---

## 7. Do's and Don'ts

### Do's

- Use fixed heights (`h-[170px]` or `h-[100px]`)
- Keep content on LEFT, image on RIGHT
- Use gradient overlay to blend text area
- Add underglow effect for depth
- Use `overflow-hidden` on card container
- Include `group` class for hover effects

### Don'ts

- Don't put content over the image
- Don't use variable heights (breaks grid alignment)
- Don't remove gradient overlay (text becomes unreadable)
- Don't use images without transparency
- Don't place image on left side (breaks pattern)
- Don't exceed 60% width for content area

---

## 8. Responsive Behavior

### Grid Breakpoints

```tsx
// Phase cards - 3 columns
<div className="grid gap-4 sm:grid-cols-3">

// Feature cards - 2 to 3 columns
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

### Mobile Scroll (Alternative)

For many cards, use horizontal scroll on mobile:

```tsx
<div className="md:hidden overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide">
  <div className="flex gap-4 snap-x snap-mandatory">
    {items.map((item) => (
      <div key={item.id} className="w-[280px] flex-shrink-0 snap-center">
        <Card {...item} />
      </div>
    ))}
  </div>
</div>
```

---

## 9. Reference Components

| Component     | File                                        | Pattern           |
| ------------- | ------------------------------------------- | ----------------- |
| Phase Cards   | `components/landing/LLMDominanceModule.tsx` | Evolution phases  |
| Compact Cards | `components/landing/AIInsightsShowcase.tsx` | Feature grid      |
| Agent Cards   | `components/landing/MultiAgentShowcase.tsx` | Detailed features |

---

_Last updated: December 29, 2025_
