# Competitive Intelligence Dashboard - Ready-to-Copy Component Code

This document contains production-ready component code snippets for Solution 1 (Hybrid).
**All code is TypeScript + React 18 + Tailwind CSS + shadcn/ui compatible**

---

## Table of Contents

1. [Data Types & Utilities](#data-types--utilities)
2. [Toolbar Components](#toolbar-components)
3. [List Components](#list-components)
4. [Drawer Component](#drawer-component)
5. [Hooks](#hooks)
6. [Utils & Helpers](#utils--helpers)

---

## Data Types & Utilities

### competitor-types.ts

```typescript
// app/dashboard/lib/competitor-types.ts

export type ThreatLevel = 'high' | 'medium' | 'low';
export type CompetitorCategory =
  | 'direct'
  | 'indirect'
  | 'aspirational'
  | 'content'
  | 'local';
export type ViewMode = 'list' | 'table' | 'grid';
export type SortField = 'name' | 'priority' | 'threat' | 'traffic' | 'da';
export type SortOrder = 'asc' | 'desc';

export interface CompetitorMetrics {
  domain_authority?: number;
  organic_traffic?: number;
  backlinks?: number;
  keywords?: number;
  top_keywords?: string[];
  visibility_score?: number;
}

export interface TrendPoint {
  date: string;
  visibility_score: number;
  traffic_estimate?: number;
  da_estimate?: number;
}

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
  last_analyzed?: string;
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
  icon: React.ComponentType<any>;
  description: string;
}

export interface ComparisonData {
  myDomain: {
    metrics: CompetitorMetrics;
    trend_history: TrendPoint[];
  };
  competitors: Competitor[];
}

export interface SortState {
  field: SortField;
  order: SortOrder;
}
```

### threat-calculator.ts

```typescript
// app/dashboard/lib/threat-calculator.ts

import { Competitor, ThreatLevel, CompetitorMetrics } from './competitor-types';

export function calculateThreatLevel(competitor: Competitor): ThreatLevel {
  if (!competitor.metrics) return 'low';

  const { domain_authority = 0, organic_traffic = 0, keywords = 0 } =
    competitor.metrics;

  const threatScore =
    domain_authority * 0.3 +
    (organic_traffic / 1000) * 0.4 +
    (keywords / 100) * 0.3;

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

export function getThreatBadgeVariant(threat: ThreatLevel): 'default' | 'secondary' | 'destructive' {
  switch (threat) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'default';
  }
}

export function formatMetric(
  value: number | undefined,
  format: 'number' | 'percent' | 'short' = 'number'
): string {
  if (value === undefined || value === null) return 'N/A';

  if (format === 'percent') {
    return `${value.toFixed(1)}%`;
  }

  if (format === 'short') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  }

  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function getTrendDirection(history: TrendPoint[] | undefined): string {
  if (!history || history.length < 2) return 'No trend data';

  const recent = history[history.length - 1].visibility_score;
  const previous = history[history.length - 2].visibility_score;
  const change = recent - previous;
  const percent = ((change / previous) * 100).toFixed(1);

  if (change > 0) {
    return `↑ ${percent}%`;
  } else if (change < 0) {
    return `↓ ${Math.abs(parseFloat(percent))}%`;
  }
  return '→ No change';
}
```

---

## Toolbar Components

### SearchInput.tsx

```typescript
// app/dashboard/components/toolbar/SearchInput.tsx

'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search competitors...',
  onClear,
}: SearchInputProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
        aria-label="Search competitors"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 h-full px-3"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
```

### ViewModeToggle.tsx

```typescript
// app/dashboard/components/toolbar/ViewModeToggle.tsx

'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutList, LayoutGrid, Table2 } from 'lucide-react';
import { ViewMode } from '../../lib/competitor-types';

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
      className="border rounded-lg bg-background"
      aria-label="View mode"
    >
      <ToggleGroupItem value="list" aria-label="List view" title="List view">
        <LayoutList className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="table"
        aria-label="Table view"
        title="Table view"
        disabled
      >
        <Table2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Grid view" title="Grid view" disabled>
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

### BulkActionsMenu.tsx

```typescript
// app/dashboard/components/toolbar/BulkActionsMenu.tsx

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Zap, Download, Trash2 } from 'lucide-react';

interface BulkActionsMenuProps {
  selectedCount: number;
  onAnalyzeAll?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export function BulkActionsMenu({
  selectedCount,
  onAnalyzeAll,
  onExport,
  onDelete,
  disabled = false,
}: BulkActionsMenuProps) {
  if (selectedCount === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          title={`${selectedCount} competitor(s) selected`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          {selectedCount} selected
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onAnalyzeAll && (
          <DropdownMenuItem onClick={onAnalyzeAll}>
            <Zap className="h-4 w-4 mr-2" />
            Analyze All
          </DropdownMenuItem>
        )}
        {onExport && (
          <DropdownMenuItem onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## List Components

### CompetitorListRow.tsx

```typescript
// app/dashboard/components/list/CompetitorListRow.tsx

'use client';

import { Competitor } from '../../lib/competitor-types';
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
  Copy,
} from 'lucide-react';
import { formatMetric, getThreatColor } from '../../lib/threat-calculator';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface CompetitorListRowProps {
  competitor: Competitor;
  isSelected: boolean;
  isChecked?: boolean;
  onSelect: (competitor: Competitor) => void;
  onCheck?: (id: string, checked: boolean) => void;
  onEdit?: (competitor: Competitor) => void;
  onDelete?: (competitor: Competitor) => void;
  onAnalyze?: (competitor: Competitor) => void;
  onCompare?: (competitor: Competitor) => void;
}

export function CompetitorListRow({
  competitor,
  isSelected,
  isChecked = false,
  onSelect,
  onCheck,
  onEdit,
  onDelete,
  onAnalyze,
  onCompare,
}: CompetitorListRowProps) {
  const { toast } = useToast();

  const handleCopyDomain = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(competitor.domain);
    toast({
      title: 'Copied',
      description: `${competitor.domain} copied to clipboard`,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(competitor)}
      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-200'
          : 'bg-white hover:bg-gray-50/50 border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Checkbox */}
      {onCheck && (
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => {
            onCheck(competitor.id, Boolean(checked));
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
          aria-label={`Select ${competitor.name}`}
        />
      )}

      {/* Priority Indicator */}
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-700 shrink-0 mt-0.5 border border-slate-300">
        {competitor.priority}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-semibold text-sm truncate">{competitor.name}</h4>
          <Badge
            variant="outline"
            className={`text-xs font-medium ${getThreatColor(competitor.threat_level)}`}
          >
            {competitor.threat_level.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {competitor.category}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <ExternalLink className="h-3 w-3 shrink-0" />
          <a
            href={`https://${competitor.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:text-blue-600 hover:underline truncate"
            title={competitor.domain}
          >
            {competitor.domain}
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={handleCopyDomain}
            title="Copy domain"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        {/* Metrics Preview */}
        {competitor.metrics && (
          <div className="flex flex-wrap gap-3 text-xs">
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
                  {formatMetric(competitor.metrics.organic_traffic, 'short')}
                </span>
              </div>
            )}
            {competitor.metrics.keywords !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">KW:</span>
                <span className="font-semibold">
                  {formatMetric(competitor.metrics.keywords, 'short')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Last Analyzed */}
        {competitor.last_analyzed && (
          <p className="text-xs text-muted-foreground mt-2">
            Analyzed: {new Date(competitor.last_analyzed).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCompare?.(competitor)}
          title="Compare with my domain"
          className="hover:bg-blue-100"
        >
          <ArrowLeftRight className="h-4 w-4 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAnalyze?.(competitor)}
          title="Analyze competitor"
          className="hover:bg-green-100"
        >
          <Search className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit?.(competitor)}
          title="Edit"
          className="hover:bg-gray-100"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(competitor)}
          title="Delete"
          className="text-destructive hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
```

---

## Drawer Component

### CompetitorInsightsDrawer.tsx

```typescript
// app/dashboard/components/drawer/CompetitorInsightsDrawer.tsx

'use client';

import { Competitor } from '../../lib/competitor-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, ArrowLeftRight, BarChart3, Zap } from 'lucide-react';
import { formatMetric, getThreatColor, getTrendDirection } from '../../lib/threat-calculator';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

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
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

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
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-sm bg-white shadow-2xl border-l overflow-y-auto z-50"
            role="dialog"
            aria-labelledby="drawer-title"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-white border-b p-4 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 id="drawer-title" className="font-semibold text-sm truncate">
                  {competitor.name}
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {competitor.domain}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Threat Badge */}
              <Badge
                variant="outline"
                className={`${getThreatColor(competitor.threat_level)} font-semibold`}
              >
                {competitor.threat_level.toUpperCase()} THREAT
              </Badge>

              {/* Metrics Cards Grid */}
              {competitor.metrics && (
                <div className="grid grid-cols-2 gap-3">
                  {competitor.metrics.domain_authority !== undefined && (
                    <Card className="p-3 bg-gradient-to-br from-slate-50 to-slate-100">
                      <p className="text-xs text-muted-foreground font-medium">
                        Domain Authority
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {competitor.metrics.domain_authority}
                      </p>
                    </Card>
                  )}
                  {competitor.metrics.organic_traffic !== undefined && (
                    <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100">
                      <p className="text-xs text-muted-foreground font-medium">
                        Organic Traffic
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {formatMetric(competitor.metrics.organic_traffic, 'short')}
                      </p>
                    </Card>
                  )}
                  {competitor.metrics.backlinks !== undefined && (
                    <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100">
                      <p className="text-xs text-muted-foreground font-medium">
                        Backlinks
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {formatMetric(competitor.metrics.backlinks, 'short')}
                      </p>
                    </Card>
                  )}
                  {competitor.metrics.keywords !== undefined && (
                    <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100">
                      <p className="text-xs text-muted-foreground font-medium">
                        Keywords
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {formatMetric(competitor.metrics.keywords, 'short')}
                      </p>
                    </Card>
                  )}
                </div>
              )}

              {/* Trend Info */}
              {competitor.trend_history && competitor.trend_history.length > 0 && (
                <Card className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs font-semibold text-purple-900">
                        Visibility Trend
                      </p>
                      <p className="text-sm font-bold text-purple-700">
                        {getTrendDirection(competitor.trend_history)}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Keywords */}
              {competitor.metrics?.top_keywords && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Top Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {competitor.metrics.top_keywords.slice(0, 8).map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {competitor.notes && (
                <div className="space-y-2 p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                  <h4 className="text-sm font-semibold text-amber-900">Notes</h4>
                  <p className="text-xs text-amber-800">{competitor.notes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs space-y-2 p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">
                    {competitor.category.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="font-medium">{competitor.priority}</span>
                </div>
                {competitor.last_analyzed && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Analyzed:</span>
                    <span className="font-medium">
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
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

## Hooks

### useCompetitorFilters.ts

```typescript
// app/dashboard/hooks/useCompetitorFilters.ts

import { useState, useMemo, useCallback } from 'react';
import { Competitor, CompetitorFilters, FilterPreset } from '../lib/competitor-types';
import { AlertTriangle, Zap, CheckCircle } from 'lucide-react';

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'high-threat',
    name: 'High Threat',
    description: 'Only high-threat competitors',
    filters: { threatLevels: ['high'] },
    icon: AlertTriangle,
  },
  {
    id: 'new',
    name: 'Recently Added',
    description: 'Added in the last 7 days',
    filters: { discoveredAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    icon: Zap,
  },
  {
    id: 'analyzed',
    name: 'Analyzed Only',
    description: 'Only competitors with metrics',
    filters: { hasMetrics: true },
    icon: CheckCircle,
  },
];

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
        const matches =
          competitor.domain.toLowerCase().includes(searchLower) ||
          competitor.name.toLowerCase().includes(searchLower) ||
          competitor.notes.toLowerCase().includes(searchLower);

        if (!matches) return false;
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

  const addFilter = useCallback(
    (filterKey: keyof CompetitorFilters, value: any) => {
      setFilters((prev) => {
        if (Array.isArray(prev[filterKey])) {
          const arr = prev[filterKey] as any[];
          const newValue = arr.includes(value)
            ? arr.filter((item) => item !== value)
            : [...arr, value];
          return { ...prev, [filterKey]: newValue };
        }
        return { ...prev, [filterKey]: value };
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      categories: [],
      threatLevels: [],
    });
  }, []);

  const applyPreset = useCallback((preset: FilterPreset) => {
    setFilters((prev) => ({ ...prev, ...preset.filters }));
  }, []);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return {
    filters,
    setFilters,
    filtered,
    addFilter,
    resetFilters,
    applyPreset,
    activeFilterCount,
    presets: FILTER_PRESETS,
  };
}
```

### useCompetitorComparison.ts

```typescript
// app/dashboard/hooks/useCompetitorComparison.ts

import { useState, useMemo, useCallback } from 'react';
import { Competitor } from '../lib/competitor-types';

export function useCompetitorComparison(allCompetitors: Competitor[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedCompetitors = useMemo(() => {
    return allCompetitors.filter((c) => selectedIds.includes(c.id));
  }, [allCompetitors, selectedIds]);

  const toggleCompetitor = useCallback((competitorId: string) => {
    setSelectedIds((prev) => {
      const maxSelection = 3;

      if (prev.includes(competitorId)) {
        return prev.filter((id) => id !== competitorId);
      }

      if (prev.length >= maxSelection) {
        // Replace the first one
        return [...prev.slice(1), competitorId];
      }

      return [...prev, competitorId];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const canAddMore = selectedIds.length < 3;

  return {
    selectedIds,
    selectedCompetitors,
    toggleCompetitor,
    clearSelection,
    canAddMore,
    selectionCount: selectedIds.length,
  };
}
```

---

## Utils & Helpers

### competitor-utils.ts

```typescript
// app/dashboard/lib/competitor-utils.ts

import { Competitor, SortState, SortField, SortOrder } from './competitor-types';

export function sortCompetitors(
  competitors: Competitor[],
  sortState: SortState
): Competitor[] {
  const { field, order } = sortState;

  const sorted = [...competitors].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (field) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'priority':
        aValue = a.priority;
        bValue = b.priority;
        break;
      case 'threat':
        const threatOrder = { high: 3, medium: 2, low: 1 };
        aValue = threatOrder[a.threat_level];
        bValue = threatOrder[b.threat_level];
        break;
      case 'traffic':
        aValue = a.metrics?.organic_traffic || 0;
        bValue = b.metrics?.organic_traffic || 0;
        break;
      case 'da':
        aValue = a.metrics?.domain_authority || 0;
        bValue = b.metrics?.domain_authority || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return sorted;
}

export function groupCompetitorsByCategory(
  competitors: Competitor[]
): Record<string, Competitor[]> {
  return competitors.reduce(
    (acc, competitor) => {
      const category = competitor.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(competitor);
      return acc;
    },
    {} as Record<string, Competitor[]>
  );
}

export function getCompetitorStats(competitors: Competitor[]) {
  const withMetrics = competitors.filter((c) => c.metrics);
  const avgDA = withMetrics.length
    ? withMetrics.reduce((sum, c) => sum + (c.metrics?.domain_authority || 0), 0) /
      withMetrics.length
    : 0;
  const avgTraffic = withMetrics.length
    ? withMetrics.reduce((sum, c) => sum + (c.metrics?.organic_traffic || 0), 0) /
      withMetrics.length
    : 0;

  return {
    total: competitors.length,
    analyzed: withMetrics.length,
    highThreat: competitors.filter((c) => c.threat_level === 'high').length,
    mediumThreat: competitors.filter((c) => c.threat_level === 'medium').length,
    lowThreat: competitors.filter((c) => c.threat_level === 'low').length,
    avgDA: Math.round(avgDA),
    avgTraffic: Math.round(avgTraffic),
  };
}

export function exportCompetitorsAsCSV(competitors: Competitor[]): string {
  const headers = [
    'Domain',
    'Name',
    'Category',
    'Priority',
    'Threat Level',
    'Domain Authority',
    'Organic Traffic',
    'Backlinks',
    'Keywords',
    'Last Analyzed',
  ];

  const rows = competitors.map((c) => [
    c.domain,
    c.name,
    c.category,
    c.priority,
    c.threat_level,
    c.metrics?.domain_authority || 'N/A',
    c.metrics?.organic_traffic || 'N/A',
    c.metrics?.backlinks || 'N/A',
    c.metrics?.keywords || 'N/A',
    c.last_analyzed ? new Date(c.last_analyzed).toLocaleDateString() : 'N/A',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          return str.includes(',') ? `"${str}"` : str;
        })
        .join(',')
    ),
  ].join('\n');

  return csv;
}

export function downloadCSV(csv: string, filename = 'competitors.csv') {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
```

---

## Installation & Dependencies

```bash
# Required packages (should already be installed)
npm install framer-motion react-window lucide-react

# Peer dependencies
npm install react@18 react-dom@18 tailwindcss

# shadcn/ui components (if not already installed)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add toggle-group
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add dropdown-menu
```

---

## Usage Example

```typescript
// app/dashboard/insights/page.tsx

'use client';

import { CompetitorIntelligenceDashboard } from '@/app/dashboard/components/CompetitorIntelligenceDashboard';
import { useUser } from '@/hooks/use-user';

export default function CompetitorsPage() {
  const { tenantId } = useUser();

  if (!tenantId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Competitive Intelligence</h1>
        <p className="text-muted-foreground">
          Analyze and track your competitors
        </p>
      </div>

      <CompetitorIntelligenceDashboard tenantId={tenantId} />
    </div>
  );
}
```

---

## Next Steps

1. **Copy components** into your project structure
2. **Install dependencies** as shown above
3. **Update imports** to match your project paths
4. **Test with mock data** before connecting to real API
5. **Iterate and refine** based on user feedback

All code is production-ready and follows React 18 best practices!

