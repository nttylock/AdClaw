"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import {
  Area,
  AreaChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronDown,
  Plug,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GscDailyMetric, GscSummary } from "@/lib/seo/gsc-metrics";

export type GscPerformanceCardProps = {
  connected: boolean;
  bound: boolean;
  summary?: GscSummary | null;
  timeseries?: GscDailyMetric[] | null;
  domain?: string | null;
  lastSyncAt?: string | null;
  onConnect?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onManage?: () => void;
  className?: string;
};

type ChartPoint = {
  date: string;
  clicks: number;
  impressions: number;
};

function formatPct(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.abs(value).toFixed(1);
  return `${value >= 0 ? "+" : "-"}${rounded}%`;
}

export const GscPerformanceCard = memo(function GscPerformanceCard({
  connected,
  bound,
  summary,
  timeseries,
  domain,
  lastSyncAt,
  onConnect,
  onRefresh,
  refreshing,
  onManage,
  className,
}: GscPerformanceCardProps) {
  const chartData = useMemo<ChartPoint[]>(() => {
    return (timeseries || []).map((row) => ({
      date: typeof row.date === "string" ? row.date.slice(5) : "",
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
    }));
  }, [timeseries]);

  const hasData = connected && bound && chartData.length > 0;
  const showConnect = !connected;
  const showBind = connected && !bound;
  const showRefresh = connected && bound && Boolean(onRefresh || onManage);

  const trendPct = formatPct(summary?.impressionsChangePct ?? null);
  const trendUp =
    typeof summary?.impressionsChangePct === "number"
      ? summary.impressionsChangePct >= 0
      : null;

  const subtitle = trendPct
    ? `Impressions ${trendUp ? "up" : "down"} ${trendPct}`
    : showConnect
      ? "Connect GSC to unlock performance trends"
      : showBind
        ? "Bind a property to unlock performance trends"
        : hasData
          ? "Latest performance trends"
          : "Refresh to load performance trends";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/30 bg-white/80 backdrop-blur-md shadow-[0_12px_40px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/10" />
      <div className="relative p-5">
        <Collapsible defaultOpen={false} className="group/collapsible">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Search Performance
              </p>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {showConnect && onConnect && (
                <Button
                  onClick={onConnect}
                  className="rounded-full"
                  data-testid="gsc-warroom-connect"
                >
                  <span className="sm:hidden">Connect</span>
                  <span className="hidden sm:inline">
                    Connect Google Search Console
                  </span>
                </Button>
              )}
              {showBind && onManage && (
                <Button
                  variant="outline"
                  onClick={onManage}
                  className="rounded-full"
                  data-testid="gsc-warroom-bind"
                >
                  Bind property
                </Button>
              )}
              {showRefresh && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onRefresh || onManage}
                  disabled={refreshing}
                  className="rounded-full"
                  data-testid="gsc-warroom-refresh-product"
                  aria-label={
                    refreshing ? "Refreshing GSC data" : "Refresh GSC data"
                  }
                >
                  <RefreshCw className={cn(refreshing && "animate-spin")} />
                </Button>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="text-xs cursor-help flex items-center gap-1"
                    >
                      <Image
                        src="/llm_logos/icons/icons8-google-50.png"
                        alt="Google"
                        width={12}
                        height={12}
                        className="h-3 w-3 opacity-70"
                      />
                      <span>GSC</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Google Search Console</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/40 bg-transparent text-slate-500 transition hover:bg-white/40"
                  data-testid="gsc-warroom-performance-toggle"
                  aria-label="Toggle Search Performance details"
                >
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className="mt-4 space-y-4">
            <div
              className="h-44 rounded-2xl border border-white/40 bg-white/60"
              data-testid="gsc-warroom-chart"
            >
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="gscImpressions"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#38bdf8"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#38bdf8"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <RechartsTooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(148,163,184,0.25)",
                        borderRadius: "12px",
                        boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stroke="#38bdf8"
                      fill="url(#gscImpressions)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-500">
                  <Plug className="h-5 w-5" />
                  <span>No GSC data yet</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Impressions
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-sky-600" />
                  Clicks
                </span>
              </div>
              <div className="flex items-center gap-1">
                {trendPct && trendUp !== null ? (
                  <>
                    {trendUp ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    <span>{trendPct}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {domain && (
                <span className="text-xs text-slate-400">{domain}</span>
              )}
              {lastSyncAt && (
                <span className="text-xs text-slate-400">
                  Last sync {new Date(lastSyncAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
});
