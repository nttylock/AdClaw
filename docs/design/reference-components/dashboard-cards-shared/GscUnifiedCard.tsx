"use client";

import {
  memo,
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button-citedy-style";
import { ChevronDown, Plug, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GscDailyMetric, GscSummary } from "@/lib/seo/gsc-metrics";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type GscUnifiedCardProps = {
  connected: boolean;
  bound: boolean;
  summary?: GscSummary | null;
  timeseries?: GscDailyMetric[] | null;
  domain?: string | null;
  boundSiteUrl?: string | null;
  lastSyncAt?: string | null;
  onConnect?: () => void;
  onManage?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  defaultExpanded?: boolean;
  className?: string;
};

type ChartPoint = {
  date: string;
  clicks: number;
  impressions: number;
};

function getGscBoundDomain(siteUrl?: string | null) {
  if (!siteUrl) return null;
  const trimmed = siteUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("sc-domain:"))
    return trimmed.slice("sc-domain:".length);
  try {
    return new URL(trimmed).hostname || trimmed;
  } catch {
    return trimmed;
  }
}

function formatPct(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.abs(value).toFixed(1);
  return `${value >= 0 ? "+" : "-"}${rounded}%`;
}

function formatNumber(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return value >= 1000 ? value.toLocaleString() : value.toString();
}

type FullSquareCardProps = {
  connected: boolean;
  bound: boolean;
  chartData: ChartPoint[];
  summary?: GscSummary | null;
  domain?: string | null;
  boundSiteUrl?: string | null;
  lastSyncAt?: string | null;
  onConnect?: () => void;
  onManage?: () => void;
};

function FullSquareCard({
  connected,
  bound,
  chartData,
  summary,
  domain,
  boundSiteUrl,
  lastSyncAt,
  onConnect,
  onManage,
}: FullSquareCardProps) {
  const canShowChart = connected && bound;
  const hasData = canShowChart && chartData.length > 0;
  const showConnect = !connected;
  const showBind = connected && !bound;

  const clicksValue = summary?.clicks ?? null;
  const impressionsValue = summary?.impressions ?? null;
  const clicksDelta = summary?.clicksChangePct ?? null;
  const impressionsDelta = summary?.impressionsChangePct ?? null;
  const boundDomain = getGscBoundDomain(boundSiteUrl);

  return (
    <div
      className="group relative flex items-end h-full w-full bg-white"
      data-testid="gsc-unified-full-card"
    >
      <div className="absolute top-4 left-5 z-30 bg-white/60 backdrop-blur-md px-2 py-0.5 rounded-full pointer-events-none">
        <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
          Search Performance
        </p>
      </div>

      <div className="absolute inset-0 pt-[44px] pb-32 overflow-hidden rounded-[16px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gscUnifiedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <RechartsTooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ fontSize: "12px", padding: 0 }}
                labelStyle={{
                  fontSize: "12px",
                  marginBottom: "4px",
                  color: "#64748b",
                }}
              />
              <YAxis hide padding={{ top: 20 }} />
              <Area
                type="monotone"
                dataKey="impressions"
                stroke="#818CF8"
                fill="url(#gscUnifiedGrad)"
                strokeWidth={2}
                strokeOpacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#34D399"
                strokeWidth={2}
                dot={false}
                strokeOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : canShowChart ? (
          <div className="h-full flex flex-col items-center justify-center text-sm text-slate-500">
            <Plug className="h-6 w-6 mb-2" />
            <span>No GSC data yet</span>
          </div>
        ) : (
          <div className="h-full" />
        )}
      </div>

      {connected && bound && (
        <div
          className="relative z-20 bg-[#fafafa] border border-white"
          style={{
            margin: "6px",
            width: "calc(100% - 12px)",
            borderRadius: "12px",
            padding: "12px 14px 14px",
            backgroundColor: "#fafafa",
            boxShadow:
              "0px 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px -1px rgba(0, 0, 0, 0.08), 0px 2px 4px 0px rgba(0, 0, 0, 0.04)",
          }}
          data-testid="gsc-unified-metrics"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <p className="text-[12px] font-bold text-[#b0b0b5] uppercase tracking-wider mb-1">
                Clicks
              </p>
              <div className="flex items-center gap-1.5 min-h-[24px]">
                <h3 className="text-[#1b1b1d] font-bold text-[17px] tracking-tight">
                  {formatNumber(clicksValue)}
                </h3>
                {formatPct(clicksDelta) && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    {formatPct(clicksDelta)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[12px] font-bold text-[#b0b0b5] uppercase tracking-wider mb-1">
                Impressions
              </p>
              <div className="flex items-center gap-1.5 min-h-[24px]">
                <h3 className="text-[#1b1b1d] font-bold text-[17px] tracking-tight">
                  {formatNumber(impressionsValue)}
                </h3>
                {formatPct(impressionsDelta) && (
                  <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded-full">
                    {formatPct(impressionsDelta)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {(domain || lastSyncAt) && (
            <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-slate-400">
              {domain && (
                <TooltipProvider>
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "truncate bg-transparent p-0 text-slate-400",
                          boundDomain && boundDomain !== domain
                            ? "cursor-help hover:text-slate-500"
                            : "cursor-default",
                        )}
                        aria-label={
                          boundDomain
                            ? `GSC is bound to ${boundDomain}`
                            : "Project domain"
                        }
                      >
                        {domain}
                      </button>
                    </TooltipTrigger>
                    {boundDomain && (
                      <TooltipContent className="max-w-[240px] text-xs leading-snug">
                        <div className="space-y-1">
                          <div>
                            <span className="text-slate-500">Project:</span>{" "}
                            <span className="font-medium text-slate-900">
                              {domain}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Connected domain:
                            </span>{" "}
                            <span className="font-medium text-slate-900">
                              {boundDomain}
                            </span>
                          </div>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
              {lastSyncAt && (
                <span>
                  Last sync {new Date(lastSyncAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {showConnect && (
        <div
          className="absolute inset-0 z-[55] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-[16px]"
          data-testid="gsc-unified-disconnected-overlay"
        >
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl border border-white">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
              <Plug className="w-6 h-6 text-slate-300" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-slate-900 tracking-tight">
                GSC Disconnected
              </p>
              <p className="text-xs text-slate-500">
                Connect to see search insights
              </p>
            </div>
            <Button
              variant="default"
              size="default"
              className="gap-2 px-8 shadow-lg shadow-indigo-100 rounded-full"
              onClick={onConnect}
              data-testid="gsc-unified-connect"
            >
              Connect GSC
            </Button>
          </div>
        </div>
      )}

      {showBind && (
        <div
          className="absolute inset-0 z-[55] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-[16px]"
          data-testid="gsc-unified-unbound-overlay"
        >
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl border border-white">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
              <Plug className="w-6 h-6 text-slate-300" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-slate-900 tracking-tight">
                Property not bound
              </p>
              <p className="text-xs text-slate-500">
                Select a property to see search insights
              </p>
            </div>
            <Button
              variant="outline"
              size="default"
              className="gap-2 px-8 rounded-full"
              onClick={onManage}
              data-testid="gsc-unified-bind"
            >
              Bind property
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const GscUnifiedCard = memo(function GscUnifiedCard({
  connected,
  bound,
  summary,
  timeseries,
  domain,
  boundSiteUrl,
  lastSyncAt,
  onConnect,
  onManage,
  onRefresh,
  refreshing,
  defaultExpanded,
  className,
}: GscUnifiedCardProps) {
  const [isExpanded, setIsExpanded] = useState(Boolean(defaultExpanded));

  const chartData = useMemo<ChartPoint[]>(() => {
    return (timeseries || []).map((row) => ({
      date: typeof row.date === "string" ? row.date.slice(5) : "",
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
    }));
  }, [timeseries]);

  const miniGraphData = useMemo(() => {
    return (timeseries || []).slice(0, 15);
  }, [timeseries]);

  const showMetrics = connected && bound;
  const showRefresh = connected && bound && Boolean(onRefresh);

  const clicksValue = summary?.clicks ?? null;
  const impressionsValue = summary?.impressions ?? null;
  const clicksDelta = summary?.clicksChangePct ?? null;
  const impressionsDelta = summary?.impressionsChangePct ?? null;

  const handleRefresh = useCallback(
    (event?: MouseEvent<HTMLButtonElement>) => {
      event?.stopPropagation();
      onRefresh?.();
    },
    [onRefresh],
  );

  const handleCollapsedKey = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsExpanded(true);
      }
    },
    [],
  );

  return (
    <motion.div
      initial={false}
      animate={{
        height: isExpanded ? 340 : 80,
      }}
      transition={{ type: "spring", stiffness: 180, damping: 26 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card text-card-foreground bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 border border-slate-200/40 shadow-sm w-full",
        !refreshing && "backdrop-blur-sm",
        className,
      )}
      data-testid="gsc-unified-card"
    >
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          onKeyDown={handleCollapsedKey}
          className="absolute inset-0 z-50 flex items-center justify-between pl-7 pr-[20px] group text-left"
          data-testid="gsc-unified-expand-trigger"
        >
          {!showMetrics ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">
                  Search Performance
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Clicks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Impressions
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Clicks
                  </p>
                </div>
                <div className="pl-4 h-7 flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">
                    {formatNumber(clicksValue)}
                  </span>
                  {formatPct(clicksDelta) && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      {formatPct(clicksDelta)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-indigo-400" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Impressions
                  </p>
                </div>
                <div className="pl-4 h-7 flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">
                    {formatNumber(impressionsValue)}
                  </span>
                  {formatPct(impressionsDelta) && (
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded-full">
                      {formatPct(impressionsDelta)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 transition-all duration-300">
            {!connected && <Plug className="w-4 h-4 text-slate-300" />}
            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </button>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full flex flex-col justify-end"
            data-testid="gsc-unified-expanded"
          >
            <FullSquareCard
              connected={connected}
              bound={bound}
              chartData={chartData}
              summary={summary}
              domain={domain}
              boundSiteUrl={boundSiteUrl}
              lastSyncAt={lastSyncAt}
              onConnect={onConnect}
              onManage={onManage}
            />

            <div className="absolute top-[20px] right-[20px] z-[60] flex items-center gap-2">
              {showRefresh && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="rounded-full"
                  data-testid="gsc-unified-refresh-expanded"
                  aria-label={
                    refreshing ? "Refreshing GSC data" : "Refresh GSC data"
                  }
                >
                  <RefreshCw
                    className={cn("h-4 w-4", refreshing && "animate-spin")}
                  />
                </Button>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-slate-50 rounded-full transition-all group"
                data-testid="gsc-unified-collapse-trigger"
                aria-label="Collapse GSC card"
              >
                <ChevronDown className="w-5 h-5 text-slate-400 rotate-180 group-hover:text-slate-900" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && connected && (
        <div
          className="absolute inset-0 opacity-10 -z-10 pt-10 pointer-events-none"
          data-testid="gsc-unified-mini-graph"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={miniGraphData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <Area
                type="monotone"
                dataKey="impressions"
                stroke="#818CF8"
                fill="#818CF8"
                strokeWidth={1}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {!isExpanded && !connected && (
        <div
          className="absolute inset-0 opacity-10 -z-10 pt-10 pointer-events-none"
          data-testid="gsc-unified-mini-graph-empty"
        >
          <div className="w-full h-full bg-slate-100 rounded-2xl border border-slate-200" />
        </div>
      )}
    </motion.div>
  );
});
