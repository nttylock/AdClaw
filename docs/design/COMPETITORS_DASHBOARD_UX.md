# AI Competitive Intelligence Dashboard - UX Design Specification

**Last Updated**: December 2025
**Status**: Design Phase - Ready for Implementation
**Tech Stack**: Next.js + React + Tailwind CSS + Recharts + shadcn/ui

---

## Executive Summary

This document provides three UX solutions for managing large competitor lists (20-100+ competitors) in the AI Competitive Intelligence Dashboard. Each solution addresses scalability, filtering, and comparison workflows with modern SaaS patterns inspired by Ahrefs, SEMrush, and SimilarWeb.

---

## Problem Statement

**Current Challenges:**

1. **List Scalability**: Competitors list grows from 5 to 100+ entries dynamically from LLM responses
2. **Visual Hierarchy**: Current vertical card list becomes unwieldy with large datasets
3. **Trend Visibility**: Users can't easily see historical visibility trends for any competitor
4. **Comparison Workflow**: No clear way to compare own domain metrics vs competitors side-by-side
5. **Mobile Responsiveness**: Current layout doesn't scale well to mobile/tablet screens
6. **Action Efficiency**: Need bulk actions and quick filtering for power users

**User Goals:**

- Browse/filter large competitor list efficiently
- View visibility trends for any competitor (not just own domain)
- Compare own domain against 1-3 key competitors
- Prioritize competitors by threat level
- Analyze competitor keywords and content strategy
- Track competitive landscape evolution over time

---

## Solution 1: Hybrid List + Table + Insights Drawer

### Overview

**Layout**: Three-pane design with smart context-aware content rendering

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TOOLBAR: Filter | Sort | View Toggle | Bulk Actions                    │
├──────────────────────────────────────────────────────────────┬──────────┤
│                                                              │          │
│  COMPETITORS                                                 │ INSIGHTS │
│  List/Table/Grid View                                        │ DRAWER   │
│  - Search & Filter                                           │          │
│  - Inline threat level                                       │ Selected │
│  - Quick metrics preview                                     │ Competitor│
│  - 1-click comparison toggle                                 │          │
│                                                              │ - Metrics│
│                                                              │ - Trends │
│                                                              │ - Keywords│
│                                                              │          │
└──────────────────────────────────────────────────────────────┴──────────┘
```

### Key Features

#### 1.1 View Modes (Toggle)

**List Mode** (Default)
- Compact vertical cards optimized for mobile
- Show: Domain, threat level badge, priority, last analyzed
- Hover: Expand to show metrics preview
- Click row: Open insights drawer

**Table Mode**
- Desktop-optimized data table
- Columns: Domain, Category, Threat, DA, Traffic, Keywords, Last Analyzed
- Sortable by any column
- Better for bulk actions and comparison

**Grid Mode**
- Visual cards with metric sparklines
- 3-4 cards per row (responsive)
- Quick visual threat assessment
- Sparkline trend preview

#### 1.2 Smart Filtering

```typescript
interface CompetitorFilters {
  search: string;              // Domain/name search
  category: string[];          // Direct, Indirect, Aspirational, etc.
  threatLevel: 'high' | 'medium' | 'low';
  discoveredAfter: Date;       // "Added in last 7 days"
  minDA: number;               // Domain Authority threshold
  hasMetrics: boolean;         // Only analyzed competitors
  platformPresence?: 'gpt' | 'claude' | 'gemini' | 'perplexity';
}
```

**Filter UI Components:**
- Quick filters as pills: "High Threat", "Analyzed", "Direct Competitors"
- Advanced filter panel (collapsed by default)
- Saved filter presets: "Top Threats", "New Competitors", "Content Gaps"
- Filter count badge shows active filters

#### 1.3 Inline Actions

Each competitor row has:
- **Analyze** (Search icon) - Quick analysis
- **Compare** (Compare icon) - Add/remove from comparison view
- **Trending** (Chart icon) - Open trend modal
- **Edit** - Modify details
- **Delete** - Remove (with confirmation)

#### 1.4 Insights Drawer

Right-side sliding panel (30% width, responsive) showing:

```
┌─────────────────────────────────┐
│ X  example.com                  │
│ ┌─────────────────────────────┐ │
│ │ QUICK METRICS               │ │
│ │ DA: 42  Traffic: 15.2K      │ │
│ │ Keywords: 2,341  Links: 892 │ │
│ └─────────────────────────────┘ │
│                                 │
│ VISIBILITY TREND (6 months)     │
│ [Sparkline Chart]               │
│ ↑ 12% vs last month             │
│                                 │
│ TOP KEYWORDS                    │
│ • keyword 1 (Rank: 3)           │
│ • keyword 2 (Rank: 7)           │
│ • keyword 3 (Rank: 12)          │
│                                 │
│ CATEGORY: Direct Competitor     │
│ PRIORITY: 1                     │
│ NOTES: High market share        │
│                                 │
│ [View Full Report] [Analyze]    │
└─────────────────────────────────┘
```

### Responsive Behavior

**Mobile (< 768px)**
- List view only (optimized)
- Filters accessible via bottom sheet
- Insights drawer becomes full-screen overlay
- Swipe gestures to dismiss drawer

**Tablet (768px - 1024px)**
- List/Table toggle (no Grid)
- Drawer width adjusts to 40%
- Vertical layout for drawer content

**Desktop (> 1024px)**
- All view modes available
- Fixed drawer width
- Side-by-side comparison possible

### Implementation Checklist

- [ ] Create `CompetitorFilters` interface
- [ ] Implement 3 view mode components
- [ ] Build filter UI with preset system
- [ ] Create insights drawer component
- [ ] Add responsive breakpoint logic
- [ ] Implement sorting across view modes
- [ ] Add virtual scrolling for 100+ items
- [ ] Create comparison toggle system

---

## Solution 2: Dashboard with Competitor Profile Tabs

### Overview

**Layout**: Full-width dashboard with tabbed interface

```
┌───────────────────────────────────────────────────────────────┐
│ MY DOMAIN               │ COMPETITOR TABS (Closeable)        │
│ metrics & trend         │ domain.com | other.com | X | X    │
├─────────────────────────┼────────────────────────────────────┤
│ COMPARATIVE VIEW        │ PROFILE: example.com               │
│ [Overlaid line chart]   │ ┌──────────────────────────────┐  │
│ showing my domain + up  │ │ Metrics  │ Keywords │ Content│  │
│ to 3 competitors        │ │ ┌──────────────────────────┐ │  │
│                         │ │ │ Trends chart (6 months) │ │  │
│                         │ │ │ [Recharts]              │ │  │
│                         │ │ │ Compare with MY domain  │ │  │
│                         │ │ └──────────────────────────┘ │  │
│                         │ │ Keywords: [tag list]        │  │
│                         │ └──────────────────────────────┘  │
│                         │                                    │
│ THREAT MATRIX          │ ACTIONS: Edit | Analyze | Delete  │
│ Scatter: DA vs Traffic │                                    │
│ Bubble size = Traffic  │                                    │
└─────────────────────────┴────────────────────────────────────┘
```

### Key Features

#### 2.1 Left Panel: My Domain Dashboard

**Permanent section** showing:
- Domain name & status
- Primary metrics (DA, Traffic, Keywords, Backlinks)
- Visibility trend chart (6 months with rolling average)
- Comparison metrics: "vs #1 competitor", "vs average"
- Action buttons: Analyze, Share Report, Export

#### 2.2 Right Panel: Competitor Tabs

**Tab System:**
- Start with 0 tabs (just left panel visible)
- Click "Compare" button to add competitors as tabs
- Max 3 open tabs + My Domain = visual comparison clarity
- Closeable tabs with "X" button
- Scroll tabs if > 3 competitors

**Competitor Tab Content:**
- Tab color-coded by threat level (Red/Orange/Yellow/Green)
- Threat level badge in tab title
- Synchronized chart scales with "My Domain"
- Quick metric comparison boxes
- Keywords ranked by importance

#### 2.3 Comparative Visualization

**Trend Chart:**
```
Overlaid line chart showing:
- My Domain (Dark blue, solid)
- Competitor 1 (Red, solid)
- Competitor 2 (Orange, dashed)
- Competitor 3 (Yellow, dashed)

Toggle options:
- Show/hide each line
- Zoom date range
- Download as PNG
```

**Threat Matrix Visualization:**
```
Scatter plot: Domain Authority (X) vs Organic Traffic (Y)
- My domain: Large blue dot with label
- Competitors: Colored dots by category
- Hover: Show domain name + metrics
- Click: Open tab
- Bubble size: Indicates backlink count
```

#### 2.4 Competitor Profile Tabs

**Tab Sections (Switchable):**

1. **Metrics Section**
   - Visual cards showing: DA, Traffic, Backlinks, Keywords
   - Comparison vs my domain (↑/↓ percentage)
   - Last updated timestamp
   - "Analyze Now" button

2. **Keywords Section**
   - Top 10 keywords they rank for
   - Rank position, search volume, difficulty
   - "Can we rank for these?" indicator (green/yellow/red)
   - Gap analysis: Keywords they have but we don't

3. **Content Section**
   - Recent content analysis
   - Top performing articles (by traffic/engagement)
   - Content topics distribution (pie chart)
   - Gap opportunities

4. **Visibility Trend**
   - Same chart as left panel for comparison
   - Ability to compare against other open tabs
   - Time range selector

### Responsive Behavior

**Mobile (< 768px)**
- Stacked layout: My Domain on top, Competitor profiles below
- Single competitor view at a time
- Swipe between open competitors
- Full-width charts

**Tablet (768px - 1024px)**
- Left panel: 40% width
- Right panel: 60% width
- Show 1 competitor at a time

**Desktop (> 1024px)**
- Left panel: 35% width (fixed)
- Right panel: 65% width (scrollable)
- Show 2-3 competitors with horizontal scroll

### Implementation Checklist

- [ ] Create `CompetitorProfile` component
- [ ] Implement tab management system
- [ ] Build comparative line chart component
- [ ] Create threat matrix scatter plot
- [ ] Implement tab switching logic
- [ ] Add responsive grid layout
- [ ] Create keyword comparison view
- [ ] Build content analysis section

---

## Solution 3: Advanced Modal with Full-Screen Competitor Report

### Overview

**Layout**: Simple list + detail modal with rich analytics

```
LEFT SIDEBAR (Fixed)          RIGHT MAIN AREA
┌──────────────────┐          ┌──────────────────────────────────┐
│ COMPETITORS      │          │ FULL-SCREEN COMPETITOR REPORT   │
│ [Filtered List]  │          │                                  │
│                  │          │ Header:                          │
│ example.com  ← ← │          │ example.com [Category] [Priority]│
│ • DA: 42         │          │                                  │
│ • Traffic: 15K   │◄─────────┤ TABS:                            │
│                  │          │ Overview | Trends | Keywords     │
│ other.com        │          │                                  │
│                  │          │ ┌──────────────────────────────┐ │
│ another.com      │          │ │ OVERVIEW TAB                 │ │
│                  │          │ │ - Metrics cards              │ │
│ ...              │          │ │ - 3-month trend sparkline    │ │
│                  │          │ │ - Last analyzed              │ │
│ [+Add] [Filters] │          │ │ - Quick actions              │ │
│                  │          │ └──────────────────────────────┘ │
└──────────────────┘          │                                  │
                              │ [Compare with My Domain]        │
                              │ [Analyze] [Edit] [Delete]       │
                              └──────────────────────────────────┘
```

### Key Features

#### 3.1 Left Sidebar: Compact List

- Search & filter (collapsible)
- Competitor list with inline metrics
- Select multiple for comparison
- Show threat level with color coding
- Counter: "Selected: 3 competitors"
- Bulk actions: Analyze All, Compare Selected, Export

#### 3.2 Main Modal: Detailed Report

**Modal Size:**
- Desktop: 80% width, 90% height (scrollable content)
- Tablet: 95% width
- Mobile: Full screen

**Navigation Tabs:**
1. **Overview** - Quick metrics, last analyzed, basic info
2. **Trends** - Historical charts (6/12 months)
3. **Keywords** - Keyword analysis with ranking
4. **Content** - Recent content & topics
5. **Backlinks** - Top linking domains
6. **Comparison** - Side-by-side with my domain or selected competitors

#### 3.3 Comparison Tab Features

**Selected Competitors Comparison:**
```
TABLE VIEW:
┌─────────────┬──────────┬──────────┬──────────┬──────────┐
│ Metric      │ My Site  │ Comp #1  │ Comp #2  │ Comp #3  │
├─────────────┼──────────┼──────────┼──────────┼──────────┤
│ Domain Auth │ 35 ↓     │ 42       │ 38 ↓     │ 28       │
│ Traffic     │ 24.5K ↑  │ 15.2K    │ 31.8K ↑  │ 8.2K     │
│ Backlinks   │ 1,234    │ 892 ↓    │ 2,156 ↑  │ 445      │
│ Keywords    │ 487      │ 2,341 ↑  │ 1,892 ↑  │ 612      │
└─────────────┴──────────┴──────────┴──────────┴──────────┘
```

**Trend Comparison:**
- Overlay all selected competitors + my domain
- Individual color per entity
- Toggle to show/hide individual lines
- Download chart as PNG

#### 3.4 Smart Defaults

- **First Click**: Opens competitor report in Overview tab
- **Second Click**: Toggles comparison vs. opening new modal
- **Bulk Select**: Checkboxes + "Compare Selected" button

### Responsive Behavior

**Mobile (< 768px)**
- Sidebar hidden, accessible via hamburger menu
- Modal is full-screen
- Tabs become horizontal scroll
- Disable sparklines, show minimal data

**Tablet (768px - 1024px)**
- Sidebar: 25% width
- Modal: 75% width
- Vertical tabs with better spacing

**Desktop (> 1024px)**
- Sidebar: 20% width (sticky/scrollable)
- Modal: 80% width
- All features enabled

### Implementation Checklist

- [ ] Create left sidebar component
- [ ] Build modal dialog structure
- [ ] Implement tab navigation
- [ ] Create comparison table component
- [ ] Build trend overlay chart
- [ ] Add multi-select logic
- [ ] Implement bulk actions
- [ ] Create responsive grid layout

---

## Recommended Solution: Solution 1 (Hybrid)

### Rationale

**Solution 1 (Hybrid List + Table + Insights)** is recommended because:

1. **Best Scalability**: Handles 20-100+ competitors without overwhelming UI
2. **Mobile-First**: List view works beautifully on mobile, scales to desktop
3. **Progressive Disclosure**: Show summary by default, deep dive on demand
4. **Fastest Workflow**: 2 clicks to see any competitor's trends + comparison
5. **Least Cognitive Load**: Single consistent interface across all screen sizes
6. **Easiest Implementation**: Builds on existing CompetitorsPanel component
7. **Modern SaaS Standard**: Matches patterns from top analytics tools

**Why not Solution 2?**
- Tab switching can become confusing with 5+ open competitors
- Comparison tabs split attention between left/right panels
- Not ideal for mobile/tablet due to layout constraints

**Why not Solution 3?**
- Modal-heavy workflow (more clicks)
- Sidebar takes permanent real estate
- Less efficient for quick scanning of full list

---

## Detailed Implementation: Solution 1

### Component Architecture

```
CompetitorIntelligenceDashboard
├── CompetitorToolbar
│   ├── SearchInput
│   ├── FilterButton
│   ├── ViewModeToggle (List|Table|Grid)
│   ├── SortDropdown
│   └── BulkActionsMenu
├── CompetitorFilterPanel (Collapsible)
│   ├── QuickFilterPills
│   ├── AdvancedFilters
│   ├── SavedPresets
│   └── FilterCount Badge
├── CompetitorList (Main Content)
│   ├── VirtualList (for 100+ items)
│   ├── CompetitorListRow / CompetitorTableRow / CompetitorGridCard
│   └── EmptyState
└── CompetitorInsightsDrawer (Right Panel, 30%)
    ├── MetricsCards
    ├── TrendChart (Recharts)
    ├── KeywordsSection
    ├── ComparisonSwitch
    └── QuickActions
```

### Data Model

```typescript
interface Competitor {
  id: string;
  domain: string;
  name: string;
  category: 'direct' | 'indirect' | 'aspirational' | 'content' | 'local';
  notes: string;
  priority: number;
  threat_level: 'high' | 'medium' | 'low';
  metrics?: {
    domain_authority: number;
    organic_traffic: number;
    backlinks: number;
    keywords: number;
    top_keywords: string[];
  };
  trend_history?: {
    date: string;           // YYYY-MM-DD
    visibility_score: number;
    traffic_estimate: number;
  }[];
  last_analyzed: string;   // ISO date
  created_at: string;
  updated_at: string;
}

interface ComparisonData {
  my_domain: {
    metrics: Metrics;
    trend_history: TrendPoint[];
  };
  competitors_selected: {
    competitor_id: string;
    metrics: Metrics;
    trend_history: TrendPoint[];
  }[];
}
```

### Key Component: Insights Drawer

```tsx
interface CompetitorInsightsDrawerProps {
  competitor: Competitor | null;
  isOpen: boolean;
  onClose: () => void;
  onCompare: (competitorId: string) => void;
  comparisonData?: ComparisonData;
}

export function CompetitorInsightsDrawer({
  competitor,
  isOpen,
  onClose,
  onCompare,
  comparisonData,
}: CompetitorInsightsDrawerProps) {
  if (!competitor || !isOpen) return null;

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="fixed right-0 top-0 h-screen w-[30%] bg-white shadow-lg border-l overflow-y-auto z-50"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold truncate">{competitor.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{competitor.domain}</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Domain Authority"
            value={competitor.metrics?.domain_authority}
            comparison={comparisonData?.my_domain.metrics.domain_authority}
          />
          <MetricCard
            label="Organic Traffic"
            value={competitor.metrics?.organic_traffic}
            comparison={comparisonData?.my_domain.metrics.organic_traffic}
            format="number"
          />
          <MetricCard
            label="Backlinks"
            value={competitor.metrics?.backlinks}
          />
          <MetricCard
            label="Keywords"
            value={competitor.metrics?.keywords}
          />
        </div>

        {/* Trend Chart */}
        {competitor.trend_history && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Visibility Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={competitor.trend_history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: 12 }} />
                <YAxis style={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="visibility_score"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground text-center">
              {getTrendDirection(competitor.trend_history)} vs last month
            </div>
          </div>
        )}

        {/* Keywords */}
        {competitor.metrics?.top_keywords && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Top Keywords</h4>
            <div className="space-y-1">
              {competitor.metrics.top_keywords.slice(0, 5).map((kw, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs space-y-1 pt-2 border-t">
          <div>
            <span className="text-muted-foreground">Category:</span>
            <span className="ml-2 font-medium">{competitor.category}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Priority:</span>
            <span className="ml-2 font-medium">{competitor.priority}</span>
          </div>
          {competitor.last_analyzed && (
            <div>
              <span className="text-muted-foreground">Analyzed:</span>
              <span className="ml-2 font-medium">
                {formatDate(competitor.last_analyzed)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => onCompare(competitor.id)}
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Compare with My Domain
          </Button>
          <Button size="sm" className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
```

### Filter System

```typescript
interface CompetitorFilters {
  search: string;
  categories: string[];
  threatLevels: string[];
  discoveredAfter?: Date;
  minDA?: number;
  hasMetrics: boolean;
}

const SAVED_PRESETS = [
  {
    id: 'high-threat',
    name: 'High Threat Competitors',
    filters: { threatLevels: ['high'] },
    icon: AlertTriangle,
  },
  {
    id: 'new',
    name: 'Recently Added',
    filters: { discoveredAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    icon: Zap,
  },
  {
    id: 'analyzed',
    name: 'Analyzed Only',
    filters: { hasMetrics: true },
    icon: CheckCircle,
  },
];

function useCompetitorFilters(allCompetitors: Competitor[]) {
  const [filters, setFilters] = useState<CompetitorFilters>({
    search: '',
    categories: [],
    threatLevels: [],
    hasMetrics: false,
  });

  const filtered = useMemo(() => {
    return allCompetitors.filter((competitor) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !competitor.domain.toLowerCase().includes(searchLower) &&
          !competitor.name.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (filters.categories.length > 0) {
        if (!filters.categories.includes(competitor.category)) {
          return false;
        }
      }

      if (filters.threatLevels.length > 0) {
        if (!filters.threatLevels.includes(competitor.threat_level)) {
          return false;
        }
      }

      if (filters.hasMetrics && !competitor.metrics) {
        return false;
      }

      return true;
    });
  }, [allCompetitors, filters]);

  return { filters, setFilters, filtered };
}
```

### Virtual Scrolling for Performance

```tsx
import { FixedSizeList as List } from 'react-window';

interface CompetitorListProps {
  competitors: Competitor[];
  selectedId?: string;
  onSelect: (competitor: Competitor) => void;
  viewMode: 'list' | 'table' | 'grid';
}

export function CompetitorList({
  competitors,
  selectedId,
  onSelect,
  viewMode,
}: CompetitorListProps) {
  // For small lists, render normally
  if (competitors.length < 50) {
    return (
      <div className="space-y-2">
        {competitors.map((competitor) => (
          <CompetitorListRow
            key={competitor.id}
            competitor={competitor}
            isSelected={competitor.id === selectedId}
            onClick={() => onSelect(competitor)}
          />
        ))}
      </div>
    );
  }

  // For large lists, use virtual scrolling
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <CompetitorListRow
        competitor={competitors[index]}
        isSelected={competitors[index].id === selectedId}
        onClick={() => onSelect(competitors[index])}
      />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={competitors.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### Comparison View

```tsx
interface ComparisonViewProps {
  myDomain: {
    metrics: CompetitorMetrics;
    trend_history: TrendPoint[];
  };
  competitors: Competitor[];
  selectedIds: string[];
}

export function ComparisonView({
  myDomain,
  competitors,
  selectedIds,
}: ComparisonViewProps) {
  const selectedCompetitors = competitors.filter((c) =>
    selectedIds.includes(c.id)
  );

  const chartData = prepareChartData(myDomain, selectedCompetitors);

  return (
    <div className="space-y-6">
      {/* Comparison Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-4">Visibility Trend Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="myDomain"
              stroke="#3b82f6"
              strokeWidth={2}
              name="My Domain"
            />
            {selectedCompetitors.map((competitor, idx) => (
              <Line
                key={competitor.id}
                type="monotone"
                dataKey={competitor.domain}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics Table */}
      <div className="bg-white p-4 rounded-lg border overflow-x-auto">
        <h3 className="font-semibold mb-4">Metrics Comparison</h3>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2 font-medium">Metric</th>
              <th className="text-center py-2 font-medium">My Domain</th>
              {selectedCompetitors.map((c) => (
                <th key={c.id} className="text-center py-2 font-medium">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">Domain Authority</td>
              <td className="text-center font-medium">
                {myDomain.metrics.domain_authority}
              </td>
              {selectedCompetitors.map((c) => (
                <td key={c.id} className="text-center font-medium">
                  {c.metrics?.domain_authority || 'N/A'}
                </td>
              ))}
            </tr>
            {/* More rows... */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Feature Specifications

### 1. Threat Level Calculation

```typescript
function calculateThreatLevel(competitor: Competitor): 'high' | 'medium' | 'low' {
  if (!competitor.metrics) return 'low';

  const threatScore =
    (competitor.metrics.domain_authority * 0.3) +
    (competitor.metrics.organic_traffic / 1000 * 0.4) +
    (competitor.metrics.keywords / 100 * 0.3);

  if (threatScore >= 40) return 'high';
  if (threatScore >= 20) return 'medium';
  return 'low';
}

const THREAT_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-orange-100 text-orange-700 border-orange-200',
  low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};
```

### 2. Bulk Actions

```typescript
interface BulkActionConfig {
  action: 'analyze' | 'export' | 'delete' | 'set_priority';
  selectedIds: string[];
  params?: Record<string, any>;
}

async function executeBulkAction(
  action: BulkActionConfig,
  tenantId: string
) {
  switch (action.action) {
    case 'analyze':
      // Trigger analysis for each competitor
      // Show progress bar
      // Update metrics after each completes
      break;
    case 'export':
      // Export selected competitors as CSV
      break;
    case 'delete':
      // Show confirmation dialog
      // Delete in batch
      break;
    case 'set_priority':
      // Update priority for all selected
      break;
  }
}
```

### 3. Search & Autocomplete

```typescript
function useCompetitorSearch(competitors: Competitor[]) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const matchedDomains = competitors
      .filter((c) =>
        c.domain.toLowerCase().includes(query.toLowerCase()) ||
        c.name.toLowerCase().includes(query.toLowerCase())
      )
      .map((c) => c.domain)
      .slice(0, 5);

    setSuggestions(matchedDomains);
  }, [query, competitors]);

  return { query, setQuery, suggestions };
}
```

---

## Mobile Responsive Design

### Mobile (< 768px)

**List View Only:**
```
┌─────────────────────────┐
│ Search & Filters (icon) │
├─────────────────────────┤
│ Competitor Card         │
│ ┌───────────────────┐   │
│ │ example.com       │   │
│ │ DA: 42 Traffic: 15K   │
│ │ Threat: HIGH      │   │
│ │ [Analyze] [Menu]  │   │
│ └───────────────────┘   │
├─────────────────────────┤
│ Next Competitor         │
└─────────────────────────┘
```

**Insights Overlay:**
- Full-screen bottom sheet
- Swipe down to dismiss
- Simplified layout (hide trend chart on very small screens)
- Single-column metrics

### Tablet (768px - 1024px)

**Two-Column Layout:**
```
┌──────────────┬──────────────┐
│ List (40%)   │ Insights (60%)
│              │
│              │
└──────────────┴──────────────┘
```

- List scrollable independently
- Insights drawer 60% width
- Table view available but limited

---

## Performance Optimization

### 1. Virtual Scrolling

Use `react-window` for lists > 50 items:

```
Estimated item height: 80px
Buffer size: 3 items above/below viewport
Dramatic improvement: 100 items = ~6-8 items rendered instead of 100
```

### 2. Memoization Strategy

```typescript
// Memoize expensive components
const MemoizedCompetitorRow = React.memo(CompetitorListRow, (prev, next) => {
  return (
    prev.competitor.id === next.competitor.id &&
    prev.isSelected === next.isSelected
  );
});

// Memoize filter calculations
const filteredCompetitors = useMemo(() => {
  return applyFilters(allCompetitors, filters);
}, [allCompetitors, filters]);
```

### 3. Data Fetching

```typescript
// Use SWR for cache + revalidation
const { data: competitors, mutate } = useSWR(
  `/api/competitors?tenantId=${tenantId}`,
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
  }
);

// Analyze single competitor with optimistic update
async function analyzeCompetitor(competitorId: string) {
  // Optimistic update
  mutate((data) => ({
    ...data,
    competitors: data.competitors.map((c) =>
      c.id === competitorId ? { ...c, analyzing: true } : c
    ),
  }), false);

  // Fetch
  const response = await fetch(
    `/api/competitors/${competitorId}/analyze`,
    { method: 'POST' }
  );

  // Revalidate
  mutate();
}
```

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

1. **Keyboard Navigation**
   - Tab through competitor list
   - Enter/Space to select
   - Arrow keys to navigate list
   - Escape to close drawer

2. **Screen Reader Support**
   - Semantic HTML structure
   - ARIA labels for icons: `aria-label="Analyze competitor"`
   - ARIA live regions for status: `aria-live="polite"`
   - ARIA description for chart: `aria-describedby="trend-chart-desc"`

3. **Color Contrast**
   - Threat level badges: WCAG AA compliant
   - Text on colored backgrounds: 4.5:1 minimum ratio
   - Icon-only buttons have text labels

4. **Focus Management**
   - Visible focus indicators on all interactive elements
   - Focus trap in drawer
   - Focus moves to dialog when opened

---

## Analytics & Tracking

### Key Metrics to Track

```typescript
// Track user interactions
analytics.track('competitor_viewed', {
  competitor_id: string;
  threat_level: string;
  view_mode: 'list' | 'table' | 'grid';
  drawer_opened: boolean;
  scroll_depth: number; // How far down the list
});

analytics.track('competitor_analyzed', {
  competitor_id: string;
  cost_credits: number;
  status: 'success' | 'failed';
  duration_ms: number;
});

analytics.track('competitor_compared', {
  selected_count: number;
  comparison_type: 'vs_me' | 'vs_other';
  chart_viewed: boolean;
});

analytics.track('filter_applied', {
  filter_type: 'search' | 'category' | 'threat_level' | 'preset';
  filter_value: string;
  result_count: number;
});
```

---

## Transition Plan from Current State

### Phase 1: Data Enhancement (Week 1-2)

1. Extend API to return trend_history and threat_level
2. Add analytics/tracking events
3. Extend database schema if needed

### Phase 2: UI Components (Week 2-3)

1. Build view mode toggle
2. Create insights drawer component
3. Implement virtual scrolling
4. Create filter system

### Phase 3: Integration (Week 3-4)

1. Integrate new components into existing panel
2. Wire up all interactions
3. Test responsive behavior
4. Performance optimization

### Phase 4: Polish & Launch (Week 4-5)

1. Accessibility review
2. Mobile testing on real devices
3. Analytics instrumentation
4. Documentation & release notes

---

## Future Enhancements

### Short Term (Q1)

- Competitor email alerts ("Your top competitor ranked for X keyword")
- Automated keyword gap analysis
- Content strategy recommendations
- Export to PDF/CSV reports

### Medium Term (Q2)

- Competitor monitoring: automatic re-analysis on schedule
- Seasonal trend detection and forecasting
- Market share estimation
- Competitor grouping/clustering

### Long Term (Q3+)

- ML-powered threat prediction
- Collaborative features (team analysis notes)
- Integration with marketing automation tools
- Custom metrics and KPIs

---

## Resources & References

### Benchmark Competitors

- **Ahrefs**: Competitor profile with overlaid metrics
- **SEMrush**: Domain overview with keyword filtering
- **Moz**: Competitor tracking with automated updates
- **SimilarWeb**: Traffic analysis and trend visualization

### Design System

- Tailwind CSS: Utility-first styling
- shadcn/ui: Accessible component library
- Recharts: React chart library
- Lucide Icons: Clean icon set

### Component Libraries

- `react-window`: Virtual scrolling
- `framer-motion`: Smooth animations
- `zustand`: State management
- `zod`: Schema validation

---

## Acceptance Criteria

### User Experience

- [ ] List shows 20+ competitors without performance degradation
- [ ] Insights drawer opens within 100ms
- [ ] Filter application shows results within 50ms
- [ ] Mobile experience is equivalent in functionality

### Performance

- [ ] Time to Interactive (TTI): < 2 seconds
- [ ] Lighthouse Performance Score: > 85
- [ ] Virtual scrolling handles 200+ items smoothly
- [ ] No layout shift (CLS < 0.1)

### Accessibility

- [ ] WCAG 2.1 AA compliance validated
- [ ] Keyboard-only navigation works completely
- [ ] Screen reader testing passes with 3+ readers
- [ ] Color contrast ratios meet 4.5:1 minimum

### Analytics

- [ ] All user interactions tracked
- [ ] Heatmap shows where users click most
- [ ] Funnel analysis: Add → Analyze → Compare
- [ ] A/B test view mode preferences

---

## Questions to Clarify

1. **Trend Data Source**: How will historical data be collected? Manual analysis requests or automated monitoring?
2. **Comparison Frequency**: How often should we refresh competitor metrics automatically?
3. **Export Needs**: What formats should bulk export support? (CSV, PDF, Excel)
4. **Collaboration**: Should teams be able to comment/share insights on competitors?
5. **AI Insights**: Should we provide AI-generated competitive summary/recommendations?
6. **Integration**: Any plans to connect with existing SEO tools (Ahrefs API, DataForSEO)?

---

## Conclusion

Solution 1 (Hybrid List + Table + Insights Drawer) provides the best balance of scalability, usability, and implementation complexity. It leverages existing UI patterns from your codebase (shadcn/ui, Recharts) and provides a modern SaaS experience that rivals industry leaders in competitive intelligence.

The design prioritizes:
- Progressive disclosure (show summary, drill into details on demand)
- Mobile-first responsive behavior
- Performance through virtual scrolling
- Accessibility as a core requirement
- Clear workflows for common user tasks

Implementation can proceed incrementally in 4-5 weeks with proper phasing.

