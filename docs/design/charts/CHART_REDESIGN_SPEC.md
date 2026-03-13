# Chart Redesign Specification

## Overview

This document provides design recommendations for modernizing the TrendChart and comparison charts with glassmorphism styling while maintaining data clarity.

---

## Analysis of Reference Designs

### Reference 1: Profit Chart (Stacked Bars + Line)

**Strengths:**

- Clear headline number with prominent change badge
- Stacked bars show composition clearly
- Line overlay for trends/averages
- Clean, minimal legend

**Best for:** Showing breakdown of categories over time

### Reference 2: Screen Time Chart (Segmented Bars)

**Strengths:**

- Highlighted active segment draws attention
- Gray inactive data provides context
- Sub-chart for detailed breakdown
- Bottom stats summary

**Best for:** Day/segment comparisons with drill-down

### Reference 3: Sales Chart (Layered Areas)

**Strengths:**

- Multiple layered areas with varying opacity create depth
- Soft gradients feel premium and modern
- Floating tooltip with value + change %
- Big headline number with change badge
- Most cohesive with glassmorphism aesthetic

**Best for:** Continuous data trends over time (percentages, scores)

---

## Recommendation for TrendChart

### Primary Recommendation: Layered Area Chart (Reference 3 Style)

**Rationale:**

1. **Data Type Match**: Visibility % is continuous percentage data over time - perfect for area charts
2. **Glassmorphism Synergy**: Layered translucent areas naturally complement the glass aesthetic
3. **Visual Impact**: Creates depth and premium feel without sacrificing clarity
4. **Multi-Series Support**: Can show Recognition + AI Traffic as layered areas when both are enabled

### Design Approach

```
+------------------------------------------------------------------+
|  Visibility Trend                                    [7d][30d][90d]
|                                                                    |
|  72%                                     [Recognition][AI Traffic]  |
|  Current Score         +12% vs last period                         |
|                                                                    |
|  [============ LAYERED AREA CHART ============]                    |
|  |                                         ___/                    |
|  |                    ___/\___/\__/\___/--'                        |
|  |        ___/\_/\__/'                                             |
|  |  __/--'                                                         |
|  +------------------------------------------------------------     |
|   Jan 1    Jan 8    Jan 15    Jan 22    Jan 29                     |
|                                                                    |
|  +----------------------------------------------------------+      |
|  |  Current    |    Average    |    Change    |   Mentions  |      |
|  |    72%      |      65%      |    +12%      |     847     |      |
|  +----------------------------------------------------------+      |
+------------------------------------------------------------------+
```

---

## Visual Specifications

### 1. Card Container (Glassmorphism)

```tsx
// Card wrapper with glass effect
const cardStyles = cn(
  "relative overflow-hidden",
  "rounded-2xl",
  "bg-white/80 backdrop-blur-md",
  "border border-white/20",
  "shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
);

// Decorative gradient overlay
const gradientOverlay = (
  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
);
```

### 2. Headline Stats Section

```tsx
// Big number with change badge
<div className="flex items-baseline gap-3 mb-1">
  <span className="text-4xl font-bold text-gray-900">
    {currentScore}%
  </span>
  <span className={cn(
    "px-2 py-0.5 rounded-full text-sm font-medium",
    change >= 0
      ? "bg-emerald-100 text-emerald-700"
      : "bg-red-100 text-red-700"
  )}>
    {change >= 0 ? "+" : ""}{change}%
  </span>
</div>
<p className="text-sm text-gray-500">vs previous period</p>
```

### 3. Chart Area Gradients

```tsx
// Recognition (Indigo) - Primary layer
<linearGradient id="recognitionGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
  <stop offset="50%" stopColor="#6366f1" stopOpacity={0.15} />
  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
</linearGradient>

// AI Traffic (Emerald) - Secondary layer
<linearGradient id="organicGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
  <stop offset="50%" stopColor="#10b981" stopOpacity={0.12} />
  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
</linearGradient>
```

### 4. Custom Tooltip (Glassmorphism)

```tsx
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl",
        "bg-white/90 backdrop-blur-md",
        "border border-white/40",
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
      )}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-semibold text-gray-900">
            {entry.value.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">{entry.name}</span>
        </div>
      ))}
    </div>
  );
};
```

### 5. Stats Footer (Glass Cards)

```tsx
<div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100/50">
  {stats.map((stat) => (
    <div
      key={stat.label}
      className={cn(
        "text-center p-3 rounded-xl",
        "bg-white/50 backdrop-blur-sm",
        "border border-white/30",
      )}
    >
      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
      <p
        className={cn("text-lg font-bold", stat.colorClass || "text-gray-900")}
      >
        {stat.value}
      </p>
    </div>
  ))}
</div>
```

### 6. Period Selector (Pill Style)

```tsx
<div className="flex gap-1 p-1 rounded-xl bg-gray-100/60 backdrop-blur-sm">
  {PERIOD_OPTIONS.map((opt) => (
    <button
      key={opt.value}
      onClick={() => setPeriod(opt.value)}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        period === opt.value
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700",
      )}
    >
      {opt.label}
    </button>
  ))}
</div>
```

### 7. Type Toggle (Recognition/AI Traffic)

```tsx
<div className="flex gap-1 p-1 rounded-xl bg-gray-100/60">
  {chartTypes.map((type) => (
    <button
      key={type.id}
      onClick={() => setChartType(type.id)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        chartType === type.id
          ? cn("text-white shadow-sm", type.bgActive)
          : "text-gray-500 hover:text-gray-700",
      )}
    >
      <type.icon className="w-3.5 h-3.5" />
      {type.label}
    </button>
  ))}
</div>;

// Type config
const chartTypes = [
  {
    id: "recognition",
    label: "Recognition",
    icon: Eye,
    bgActive: "bg-indigo-500",
  },
  {
    id: "organic",
    label: "AI Traffic",
    icon: Search,
    bgActive: "bg-emerald-500",
  },
];
```

---

## Competitor Comparison Chart

### Recommendation: Side-by-Side Bar Chart with Trend Lines

For comparing visibility across competitors, use horizontal bars with embedded sparklines:

```
+------------------------------------------------------------------+
|  Visibility Comparison                              Latest Check  |
|                                                                    |
|  Your Product  [==================] 72%              /\__/\       |
|  Competitor A  [===============] 65%                 ___/\        |
|  Competitor B  [============] 58%                   /\____        |
|  Competitor C  [========] 42%                      ___/           |
|                                                                    |
|  [0%          25%          50%          75%         100%]         |
+------------------------------------------------------------------+
```

### Implementation

```tsx
const ComparisonChart = ({ data }) => (
  <div className="space-y-3">
    {data.map((item, i) => (
      <div key={item.domain} className="flex items-center gap-4">
        {/* Domain name */}
        <div className="w-32 truncate">
          <span
            className={cn(
              "text-sm font-medium",
              item.isPrimary ? "text-indigo-600" : "text-gray-700",
            )}
          >
            {item.name}
          </span>
        </div>

        {/* Bar */}
        <div className="flex-1 h-8 rounded-lg bg-gray-100/60 overflow-hidden relative">
          <motion.div
            className={cn(
              "h-full rounded-lg",
              item.isPrimary
                ? "bg-gradient-to-r from-indigo-500 to-indigo-400"
                : "bg-gradient-to-r from-gray-400 to-gray-300",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${item.visibility}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Value label inside bar */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
            {item.visibility}%
          </span>
        </div>

        {/* Mini sparkline */}
        <div className="w-16 h-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={item.history}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={item.isPrimary ? "#6366f1" : "#9ca3af"}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    ))}
  </div>
);
```

---

## Color Palette

### Primary Colors

| Name    | Hex     | Tailwind    | Usage                        |
| ------- | ------- | ----------- | ---------------------------- |
| Indigo  | #6366f1 | indigo-500  | Recognition, primary product |
| Emerald | #10b981 | emerald-500 | AI Traffic, positive changes |
| Red     | #ef4444 | red-500     | Negative changes, alerts     |
| Amber   | #f59e0b | amber-500   | Warnings, neutral states     |

### Gradient Stops

```css
/* Recognition gradient */
--recognition-start: rgba(99, 102, 241, 0.4);
--recognition-mid: rgba(99, 102, 241, 0.15);
--recognition-end: rgba(99, 102, 241, 0.02);

/* AI Traffic gradient */
--organic-start: rgba(16, 185, 129, 0.35);
--organic-mid: rgba(16, 185, 129, 0.12);
--organic-end: rgba(16, 185, 129, 0.02);
```

### Glass Effect Tokens

```css
/* Background opacity */
--glass-bg: rgba(255, 255, 255, 0.8);
--glass-bg-light: rgba(255, 255, 255, 0.5);

/* Border opacity */
--glass-border: rgba(255, 255, 255, 0.2);

/* Shadow */
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
--glass-shadow-hover: 0 8px 32px rgba(0, 0, 0, 0.08);
```

---

## Animation Specifications

### Chart Entry Animation

```tsx
// Area fade-in
<Area animationBegin={0} animationDuration={1200} animationEasing="ease-out" />;

// Stats counter
const [displayValue, setDisplayValue] = useState(0);
useEffect(() => {
  const duration = 1000;
  const steps = 60;
  const increment = targetValue / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      setDisplayValue(targetValue);
      clearInterval(timer);
    } else {
      setDisplayValue(Math.round(current));
    }
  }, duration / steps);

  return () => clearInterval(timer);
}, [targetValue]);
```

### Hover Interactions

```tsx
// Card hover lift
<Card className="transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-0.5" />

// Stat card glow on hover
<div className="transition-all duration-200 hover:bg-white/70 hover:border-indigo-200/50 hover:shadow-sm" />
```

---

## Responsive Behavior

### Breakpoint Adjustments

```tsx
// Mobile (< 640px)
- Stack header elements vertically
- Full-width period selector
- Reduce chart height to 200px
- 2-column stats grid

// Tablet (640px - 1024px)
- Inline header with wrapping
- Chart height 240px
- 4-column stats grid

// Desktop (> 1024px)
- Full inline header
- Chart height 280px
- Optional platform breakdown toggle
```

### Mobile-Specific Classes

```tsx
<CardHeader className="pb-2">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    {/* Title + info */}
    <div className="flex items-center gap-2">
      <CardTitle className="text-base sm:text-lg font-semibold">
        {displayTitle}
      </CardTitle>
      {/* Info tooltip */}
    </div>

    {/* Controls */}
    <div className="flex flex-wrap gap-2">
      {/* Type toggle - full width on mobile */}
      <div className="w-full sm:w-auto order-2 sm:order-1">{typeToggle}</div>
      {/* Period selector */}
      <div className="order-1 sm:order-2">{periodSelector}</div>
    </div>
  </div>
</CardHeader>
```

---

## Implementation Priority

### Phase 1: Core Visual Updates (High Impact)

1. Add glassmorphism card container
2. Implement new gradient definitions
3. Create custom tooltip component
4. Update stats footer with glass cards

### Phase 2: Headline Stats (Medium Impact)

1. Add big number display with change badge
2. Animate value counters
3. Add "vs previous period" context

### Phase 3: Enhanced Interactions (Polish)

1. Hover states and transitions
2. Smooth data loading animations
3. Skeleton loading states

### Phase 4: Comparison Chart (New Feature)

1. Implement bar chart comparison
2. Add embedded sparklines
3. Sync with competitor data

---

## Files to Modify

| File                                              | Changes                          |
| ------------------------------------------------- | -------------------------------- |
| `components/ai-insights/TrendChart.tsx`           | Full redesign with new patterns  |
| `components/ai-insights/CompetitorChartPopup.tsx` | Apply glass styling to charts    |
| `components/ui/chart-tooltip.tsx`                 | New shared tooltip component     |
| `lib/chart-utils.ts`                              | Shared gradient definitions      |
| `styles/chart-tokens.css`                         | CSS custom properties (optional) |

---

## Accessibility Considerations

1. **Color contrast**: Ensure gradient stops maintain 4.5:1 contrast for text
2. **Focus states**: Visible focus rings on all interactive elements
3. **Screen readers**: ARIA labels for chart data points
4. **Reduced motion**: Respect `prefers-reduced-motion` for animations
5. **High contrast mode**: Fallback solid colors when blur not supported

---

## Performance Notes

1. **Lazy load Recharts**: Already using dynamic imports
2. **Memoize chart data**: Prevent recalculation on every render
3. **Throttle resize**: Debounce ResponsiveContainer updates
4. **GPU acceleration**: Use `will-change: transform` for animated elements
5. **Reduce blur on mobile**: Use `backdrop-blur-sm` instead of `backdrop-blur-md`

---

## Example Implementation

See full implementation example in:
`/docs/design/charts/TrendChart.example.tsx`
