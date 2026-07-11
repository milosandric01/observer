// Lightweight User-Agent parser — no external dependencies needed.

interface VisitorInfo {
  browser: string
  os: string
  device: 'Desktop' | 'Mobile' | 'Tablet'
}

export function parseUserAgent(ua: string): VisitorInfo {
  const browser = detectBrowser(ua)
  const os = detectOS(ua)
  const device = detectDevice(ua)
  return { browser, os, device }
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera'
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Browser'
  if (/UCBrowser/i.test(ua)) return 'UC Browser'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/CriOS\//i.test(ua)) return 'Chrome'
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome'
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari'
  if (/MSIE|Trident/i.test(ua)) return 'IE'
  return 'Other'
}

function detectOS(ua: string): string {
  if (/Windows NT 10/i.test(ua)) return 'Windows'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) return 'Mac OS'
  if (/iPhone|iPad/i.test(ua)) return 'iOS'
  if (/Android/i.test(ua)) return 'Android'
  if (/Linux/i.test(ua)) return 'Linux'
  if (/CrOS/i.test(ua)) return 'Chrome OS'
  return 'Other'
}

function detectDevice(ua: string): 'Desktop' | 'Mobile' | 'Tablet' {
  if (/iPad|tablet|Kindle|Silk/i.test(ua) && !/Mobile/i.test(ua)) return 'Tablet'
  if (/Mobi|Android.*Mobile|iPhone|iPod|Opera Mini|IEMobile/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

// Map referrer URL to a human-readable source name
const SOURCE_MAP: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /google\./i, name: 'Google' },
  { pattern: /bing\./i, name: 'Bing' },
  { pattern: /duckduckgo\./i, name: 'DuckDuckGo' },
  { pattern: /yahoo\./i, name: 'Yahoo' },
  { pattern: /baidu\./i, name: 'Baidu' },
  { pattern: /yandex\./i, name: 'Yandex' },
  { pattern: /(x|twitter)\.com/i, name: 'X' },
  { pattern: /t\.co\//i, name: 'X' },
  { pattern: /facebook\.com|fb\.com/i, name: 'Facebook' },
  { pattern: /instagram\.com/i, name: 'Instagram' },
  { pattern: /linkedin\.com/i, name: 'LinkedIn' },
  { pattern: /reddit\.com/i, name: 'Reddit' },
  { pattern: /youtube\.com|youtu\.be/i, name: 'YouTube' },
  { pattern: /tiktok\.com/i, name: 'TikTok' },
  { pattern: /pinterest\./i, name: 'Pinterest' },
  { pattern: /producthunt\.com/i, name: 'Product Hunt' },
  { pattern: /news\.ycombinator\.com|hacker\-news/i, name: 'Hacker News' },
  { pattern: /github\.com/i, name: 'GitHub' },
  { pattern: /medium\.com/i, name: 'Medium' },
  { pattern: /substack\.com/i, name: 'Substack' },
]

export function detectSource(referrer: string | undefined | null): { source: string; referrerUrl: string } {
  if (!referrer || referrer === '' || referrer === 'null') {
    return { source: 'Direct', referrerUrl: '' }
  }

  for (const { pattern, name } of SOURCE_MAP) {
    if (pattern.test(referrer)) {
      return { source: name, referrerUrl: referrer }
    }
  }

  // Extract domain as source name for unknown referrers
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    return { source: host, referrerUrl: referrer }
  } catch {
    return { source: referrer, referrerUrl: referrer }
  }
}
