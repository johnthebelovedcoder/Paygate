import type { ProtectedLink, LinkStatus } from '../types/global';

export const PROTECTED_LINKS: ProtectedLink[] = [
  {
    id: '1',
    url: 'https://example.com/secret-document',
    title: 'Secret Document',
    clicks: 24,
    lastClicked: '2023-06-15',
    status: 'active',
    expirationDate: '2023-12-31',
    maxClicks: 100,
    currentClicks: 24,
  },
  {
    id: '2',
    url: 'https://example.com/confidential-video',
    title: 'Confidential Training Video',
    clicks: 12,
    lastClicked: '2023-06-10',
    status: 'active',
    expirationDate: '2023-11-30',
    maxClicks: 50,
    currentClicks: 12,
  },
  {
    id: '3',
    url: 'https://example.com/financial-report',
    title: 'Q2 Financial Report',
    clicks: 8,
    lastClicked: '2023-06-05',
    status: 'paused',
    expirationDate: '2023-10-15',
    maxClicks: 25,
    currentClicks: 8,
  },
];
