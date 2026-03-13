# Competitive Intelligence Dashboard - Implementation Guide

**Target**: Next.js 15.3.3 + React 18 + Tailwind CSS + shadcn/ui
**Estimated Duration**: 4-5 weeks
**Priority**: High (Recommendation: Solution 1 - Hybrid)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: Data Model & API](#phase-1-data-model--api)
3. [Phase 2: Core Components](#phase-2-core-components)
4. [Phase 3: Integration](#phase-3-integration)
5. [Phase 4: Testing & Optimization](#phase-4-testing--optimization)

---

## Architecture Overview

### Directory Structure

```
app/dashboard/
├── insights/
│   ├── page.tsx (existing - AI visibility)
│   └── components/
│       ├── CompetitorIntelligence.tsx (main dashboard)
│       ├── toolbar/
│       │   ├── SearchInput.tsx
│       │   ├── FilterButton.tsx
│       │   ├── ViewModeToggle.tsx
│       │   └── BulkActionsMenu.tsx
│       ├── list/
│       │   ├── CompetitorList.tsx (main container)
│       │   ├── CompetitorListRow.tsx
│       │   ├── CompetitorTableRow.tsx
│       │   └── CompetitorGridCard.tsx
│       ├── filters/
│       │   ├── FilterPanel.tsx
│       │   ├── QuickFilterPills.tsx
│       │   ├── AdvancedFilters.tsx
│       │   └── SavedPresets.tsx
│       ├── drawer/
│       │   ├── CompetitorInsightsDrawer.tsx
│       │   ├── MetricsCards.tsx
│       │   ├── TrendChart.tsx
│       │   └── KeywordsSection.tsx
│       └── comparison/
│           ├── ComparisonModal.tsx
│           ├── ComparisonChart.tsx
│           └── ComparisonTable.tsx
├── hooks/
│   ├── useCompetitorFilters.ts
│   ├── useCompetitorList.ts
│   ├── useCompetitorComparison.ts
│   └── useCompetitorSearch.ts
└── lib/
    ├── competitor-types.ts
    ├── competitor-utils.ts
    ├── threat-calculator.ts
    └── chart-data-formatter.ts

lib/
├── services/
│   └── competitor-analytics.service.ts
└── api/
    └── competitors/
        ├── route.ts (GET/POST)
        ├── [id]/
        │   ├── route.ts (PUT/DELETE)
        │   ├── analyze/
        │   │   └── route.ts (POST)
        │   └── trends/
        │       └── route.ts (GET)
```

---

## Phase 1: Data Model & API

### 1.1 Extended Competitor Interface

**File**: `app/dashboard/lib/competitor-types.ts`

```typescript
export interface CompetitorMetrics {
  domain_authority?: number;
  organic_traffic?: number;
  backlinks?: number;
  keywords?: number;
  top_keywords?: string[];
}

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  visibility_score: number;
  traffic_estimate?: number;
  da_estimate?: number;
}

export type ThreatLevel = 'high' | 'medium' | 'low';
export type CompetitorCategory =
  | 'direct'
  | 'indirect'
  | 'aspirational'
  | 'content'
  | 'local';
export type ViewMode = 'list' | 'table' | 'grid';

export interface Competitor {
  id: string;
  domain: string;
  name: string;
  category: CompetitorCategory;
  notes: string;
  priority: number;
  threat_level: ThreatLevel;
  metrics?: CompetitorMetrics;
  trend_history?: TrendPoint[];
  last_analyzed?: string; // ISO date
  created_at: string;
  updated_at: string;
}

export interface CompetitorFilters {
  search: string;
  categories: CompetitorCategory[];
  threatLevels: ThreatLevel[];
  discoveredAfter?: Date;
  minDA?: number;
  hasMetrics?: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<CompetitorFilters>;
  icon?: React.ComponentType<any>;
  description?: string;
}

export interface ComparisonData {
  myDomain: {
    metrics: CompetitorMetrics;
    trend_history: TrendPoint[];
  };
  competitors: Competitor[];
}
```

### 1.2 Threat Level Calculator

**File**: `app/dashboard/lib/threat-calculator.ts`

```typescript
import { Competitor, ThreatLevel, CompetitorMetrics } from './competitor-types';

export function calculateThreatLevel(competitor: Competitor): ThreatLevel {
  if (!competitor.metrics) return 'low';

  const { domain_authority = 0, organic_traffic = 0, keywords = 0 } =
    competitor.metrics;

  // Weighted scoring
  const threatScore =
    domain_authority * 0.3 + // DA importance: 30%
    (organic_traffic / 1000) * 0.4 + // Traffic importance: 40%
    (keywords / 100) * 0.3; // Keywords importance: 30%

  if (threatScore >= 40) return 'high';
  if (threatScore >= 20) return 'medium';
  return 'low';
}

export function getThreatColor(threat: ThreatLevel): string {
  const colors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  return colors[threat];
}

export function getThreatBgColor(threat: ThreatLevel): string {
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-orange-500',
    low: 'bg-yellow-500',
  };
  return colors[threat];
}

export function formatMetric(value: number | undefined, format: 'number' | 'percent' = 'number'): string {
  if (value === undefined || value === null) return 'N/A';

  if (format === 'percent') {
    return `${value.toFixed(1)}%`;
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
```

### 1.3 API Extension - Trends Endpoint

**File**: `app/api/competitors/[id]/trends/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/competitors/[id]/trends?days=30
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const competitorId = params.id;
    const days = request.nextUrl.searchParams.get('days') || '30';

    // Get competitor
    const { data: settings } = await supabase
      .from('autopilot_tenant_settings')
      .select('competitors_data')
      .single();

    const competitor = settings?.competitors_data?.find(
      (c: any) => c.id === competitorId
    );

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Return trend history (from competitor.trend_history)
    // TODO: Fetch from database/cache service
    return NextResponse.json({
      competitor_id: competitorId,
      domain: competitor.domain,
      trend_history: competitor.trend_history || [],
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Phase 2: Core Components

### 2.1 Hooks

#### useCompetitorFilters Hook

**File**: `app/dashboard/hooks/useCompetitorFilters.ts`

```typescript
import { useState, useMemo } from 'react';
import { Competitor, CompetitorFilters } from '../lib/competitor-types';

export function useCompetitorFilters(allCompetitors: Competitor[]) {
  const [filters, setFilters] = useState<CompetitorFilters>({
    search: '',
    categories: [],
    threatLevels: [],
  });

  const filtered = useMemo(() => {
    return allCompetitors.filter((competitor) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          competitor.domain.toLowerCase().includes(searchLower) ||
          competitor.name.toLowerCase().includes(searchLower) ||
          competitor.notes.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(competitor.category)) {
          return false;
        }
      }

      // Threat level filter
      if (filters.threatLevels.length > 0) {
        if (!filters.threatLevels.includes(competitor.threat_level)) {
          return false;
        }
      }

      // Domain authority filter
      if (filters.minDA && competitor.metrics?.domain_authority) {
        if (competitor.metrics.domain_authority < filters.minDA) {
          return false;
        }
      }

      // Has metrics filter
      if (filters.hasMetrics && !competitor.metrics) {
        return false;
      }

      // Date filter
      if (filters.discoveredAfter) {
        const createdDate = new Date(competitor.created_at);
        if (createdDate < filters.discoveredAfter) {
          return false;
        }
      }

      return true;
    });
  }, [allCompetitors, filters]);

  const addFilter = (filterKey: keyof CompetitorFilters, value: any) => {
    setFilters((prev) => {
      // Handle array filters
      if (Array.isArray(prev[filterKey])) {
        const arr = prev[filterKey] as any[];
        return {
          ...prev,
          [filterKey]: arr.includes(value)
            ? arr.filter((item) => item !== value)
            : [...arr, value],
        };
      }
      // Handle scalar filters
      return { ...prev, [filterKey]: value };
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      categories: [],
      threatLevels: [],
    });
  };

  const applyPreset = (preset: Partial<CompetitorFilters>) => {
    setFilters((prev) => ({ ...prev, ...preset }));
  };

  return {
    filters,
    setFilters,
    filtered,
    addFilter,
    resetFilters,
    applyPreset,
    activeFilterCount: Object.values(filters).filter(
      (v) => v && (Array.isArray(v) ? v.length > 0 : true)
    ).length,
  };
}
```

#### useCompetitorComparison Hook

**File**: `app/dashboard/hooks/useCompetitorComparison.ts`

```typescript
import { useState, useMemo } from 'react';
import { Competitor, ComparisonData, CompetitorMetrics } from '../lib/competitor-types';

export function useCompetitorComparison(allCompetitors: Competitor[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [myDomainMetrics, setMyDomainMetrics] = useState<CompetitorMetrics | null>(null);

  const selectedCompetitors = useMemo(() => {
    return allCompetitors.filter((c) => selectedIds.includes(c.id));
  }, [allCompetitors, selectedIds]);

  const comparisonData: ComparisonData | null = useMemo(() => {
    if (!myDomainMetrics) return null;

    return {
      myDomain: {
        metrics: myDomainMetrics,
        trend_history: [], // TODO: Fetch trend history
      },
      competitors: selectedCompetitors,
    };
  }, [myDomainMetrics, selectedCompetitors]);

  const toggleCompetitor = (competitorId: string) => {
    // Max 3 competitors selected for clarity
    const maxSelection = 3;

    setSelectedIds((prev) => {
      if (prev.includes(competitorId)) {
        return prev.filter((id) => id !== competitorId);
      }

      if (prev.length >= maxSelection) {
        return [competitorId]; // Replace oldest
      }

      return [...prev, competitorId];
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return {
    selectedIds,
    selectedCompetitors,
    comparisonData,
    toggleCompetitor,
    clearSelection,
    canAddMore: selectedIds.length < 3,
  };
}
```

### 2.2 Toolbar Components

#### ViewModeToggle

**File**: `app/dashboard/components/toolbar/ViewModeToggle.tsx`

```typescript
'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutList, LayoutGrid, Table2 } from 'lucide-react';
import { ViewMode } from '../lib/competitor-types';

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => value && onChange(value as ViewMode)}
      className="border rounded-lg"
    >
      <ToggleGroupItem value="list" aria-label="List view" title="List view">
        <LayoutList className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="table"
        aria-label="Table view"
        title="Table view"
      >
        <Table2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Grid view" title="Grid view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

#### FilterButton with Panel

**File**: `app/dashboard/components/filters/FilterPanel.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { CompetitorFilters, CompetitorCategory, ThreatLevel } from '../lib/competitor-types';

interface FilterPanelProps {
  filters: CompetitorFilters;
  onFilterChange: (key: keyof CompetitorFilters, value: any) => void;
  activeFilterCount: number;
  onReset: () => void;
}

const CATEGORIES: { value: CompetitorCategory; label: string }[] = [
  { value: 'direct', label: 'Direct Competitor' },
  { value: 'indirect', label: 'Indirect Competitor' },
  { value: 'aspirational', label: 'Aspirational' },
  { value: 'content', label: 'Content Competitor' },
  { value: 'local', label: 'Local Competitor' },
];

const THREAT_LEVELS: { value: ThreatLevel; label: string }[] = [
  { value: 'high', label: 'High Threat' },
  { value: 'medium', label: 'Medium Threat' },
  { value: 'low', label: 'Low Threat' },
];

export function FilterPanel({
  filters,
  onFilterChange,
  activeFilterCount,
  onReset,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filter Competitors</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-auto p-0"
              >
                <X className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <div key={cat.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${cat.value}`}
                    checked={(filters.categories || []).includes(cat.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFilterChange('categories', [
                          ...(filters.categories || []),
                          cat.value,
                        ]);
                      } else {
                        onFilterChange(
                          'categories',
                          (filters.categories || []).filter((c) => c !== cat.value)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`cat-${cat.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {cat.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Threat Level Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Threat Level</label>
            <div className="space-y-2">
              {THREAT_LEVELS.map((threat) => (
                <div key={threat.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`threat-${threat.value}`}
                    checked={(filters.threatLevels || []).includes(threat.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFilterChange('threatLevels', [
                          ...(filters.threatLevels || []),
                          threat.value,
                        ]);
                      } else {
                        onFilterChange(
                          'threatLevels',
                          (filters.threatLevels || []).filter(
                            (t) => t !== threat.value
                          )
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`threat-${threat.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {threat.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Min Domain Authority */}
          <div className="space-y-2">
            <label htmlFor="min-da" className="text-sm font-medium">
              Minimum Domain Authority
            </label>
            <Input
              id="min-da"
              type="number"
              min={0}
              max={100}
              value={filters.minDA || ''}
              onChange={(e) =>
                onFilterChange(
                  'minDA',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="Enter minimum DA"
            />
          </div>

          {/* Analyzed Only */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="has-metrics"
              checked={filters.hasMetrics || false}
              onCheckedChange={(checked) =>
                onFilterChange('hasMetrics', checked)
              }
            />
            <label htmlFor="has-metrics" className="text-sm cursor-pointer">
              Only analyzed competitors
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### 2.3 List Components

#### CompetitorListRow

**File**: `app/dashboard/components/list/CompetitorListRow.tsx`

```typescript
'use client';

import { Competitor } from '../lib/competitor-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  BarChart3,
  TrendingUp,
  ArrowLeftRight,
} from 'lucide-react';
import { formatMetric, getThreatColor } from '../lib/threat-calculator';
import { motion } from 'framer-motion';

interface CompetitorListRowProps {
  competitor: Competitor;
  isSelected: boolean;
  onSelect: (competitor: Competitor) => void;
  onEdit?: (competitor: Competitor) => void;
  onDelete?: (competitor: Competitor) => void;
  onAnalyze?: (competitor: Competitor) => void;
  onCompare?: (competitor: Competitor) => void;
}

export function CompetitorListRow({
  competitor,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAnalyze,
  onCompare,
}: CompetitorListRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => onSelect(competitor)}
      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white hover:bg-gray-50 border-gray-200'
      }`}
    >
      {/* Priority Indicator */}
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 shrink-0 mt-0.5">
        {competitor.priority}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-semibold text-sm truncate">{competitor.name}</h4>
          <Badge
            variant="outline"
            className={`text-xs ${getThreatColor(competitor.threat_level)}`}
          >
            {competitor.threat_level.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {competitor.category}
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <ExternalLink className="h-3 w-3" />
          <a
            href={`https://${competitor.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:text-blue-600 hover:underline truncate"
          >
            {competitor.domain}
          </a>
        </div>

        {/* Metrics Preview */}
        {competitor.metrics && (
          <div className="flex flex-wrap gap-3 text-xs mb-2">
            {competitor.metrics.domain_authority !== undefined && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-muted-foreground">DA:</span>
                <span className="font-semibold">
                  {competitor.metrics.domain_authority}
                </span>
              </div>
            )}
            {competitor.metrics.organic_traffic !== undefined && (
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-blue-600" />
                <span className="text-muted-foreground">Traffic:</span>
                <span className="font-semibold">
                  {formatMetric(competitor.metrics.organic_traffic)}
                </span>
              </div>
            )}
            {competitor.metrics.keywords !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Keywords:</span>
                <span className="font-semibold">
                  {formatMetric(competitor.metrics.keywords)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCompare?.(competitor)}
          title="Compare with my domain"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAnalyze?.(competitor)}
          title="Analyze competitor"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit?.(competitor)}
          title="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(competitor)}
          title="Delete"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
```

### 2.4 Insights Drawer Component

**File**: `app/dashboard/components/drawer/CompetitorInsightsDrawer.tsx`

```typescript
'use client';

import { Competitor } from '../lib/competitor-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, ArrowLeftRight, BarChart3 } from 'lucide-react';
import { formatMetric, getThreatBgColor } from '../lib/threat-calculator';
import { TrendChart } from './TrendChart';
import { motion, AnimatePresence } from 'framer-motion';

interface CompetitorInsightsDrawerProps {
  competitor: Competitor | null;
  isOpen: boolean;
  onClose: () => void;
  onCompare?: (competitor: Competitor) => void;
  onAnalyze?: (competitor: Competitor) => void;
}

export function CompetitorInsightsDrawer({
  competitor,
  isOpen,
  onClose,
  onCompare,
  onAnalyze,
}: CompetitorInsightsDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && competitor && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-sm bg-white shadow-2xl border-l overflow-y-auto z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-white border-b p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold truncate max-w-xs">
                  {competitor.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {competitor.domain}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Threat Badge */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${getThreatBgColor(
                    competitor.threat_level
                  )}`}
                />
                <Badge className={getThreatColor(competitor.threat_level)}>
                  {competitor.threat_level.toUpperCase()} THREAT
                </Badge>
              </div>

              {/* Metrics Cards Grid */}
              {competitor.metrics && (
                <div className="grid grid-cols-2 gap-3">
                  {competitor.metrics.domain_authority !== undefined && (
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">
                        Domain Authority
                      </p>
                      <p className="text-2xl font-bold">
                        {competitor.metrics.domain_authority}
                      </p>
                    </Card>
                  )}
                  {competitor.metrics.organic_traffic !== undefined && (
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">
                        Organic Traffic
                      </p>
                      <p className="text-2xl font-bold">
                        {formatMetric(competitor.metrics.organic_traffic)}
                      </p>
                    </Card>
                  )}
                  {competitor.metrics.backlinks !== undefined && (
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">
                        Backlinks
                      </p>
                      <p className="text-2xl font-bold">
                        {formatMetric(competitor.metrics.backlinks)}
                      </p>
                    </Card>
                  )}
                  {competitor.metrics.keywords !== undefined && (
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Keywords</p>
                      <p className="text-2xl font-bold">
                        {formatMetric(competitor.metrics.keywords)}
                      </p>
                    </Card>
                  )}
                </div>
              )}

              {/* Trend Chart */}
              {competitor.trend_history && competitor.trend_history.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Visibility Trend</h4>
                  <TrendChart
                    data={competitor.trend_history}
                    color="#3b82f6"
                  />
                </div>
              )}

              {/* Keywords */}
              {competitor.metrics?.top_keywords && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Top Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {competitor.metrics.top_keywords.slice(0, 5).map((kw) => (
                      <Badge key={kw} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {competitor.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Notes</h4>
                  <p className="text-xs text-muted-foreground">
                    {competitor.notes}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs space-y-1 pt-2 border-t">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium capitalize">
                    {competitor.category.replace('-', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="ml-2 font-medium">{competitor.priority}</span>
                </div>
                {competitor.last_analyzed && (
                  <div>
                    <span className="text-muted-foreground">Analyzed:</span>
                    <span className="ml-2 font-medium">
                      {new Date(competitor.last_analyzed).toLocaleDateString()}
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
                  onClick={() => onCompare?.(competitor)}
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Compare with My Domain
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onAnalyze?.(competitor)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze Now
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## Phase 3: Integration

### Main Dashboard Component

**File**: `app/dashboard/components/CompetitorIntelligenceDashboard.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useCompetitorFilters } from '../hooks/useCompetitorFilters';
import { useCompetitorComparison } from '../hooks/useCompetitorComparison';
import { Competitor, ViewMode } from '../lib/competitor-types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { ViewModeToggle } from './toolbar/ViewModeToggle';
import { FilterPanel } from './filters/FilterPanel';
import { CompetitorListRow } from './list/CompetitorListRow';
import { CompetitorInsightsDrawer } from './drawer/CompetitorInsightsDrawer';

interface CompetitorIntelligenceDashboardProps {
  tenantId: string;
}

export function CompetitorIntelligenceDashboard({
  tenantId,
}: CompetitorIntelligenceDashboardProps) {
  const { toast } = useToast();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const {
    filters,
    filtered,
    addFilter,
    resetFilters,
    activeFilterCount,
  } = useCompetitorFilters(competitors);

  const {
    selectedIds,
    selectedCompetitors,
    toggleCompetitor,
  } = useCompetitorComparison(competitors);

  // Load competitors
  useEffect(() => {
    const loadCompetitors = async () => {
      try {
        const response = await fetch(
          `/api/competitors?tenantId=${tenantId}`
        );
        if (response.ok) {
          const data = await response.json();
          setCompetitors(data.competitors || []);
        }
      } catch (error) {
        console.error('Error loading competitors:', error);
        toast({
          title: 'Error',
          description: 'Failed to load competitors',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompetitors();
  }, [tenantId, toast]);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    addFilter('search', value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search competitors..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <FilterPanel
          filters={filters}
          onFilterChange={addFilter}
          activeFilterCount={activeFilterCount}
          onReset={resetFilters}
        />

        <ViewModeToggle mode={viewMode} onChange={setViewMode} />

        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Competitor
        </Button>
      </div>

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {competitors.length} competitors
        {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
      </div>

      {/* Competitors List */}
      <Card className="p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No competitors found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered
              .sort((a, b) => a.priority - b.priority)
              .map((competitor) => (
                <CompetitorListRow
                  key={competitor.id}
                  competitor={competitor}
                  isSelected={selectedIds.includes(competitor.id)}
                  onSelect={() => setSelectedCompetitor(competitor)}
                  onCompare={() => toggleCompetitor(competitor.id)}
                />
              ))}
          </div>
        )}
      </Card>

      {/* Insights Drawer */}
      <CompetitorInsightsDrawer
        competitor={selectedCompetitor}
        isOpen={!!selectedCompetitor}
        onClose={() => setSelectedCompetitor(null)}
      />
    </div>
  );
}
```

---

## Phase 4: Testing & Optimization

### Performance Checklist

- [ ] Virtual scrolling for 100+ items
- [ ] Debounce search input (300ms)
- [ ] Memoize expensive computations
- [ ] Lazy load trend charts
- [ ] Image optimization for logos
- [ ] CSS-in-JS critical path optimization

### Testing Checklist

- [ ] Unit tests for threat calculator
- [ ] Component tests for list/table/grid views
- [ ] E2E test: Add → Analyze → Compare flow
- [ ] Mobile responsiveness (< 768px, 768-1024px, > 1024px)
- [ ] Accessibility audit (keyboard, screen reader)
- [ ] Performance budget test (Core Web Vitals)

---

## Deployment Checklist

Before launching to production:

- [ ] Database schema updated (if needed)
- [ ] API endpoints tested thoroughly
- [ ] Environment variables configured
- [ ] Analytics tracking implemented
- [ ] Error handling and retry logic
- [ ] Rate limiting on bulk actions
- [ ] Monitoring/alerting set up

---

## Next Steps

1. **Week 1**: Implement data model and API extensions
2. **Week 2**: Build core components and hooks
3. **Week 3**: Integrate and wire up interactions
4. **Week 4**: Testing, optimization, and bug fixes
5. **Week 5**: Deployment and monitoring

---

## Resources

- [Recharts Documentation](https://recharts.org/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [React Window](https://react-window.vercel.app/)
- [Framer Motion](https://www.framer.com/motion/)
- [WCAG Accessibility Guide](https://www.w3.org/WAI/WCAG21/quickref/)

