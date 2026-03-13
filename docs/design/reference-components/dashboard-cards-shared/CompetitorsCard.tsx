"use client";

import { memo } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Competitor, ThreatLevel } from "@/lib/ai-insights/types";

const CARD_BASE =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";

function getThreatTone(level?: ThreatLevel | null): string {
  switch (level) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-amber-500";
    case "low":
    default:
      return "bg-emerald-500";
  }
}

export interface CompetitorsCardProps {
  competitors: Competitor[];
  canLaunchCounterStrike: boolean;
  onShowDetails: (competitor: Competitor) => void;
  onAddCompetitor: () => void;
  onFindEnemy: () => void;
}

function CompetitorsCardComponent({
  competitors,
  canLaunchCounterStrike,
  onShowDetails,
  onAddCompetitor,
  onFindEnemy,
}: CompetitorsCardProps): React.ReactElement {
  const topCompetitors = competitors.slice(0, 3);

  return (
    <Card className={CARD_BASE}>
      {/* Decorative background icon */}
      <ShieldAlert className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-amber-500/[0.03]" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          Enemy Territory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topCompetitors.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No competitors tracked yet. Add competitors first to launch
              campaigns.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={onAddCompetitor}>
                + Add Competitor
              </Button>
              <Button size="sm" variant="outline" onClick={onFindEnemy}>
                Find enemy
              </Button>
            </div>
          </div>
        ) : (
          <>
            {topCompetitors.map((competitor) => (
              <div
                key={competitor.id}
                role="button"
                onClick={() => onShowDetails(competitor)}
                className="flex items-center justify-between rounded-md -mx-2 px-2 py-1 cursor-pointer hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      getThreatTone(competitor.threat_level),
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {competitor.name || competitor.domain}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(competitor.visibility_score || 0)}% visibility
                    </p>
                  </div>
                </div>
                {competitor.threat_level && (
                  <Badge variant="outline" className="capitalize">
                    {competitor.threat_level}
                  </Badge>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-2 pt-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={onAddCompetitor}
              >
                + Add Competitor
              </Button>
              <Button
                asChild
                size="sm"
                variant={canLaunchCounterStrike ? "default" : "outline"}
                className={cn(
                  "w-full",
                  "font-[family-name:var(--font-primary)]",
                  canLaunchCounterStrike &&
                    "pulse-ring-cta bg-slate-900 text-white hover:bg-slate-900/90",
                )}
              >
                <Link href="/dashboard/ai-insights?tab=battlefield">
                  Launch Counter-Strike
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const CompetitorsCard = memo(CompetitorsCardComponent);
