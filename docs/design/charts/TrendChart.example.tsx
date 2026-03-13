/**
 * TrendChart Example Implementation
 *
 * This file demonstrates the glassmorphism chart redesign.
 * Copy relevant sections to the actual TrendChart.tsx component.
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  Eye,
  Search,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// =============================================================================
// TYPES
// =============================================================================

interface ChartDataPoint {
  date: string;
  visibility: number;
  mentions?: number;
  [key: string]: number | string | undefined;
}

type ChartType = "recognition" | "organic";

interface TrendChartProps {
  data: ChartDataPoint[];
  chartType?: ChartType;
  showTypeToggle?: boolean;
  title?: string;
  loading?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CHART_TYPE_CONFIG = {
  recognition: {
    label: "Recognition",
    icon: Eye,
    color: "#6366f1",
    colorLight: "#818cf8",
    gradient: "recognitionGradient",
    bgActive: "bg-indigo-500",
  },
  organic: {
    label: "AI Traffic",
    icon: Search,
    color: "#10b981",
    colorLight: "#34d399",
    gradient: "organicGradient",
    bgActive: "bg-emerald-500",
  },
};

const PERIOD_OPTIONS = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
];

// =============================================================================
// CUSTOM TOOLTIP COMPONENT
// =============================================================================

interface CustomTooltipPayload {
  color: string;
  value: number;
  name: string;
  dataKey: string;
}

const GlassTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl",
        "bg-white/95 backdrop-blur-md",
        "border border-white/40",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
      )}
    >
      <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
      <div className="space-y-1.5">
        {(payload as CustomTooltipPayload[]).map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-bold text-gray-900">
              {typeof entry.value === "number"
                ? entry.value.toFixed(1)
                : entry.value}
              %
            </span>
            <span className="text-xs text-gray-500">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// ANIMATED COUNTER COMPONENT
// =============================================================================

const AnimatedCounter = ({
  value,
  suffix = "%",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className={className}>
      {displayValue}
      {suffix}
    </span>
  );
};

// =============================================================================
// CHANGE BADGE COMPONENT
// =============================================================================

const ChangeBadge = ({ change }: { change: number }) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
        isNeutral
          ? "bg-gray-100 text-gray-600"
          : isPositive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700",
      )}
    >
      {isNeutral ? (
        <Minus className="w-3 h-3" />
      ) : isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? "+" : ""}
      {change.toFixed(0)}%
    </span>
  );
};

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

const StatCard = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string | number;
  colorClass?: string;
}) => (
  <div
    className={cn(
      "text-center p-3 rounded-xl",
      "bg-white/50 backdrop-blur-sm",
      "border border-white/30",
      "transition-all duration-200",
      "hover:bg-white/70 hover:border-gray-200/50 hover:shadow-sm",
    )}
  >
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className={cn("text-lg font-bold", colorClass || "text-gray-900")}>
      {value}
    </p>
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TrendChartExample({
  data,
  chartType: initialChartType = "recognition",
  showTypeToggle = false,
  title,
  loading = false,
}: TrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [period, setPeriod] = useState(30);

  const config = CHART_TYPE_CONFIG[chartType];

  // Calculate stats
  const stats = useMemo(() => {
    if (!data.length) return null;

    const current = data[data.length - 1]?.visibility || 0;
    const first = data[0]?.visibility || 0;
    const avg =
      data.reduce((sum, d) => sum + d.visibility, 0) / data.length || 0;
    const change = current - first;
    const totalMentions = data.reduce((sum, d) => sum + (d.mentions || 0), 0);

    return { current, avg, change, totalMentions };
  }, [data]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        <div className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "rounded-2xl",
        "bg-white/80 backdrop-blur-md",
        "border border-white/20",
        "shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
        "transition-all duration-200",
        "hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]",
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          {/* Left side: Title + Current Score */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-semibold text-gray-900">
                {title || `${config.label} Trend`}
              </h3>
              <TooltipProvider>
                <ShadcnTooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[280px]">
                    <p className="text-xs">
                      Track your {config.label.toLowerCase()} visibility over
                      time.
                    </p>
                  </TooltipContent>
                </ShadcnTooltip>
              </TooltipProvider>
            </div>

            {stats && (
              <div className="flex items-baseline gap-3">
                <AnimatedCounter
                  value={stats.current}
                  className="text-4xl font-bold text-gray-900"
                />
                <ChangeBadge change={stats.change} />
              </div>
            )}
            {stats && (
              <p className="text-sm text-gray-500 mt-1">vs previous period</p>
            )}
          </div>

          {/* Right side: Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Type toggle */}
            {showTypeToggle && (
              <div className="flex gap-1 p-1 rounded-xl bg-gray-100/60 backdrop-blur-sm">
                {(Object.keys(CHART_TYPE_CONFIG) as ChartType[]).map((type) => {
                  const typeConfig = CHART_TYPE_CONFIG[type];
                  const Icon = typeConfig.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        chartType === type
                          ? cn("text-white shadow-sm", typeConfig.bgActive)
                          : "text-gray-500 hover:text-gray-700",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {typeConfig.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Period selector */}
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
          </div>
        </div>

        {/* Chart */}
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 text-sm">
              No data yet. Run checks to build history.
            </p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  {/* Recognition gradient - 3 stops for smooth fade */}
                  <linearGradient
                    id="recognitionGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop
                      offset="100%"
                      stopColor="#6366f1"
                      stopOpacity={0.02}
                    />
                  </linearGradient>

                  {/* AI Traffic gradient - 3 stops for smooth fade */}
                  <linearGradient
                    id="organicGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.12} />
                    <stop
                      offset="100%"
                      stopColor="#10b981"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb", strokeOpacity: 0.5 }}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb", strokeOpacity: 0.5 }}
                  tickFormatter={(v) => `${v}%`}
                  width={40}
                />

                <Tooltip content={<GlassTooltip />} />

                <Area
                  type="monotone"
                  dataKey="visibility"
                  stroke={config.color}
                  strokeWidth={2.5}
                  fill={`url(#${config.gradient})`}
                  name={config.label}
                  animationBegin={0}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats Footer */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-gray-100/50">
            <StatCard
              label="Current"
              value={`${stats.current.toFixed(0)}%`}
              colorClass={`text-[${config.color}]`}
            />
            <StatCard
              label="Average"
              value={`${stats.avg.toFixed(0)}%`}
              colorClass="text-gray-700"
            />
            <StatCard
              label="Change"
              value={`${stats.change >= 0 ? "+" : ""}${stats.change.toFixed(0)}%`}
              colorClass={
                stats.change > 0
                  ? "text-emerald-600"
                  : stats.change < 0
                    ? "text-red-600"
                    : "text-gray-700"
              }
            />
            <StatCard
              label="Mentions"
              value={stats.totalMentions.toLocaleString()}
              colorClass="text-gray-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// DEMO DATA
// =============================================================================

export const DEMO_DATA: ChartDataPoint[] = [
  { date: "Dec 1", visibility: 45, mentions: 12 },
  { date: "Dec 8", visibility: 52, mentions: 18 },
  { date: "Dec 15", visibility: 48, mentions: 15 },
  { date: "Dec 22", visibility: 61, mentions: 24 },
  { date: "Dec 29", visibility: 58, mentions: 21 },
  { date: "Jan 5", visibility: 72, mentions: 32 },
];

export default TrendChartExample;
