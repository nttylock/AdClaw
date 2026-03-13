"use client";

import { memo } from "react";
import { Flame } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CARD_BASE } from "./shared";

export interface RoastScoreCardProps {
  domain: string | null;
  seoScore: number | null;
  seoGrade: string | null;
  speedScore: number | null;
  speedGrade: string | null;
  bestSeoQuote: string | null;
  onRoastSite: () => void;
  onViewRoast: () => void;
}

function gradeColor(grade: string | null): string {
  if (grade === "A") return "text-green-600";
  if (grade === "C") return "text-yellow-600";
  if (grade === "F") return "text-red-600";
  return "text-slate-400";
}

function RoastScoreCardComponent({
  domain,
  seoScore,
  seoGrade,
  speedScore,
  speedGrade,
  bestSeoQuote,
  onRoastSite,
  onViewRoast,
}: RoastScoreCardProps): React.ReactElement {
  const isEmpty = !domain;

  return (
    <Card className={CARD_BASE}>
      <Flame className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-orange-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Flame className="h-4 w-4 text-orange-600" />
          SEO Roast Score
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {isEmpty ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Get a brutally honest roast of your website&apos;s SEO and speed.
            </p>
            <Button size="sm" onClick={onRoastSite}>
              Roast My Site
            </Button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground truncate">{domain}</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-100 bg-white/70 px-3 py-2 text-center">
                <div className={`text-2xl font-bold ${gradeColor(seoGrade)}`}>
                  {seoGrade ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  SEO {seoScore !== null ? `(${seoScore})` : ""}
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-white/70 px-3 py-2 text-center">
                <div className={`text-2xl font-bold ${gradeColor(speedGrade)}`}>
                  {speedGrade ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Speed {speedScore !== null ? `(${speedScore})` : ""}
                </div>
              </div>
            </div>

            {bestSeoQuote && (
              <p className="text-xs italic text-slate-500 line-clamp-2">
                &ldquo;{bestSeoQuote}&rdquo;
              </p>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={onViewRoast}
            >
              View Full Roast
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const RoastScoreCard = memo(RoastScoreCardComponent);
