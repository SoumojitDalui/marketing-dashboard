export type Metric = Record<string, number | string>;
export type Platform = 'facebook' | 'instagram' | 'google' | 'linkedin';
export type Network = 'meta' | 'google' | 'linkedin';
export interface SummaryPlatform { totals: Metric; previousTotals: Metric; dailyData: Metric[] }
export interface SummaryResponse { period: { startDate: string; endDate: string }; previousPeriod: { startDate: string; endDate: string }; meta: { facebook: SummaryPlatform; instagram: SummaryPlatform }; google: SummaryPlatform; linkedin: SummaryPlatform }
export interface MetaInsightsResponse { network: 'meta'; period: { startDate: string; endDate: string }; previousPeriod: { startDate: string; endDate: string }; totals: Record<'facebook' | 'instagram', Metric>; previousTotals: Record<'facebook' | 'instagram', Metric>; dailyData: Record<'facebook' | 'instagram', Metric[]> }
export interface SingleNetworkInsightsResponse { network: 'google' | 'linkedin'; period: { startDate: string; endDate: string }; previousPeriod: { startDate: string; endDate: string }; totals: Metric; previousTotals: Metric; dailyData: Metric[] }
export type InsightsResponse = MetaInsightsResponse | SingleNetworkInsightsResponse;
