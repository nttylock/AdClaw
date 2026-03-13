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
import { Shield, Coins } from "lucide-react";
import { AIGenerationLoading } from "@/components/ui/ai-generation-loading";
import { useToast } from "@/hooks/use-toast";
import { getHumanizeCredits } from "@/lib/billing/pricing-constants";
import { tenantFetch } from "@/lib/utils/tenant-fetch";

type DialogStage = "confirm" | "generating" | "error";

export interface HumanizeTarget {
  id: string;
  title: string;
  contentLength: number;
}

interface HumanizeDialogProps {
  open: boolean;
  article: HumanizeTarget | null;
  tenantId: string;
  onClose: () => void;
  onComplete: () => void;
}

export function HumanizeDialog({
  open,
  article,
  tenantId,
  onClose,
  onComplete,
}: HumanizeDialogProps) {
  const [stage, setStage] = useState<DialogStage>("confirm");
  const [errorMsg, setErrorMsg] = useState("");
  const { toast } = useToast();

  const estimatedCredits = useMemo(() => {
    if (!article) return 0;
    return getHumanizeCredits(article.contentLength);
  }, [article]);

  const handleClose = useCallback(() => {
    if (stage === "generating") return;
    setStage("confirm");
    setErrorMsg("");
    onClose();
  }, [onClose, stage]);

  const handleGenerate = useCallback(async () => {
    if (!article) return;
    setStage("generating");

    try {
      const res = await tenantFetch(
        `/api/blog/autopilot/articles/${article.id}/humanize`,
        {
          tenantId,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Humanization failed");
        setStage("error");
        return;
      }

      toast({
        title: "Article humanized",
        description: `${estimatedCredits} credits charged. Content updated.`,
      });
      onComplete();
      setStage("confirm");
      setErrorMsg("");
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setStage("error");
    }
  }, [article, tenantId, estimatedCredits, toast, onComplete, onClose]);

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-sm"
        onEscapeKeyDown={(e) => stage === "generating" && e.preventDefault()}
        onPointerDownOutside={(e) =>
          stage === "generating" && e.preventDefault()
        }
      >
        {stage === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="h-5 w-5 text-sky-600" />
                Humanize Article
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-2.5 text-sm text-slate-600">
                  <p>
                    Humanize{" "}
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
                Humanize · ~{estimatedCredits}
                <Coins className="h-3.5 w-3.5" />
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === "generating" && (
          <div className="flex flex-col items-center py-6">
            <AIGenerationLoading mode="humanize" />
          </div>
        )}

        {stage === "error" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-red-600">
                Humanization Failed
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
