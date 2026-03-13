# Recognition Check Confirmation Dialog

## Описание

Диалоговое окно подтверждения для запуска прямой проверки узнаваемости бренда или конкурента в AI-чатботах (Recognition Check). Окно информирует пользователя о стоимости операции в кредитах и проверяет наличие достаточного баланса перед выполнением.

Дополнительно используется расширенный диалог **Run Full Product Check** для комбинированного запуска Recognition + AI Traffic + SEO.

## Расположение

- **Файл:** `components/ai-insights/Dashboard.tsx`
- **Строки (примерно):** 1845–1904 (JSX), 852–874 (Логика открытия `handleRefresh`), 993–1100 (Логика выполнения `executeRefresh`).

### Full Product Check (combined)

- **Файлы:**
  - `components/ai-insights/Dashboard.tsx` (⚡ иконка на карточке продукта в AI Insights)
  - `app/dashboard/new/page.tsx` (кнопка Full Check в War Room)
- **Строки (примерно):**
  - `components/ai-insights/Dashboard.tsx`: 2260–2410 (JSX диалога), 260–340 (расчет стоимости)
  - `app/dashboard/new/page.tsx`: 1500–1680 (JSX диалога), 530–760 (обработчики запуска)

## Как работает

### 1. Триггер (Trigger)

Окно открывается через функцию `handleRefresh`, которая передается в следующие компоненты:

- `CompetitorsList`: кнопка обновления (RefreshCw) в карточке конкурента.
- Основная карточка видимости (Visibility Card) на дашборде.

### 2. Расчет стоимости (Cost Calculation)

Стоимость рассчитывается динамически в `handleRefresh`:

- **Платформы:** Всегда 4 (ChatGPT, Claude, Gemini, Perplexity).
- **Количество запросов:**
  - Если бренд совпадает с доменом: 2 запроса (`"what is domain"`, `"domain reviews"`).
  - Если бренд отличается от домена: 4 запроса (2 по бренду + 2 по домену).
- **Формула:** `queryCount * 4 (платформы) * 3 (кредита за запрос)`.

### Full Product Check: Cost Calculation

- **Recognition (LLM):** `queryCount * 4 * 3` (та же формула, что и выше).
- **AI Traffic:** фиксированные **25** кредитов.
- **SEO SERP Analysis:** фиксированные **2** кредита.
- **Итого:** сумма выбранных чеков.

### 3. Состояние (State)

Управляется через объект `confirmDialog`:

```typescript
const [confirmDialog, setConfirmDialog] = useState({
  open: false,
  domain: "",
  id: "",
  type: "favorite" | "competitor",
  cost: 0,
  name: null,
  brandVariants: [],
});
```

## UI Компоненты

- `AlertDialog`: Базовый компонент Shadcn для модальных окон.
- `Coins` (из `lucide-react`): Иконка валюты.
- `RefreshCw`: Иконка кнопки запуска.
- Проверка баланса: Если `balance.credits < confirmDialog.cost`, кнопка "Refresh Now" блокируется, и появляется ссылка на страницу оплаты (`/dashboard/billing`).

### Full Product Check UI

- 3 строки чекбоксов: **Recognition Check (LLM)**, **AI Traffic**, **SEO SERP Analysis**.
- У каждой строки есть `(i)` tooltip с объяснением результата проверки.
- Общая стоимость и баланс отображаются в отдельном amber-блоке.

```
┌──────────────────────────────────────────┐
│ Run Full Product Check                   │
│ Select checks for example.com            │
│                                          │
│ [x] Recognition Check (LLM)   🪙 12–24   │
│     i: direct brand knowledge            │
│ [ ] AI Traffic               🪙 25       │
│     i: organic AI mentions               │
│ [x] SEO SERP Analysis         🪙 2       │
│     i: keywords + visibility             │
│                                          │
│ Total: 🪙 14   Balance: 🪙 860           │
│ [Cancel]                 [Run Full Check]│
└──────────────────────────────────────────┘
```

## Процесс выполнения (Execution Flow)

При нажатии на "Refresh Now":

1. Вызывается `executeRefresh`.
2. Проверяется баланс.
3. Отправляется POST запрос на `/api/ai-insights/competitors/analyze`.
4. Полученные результаты сохраняются через PATCH запрос к `/api/ai-insights/favorites/${id}` или `/api/ai-insights/competitors/${id}`.
5. Создается снапшот в базе данных для графиков трендов через `/api/ai-insights/snapshots`.
6. Обновляются локальные списки (`loadFavorites` / `loadCompetitors`) и баланс.

## API Эндпоинты

- **Анализ:** `/api/ai-insights/competitors/analyze` (POST)
- **Сохранение:** `/api/ai-insights/favorites/[id]` или `/api/ai-insights/competitors/[id]` (PATCH)
- **Трекинг:** `/api/ai-insights/snapshots` (POST)
