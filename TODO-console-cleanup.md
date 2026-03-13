# Console UI Cleanup — TODO

> **Цель**: убрать весь китайский, удалить language switcher, привести верстку к консистентному виду.

---

## Phase 1: Убрать китайский язык

- [ ] **1.1** `JobDrawer.tsx:143` — заменить `"请选择至少一天"` на английский текст или i18n ключ
- [ ] **1.2** `columns.tsx:148-150` — заменить китайский Cron tooltip (`Cron 表达式`, `格式: 分钟 小时 日 月 星期`) на английский
- [ ] **1.3** `Weather/index.tsx:137-148` — заменить погодные лейблы (`晴朗`, `雨天`, `多云`) на английские
- [ ] **1.4** `Weather/index.tsx:182` — заменить формат даты `"MM月DD日 dddd"` на `"MMM DD, dddd"`
- [ ] **1.5** `defaultConfig.ts:23,26` — заменить приветственные промпты (`让我们开启一段新的旅程吧！`, `能告诉我你有哪些技能吗？`) на английские
- [ ] **1.6** Grep весь `console/src/` на оставшиеся китайские символы `[\u4e00-\u9fff]` — убедиться что ничего не осталось

## Phase 2: Убрать language switcher

- [ ] **2.1** `LanguageSwitcher.tsx` — удалить компонент полностью
- [ ] **2.2** `Header.tsx` (или где он импортируется) — убрать `<LanguageSwitcher />` из рендера
- [ ] **2.3** `i18n.ts` — убрать `zh` из ресурсов, оставить только `en`, убрать fallback logic
- [ ] **2.4** `locales/zh.json` — удалить файл
- [ ] **2.5** Проверить: нет ли других мест где импортируется LanguageSwitcher или zh.json

## Phase 3: Верстка — консистентность

### Spacing

- [ ] **3.1** Стандартизировать spacing: xs=8, sm=12, md=16, lg=20, xl=24 — создать CSS variables или constants
- [ ] **3.2** `columns.tsx:150` — tooltip: заменить inline `fontSize: 11, opacity: 0.8` на CSS класс
- [ ] **3.3** Проверить все drawer/modal paddings — привести к единому стандарту

### Cards & Grids

- [ ] **3.4** MCP `index.tsx:256-260` — grid styling: заменить inline style на className
- [ ] **3.5** MCP Citedy карточка — вынести inline градиент в CSS класс
- [ ] **3.6** Проверить все Card компоненты: borderRadius, padding, shadow — должны быть одинаковые

### Modals & Drawers

- [ ] **3.7** Стандартизировать ширину: Drawer=600px, Modal small=480px, Modal large=800px
- [ ] **3.8** Проверить все модалки на одинаковый footer layout (Cancel | Primary)

### Typography

- [ ] **3.9** Проверить page titles: все должны быть fontSize=24, fontWeight=600
- [ ] **3.10** Проверить descriptions: все fontSize=14, color=#64748b
- [ ] **3.11** Заменить `"已成功发送文件"` в `send_file.py` на английский (уже сделано, проверить)

### Forms

- [ ] **3.12** Все формы: layout="vertical", одинаковый spacing между полями
- [ ] **3.13** Footer кнопки форм: единый стиль borderTop separator

---

## Валидация

- [ ] **V1** `grep -rP '[\x{4e00}-\x{9fff}]' console/src/` — 0 результатов
- [ ] **V2** Открыть каждую страницу Web UI — нигде нет китайского текста
- [ ] **V3** Language switcher отсутствует в header
- [ ] **V4** Все страницы визуально консистентны (cards, spacing, forms)
- [ ] **V5** npm run build — без ошибок

---

*Приоритет: Phase 1 → Phase 2 → Phase 3. Каждый пункт коммитить отдельно.*
