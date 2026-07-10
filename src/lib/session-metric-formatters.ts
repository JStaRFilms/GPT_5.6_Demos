const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const wholeNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const timestamp = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hourCycle: "h23",
  timeZone: "UTC",
  timeZoneName: "short",
});

export function formatMetricNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value < 10_000 ? wholeNumber.format(value) : compactNumber.format(value);
}

export function formatExactNumber(value: number): string {
  return Number.isFinite(value) ? wholeNumber.format(value) : "Unavailable";
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 0.01 ? 6 : 4,
  }).format(value);
}

export function formatDuration(value: number, exact = false): string {
  if (!Number.isFinite(value) || value < 0) return "—";
  const totalMs = Math.round(value);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1_000);
  const milliseconds = totalMs % 1_000;

  if (exact) {
    const secondPart = `${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}s`;
    return hours
      ? `${hours}h ${String(minutes).padStart(2, "0")}m ${secondPart}`
      : `${minutes}m ${secondPart}`;
  }

  const roundedSeconds = Math.round(totalMs / 1_000);
  const roundedHours = Math.floor(roundedSeconds / 3_600);
  const roundedMinutes = Math.floor((roundedSeconds % 3_600) / 60);
  const remainderSeconds = roundedSeconds % 60;
  if (roundedHours) return `${roundedHours}h ${String(roundedMinutes).padStart(2, "0")}m`;
  if (roundedMinutes) return `${roundedMinutes}m ${String(remainderSeconds).padStart(2, "0")}s`;
  return `${remainderSeconds}s`;
}

export function formatSessionTimestamp(value: string | null): string {
  if (!value) return "Timestamp unavailable";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Timestamp unavailable" : timestamp.format(date);
}
