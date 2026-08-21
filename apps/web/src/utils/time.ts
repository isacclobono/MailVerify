/**
 * Formats an ISO string (or timestamp) into a human-friendly relative time string:
 * e.g. "just now", "15s ago", "10 mins ago", "2 hours ago", "2 days ago", "1 month ago", "2 years ago"
 */
export function formatTimeAgo(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "Unknown";

  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  const now = new Date();

  if (isNaN(date.getTime())) return "Invalid date";

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // If the date is in the future or under 10 seconds ago
  if (diffInSeconds < 10) {
    return "just now";
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? "1 min ago" : `${diffInMinutes} mins ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  }

  const diffInYears = Math.max(1, Math.floor(diffInDays / 365));
  return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
}

/**
 * Formats a date into a standard UTC timestamp:
 * e.g. "2026-08-21 10:58 UTC"
 */
export function formatUtcDateTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
}
