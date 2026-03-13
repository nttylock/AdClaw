"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Swords,
  Star,
  Rocket,
  Eye,
  MessageSquare,
  BookOpen,
  Target,
  Loader2,
  PenLine,
  Gift,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ContentGap } from "@/lib/ai-insights/types";

const CARD_BASE =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";

export type RecommendedAction =
  | {
      id: string;
      kind: "link";
      title: string;
      description: string;
      href: string;
    }
  | {
      id: string;
      kind: "action";
      title: string;
      description: string;
      onClickId: string;
    };

export interface RecommendedActionsCardProps {
  actions: RecommendedAction[];
  isCheckRunning: boolean;
  refreshType: string | null;
  onActionClick: (onClickId: string) => void;
  gaps?: ContentGap[];
  addingGapIds?: Record<string, boolean>;
  onAddGapToAutopilot?: (gapId: string) => void;
}

function getActionIcon(
  actionId: string,
): React.ComponentType<{ className?: string }> {
  switch (actionId) {
    case "add-product":
      return Star;
    case "counter-strike":
      return Swords;
    case "start-autopilot":
      return Rocket;
    case "run-visibility":
      return Eye;
    case "reddit-intent":
      return MessageSquare;
    case "wiki-dead-links":
      return BookOpen;
    case "lead-magnets":
      return Gift;
    default:
      return Target;
  }
}

function RecommendedActionsCardComponent({
  actions,
  isCheckRunning,
  refreshType,
  onActionClick,
  gaps = [],
  addingGapIds = {},
  onAddGapToAutopilot,
}: RecommendedActionsCardProps): React.ReactElement {
  const router = useRouter();

  // Only show critical/high priority gaps
  const criticalGaps = gaps.filter((g) => g.priority === "high");
  const topCriticalGaps = criticalGaps.slice(0, 2);

  return (
    <Card className={CARD_BASE}>
      {/* Decorative background icon */}
      <Sparkles className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-purple-500/[0.03]" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Recommended Actions
          </CardTitle>
          <Button asChild size="icon" variant="ghost" className="h-7 w-7">
            <Link
              href="/dashboard/ai-insights?tab=content-gaps"
              aria-label="Open content gaps"
            >
              <Swords className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isCheckRunning && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Running visibility scan...</span>
            </div>
            <p className="mt-1 text-xs text-blue-700/80">
              {refreshType === "llm"
                ? "Recognition check in progress."
                : refreshType === "seo"
                  ? "SEO analysis in progress."
                  : refreshType === "discovery"
                    ? "AI traffic check in progress."
                    : "Preparing checks..."}
            </p>
          </div>
        )}

        <div className={cn(isCheckRunning && "pointer-events-none opacity-60")}>
          <div className="space-y-3">
            {/* Critical Gaps - show max 2 */}
            {topCriticalGaps.length > 0 && (
              <div className="rounded-lg border border-slate-100 bg-white/70 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-900">
                    Critical Gaps
                  </p>
                  {criticalGaps.length > 2 && (
                    <Link
                      href="/dashboard/ai-insights?tab=content-gaps"
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      +{criticalGaps.length - 2} more
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {topCriticalGaps.map((gap) => {
                    const autopilotQueued =
                      gap.status === "in_progress" ||
                      gap.status === "completed";
                    return (
                      <div
                        key={gap.id}
                        onClick={() =>
                          router.push(
                            `/dashboard/ai-insights?tab=content-gaps&gapId=${gap.id}`,
                          )
                        }
                        className="flex items-center justify-between gap-2 cursor-pointer rounded-lg px-1 py-1 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          <span className="line-clamp-1">
                            {gap.title || "Untitled gap"}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={`/dashboard/blog/new?gapId=${gap.id}`}
                                  aria-label={`Write article for ${gap.title}`}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                                >
                                  <PenLine className="h-3.5 w-3.5" />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Write now</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => onAddGapToAutopilot?.(gap.id)}
                                  disabled={addingGapIds[gap.id]}
                                  aria-label={`Add ${gap.title} to autopilot`}
                                  className={cn(
                                    "inline-flex h-7 w-7 items-center justify-center rounded-full border",
                                    autopilotQueued
                                      ? "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-600"
                                      : "border-blue-200 bg-blue-50 text-slate-600 hover:border-blue-300 hover:text-blue-700",
                                  )}
                                >
                                  <Rocket className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">
                                  {addingGapIds[gap.id]
                                    ? "Queuing..."
                                    : "Send to Autopilot"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Recommended Actions */}
            {actions.map((action) => {
              const ActionIcon = getActionIcon(action.id);
              const isHighlight =
                action.kind === "action" &&
                action.onClickId === "open_add_first_product";

              const content = (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {action.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border shrink-0",
                      isHighlight
                        ? "border-purple-300 bg-purple-50 text-purple-600 group-hover:border-purple-400"
                        : "border-slate-200 text-slate-600 group-hover:border-slate-300 group-hover:text-slate-900",
                    )}
                  >
                    <ActionIcon className="h-4 w-4" />
                  </div>
                </div>
              );

              if (action.kind === "link") {
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="group block rounded-lg border border-slate-100 bg-white/70 p-3 transition hover:border-slate-200 hover:bg-white"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onActionClick(action.onClickId)}
                  disabled={isCheckRunning}
                  className={cn(
                    "group block w-full text-left rounded-lg border p-3 transition",
                    isHighlight
                      ? "border-purple-200 bg-purple-50/70 hover:border-purple-300 hover:bg-purple-50"
                      : "border-slate-100 bg-white/70 hover:border-slate-200 hover:bg-white",
                  )}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const RecommendedActionsCard = memo(RecommendedActionsCardComponent);
