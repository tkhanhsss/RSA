export function truncate(str, start = 32, end = 32) {
  if (!str) return "—";
  if (str.length <= start + end + 3) return str;
  return str.slice(0, start) + "..." + str.slice(-end);
}
