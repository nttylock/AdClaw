"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NEW_CARD_IDS as NEW_CARD_IDS_ARRAY,
  type CardId,
  type PresetDefinition,
} from "@/lib/dashboard/presets";
import type { CardsDataResponse } from "@/app/api/dashboard/cards-data/route";

// Existing cards (imported from /new/)
import {
  AIVisibilityCard,
  CompetitorsCard,
  CounterStrikeCard,
  RecommendedActionsCard,
  ContentFactoryCard,
  DistributionCard,
  RecentArticlesCard,
  GscUnifiedCard,
} from "@/components/dashboard-cards";
import type {
  AIVisibilityCardProps,
  CompetitorsCardProps,
  CounterStrikeCardProps,
  RecommendedActionsCardProps,
  ContentFactoryCardProps,
  DistributionCardProps,
  RecentArticlesCardProps,
  GscUnifiedCardProps,
} from "@/components/dashboard-cards";

// New cards
import {
  HumanizerCard,
  MediaCard,
  AutopilotEngineCard,
  AdaptationsCard,
  BrandReputationCard,
  AgentStatsCard,
  LeadMagnetsCard,
  RoastScoreCard,
} from "../_components/cards";

import { AnimatedCardWrapper } from "@/components/ui/animated-card-wrapper";
import { domainToSlug } from "@/lib/roast/utils";

// ── Prop bundles ─────────────────────────────

export interface ExistingCardProps {
  gsc: GscUnifiedCardProps & { refreshBusy: boolean };
  aiVisibility: AIVisibilityCardProps;
  competitors: CompetitorsCardProps;
  recentArticles: RecentArticlesCardProps;
  counterStrike: CounterStrikeCardProps;
  recommendedActions: RecommendedActionsCardProps;
  contentFactory: ContentFactoryCardProps;
  distribution: DistributionCardProps;
}

// ── Card Renderer ────────────────────────────

export interface CardRendererProps {
  preset: PresetDefinition;
  existing: ExistingCardProps;
  cardsData: CardsDataResponse | null;
  tenantId: string;
  isCardsLoading?: boolean;
}

const NEW_CARD_IDS = new Set<CardId>(NEW_CARD_IDS_ARRAY);

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/40 bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 p-6 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function renderCard(
  cardId: CardId,
  existing: ExistingCardProps,
  cardsData: CardsDataResponse | null,
  router: ReturnType<typeof useRouter>,
  tenantId: string,
): ReactNode {
  switch (cardId) {
    case "gsc":
      return (
        <AnimatedCardWrapper
          variant="conic"
          isAnimating={existing.gsc.refreshBusy}
          borderRadius="rounded-2xl"
        >
          <GscUnifiedCard
            connected={existing.gsc.connected}
            bound={existing.gsc.bound}
            summary={existing.gsc.summary}
            timeseries={existing.gsc.timeseries}
            domain={existing.gsc.domain}
            boundSiteUrl={existing.gsc.boundSiteUrl}
            lastSyncAt={existing.gsc.lastSyncAt}
            onConnect={existing.gsc.onConnect}
            onRefresh={existing.gsc.onRefresh}
            refreshing={existing.gsc.refreshing}
            onManage={existing.gsc.onManage}
            className="w-full"
          />
        </AnimatedCardWrapper>
      );

    case "ai-visibility":
      return <AIVisibilityCard {...existing.aiVisibility} />;

    case "competitors":
      return <CompetitorsCard {...existing.competitors} />;

    case "recent-articles":
      return <RecentArticlesCard {...existing.recentArticles} />;

    case "counter-strike":
      return <CounterStrikeCard {...existing.counterStrike} />;

    case "recommended-actions":
      return <RecommendedActionsCard {...existing.recommendedActions} />;

    case "content-factory":
      return <ContentFactoryCard {...existing.contentFactory} />;

    case "distribution":
      return <DistributionCard {...existing.distribution} />;

    // ── New cards ────────────────────────────

    case "humanizer": {
      const d = cardsData?.humanizer;
      if (!d) return null;
      return (
        <HumanizerCard
          {...d}
          tenantId={tenantId}
          onViewAll={() => router.push("/dashboard/blog")}
        />
      );
    }

    case "media": {
      const d = cardsData?.media;
      if (!d) return null;
      return <MediaCard {...d} tenantId={tenantId} />;
    }

    case "autopilot-engine": {
      const d = cardsData?.autopilot;
      if (!d) return null;
      return (
        <AutopilotEngineCard
          {...d}
          onLaunchAutopilot={() => router.push("/dashboard/autopilot")}
          onViewQueue={() => router.push("/dashboard/autopilot?tab=queue")}
        />
      );
    }

    case "adaptations": {
      const d = cardsData?.adaptations;
      if (!d) return null;
      return (
        <AdaptationsCard
          {...d}
          onAdaptLatest={() => router.push("/dashboard/blog")}
          onViewAll={() => router.push("/dashboard/blog")}
        />
      );
    }

    case "brand-reputation": {
      const d = cardsData?.brandReputation;
      if (!d) return null;
      return (
        <BrandReputationCard
          {...d}
          onRunRedditScout={() =>
            router.push("/dashboard/ai-insights/reddit-intent")
          }
          onRunXScout={() => router.push("/dashboard/ai-insights/x-intent")}
        />
      );
    }

    case "agent-stats": {
      const d = cardsData?.agentStats;
      if (!d) return null;
      return (
        <AgentStatsCard
          {...d}
          onManageAgents={() =>
            router.push("/dashboard/settings?section=team&agent=connect")
          }
          onViewActivity={() =>
            router.push("/dashboard/settings?section=team&agent=connect")
          }
        />
      );
    }

    case "lead-magnets": {
      const d = cardsData?.leadMagnets;
      if (!d) return null;
      return (
        <LeadMagnetsCard
          {...d}
          onCreateMagnet={() => router.push("/dashboard/lead-magnets")}
          onViewAll={() => router.push("/dashboard/lead-magnets")}
        />
      );
    }

    case "roast-score": {
      const d = cardsData?.roastScore;
      return (
        <RoastScoreCard
          domain={d?.domain ?? null}
          seoScore={d?.seoScore ?? null}
          seoGrade={d?.seoGrade ?? null}
          speedScore={d?.speedScore ?? null}
          speedGrade={d?.speedGrade ?? null}
          bestSeoQuote={d?.bestSeoQuote ?? null}
          onRoastSite={() => router.push("/roast")}
          onViewRoast={() =>
            router.push(
              d?.domain ? `/roast/${domainToSlug(d.domain)}` : "/roast",
            )
          }
        />
      );
    }

    default:
      return null;
  }
}

export function CardGrid({
  preset,
  existing,
  cardsData,
  tenantId,
  isCardsLoading,
}: CardRendererProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {(["left", "center", "right"] as const).map((col) => (
        <div key={col} className="space-y-6">
          {preset.layout[col].map((cardId) => {
            // Show skeleton for new cards while loading
            if (isCardsLoading && NEW_CARD_IDS.has(cardId)) {
              return <CardSkeleton key={cardId} />;
            }
            const rendered = renderCard(
              cardId,
              existing,
              cardsData,
              router,
              tenantId,
            );
            if (!rendered) return null;
            return <div key={cardId}>{rendered}</div>;
          })}
        </div>
      ))}
    </div>
  );
}
