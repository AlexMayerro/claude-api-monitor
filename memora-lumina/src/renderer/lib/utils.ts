export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function relativeTime(date: string | Date): string {
  const t = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  const now = Date.now();
  const diff = Math.max(0, now - t);
  const sec = Math.floor(diff / 1000);
  if (sec < 30) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  if (day < 30) return `${Math.floor(day / 7)}w ago`;
  if (day < 365) return `${Math.floor(day / 30)}mo ago`;
  return `${Math.floor(day / 365)}y ago`;
}

export function formatTimestamp(date: string | Date, format: '12h' | '24h' = '12h'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === '24h') {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${d.getMinutes().toString().padStart(2, '0')} ${ampm}`;
}

export function groupByDate<T extends { updated_at?: string; created_at?: string }>(
  items: T[],
  field: 'updated_at' | 'created_at' = 'updated_at',
): { label: string; items: T[] }[] {
  const buckets: Record<string, T[]> = { Today: [], Yesterday: [], 'This Week': [], 'This Month': [], Older: [] };
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = startOfToday - 7 * 86400000;
  const startOfMonth = startOfToday - 30 * 86400000;
  for (const item of items) {
    const ts = new Date(item[field] || item.created_at || item.updated_at || Date.now()).getTime();
    if (ts >= startOfToday) buckets.Today.push(item);
    else if (ts >= startOfYesterday) buckets.Yesterday.push(item);
    else if (ts >= startOfWeek) buckets['This Week'].push(item);
    else if (ts >= startOfMonth) buckets['This Month'].push(item);
    else buckets.Older.push(item);
  }
  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([label, arr]) => ({ label, items: arr }));
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function extractKeywords(text: string, minLen = 3, maxCount = 8): string[] {
  const stopwords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'had', 'her', 'was',
    'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
    'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use',
    'this', 'that', 'with', 'have', 'will', 'they', 'from', 'know', 'want', 'been', 'were',
    'what', 'when', 'your', 'which', 'their', 'about', 'there', 'would', 'could', 'should',
    'into', 'just', 'than', 'them', 'then', 'these', 'those',
  ]);
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= minLen && !stopwords.has(w)),
    ),
  ).slice(0, maxCount);
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}
