"use client";

import { memo } from "react";
import { Radio } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CARD_BASE } from "./shared";

export interface BrandReputationCardProps {
  reddit: {
    runs: number;
    threads: number;
    themes: number;
    lastRun: string | null;
  };
  xScout: {
    runs: number;
    posts: number;
    accounts: number;
    lastRun: string | null;
  };
  latestSummary: string | null;
  onRunRedditScout: () => void;
  onRunXScout: () => void;
}

function BrandReputationCardComponent({
  reddit,
  xScout,
  latestSummary,
  onRunRedditScout,
  onRunXScout,
}: BrandReputationCardProps): React.ReactElement {
  const isEmpty = reddit.runs === 0 && xScout.runs === 0;

  return (
    <Card className={CARD_BASE}>
      <Radio className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-rose-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Radio className="h-4 w-4 text-rose-600" />
          Brand Reputation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {isEmpty ? (
          /* ---------- Empty state (Type C - Always Actionable) ---------- */
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              See what people say about your brand across Reddit, X, and
              Wikipedia.
            </p>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={onRunRedditScout}>
                Scan Reddit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={onRunXScout}
              >
                Scan X
              </Button>
            </div>

            <p className="text-[11px] text-slate-400">
              Uses your product name as search query
            </p>
          </div>
        ) : (
          /* ---------- Data state ---------- */
          <>
            {/* Reddit row */}
            <div className="rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
              <p className="text-sm font-medium text-slate-700">Reddit</p>
              <p className="text-xs text-muted-foreground">
                {reddit.runs} run{reddit.runs !== 1 ? "s" : ""} &middot;{" "}
                {reddit.threads} thread{reddit.threads !== 1 ? "s" : ""}{" "}
                &middot; {reddit.themes} theme
                {reddit.themes !== 1 ? "s" : ""}
              </p>
            </div>

            {/* X Scout row */}
            <div className="rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
              <p className="text-sm font-medium text-slate-700">X Scout</p>
              <p className="text-xs text-muted-foreground">
                {xScout.runs} run{xScout.runs !== 1 ? "s" : ""} &middot;{" "}
                {xScout.posts} post{xScout.posts !== 1 ? "s" : ""} &middot;{" "}
                {xScout.accounts} account{xScout.accounts !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Latest summary */}
            {latestSummary && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {latestSummary}
              </p>
            )}

            {/* CTAs */}
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1" onClick={onRunRedditScout}>
                Scan Reddit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={onRunXScout}
              >
                Scan X
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const BrandReputationCard = memo(BrandReputationCardComponent);
BrandReputationCard.displayName = "BrandReputationCard";
