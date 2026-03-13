"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Eye, Target, Coins, Info } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTenant } from "@/lib/tenant-context";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { tenantFetch } from "@/lib/utils/tenant-fetch";
import { warRoomReducer, initialState } from "@/lib/war-room/reducer";
import type { OnboardingProgress } from "@/lib/war-room/types";
import { useWarRoomPreferences } from "@/lib/war-room/preferences";
import { useWarRoomData } from "@/lib/hooks/use-war-room";
import {
  useWarRoomActions,
  type VisibilityTrend,
} from "@/lib/hooks/use-war-room-actions";
import { PLATFORM_LABELS } from "@/lib/ai-insights/utils";

const PLATFORM_KEYS = Object.keys(PLATFORM_LABELS);
const PLATFORM_TOTAL = PLATFORM_KEYS.length;
import {
  AI_INSIGHTS_COSTS,
  calculateLLMVisibilityCost,
  calculateSERPAICost,
} from "@/lib/billing/pricing-constants";
import type {
  Competitor,
  Favorite,
  VisibilityResult,
} from "@/lib/ai-insights/types";
import type { GscDailyMetric, GscSummary } from "@/lib/seo/gsc-metrics";
import type {
  DiscoveryData,
  CheckType,
} from "@/components/ai-insights/shared/types";
import type { CompetitorMetrics } from "@/components/ai-insights/CompetitorSEOContent";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AnimatedCardWrapper } from "@/components/ui/animated-card-wrapper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeatureLock, useAITrafficFeature } from "@/components/ui/feature-lock";
import {
  WarRoomProvider,
  WarRoomHero,
  WarRoomWelcomeHeader,
  WarRoomSkeleton,
} from "@/components/war-room";
import { AddCompetitorDialog } from "@/components/ai-insights/AddCompetitorDialog";
import { FindEnemyDialog } from "@/components/war-room/FindEnemyDialog";
import {
  CompetitorDetailPopup,
  type LLMCheckOptions,
  type UnifiedCompetitor,
} from "@/components/ai-insights/CompetitorDetailPopup";
import { QuickCheckCard } from "@/components/ai-insights/QuickCheckCard";
import { SaveDomainDialog } from "@/components/ai-insights/SaveDomainDialog";
import { trackEvent, trackPageView } from "@/lib/analytics";
import { PAGE_VIEW_EVENTS } from "@/lib/analytics/types";
import { NoWorkspaceBanner } from "@/components/billing/NoWorkspaceBanner";
import {
  clearGscConnectStatus,
  readGscConnectStatus,
  startGscConnect,
} from "@/lib/integrations/gsc-connect";

// ── Dashboard Presets imports ────────────────
import { PRESETS, type PresetId } from "@/lib/dashboard/presets";
import { useDashboardLayout } from "@/lib/dashboard/use-dashboard-layout";
import {
  useDashboardCardsData,
  useUserStage,
  usePresetUnlock,
} from "./_hooks/use-dashboard-data";
import { PresetSelector } from "./_components/PresetSelector";
import { CardGrid, type ExistingCardProps } from "./_lib/card-renderer";

// ── Constants ────────────────────────────────

const DIRECT_LLM_PROVIDERS = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "deepseek",
  "grok",
] as const;

const ASK_ALL_PROVIDERS_COST =
  DIRECT_LLM_PROVIDERS.length * AI_INSIGHTS_COSTS.LLM_RESPONSE_PER_PLATFORM;
const GSC_REFRESH_COOLDOWN_HOURS = Math.max(
  0,
  Number(process.env.NEXT_PUBLIC_GSC_REFRESH_COOLDOWN_HOURS ?? 12),
);
const ENFORCE_GSC_REFRESH_COOLDOWN =
  process.env.NODE_ENV === "production" && GSC_REFRESH_COOLDOWN_HOURS > 0;

// ── Helpers ──────────────────────────────────

function countMentionsFromResults(results: VisibilityResult[]) {
  return results.reduce(
    (sum, result) =>
      sum + Object.values(result.mentions || {}).filter(Boolean).length,
    0,
  );
}

function mergeVisibilityResults(
  existing: VisibilityResult[] | null | undefined,
  incoming: VisibilityResult[],
) {
  const existingResults = Array.isArray(existing) ? existing : [];
  const incomingResults = Array.isArray(incoming) ? incoming : [];
  return [...incomingResults, ...existingResults];
}

type SnapshotPlatformDataItem = {
  mentioned: boolean;
  score: number;
};

function toSnapshotPlatformsData(
  platformsData: Record<string, { mentioned?: boolean; score?: number }>,
): Record<string, SnapshotPlatformDataItem> {
  return Object.fromEntries(
    Object.entries(platformsData).map(([platform, data]) => [
      platform,
      {
        mentioned: Boolean(data?.mentioned),
        score: typeof data?.score === "number" ? data.score : 0,
      },
    ]),
  );
}

// ── Page Component ───────────────────────────

export default function DashboardPresetsPage(): ReactNode {
  const router = useRouter();
  const { user } = useAuth();
  const {
    tenantId,
    blogHandle,
    isLoading: tenantLoading,
    tenantStatus,
    error: tenantError,
  } = useTenant();
  const [state, dispatch] = useReducer(warRoomReducer, initialState);
  const { toast } = useToast();
  const aiTrafficFeature = useAITrafficFeature();
  const { selectedFavoriteId: persistedFavoriteId, updatePreferences } =
    useWarRoomPreferences(tenantId);

  // ── Dashboard Presets ────────────────────────
  const { preset: activePresetId, updatePreset } = useDashboardLayout(tenantId);
  const activePreset = PRESETS[activePresetId];

  const {
    data,
    isDataLoading,
    refetch,
    primaryFavorite,
    topCompetitors,
    topCriticalGaps,
    counterStrikeSessions,
    recommendedActions,
    canLaunchCounterStrike,
  } = useWarRoomData(state.product.selectedFavoriteId);

  // Cards data for new cards (only when not universal)
  const { cardsData, isCardsLoading } = useDashboardCardsData(activePresetId);

  // Progressive unlock
  const userStage = useUserStage(
    primaryFavorite,
    state.data.stats?.totalArticles ?? 0,
    cardsData,
  );
  const _isUnlocked = usePresetUnlock(userStage);

  // ── War Room sync effects ───────────────────

  useEffect(() => {
    if (!persistedFavoriteId) return;
    if (state.product.selectedFavoriteId) return;
    const favorites = data?.favorites ?? [];
    if (!favorites.some((item) => item.id === persistedFavoriteId)) return;
    dispatch({
      type: "SET_SELECTED_FAVORITE_ID",
      payload: persistedFavoriteId,
    });
  }, [data?.favorites, persistedFavoriteId, state.product.selectedFavoriteId]);

  const handleOnboardingDismiss = useCallback(() => {
    dispatch({ type: "DISMISS_ONBOARDING" });
  }, [dispatch]);

  const handleTrendUpdate = useCallback(
    (trend: VisibilityTrend) => {
      dispatch({ type: "SET_VISIBILITY_TREND", payload: trend });
    },
    [dispatch],
  );

  const actions = useWarRoomActions({
    onOnboardingDismiss: handleOnboardingDismiss,
    onTrendUpdate: handleTrendUpdate,
    refetch,
  });

  const fetchTrendForProduct = actions.fetchTrendForProduct;
  const dismissOnboarding = actions.dismissOnboarding;
  const addGapToAutopilot = actions.addGapToAutopilot;
  const toggleSession = actions.toggleSession;
  const lastTrendFetchedFavoriteIdRef = useRef<string | null>(null);

  const [gscStatus, setGscStatus] = useState<{
    connected: boolean;
    account?: { metadata?: Record<string, unknown> | null };
  } | null>(null);

  const refreshGscStatus = useCallback(async () => {
    if (!tenantId) return;
    const response = await tenantFetch("/api/integrations/gsc/status", {
      tenantId,
    });
    if (!response.ok) {
      setGscStatus({ connected: false });
      return;
    }
    const data = (await response.json()) as {
      connected: boolean;
      account?: { metadata?: Record<string, unknown> | null };
    };
    setGscStatus({ connected: Boolean(data.connected), account: data.account });
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;

    tenantFetch("/api/tenant/onboarding", { tenantId })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { status?: "pending" | "done" };
      })
      .then((result) => {
        if (cancelled) return;
        if (!result?.status) return;
        dispatch({
          type: "SET_ONBOARDING_STATUS",
          payload: result.status === "done" ? "done" : "pending",
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId || typeof window === "undefined") return;
    const saved =
      window.localStorage.getItem(`onboarding_v2_progress_${tenantId}`) ??
      window.localStorage.getItem(`onboarding_progress_${tenantId}`);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as OnboardingProgress;
      dispatch({
        type: "SET_PROGRESS",
        payload: parsed,
      });
    } catch (e) {
      logger.warn("Failed to parse progress", {
        component: "WarRoom",
        error: e instanceof Error ? e.message : String(e),
      });
      dispatch({ type: "SET_PROGRESS", payload: null });
    }
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    refreshGscStatus();
  }, [tenantId, refreshGscStatus]);

  useEffect(() => {
    const status = readGscConnectStatus();
    if (!status) return;
    toast({
      title: status.success
        ? "Google Search Console connected"
        : "Google Search Console connection failed",
      description: status.message,
      variant: status.success ? "default" : "destructive",
    });
    clearGscConnectStatus();
    if (status.success) {
      refreshGscStatus();
      void refetch();
    }
  }, [refreshGscStatus, refetch, toast]);

  useEffect(() => {
    if (!tenantId || isDataLoading || !data) return;

    trackEvent(PAGE_VIEW_EVENTS.WAR_ROOM, {
      tenant_id: tenantId,
      products_count: data.favorites.length,
      competitors_count: data.competitors.length,
      sessions_count: data.sessions.length,
      has_active_session: data.sessions.some(
        (s) => s.status === "running" || s.status === "paused",
      ),
    });

    if (typeof window !== "undefined") {
      trackPageView(window.location.pathname);
    }
  }, [tenantId, isDataLoading, data]);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;

    tenantFetch(`/api/tenants/${tenantId}`, { tenantId })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          settings?: { domain_status?: string; custom_domain?: string };
        };
      })
      .then((result) => {
        if (cancelled) return;
        const settings = result?.settings;
        const customDomain =
          settings?.domain_status === "active" && settings?.custom_domain
            ? settings.custom_domain
            : null;
        dispatch({ type: "SET_CUSTOM_DOMAIN", payload: customDomain });
      })
      .catch(() => {
        if (cancelled) return;
        dispatch({ type: "SET_CUSTOM_DOMAIN", payload: null });
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  // ── Product Check Cost Calculations ─────────

  const getRecognitionCost = useCallback((favorite: Favorite) => {
    const brandName =
      favorite.brand_variants?.[0] || favorite.name || favorite.domain;
    const needsBoth = brandName.toLowerCase() !== favorite.domain.toLowerCase();
    const queryCount = needsBoth ? 4 : 2;
    return calculateLLMVisibilityCost(queryCount);
  }, []);

  const productCheckCost = useMemo(() => {
    const target = state.product.checkTarget;
    if (!target) return 0;
    const recognitionCost = state.product.runRecognition
      ? getRecognitionCost(target)
      : 0;
    const serpAICost = state.product.runSerpAI ? calculateSERPAICost() : 0;
    const discoveryCost = state.product.runDiscovery
      ? AI_INSIGHTS_COSTS.LLM_DISCOVERY
      : 0;
    const seoCost = state.product.runSEO ? AI_INSIGHTS_COSTS.SEO_ANALYSIS : 0;
    return recognitionCost + serpAICost + discoveryCost + seoCost;
  }, [
    state.product.checkTarget,
    state.product.runRecognition,
    state.product.runSerpAI,
    state.product.runDiscovery,
    state.product.runSEO,
    getRecognitionCost,
  ]);

  const productRecognitionCost = state.product.checkTarget
    ? getRecognitionCost(state.product.checkTarget)
    : 0;

  // ── Product Detail Helpers ──────────────────

  const fetchProductDetail = useCallback(
    async (favorite: Favorite): Promise<Favorite> => {
      if (!tenantId) return favorite;
      const response = await tenantFetch(
        `/api/ai-insights/favorites/${favorite.id}?tenantId=${encodeURIComponent(tenantId)}`,
        { tenantId },
      );
      if (!response.ok) return favorite;
      const data = await response.json();
      return (data.favorite as Favorite) || favorite;
    },
    [tenantId],
  );

  const hasProductLLMData = (favorite: Favorite | null) => {
    if (!favorite) return false;
    return (
      favorite.last_check !== null &&
      (favorite.visibility_score !== null ||
        (favorite.platforms_data &&
          Object.keys(favorite.platforms_data || {}).length > 0))
    );
  };

  const hasProductSEOData = (favorite: Favorite | null) => {
    if (!favorite) return false;
    return Boolean(favorite.seo_metrics);
  };

  // ── Product Check Functions ─────────────────

  const runProductRecognitionCheck = useCallback(
    async (favorite: Favorite) => {
      if (!tenantId) throw new Error("Tenant context not ready yet");
      dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: "llm" });

      try {
        const brandName =
          favorite.brand_variants?.[0] || favorite.name || favorite.domain;
        const needsBoth =
          brandName.toLowerCase() !== favorite.domain.toLowerCase();
        const recognitionQueries = [
          `what is ${favorite.domain}`,
          `${favorite.domain} reviews`,
        ];
        if (needsBoth) {
          recognitionQueries.push(`what is ${brandName}`);
          recognitionQueries.push(`${brandName} reviews`);
        }

        const response = await tenantFetch(
          "/api/ai-insights/competitors/analyze",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              domain: favorite.domain,
              queries: recognitionQueries,
              platforms: DIRECT_LLM_PROVIDERS,
            }),
            tenantId,
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Recognition check failed");
        }

        const data = await response.json();
        const summary = data.summary as {
          avg_visibility?: number;
          domain_mentioned_count?: number;
        } | null;

        const rawResults = Array.isArray(data.results)
          ? (data.results as VisibilityResult[])
          : [];
        const platformsData =
          data.platformsData && typeof data.platformsData === "object"
            ? (data.platformsData as Record<
                string,
                { mentioned?: boolean; score?: number }
              >)
            : {};
        const snapshotPlatformsData = toSnapshotPlatformsData(platformsData);
        const mentionsCount =
          summary?.domain_mentioned_count ??
          (rawResults.length > 0 ? countMentionsFromResults(rawResults) : 0);

        const patchResponse = await tenantFetch(
          `/api/ai-insights/favorites/${favorite.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              visibility_score: summary?.avg_visibility || 0,
              mentions_count: mentionsCount,
              platforms_data: platformsData,
              last_check: new Date().toISOString(),
              last_check_results: rawResults,
            }),
            tenantId,
          },
        );

        if (!patchResponse.ok) {
          const errorData = await patchResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to save recognition data");
        }

        const updatedData = await patchResponse.json();
        const updatedFavorite = updatedData.favorite as Favorite;

        await tenantFetch("/api/ai-insights/snapshots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            favoriteId: favorite.id,
            domain: favorite.domain,
            visibilityScore: summary?.avg_visibility || 0,
            mentionsCount,
            platformsData: snapshotPlatformsData,
          }),
          tenantId,
        });
        dispatch({ type: "SET_PRODUCT_DETAIL", payload: updatedFavorite });
        await refetch();
      } finally {
        dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: null });
      }
    },
    [tenantId, refetch],
  );

  const runProductSerpAICheck = useCallback(
    async (favorite: Favorite) => {
      if (!tenantId) throw new Error("Tenant context not ready yet");
      dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: "llm" });
      try {
        const brandName =
          favorite.brand_variants?.[0] || favorite.name || favorite.domain;
        const serpRes = await tenantFetch("/api/ai-insights/serp-ai-check", {
          tenantId,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            domain: favorite.domain,
            query: `what is ${brandName}`,
            favoriteId: favorite.id,
            platforms: ["google_ai_overview", "bing_copilot"],
          }),
        });
        if (!serpRes.ok) throw new Error("SERP AI check failed");

        await refetch();
        const refreshed = await fetchProductDetail(favorite);
        dispatch({ type: "SET_PRODUCT_DETAIL", payload: refreshed });
      } finally {
        dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: null });
      }
    },
    [tenantId, refetch, fetchProductDetail],
  );

  const runProductDiscoveryCheck = useCallback(
    async (favorite: Favorite) => {
      if (!tenantId) throw new Error("Tenant context not ready yet");
      dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: "discovery" });
      try {
        const response = await tenantFetch("/api/ai-insights/organic-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            domain: favorite.domain,
            brandVariants:
              favorite.brand_variants || [favorite.name].filter(Boolean),
          }),
          tenantId,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || "AI traffic check failed");
        }

        const data = await response.json();

        const patchResponse = await tenantFetch(
          `/api/ai-insights/favorites/${favorite.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              discovery_data: {
                discovered_at: new Date().toISOString(),
                found_in_index: data.found_in_index,
                organic_score: data.organicScore,
                total_mentions_in_index: data.totalMentions,
                total_search_volume: data.totalSearchVolume,
                queries_found: data.queries || [],
                top_competitors: Array.isArray(data.competitors)
                  ? data.competitors.map((competitor: unknown) =>
                      typeof competitor === "string"
                        ? { domain: competitor, mentions: 0 }
                        : {
                            domain:
                              (competitor as { domain?: string })?.domain ??
                              "unknown",
                            mentions:
                              typeof (competitor as { mentions?: number })
                                ?.mentions === "number"
                                ? (competitor as { mentions: number }).mentions
                                : 0,
                          },
                    )
                  : [],
              },
              discovered_at: new Date().toISOString(),
            }),
            tenantId,
          },
        );

        if (patchResponse.ok) {
          const patchData = await patchResponse.json();
          dispatch({
            type: "SET_PRODUCT_DETAIL",
            payload: patchData.favorite as Favorite,
          });
        }

        await tenantFetch("/api/ai-insights/snapshots?type=organic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            favoriteId: favorite.id,
            domain: favorite.domain,
            organicScore: data.organicScore || 0,
            mentionsInIndex: data.totalMentions || 0,
            totalSearchVolume: data.totalSearchVolume || 0,
            platformsData: {},
            queriesFound: data.queries?.length || 0,
            topQueries: (data.queries || [])
              .slice(0, 10)
              .map((q: { query: string; ai_search_volume?: number }) => ({
                query: q.query,
                volume: q.ai_search_volume,
              })),
          }),
          tenantId,
        });

        await refetch();
      } finally {
        dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: null });
      }
    },
    [tenantId, refetch],
  );

  const runProductSEOCheck = useCallback(
    async (favorite: Favorite) => {
      if (!tenantId) throw new Error("Tenant context not ready yet");
      dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: "seo" });
      try {
        const response = await tenantFetch(
          `/api/ai-insights/favorites/${favorite.id}/analyze`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantId }),
            tenantId,
          },
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "SEO analysis failed");
        }
        const data = await response.json();
        if (data.favorite) {
          dispatch({
            type: "SET_PRODUCT_DETAIL",
            payload: data.favorite as Favorite,
          });
        }
        await refetch();
      } finally {
        dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: null });
      }
    },
    [tenantId, refetch],
  );

  const handleRunProductFullCheck = useCallback(async () => {
    const target = state.product.checkTarget;
    if (!target) return;
    let completed = false;
    dispatch({ type: "SET_PRODUCT_FULL_CHECK_RUNNING", payload: true });
    toast({
      title: "Running full product check",
      description:
        "This can take a minute. We'll update the results as checks finish.",
    });
    try {
      if (state.product.runRecognition) {
        await runProductRecognitionCheck(target);
      }
      if (state.product.runSerpAI) {
        dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: "llm" });
        const brandName =
          target.brand_variants?.[0] || target.name || target.domain;
        const serpRes2 = await tenantFetch("/api/ai-insights/serp-ai-check", {
          tenantId,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            domain: target.domain,
            query: `what is ${brandName}`,
            favoriteId: target.id,
            platforms: ["google_ai_overview", "bing_copilot"],
          }),
        });
        if (!serpRes2.ok) throw new Error("SERP AI check failed");
      }
      if (state.product.runDiscovery) {
        await runProductDiscoveryCheck(target);
      }
      if (state.product.runSEO) {
        await runProductSEOCheck(target);
      }
      await refetch();
      const refreshed = await fetchProductDetail(target);
      dispatch({ type: "SET_PRODUCT_DETAIL", payload: refreshed });
      dispatch({ type: "SET_PRODUCT_DETAIL_OPEN", payload: true });
      completed = true;
      toast({
        title: "Full check complete",
        description: "Latest product intelligence is now available.",
      });
    } catch (error) {
      toast({
        title: "Product check failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: null });
      dispatch({ type: "SET_PRODUCT_FULL_CHECK_RUNNING", payload: false });
      if (completed) {
        dispatch({ type: "SET_PRODUCT_FULL_CHECK_OPEN", payload: false });
      }
    }
  }, [
    state.product.checkTarget,
    state.product.runRecognition,
    state.product.runSerpAI,
    state.product.runDiscovery,
    state.product.runSEO,
    tenantId,
    toast,
    runProductRecognitionCheck,
    runProductDiscoveryCheck,
    runProductSEOCheck,
    refetch,
    fetchProductDetail,
  ]);

  const handleAskAllProvidersForProduct = useCallback(
    async (favorite: Favorite, query: string) => {
      if (!tenantId) return;
      dispatch({ type: "SET_PRODUCT_ASK_ALL_LOADING", payload: true });
      try {
        const response = await tenantFetch("/api/ai-insights/custom-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            domain: favorite.domain,
            query,
            providers: DIRECT_LLM_PROVIDERS,
          }),
          tenantId,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || "Custom query failed");
        }

        const data = await response.json();
        const newResults = Array.isArray(data.results)
          ? (data.results as VisibilityResult[])
          : [];
        const updatedResults = mergeVisibilityResults(
          favorite.last_check_results,
          newResults,
        );

        const patchResponse = await tenantFetch(
          `/api/ai-insights/favorites/${favorite.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              last_check_results: updatedResults,
            }),
            tenantId,
          },
        );

        if (!patchResponse.ok) {
          const err = await patchResponse.json().catch(() => ({}));
          throw new Error(err.error || "Failed to save custom query");
        }

        const updated = await patchResponse.json();
        if (updated?.favorite) {
          dispatch({
            type: "SET_PRODUCT_DETAIL",
            payload: updated.favorite as Favorite,
          });
        }
        await refetch();

        toast({
          title: "Custom query complete",
          description: `Saved results for ${favorite.domain}`,
        });
      } catch (error) {
        toast({
          title: "Custom query failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: "SET_PRODUCT_ASK_ALL_LOADING", payload: false });
      }
    },
    [tenantId, toast, refetch],
  );

  // ── Competitor Popup Helpers ─────────────────

  const fetchCompetitorDetail = useCallback(
    async (competitorId: string): Promise<Competitor | null> => {
      if (!tenantId) return null;
      const response = await tenantFetch(
        `/api/ai-insights/competitors/${competitorId}?tenantId=${encodeURIComponent(tenantId)}`,
        { tenantId },
      );
      if (!response.ok) return null;
      const data = await response.json().catch(() => null);
      return (data?.competitor as Competitor) || null;
    },
    [tenantId],
  );

  const refreshWarRoomData = useCallback(
    async (competitorId?: string) => {
      const next = await refetch();
      if (competitorId) {
        const latestCompetitors = next.data?.competitors ?? [];
        const updated = latestCompetitors.find((c) => c.id === competitorId);
        if (updated) {
          dispatch({ type: "SET_SELECTED_COMPETITOR_POPUP", payload: updated });
        }
      }
    },
    [refetch],
  );

  const handleCloseCompetitorPopup = useCallback(() => {
    dispatch({ type: "CLOSE_COMPETITOR_POPUP" });
  }, []);

  const handleRefreshLLMFromPopup = useCallback(
    async (options: LLMCheckOptions) => {
      const competitor = state.competitorPopup.selected;
      if (!competitor || !tenantId) return;
      const { runRecognition, runDiscovery } = options;
      if (!runRecognition && !runDiscovery) return;
      dispatch({ type: "SET_POPUP_REFRESHING_TYPE", payload: "llm" });
      const domain = competitor.domain;
      const competitorId = competitor.id;

      try {
        if (runRecognition) {
          const brandName =
            competitor.brand_variants?.[0] || competitor.name || domain;
          const needsBoth = brandName.toLowerCase() !== domain.toLowerCase();
          const recognitionQueries = [`what is ${domain}`, `${domain} reviews`];
          if (needsBoth) {
            recognitionQueries.push(`what is ${brandName}`);
            recognitionQueries.push(`${brandName} reviews`);
          }

          const response = await tenantFetch(
            "/api/ai-insights/competitors/analyze",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tenantId,
                domain,
                queries: recognitionQueries,
                platforms: DIRECT_LLM_PROVIDERS,
              }),
              tenantId,
            },
          );

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Recognition check failed");
          }

          const data = await response.json();
          const summary = data.summary as {
            avg_visibility?: number;
            domain_mentioned_count?: number;
          } | null;

          const rawResults = Array.isArray(data.results)
            ? (data.results as VisibilityResult[])
            : [];
          const platformsData =
            data.platformsData && typeof data.platformsData === "object"
              ? (data.platformsData as Record<
                  string,
                  { mentioned?: boolean; score?: number }
                >)
              : {};
          const mentionsCount =
            summary?.domain_mentioned_count ??
            (rawResults.length > 0 ? countMentionsFromResults(rawResults) : 0);

          await tenantFetch(`/api/ai-insights/competitors/${competitorId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              visibility_score: summary?.avg_visibility || 0,
              mentions_count: mentionsCount,
              platforms_data: platformsData,
              last_check: new Date().toISOString(),
              last_check_results: rawResults,
            }),
            tenantId,
          });
        }

        if (runDiscovery) {
          const brandVariants =
            competitor.brand_variants || [competitor.name].filter(Boolean);
          const response = await tenantFetch("/api/ai-insights/organic-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              domain,
              brandVariants,
              competitorId,
            }),
            tenantId,
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Discovery check failed");
          }
        }

        toast({
          title: "LLM check complete",
          description: `Updated ${domain}`,
        });

        await refreshWarRoomData(competitorId);
        const fresh = await fetchCompetitorDetail(competitorId);
        if (fresh)
          dispatch({ type: "SET_SELECTED_COMPETITOR_POPUP", payload: fresh });
      } catch (error) {
        toast({
          title: "LLM check failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: "SET_POPUP_REFRESHING_TYPE", payload: null });
      }
    },
    [
      state.competitorPopup.selected,
      tenantId,
      toast,
      refreshWarRoomData,
      fetchCompetitorDetail,
    ],
  );

  const handleAskAllProvidersFromPopup = useCallback(
    async (query: string) => {
      const competitor = state.competitorPopup.selected;
      if (!competitor || !tenantId) return;
      dispatch({ type: "SET_POPUP_ASK_ALL_LOADING", payload: true });
      const competitorId = competitor.id;
      try {
        const response = await tenantFetch("/api/ai-insights/custom-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            domain: competitor.domain,
            query,
            providers: DIRECT_LLM_PROVIDERS,
          }),
          tenantId,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || "Custom query failed");
        }

        const data = await response.json();
        const newResults = Array.isArray(data.results)
          ? (data.results as VisibilityResult[])
          : [];
        const updatedResults = mergeVisibilityResults(
          competitor.last_check_results,
          newResults,
        );

        const patchResponse = await tenantFetch(
          `/api/ai-insights/competitors/${competitorId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              last_check_results: updatedResults,
            }),
            tenantId,
          },
        );

        if (!patchResponse.ok) {
          const err = await patchResponse.json().catch(() => ({}));
          throw new Error(err.error || "Failed to save custom query");
        }

        const updated = await patchResponse.json();
        if (updated?.competitor) {
          dispatch({
            type: "SET_SELECTED_COMPETITOR_POPUP",
            payload: updated.competitor as Competitor,
          });
        }
        await refreshWarRoomData(competitorId);

        toast({
          title: "Custom query complete",
          description: `Saved results for ${competitor.domain}`,
        });
      } catch (error) {
        toast({
          title: "Custom query failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: "SET_POPUP_ASK_ALL_LOADING", payload: false });
      }
    },
    [state.competitorPopup.selected, tenantId, toast, refreshWarRoomData],
  );

  const handleRefreshSEOFromPopup = useCallback(async () => {
    const competitor = state.competitorPopup.selected;
    if (!competitor || !tenantId) return;
    dispatch({ type: "SET_POPUP_REFRESHING_TYPE", payload: "seo" });
    try {
      const response = await tenantFetch(
        `/api/competitors/${competitor.id}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId }),
          tenantId,
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "SEO analysis failed");
      }

      toast({
        title: "SEO analysis complete",
        description: `Updated metrics for ${competitor.domain}`,
      });

      await refreshWarRoomData(competitor.id);
      const fresh = await fetchCompetitorDetail(competitor.id);
      if (fresh)
        dispatch({ type: "SET_SELECTED_COMPETITOR_POPUP", payload: fresh });
    } catch (error) {
      toast({
        title: "SEO analysis failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_POPUP_REFRESHING_TYPE", payload: null });
    }
  }, [
    state.competitorPopup.selected,
    tenantId,
    toast,
    refreshWarRoomData,
    fetchCompetitorDetail,
  ]);

  const handleUpdateCompetitorProductLink = useCallback(
    async (competitorId: string, favoriteId: string | null) => {
      if (!tenantId) return;
      dispatch({ type: "SET_POPUP_LINK_UPDATING", payload: true });
      try {
        const response = await tenantFetch(
          `/api/ai-insights/competitors/${competitorId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantId, favorite_id: favoriteId }),
            tenantId,
          },
        );
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || "Failed to update link");
        }
        await refreshWarRoomData(competitorId);
        const fresh = await fetchCompetitorDetail(competitorId);
        if (fresh)
          dispatch({ type: "SET_SELECTED_COMPETITOR_POPUP", payload: fresh });
        toast({
          title: "Link updated",
          description: favoriteId
            ? "Competitor linked to product"
            : "Competitor unlinked",
        });
      } catch (error) {
        toast({
          title: "Update failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: "SET_POPUP_LINK_UPDATING", payload: false });
      }
    },
    [tenantId, toast, refreshWarRoomData, fetchCompetitorDetail],
  );

  const handleDeleteCompetitorFromPopup = useCallback(async () => {
    const competitor = state.competitorPopup.selected;
    if (!competitor || !tenantId) return;
    try {
      const response = await tenantFetch(
        `/api/ai-insights/competitors/${competitor.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId }),
          tenantId,
        },
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete competitor");
      }
      await refreshWarRoomData();
      handleCloseCompetitorPopup();
      toast({ title: "Competitor removed" });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [
    state.competitorPopup.selected,
    tenantId,
    toast,
    refreshWarRoomData,
    handleCloseCompetitorPopup,
  ]);

  const handleCounterStrikeFromPopup = useCallback(() => {
    dispatch({ type: "SET_POPUP_COUNTER_STRIKE_LOADING", payload: true });
    router.push("/dashboard/ai-insights?tab=battlefield");
    dispatch({ type: "SET_POPUP_COUNTER_STRIKE_LOADING", payload: false });
  }, [router]);

  // ── Auto-run full check effect ──────────────

  useEffect(() => {
    if (!state.product.autoRunFullCheck) return;
    if (!state.product.fullCheckOpen) return;
    if (!state.product.checkTarget) return;
    if (state.product.fullCheckRunning) return;

    void handleRunProductFullCheck();
    dispatch({ type: "SET_AUTO_RUN_FULL_CHECK", payload: false });
  }, [
    state.product.autoRunFullCheck,
    state.product.fullCheckOpen,
    state.product.checkTarget,
    state.product.fullCheckRunning,
    handleRunProductFullCheck,
  ]);

  useEffect(() => {
    const favoriteId = state.product.selectedFavoriteId;
    if (!favoriteId) return;
    if (isDataLoading) return;
    const trendKey = tenantId ? `${tenantId}:${favoriteId}` : favoriteId;
    if (lastTrendFetchedFavoriteIdRef.current === trendKey) return;
    lastTrendFetchedFavoriteIdRef.current = trendKey;
    void fetchTrendForProduct(favoriteId);
  }, [
    tenantId,
    state.product.selectedFavoriteId,
    isDataLoading,
    fetchTrendForProduct,
  ]);

  // ── progressKeywords for FindEnemyDialog ────

  const progressKeywords = useMemo((): string[] => {
    const stepData = state.onboarding.progress?.stepData;
    if (!stepData) return [];

    const step2 =
      (stepData as Record<string, unknown>)["2"] ??
      (stepData as Record<number, unknown>)[2];
    if (!step2 || typeof step2 !== "object") return [];

    const raw = (step2 as Record<string, unknown>).keywords;
    if (!Array.isArray(raw)) return [];

    const keywords = raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return null;
        const keyword = (item as { keyword?: unknown }).keyword;
        return typeof keyword === "string" ? keyword : null;
      })
      .filter((k): k is string => Boolean(k))
      .slice(0, 10);

    return keywords;
  }, [state.onboarding.progress]);

  // ── Sync API data ───────────────────────────

  useEffect(() => {
    if (data) {
      dispatch({
        type: "SYNC_FROM_API",
        payload: {
          onboardingStatus: data.onboardingStatus,
          stats: data.stats,
          favorites: data.favorites,
          competitors: data.competitors,
          gaps: data.gaps,
          sessions: data.sessions,
          recentActivity:
            data.recentActivity?.map((a) => ({
              id: a.id,
              title: a.title,
              type: a.status === "published" ? "published" : ("draft" as const),
              timestamp: a.createdAt,
              link: `/dashboard/blog/${a.id}`,
            })) ?? [],
          visibilityTrend: data.visibilityTrend,
        },
      });
    }
  }, [data]);

  // ── Computed values for cards ────────────────

  const visibilityScore = useMemo(() => {
    return typeof primaryFavorite?.visibility_score === "number"
      ? Math.round(primaryFavorite.visibility_score)
      : null;
  }, [primaryFavorite]);

  const platformKeys = PLATFORM_KEYS;
  const platformTotal = PLATFORM_TOTAL;

  const mentionPlatforms = useMemo(() => {
    const platforms = new Set<string>();
    const lastCheckResults = primaryFavorite?.last_check_results ?? [];
    lastCheckResults.forEach((result) => {
      if (!result) return;
      platformKeys.forEach((platform) => {
        if (result.mentions?.[platform]) platforms.add(platform);
      });
    });
    const platformsData = primaryFavorite?.platforms_data;
    if (platformsData) {
      platformKeys.forEach((platform) => {
        const d = platformsData[platform];
        if (d?.mentioned || d?.in_sources) platforms.add(platform);
      });
    }
    return platforms;
  }, [primaryFavorite, platformKeys]);

  const gscBinding = useMemo(() => {
    const platformsData = (primaryFavorite?.platforms_data ?? {}) as Record<
      string,
      unknown
    >;
    return (platformsData.gsc as Record<string, unknown> | undefined) || null;
  }, [primaryFavorite]);

  const gscMetrics = useMemo(() => {
    const metrics = (primaryFavorite?.seo_metrics ?? {}) as Record<
      string,
      unknown
    >;
    return (metrics.gsc as Record<string, unknown> | undefined) || null;
  }, [primaryFavorite]);

  const gscSummary = useMemo(() => {
    return (gscMetrics?.summary as GscSummary | undefined) || null;
  }, [gscMetrics]);

  const gscTimeseries = useMemo(() => {
    const series = gscMetrics?.timeseries;
    return Array.isArray(series) ? (series as GscDailyMetric[]) : [];
  }, [gscMetrics]);

  const gscConnected = gscStatus?.connected ?? false;
  const gscBound = Boolean(gscBinding?.property || gscMetrics?.property);
  const gscBoundSiteUrl =
    (gscBinding?.property as { siteUrl?: string } | undefined)?.siteUrl ||
    (gscMetrics?.property as { siteUrl?: string } | undefined)?.siteUrl ||
    null;
  const gscLastSyncAt =
    (gscMetrics?.last_sync_at as string | undefined) ||
    (gscBinding?.last_sync_at as string | undefined) ||
    null;

  const productLoadingType = useMemo((): CheckType | null => {
    if (state.product.refreshType === "llm") return "recognition";
    if (state.product.refreshType === "discovery") return "traffic";
    if (state.product.refreshType === "seo") return "seo";
    if (state.product.fullCheckRunning) return "full";
    return null;
  }, [state.product.refreshType, state.product.fullCheckRunning]);

  const highPriorityGapsCount = useMemo(() => {
    return state.data.gaps.filter((g) => g.priority === "high").length;
  }, [state.data.gaps]);

  // ── Card interaction callbacks ──────────────

  const handleDismissOnboardingAction = useCallback(async () => {
    dispatch({ type: "SET_ACTION_LOADING", payload: "dismiss" });
    await dismissOnboarding();
    dispatch({ type: "SET_ACTION_LOADING", payload: null });
  }, [dismissOnboarding]);

  const handleSkipHero = useCallback(() => {
    dispatch({ type: "SET_HIDE_HERO", payload: true });
  }, []);

  const handleSelectFavorite = useCallback(
    (id: string) => {
      dispatch({ type: "SET_SELECTED_FAVORITE_ID", payload: id });
      updatePreferences({ selectedFavoriteId: id });
    },
    [updatePreferences],
  );

  const handleGscConnect = useCallback(async () => {
    if (!tenantId) return;
    try {
      const redirectTo = `${window.location.pathname}${window.location.search}`;
      await startGscConnect({ tenantId, redirectTo });
    } catch (error) {
      toast({
        title: "Connection failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to start OAuth flow.",
        variant: "destructive",
      });
    }
  }, [tenantId, toast]);

  type GscLocalSnapshot = {
    favoriteId: string;
    summary: GscSummary | null;
    timeseries: GscDailyMetric[];
    lastSyncAt: string;
    lastRefreshAt: string;
  };

  const [gscLocalSnapshot, setGscLocalSnapshot] =
    useState<GscLocalSnapshot | null>(null);
  const [gscRefreshBusy, setGscRefreshBusy] = useState(false);

  useEffect(() => {
    setGscLocalSnapshot(null);
  }, [primaryFavorite?.id]);

  const gscLocalForPrimary =
    gscLocalSnapshot && primaryFavorite?.id
      ? gscLocalSnapshot.favoriteId === primaryFavorite.id
        ? gscLocalSnapshot
        : null
      : null;

  const gscLastRefreshAt =
    gscLocalForPrimary?.lastRefreshAt ||
    (gscMetrics?.last_refresh_at as string | undefined) ||
    (gscBinding?.last_refresh_at as string | undefined) ||
    null;

  const gscNextRefreshAllowedAt = useMemo(() => {
    if (!gscLastRefreshAt) return null;
    const lastRefreshMs = Date.parse(gscLastRefreshAt);
    if (!Number.isFinite(lastRefreshMs)) return null;
    return new Date(
      lastRefreshMs + GSC_REFRESH_COOLDOWN_HOURS * 60 * 60 * 1000,
    );
  }, [gscLastRefreshAt]);

  const gscDisplayedSummary = gscLocalForPrimary?.summary ?? gscSummary;
  const gscDisplayedTimeseries =
    gscLocalForPrimary?.timeseries?.length &&
    Array.isArray(gscLocalForPrimary.timeseries)
      ? gscLocalForPrimary.timeseries
      : gscTimeseries;
  const gscDisplayedLastSyncAt =
    gscLocalForPrimary?.lastSyncAt ?? gscLastSyncAt;

  const handleGscRefreshPrimary = useCallback(async () => {
    if (!tenantId || !primaryFavorite) return;
    if (ENFORCE_GSC_REFRESH_COOLDOWN) {
      if (
        gscNextRefreshAllowedAt &&
        Date.now() < gscNextRefreshAllowedAt.getTime()
      ) {
        toast({
          title: "Refresh limit reached",
          description: `Next refresh after ${gscNextRefreshAllowedAt.toLocaleString()}`,
        });
        return;
      }
    }
    setGscRefreshBusy(true);
    try {
      const response = await tenantFetch("/api/integrations/gsc/refresh", {
        tenantId,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, favoriteId: primaryFavorite.id }),
      });

      if (response.status === 429) {
        const payload = await response.json().catch(() => ({}));
        toast({
          title: "Refresh limit reached",
          description: payload?.nextAllowedAt
            ? `Next refresh after ${new Date(payload.nextAllowedAt).toLocaleString()}`
            : "Please wait before refreshing again.",
        });
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to refresh GSC data");
      }

      const payload = (await response.json().catch(() => ({}))) as {
        summary?: GscSummary;
        timeseries?: GscDailyMetric[];
      };
      const timeseries = Array.isArray(payload.timeseries)
        ? (payload.timeseries as GscDailyMetric[])
        : [];
      const nowIso = new Date().toISOString();

      setGscLocalSnapshot({
        favoriteId: primaryFavorite.id,
        summary: payload.summary ?? null,
        timeseries,
        lastSyncAt: nowIso,
        lastRefreshAt: nowIso,
      });

      toast({
        title: timeseries.length > 0 ? "GSC data refreshed" : "No GSC data yet",
        description:
          timeseries.length > 0
            ? "Latest metrics are now available."
            : "Google Search Console returned no rows for the selected period. Verify the bound property in Settings → Integrations.",
      });
      await refetch();
    } catch (error) {
      toast({
        title: "Refresh failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGscRefreshBusy(false);
    }
  }, [gscNextRefreshAllowedAt, primaryFavorite, refetch, tenantId, toast]);

  const handleOpenProduct = useCallback(
    async (favorite: Favorite) => {
      dispatch({ type: "SET_PRODUCT_DETAIL_LOADING", payload: true });
      try {
        const fullFavorite = await fetchProductDetail(favorite);
        dispatch({ type: "SET_PRODUCT_DETAIL", payload: fullFavorite });
        if (
          !hasProductLLMData(fullFavorite) &&
          !hasProductSEOData(fullFavorite)
        ) {
          dispatch({ type: "SET_PRODUCT_CHECK_TARGET", payload: fullFavorite });
          dispatch({ type: "SET_RUN_PRODUCT_RECOGNITION", payload: true });
          dispatch({ type: "SET_RUN_PRODUCT_SEO", payload: true });
          dispatch({ type: "SET_RUN_PRODUCT_DISCOVERY", payload: false });
          dispatch({ type: "SET_PRODUCT_FULL_CHECK_OPEN", payload: true });
          return;
        }
        dispatch({ type: "SET_PRODUCT_DETAIL_OPEN", payload: true });
      } catch (error) {
        toast({
          title: "Failed to load product",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: "SET_PRODUCT_DETAIL_LOADING", payload: false });
      }
    },
    [fetchProductDetail, toast],
  );

  const handleOpenProductMonitoring = useCallback(
    async (favorite: Favorite) => {
      dispatch({ type: "SET_PRODUCT_DETAIL_LOADING", payload: true });
      dispatch({ type: "SET_PRODUCT_DEFAULT_TAB", payload: "monitoring" });
      try {
        const fullFavorite = await fetchProductDetail(favorite);
        dispatch({ type: "SET_PRODUCT_DETAIL", payload: fullFavorite });
        dispatch({ type: "SET_PRODUCT_DETAIL_OPEN", payload: true });
      } catch (error) {
        toast({
          title: "Failed to load product",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: "SET_PRODUCT_DETAIL_LOADING", payload: false });
      }
    },
    [fetchProductDetail, toast],
  );

  const handleOpenProductSEO = useCallback(
    async (favorite: Favorite) => {
      dispatch({ type: "SET_PRODUCT_DETAIL_LOADING", payload: true });
      dispatch({ type: "SET_PRODUCT_DEFAULT_TAB", payload: "seo" });
      try {
        const fullFavorite = await fetchProductDetail(favorite);
        dispatch({ type: "SET_PRODUCT_DETAIL", payload: fullFavorite });
        dispatch({ type: "SET_PRODUCT_DETAIL_OPEN", payload: true });
      } catch (error) {
        toast({
          title: "Failed to load product",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: "SET_PRODUCT_DETAIL_LOADING", payload: false });
      }
    },
    [fetchProductDetail, toast],
  );

  const handleAddFirstProduct = useCallback(() => {
    dispatch({ type: "SET_ADD_FIRST_PRODUCT_OPEN", payload: true });
  }, []);

  const handleShowCompetitorDetails = useCallback((competitor: Competitor) => {
    dispatch({ type: "OPEN_COMPETITOR_POPUP", payload: competitor });
  }, []);

  const handleAddCompetitor = useCallback(() => {
    dispatch({ type: "SET_ADD_COMPETITOR_OPEN", payload: true });
  }, []);

  const handleFindEnemy = useCallback(() => {
    dispatch({ type: "OPEN_FIND_ENEMY_DIALOG" });
  }, []);

  const handleFindCompetitorFromDialog = useCallback((product: Favorite) => {
    dispatch({ type: "SET_ADD_COMPETITOR_OPEN", payload: false });
    dispatch({ type: "OPEN_FIND_ENEMY_DIALOG", payload: { product } });
  }, []);

  const handleAddProductFromQuickCheck = useCallback(() => {
    dispatch({ type: "SET_ADD_COMPETITOR_OPEN", payload: false });
    dispatch({ type: "SET_ADD_FIRST_PRODUCT_OPEN", payload: true });
  }, []);

  const handleAddGapToAutopilot = useCallback(
    async (gapId: string) => {
      dispatch({
        type: "SET_ADDING_GAP_ID",
        payload: { id: gapId, loading: true },
      });
      await addGapToAutopilot(gapId);
      dispatch({
        type: "SET_ADDING_GAP_ID",
        payload: { id: gapId, loading: false },
      });
    },
    [addGapToAutopilot],
  );

  const handleToggleSession = useCallback(
    async (session: { id: string; status: string }) => {
      dispatch({ type: "SET_ACTION_LOADING", payload: session.id });
      await toggleSession(session as Parameters<typeof toggleSession>[0]);
      dispatch({ type: "SET_ACTION_LOADING", payload: null });
    },
    [toggleSession],
  );

  const handleActionClick = useCallback(
    (onClickId: string) => {
      if (onClickId === "open_full_check" && primaryFavorite) {
        dispatch({
          type: "OPEN_FULL_CHECK_DIALOG",
          payload: { target: primaryFavorite },
        });
      } else if (onClickId === "open_find_enemy") {
        dispatch({ type: "OPEN_FIND_ENEMY_DIALOG" });
      } else if (onClickId === "open_add_first_product") {
        dispatch({ type: "SET_ADD_FIRST_PRODUCT_OPEN", payload: true });
      }
    },
    [primaryFavorite],
  );

  // ── Build existing card props ───────────────

  const existingCardProps = useMemo((): ExistingCardProps => {
    return {
      gsc: {
        connected: gscConnected,
        bound: gscBound,
        summary: gscDisplayedSummary,
        timeseries: gscDisplayedTimeseries,
        domain: primaryFavorite?.domain ?? "",
        boundSiteUrl: gscBoundSiteUrl,
        lastSyncAt: gscDisplayedLastSyncAt,
        onConnect: handleGscConnect,
        onRefresh: handleGscRefreshPrimary,
        refreshing: gscRefreshBusy,
        onManage: () =>
          primaryFavorite && handleOpenProductSEO(primaryFavorite),
        className: "w-full",
        refreshBusy: gscRefreshBusy,
      },
      aiVisibility: {
        favorites: state.data.favorites,
        selectedFavoriteId: state.product.selectedFavoriteId,
        onSelectFavorite: handleSelectFavorite,
        visibilityScore,
        visibilityTrend: state.data.visibilityTrend,
        platformsData: primaryFavorite?.platforms_data ?? null,
        mentionCount: mentionPlatforms.size,
        platformTotal,
        highPriorityGaps: highPriorityGapsCount,
        hasCompetitors: topCompetitors.length > 0,
        onOpenProduct: handleOpenProduct,
        onAddFirstProduct: handleAddFirstProduct,
        onFindEnemy: handleFindEnemy,
        isProductDetailLoading: state.product.detailLoading,
        loadingType: productLoadingType,
        onRecognitionCheck: (favorite: Favorite) => {
          dispatch({ type: "SET_PRODUCT_CHECK_TARGET", payload: favorite });
          dispatch({ type: "SET_RUN_PRODUCT_RECOGNITION", payload: true });
          dispatch({ type: "SET_RUN_PRODUCT_SERP_AI", payload: false });
          dispatch({ type: "SET_RUN_PRODUCT_DISCOVERY", payload: false });
          dispatch({ type: "SET_RUN_PRODUCT_SEO", payload: false });
          dispatch({ type: "SET_PRODUCT_FULL_CHECK_OPEN", payload: true });
        },
        onTrafficCheck: (favorite: Favorite) => {
          dispatch({ type: "SET_PRODUCT_CHECK_TARGET", payload: favorite });
          dispatch({ type: "SET_RUN_PRODUCT_RECOGNITION", payload: false });
          dispatch({ type: "SET_RUN_PRODUCT_SERP_AI", payload: false });
          dispatch({ type: "SET_RUN_PRODUCT_DISCOVERY", payload: true });
          dispatch({ type: "SET_RUN_PRODUCT_SEO", payload: false });
          dispatch({ type: "SET_PRODUCT_FULL_CHECK_OPEN", payload: true });
        },
        onSEOCheck: (favorite: Favorite) => {
          dispatch({ type: "SET_PRODUCT_CHECK_TARGET", payload: favorite });
          dispatch({ type: "SET_RUN_PRODUCT_RECOGNITION", payload: false });
          dispatch({ type: "SET_RUN_PRODUCT_SERP_AI", payload: false });
          dispatch({ type: "SET_RUN_PRODUCT_DISCOVERY", payload: false });
          dispatch({ type: "SET_RUN_PRODUCT_SEO", payload: true });
          dispatch({ type: "SET_PRODUCT_FULL_CHECK_OPEN", payload: true });
        },
        onFullCheck: (favorite: Favorite) => {
          dispatch({ type: "SET_PRODUCT_CHECK_TARGET", payload: favorite });
          dispatch({ type: "SET_RUN_PRODUCT_RECOGNITION", payload: true });
          dispatch({ type: "SET_RUN_PRODUCT_SERP_AI", payload: true });
          dispatch({ type: "SET_RUN_PRODUCT_DISCOVERY", payload: false });
          dispatch({ type: "SET_RUN_PRODUCT_SEO", payload: true });
          dispatch({ type: "SET_PRODUCT_FULL_CHECK_OPEN", payload: true });
        },
        onMonitoringSettings: handleOpenProductMonitoring,
      },
      competitors: {
        competitors: topCompetitors,
        canLaunchCounterStrike,
        onShowDetails: handleShowCompetitorDetails,
        onAddCompetitor: handleAddCompetitor,
        onFindEnemy: handleFindEnemy,
      },
      recentArticles: {
        articles: state.data.recentActivity.map((a) => ({
          id: a.id,
          title: a.title,
          type: a.type,
          timestamp: a.timestamp,
          link: a.link,
        })),
      },
      counterStrike: {
        sessions: counterStrikeSessions,
        canLaunchCounterStrike,
        actionLoading: state.ui.actionLoading,
        onToggleSession: handleToggleSession,
        onAddCompetitor: handleAddCompetitor,
        onFindEnemy: handleFindEnemy,
      },
      recommendedActions: {
        actions: recommendedActions,
        isCheckRunning: state.product.fullCheckRunning,
        refreshType: state.product.refreshType,
        onActionClick: handleActionClick,
        gaps: topCriticalGaps,
        addingGapIds: state.ui.addingGapIds,
        onAddGapToAutopilot: handleAddGapToAutopilot,
      },
      contentFactory: {
        totalArticles: state.data.stats?.totalArticles ?? 0,
        publishedArticles: state.data.stats?.publishedArticles ?? 0,
      },
      distribution: {
        tenantId,
        blogHandle,
        customDomain: state.data.customDomain,
      },
    };
  }, [
    gscConnected,
    gscBound,
    gscDisplayedSummary,
    gscDisplayedTimeseries,
    primaryFavorite,
    gscBoundSiteUrl,
    gscDisplayedLastSyncAt,
    handleGscConnect,
    handleGscRefreshPrimary,
    gscRefreshBusy,
    handleOpenProductSEO,
    state.data.favorites,
    state.product.selectedFavoriteId,
    handleSelectFavorite,
    visibilityScore,
    state.data.visibilityTrend,
    mentionPlatforms.size,
    platformTotal,
    highPriorityGapsCount,
    topCompetitors,
    handleOpenProduct,
    handleAddFirstProduct,
    handleFindEnemy,
    state.product.detailLoading,
    productLoadingType,
    handleOpenProductMonitoring,
    canLaunchCounterStrike,
    handleShowCompetitorDetails,
    handleAddCompetitor,
    state.data.recentActivity,
    counterStrikeSessions,
    state.ui.actionLoading,
    handleToggleSession,
    recommendedActions,
    state.product.fullCheckRunning,
    state.product.refreshType,
    handleActionClick,
    topCriticalGaps,
    state.ui.addingGapIds,
    handleAddGapToAutopilot,
    state.data.stats,
    tenantId,
    blogHandle,
    state.data.customDomain,
  ]);

  // ── Render conditions ───────────────────────

  const showHero =
    state.onboarding.status !== "done" &&
    !state.onboarding.hideHero &&
    !isDataLoading;

  const showNoWorkspaceBanner = tenantStatus === "no_tenant" && tenantError;

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isDataLoading) {
    return <WarRoomSkeleton />;
  }

  return (
    <WarRoomProvider state={state} dispatch={dispatch}>
      <div
        className={cn(
          "relative flex-1",
          showHero
            ? "px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-4"
            : "p-4 sm:p-6 lg:p-8",
        )}
      >
        {/* Background visual anchors */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute -left-32 top-1/3 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        <div className="relative space-y-6">
          {showNoWorkspaceBanner && (
            <NoWorkspaceBanner removedFromWorkspace={Boolean(tenantError)} />
          )}

          {showHero ? (
            <WarRoomHero
              progress={state.onboarding.progress}
              onDismiss={handleDismissOnboardingAction}
              onSkip={handleSkipHero}
              isLoading={state.ui.actionLoading === "dismiss"}
            />
          ) : (
            <WarRoomWelcomeHeader
              userName={user?.user_metadata?.full_name as string | null}
            />
          )}

          {/* Preset Selector */}
          <PresetSelector
            activePreset={activePresetId}
            userStage={userStage}
            onSelect={updatePreset}
          />

          {/* Card Grid — dynamic by preset */}
          <CardGrid
            preset={activePreset}
            existing={existingCardProps}
            cardsData={cardsData}
            tenantId={tenantId ?? ""}
            isCardsLoading={isCardsLoading}
          />
        </div>

        {/* ── Dialogs (identical to /new/page.tsx) ── */}
        <AddCompetitorDialog
          open={state.dialogs.addCompetitorOpen}
          onOpenChangeAction={(open) =>
            dispatch({ type: "SET_ADD_COMPETITOR_OPEN", payload: open })
          }
          onSuccessAction={async () => {
            await refetch();
            dispatch({ type: "SET_ADD_COMPETITOR_OPEN", payload: false });
          }}
          products={state.data.favorites}
          balance={state.data.stats?.creditsRemaining ?? 0}
          onFindCompetitorAction={handleFindCompetitorFromDialog}
          onAddProductAction={handleAddProductFromQuickCheck}
        />

        <FindEnemyDialog
          open={state.dialogs.findEnemyOpen}
          onOpenChange={(open) => {
            if (!open) {
              dispatch({ type: "CLOSE_FIND_ENEMY_DIALOG" });
            } else {
              dispatch({ type: "SET_FIND_ENEMY_OPEN", payload: true });
            }
          }}
          tenantId={tenantId}
          product={state.dialogs.findEnemyProduct ?? primaryFavorite}
          initialKeywords={progressKeywords}
          currentCredits={state.data.stats?.creditsRemaining ?? 0}
          onSavedCompetitors={async () => {
            await refetch();
            dispatch({ type: "CLOSE_FIND_ENEMY_DIALOG" });
          }}
        />

        {/* Competitor Detail Popup */}
        {state.competitorPopup.selected && (
          <CompetitorDetailPopup
            itemType="competitor"
            tenantId={tenantId}
            competitor={state.competitorPopup.selected as UnifiedCompetitor}
            isOpen={state.dialogs.detailPopupOpen}
            onClose={handleCloseCompetitorPopup}
            favorites={state.data.favorites}
            onRefreshLLM={handleRefreshLLMFromPopup}
            onRefreshSEO={handleRefreshSEOFromPopup}
            onAskAllProviders={handleAskAllProvidersFromPopup}
            onUpdateProductLink={handleUpdateCompetitorProductLink}
            onDelete={handleDeleteCompetitorFromPopup}
            onCounterStrike={handleCounterStrikeFromPopup}
            refreshingType={state.competitorPopup.refreshingType}
            isAskAllLoading={state.competitorPopup.askAllLoading}
            isUpdatingProductLink={state.competitorPopup.linkUpdating}
            counterStrikeLoading={state.competitorPopup.counterStrikeLoading}
            askAllCost={ASK_ALL_PROVIDERS_COST}
            balance={state.data.stats?.creditsRemaining ?? 0}
            showUpdates={true}
          />
        )}

        {/* Product Detail Popup */}
        {state.product.detail && (
          <CompetitorDetailPopup
            itemType="product"
            tenantId={tenantId}
            competitor={state.product.detail as UnifiedCompetitor}
            isOpen={state.product.detailOpen}
            onClose={() => {
              dispatch({ type: "CLOSE_PRODUCT_DETAIL" });
            }}
            favorites={state.data.favorites}
            onOpenFullCheckDialog={() => {
              if (!state.product.detail) return;
              dispatch({
                type: "OPEN_FULL_CHECK_DIALOG",
                payload: { target: state.product.detail },
              });
            }}
            onRefreshLLM={async (options: LLMCheckOptions) => {
              if (!state.product.detail) return;
              dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: "llm" });
              try {
                if (options.runRecognition) {
                  await runProductRecognitionCheck(state.product.detail);
                }
                if (options.runSerpAI) {
                  await runProductSerpAICheck(state.product.detail);
                }
                if (options.runDiscovery) {
                  await runProductDiscoveryCheck(state.product.detail);
                }
              } finally {
                dispatch({ type: "SET_PRODUCT_REFRESH_TYPE", payload: null });
              }
            }}
            onRefreshSEO={async () => {
              if (!state.product.detail) return;
              await runProductSEOCheck(state.product.detail);
            }}
            onAskAllProviders={async (query: string) => {
              if (!state.product.detail) return;
              await handleAskAllProvidersForProduct(
                state.product.detail,
                query,
              );
            }}
            refreshingType={
              state.product.refreshType === "llm" ||
              state.product.refreshType === "seo"
                ? state.product.refreshType
                : null
            }
            isAskAllLoading={state.product.askAllLoading}
            askAllCost={ASK_ALL_PROVIDERS_COST}
            balance={state.data.stats?.creditsRemaining ?? 0}
            defaultTab={state.product.defaultTab}
            showUpdates={true}
            showCounterStrike={false}
            showProductLink={false}
            showEdit={true}
            headerBadge="My Product"
            onEdited={() => refetch()}
          />
        )}

        {/* Product Full Check Dialog */}
        <AlertDialog
          open={state.product.fullCheckOpen}
          onOpenChange={(open) => {
            if (!open) {
              dispatch({ type: "CLOSE_FULL_CHECK_DIALOG" });
            }
          }}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Eye className="h-5 w-5 text-blue-600" />
                Run Full Product Check
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 text-sm text-slate-600">
                  <p>
                    Configure what intelligence to gather for{" "}
                    <span className="font-semibold text-slate-900">
                      {state.product.checkTarget?.name ||
                        state.product.checkTarget?.domain ||
                        "this product"}
                    </span>
                    .
                  </p>

                  <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="product-recognition"
                        checked={state.product.runRecognition}
                        onCheckedChange={(checked) =>
                          dispatch({
                            type: "SET_RUN_PRODUCT_RECOGNITION",
                            payload: Boolean(checked),
                          })
                        }
                      />
                      <Label
                        htmlFor="product-recognition"
                        className="flex flex-1 flex-col gap-0.5 text-sm"
                      >
                        <span className="font-medium">Recognition</span>
                        <span className="text-xs text-slate-500">
                          Ask 6 AI models &quot;what is{" "}
                          {state.product.checkTarget?.domain}&quot;
                        </span>
                      </Label>
                      <span className="text-xs text-slate-500">
                        {productRecognitionCost}
                        <Coins className="ml-1 inline h-3 w-3" />
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="product-serp-ai"
                        checked={state.product.runSerpAI}
                        onCheckedChange={(checked) =>
                          dispatch({
                            type: "SET_RUN_PRODUCT_SERP_AI",
                            payload: Boolean(checked),
                          })
                        }
                      />
                      <Label
                        htmlFor="product-serp-ai"
                        className="flex flex-1 flex-col gap-0.5 text-sm"
                      >
                        <span className="font-medium">Search AI</span>
                        <span className="text-xs text-slate-500">
                          Google AI Overview & Bing Copilot
                        </span>
                      </Label>
                      <span className="text-xs text-slate-500">
                        {calculateSERPAICost()}
                        <Coins className="ml-1 inline h-3 w-3" />
                      </span>
                    </div>

                    <FeatureLock
                      locked={aiTrafficFeature.isLocked}
                      message={aiTrafficFeature.message}
                      variant="checkbox"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="product-discovery"
                          checked={state.product.runDiscovery}
                          onCheckedChange={(checked) =>
                            dispatch({
                              type: "SET_RUN_PRODUCT_DISCOVERY",
                              payload: Boolean(checked),
                            })
                          }
                          disabled={aiTrafficFeature.isLocked}
                        />
                        <Label
                          htmlFor="product-discovery"
                          className={cn(
                            "flex flex-1 flex-col gap-0.5 text-sm",
                            aiTrafficFeature.isLocked && "opacity-50",
                          )}
                        >
                          <span className="font-medium">AI Traffic</span>
                          <span className="text-xs text-slate-500">
                            Real queries mentioning your brand
                          </span>
                        </Label>
                        <span className="text-xs text-slate-500">
                          {AI_INSIGHTS_COSTS.LLM_DISCOVERY}
                          <Coins className="ml-1 inline h-3 w-3" />
                        </span>
                      </div>
                    </FeatureLock>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="product-seo"
                        checked={state.product.runSEO}
                        onCheckedChange={(checked) =>
                          dispatch({
                            type: "SET_RUN_PRODUCT_SEO",
                            payload: Boolean(checked),
                          })
                        }
                      />
                      <Label
                        htmlFor="product-seo"
                        className="flex flex-1 flex-col gap-0.5 text-sm"
                      >
                        <span className="font-medium">SEO SERP Analysis</span>
                        <span className="text-xs text-slate-500">
                          Backlinks, domain authority, traffic
                        </span>
                      </Label>
                      <span className="text-xs text-slate-500">
                        {AI_INSIGHTS_COSTS.SEO_ANALYSIS}
                        <Coins className="ml-1 inline h-3 w-3" />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-slate-900">
                        Total Cost
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        {productCheckCost}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            Credits will be deducted from your balance
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {(state.data.stats?.creditsRemaining ?? 0) <
                    productCheckCost && (
                    <p className="text-xs text-amber-600">
                      You need{" "}
                      {productCheckCost -
                        (state.data.stats?.creditsRemaining ?? 0)}{" "}
                      more credits to run this check.
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
              <AlertDialogCancel
                onClick={() => dispatch({ type: "CLOSE_FULL_CHECK_DIALOG" })}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRunProductFullCheck}
                disabled={
                  state.product.fullCheckRunning ||
                  (!state.product.runRecognition &&
                    !state.product.runSerpAI &&
                    !state.product.runDiscovery &&
                    !state.product.runSEO) ||
                  (state.data.stats?.creditsRemaining ?? 0) < productCheckCost
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {state.product.fullCheckRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Run Check"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add First Product Dialog */}
        <AlertDialog
          open={state.dialogs.addFirstProductOpen}
          onOpenChange={(open) =>
            dispatch({ type: "SET_ADD_FIRST_PRODUCT_OPEN", payload: open })
          }
        >
          <AlertDialogContent className="max-w-lg p-0 overflow-hidden">
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              onClick={() =>
                dispatch({ type: "SET_ADD_FIRST_PRODUCT_OPEN", payload: false })
              }
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <QuickCheckCard
              balance={{
                credits: state.data.stats?.creditsRemaining ?? 0,
                currency: "credits",
                planType: "standard",
              }}
              onSaveClickAction={(domain, summary, results) => {
                dispatch({
                  type: "SET_SAVE_DOMAIN_TARGET",
                  payload: { domain, summary, results },
                });
                dispatch({
                  type: "SET_ADD_FIRST_PRODUCT_OPEN",
                  payload: false,
                });
                dispatch({ type: "SET_SAVE_DOMAIN_OPEN", payload: true });
              }}
            />
          </AlertDialogContent>
        </AlertDialog>

        {/* Save Domain Dialog */}
        <SaveDomainDialog
          open={state.dialogs.saveDomainOpen}
          onClose={() => {
            dispatch({ type: "SET_SAVE_DOMAIN_OPEN", payload: false });
            dispatch({ type: "SET_SAVE_DOMAIN_TARGET", payload: null });
          }}
          domain={state.dialogs.saveDomainTarget?.domain ?? ""}
          summary={state.dialogs.saveDomainTarget?.summary ?? null}
          results={state.dialogs.saveDomainTarget?.results ?? []}
          onSaved={async () => {
            dispatch({ type: "SET_SAVE_DOMAIN_OPEN", payload: false });
            dispatch({ type: "SET_SAVE_DOMAIN_TARGET", payload: null });
            await refetch();
          }}
          defaultIsPrimary={state.data.favorites.length === 0}
        />
      </div>
    </WarRoomProvider>
  );
}
