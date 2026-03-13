"use client";

import { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight, ArrowRight, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_BASE } from "./shared";

export interface AutopilotEngineCardProps {
  status: "running" | "idle";
  queueDepth: number;
  pipeline: {
    draft: number;
    pending: number;
    generated: number;
    published: number;
    failed: number;
  };
  last24h: {
    generated: number;
    failed: number;
    creditsSpent: number;
  };
  onLaunchAutopilot: () => void;
  onViewQueue: () => void;
}

interface PipelineBadgeProps {
  label: string;
  count: number;
  colorClass: string;
  bgClass: string;
}

function PipelineBadge({
  label,
  count,
  colorClass,
  bgClass,
}: PipelineBadgeProps) {
  return (
    <div
      className={cn("flex flex-col items-center rounded-lg px-2 py-1", bgClass)}
    >
      <span className={cn("text-sm font-semibold tabular-nums", colorClass)}>
        {count}
      </span>
      <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function PipelineArrow() {
  return <ArrowRight className="mx-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />;
}

function EmptyState({ onLaunchAutopilot }: { onLaunchAutopilot: () => void }) {
  return (
    <Card className={CARD_BASE}>
      <Zap className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-amber-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Zap className="h-4 w-4 text-amber-600" />
          Autopilot Engine
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Auto-generate SEO articles 24/7
        </p>

        <Button size="sm" onClick={onLaunchAutopilot}>
          Launch Autopilot
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function DataState({
  status,
  queueDepth,
  pipeline,
  last24h,
  onLaunchAutopilot,
  onViewQueue,
}: AutopilotEngineCardProps) {
  const isRunning = status === "running";

  return (
    <Card className={CARD_BASE}>
      <Zap className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-amber-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Zap className="h-4 w-4 text-amber-600" />
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              isRunning
                ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                : "bg-slate-300",
            )}
          />
          <span className="capitalize">{status}</span>
          <span className="text-slate-300">&middot;</span>
          <span className="text-xs font-normal text-slate-500">
            {queueDepth} in queue
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pipeline badges */}
        <div className="flex items-center justify-between gap-0.5">
          <PipelineBadge
            label="Draft"
            count={pipeline.draft}
            colorClass="text-slate-600"
            bgClass="bg-slate-50/80"
          />
          <PipelineArrow />
          <PipelineBadge
            label="Pend"
            count={pipeline.pending}
            colorClass="text-amber-600"
            bgClass="bg-amber-50/80"
          />
          <PipelineArrow />
          <PipelineBadge
            label="Gen"
            count={pipeline.generated}
            colorClass="text-sky-600"
            bgClass="bg-sky-50/80"
          />
          <PipelineArrow />
          <PipelineBadge
            label="Pub"
            count={pipeline.published}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50/80"
          />
          {pipeline.failed > 0 && (
            <>
              <PipelineArrow />
              <PipelineBadge
                label="Fail"
                count={pipeline.failed}
                colorClass="text-red-600"
                bgClass="bg-red-50/80"
              />
            </>
          )}
        </div>

        {/* Last 24h stats */}
        <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
          <p className="text-xs text-slate-400">Last 24 hours</p>
          <p className="mt-0.5 text-sm text-slate-600">
            <span className="font-medium">{last24h.generated}</span> generated
            {last24h.failed > 0 && (
              <>
                ,{" "}
                <span className="font-medium text-red-600">
                  {last24h.failed}
                </span>{" "}
                failed
              </>
            )}
            <span className="mx-1.5 text-slate-300">&middot;</span>
            <span className="font-medium">{last24h.creditsSpent}</span> credits
          </p>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" className="flex-1" onClick={onLaunchAutopilot}>
            Launch
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewQueue}
          >
            <List className="mr-1 h-3.5 w-3.5" />
            Queue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AutopilotEngineCardComponent(props: AutopilotEngineCardProps) {
  const isEmpty =
    props.pipeline.draft === 0 &&
    props.pipeline.pending === 0 &&
    props.pipeline.generated === 0 &&
    props.pipeline.published === 0 &&
    props.pipeline.failed === 0 &&
    props.queueDepth === 0;

  if (isEmpty) {
    return <EmptyState onLaunchAutopilot={props.onLaunchAutopilot} />;
  }

  return <DataState {...props} />;
}

export const AutopilotEngineCard = memo(AutopilotEngineCardComponent);
AutopilotEngineCard.displayName = "AutopilotEngineCard";
