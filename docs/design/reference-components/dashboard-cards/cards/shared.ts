export const CARD_BASE =
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-gray-50/80 backdrop-blur-sm border border-slate-200/40";

export function formatTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const time = new Date(dateStr).getTime();
  if (Number.isNaN(time)) return "—";
  const diff = Date.now() - time;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
