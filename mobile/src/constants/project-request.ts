export type ContactMethod = "app" | "phone" | "sms" | "email";

export type ContactBestTime =
  | "anytime"
  | "morning"
  | "afternoon"
  | "evening"
  | "weekends";

export type ContactPreferences = {
  methods: ContactMethod[];
  bestTime: ContactBestTime;
};

export const CONTACT_METHODS: { value: ContactMethod; label: string }[] = [
  { value: "app", label: "App message" },
  { value: "phone", label: "Phone call" },
  { value: "sms", label: "Text message" },
  { value: "email", label: "Email" },
];

export const CONTACT_BEST_TIMES: {
  value: ContactBestTime;
  label: string;
  hint: string;
}[] = [
  { value: "anytime", label: "Anytime", hint: "" },
  { value: "morning", label: "Morning", hint: "8am–12pm" },
  { value: "afternoon", label: "Afternoon", hint: "12–5pm" },
  { value: "evening", label: "Evening", hint: "5–9pm" },
  { value: "weekends", label: "Weekends", hint: "" },
];

export const PHONE_CONTACT_METHODS: ContactMethod[] = ["phone", "sms"];

export type ProjectStartType = "asap" | "specialist" | "period";

export type StartOption = {
  key: string;
  label: string;
  type: ProjectStartType;
  days?: number;
};

export const START_OPTIONS: StartOption[] = [
  { key: "asap", label: "As soon as possible", type: "asap" },
  { key: "week", label: "Within a week", type: "period", days: 7 },
  { key: "month", label: "Within a month", type: "period", days: 30 },
  { key: "flexible", label: "I'm flexible", type: "specialist" },
];

export function contactMethodLabel(method: ContactMethod): string {
  return CONTACT_METHODS.find((item) => item.value === method)?.label ?? method;
}

export function bestTimeLabel(time: ContactBestTime): string {
  const item = CONTACT_BEST_TIMES.find((entry) => entry.value === time);
  if (!item) return time;
  return item.hint ? `${item.label} (${item.hint})` : item.label;
}

export function parseBudget(text: string): number | null {
  const match = text
    .replace(/,/g, "")
    .match(/(\d+(?:\.\d+)?)\s*(k|thousand)?/i);
  if (!match) return null;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return null;
  const value = Math.round(match[2] ? base * 1000 : base);
  return value > 0 ? value : null;
}

export function formatBudget(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function startLabel(
  type: ProjectStartType | null,
  start: Date | null,
  end: Date | null,
): string {
  switch (type) {
    case "asap":
      return "As soon as possible";
    case "specialist":
      return "Flexible — specialist's choice";
    case "period":
      if (start && end) return `${shortDate(start)} – ${shortDate(end)}`;
      if (end) return `By ${shortDate(end)}`;
      if (start) return `From ${shortDate(start)}`;
      return "Specific dates";
    default:
      return "";
  }
}

export function budgetLabel(budget: number | null): string {
  return budget ? `Up to ${formatBudget(budget)}` : "";
}
