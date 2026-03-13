"use client";

import { memo } from "react";
import Link from "next/link";
import { FileText, PenLine, Rocket } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CARD_BASE =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";

export interface RecentArticle {
  id: string;
  title: string;
  type: "published" | "draft" | "autopilot";
  timestamp: string;
  link: string;
}

export interface RecentArticlesCardProps {
  articles: RecentArticle[];
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

function RecentArticlesCardComponent({
  articles,
}: RecentArticlesCardProps): React.ReactElement {
  return (
    <Card className={CARD_BASE}>
      {/* Decorative background icon */}
      <FileText className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-emerald-500/[0.03]" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <FileText className="h-4 w-4 text-emerald-600" />
          Recent Articles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {articles.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No recent articles yet. Write something first.
            </p>

            <div className="space-y-2 pt-1">
              <Link
                href="/dashboard/blog/new"
                className="group block rounded-lg border border-slate-100 bg-white/70 p-3 transition hover:border-slate-200 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Launch Writer Agent
                    </p>
                    <p className="text-xs text-muted-foreground">
                      For single article
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
                      Run Autopilot Agents
                    </p>
                    <p className="text-xs text-muted-foreground">
                      For multiple articles
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 group-hover:border-slate-300 group-hover:text-slate-900">
                    <Rocket className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {articles.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                href={article.link}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white/70 px-3 py-2 text-sm hover:bg-white"
              >
                <span className="min-w-0 max-w-[70%] truncate">
                  {article.title}
                </span>
                <span className="flex-shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                  {formatTimeAgo(article.timestamp)}
                </span>
              </Link>
            ))}
            <Button asChild size="sm" variant="ghost">
              <Link href="/dashboard/blog">View All</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const RecentArticlesCard = memo(RecentArticlesCardComponent);
