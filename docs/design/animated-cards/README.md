# Animated Card Wrapper

Компонент для добавления анимированных эффектов загрузки вокруг карточек.

## Демо

```
/demo/card-loading-animations
```

## Использование

```tsx
import { AnimatedCardWrapper } from "@/components/ui/animated-card-wrapper";

<AnimatedCardWrapper variant="conic" isAnimating={isLoading}>
  <YourCard />
</AnimatedCardWrapper>;
```

## Варианты анимации

| Вариант | Описание                                             | Рекомендуется для                             |
| ------- | ---------------------------------------------------- | --------------------------------------------- |
| `pulse` | Градиент двигается влево-вправо с пульсацией opacity | Короткие операции (1-3 сек)                   |
| `conic` | **Вращающийся конический градиент**                  | **Анализ данных, Counter Strike, SEO checks** |
| `glow`  | Многослойное свечение с разными скоростями           | Премиум/выделенные элементы                   |

## Рекомендация

**Для состояния загрузки карточки (анализ, обновление данных) используй `conic`** — он создаёт эффект "сканирования", который хорошо передаёт процесс анализа.

## Props

| Prop           | Тип                            | По умолчанию   | Описание                         |
| -------------- | ------------------------------ | -------------- | -------------------------------- |
| `variant`      | `"pulse" \| "conic" \| "glow"` | —              | Тип анимации                     |
| `isAnimating`  | `boolean`                      | —              | Активна ли анимация              |
| `className`    | `string`                       | —              | Дополнительные классы            |
| `borderRadius` | `string`                       | `"rounded-xl"` | Tailwind класс для border-radius |

## Цветовая палитра

Мягкие пастельные цвета:

```tsx
const COLORS = {
  pink: "#F5D0DC", // Soft pink/peach
  lavender: "#E8D5F0", // Soft lavender
  blue: "#D5E0F5", // Soft blue
};
```

## Файлы

- **Компонент**: `/components/ui/animated-card-wrapper.tsx`
- **CSS анимации**: `/app/globals.css` (keyframes)
- **Tailwind config**: `/tailwind.config.js` (animation utilities)
- **Демо страница**: `/app/demo/card-loading-animations/page.tsx`

---

## Где применять анимацию

### 1. CompetitorsList (AI Insights)

**Файл**: `components/ai-insights/CompetitorsList.tsx`

**Когда**: При любой проверке конкурента:

- `refreshingId` — LLM Recognition check
- `organicCheckingId` — Organic traffic check
- `seoCheckingId` — SEO metrics check
- `fullCheckLoadingId` — Full check
- `counterStrikeId` — Counter Strike analysis

**Как**: Обернуть `CompetitorCard` в `AnimatedCardWrapper`:

```tsx
<AnimatedCardWrapper
  variant="conic"
  isAnimating={
    refreshingId === competitor.id ||
    organicCheckingId === competitor.id ||
    seoCheckingId === competitor.id ||
    fullCheckLoadingId === competitor.id ||
    counterStrikeId === competitor.id
  }
>
  <CompetitorCard ... />
</AnimatedCardWrapper>
```

### 2. ProductsSidebar (AI Insights)

**Файл**: `components/ai-insights/ProductsSidebar.tsx`

**Когда**: При проверке продукта:

- `refreshingId` — LLM Recognition check
- `organicCheckingId` — Organic traffic check
- `seoCheckingId` — SEO metrics check

### 3. CompetitorsSection (Settings)

**Файл**: `app/dashboard/settings/components/CompetitorsSection.tsx`

**Когда**:

- `counterStrikeId` — Counter Strike analysis
- `organicCheckingId` — Organic check
- `seoCheckingId` — SEO check
- `fullCheckLoadingId` — Full check

---

## Интеграция (пример)

В `CompetitorsList.tsx` найти рендер карточки и обернуть:

```tsx
// До
<CompetitorCard
  competitor={competitor}
  isLoading={getLoadingType(competitor.id) !== null}
  ...
/>

// После
<AnimatedCardWrapper
  variant="conic"
  isAnimating={getLoadingType(competitor.id) !== null || counterStrikeId === competitor.id}
  borderRadius="rounded-xl"
>
  <CompetitorCard
    competitor={competitor}
    isLoading={getLoadingType(competitor.id) !== null}
    ...
  />
</AnimatedCardWrapper>
```

## Примечания

- Анимация автоматически отключается когда `isAnimating={false}`
- Внутренняя карточка должна иметь `bg-white` или другой solid background
- Для `conic` варианта wrapper добавляет `bg-white` к children автоматически
