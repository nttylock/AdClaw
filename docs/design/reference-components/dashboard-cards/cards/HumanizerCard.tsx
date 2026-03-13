"use client";

import { memo, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ChevronRight, UserPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_BASE, formatTimeAgo } from "./shared";
import { HumanizeDialog, type HumanizeTarget } from "./HumanizeDialog";

export interface HumanizerCardProps {
  totalHumanized: number;
  avgPreservationScore: number;
  avgVariationScore: number;
  lastHumanized: {
    id: string;
    title: string;
    timestamp: string;
    passes: number;
  } | null;
  nonHumanizedArticles: Array<{
    id: string;
    title: string;
    contentLength: number;
  }>;
  tenantId: string;
  onViewAll: () => void;
  onHumanized?: () => void;
}

function EmptyState({ onViewAll }: { onViewAll: () => void }) {
  return (
    <Card className={CARD_BASE}>
      <Shield className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-violet-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Shield className="h-4 w-4 text-violet-600" />
          Humanizer
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Make your AI content undetectable. Keeps meaning, changes patterns.
        </p>
        <p className="text-xs text-muted-foreground">
          82% average preservation score
        </p>
        <Button size="sm" onClick={onViewAll}>
          Humanize Your First Article
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ProgressBar({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-700">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function DataState({
  totalHumanized,
  avgPreservationScore,
  avgVariationScore,
  lastHumanized,
  nonHumanizedArticles,
  onOpenDialog,
  onViewAll,
}: Omit<HumanizerCardProps, "tenantId" | "onHumanized"> & {
  onOpenDialog: (article: HumanizeTarget) => void;
}) {
  const displayedNonHumanized = nonHumanizedArticles.slice(0, 3);

  return (
    <Card className={CARD_BASE}>
      <Shield className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-violet-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle
          className="flex items-center gap-2 text-sm font-semibold text-slate-600"
          title="AI rewrites your articles to bypass AI detectors while preserving meaning"
        >
          <Shield className="h-4 w-4 text-violet-600" />
          {totalHumanized} article{totalHumanized !== 1 ? "s" : ""} humanized
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quality bars */}
        <div className="space-y-2.5">
          <ProgressBar
            label="Preservation"
            value={avgPreservationScore}
            colorClass="bg-violet-500"
          />
          <ProgressBar
            label="Variation"
            value={avgVariationScore}
            colorClass="bg-indigo-500"
          />
        </div>

        {/* Last humanized */}
        {lastHumanized && (
          <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
            <p className="text-xs text-slate-400">Last humanized</p>
            <Link
              href={`/dashboard/blog/${lastHumanized.id}`}
              className="mt-0.5 block truncate text-sm font-medium text-slate-700 hover:text-violet-600 transition-colors"
            >
              {lastHumanized.title}
            </Link>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatTimeAgo(lastHumanized.timestamp)} &middot;{" "}
              {lastHumanized.passes} pass
              {lastHumanized.passes !== 1 ? "es" : ""}
            </p>
          </div>
        )}

        {/* Non-humanized articles */}
        {displayedNonHumanized.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Not yet humanized
            </p>
            {displayedNonHumanized.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50/80 transition-colors"
              >
                <Link
                  href={`/dashboard/blog/${article.id}`}
                  className="truncate text-sm text-slate-600 hover:text-violet-600 transition-colors"
                >
                  {article.title}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() =>
                    onOpenDialog({
                      id: article.id,
                      title: article.title,
                      contentLength: article.contentLength,
                    })
                  }
                  title="Humanize this article"
                >
                  <UserPen className="h-3.5 w-3.5 text-violet-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex items-center gap-2 pt-1">
          {nonHumanizedArticles.length > 0 && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                const first = nonHumanizedArticles[0];
                onOpenDialog({
                  id: first.id,
                  title: first.title,
                  contentLength: first.contentLength,
                });
              }}
            >
              Humanize
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewAll}
          >
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HumanizerCardComponent(props: HumanizerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogArticle, setDialogArticle] = useState<HumanizeTarget | null>(
    null,
  );

  const openDialog = useCallback((article: HumanizeTarget) => {
    setDialogArticle(article);
    setDialogOpen(true);
  }, []);

  const isEmpty =
    props.totalHumanized === 0 && props.nonHumanizedArticles.length === 0;

  return (
    <>
      {isEmpty ? (
        <EmptyState onViewAll={props.onViewAll} />
      ) : (
        <DataState {...props} onOpenDialog={openDialog} />
      )}

      <HumanizeDialog
        open={dialogOpen}
        article={dialogArticle}
        tenantId={props.tenantId}
        onClose={() => setDialogOpen(false)}
        onComplete={() => props.onHumanized?.()}
      />
    </>
  );
}

export const HumanizerCard = memo(HumanizerCardComponent);
HumanizerCard.displayName = "HumanizerCard";
