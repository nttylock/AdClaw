# Dashboard Cards Design Pattern

> Типовые карточки для дашборда с glassmorphism эффектом, декоративными иконками и без тени.

## Overview

Стандартный паттерн для контентных карточек дашборда. Используется в Quick Actions, Distribution, Active Campaigns и других блоках `/dashboard/new`.

---

## Core Pattern

### Base Class (cardBase)

```tsx
const cardBase =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";
```

**Breakdown:**

| Класс                                                           | Значение                                 |
| --------------------------------------------------------------- | ---------------------------------------- |
| `relative`                                                      | Для позиционирования декоративной иконки |
| `overflow-hidden`                                               | Скрывает выступающие части иконки        |
| `rounded-2xl`                                                   | 16px скругление углов                    |
| `bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80` | Диагональный градиент (полупрозрачный)   |
| `backdrop-blur-sm`                                              | Легкое размытие фона (4px)               |
| `border border-slate-200/40`                                    | Тонкая полупрозрачная граница            |

### Визуальные характеристики

- **Тень**: Отсутствует (без `shadow-*`)
- **Фон**: Полупрозрачный градиент от slate-50 к gray-50
- **Эффект**: Легкий glassmorphism с backdrop-blur
- **Граница**: Очень тонкая, 40% opacity

---

## Structure

```
┌─────────────────────────────────────────────────────┐
│  [Icon] Card Title                                  │
│  ─────────────────────                              │
│                                                     │
│  Card Content                          [Decorative  │
│  - Item 1                                  Icon]    │
│  - Item 2                               (большая,   │
│  - Item 3                               ~3% opacity)│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Complete Example

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

const cardBase =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";

export function QuickActionsCard() {
  return (
    <Card className={cardBase}>
      {/* Decorative background icon */}
      <Zap className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-orange-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Zap className="h-4 w-4 text-orange-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">{/* Card content */}</CardContent>
    </Card>
  );
}
```

---

## Decorative Icon

Большая полупрозрачная иконка в правом нижнем углу:

```tsx
<IconComponent className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-{color}-500/[0.03]" />
```

**Параметры:**

| Параметр                      | Значение   | Описание                     |
| ----------------------------- | ---------- | ---------------------------- |
| `pointer-events-none`         | —          | Не перехватывает клики       |
| `absolute -bottom-4 -right-4` | —          | Выступает за границы на 16px |
| `h-32 w-32`                   | 128px      | Размер иконки                |
| `text-{color}-500/[0.03]`     | 3% opacity | Едва видимый цвет            |

### Color Palette

| Card Type        | Icon       | Color                     |
| ---------------- | ---------- | ------------------------- |
| Active Campaigns | `Swords`   | `text-rose-500/[0.03]`    |
| Quick Actions    | `Zap`      | `text-orange-500/[0.03]`  |
| Distribution     | `Share2`   | `text-indigo-500/[0.03]`  |
| Your Position    | `Target`   | `text-blue-500/[0.03]`    |
| Content Status   | `FileText` | `text-emerald-500/[0.03]` |

---

## Card Header Pattern

```tsx
<CardHeader className="pb-2">
  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
    <IconComponent className="h-4 w-4 text-{color}-600" />
    Card Title
  </CardTitle>
</CardHeader>
```

**Key styles:**

- `pb-2` — уменьшенный padding снизу
- `text-sm font-semibold` — 14px, полужирный
- `text-slate-600` — приглушенный цвет заголовка
- Icon: `h-4 w-4` (16px), яркий цвет (`text-{color}-600`)

---

## Variants

### 1. Standard Card (без тени)

```tsx
const cardBase =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";
```

**Используется для:** Quick Actions, Distribution, Active Campaigns, Content Status

### Важно: НЕ добавляй тени!

На дашборде `/dashboard/new` карточки **ПЛОСКИЕ** — без `shadow-*` классов.

```tsx
// ✅ ПРАВИЛЬНО — без тени
<Card className={cardBase}>

// ❌ НЕПРАВИЛЬНО — огромная floating тень
<Card className={`${cardBase} shadow-[0_8px_32px_rgba(0,0,0,0.08)]`}>
```

Тени создают "летающий" эффект который не соответствует дизайну дашборда.

---

## Content Patterns

### Action Item

```tsx
<Link
  href="/path"
  className="group block rounded-lg border border-slate-100 bg-white/70 p-3 transition hover:border-slate-200 hover:bg-white"
>
  <div className="flex items-center justify-between gap-3">
    <div>
      <p className="text-sm font-semibold text-slate-900">Action Title</p>
      <p className="text-xs text-muted-foreground">Description text.</p>
    </div>
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 group-hover:border-slate-300 group-hover:text-slate-900">
      <Icon className="h-4 w-4" />
    </div>
  </div>
</Link>
```

### Info Row

```tsx
<div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
  <div className="flex items-center gap-2 text-sm">
    <Icon className="h-4 w-4 text-emerald-600" />
    <span>Label</span>
  </div>
  <Button size="icon" variant="ghost">
    <Copy className="h-4 w-4" />
  </Button>
</div>
```

---

## Grid Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="space-y-6">
    {/* Column 1: Your Position, Content Status */}
  </div>
  <div className="space-y-6">
    {/* Column 2: Active Campaigns, AI Readiness */}
  </div>
  <div className="space-y-6">{/* Column 3: Quick Actions, Distribution */}</div>
</div>
```

---

## Full-Width Page Layout

> **КРИТИЧЕСКИ ВАЖНО**: Контент дашборда должен занимать ВСЮ доступную ширину справа от сайдбара. НЕ ограничивай ширину!

### Архитектура Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│                        flex min-h-screen w-full                       │
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                          │
│  Sidebar   │              main (flex-1 w-full)                        │
│            │                                                          │
│  (fixed    │   ┌──────────────────────────────────────────────────┐  │
│   width)   │   │     Page Content (p-4 sm:p-6 lg:p-8)             │  │
│            │   │                                                   │  │
│            │   │     ← КОНТЕНТ НА ВСЮ ШИРИНУ, БЕЗ max-w! →        │  │
│            │   │                                                   │  │
│            │   └──────────────────────────────────────────────────┘  │
│            │                                                          │
└────────────┴─────────────────────────────────────────────────────────┘
```

### Dashboard Layout (`app/dashboard/layout.tsx`)

```tsx
<div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
  <BlogSidebarWrapper />
  <main className="flex-1 w-full overflow-auto overflow-x-hidden">
    {children}
  </main>
</div>
```

### Правильный Page Wrapper

```tsx
// ✅ ПРАВИЛЬНО — контент на всю ширину
export default function DashboardPage() {
  return (
    <div className="relative flex-1 p-4 sm:p-6 lg:p-8">
      {/* Декоративные элементы (абсолютное позиционирование) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        {/* ... другие orbs ... */}
      </div>

      {/* Контент — БЕЗ max-w, БЕЗ container, БЕЗ mx-auto */}
      <div className="relative space-y-6">
        {/* Карточки занимают всю ширину */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{/* ... */}</div>
      </div>
    </div>
  );
}
```

### Что НЕЛЬЗЯ делать

```tsx
// ❌ НЕПРАВИЛЬНО — ограничивает ширину
<div className="max-w-7xl mx-auto">
  {/* контент будет узким */}
</div>

// ❌ НЕПРАВИЛЬНО — container добавляет max-width
<div className="container mx-auto">
  {/* контент будет узким */}
</div>

// ❌ НЕПРАВИЛЬНО — произвольное ограничение
<div className="max-w-5xl">
  {/* контент будет узким */}
</div>

// ❌ НЕПРАВИЛЬНО — центрирование без причины
<div className="w-[800px] mx-auto">
  {/* фиксированная ширина = плохо */}
</div>
```

### Когда max-width допустим

| Контекст                        | Допустимо | Пример                     |
| ------------------------------- | --------- | -------------------------- |
| Модальные окна                  | ✅        | `max-w-3xl` для диалогов   |
| Текстовые блоки внутри карточки | ✅        | `max-w-xl` для description |
| Truncate элементы               | ✅        | `max-w-[70%] truncate`     |
| **Page-level контейнер**        | ❌        | **НИКОГДА**                |
| **Grid контейнер**              | ❌        | **НИКОГДА**                |

### Референс: `/dashboard/new/page.tsx`

```tsx
// Строки 1380-1398 — правильный full-width паттерн
return (
  <div className="relative flex-1 p-4 sm:p-6 lg:p-8">
    {/* Background orbs */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      ...
    </div>

    {/* Content — NO max-width! */}
    <div className="relative space-y-6">
      {/* Hero cards, grid с карточками — всё на полную ширину */}
    </div>
  </div>
);
```

---

## Do's and Don'ts

### Do's

- Используй `cardBase` для единообразия
- Добавляй декоративную иконку с 3% opacity
- Header icon должна быть яркой (`text-{color}-600`)
- Используй `overflow-hidden` для скрытия выступающей иконки
- Группируй карточки в колонки с `space-y-6`

### Don'ts

- Не добавляй тень к обычным карточкам (только для Elevated)
- Не делай декоративную иконку ярче 3% opacity
- Не используй `rounded-3xl` (только `rounded-2xl`)
- Не изменяй градиент — он создает единый визуальный стиль
- Не убирай `backdrop-blur-sm` — это часть glassmorphism эффекта
- **НЕ ОГРАНИЧИВАЙ ШИРИНУ** страницы через `max-w-*`, `container`, `mx-auto`
- **НЕ ЦЕНТРИРУЙ** контейнер карточек — они должны занимать всю ширину

---

## Reference Components

| Component        | File                              | Pattern       |
| ---------------- | --------------------------------- | ------------- |
| Quick Actions    | `app/dashboard/new/page.tsx:2358` | Standard card |
| Distribution     | `app/dashboard/new/page.tsx:2428` | Standard card |
| Active Campaigns | `app/dashboard/new/page.tsx:2028` | Standard card |
| Your Position    | `app/dashboard/new/page.tsx:1516` | Elevated card |

---

## Related Patterns

- [Glassmorphism](./glassmorphism.md) — Общий паттерн glassmorphism
- [Feature Cards](./feature-cards.md) — Карточки с изображениями
- [Components](./components.md) — Базовые UI компоненты

---

_Last updated: January 4, 2026_
