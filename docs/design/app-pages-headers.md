# Заголовки страниц приложения Citedy

Список всех страниц приложения с их URL-адресами, названиями и текстом заголовков в header'е.

✅ **Иконки сгенерированы и готовы к использованию!**

Изначально в каждом заголовке стояли Lucide React иконки. Теперь созданы уникальные качественные иконки, сгенерированные через Gemini AI.

//

# Обработать одну папку:

npx tsx scripts/process-agent-icons.ts stats

# Обработать несколько:

npx tsx scripts/process-agent-icons.ts ai-insights-icons writing-guidance-icons

# Обработать все известные:

npx tsx scripts/process-agent-icons.ts all

# Или указать путь:

npx tsx scripts/process-agent-icons.ts /path/to/folder
//

**📁 Расположение иконок:** `/public/new-icons/`

### 🏠 Главная и общие страницы

| URL               | Название страницы | Заголовок в header | Иконка                           |
| ----------------- | ----------------- | ------------------ | -------------------------------- |
| `/contact`        | Contact           | Contact Us         | `/new-icons/header-contact.webp` |
| `/privacy`        | Privacy Policy    | Privacy Policy     | `/new-icons/header-privacy.webp` |
| `/privacy-policy` | Privacy Policy    | Privacy Policy     | `/new-icons/header-privacy.webp` |
| `/terms`          | Terms of Use      | Terms of Use       | `/new-icons/header-terms.webp`   |

### 🎯 Dashboard

| URL                                   | Название страницы | Заголовок в header                | Иконка                                          |
| ------------------------------------- | ----------------- | --------------------------------- | ----------------------------------------------- |
| `/dashboard/new`                      | Add Competitors   | Welcome back, [Имя пользователя]! | `/new-icons/header-dashboard-welcome.webp`      |
| `/dashboard/blog`                     | Blog Management   | Blog Posts                        | `/new-icons/header-dashboard-blog.webp`         |
| `/dashboard/blog/new`                 | Create Article    | Writer Agent                      | `/new-icons/header-dashboard-writer.webp`       |
| `/dashboard/blog/new/demo`            | Demo Article      | Approved Design Improvements      | `/new-icons/header-dashboard-design.webp`       |
| `/dashboard/blog/[articleId]`         | Article Editor    | $1                                | `/new-icons/header-dashboard-editor.webp`       |
| `/dashboard/ai-insights`              | AI Insights       | AI Visibility Dashboard           | `/new-icons/header-dashboard-ai-insights.webp`  |
| `/dashboard/ai-insights/ai-readiness` | AI Readiness      | AI Readiness Analysis             | `/new-icons/header-dashboard-ai-readiness.webp` |
| `/dashboard/autopilot`                | Autopilot         | Autopilot Agents                  | `/new-icons/header-dashboard-autopilot.webp`    |
| `/dashboard/billing`                  | Billing           | Billing & Subscription            | `/new-icons/header-dashboard-billing.webp`      |
| `/dashboard/exports`                  | Exports           | Export Jobs                       | `/new-icons/header-dashboard-exports.webp`      |
| `/dashboard/insights`                 | Insights          | AI Visibility Dashboard           | `/new-icons/header-dashboard-ai-insights.webp`  |
| `/dashboard/settings`                 | Settings          | Settings                          | `/new-icons/header-dashboard-settings.webp`     |

### 🚀 Онбординг

| URL              | Название страницы | Заголовок в header    | Иконка                              |
| ---------------- | ----------------- | --------------------- | ----------------------------------- |
| `/onboarding-v2` | Onboarding v2     | Welcome to Citedy | `/new-icons/header-onboarding.webp` |

## 📈 Рекомендации по улучшению

### 1. **Консистентность**

- Некоторые страницы имеют неинформативные заголовки
- Рекомендуется стандартизировать формат

### 2. **SEO оптимизация**

- Добавить meta titles для всех страниц
- Убедиться в уникальности заголовков

### 3. **Доступность**

- Все заголовки должны быть semantic (h1-h6)
- Проверить screen reader совместимость

### 4. **Локализация**

- Подготовить инфраструктуру для многоязычности
- Использовать i18n для статических заголовков

## 🛠 Техническая информация

### Структура данных

```typescript
interface PageHeader {
  url: string; // URL путь страницы
  title: string; // Название для навигации
  headerText: string; // Текст в <h1> элементе
  dynamic?: boolean; // Содержит ли переменные
  category: string; // Категория страницы
}
```

### Методы извлечения

- Автоматический парсинг JSX компонентов
- Поиск `<h1>` элементов
- Анализ title атрибутов
- Ручная верификация для точности

---

## 🎨 **Иконки заголовков**

**Статус:** ✅ **Завершено и интегрировано**

- **15 уникальных иконок** сгенерировано через Gemini AI
- **Прозрачные PNG** с автоматически удаленным фоном
- **Оптимизированные WebP** с 50.6% сжатием (462.9 KB экономии)
- **Расположение:** `/public/new-icons/` (PNG + WebP)
- **Обновлено:** Иконка онбординга (ракета вместо компаса), иконка terms (щит вместо свитка)

---

## 🎯 **Спецификации дизайна заголовков (v6)**

**Демо страница:** `/demo` — все варианты заголовков

### Стандартный заголовок (Standard Header)

Используется на: `/contact`, `/privacy`, `/privacy-policy`, dashboard pages

```tsx
<div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/90 shadow-sm mb-6">
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
  <div className="relative z-10 flex items-center min-h-[100px] sm:min-h-[110px] md:min-h-[120px]">
    <div className="py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-8 ml-[80px] sm:ml-[85px] md:ml-[80px]">
      <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gradient-genius">
        Page Title
      </h1>
      <p className="text-muted-foreground text-sm">Page description</p>
    </div>
  </div>
</div>
```

**Ключевые параметры:**
| Параметр | Mobile | sm | md |
|----------|--------|-----|-----|
| Icon size | 126px | 139px | 151px |
| Icon left | -13px | -20px | -27px |
| Text margin-left | 80px | 85px | 80px |
| Container min-height | 100px | 110px | 120px |
| Icon vertical | `top-1/2 -translate-y-[45%]` |||

### Navbar-style Header (Compact)

Используется на: `/onboarding-v2` (sticky navbar)

```tsx
<div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl overflow-hidden h-16">
  <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-[72px] w-[72px]">
    <Image
      src="/new-icons/header-onboarding.webp"
      alt=""
      fill
      className="object-contain"
    />
  </div>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent via-[12%] to-white/95 to-[30%]" />
  <div className="relative z-10 h-full flex items-center">
    <div className="ml-[51px] sm:ml-[55px] md:ml-[59px]">
      <h1 className="text-sm font-semibold text-slate-900">
        Welcome to Citedy
      </h1>
      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
        Phase 1: Reconnaissance
      </p>
    </div>
  </div>
</div>
```

**Параметры:**

- Height: `h-16` (64px)
- Icon: `72x72px`, offset `-left-3`
- Text margin: `ml-[51px] sm:ml-[55px] md:ml-[59px]`

### Onboarding Header (Taller)

Для страниц онбординга с большими иконками:

```tsx
<div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/90 shadow-sm">
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-100/50 via-transparent to-purple-100/50 opacity-70" />
  <div className="absolute -left-7 sm:-left-9 md:-left-11 top-1/2 -translate-y-[45%] h-[162px] sm:h-[180px] md:h-[198px] w-[162px] sm:w-[180px] md:w-[198px]">
    <Image
      src="/new-icons/header-onboarding.webp"
      alt=""
      fill
      className="object-contain"
    />
  </div>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent via-[15%] to-white/95 to-[35%]" />
  <div className="relative z-10 flex items-center min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
    <div className="py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-8 ml-[130px] sm:ml-[145px] md:ml-[160px]">
      <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gradient-genius">
        Welcome to Citedy
      </h1>
      <p className="text-muted-foreground text-sm">
        Set up your AI-powered content strategy
      </p>
    </div>
  </div>
</div>
```

**Параметры:**
| Параметр | Mobile | sm | md |
|----------|--------|-----|-----|
| Icon size | 162px | 180px | 198px |
| Icon left | -7 (28px) | -9 (36px) | -11 (44px) |
| Text margin-left | 130px | 145px | 160px |
| Container min-height | 120px | 140px | 160px |

### Special Case: Terms Page

Иконка `/terms` визуально крупнее других — применяется дополнительное уменьшение на 10% (итого -20%):

```tsx
<div className="absolute -left-[11px] sm:-left-[18px] md:-left-[24px] top-1/2 -translate-y-[45%] h-[113px] sm:h-[125px] md:h-[136px] w-[113px] sm:w-[125px] md:w-[136px]">
```

**Параметры Terms:**
| Параметр | Mobile | sm | md |
|----------|--------|-----|-----|
| Icon size | 113px | 125px | 136px |
| Icon left | -11px | -18px | -24px |
| Text margin-left | 75px | 80px | 75px |

---

## 📐 **Общие правила**

1. **NO hover effects** — заголовки статичные
2. **Icon vertical centering:** `top-1/2 -translate-y-[45%]` (центрируется к тексту, не к контейнеру)
3. **Description font:** всегда `text-sm` (не responsive)
4. **Title gradient:** класс `text-gradient-genius`
5. **Container:** `overflow-hidden` для обрезки краёв иконки

---

_Последнее обновление: 26 декабря 2025_
_Версия дизайна: v6 (icon vertical centering fix)_
_Всего проанализировано: 15 страниц с заголовками_
_Иконки сгенерированы: 15 уникальных (Gemini AI + background removal)_
_Форматы: PNG (прозрачные) + WebP (50.6% сжатие)_
_Демо страница: `/demo`_
