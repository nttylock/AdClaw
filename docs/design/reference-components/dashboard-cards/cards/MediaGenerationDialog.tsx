"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AIGenerationLoading } from "@/components/ui/ai-generation-loading";
import { Volume2, ImageIcon, Loader2, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getVoiceOverCredits,
  ILLUSTRATION_CREDITS_PER_IMAGE,
} from "@/lib/billing/pricing-constants";
import { tenantFetch } from "@/lib/utils/tenant-fetch";

type GenerationType = "voice" | "illustrations";
type DialogStage = "confirm" | "generating" | "error";

export interface MediaGenerationTarget {
  id: string;
  title: string;
  contentLength: number;
}

interface MediaGenerationDialogProps {
  open: boolean;
  type: GenerationType;
  article: MediaGenerationTarget | null;
  tenantId: string;
  onClose: () => void;
  onComplete: () => void;
}

function estimateImageCount(contentLength: number): number {
  return Math.min(8, Math.max(2, Math.round(contentLength / 2000)));
}

async function runGeneration(
  type: GenerationType,
  articleId: string,
  tenantId: string,
): Promise<{ success: boolean; error?: string; creditsCharged?: number }> {
  const articleRes = await tenantFetch(
    `/api/dashboard/article-content/${articleId}`,
    { tenantId },
  );
  if (!articleRes.ok) {
    return { success: false, error: "Failed to load article content" };
  }
  const { content, language } = await articleRes.json();

  if (!content || content.length < 50) {
    return {
      success: false,
      error: "Article content too short for generation",
    };
  }

  const endpoint =
    type === "voice"
      ? "/api/blog/voice-over/generate"
      : "/api/blog/illustrations/generate";

  const res = await tenantFetch(endpoint, {
    tenantId,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      articleId,
      content,
      language: language || "en",
      tenantId,
    }),
  });

  const data = await res.json();

  if (data.skipped && data.reason === "insufficient_credits") {
    return {
      success: false,
      error: `Insufficient credits. Need ${data.creditsNeeded}, balance: ${data.balance}`,
    };
  }

  if (!res.ok || (!data.success && !data.skipped)) {
    return { success: false, error: data.error || "Generation failed" };
  }

  return { success: true, creditsCharged: data.creditsCharged ?? 0 };
}

export function MediaGenerationDialog({
  open,
  type,
  article,
  tenantId,
  onClose,
  onComplete,
}: MediaGenerationDialogProps) {
  const [stage, setStage] = useState<DialogStage>("confirm");
  const [errorMsg, setErrorMsg] = useState("");
  const { toast } = useToast();

  const isVoice = type === "voice";
  const Icon = isVoice ? Volume2 : ImageIcon;
  const label = isVoice ? "Voice-Over" : "Illustrations";

  const estimatedCredits = useMemo(() => {
    if (!article) return 0;
    if (isVoice) return getVoiceOverCredits(article.contentLength);
    const images = estimateImageCount(article.contentLength);
    return images * ILLUSTRATION_CREDITS_PER_IMAGE;
  }, [article, isVoice]);

  const handleClose = useCallback(() => {
    // Don't allow close while generating
    if (stage === "generating") return;
    setStage("confirm");
    setErrorMsg("");
    onClose();
  }, [onClose, stage]);

  const handleGenerate = useCallback(async () => {
    if (!article) return;
    setStage("generating");

    let result: Awaited<ReturnType<typeof runGeneration>>;
    try {
      result = await runGeneration(type, article.id, tenantId);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setStage("error");
      return;
    }

    if (result.success) {
      toast({
        title: `${label} generation started`,
        description: result.creditsCharged
          ? `${result.creditsCharged} charged. ${isVoice ? "Audio will be ready shortly." : "Images are being generated."}`
          : `${label} processing started.`,
      });
      onComplete();
      // Close after success
      setStage("confirm");
      setErrorMsg("");
      onClose();
    } else {
      setErrorMsg(result.error || "Unknown error");
      setStage("error");
    }
  }, [article, type, tenantId, label, isVoice, toast, onComplete, onClose]);

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-sm"
        // Prevent closing via Escape or overlay click while generating
        onEscapeKeyDown={(e) => stage === "generating" && e.preventDefault()}
        onPointerDownOutside={(e) =>
          stage === "generating" && e.preventDefault()
        }
      >
        {stage === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Icon className="h-5 w-5 text-sky-600" />
                Generate {label}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-2.5 text-sm text-slate-600">
                  <p>
                    Generate {label.toLowerCase()} for{" "}
                    <span className="font-medium text-slate-900">
                      {article.title}
                    </span>
                    ?
                  </p>
                  <div className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-slate-500">Estimated cost:</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      ~{estimatedCredits}
                    </span>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} className="gap-1.5">
                Generate · ~{estimatedCredits}
                <Coins className="h-3.5 w-3.5" />
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === "generating" && (
          <div className="flex flex-col items-center py-6">
            {isVoice ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
                <p className="text-sm font-medium text-slate-700">
                  Starting voice-over generation...
                </p>
                <p className="text-xs text-slate-400">
                  This will close automatically
                </p>
              </div>
            ) : (
              <AIGenerationLoading mode="illustrations" />
            )}
          </div>
        )}

        {stage === "error" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-red-600">
                Generation Failed
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                {errorMsg}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
