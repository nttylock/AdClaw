"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  Plus,
  ChevronDown,
  Loader2,
  Target,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatedCardWrapper } from "@/components/ui/animated-card-wrapper";
import {
  UnifiedCardDropdown,
  favoriteToUnifiedItem,
} from "@/components/ai-insights/shared/UnifiedCardDropdown";
import type { CheckType } from "@/components/ai-insights/shared/types";
import { cn } from "@/lib/utils";
import type { Favorite, PlatformData } from "@/lib/ai-insights/types";
import { PLATFORM_ICONS, PLATFORM_LABELS } from "@/lib/ai-insights/utils";

const CARD_BASE =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-gray-50 border border-slate-200/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]";

// All 8 platforms: 6 LLM + 2 SERP AI (Google, Bing)
const PLATFORM_KEYS = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "deepseek",
  "grok",
  "google_ai_overview",
  "bing_copilot",
] as const;

export type ProductLoadingType = CheckType | null;

export interface AIVisibilityCardProps {
  favorites: Favorite[];
  selectedFavoriteId: string | null;
  onSelectFavorite: (id: string) => void;
  visibilityScore: number | null;
  visibilityTrend: "up" | "down" | "flat" | null;
  platformsData: PlatformData | null;
  mentionCount: number;
  platformTotal: number;
  highPriorityGaps: number;
  hasCompetitors: boolean;
  onOpenProduct: (favorite: Favorite) => void;
  onAddFirstProduct: () => void;
  onFindEnemy: () => void;
  isProductDetailLoading: boolean;
  // New props for AnimatedCardWrapper and UnifiedCardDropdown
  loadingType?: ProductLoadingType;
  onRecognitionCheck?: (favorite: Favorite) => void;
  onTrafficCheck?: (favorite: Favorite) => void;
  onSEOCheck?: (favorite: Favorite) => void;
  onFullCheck?: (favorite: Favorite) => void;
  onMonitoringSettings?: (favorite: Favorite) => void;
}

function AIVisibilityCardComponent({
  favorites,
  selectedFavoriteId,
  onSelectFavorite,
  visibilityScore,
  visibilityTrend,
  platformsData,
  mentionCount,
  platformTotal,
  highPriorityGaps,
  hasCompetitors,
  onOpenProduct,
  onAddFirstProduct,
  onFindEnemy,
  isProductDetailLoading,
  loadingType,
  onRecognitionCheck,
  onTrafficCheck,
  onSEOCheck,
  onFullCheck,
  onMonitoringSettings,
}: AIVisibilityCardProps): React.ReactElement {
  const primaryFavorite =
    favorites.find((f) => f.id === selectedFavoriteId) ||
    favorites.find((f) => f.is_primary) ||
    favorites[0];

  const hasVisibilityData = visibilityScore !== null;
  const mentionPlatforms = new Set(
    PLATFORM_KEYS.filter((p) => platformsData?.[p]?.mentioned),
  );

  const isAnimating = loadingType !== null && loadingType !== undefined;

  if (!primaryFavorite) {
    return (
      <div className={cn(CARD_BASE, "p-4 sm:p-5")}>
        <div className="space-y-3">
          <div>
            <p className="text-base sm:text-lg font-semibold text-slate-900">
              Add your first product
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Run a quick visibility check, then save it as your primary
              product.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full h-10 bg-slate-900 text-white hover:bg-slate-800"
              onClick={onAddFirstProduct}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add first product
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full h-10">
              <Link href="/dashboard/ai-insights">Open AI Insights</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cardContent = (
    <div className={cn(CARD_BASE, "p-4 sm:p-5")}>
      {/* Header with colored icon + last update badge + control menu */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Your Position
          </span>
        </div>
        <div className="flex items-center gap-2">
          {primaryFavorite.updated_at && (
            <Badge
              variant="secondary"
              className="text-[10px] gap-1 bg-slate-100/80 text-slate-500"
            >
              <RefreshCw className="h-3 w-3" />
              {new Date(primaryFavorite.updated_at).toLocaleDateString()}
            </Badge>
          )}
          {(onRecognitionCheck ||
            onTrafficCheck ||
            onSEOCheck ||
            onFullCheck ||
            onMonitoringSettings) && (
            <UnifiedCardDropdown
              item={favoriteToUnifiedItem(primaryFavorite)}
              actions={{
                onViewResults: () => onOpenProduct(primaryFavorite),
                onRecognitionCheck: onRecognitionCheck
                  ? () => onRecognitionCheck(primaryFavorite)
                  : undefined,
                onTrafficCheck: onTrafficCheck
                  ? () => onTrafficCheck(primaryFavorite)
                  : undefined,
                onSEOCheck: onSEOCheck
                  ? () => onSEOCheck(primaryFavorite)
                  : undefined,
                onFullCheck: onFullCheck
                  ? () => onFullCheck(primaryFavorite)
                  : undefined,
                onMonitoringSettings: onMonitoringSettings
                  ? () => onMonitoringSettings(primaryFavorite)
                  : undefined,
              }}
              isLoading={isAnimating}
              loadingType={loadingType}
            />
          )}
        </div>
      </div>

      {/* Product Selector */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenProduct(primaryFavorite)}
            className="inline-flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900 hover:text-blue-600 transition"
          >
            {primaryFavorite.name || primaryFavorite.domain}
            {isProductDetailLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </button>
          {favorites.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-slate-100 transition"
                  title="Switch product"
                >
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {favorites.map((fav) => (
                  <DropdownMenuItem
                    key={fav.id}
                    onClick={() => onSelectFavorite(fav.id)}
                    className={cn(
                      "cursor-pointer",
                      fav.id === primaryFavorite.id &&
                        "bg-slate-100 font-medium",
                    )}
                  >
                    <span className="truncate">{fav.name || fav.domain}</span>
                    {fav.is_primary && (
                      <Badge
                        variant="secondary"
                        className="ml-auto text-[9px] px-1"
                      >
                        Primary
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="text-xs text-slate-400">{primaryFavorite.domain}</p>
      </div>

      {/* Score + Trend */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-baseline">
          <span className="text-3xl sm:text-4xl font-black text-slate-900">
            {visibilityScore !== null ? visibilityScore : "—"}
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-300 ml-0.5">
            %
          </span>
        </div>
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            visibilityTrend === "up"
              ? "bg-emerald-50"
              : visibilityTrend === "down"
                ? "bg-red-50"
                : "bg-slate-50",
          )}
        >
          {visibilityTrend === "up" ? (
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          ) : visibilityTrend === "down" ? (
            <TrendingDown className="h-4 w-4 text-red-600" />
          ) : (
            <span className="text-slate-400 text-xs font-bold">—</span>
          )}
        </div>
      </div>

      {/* Platform Coverage */}
      <div className="space-y-1.5 mb-4">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Platform Coverage
        </div>
        <div className="grid grid-cols-3 gap-1">
          {PLATFORM_KEYS.map((platform) => {
            const isMentioned = mentionPlatforms.has(platform);
            const platformData = platformsData?.[platform];
            const isInSources = platformData?.in_sources;
            return (
              <div
                key={`platform-card-${platform}`}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-lg border transition",
                  isInSources
                    ? "bg-emerald-100/90 border-emerald-300/70"
                    : isMentioned
                      ? "bg-emerald-50/80 border-emerald-200/60"
                      : "bg-slate-50/50 border-slate-200/40",
                )}
              >
                <Image
                  src={PLATFORM_ICONS[platform]}
                  alt={PLATFORM_LABELS[platform]}
                  width={20}
                  height={20}
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5",
                    !isMentioned && !isInSources && "grayscale opacity-40",
                  )}
                />
                <span
                  className={cn(
                    "text-[7px] sm:text-[8px] font-medium truncate max-w-full text-center leading-tight",
                    isInSources
                      ? "text-emerald-800"
                      : isMentioned
                        ? "text-emerald-700"
                        : "text-slate-400",
                  )}
                >
                  {PLATFORM_LABELS[platform]?.slice(0, 7) || platform}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            LLM Mentions
          </div>
          <div className="text-lg font-bold text-slate-900">
            {hasVisibilityData ? mentionCount : "—"}
            <span className="text-sm text-slate-400">/{platformTotal}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Weaknesses
          </div>
          <div
            className={cn(
              "text-lg font-bold flex items-center gap-1",
              highPriorityGaps > 0 ? "text-amber-600" : "text-emerald-600",
            )}
          >
            {highPriorityGaps > 0 && <AlertTriangle className="h-4 w-4" />}
            {highPriorityGaps === 0 ? "—" : highPriorityGaps}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 border-slate-200 bg-white/50"
          onClick={() => onOpenProduct(primaryFavorite)}
          disabled={!primaryFavorite || isProductDetailLoading}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Run Check
        </Button>
        {hasCompetitors ? (
          <Button
            asChild
            size="sm"
            className="w-full h-9 bg-slate-900 hover:bg-slate-800"
          >
            <Link href="/dashboard/ai-insights?tab=content-gaps">
              Analyze Gaps
            </Link>
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full h-9 bg-slate-900 hover:bg-slate-800"
            onClick={onFindEnemy}
            disabled={isProductDetailLoading}
            title="Add competitors to run gaps analysis"
          >
            Analyze Gaps
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <AnimatedCardWrapper
      variant="conic"
      isAnimating={isAnimating}
      borderRadius="rounded-2xl"
    >
      {cardContent}
    </AnimatedCardWrapper>
  );
}

export const AIVisibilityCard = memo(AIVisibilityCardComponent);
