# Component Patterns

> Reusable UI components with variants, states, and usage examples.

## Overview

This document catalogs production-tested component patterns including:

- Buttons (variants, sizes, states)
- Badges
- Cards (standard, glass, image overlay)
- Forms (inputs, labels, tooltips)
- Navigation (floating, sticky, mobile)

All examples use shadcn/ui base components with custom Tailwind extensions.

---

## Buttons

> **ПОЛНАЯ ДОКУМЕНТАЦИЯ**: См. [buttons.md](./buttons.md)

### КРИТИЧЕСКОЕ ПРАВИЛО

**ВСЕ кнопки в Citedy используют pill-стиль (`rounded-full`).**

```tsx
// ✅ ПРАВИЛЬНО
import { Button } from "@/components/ui/button-citedy-style";

<Button variant="default" size="lg">Get Started</Button>

// ❌ ЗАПРЕЩЕНО
<Button className="rounded-xl">Wrong</Button>
<button className="rounded-lg">Wrong</button>
```

### Быстрый справочник

| Variant         | Использование                | Стиль                    |
| --------------- | ---------------------------- | ------------------------ |
| `default`       | Главные CTA                  | Тёмная pill (slate-900)  |
| `secondary`     | Вторичные действия           | Светлая pill (slate-100) |
| `outline`       | Альтернативные, текущий план | Бордер + прозрачный фон  |
| `ghost`         | Минимальные действия         | Прозрачный               |
| `destructive`   | Удаление                     | Красная pill             |
| `glassmorphism` | Поверх изображений           | Стеклянная pill          |

### Размеры

| Size      | Height  | Use Case    |
| --------- | ------- | ----------- |
| `sm`      | 40px    | Компактные  |
| `default` | 44px    | Стандартные |
| `lg`      | 48px    | Важные CTA  |
| `icon`    | 40x40px | Иконки      |

---

## Badges

### ⚠️ КРИТИЧЕСКИЕ ПРАВИЛА ДЛЯ BADGES

**ЗАПРЕЩЕНО:** Badges с переносом текста на новую строку (word-wrap)

❌ **Плохо:**

```
┌─────────┐
│  high   │
│  intent │
└─────────┘
```

✅ **Хорошо:**

```
┌─────────────┐
│ high intent │
└─────────────┘
```

**Решения для длинного текста в badges:**

1. **`whitespace-nowrap`** — запретить перенос (предпочтительно)
2. **Уменьшить шрифт:** `text-[10px]` или `text-xs`
3. **Сократить текст:** "high intent" → "high" или "HI"
4. **Аббревиатуры:** "medium intent" → "med"

```tsx
// ✅ Правильно - всегда добавляй whitespace-nowrap
<Badge className="whitespace-nowrap text-xs">high intent</Badge>

// ✅ Или сокращай текст
<Badge className="whitespace-nowrap">high</Badge>
```

---

### Secondary Badge

```tsx
<Badge variant="secondary" className="whitespace-nowrap">
  Be the AI's Answer
</Badge>
```

**Use Case:** Tags, labels, feature highlights

---

### Badge with Icon (Glass Effect)

```tsx
<Badge
  variant="secondary"
  className="gap-1.5 whitespace-nowrap backdrop-blur-md bg-white/70 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
>
  <Bot className="h-3.5 w-3.5" />
  8+ AI Providers
</Badge>
```

**Use Case:** Landing page feature badges

- `gap-1.5`: 6px between icon and text
- **`whitespace-nowrap`**: Предотвращает перенос текста
- Glassmorphism classes overlay on gradient backgrounds
- Small icon size: `h-3.5 w-3.5` (14px)

---

### Badge Group

```tsx
<div className="flex flex-wrap gap-2">
  <Badge
    variant="secondary"
    className={cn("gap-1.5 whitespace-nowrap", glassStyles)}
  >
    <Bot className="h-3.5 w-3.5" />
    8+ AI Providers
  </Badge>
  <Badge
    variant="secondary"
    className={cn("gap-1.5 whitespace-nowrap", glassStyles)}
  >
    <Clock className="h-3.5 w-3.5" />
    24/7 Autopilot
  </Badge>
  <Badge
    variant="secondary"
    className={cn("gap-1.5 whitespace-nowrap", glassStyles)}
  >
    <Globe className="h-3.5 w-3.5" />
    Auto-Publish
  </Badge>
</div>
```

**Pattern:**

- `flex flex-wrap`: Multi-line on narrow screens (badges wrap, not text inside)
- `gap-2`: 8px between badges
- **`whitespace-nowrap`**: Каждый badge в одну строку
- Consistent icon size and gap

---

## Cards

### 1. Standard Card (Rounded-3xl)

```tsx
<div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
  <div className="p-6 sm:p-8">{/* Card content */}</div>
</div>
```

**Use Case:** Main content cards, step containers

- `rounded-3xl`: 24px border radius (modern, soft)
- `border-slate-200/60`: Subtle 60% opacity border
- Responsive padding: `p-6 sm:p-8` (24px → 32px)

---

### 2. Card with Rounded-2xl

```tsx
<div className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
  {/* Card content */}
</div>
```

**Use Case:** Smaller cards, list items

- `rounded-2xl`: 16px border radius
- `border-slate-100`: Lighter border for subtle cards

---

### 3. Glass Card

```tsx
<div className="backdrop-blur-md bg-white/70 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-6">
  <h3 className="text-lg font-semibold mb-4">Card Title</h3>
  <p className="text-sm text-slate-600">Card description</p>
</div>
```

**Use Case:** Overlays on images/gradients

- See [Glassmorphism](./glassmorphism.md) for full pattern details

---

### 4. Card with Image Background + Overlay

```tsx
<div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
  {/* Background image on the right */}
  <div className="absolute right-0 top-0 h-full w-[45%]">
    <Image
      src="/context-icon.webp"
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
      <h3 className="text-xl font-bold text-slate-900 mb-4">
        Why This Matters
      </h3>
      <p className="text-slate-600 leading-relaxed">Explanation text here.</p>
    </div>
  </div>
</div>
```

**Layering:**

1. Base card (white)
2. Image (absolute positioned, right side)
3. Gradient overlay (creates fade)
4. Content (z-10, constrained width)

**Use Case:** Context cards, feature explanations

---

### 5. Agent Card with Underglow

```tsx
<div className="group relative h-[100px] transition-all duration-300 hover:-translate-y-0.5">
  {/* Underglow effect below card */}
  <div
    className="absolute left-1/2 -translate-x-1/2 w-[90%] h-8 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300"
    style={{
      zIndex: 0,
      bottom: "-12px",
      background: `radial-gradient(ellipse 100% 100% at center top, #06B6D460 0%, transparent 70%)`,
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

    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white via-55% to-transparent rounded-xl" />

    {/* Content */}
    <div className="relative z-10 flex items-center h-full">
      <div className="w-[60%] p-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
          Scout Agent
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Finds weaknesses & gaps
        </p>
      </div>
    </div>
  </div>
</div>
```

**Key Features:**

- **Underglow**: Positioned below card (`bottom: -12px`) with radial gradient
- **Hover effect**: Lift card slightly + intensify glow
- **Image**: 50% width on right
- **Gradient**: Smooth text-to-image transition

---

### 6. Mini Card (Intelligence Briefing)

```tsx
<div className="group/item relative h-[78px] rounded-2xl bg-white border border-slate-100 overflow-hidden hover:shadow-md transition-all">
  {/* Background image */}
  <div className="absolute right-0 top-0 h-full w-[42%]">
    <Image
      src="/agent-icon.webp"
      alt="Icon"
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
```

**Pattern:**

- Fixed height: `h-[78px]`
- Image: 42% width
- Content: 70% width with `line-clamp-2` for truncation
- Hover: Add shadow (`hover:shadow-md`)

---

### 7. Card with Outer Glow (Hover)

```tsx
<div className="relative group">
  {/* Outer glow effect */}
  <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />

  {/* Main card */}
  <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
    {/* Card content */}
  </div>
</div>
```

**Pattern:**

- `-inset-1`: Glow extends 4px beyond card
- `blur` + gradient background creates halo
- `group-hover:opacity-50`: Intensifies on hover
- `duration-1000`: Slow, smooth transition

---

## Forms

### Input Variants

#### Standard Input

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

---

#### Input with Icon

```tsx
<div className="space-y-2">
  <Label htmlFor="domain">Website Domain</Label>
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
      <Image src="/icon.webp" alt="Icon" width={16} height={16} />
    </div>
    <Input
      id="domain"
      type="text"
      placeholder="example.com"
      className="pl-10"
    />
  </div>
</div>
```

**Pattern:**

- Icon: `left-3` (12px), centered vertically
- Input: `pl-10` (40px) to avoid overlap

---

#### Input with Helper Text

```tsx
<div className="space-y-2">
  <Label htmlFor="brandName">Brand Name</Label>
  <Input id="brandName" type="text" placeholder="My Brand Name" />
  <p className="text-xs text-slate-500">
    How AI might mention you without a link
  </p>
</div>
```

**Pattern:**

- `space-y-2`: 8px gap between label, input, helper
- Helper text: `text-xs text-slate-500`

---

### Label Patterns

#### Label with Required Indicator

```tsx
<Label htmlFor="field">
  Field Name <span className="text-red-500">*</span>
</Label>
```

---

#### Label with Tooltip

```tsx
<div className="flex items-center gap-2">
  <Label htmlFor="field">
    Field Name <span className="text-red-500">*</span>
  </Label>
  <Tooltip>
    <TooltipTrigger asChild>
      <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      <p>Explanation of what this field does.</p>
    </TooltipContent>
  </Tooltip>
</div>
```

**Pattern:**

- Icon: `h-4 w-4` (16px), muted color
- `cursor-help`: Shows help cursor on hover
- Tooltip content: `max-w-xs` (320px) for readability

---

### Select/Picker Patterns

#### Grid Button Selector

```tsx
<div className="space-y-2">
  <Label>
    Target Market <span className="text-red-500">*</span>
  </Label>
  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
    {OPTIONS.map((option) => (
      <button
        key={option.id}
        type="button"
        onClick={() => setSelected(option.id)}
        className={`
          flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg border-2 transition-all
          ${
            selected === option.id
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-600"
          }
        `}
      >
        <span className="text-base sm:text-lg">{option.emoji}</span>
        <span className="text-[9px] sm:text-[10px] font-medium mt-0.5">
          {option.code}
        </span>
      </button>
    ))}
  </div>
</div>
```

**Pattern:**

- Grid layout: `grid-cols-5` for 5 options per row
- Selected state: Blue border + blue background + blue text
- Unselected state: Slate border + hover effect
- Responsive: Smaller padding and text on mobile

---

## Navigation

### 1. Floating Navigation (Desktop)

```tsx
<div className="fixed top-4 inset-x-0 z-50 flex justify-center animate-fadeIn">
  <nav className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50">
    {menuItems.map((item) => (
      <Link
        key={item.title}
        href={item.href}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors text-sm font-medium"
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
      </Link>
    ))}
  </nav>
</div>
```

**Pattern:**

- `fixed top-4 inset-x-0`: Fixed position, 16px from top, centered
- `rounded-full`: Pill-shaped navigation
- Glassmorphism: `bg-white/95 backdrop-blur-sm`
- Items: `rounded-full` with hover effect

---

### 2. Mobile Menu (Sheet)

```tsx
<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
  <SheetTrigger asChild>
    <Button
      size="icon"
      className="h-12 w-12 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50"
      variant="ghost"
    >
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
    <nav className="mt-6">
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </SheetContent>
</Sheet>
```

**Pattern:**

- Trigger: Icon button with glassmorphism
- Sheet: Slides from right, responsive width
- Items: Larger touch targets (`py-3`), icon + text layout

---

### 3. Sticky Header

```tsx
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
  <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    {/* Logo + Title */}
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
        G
      </div>
      <h1 className="text-sm font-semibold">Mission Control</h1>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3">
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

**Pattern:**

- `sticky top-0 z-50`: Stays at top, high z-index
- Glassmorphism: `bg-white/80 backdrop-blur-xl`
- Fixed height: `h-16` (64px)
- Responsive padding

---

## FAQ Accordion

```tsx
const [openIndex, setOpenIndex] = useState<number | null>(null);

function FAQItem({ item, index }: { item: FAQItemType; index: number }) {
  return (
    <div className="group">
      <button
        onClick={() => setOpenIndex(openIndex === index ? null : index)}
        className="w-full flex items-center justify-between py-3 text-left hover:text-primary transition-colors"
      >
        <span className="font-medium text-sm pr-4">{item.question}</span>
        {openIndex === index ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      {openIndex === index && (
        <div className="pb-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

// Usage in two-column layout
<div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-0">
  <div className="divide-y divide-muted">
    {leftColumn.map((item, index) => (
      <FAQItem key={index} item={item} index={index} />
    ))}
  </div>
  <div className="divide-y divide-muted">
    {rightColumn.map((item, index) => (
      <FAQItem key={index + midpoint} item={item} index={index + midpoint} />
    ))}
  </div>
</div>;
```

**Pattern:**

- Button: Full width, left-aligned text, chevron on right
- `flex-shrink-0` on icon prevents squishing
- Conditional rendering for answer
- `divide-y` creates dividers between items

---

## Accessibility Considerations

### Touch Targets

✅ Minimum 44px × 44px for buttons/links:

```tsx
<Button size="lg" className="h-14">  {/* 56px height */}
<Button size="icon" className="h-12 w-12">  {/* 48px × 48px */}
```

### ARIA Labels

```tsx
<Button aria-label="Close menu">
  <X className="h-4 w-4" />
</Button>

<Input
  id="email"
  type="email"
  aria-describedby="email-helper"
/>
<p id="email-helper" className="text-xs text-slate-500">
  We'll never share your email.
</p>
```

### Keyboard Navigation

- All interactive elements must be focusable
- Use `tabIndex={0}` for custom interactive elements
- Provide visible focus states (Tailwind default: `focus-visible:ring-2`)

---

## Related Patterns

- [Glassmorphism](./glassmorphism.md) - Glass effects on components
- [Layout](./layout.md) - Component positioning and spacing
- [Typography](./typography.md) - Text within components
- [Colors & Gradients](./colors-gradients.md) - Component color usage
