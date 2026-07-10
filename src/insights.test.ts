import { describe, expect, it } from 'vitest';
import { getPlatformInsights } from './insights';
import type { InsightsResponse } from './types';

describe('getPlatformInsights', () => {
  it('adapts the flat Google response to its platform view', () => {
    const googleResponse = {
      network: 'google',
      period: { startDate: '2026-06-27', endDate: '2026-07-10' },
      previousPeriod: { startDate: '2026-06-13', endDate: '2026-06-26' },
      totals: { impressions: 429799, clicks: 10132, spend: 8487.56, conversions: 360, ctr: 2.36, cpc: 0.84, cpm: 19.75, costPerConversion: 23.58 },
      previousTotals: { impressions: 420581, clicks: 9893, spend: 8239.32, conversions: 349, ctr: 2.35, cpc: 0.83, cpm: 19.59, costPerConversion: 23.61 },
      dailyData: [{ date: '2026-06-27', impressions: 21169, clicks: 439, spend: 334.94, conversions: 15, ctr: 2.07, cpc: 0.76, cpm: 15.82 }],
    } as unknown as InsightsResponse;

    const result = getPlatformInsights(googleResponse, 'google');
    expect(result.totals.spend).toBe(8487.56);
    expect(result.dailyData).toHaveLength(1);
  });

  it('adapts the flat LinkedIn response to its platform view', () => {
    const linkedinResponse = {
      network: 'linkedin',
      period: { startDate: '2026-06-27', endDate: '2026-07-10' },
      previousPeriod: { startDate: '2026-06-13', endDate: '2026-06-26' },
      totals: { impressions: 240001, clicks: 4458, spend: 7091.52, conversions: 110, ctr: 1.86, cpc: 1.59, cpm: 29.55 },
      previousTotals: { impressions: 228940, clicks: 4284, spend: 6424.46, conversions: 108, ctr: 1.87, cpc: 1.5, cpm: 28.06 },
      dailyData: [{ date: '2026-06-27', impressions: 1339, clicks: 24, spend: 32.52, conversions: 1, ctr: 1.79, cpc: 1.36, cpm: 24.29 }],
    } as unknown as InsightsResponse;

    const result = getPlatformInsights(linkedinResponse, 'linkedin');
    expect(result.totals.conversions).toBe(110);
    expect(result.dailyData).toHaveLength(1);
  });
});
