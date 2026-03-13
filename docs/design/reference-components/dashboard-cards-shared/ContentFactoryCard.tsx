"use client";

import { memo } from "react";
import Link from "next/link";
import { Zap, PenLine, Rocket, BadgeCheck, Gift } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CARD_BASE =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";

export interface ContentFactoryCardProps {
  totalArticles: number;
  publishedArticles: number;
}

function ContentFactoryCardComponent({
  totalArticles,
  publishedArticles,
}: ContentFactoryCardProps): React.ReactElement {
  return (
    <Card className={CARD_BASE}>
      {/* Decorative background icon */}
      <Zap className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-orange-500/[0.03]" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Zap className="h-4 w-4 text-orange-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link
          href="/dashboard/blog/new"
          className="group block rounded-lg border border-slate-100 bg-white/70 p-3 transition hover:border-slate-200 hover:bg-white"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Write Solo Article
              </p>
              <p className="text-xs text-muted-foreground">
                Manual writing with AI assist.
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 group-hover:border-slate-300 group-hover:text-slate-900">
              <PenLine className="h-4 w-4" />
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/autopilot"
          className="group block rounded-lg border border-slate-100 bg-white/70 p-3 transition hover:border-slate-200 hover:bg-white"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Deploy Autopilot
              </p>
              <p className="text-xs text-muted-foreground">
                Automated content factory.
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 group-hover:border-slate-300 group-hover:text-slate-900">
              <Rocket className="h-4 w-4" />
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/lead-magnets"
          className="group block rounded-lg border border-slate-100 bg-white/70 p-3 transition hover:border-slate-200 hover:bg-white"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Create Lead Magnet
              </p>
              <p className="text-xs text-muted-foreground">
                Checklists, swipes & frameworks.
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 group-hover:border-slate-300 group-hover:text-slate-900">
              <Gift className="h-4 w-4" />
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/blog"
          className="group block rounded-lg border border-slate-100 bg-white/70 p-3 transition hover:border-slate-200 hover:bg-white"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                View All Content
              </p>
              <p className="text-xs text-muted-foreground">
                {totalArticles} total • {publishedArticles} published
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 group-hover:border-slate-300 group-hover:text-slate-900">
              <BadgeCheck className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

export const ContentFactoryCard = memo(ContentFactoryCardComponent);
