import type { InsightsResponse, Network, SummaryResponse } from './types';

const BASE = 'https://eulerity-hackathon.appspot.com/v1';
export class ApiError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'ApiError'; }
}

export function formatApiError(error: unknown) {
  if (error instanceof ApiError) return `${error.code} — ${error.message}`;
  return error instanceof Error ? error.message : 'Unable to load live marketing data.';
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const code = typeof body?.error === 'string' ? body.error : `HTTP_${response.status}`;
    const message = typeof body?.message === 'string' ? body.message : 'Unable to load live marketing data.';
    throw new ApiError(code, message);
  }
  return response.json() as Promise<T>;
}
export const getSummary = () => request<SummaryResponse>('/metrics-summary');
export const getInsights = (network: Network, startDate: string, endDate: string) => request<InsightsResponse>(`/metrics-insights?network=${network}&startDate=${startDate}&endDate=${endDate}`);
