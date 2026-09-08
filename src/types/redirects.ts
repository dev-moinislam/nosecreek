export type RedirectStatusCode = 301 | 302 | 307 | 308;

export interface RedirectRule {
  id: string;
  fromPath: string; // e.g. "/old-service", "/promo", "/summer-offer"
  toPath: string;   // e.g. "/services/physiotherapy", "/contact", or "https://..."
  statusCode: RedirectStatusCode;
  enabled: boolean;
  notes?: string;   // Reason or campaign name
  hitCount: number;
  createdAt: string;
  lastHitAt?: string;
}

export interface NotFoundLogItem {
  id: string;
  path: string;
  hitCount: number;
  firstSeenAt: string;
  lastHitAt: string;
  referrer?: string;
}

export interface RedirectsData {
  rules: RedirectRule[];
  notFoundLogs: NotFoundLogItem[];
}
