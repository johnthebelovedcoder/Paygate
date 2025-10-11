import type { ProtectedLink, LinkStatus } from '@/types/global';

export const normalizeLink = (raw: Partial<ProtectedLink>): ProtectedLink => ({
  id: raw.id || '',
  url: raw.url || '',
  title: raw.title || '',
  clicks: raw.clicks || 0,
  lastClicked: raw.lastClicked || '',
  expirationDate: raw.expirationDate || '',
  password: raw.password || '',
  maxClicks: raw.maxClicks || 0,
  currentClicks: raw.currentClicks || 0,
  status: (['active', 'expired', 'paused'].includes(raw.status as string)
    ? raw.status
    : 'active') as LinkStatus,
});
