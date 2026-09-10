/** Small formatting helpers — avoids pulling in a date library. */

export function relativeTime(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const diffMs = date.getTime() - Date.now();
  const absSec = Math.abs(diffMs) / 1000;

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  if (absSec < 45) return "just now";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, secondsInUnit] of units) {
    if (absSec >= secondsInUnit || unit === "second") {
      const value = Math.round(diffMs / 1000 / secondsInUnit);
      return rtf.format(value, unit);
    }
  }
  return "just now";
}

export function formatDate(input: string | number | Date | null | undefined): string {
  if (!input) return "—";
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(input: string | number | Date | null | undefined): string {
  if (!input) return "—";
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function deadlineLabel(input: string | null | undefined): {
  label: string;
  tone: "neutral" | "warning" | "danger";
} {
  if (!input) return { label: "No deadline", tone: "neutral" };
  const date = new Date(input);
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `Overdue by ${Math.abs(days)}d`, tone: "danger" };
  if (days === 0) return { label: "Due today", tone: "danger" };
  if (days <= 3) return { label: `Due in ${days}d`, tone: "warning" };
  return { label: formatDate(date), tone: "neutral" };
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
