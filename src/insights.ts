import type { InsightsResponse, MetaInsightsResponse, Metric, Platform } from './types';

export interface PlatformInsights {
  totals: Metric;
  previousTotals: Metric;
  dailyData: Metric[];
}

/** Returns the data for the selected platform from an API insights response. */
export function getPlatformInsights(data: InsightsResponse, platform: Platform): PlatformInsights {
  if (data.network === 'google' || data.network === 'linkedin') {
    return platform === data.network
      ? { totals: data.totals, previousTotals: data.previousTotals, dailyData: data.dailyData }
      : { totals: {}, previousTotals: {}, dailyData: [] };
  }

  const metaData = data as MetaInsightsResponse;
  const metaPlatform = platform as 'facebook' | 'instagram';
  return {
    totals: metaData.totals[metaPlatform] ?? {},
    previousTotals: metaData.previousTotals[metaPlatform] ?? {},
    dailyData: metaData.dailyData[metaPlatform] ?? [],
  };
}
