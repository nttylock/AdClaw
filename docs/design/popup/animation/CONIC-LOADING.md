# Conic Gradient Loading Animation

Документация по премиальной анимации загрузки с вращающимся градиентом и сменой иконок.

## Визуальный результат

- Круглая область с вращающимся "хвостом" градиента (розовый → лавандовый → голубой)
- Мягкое свечение вокруг круга
- Иконки агентов сменяются с fade + scale эффектом
- Progress dots внизу показывают текущий этап

## Быстрое использование

```tsx
// Режимы: "transform" | "illustrations" | "humanize" | "translate"
<AIGenerationLoading />                      // transform (default)
<AIGenerationLoading mode="illustrations" />
<AIGenerationLoading mode="humanize" />
<AIGenerationLoading mode="translate" />
```

**Расположение компонента:** `app/dashboard/blog/new/page.tsx` (строки 737-870)

## Поддерживаемые режимы

| Mode            | Стадии                                                              | Использование         |
| --------------- | ------------------------------------------------------------------- | --------------------- |
| `transform`     | Analyzing → AI transformation → SEO → Polishing                     | Трансформация статьи  |
| `illustrations` | Analyzing → Generating prompts → Creating images → Inserting        | Генерация иллюстраций |
| `humanize`      | Detecting AI → Rewriting → Final polish                             | Humanize контента     |
| `translate`     | Analyzing source → Translating → Cultural adaptation → Final review | Перевод статьи        |

## Базовая структура

```tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type LoadingMode = "transform" | "illustrations" | "humanize" | "translate";

interface LoadingStage {
  icon: string;
  text: string;
}

const COLORS = {
  pink: "#F8B4D9",
  lavender: "#C4B5FD",
  blue: "#93C5FD",
};

// Оптимизированные иконки 160×160 в /public/popup/loading/
const STAGE_CONFIGS: Record<LoadingMode, LoadingStage[]> = {
  transform: [
    { icon: "/popup/loading/transform-1.webp", text: "Analyzing structure" },
    { icon: "/popup/loading/transform-2.webp", text: "AI transformation" },
    { icon: "/popup/loading/transform-3.webp", text: "SEO optimization" },
    { icon: "/popup/loading/transform-4.webp", text: "Polishing content" },
  ],
  illustrations: [
    { icon: "/popup/loading/illustrations-1.webp", text: "Analyzing content" },
    { icon: "/popup/loading/illustrations-2.webp", text: "Generating prompts" },
    { icon: "/popup/loading/illustrations-3.webp", text: "Creating images" },
    {
      icon: "/popup/loading/illustrations-4.webp",
      text: "Inserting into article",
    },
  ],
  humanize: [
    { icon: "/popup/loading/humanize-1.webp", text: "Detecting AI patterns" },
    { icon: "/popup/loading/humanize-2.webp", text: "Rewriting sentences" },
    { icon: "/popup/loading/humanize-3.webp", text: "Final polish" },
  ],
  translate: [
    { icon: "/popup/loading/translate-1.webp", text: "Analyzing source" },
    { icon: "/popup/loading/translate-2.webp", text: "Translating content" },
    { icon: "/popup/loading/translate-3.webp", text: "Cultural adaptation" },
    { icon: "/popup/loading/translate-4.webp", text: "Final review" },
  ],
};

interface AIGenerationLoadingProps {
  mode?: LoadingMode;
}

function AIGenerationLoading({ mode = "transform" }: AIGenerationLoadingProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const stages = STAGE_CONFIGS[mode];

  useEffect(() => {
    setStageIndex(0); // Reset on mode change
  }, [mode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % stages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stages.length]);

  const currentStage = stages[stageIndex];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main animation container */}
      <div className="relative h-36 w-36">
        {/* 1. Outer glow - размытый conic gradient */}
        <div className="absolute -inset-1 overflow-hidden rounded-full blur-md opacity-60">
          <div
            className="absolute inset-[-100%] h-[300%] w-[300%]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg 300deg, ${COLORS.pink} 320deg, ${COLORS.lavender} 340deg, ${COLORS.blue} 360deg)`,
              animation: "spin 2.5s linear infinite",
              transformOrigin: "center center",
            }}
          />
        </div>

        {/* 2. Sharp border - чёткий вращающийся градиент */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            className="absolute inset-[-100%] h-[300%] w-[300%]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg 300deg, ${COLORS.pink} 320deg, ${COLORS.lavender} 340deg, ${COLORS.blue} 360deg)`,
              animation: "spin 2.5s linear infinite",
              transformOrigin: "center center",
            }}
          />
        </div>

        {/* 3. Inner circle - белый круг с тонкой рамкой */}
        <div
          className="absolute inset-[3px] rounded-full bg-white"
          style={{ border: "0.3px solid #d1d5db" }}
        />

        {/* 4. Center icon - иконка в центре */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-20 w-20">
            {stages.map((stage, i) => (
              <Image
                key={stage.icon}
                src={stage.icon}
                alt={stage.text}
                fill
                className={`object-contain transition-all duration-500 ${
                  i === stageIndex
                    ? "scale-100 opacity-100"
                    : "scale-75 opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stage text */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-gray-700 transition-all duration-500">
          {currentStage.text}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2">
          {stages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stageIndex ? "w-6" : "w-1.5"
              }`}
              style={{
                background:
                  i === stageIndex
                    ? `linear-gradient(90deg, ${COLORS.pink}, ${COLORS.lavender}, ${COLORS.blue})`
                    : i < stageIndex
                      ? "#94a3b8"
                      : "#cbd5e1",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Оптимизация иконок

Иконки оптимизированы под фактический размер отображения (80×80 CSS = 160×160 для retina).

**Расположение:** `/public/popup/loading/`

| Файл                 | Источник              | Размер |
| -------------------- | --------------------- | ------ |
| transform-1.webp     | onboarding-step2-scan | 5.7 KB |
| transform-2.webp     | multiagent-writer     | 3.7 KB |
| transform-3.webp     | keyword-analysis      | 4.8 KB |
| transform-4.webp     | multiagent-publisher  | 3.7 KB |
| illustrations-1.webp | competitor-scout      | 4.0 KB |
| illustrations-2.webp | multiagent-writer     | 3.7 KB |
| illustrations-3.webp | ai-readiness-enhanced | 5.4 KB |
| illustrations-4.webp | multiagent-linker     | 4.4 KB |
| humanize-1.webp      | llm-visibility        | 3.8 KB |
| humanize-2.webp      | multiagent-writer     | 3.7 KB |
| humanize-3.webp      | multiagent-publisher  | 3.7 KB |
| translate-1.webp     | llm-visibility        | 3.8 KB |
| translate-2.webp     | multiagent-writer     | 3.7 KB |
| translate-3.webp     | ai-readiness-enhanced | 5.4 KB |
| translate-4.webp     | multiagent-publisher  | 3.7 KB |

**Было:** 37-80 KB (1024×1024) → **Стало:** 3.7-5.8 KB (160×160) = **~10x экономия**

### Как добавить новые иконки

```bash
# Ресайз PNG до 160×160, конвертация в webp
sips -z 160 160 source.png --out /tmp/icon.png
cwebp -q 85 /tmp/icon.png -o public/popup/loading/new-icon.webp
```

## Ключевые техники

### 1. Conic Gradient с "хвостом"

```css
conic-gradient(
  from 0deg,
  transparent 0deg 300deg,    /* 300° прозрачности */
  #F8B4D9 320deg,             /* розовый */
  #C4B5FD 340deg,             /* лавандовый */
  #93C5FD 360deg              /* голубой */
)
```

Градиент занимает только 60° (от 300° до 360°), остальное прозрачное — создаёт эффект "хвоста".

### 2. Overflow-hidden трюк для круга

```tsx
<div className="absolute inset-0 overflow-hidden rounded-full">
  <div
    className="absolute inset-[-100%] h-[300%] w-[300%]"
    style={{ animation: "spin 2.5s linear infinite" }}
  />
</div>
```

- Внешний div с `overflow-hidden rounded-full` обрезает градиент в круг
- Внутренний div 300%×300% позволяет градиенту вращаться вокруг центра
- `inset-[-100%]` центрирует увеличенный элемент

### 3. Двойной слой для свечения

| Слой         | Классы                        | Эффект          |
| ------------ | ----------------------------- | --------------- |
| Outer glow   | `-inset-1 blur-md opacity-60` | Мягкое свечение |
| Sharp border | `inset-0`                     | Чёткая граница  |

### 4. Плавная смена иконок

```tsx
className={`transition-all duration-500 ${
  i === stageIndex
    ? "scale-100 opacity-100"
    : "scale-75 opacity-0"
}`}
```

Все иконки рендерятся одновременно, но только активная видима. При смене — плавный fade + scale.

## Параметры для кастомизации

| Параметр       | Значение    | Описание                  |
| -------------- | ----------- | ------------------------- |
| `h-36 w-36`    | 144px       | Размер контейнера         |
| `h-20 w-20`    | 80px        | Размер иконки             |
| `inset-[3px]`  | 3px         | Толщина градиентной рамки |
| `2.5s`         | 2.5 секунды | Скорость вращения         |
| `3000`         | 3 секунды   | Интервал смены стадий     |
| `duration-500` | 500ms       | Длительность fade эффекта |

## Требования

- Tailwind CSS с классом `animate-spin` или CSS keyframes:
  ```css
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  ```
- Next.js Image компонент (или обычный `<img>`)
- Иконки в формате webp/png с прозрачным фоном

## Использование в проекте

Реальная имплементация: `app/dashboard/blog/new/page.tsx` (строки 737-856)

```tsx
// Использование в модале
<Card className="max-w-md w-full">
  <CardContent className="p-8">
    <div className="flex flex-col items-center space-y-6">
      <AIGenerationLoading />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Transforming...</h3>
        <p className="text-sm text-gray-600">Description text</p>
      </div>
    </div>
  </CardContent>
</Card>
```

## Цветовые схемы

### Текущая (пастельная)

```ts
{ pink: "#F8B4D9", lavender: "#C4B5FD", blue: "#93C5FD" }
```

### Альтернативы

```ts
// Синяя
{ start: "#60A5FA", mid: "#3B82F6", end: "#2563EB" }

// Зелёная
{ start: "#6EE7B7", mid: "#34D399", end: "#10B981" }

// Оранжевая
{ start: "#FCD34D", mid: "#FBBF24", end: "#F59E0B" }
```
