/**
 * Formats a date as YYYY-MM-DD using UTC.
 * This ensures consistent date keys regardless of server timezone,
 * and matches how the client interprets dates.
 */
export const formatLocalDateKey = (date: Date = new Date()): string => {
  // Use UTC to ensure consistency across different server timezones
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const startOfLocalDay = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};
