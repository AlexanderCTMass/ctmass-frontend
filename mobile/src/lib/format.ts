export function timeAgo(date: Date | null | undefined): string {
  if (!date) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const days = Math.floor(hours / 24);
  if (days <= 6) return `${days} ${days === 1 ? "day" : "days"} ago`;

  return "more than a week ago";
}

export function timeShort(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
