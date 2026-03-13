"use client";

import { memo } from "react";
import Link from "next/link";
import {
  Share2,
  Flag,
  ExternalLink,
  Crown,
  Copy,
  Link2,
  Sparkles,
  Rocket,
  FileText,
  Download,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

const CARD_BASE =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";

export interface DistributionCardProps {
  blogHandle: string | null;
  customDomain: string | null;
  tenantId: string | null;
}

function DistributionCardComponent({
  blogHandle,
  customDomain,
  tenantId,
}: DistributionCardProps): React.ReactElement {
  const { toast } = useToast();

  const llmsBundleHref = tenantId
    ? `/api/blog/exports/llms-bundle?tenantId=${tenantId}`
    : "/dashboard/exports";
  const sitemapHref = tenantId
    ? `/api/blog/exports/sitemap?tenantId=${tenantId}`
    : "/dashboard/exports";

  function handleCopyBlogUrl(): void {
    if (!blogHandle) return;
    const url = customDomain
      ? `https://${customDomain}`
      : `${window.location.origin}/${blogHandle}/blog`;
    navigator.clipboard.writeText(url);
    toast({ title: "Blog URL copied" });
  }

  return (
    <Card className={CARD_BASE}>
      {/* Decorative background icon */}
      <Share2 className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-indigo-500/[0.03]" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Share2 className="h-4 w-4 text-indigo-600" />
          Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Your Blog row with custom domain support */}
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Flag className="h-4 w-4 text-emerald-600" />
              {blogHandle ? (
                <a
                  href={
                    customDomain
                      ? `https://${customDomain}`
                      : `${typeof window !== "undefined" ? window.location.origin : ""}/${blogHandle}/blog`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <span>Your Blog</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ) : (
                <span>Your Blog</span>
              )}
              {customDomain && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://${customDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full p-1 hover:bg-amber-100/50 transition-colors"
                      >
                        <Crown className="h-3.5 w-3.5 text-amber-500" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50 text-amber-900"
                    >
                      <p className="text-xs font-medium">{customDomain}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {blogHandle ? (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Copy blog URL"
                onClick={handleCopyBlogUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>

          {/* CTA to connect custom domain */}
          {blogHandle && !customDomain && (
            <Link
              href="/dashboard/settings?section=blog&tab=domain"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md
                         bg-gradient-to-r from-amber-50/80 to-orange-50/60
                         border border-amber-200/40
                         hover:from-amber-100/90 hover:to-orange-100/70
                         hover:border-amber-300/60
                         transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-100/80">
                <Link2 className="h-3 w-3 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-700 group-hover:text-amber-800">
                Connect your own domain
              </span>
              <Sparkles className="h-3 w-3 text-amber-400 ml-auto opacity-60 group-hover:opacity-100" />
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Rocket className="h-4 w-4 text-blue-600" />
            <span>llms.txt</span>
          </div>
          <Button
            asChild
            size="icon"
            variant="ghost"
            aria-label="Download llms bundle"
          >
            <a href={llmsBundleHref} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-purple-600" />
            <span>Sitemap</span>
          </div>
          <Button
            asChild
            size="icon"
            variant="ghost"
            aria-label="Download sitemap"
          >
            <a href={sitemapHref} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const DistributionCard = memo(DistributionCardComponent);
