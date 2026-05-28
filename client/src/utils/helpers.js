// ── Date formatting ───────────────────────────────────────────────────────────
export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'],     [60, 'minute'],     [1, 'second'],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count !== 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

// ── Clipboard ─────────────────────────────────────────────────────────────────
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const success = document.execCommand('copy');
    document.body.removeChild(el);
    return success;
  }
};

// ── URL helpers ───────────────────────────────────────────────────────────────
export const truncateUrl = (url, maxLen = 55) => {
  if (!url) return '';
  return url.length > maxLen ? url.slice(0, maxLen) + '…' : url;
};

export const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// ── Number formatting ─────────────────────────────────────────────────────────
export const formatNumber = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n ?? 0);
};

// ── Color palette for charts ─────────────────────────────────────────────────
export const CHART_COLORS = [
  'rgba(147, 51, 234, 0.8)',
  'rgba(99,  102, 241, 0.8)',
  'rgba(236, 72,  153, 0.8)',
  'rgba(16,  185, 129, 0.8)',
  'rgba(245, 158, 11,  0.8)',
  'rgba(59,  130, 246, 0.8)',
  'rgba(239, 68,  68,  0.8)',
  'rgba(20,  184, 166, 0.8)',
];

export const CHART_COLORS_BORDER = CHART_COLORS.map((c) => c.replace('0.8', '1'));
