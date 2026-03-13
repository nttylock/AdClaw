"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, Rocket } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ContentGap } from "@/lib/ai-insights/types";

export interface ContentGapsCardProps {
  gaps: ContentGap[];
  addingGapIds: Record<string, boolean>;
  onAddToAutopilot: (gapId: string) => void;
}

function ContentGapsCardComponent({
  gaps,
  addingGapIds,
  onAddToAutopilot,
}: ContentGapsCardProps): React.ReactElement | null {
  const router = useRouter();

  // Only show critical/high priority gaps
  const criticalGaps = gaps.filter((g) => g.priority === "high");
  const topCriticalGaps = criticalGaps.slice(0, 2);

  if (topCriticalGaps.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-100 bg-white/70 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-900">Critical Gaps</p>
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
            gap.status === "in_progress" || gap.status === "completed";
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
                        onClick={() => onAddToAutopilot(gap.id)}
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
  );
}

export const ContentGapsCard = memo(ContentGapsCardComponent);
