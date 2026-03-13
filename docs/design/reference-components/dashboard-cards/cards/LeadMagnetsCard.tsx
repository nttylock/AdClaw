"use client";

import { memo } from "react";
import { Magnet, Download, Trophy } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CARD_BASE } from "./shared";

export interface LeadMagnetsCardProps {
  count: number;
  totalDownloads: number;
  topMagnet: { title: string; downloads: number } | null;
  onCreateMagnet: () => void;
  onViewAll: () => void;
}

function LeadMagnetsCardComponent({
  count,
  totalDownloads,
  topMagnet,
  onCreateMagnet,
  onViewAll,
}: LeadMagnetsCardProps): React.ReactElement {
  const isEmpty = count === 0;

  return (
    <Card className={CARD_BASE}>
      <Magnet className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-pink-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Magnet className="h-4 w-4 text-pink-600" />
          Lead Magnets
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {isEmpty ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Turn articles into downloadable assets. Checklists, swipe files,
              frameworks.
            </p>
            <p className="text-xs text-muted-foreground">
              120 credits per magnet
            </p>
            <Button size="sm" onClick={onCreateMagnet}>
              Create Magnet
            </Button>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
              <span
                className="flex items-center gap-1.5 text-sm"
                title="Magnets"
              >
                <Magnet className="h-3.5 w-3.5 text-pink-600" />
                <span className="font-medium tabular-nums text-slate-900">
                  {count}
                </span>
              </span>
              <span className="text-slate-300">&middot;</span>
              <span
                className="flex items-center gap-1.5 text-sm"
                title="Downloads"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium tabular-nums text-slate-900">
                  {totalDownloads}
                </span>
              </span>
            </div>

            {/* Top magnet */}
            {topMagnet && (
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">
                      {topMagnet.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topMagnet.downloads} downloads
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1" onClick={onCreateMagnet}>
                Create
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

export const LeadMagnetsCard = memo(LeadMagnetsCardComponent);
LeadMagnetsCard.displayName = "LeadMagnetsCard";
