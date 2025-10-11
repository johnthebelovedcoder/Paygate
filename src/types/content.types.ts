export interface ContentResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

export type ContentType =
  | 'url'
  | 'document'
  | 'file'
  | 'video'
  | 'image'
  | 'paywall'
  | 'content'
  | 'content_package';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  status: string;
  tags: string[];
  type: ContentType;
  size?: string;
  isProtected: boolean;
  price?: number;
  currency?: string;
  paywallTitle?: string;
  paywallDescription?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  filename?: string;
}
