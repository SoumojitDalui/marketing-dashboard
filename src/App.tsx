import { useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatApiError, getInsights, getSummary } from './api';
import type { InsightsResponse, Metric, Network, Platform, SummaryPlatform, SummaryResponse } from './types';
import { getPlatformInsights } from './insights';
import * as S from './styles';

const META_PLATFORMS: Platform[] = ['facebook', 'instagram'];
const PLATFORM: Record<Platform, {name:string; color:string; path:string}> = {
  facebook: { name: 'Facebook', color: '#1877f2', path: '/meta' }, instagram: { name: 'Instagram', color: '#e74377', path: '/meta' },
  google: { name: 'Google Ads', color: '#4285f4', path: '/google' }, linkedin: { name: 'LinkedIn', color: '#0a66c2', path: '/linkedin' },
};
const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const value = (v: number, key: string) => key === 'spend' || key === 'cpc' || key === 'cpm' || key === 'costPerConversion' ? money.format(v) : key === 'ctr' ? `${v.toFixed(2)}%` : fmt.format(v);
const compact = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(2)}m` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);
const displayDate = (date: string) => dateFmt.format(new Date(`${date}T12:00:00`));
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (days: number) => { const d = new Date(); d.setDate(d.getDate() - days); return iso(d); };
const delta = (current: number, previous: number, lowerIsBetter = false) => {
  const percent = previous ? ((current - previous) / previous) * 100 : 0;
  const favorable = lowerIsBetter ? percent < 0 : percent > 0;
  return { text: `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`, tone: Math.abs(percent) < .05 ? 'neutral' : favorable ? 'good' : 'bad' } as const;
};
const rangeLabel = (start: string, end: string) => `${displayDate(start)} – ${displayDate(end)}`;
const metricNumber = (metric: Metric, key: string) => Number(metric[key] ?? 0);
const percent = (numerator: number, denominator: number) => denominator ? (numerator / denominator) * 100 : 0;
const cpa = (spend: number, conversions: number) => conversions ? spend / conversions : 0;
const cpm = (spend: number, impressions: number) => impressions ? (spend / impressions) * 1000 : 0;
function download(name: string, rows: Record<string, unknown>[]) { const blob = new Blob([Papa.unparse(rows)], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }

function Layout({ children }: { children: React.ReactNode }) {
  return <S.Shell><S.Header><S.Brand><span>p</span>pulse</S.Brand><S.Nav><NavLink end to="/">Overview</NavLink><NavLink to="/meta">Meta</NavLink><NavLink to="/google">Google</NavLink><NavLink to="/linkedin">LinkedIn</NavLink></S.Nav></S.Header>{children}</S.Shell>;
}
function PlatformCard({ platform, data }: { platform: Platform; data: SummaryPlatform }) {
  const info = PLATFORM[platform], totals = data.totals as Record<string, number>, previous = data.previousTotals as Record<string, number>;
  const d = delta(totals.conversions, previous.conversions);
  return <S.Card><S.CardTop><S.PlatformTag $color={info.color}>{info.name}</S.PlatformTag><S.ViewLink>View →</S.ViewLink></S.CardTop><S.BigNumber>{money.format(totals.spend)}</S.BigNumber><S.Label>30-day ad spend</S.Label><S.MetricRow><div>Conversions<strong>{fmt.format(totals.conversions)}</strong></div><div><S.Delta $tone={d.tone}>{d.text}</S.Delta></div></S.MetricRow><S.MetricRow><div>Impressions<strong>{compact(totals.impressions)}</strong></div><div>Clicks<strong>{fmt.format(totals.clicks)}</strong></div></S.MetricRow></S.Card>;
}
function Overview() {
  const [data, setData] = useState<SummaryResponse | null>(null), [error, setError] = useState('');
  useEffect(() => { getSummary().then(setData).catch(error => setError(formatApiError(error))); }, []);
  const platforms = data ? [['facebook', data.meta.facebook], ['instagram', data.meta.instagram], ['google', data.google], ['linkedin', data.linkedin]] as [Platform, SummaryPlatform][] : [];
  const funnel = platforms.reduce((all, [, platform]) => ({ impressions: all.impressions + metricNumber(platform.totals, 'impressions'), clicks: all.clicks + metricNumber(platform.totals, 'clicks'), conversions: all.conversions + metricNumber(platform.totals, 'conversions'), spend: all.spend + metricNumber(platform.totals, 'spend') }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 });
  const shareMetrics = [{ key: 'spend', label: 'Spend', total: funnel.spend }, { key: 'impressions', label: 'Impressions', total: funnel.impressions }, { key: 'clicks', label: 'Clicks', total: funnel.clicks }, { key: 'conversions', label: 'Conversions', total: funnel.conversions }];
  return <Layout>
    <S.PageHead><div><S.Eyebrow>Marketing performance</S.Eyebrow><S.Heading>Your channel pulse</S.Heading><S.Subhead>30-day rolling overview across paid media.</S.Subhead></div></S.PageHead>
    {error ? <S.ErrorBox>{error}</S.ErrorBox> : !data ? <S.Loader>Loading channel performance…</S.Loader> : <>
      <S.Panel style={{marginBottom:18}}><S.PanelTitle>Campaign funnel</S.PanelTitle><S.PanelHint>How paid reach progressed through the conversion journey.</S.PanelHint><S.Funnel><S.FunnelStep><S.Label>Impressions</S.Label><S.FunnelNumber>{fmt.format(funnel.impressions)}</S.FunnelNumber><S.FunnelRate>Top of funnel</S.FunnelRate></S.FunnelStep><S.FunnelStep><S.Label>Clicks</S.Label><S.FunnelNumber>{fmt.format(funnel.clicks)}</S.FunnelNumber><S.FunnelRate>{percent(funnel.clicks, funnel.impressions).toFixed(2)}% click-through rate</S.FunnelRate></S.FunnelStep><S.FunnelStep><S.Label>Conversions</S.Label><S.FunnelNumber>{fmt.format(funnel.conversions)}</S.FunnelNumber><S.FunnelRate>{percent(funnel.conversions, funnel.clicks).toFixed(2)}% click-to-conversion rate</S.FunnelRate></S.FunnelStep></S.Funnel></S.Panel>
      <S.Grid>{platforms.map(([p, d]) => <NavLink key={p} to={PLATFORM[p].path} style={{ color: 'inherit', textDecoration: 'none' }}><PlatformCard platform={p} data={d} /></NavLink>)}</S.Grid>
      <S.Panel style={{marginTop:18}}><S.PanelTitle>Network comparison</S.PanelTitle><S.PanelHint>Rank each platform on reach, outcomes, and efficiency.</S.PanelHint><S.TableWrap><S.ComparisonTable><thead><tr><th>Platform</th><th>Spend</th><th>Conversions</th><th>CPA</th><th>CTR</th><th>CPM</th></tr></thead><tbody>{platforms.map(([platform, item]) => { const totals = item.totals; const impressions = metricNumber(totals, 'impressions'), clicks = metricNumber(totals, 'clicks'), spend = metricNumber(totals, 'spend'), conversions = metricNumber(totals, 'conversions'); return <tr key={platform}><td data-label="Platform"><S.PlatformTag $color={PLATFORM[platform].color}>{PLATFORM[platform].name}</S.PlatformTag></td><td data-label="Spend">{money.format(spend)}</td><td data-label="Conversions">{fmt.format(conversions)}</td><td data-label="CPA">{money.format(cpa(spend, conversions))}</td><td data-label="CTR">{percent(clicks, impressions).toFixed(2)}%</td><td data-label="CPM">{money.format(cpm(spend, impressions))}</td></tr>; })}</tbody></S.ComparisonTable></S.TableWrap></S.Panel>
      <S.Panel style={{marginTop:18}}><S.PanelTitle>Efficiency scorecard</S.PanelTitle><S.PanelHint>Cost efficiency for each platform, including derived cost per conversion.</S.PanelHint><S.TableWrap><S.ComparisonTable><thead><tr><th>Platform</th><th>CPC</th><th>CPM</th><th>Cost / conversion</th></tr></thead><tbody>{platforms.map(([platform, item]) => { const totals = item.totals; const impressions = metricNumber(totals, 'impressions'), clicks = metricNumber(totals, 'clicks'), spend = metricNumber(totals, 'spend'), conversions = metricNumber(totals, 'conversions'); return <tr key={platform}><td data-label="Platform"><S.PlatformTag $color={PLATFORM[platform].color}>{PLATFORM[platform].name}</S.PlatformTag></td><td data-label="CPC">{money.format(cpa(spend, clicks))}</td><td data-label="CPM">{money.format(cpm(spend, impressions))}</td><td data-label="Cost / conversion">{money.format(cpa(spend, conversions))}</td></tr>; })}</tbody></S.ComparisonTable></S.TableWrap></S.Panel>
      <S.Panel style={{marginTop:18}}><S.PanelTitle>Platform share</S.PanelTitle><S.PanelHint>How each platform contributes to the total 30-day result.</S.PanelHint><S.ShareGrid>{platforms.map(([platform, item]) => <S.ShareCard key={platform}><S.PlatformTag $color={PLATFORM[platform].color}>{PLATFORM[platform].name}</S.PlatformTag>{shareMetrics.map(metric => { const share = percent(metricNumber(item.totals, metric.key), metric.total); return <S.ShareMetric key={metric.key}>{metric.label}<strong>{share.toFixed(1)}%</strong><div><i style={{width:`${share}%`}}/></div></S.ShareMetric>; })}</S.ShareCard>)}</S.ShareGrid></S.Panel>
      <S.Footnote>Compare detail performance with the previous, equal-length period. Values may vary slightly between requests because this API generates synthetic data.</S.Footnote>
    </>}
  </Layout>;
}
function DateControls({ start, end, onApply, exporting, onExport, exportOptions }: { start:string; end:string; onApply:(s:string,e:string)=>void; exporting:boolean; onExport:(platforms?: Platform[])=>void; exportOptions?: { label:string; platforms:Platform[] }[] }) {
  const [draftStart, setDraftStart] = useState(start), [draftEnd, setDraftEnd] = useState(end), [message, setMessage] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportControlRef = useRef<HTMLDivElement>(null);
  const today = iso(new Date());
  useEffect(() => { setDraftStart(start); setDraftEnd(end); }, [start, end]);
  useEffect(() => {
    if (!exportMenuOpen) return;
    const dismissMenu = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) { if (event.key === 'Escape') setExportMenuOpen(false); return; }
      if (exportControlRef.current && !exportControlRef.current.contains(event.target as Node)) setExportMenuOpen(false);
    };
    document.addEventListener('mousedown', dismissMenu);
    document.addEventListener('keydown', dismissMenu);
    return () => { document.removeEventListener('mousedown', dismissMenu); document.removeEventListener('keydown', dismissMenu); };
  }, [exportMenuOpen]);
  const apply = () => { const length = Math.round((new Date(`${draftEnd}T00:00:00`).getTime() - new Date(`${draftStart}T00:00:00`).getTime()) / 86400000) + 1; if (length < 7 || length > 30) return setMessage('Choose an inclusive range of 7–30 days.'); setMessage(''); onApply(draftStart, draftEnd); };
  const chooseExport = (platforms?: Platform[]) => { setExportMenuOpen(false); onExport(platforms); };
  const selectPreset = (days: number) => { const nextStart = daysAgo(days - 1); setDraftStart(nextStart); setDraftEnd(today); setMessage(''); onApply(nextStart, today); };
  return <div><S.Toolbar><S.Toggle><button className={start===daysAgo(6) && end===today?'selected':''} onClick={()=>selectPreset(7)}>Week</button><button className={start===daysAgo(29) && end===today?'selected':''} onClick={()=>selectPreset(30)}>Month</button></S.Toggle><S.Input aria-label="Start date" type="date" value={draftStart} max={draftEnd} onChange={e=>setDraftStart(e.target.value)} /><span>to</span><S.Input aria-label="End date" type="date" value={draftEnd} min={draftStart} max={today} onChange={e=>setDraftEnd(e.target.value)} /><S.Button onClick={apply}>Apply</S.Button>{exportOptions ? <S.ExportControl ref={exportControlRef}><S.GhostButton aria-expanded={exportMenuOpen} disabled={exporting} onClick={()=>setExportMenuOpen(open=>!open)}>↓ Export CSV ▾</S.GhostButton>{exportMenuOpen && <S.ExportMenu>{exportOptions.map(option=><button key={option.label} onClick={()=>chooseExport(option.platforms)}>{option.label}</button>)}</S.ExportMenu>}</S.ExportControl> : <S.GhostButton disabled={exporting} onClick={()=>chooseExport()}>↓ Export CSV</S.GhostButton>}</S.Toolbar>{message && <S.Footnote style={{color:'#b13f4d', marginTop:8}}>{message}</S.Footnote>}</div>;
}
const networkLabels: Record<Network, string> = { meta: 'Meta', google: 'Google Ads', linkedin: 'LinkedIn' };
const platformMetrics: Record<Platform, {key:string; label:string; efficiency?:boolean}[]> = {
  facebook: [{key:'impressions',label:'Impressions'}, {key:'clicks',label:'Clicks'}, {key:'conversions',label:'Conversions'}, {key:'reach',label:'Reach'}, {key:'ctr',label:'CTR'}, {key:'cpc',label:'CPC',efficiency:true}, {key:'cpm',label:'CPM',efficiency:true}, {key:'likes',label:'Likes'}, {key:'comments',label:'Comments'}, {key:'shares',label:'Shares'}],
  instagram: [{key:'impressions',label:'Impressions'}, {key:'clicks',label:'Clicks'}, {key:'conversions',label:'Conversions'}, {key:'reach',label:'Reach'}, {key:'ctr',label:'CTR'}, {key:'cpc',label:'CPC',efficiency:true}, {key:'cpm',label:'CPM',efficiency:true}, {key:'likes',label:'Likes'}, {key:'comments',label:'Comments'}, {key:'saves',label:'Saves'}],
  google: [{key:'impressions',label:'Impressions'}, {key:'clicks',label:'Clicks'}, {key:'conversions',label:'Conversions'}, {key:'ctr',label:'CTR'}, {key:'cpc',label:'CPC',efficiency:true}, {key:'cpm',label:'CPM',efficiency:true}, {key:'costPerConversion',label:'Cost / conv.',efficiency:true}],
  linkedin: [{key:'impressions',label:'Impressions'}, {key:'clicks',label:'Clicks'}, {key:'conversions',label:'Conversions'}, {key:'ctr',label:'CTR'}, {key:'cpc',label:'CPC',efficiency:true}, {key:'cpm',label:'CPM',efficiency:true}, {key:'likes',label:'Likes'}, {key:'comments',label:'Comments'}, {key:'shares',label:'Shares'}, {key:'follows',label:'Follows'}]
};
function Detail() {
  const param = useParams().network as Network, network = ['meta','google','linkedin'].includes(param) ? param : null;
  const [start, setStart] = useState(daysAgo(13)), [end, setEnd] = useState(daysAgo(0)), [data, setData] = useState<InsightsResponse | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [active, setActive] = useState<Platform>('facebook');
  useEffect(() => { if (!network) return; setLoading(true); setError(''); getInsights(network,start,end).then(d => { setData(d); setActive(network === 'meta' ? 'facebook' : network); }).catch(error=>setError(formatApiError(error))).finally(()=>setLoading(false)); }, [network,start,end]);
  if (!network) return <Navigate to="/" replace />;
  const platforms: Platform[] = network === 'meta' ? META_PLATFORMS : [network];
  const exportData = (selectedPlatforms = platforms) => { if (!data) return; const rows = selectedPlatforms.flatMap(platform => getPlatformInsights(data, platform).dailyData.map(row => ({ network: networkLabels[network], platform: PLATFORM[platform].name, period_start: data.period.startDate, period_end: data.period.endDate, comparison_start: data.previousPeriod.startDate, comparison_end: data.previousPeriod.endDate, ...row }))); const scope = selectedPlatforms.length > 1 ? 'combined' : selectedPlatforms[0]; download(`${network}-${scope}-${start}-to-${end}.csv`, rows); };
  const activeInsights = data ? getPlatformInsights(data, active) : { totals: {}, previousTotals: {}, dailyData: [] };
  const totals = activeInsights.totals as Record<string, number>, previous = activeInsights.previousTotals as Record<string, number>;
  const trend = activeInsights.dailyData;
  const overviewMetrics = ['spend','conversions','ctr','cpc','cpm','impressions'];
  const dailyMetrics = trend as Metric[];
  const bestConversionDay = dailyMetrics.reduce<Metric | null>((best, day) => !best || metricNumber(day, 'conversions') > metricNumber(best, 'conversions') ? day : best, null);
  const lowestConversionDay = dailyMetrics.reduce<Metric | null>((lowest, day) => !lowest || metricNumber(day, 'conversions') < metricNumber(lowest, 'conversions') ? day : lowest, null);
  const costliestDay = dailyMetrics.reduce<Metric | null>((costliest, day) => {
    if (!metricNumber(day, 'conversions')) return costliest;
    return !costliest || cpa(metricNumber(day, 'spend'), metricNumber(day, 'conversions')) > cpa(metricNumber(costliest, 'spend'), metricNumber(costliest, 'conversions')) ? day : costliest;
  }, null);
  const signalLabel = (date: string) => [bestConversionDay?.date === date && 'Best conversion day', lowestConversionDay?.date === date && 'Lowest conversion day', costliestDay?.date === date && 'Highest cost per conversion'].filter(Boolean).join(' · ');
  return <Layout>
    <S.PageHead><div><S.Eyebrow>Network detail</S.Eyebrow><S.Heading>{networkLabels[network]} performance</S.Heading><S.Subhead>{rangeLabel(start,end)} · compared to the preceding equal-length period</S.Subhead>{network === 'meta' && <S.Toggle style={{marginTop:18,width:'fit-content'}}>{platforms.map(p=><button key={p} className={active===p?'selected':''} onClick={()=>setActive(p)}>{PLATFORM[p].name}</button>)}</S.Toggle>}</div><DateControls start={start} end={end} onApply={(s,e)=>{setStart(s);setEnd(e)}} exporting={loading || !data} onExport={exportData} exportOptions={network === 'meta' ? [{ label: 'Facebook CSV', platforms: ['facebook'] }, { label: 'Instagram CSV', platforms: ['instagram'] }, { label: 'Combined Meta CSV', platforms: META_PLATFORMS }] : undefined}/></S.PageHead>
    {error ? <S.ErrorBox>{error}</S.ErrorBox> : loading || !data ? <S.Loader>Loading live network insights…</S.Loader> : <>
      <S.DetailGrid>
        <S.Panel><S.PanelTitle>Daily conversions & spend</S.PanelTitle>
          <div style={{height:260,marginTop:10}}><ResponsiveContainer width="100%" height="100%"><ComposedChart data={trend}><defs><linearGradient id="conversion-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={PLATFORM[active].color} stopOpacity={.3}/><stop offset="100%" stopColor={PLATFORM[active].color} stopOpacity={.01}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#eef0f4"/><XAxis dataKey="date" tickFormatter={v=>displayDate(String(v))} tick={{fontSize:11,fill:'#858a9a'}} axisLine={false} tickLine={false} minTickGap={25}/><YAxis yAxisId="conversions" tickFormatter={v=>compact(Number(v))} tick={{fontSize:11,fill:'#858a9a'}} axisLine={false} tickLine={false} width={38}/><YAxis yAxisId="spend" orientation="right" tickFormatter={v=>`$${compact(Number(v))}`} tick={{fontSize:11,fill:'#858a9a'}} axisLine={false} tickLine={false} width={44}/><Tooltip labelFormatter={v=>{const date = String(v); const signal = signalLabel(date); return `${displayDate(date)}${signal ? ` — ${signal}` : ''}`;}} formatter={(v,name) => [name === 'Spend' ? money.format(Number(v)) : fmt.format(Number(v)), name]} contentStyle={{borderRadius:10,border:'1px solid #e5e6ed',boxShadow:'0 6px 20px #292a3c16'}}/><Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize:12,paddingBottom:12}}/><Area yAxisId="conversions" type="monotone" name="Conversions" dataKey="conversions" stroke={PLATFORM[active].color} strokeWidth={2.5} fill="url(#conversion-area)" dot={(props: any) => { const signalColor = props.payload.date === bestConversionDay?.date ? '#16a34a' : props.payload.date === lowestConversionDay?.date ? '#dc2626' : PLATFORM[active].color; const radius = signalColor === PLATFORM[active].color ? 2.5 : 6; return <circle cx={props.cx} cy={props.cy} r={radius} fill={signalColor} stroke={radius === 6 ? '#fff' : 'none'} strokeWidth={2}/>; }} activeDot={{r:5}}/><Line yAxisId="spend" type="monotone" name="Spend" dataKey="spend" stroke="#f59e0b" strokeWidth={2.5} dot={(props: any) => { const isCostliest = props.payload.date === costliestDay?.date; return <circle cx={props.cx} cy={props.cy} r={isCostliest ? 6 : 2.5} fill={isCostliest ? '#7c3aed' : '#f59e0b'} stroke={isCostliest ? '#fff' : 'none'} strokeWidth={2}/>; }} activeDot={{r:5}}/></ComposedChart></ResponsiveContainer></div>
        </S.Panel>
        <S.Panel style={{display:'flex',flexDirection:'column'}}><S.PanelTitle>Period at a glance</S.PanelTitle><S.PanelHint>Change versus {rangeLabel(data.previousPeriod.startDate,data.previousPeriod.endDate)}</S.PanelHint><S.FillMetricGrid>{overviewMetrics.map(key=>{const d=delta(totals[key] ?? 0, previous[key] ?? 0, ['cpc','cpm'].includes(key)); return <S.MetricCard key={key}><S.Label>{key === 'ctr' ? 'CTR' : key.replace(/([A-Z])/g,' $1')}</S.Label><strong style={{fontSize:16,display:'block',margin:'4px 0 7px'}}>{value(totals[key] ?? 0,key)}</strong><S.Delta $tone={key==='spend' ? 'neutral' : d.tone}>{d.text}</S.Delta></S.MetricCard>})}</S.FillMetricGrid></S.Panel>
      </S.DetailGrid>
      <S.Divider/>
      <S.Panel><S.PanelTitle>Daily signals</S.PanelTitle><S.PanelHint>Best and worst days in the selected period.</S.PanelHint><S.InsightGrid>{bestConversionDay && <S.InsightCard><S.SignalLabel $color="#16a34a">Best conversion day</S.SignalLabel><strong>{displayDate(String(bestConversionDay.date))}</strong><span>{fmt.format(metricNumber(bestConversionDay, 'conversions'))} conversions</span></S.InsightCard>}{lowestConversionDay && <S.InsightCard><S.SignalLabel $color="#dc2626">Lowest conversion day</S.SignalLabel><strong>{displayDate(String(lowestConversionDay.date))}</strong><span>{fmt.format(metricNumber(lowestConversionDay, 'conversions'))} conversions</span></S.InsightCard>}{costliestDay && <S.InsightCard><S.SignalLabel $color="#7c3aed">Highest cost per conversion</S.SignalLabel><strong>{displayDate(String(costliestDay.date))}</strong><span>{money.format(cpa(metricNumber(costliestDay, 'spend'), metricNumber(costliestDay, 'conversions')))} per conversion</span></S.InsightCard>}</S.InsightGrid></S.Panel>
      <S.Divider/>
      <S.Panel><S.PanelTitle>{PLATFORM[active].name} metrics</S.PanelTitle><S.PanelHint>Favourable movement is up for outcomes and down for efficiency. Spend is intentionally neutral.</S.PanelHint><S.MetricGrid>{platformMetrics[active].map(({key,label,efficiency})=>{const d=delta(totals[key] ?? 0,previous[key] ?? 0,efficiency); return <S.MetricCard key={key}><S.Label>{label}</S.Label><strong style={{fontSize:17,display:'block',margin:'5px 0 8px'}}>{value(totals[key] ?? 0,key)}</strong><S.Delta $tone={d.tone}>{d.text} vs prior</S.Delta></S.MetricCard>})}</S.MetricGrid></S.Panel>
    </>}
  </Layout>;
}
export default function App() { return <><S.GlobalStyle/><Routes><Route path="/" element={<Overview/>}/><Route path="/:network" element={<Detail/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></>; }
