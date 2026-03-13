# Console UI Cleanup — TODO

> **Цель**: убрать весь китайский, удалить language switcher, привести верстку к консистентному виду.

---

## Phase 1: Убрать китайский язык ✅

- [x] **1.1** `JobDrawer.tsx:143` — заменить `"请选择至少一天"` на английский текст или i18n ключ
- [x] **1.2** `columns.tsx:148-150` — заменить китайский Cron tooltip на английский
- [x] **1.3** `Weather/index.tsx:137-148` — заменить погодные лейблы на английские
- [x] **1.4** `Weather/index.tsx:182` — заменить формат даты на `"MMM DD, dddd"`
- [x] **1.5** `defaultConfig.ts:23,26` — заменить приветственные промпты на английские
- [x] **1.6** Grep весь `console/src/` на оставшиеся китайские символы — 0 результатов

## Phase 2: Убрать language switcher ✅

- [x] **2.1** `LanguageSwitcher.tsx` — удалён
- [x] **2.2** `Header.tsx` — убран `<LanguageSwitcher />`
- [x] **2.3** `i18n.ts` — убран `zh`, оставлен только `en`
- [x] **2.4** `locales/zh.json` — удалён
- [x] **2.5** Проверено: нет других импортов LanguageSwitcher или zh.json

## Phase 3: Верстка — консистентность ✅

### Spacing

- [x] **3.1** Spacing CSS variables: `--citedy-space-xs/sm/md/lg/xl` в `citedy-overrides.less`
- [x] **3.2** `columns.tsx` — tooltip inline стили → `.citedy-cron-tooltip-sub` CSS класс
- [x] **3.3** Drawer footer: `borderTop` через глобальный CSS `.ant-drawer-footer`

### Cards & Grids

- [x] **3.4** MCP grid → `.citedy-content-grid` CSS класс
- [x] **3.5** MCP Citedy карточка → `.citedy-promo-card.configured/.unconfigured` CSS классы
- [x] **3.6** Card компоненты: уже стандартизированы через `citedy-overrides.less` (borderRadius: 16px, unified shadow/border)

### Modals & Drawers

- [x] **3.7** Drawer widths стандартизированы: Skill 520→600, Session 520→600, Persona 560→600, Channel 420→600, MCP/CronJob уже 600. Modal: small=480, large=800
- [x] **3.8** Modal/Drawer footer: единый `borderTop` через глобальный CSS

### Typography

- [x] **3.9** Page titles: все `fontSize=24, fontWeight=700`. MCP: inline→className `.citedy-page-title`. Workspace: добавлен `font-size: 24px`
- [x] **3.10** Descriptions: MCP: inline→className `.citedy-page-description`. Остальные через CSS modules `.description`
- [x] **3.11** `send_file.py` — уже на английском

### Forms

- [x] **3.12** Все формы: `layout="vertical"` — уже было
- [x] **3.13** Footer borderTop: глобальный CSS через `.ant-drawer-footer`

---

## Валидация

- [x] **V1** `grep -rP '[\x{4e00}-\x{9fff}]' console/src/` — 0 результатов
- [x] **V2** Визуальная проверка: китайский текст отсутствует
- [x] **V3** Language switcher удалён
- [x] **V4** Страницы визуально консистентны (spacing vars, card/grid/drawer стандартизированы)
- [x] **V5** `npm run build` — успешно ✅

---

*Все три фазы завершены.*
