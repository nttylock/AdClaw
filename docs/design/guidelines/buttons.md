# Buttons - Citedy Design System

> **КРИТИЧЕСКИ ВАЖНО**: Все кнопки в Citedy используют **pill-стиль** (rounded-full).
> **НЕ ИСПОЛЬЗОВАТЬ**: rounded-xl, rounded-2xl, rounded-lg для кнопок.

## Основной компонент

```tsx
import { Button } from "@/components/ui/button-citedy-style";
```

**НЕ ИСПОЛЬЗОВАТЬ**: `@/components/ui/button` — только `button-citedy-style`.

---

## Стандартный стиль кнопки (Default)

![Citedy Button](./images/citedy-button.png)

```tsx
<Button size="lg">
  Dominate AI Visibility
  <ArrowRight className="h-4 w-4" />
</Button>
```

**Визуальные характеристики:**

- Цвет фона: `bg-slate-900` (тёмный)
- Цвет текста: `text-white`
- Форма: **`rounded-full`** (pill)
- Hover: `hover:bg-slate-800`
- Тень: `shadow-sm`

**CSS классы варианта default:**

```css
bg-slate-900 text-white hover:bg-slate-800 shadow-sm rounded-full px-5 py-2.5
```

---

## Варианты кнопок

### 1. Default (Primary) — ОСНОВНОЙ

```tsx
<Button variant="default" size="lg">
  Get Started
</Button>
```

- **Использование**: Главные CTA, важные действия
- **Стиль**: Тёмная pill-кнопка
- **Цвет**: slate-900 → slate-800 (hover)

---

### 2. Secondary

```tsx
<Button variant="secondary" size="lg">
  Learn More
</Button>
```

- **Использование**: Вторичные действия
- **Стиль**: Светлая pill-кнопка
- **Цвет**: slate-100 → slate-200 (hover)

**CSS:**

```css
bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-full
```

---

### 3. Outline

```tsx
<Button variant="outline" size="lg">
  Cancel
</Button>
```

- **Использование**: Альтернативные действия, текущий план
- **Стиль**: Прозрачная с бордером
- **Цвет**: border-slate-300, text-slate-700

**CSS:**

```css
border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-full
```

---

### 4. Ghost

```tsx
<Button variant="ghost" size="sm">
  Exit
</Button>
```

- **Использование**: Минимальные действия, навигация
- **Стиль**: Прозрачная без бордера
- **Цвет**: text-slate-500 → text-slate-900 (hover)

**CSS:**

```css
text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full
```

---

### 5. Destructive

```tsx
<Button variant="destructive" size="lg">
  Delete
</Button>
```

- **Использование**: Удаление, опасные действия
- **Стиль**: Красная pill-кнопка
- **Цвет**: red-600 → red-700 (hover)

**CSS:**

```css
bg-red-600 text-white hover:bg-red-700 shadow-sm rounded-full
```

---

### 6. Glassmorphism

```tsx
<Button variant="glassmorphism" size="lg">
  Overlay Action
</Button>
```

- **Использование**: Кнопки поверх изображений/градиентов
- **Стиль**: Стеклянная pill-кнопка
- **Эффект**: backdrop-blur + белый фон 70%

**CSS:**

```css
backdrop-blur-md bg-white/70 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:bg-white/80 rounded-full
```

---

## Размеры (Sizes)

| Size      | Height  | Padding     | Use Case           |
| --------- | ------- | ----------- | ------------------ |
| `sm`      | 40px    | px-4 py-2   | Компактные кнопки  |
| `default` | 44px    | px-5 py-2.5 | Стандартные кнопки |
| `lg`      | 48px    | px-6 py-3   | Важные CTA         |
| `icon`    | 40x40px | -           | Иконочные кнопки   |

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Menu /></Button>
```

---

## Кнопки с иконками

### Иконка справа (стандарт)

```tsx
<Button size="lg" className="gap-2">
  Get Started
  <ArrowRight className="h-4 w-4" />
</Button>
```

### Иконка слева

```tsx
<Button size="lg" className="gap-2">
  <Plus className="h-4 w-4" />
  Add New
</Button>
```

### Только иконка

```tsx
<Button size="icon" variant="ghost">
  <Menu className="h-5 w-5" />
</Button>
```

---

## Состояния

### Loading

```tsx
<Button disabled>
  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  Processing...
</Button>
```

### Disabled

```tsx
<Button disabled>Cannot Click</Button>
```

Автоматически применяется:

- `disabled:pointer-events-none`
- `disabled:opacity-50`

---

## Полноширинные кнопки

```tsx
<Button size="lg" className="w-full">
  Submit Form
</Button>
```

---

## ЗАПРЕЩЕНО

### НЕ делать:

```tsx
// ❌ НЕПРАВИЛЬНО - кастомное скругление
<Button className="rounded-xl">Wrong</Button>

// ❌ НЕПРАВИЛЬНО - прямой импорт button.tsx
import { Button } from "@/components/ui/button";

// ❌ НЕПРАВИЛЬНО - нативный button с кастомными стилями
<button className="bg-blue-500 rounded-lg">Wrong</button>

// ❌ НЕПРАВИЛЬНО - inline стили для кнопок
<Button style={{ borderRadius: '12px' }}>Wrong</Button>
```

### ПРАВИЛЬНО:

```tsx
// ✅ ПРАВИЛЬНО - импорт из citedy-style
import { Button } from "@/components/ui/button-citedy-style";

// ✅ ПРАВИЛЬНО - использование вариантов
<Button variant="default" size="lg">Correct</Button>

// ✅ ПРАВИЛЬНО - добавление w-full, gap-2
<Button size="lg" className="w-full gap-2">
  Correct <ArrowRight className="h-4 w-4" />
</Button>
```

---

## Примеры использования

### Hero CTA

```tsx
<Button size="lg" className="gap-2">
  Start Free Trial
  <ArrowRight className="h-4 w-4" />
</Button>
```

### Pricing Card

```tsx
<Button
  variant={isCurrentPlan ? "outline" : "default"}
  size="lg"
  className="w-full"
>
  {isCurrentPlan ? "Current Plan" : "Upgrade Now"}
</Button>
```

### Form Submit

```tsx
<Button type="submit" size="lg" className="w-full" disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Saving...
    </>
  ) : (
    "Save Changes"
  )}
</Button>
```

### Navigation

```tsx
<Button variant="ghost" size="sm">
  <X className="h-4 w-4 mr-2" />
  Exit
</Button>
```

---

## Accessibility

- Минимальный touch target: 44px × 44px
- Все кнопки фокусируемые: `focus-visible:ring-2`
- Используй `aria-label` для icon-only кнопок:

```tsx
<Button size="icon" aria-label="Close menu">
  <X className="h-4 w-4" />
</Button>
```

---

## Файл компонента

Путь: `components/ui/button-citedy-style.tsx`

Все варианты определены через `class-variance-authority` (CVA).
