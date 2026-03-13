"use client";

import { memo } from "react";
import { Bot, Coins, Activity } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CARD_BASE, formatTimeAgo } from "./shared";

export interface AgentStatsCardProps {
  activeCount: number;
  totalCount: number;
  credits24h: number;
  lastActivity: { agentName: string; action: string; timestamp: string } | null;
  onManageAgents: () => void;
  onViewActivity: () => void;
}

function AgentStatsCardComponent({
  activeCount,
  totalCount,
  credits24h,
  lastActivity,
  onManageAgents,
  onViewActivity,
}: AgentStatsCardProps): React.ReactElement {
  const isEmpty = totalCount === 0;

  return (
    <Card className={CARD_BASE}>
      <Bot className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-emerald-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Bot className="h-4 w-4 text-emerald-600" />
          AI Agents
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {isEmpty ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect AI agents that write, publish, and promote articles for
              you.
            </p>
            <Button size="sm" onClick={onManageAgents}>
              Install OpenClaw Skill
            </Button>
            <p className="text-xs text-muted-foreground">
              Works with Claude, ChatGPT, and more.
            </p>
          </div>
        ) : (
          <>
            {/* Active / Total */}
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <Bot className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-slate-900">
                  {activeCount} Active
                </span>
                <span className="text-muted-foreground">
                  / {totalCount} Total
                </span>
              </div>
            </div>

            {/* Last activity */}
            {lastActivity && (
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {lastActivity.agentName}{" "}
                      <span className="text-muted-foreground">
                        &mdash; {formatTimeAgo(lastActivity.timestamp)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lastActivity.action}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Credits used 24h */}
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">Credits (24h)</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {credits24h}
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={onManageAgents}>
                Manage Agents
              </Button>
              <Button size="sm" variant="outline" onClick={onViewActivity}>
                View Activity
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const AgentStatsCard = memo(AgentStatsCardComponent);
AgentStatsCard.displayName = "AgentStatsCard";
