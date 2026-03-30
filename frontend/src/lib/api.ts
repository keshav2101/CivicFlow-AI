const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const fetcher = (url: string) => fetch(`${API_BASE}${url}`).then(res => res.json());

export const API_ROUTES = {
  TICKETS: '/review/tickets',
  METRICS_SUMMARY: '/metrics/summary',
  METRICS_HISTORY: '/metrics/history',
  APPROVE: '/review/approve',
  REJECT: '/review/reject',
};
