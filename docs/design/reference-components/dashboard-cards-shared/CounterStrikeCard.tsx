"use client";

import { memo } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CARD_BASE =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";

export interface Session {
  id: string;
  name?: string | null;
  status: "running" | "paused" | "stopped" | "error";
  configuration?: Record<string, unknown> | null;
  statistics?: {
    totalQueued?: number;
    totalGenerated?: number;
    totalPublished?: number;
    totalFailed?: number;
  } | null;
  created_at?: string;
}

export interface CounterStrikeCardProps {
  sessions: Session[];
  canLaunchCounterStrike: boolean;
  actionLoading: string | null;
  onToggleSession: (session: Session) => void;
  onAddCompetitor: () => void;
  onFindEnemy: () => void;
}

function CounterStrikeCardComponent({
  sessions,
  canLaunchCounterStrike,
  actionLoading,
  onToggleSession,
  onAddCompetitor,
  onFindEnemy,
}: CounterStrikeCardProps): React.ReactElement {
  const activeCampaigns = sessions.filter(
    (s) => s.status === "running" || s.status === "paused",
  );

  return (
    <Card className={CARD_BASE}>
      {/* Decorative background icon */}
      <Swords className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-rose-500/[0.03]" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Swords className="h-4 w-4 text-rose-600" />
          Active Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeCampaigns.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No active campaigns yet.
            </p>
            {canLaunchCounterStrike ? (
              <Button
                asChild
                size="sm"
                variant="default"
                className={cn(
                  "font-[family-name:var(--font-primary)]",
                  "pulse-ring-cta bg-slate-900 text-white hover:bg-slate-900/90",
                )}
              >
                <Link href="/dashboard/ai-insights?tab=battlefield">
                  Launch Counter-Strike
                </Link>
              </Button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={onAddCompetitor}>
                  + Add Competitor
                </Button>
                <Button size="sm" variant="outline" onClick={onFindEnemy}>
                  Find enemy
                </Button>
              </div>
            )}
          </div>
        ) : (
          activeCampaigns.map((session) => {
            const canToggle =
              session.status === "running" || session.status === "paused";
            return (
              <div
                key={session.id}
                className="rounded-lg border border-slate-100 bg-white/70 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {session.name || "Counter-Strike"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Status: {session.status}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {session.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Queue: {session.statistics?.totalQueued ?? 0} • Generated:{" "}
                  {session.statistics?.totalGenerated ?? 0} • Published:{" "}
                  {session.statistics?.totalPublished ?? 0}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/dashboard/autopilot?session=${session.id}`}>
                      View Campaign
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleSession(session)}
                    disabled={!canToggle || actionLoading === session.id}
                  >
                    {session.status === "running" ? "Pause" : "Resume"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export const CounterStrikeCard = memo(CounterStrikeCardComponent);
