"use client";

import { memo } from "react";
import { Share2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CARD_BASE, formatTimeAgo } from "./shared";

export interface AdaptationsCardProps {
  total: number;
  platforms: Array<{
    platform: string;
    count: number;
    publishedCount: number;
  }>;
  lastAdaptation: {
    articleTitle: string;
    platforms: string[];
    timestamp: string;
  } | null;
  onAdaptLatest: () => void;
  onViewAll: () => void;
}

const DISCOVERY_PLATFORMS = [
  "\ud835\udd4f",
  "LinkedIn",
  "Facebook",
  "Reddit",
  "Threads",
] as const;

/** Map raw DB platform IDs to display labels */
const PLATFORM_LABELS: Record<string, string> = {
  x_thread: "\ud835\udd4f Thread",
  x_article: "\ud835\udd4f Article",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  reddit: "Reddit",
  threads: "Threads",
  shopify_blog: "Shopify",
};

function AdaptationsCardComponent({
  total,
  platforms,
  lastAdaptation,
  onAdaptLatest,
  onViewAll,
}: AdaptationsCardProps): React.ReactElement {
  const isEmpty = total === 0 && platforms.length === 0;

  return (
    <Card className={CARD_BASE}>
      <Share2 className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-indigo-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Share2 className="h-4 w-4 text-indigo-600" />
          Adaptations
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {isEmpty ? (
          /* ---------- Empty state (Type A - Discovery) ---------- */
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {DISCOVERY_PLATFORMS.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-indigo-200/60 bg-indigo-50/60 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                >
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Republish articles on 5 platforms. AI rewrites to fit each
              audience.
            </p>

            <Button size="sm" className="w-full" onClick={onAdaptLatest}>
              Adapt Latest Article
            </Button>
          </div>
        ) : (
          /* ---------- Data state ---------- */
          <>
            {/* Summary line */}
            <p className="text-xs font-medium text-slate-500">
              {total} adaptation{total !== 1 ? "s" : ""} &middot;{" "}
              {platforms.length} platform{platforms.length !== 1 ? "s" : ""}
            </p>

            {/* Platform grid */}
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(({ platform, publishedCount }) => (
                <div
                  key={platform}
                  className="flex items-center justify-between gap-1 overflow-hidden rounded-lg border border-slate-100 bg-white/70 px-2.5 py-1.5"
                >
                  <span className="truncate text-xs font-medium text-slate-700">
                    {PLATFORM_LABELS[platform] ?? platform}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {publishedCount}
                  </span>
                </div>
              ))}
            </div>

            {/* Last adaptation */}
            {lastAdaptation && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {lastAdaptation.articleTitle} &rarr;{" "}
                {lastAdaptation.platforms.join(", ")} &mdash;{" "}
                {formatTimeAgo(lastAdaptation.timestamp)}
              </p>
            )}

            {/* CTAs */}
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1" onClick={onAdaptLatest}>
                Adapt
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={onViewAll}
              >
                View All
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const AdaptationsCard = memo(AdaptationsCardComponent);
AdaptationsCard.displayName = "AdaptationsCard";
