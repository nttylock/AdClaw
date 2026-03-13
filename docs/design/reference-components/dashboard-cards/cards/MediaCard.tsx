"use client";

import { memo, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Volume2, ImageIcon, Loader2 } from "lucide-react";
import { CARD_BASE } from "./shared";
import {
  MediaGenerationDialog,
  type MediaGenerationTarget,
} from "./MediaGenerationDialog";
import { AudioPlayerIcon } from "@/components/blog/AudioPlayerIcon";

export interface MediaCardProps {
  tenantId: string;
  voiceOverCount: number;
  totalAudioSeconds: number;
  illustrationsCount: number;
  latestVoiced: Array<{
    id: string;
    title: string;
    durationSeconds: number;
    audioUrl: string;
  }>;
  missingMedia: Array<{
    id: string;
    title: string;
    needsVoice: boolean;
    needsIllustrations: boolean;
    contentLength: number;
  }>;
  /** Called after a successful generation to refresh card data */
  onMediaGenerated?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTotalMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

function EmptyState({
  missingMedia,
  onOpenDialog,
}: {
  missingMedia: MediaCardProps["missingMedia"];
  onOpenDialog: (
    type: "voice" | "illustrations",
    article: MediaGenerationTarget,
  ) => void;
}) {
  const displayedMissing = missingMedia.slice(0, 3);

  return (
    <Card className={CARD_BASE}>
      <Film className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-sky-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Film className="h-4 w-4 text-sky-600" />
          Media
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Add AI voice-overs and illustrations to boost engagement.
        </p>

        {/* Articles missing media */}
        {displayedMissing.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Missing media
            </p>
            {displayedMissing.map((article) => (
              <div
                key={article.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50/80 transition-colors"
              >
                <span className="flex-1 truncate text-sm text-slate-600">
                  {article.title}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  {article.needsVoice && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        onOpenDialog("voice", {
                          id: article.id,
                          title: article.title,
                          contentLength: article.contentLength,
                        })
                      }
                      title="Generate voice-over"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-sky-500" />
                    </Button>
                  )}
                  {article.needsIllustrations && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        onOpenDialog("illustrations", {
                          id: article.id,
                          title: article.title,
                          contentLength: article.contentLength,
                        })
                      }
                      title="Generate illustrations"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {displayedMissing.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Publish articles to start generating media.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Key for tracking which article+type is generating */
function genKey(articleId: string, type: "voice" | "illustrations") {
  return `${articleId}:${type}`;
}

function DataState({
  voiceOverCount,
  totalAudioSeconds,
  illustrationsCount,
  latestVoiced,
  missingMedia,
  generatingKeys,
  onOpenDialog,
}: Omit<MediaCardProps, "onMediaGenerated"> & {
  generatingKeys: Set<string>;
  onOpenDialog: (
    type: "voice" | "illustrations",
    article: MediaGenerationTarget,
  ) => void;
}) {
  const displayedVoiced = latestVoiced.slice(0, 3);
  const displayedMissing = missingMedia.slice(0, 3);
  const totalMin = formatTotalMinutes(totalAudioSeconds);

  return (
    <Card className={CARD_BASE}>
      <Film className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-sky-500/[0.03]" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Film className="h-4 w-4 text-sky-600" />
          Media
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white/70 px-3 py-2">
          <span
            className="flex items-center gap-1.5 text-sm"
            title="Articles with voice-over"
          >
            <Volume2 className="h-3.5 w-3.5 text-sky-500" />
            <span className="font-medium tabular-nums text-slate-900">
              {voiceOverCount}
            </span>
          </span>
          {totalMin > 0 && (
            <>
              <span className="text-slate-300">&middot;</span>
              <span
                className="text-sm tabular-nums text-slate-500"
                title="Total audio duration"
              >
                {totalMin} min
              </span>
            </>
          )}
          <span className="text-slate-300">&middot;</span>
          <span
            className="flex items-center gap-1.5 text-sm"
            title="Articles with illustrations"
          >
            <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
            <span className="font-medium tabular-nums text-slate-900">
              {illustrationsCount}
            </span>
          </span>
        </div>

        {/* Latest voice-overs */}
        {displayedVoiced.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Voice-overs
            </p>
            {displayedVoiced.map((article) => (
              <div
                key={article.id}
                className="flex items-center gap-1.5 rounded-lg px-1 py-1 hover:bg-slate-50/80 transition-colors"
              >
                <AudioPlayerIcon
                  audioUrl={article.audioUrl}
                  className="h-7 w-7 shrink-0 text-sky-500"
                />
                <span className="flex-1 truncate text-sm text-slate-600">
                  {article.title}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-slate-400">
                  {formatDuration(article.durationSeconds)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Missing media */}
        {displayedMissing.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Missing media
            </p>
            {displayedMissing.map((article) => {
              const voiceGenerating = generatingKeys.has(
                genKey(article.id, "voice"),
              );
              const illusGenerating = generatingKeys.has(
                genKey(article.id, "illustrations"),
              );

              return (
                <div
                  key={article.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50/80 transition-colors"
                >
                  <span className="flex-1 truncate text-sm text-slate-600">
                    {article.title}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    {article.needsVoice && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={voiceGenerating}
                        onClick={() =>
                          onOpenDialog("voice", {
                            id: article.id,
                            title: article.title,
                            contentLength: article.contentLength,
                          })
                        }
                        title={
                          voiceGenerating
                            ? "Generating..."
                            : "Generate voice-over"
                        }
                      >
                        {voiceGenerating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-500" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5 text-sky-500" />
                        )}
                      </Button>
                    )}
                    {article.needsIllustrations && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={illusGenerating}
                        onClick={() =>
                          onOpenDialog("illustrations", {
                            id: article.id,
                            title: article.title,
                            contentLength: article.contentLength,
                          })
                        }
                        title={
                          illusGenerating
                            ? "Generating..."
                            : "Generate illustrations"
                        }
                      >
                        {illusGenerating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MediaCardComponent(props: MediaCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"voice" | "illustrations">(
    "voice",
  );
  const [dialogArticle, setDialogArticle] =
    useState<MediaGenerationTarget | null>(null);
  const [generatingKeys, setGeneratingKeys] = useState<Set<string>>(new Set());

  const openDialog = useCallback(
    (type: "voice" | "illustrations", article: MediaGenerationTarget) => {
      setDialogType(type);
      setDialogArticle(article);
      setDialogOpen(true);
    },
    [],
  );

  const handleComplete = useCallback(() => {
    // Mark this article+type as generating (spinner on button)
    if (dialogArticle) {
      const key = genKey(dialogArticle.id, dialogType);
      setGeneratingKeys((prev) => new Set(prev).add(key));
    }
    props.onMediaGenerated?.();
  }, [dialogArticle, dialogType, props]);

  const isEmpty =
    props.voiceOverCount === 0 &&
    props.illustrationsCount === 0 &&
    props.latestVoiced.length === 0;

  return (
    <>
      {isEmpty ? (
        <EmptyState
          missingMedia={props.missingMedia}
          onOpenDialog={openDialog}
        />
      ) : (
        <DataState
          {...props}
          generatingKeys={generatingKeys}
          onOpenDialog={openDialog}
        />
      )}

      <MediaGenerationDialog
        open={dialogOpen}
        type={dialogType}
        article={dialogArticle}
        tenantId={props.tenantId}
        onClose={() => setDialogOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
}

export const MediaCard = memo(MediaCardComponent);
MediaCard.displayName = "MediaCard";
