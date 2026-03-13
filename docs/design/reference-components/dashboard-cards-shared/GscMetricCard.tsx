"use client";

import { memo } from "react";
import { ChevronDown, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { GscSummary } from "@/lib/seo/gsc-metrics";

export type GscMetricCardProps = {
  title: string;
  metric: "clicks" | "impressions";
  summary?: GscSummary | null;
  connected: boolean;
  bound: boolean;
  domain?: string | null;
  onConnect?: () => void;
  onManage?: () => void;
};

function formatNumber(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return value >= 1000 ? value.toLocaleString() : value.toString();
}

function formatPct(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.abs(value).toFixed(1);
  return `${value >= 0 ? "+" : "-"}${rounded}%`;
}

export const GscMetricCard = memo(function GscMetricCard({
  title,
  metric,
  summary,
  connected,
  bound,
  domain,
  onConnect,
  onManage,
}: GscMetricCardProps) {
  const showConnect = !connected;
  const showBind = connected && !bound;
  const showMetricValue = connected && bound;

  const value =
    metric === "clicks"
      ? (summary?.clicks ?? null)
      : (summary?.impressions ?? null);
  const delta =
    metric === "clicks"
      ? (summary?.clicksChangePct ?? null)
      : (summary?.impressionsChangePct ?? null);
  const deltaLabel = formatPct(delta);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/80 backdrop-blur-md shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/10" />
      <div className="relative p-4">
        <Collapsible defaultOpen={false} className="group/collapsible">
          <CollapsibleTrigger asChild>
            <button type="button" className="w-full text-left">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {title}
                </p>
                <div className="flex items-center gap-2">
                  {!showMetricValue && (
                    <Plug className="h-5 w-5 text-slate-400" />
                  )}
                  <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </div>
              </div>

              {showMetricValue && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-2xl font-semibold text-slate-900">
                    {formatNumber(value)}
                  </div>
                  {deltaLabel ? (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        delta && delta > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700",
                      )}
                    >
                      {deltaLabel}
                    </span>
                  ) : null}
                </div>
              )}
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3 space-y-3">
            {showConnect && (
              <Button
                onClick={onConnect}
                className="w-full rounded-full"
                data-testid={`gsc-warroom-metric-connect-${metric}`}
              >
                <span className="sm:hidden">Connect</span>
                <span className="hidden sm:inline">
                  Connect Google Search Console
                </span>
              </Button>
            )}

            {showBind && (
              <Button
                variant="outline"
                onClick={onManage}
                className="w-full rounded-full"
                data-testid={`gsc-warroom-metric-bind-${metric}`}
              >
                Bind property
              </Button>
            )}

            {domain && (
              <p className="text-xs text-slate-400 truncate">{domain}</p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
});
