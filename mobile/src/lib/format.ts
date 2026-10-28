import { type Translate, dateLocale } from "@/lib/i18n";

export function timeAgo(date: Date | null | undefined, t: Translate): string {
  if (!date) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return t("time.justNow");
  if (minutes < 60) return t("time.minutesAgo", { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("time.hoursAgo", { count: hours });

  const days = Math.floor(hours / 24);
  if (days <= 6) return t("time.daysAgo", { count: days });

  return t("time.overWeek");
}

export function timeShort(
  date: Date | null | undefined,
  locale: string = dateLocale(),
): string {
  if (!date) return "";
  return date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function stripHtml(value: string | null | undefined): string {
  if (!value) return "";
  const withBreaks = value
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n");
  const withoutTags = withBreaks.replace(/<[^>]*>/g, "");
  const decoded = withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&apos;/gi, "'");
  return decoded
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
