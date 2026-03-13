# AdClaw Admin UI — Аудит расхождений с Citedy Design System

> **Дата**: 2026-03-11 (обновлено 2026-03-13)
> **Статус**: ✅ Реализовано (Phase 1-4 complete, 38 файлов, +477/-367 строк)
> **Приоритет расхождений**: 🔴 Критичный | 🟡 Средний | 🟢 Низкий

---

## Сводка

| Область | Текущее состояние | Citedy стандарт | Расхождение |
|---------|------------------|-----------------|-------------|
| Glassmorphism | **Нет** | Везде | 🔴 |
| Кнопки | Ant Design (rounded-8px) | Pill rounded-full | 🔴 |
| Карточки | Плоские, белые, shadow-sm | Glassmorphism gradient cardBase | 🔴 |
| Цвета | #615ced (purple) + Ant | Slate scale + Blue/Indigo | 🟡 |
| Навигация | Ant Design Menu | Dark Pill tabs | 🔴 |
| Типографика | System + Ant Design | Slate scale + font-bold headings | 🟡 |
| Модалы/Drawer | Ant Design Modal flat | Glassmorphism rounded-3xl | 🔴 |
| Фоны | Белый/серый сплошной | Gradient + decorative blurred shapes | 🔴 |
| Dashboard cards | Карточки без эффектов | cardBase + decorative icons 3% opacity | 🔴 |
| Badge | Ant Design Tag | Glassmorphism badge + whitespace-nowrap | 🟡 |
| Two-tone headings | Нет | gradient text emphasis | 🟢 |
| Анимации | transition 0.2s basic | Underglow, conic loading, AI glow | 🟡 |

**Итого: 7 критичных, 4 средних, 1 низкий**

---

## 🔴 1. Glassmorphism — ПОЛНОЕ ОТСУТСТВИЕ

### Текущее (AdClaw)
```css
/* Карточки */
background: #fff;
border: 1px solid rgba(0,0,0,0.04);
box-shadow: 0 4px 12px rgba(0,0,0,0.04);
border-radius: 12px;
```

### Требуется (Citedy)
```css
/* Стандартная glassmorphism карточка */
backdrop-blur-md bg-white/70
border border-white/20
shadow-[0_8px_32px_rgba(0,0,0,0.04)]
rounded-2xl
```

### Что делать
1. **Каждую карточку** заменить на glassmorphism variant
2. Добавить `backdrop-filter: blur(12px)` + `background: rgba(255,255,255,0.7)`
3. Заменить solid border на `border: 1px solid rgba(255,255,255,0.2)`
4. Добавить gradient фоны страницам (иначе blur не виден)

### Файлы для изменения
- `console/src/pages/Agent/Skills/index.module.less` — skillCard
- `console/src/pages/Agent/MCP/index.module.less` — mcpCard
- `console/src/pages/Personas/index.module.less` — personaCard
- `console/src/pages/Control/Channels/index.module.less` — channelCard
- `console/src/pages/Settings/Models/index.module.less` — providerCard
- Все остальные `*Card` компоненты

---

## 🔴 2. Кнопки — НЕПРАВИЛЬНАЯ ФОРМА

### Текущее (AdClaw)
```css
/* Ant Design Button */
border-radius: 8px; /* или 6px */
background: #615ced;
```

### Требуется (Citedy)
```css
/* Pill-стиль — ЕДИНСТВЕННЫЙ ДОПУСТИМЫЙ */
border-radius: 9999px; /* rounded-full */
```

**Варианты кнопок:**

| Variant | Текущее | Требуется |
|---------|---------|-----------|
| Primary | `bg-#615ced rounded-8px` | `bg-slate-900 rounded-full` |
| Secondary | `bg-white border-#d9d9d9` | `bg-slate-100 text-slate-900 rounded-full` |
| Danger | `bg-#ff4d4f` | `bg-red-600 rounded-full` |
| Ghost | `bg-transparent` | `text-slate-500 hover:bg-slate-100 rounded-full` |
| Icon | `padding: 0` | `h-10 w-10 rounded-full` |

### Что делать
1. Создать компонент `ButtonCitedy` с pill-стилем через Ant Design ConfigProvider или custom CSS override
2. Глобально перезаписать `border-radius` для `.ant-btn` → `border-radius: 9999px`
3. Заменить primary цвет `#615ced` → `slate-900` (#0f172a)
4. Добавить размеры: sm (40px), default (44px), lg (48px)

### Файлы для изменения
- Глобальный override в `console/src/styles/` — новый файл `button-override.css`
- Или ConfigProvider theme в `console/src/App.tsx`

---

## 🔴 3. Карточки Dashboard — НЕТ ПАТТЕРНА cardBase

### Текущее (AdClaw)
```css
.skillCard, .channelCard, .providerCard {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

/* Enabled state */
border: 2px solid #615ced;
box-shadow: rgba(97,92,237,0.2) 0px 8px 24px;
```

### Требуется (Citedy)
```css
/* cardBase — стандарт для ВСЕХ карточек */
.cardBase {
  position: relative;
  overflow: hidden;
  border-radius: 16px; /* rounded-2xl */
  background: linear-gradient(to bottom right,
    rgba(248,250,252,0.8),  /* slate-50/80 */
    rgba(255,255,255,0.6),  /* white/60 */
    rgba(249,250,251,0.8)); /* gray-50/80 */
  backdrop-filter: blur(4px);
  border: 1px solid rgba(226,232,240,0.4); /* slate-200/40 */
  /* БЕЗ тени! */
}
```

### Декоративная иконка (3% opacity)
```tsx
<IconComponent className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-{color}-500/[0.03]" />
```

### Что делать
1. Создать общий стиль `cardBase` в LESS
2. Добавить декоративные иконки (128px, 3% opacity) в правый нижний угол каждой карточки
3. **Убрать тени** с обычных карточек (dashboard = flat)
4. Enabled state: менять border-color, но не добавлять heavy shadow

---

## 🔴 4. Навигация/Sidebar — УСТАРЕВШИЙ СТИЛЬ

### Текущее (AdClaw)
```
Sidebar: 260px, bg-white, Ant Design Menu
Menu items: color #666, selected: color #615ced + bg #f5f3ff
```

### Требуется (Citedy)
```
Primary: Dark Pill tabs (data-[state=active]:bg-slate-900 text-white rounded-full)
Secondary: Gray Pill (bg-slate-100 container, active: bg-white rounded-full)
```

### Что делать
1. Sidebar menu items: заменить на pill-стиль
   - Active: `bg-slate-900 text-white rounded-full shadow-sm`
   - Inactive: `text-slate-500 rounded-full`
   - Hover: `bg-slate-100 text-slate-900`
2. Добавить иконки к каждому пункту меню (h-4 w-4, gap-2)
3. Перезаписать Ant Design Menu styles через CSS override

### Файлы для изменения
- `console/src/layouts/Sidebar.tsx`

---

## 🔴 5. Модалы/Dialogs — ПЛОСКИЕ

### Текущее (AdClaw)
```css
/* Ant Design Modal */
border-radius: 8px;
background: white;
box-shadow: 0 3px 6px rgba(0,0,0,0.15);
```

### Требуется (Citedy)
```css
/* Glassmorphism Modal */
border-radius: 24px; /* rounded-3xl */
background: linear-gradient(to bottom right,
  rgba(255,255,255,0.95),
  rgba(248,250,252,0.9),
  rgba(249,250,251,0.95));
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,0.5);
box-shadow: 0 8px 40px rgba(0,0,0,0.08);
```

### Overlay gradient (внутри модала)
```css
/* Декоративный accent */
background: linear-gradient(to bottom right,
  rgba(99,102,241,0.05),  /* indigo-500/5 */
  rgba(139,92,246,0.05),  /* purple-500/5 */
  rgba(236,72,153,0.05)); /* pink-500/5 */
pointer-events: none;
position: absolute;
inset: 0;
border-radius: 24px;
```

### Что делать
1. CSS override для `.ant-modal-content`: rounded-3xl + glassmorphism
2. Добавить gradient overlay внутрь модалов
3. Mask (backdrop): `background-color: rgba(0,0,0,0.4); backdrop-filter: blur(4px)`

---

## 🔴 6. Фоны страниц — БЕЛЫЙ СПЛОШНОЙ

### Текущее (AdClaw)
```css
background: #fff; /* все страницы */
```

### Требуется (Citedy)
```css
/* Dashboard layout background */
background: linear-gradient(to bottom right,
  #f8fafc,               /* slate-50 */
  rgba(239,246,255,0.3), /* blue-50/30 */
  rgba(250,245,255,0.2)); /* purple-50/20 */
```

### Декоративные blurred shapes:
```css
/* Orbs на фоне */
.orb-1 {
  position: absolute;
  right: -128px; top: -128px;
  width: 256px; height: 256px;
  border-radius: 50%;
  background: rgba(59,130,246,0.05); /* blue-500/5 */
  filter: blur(64px); /* blur-3xl */
}
```

### Что делать
1. Добавить gradient background в layout контейнер
2. Добавить 2-3 декоративных blurred circle в каждую страницу
3. `pointer-events: none` на всех декоративных элементах

### Файлы для изменения
- `console/src/layouts/MainLayout/index.tsx`
- `console/src/styles/layout.css`

---

## 🔴 7. Header — ПЛОСКИЙ

### Текущее (AdClaw)
```css
height: 64px;
background: white;
border-bottom: 1px solid #f0f0f0;
```

### Требуется (Citedy)
```css
position: sticky;
top: 0;
z-index: 50;
background: rgba(255,255,255,0.8); /* bg-white/80 */
backdrop-filter: blur(24px); /* backdrop-blur-xl */
border-bottom: 1px solid rgba(226,232,240,0.6); /* border-slate-200/60 */
```

### Что делать
- Добавить glassmorphism к header
- `background: rgba(255,255,255,0.8)` + `backdrop-filter: blur(24px)`
- Обновить border opacity

### Файлы для изменения
- `console/src/layouts/Header.tsx`

---

## 🟡 8. Цветовая палитра — ЧАСТИЧНОЕ РАСХОЖДЕНИЕ

### Текущее → Требуется

| Роль | Текущее | Требуется |
|------|---------|-----------|
| Primary accent | `#615ced` | `#0f172a` (slate-900) для кнопок, `#3b82f6` (blue-500) для links |
| Text primary | `#1a1a1a` | `#0f172a` (slate-900) |
| Text secondary | `#666` | `#475569` (slate-600) |
| Text muted | `#999` | `#64748b` (slate-500) |
| Background | `#fff` | `#f8fafc` (slate-50) с gradient |
| Border | `#d9d9d9` / `#f0f0f0` | `rgba(226,232,240,0.4)` (slate-200/40) |
| Success | `#52c41a` | `#22c55e` (green-500) |
| Error | `#ff4d4f` | `#dc2626` (red-600) |

### Что делать
- Обновить CSS variables / Ant Design theme tokens
- Заменить `#615ced` на slate-900 для primary actions
- Перейти на Slate scale для текста

---

## 🟡 9. Типографика

### Текущее → Требуется

| Элемент | Текущее | Требуется |
|---------|---------|-----------|
| Page title | 24px, weight 600 | text-2xl sm:text-3xl (24-30px), font-bold (700) |
| Card title | 18px, weight 600 | text-sm (14px), font-semibold (600), text-slate-600 |
| Body | 14px, weight 400 | 14px (text-sm) или 16px (text-base), text-slate-600 |
| Helper | 12px, weight 400 | text-xs (12px), text-slate-500 |

### Card Title — КРИТИЧНОЕ ОТЛИЧИЕ
Citedy: `text-sm font-semibold text-slate-600` (маленький, приглушенный заголовок)
AdClaw: 18px bold (крупный, контрастный)

### Что делать
- Уменьшить card title до 14px, вес 600, цвет slate-600
- Добавить иконку 16px рядом с title (h-4 w-4, яркий цвет)

---

## 🟡 10. Badges/Tags

### Текущее
```css
/* Ant Design Tag */
padding: 0 7px;
font-size: 12px;
border-radius: 4px;
```

### Требуется
```css
/* Citedy Badge */
backdrop-blur-md bg-white/70
border border-white/20
shadow-[0_8px_32px_rgba(0,0,0,0.04)]
whitespace-nowrap
gap-1.5 /* icon + text */
```

### Что делать
- Заменить Ant Tags на glassmorphism badges
- Добавить `whitespace-nowrap` (запрет переноса текста!)
- Иконки 14px (h-3.5 w-3.5) перед текстом

---

## 🟡 11. Анимации

### Текущее
```css
transition: all 0.2s ease-in-out; /* единственная анимация */
```

### Требуется (по приоритету)
1. **Card hover lift**: `hover:-translate-y-0.5` + shadow upgrade
2. **Underglow**: radial-gradient под карточками, opacity 40→70% on hover
3. **Card glow**: outer glow с blur, opacity 25→50% on hover, `duration-1000`
4. **Loading**: conic gradient rotation (2.5s linear infinite)

### Что делать (Phase 1 — только hover)
- Добавить `transform: translateY(-2px)` + shadow increase на hover карточек
- `transition: all 0.2s` уже есть, достаточно добавить transform

---

## 🟢 12. Two-Tone Headings

### Текущее
Нет gradient text

### Требуется
```tsx
<h1 className="text-4xl font-bold">
  AdClaw{" "}
  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
    Console
  </span>
</h1>
```

### Что делать
- Добавить gradient text в page titles и section headers
- Низкий приоритет — декоративный элемент

---

## План внедрения (порядок приоритетов)

### Phase 1: Фундамент ✅ DONE
1. ✅ **Фоны страниц** — gradient background + decorative orbs (`layout.css`)
2. ✅ **Header** — glassmorphism bg-white/80 + blur (`Header.tsx`)
3. ✅ **Кнопки** — pill rounded-full (`citedy-overrides.less`)
4. ✅ **Цвета** — Slate scale (`App.tsx` theme config)

### Phase 2: Карточки ✅ DONE
5. ✅ **cardBase** — glassmorphism gradient (`SkillCard.tsx`, `MCPClientCard.tsx`, `PersonaCard.tsx`, `LocalProviderCard.tsx`, `RemoteProviderCard.tsx` + все `index.module.less`)
6. ✅ **Decorative icons** — 3% opacity background
7. ✅ **Card titles** — 14px, semibold, slate-600

### Phase 3: Навигация ✅ DONE
8. ✅ **Sidebar** — dark pill active state (`Sidebar.tsx`)
9. ✅ **Tabs** — pill-style tab navigation

### Phase 4: Модалы и детали ✅ DONE
10. ✅ **Модалы** — rounded-3xl + glassmorphism (`ModelManageModal.tsx`, `PersonaDrawer.tsx`, `JobDrawer.tsx`)
11. ✅ **Badges** — glassmorphism + whitespace-nowrap (`SecurityBadges.tsx`)
12. ✅ **Hover анимации** — lift + underglow
13. ✅ **Two-tone headings** — gradient text accents

---

## Технические заметки

### Ant Design + Glassmorphism
Ant Design не поддерживает glassmorphism из коробки. Варианты:
1. **CSS Override** — `.ant-card { backdrop-filter: blur(12px); background: rgba(255,255,255,0.7); }`
2. **ConfigProvider theme** — ограниченно (нет backdrop-filter в tokens)
3. **Замена на custom components** — максимальный контроль, больше работы

**Рекомендация**: CSS Override (файлы в `console/src/styles/`) для Phase 1-2, custom components для Phase 3-4.

### CSS файл для overrides
Создать `console/src/styles/citedy-overrides.css`:
```css
/* Glassmorphism base */
.ant-card {
  backdrop-filter: blur(4px);
  background: linear-gradient(to bottom right, rgba(248,250,252,0.8), rgba(255,255,255,0.6), rgba(249,250,251,0.8));
  border: 1px solid rgba(226,232,240,0.4);
  border-radius: 16px;
  box-shadow: none;
}

/* Pill buttons */
.ant-btn {
  border-radius: 9999px;
}

/* Header glassmorphism */
.ant-layout-header {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(226,232,240,0.6);
}

/* Modal glassmorphism */
.ant-modal-content {
  border-radius: 24px;
  background: linear-gradient(to bottom right, rgba(255,255,255,0.95), rgba(248,250,252,0.9), rgba(249,250,251,0.95));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: 0 8px 40px rgba(0,0,0,0.08);
}
```
