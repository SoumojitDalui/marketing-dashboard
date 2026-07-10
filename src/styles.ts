import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f8fc; color: #202333; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  button, input { font: inherit; } button { cursor: pointer; }
`;
export const Shell = styled.div`max-width: 1440px; min-height: 100vh; margin: auto; padding: 0 40px 48px;`;
export const Header = styled.header`height: 76px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #e8eaf1;`;
export const Brand = styled.div`display:flex; align-items:center; gap:11px; font-weight:800; letter-spacing:-.04em; font-size:20px; span { background:#272264; color:#fff; width:28px; height:28px; border-radius:9px; display:grid; place-items:center; font-size:15px; }`;
export const Nav = styled.nav`display:flex; gap:4px; a { text-decoration:none; color:#73788d; padding:8px 12px; border-radius:8px; font-size:14px; font-weight:600; &.active { background:#ebeafd; color:#312e81; } }`;
export const Eyebrow = styled.div`font-size:11px; color:#6d6a9f; font-weight:800; letter-spacing:.13em; text-transform:uppercase;`;
export const Heading = styled.h1`font-size:34px; letter-spacing:-.05em; margin:7px 0 6px; line-height:1.05;`;
export const Subhead = styled.p`color:#73788d; margin:0; font-size:14px;`;
export const PageHead = styled.section`display:flex; justify-content:space-between; align-items:end; padding:45px 0 30px;`;
export const Grid = styled.div`display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; @media(max-width: 900px){grid-template-columns:repeat(2, 1fr)} @media(max-width:580px){grid-template-columns:1fr}`;
export const Card = styled.article`background:white; border:1px solid #e9eaf0; border-radius:16px; padding:20px; box-shadow:0 5px 18px rgba(32,35,51,.025);`;
export const CardTop = styled.div`display:flex; justify-content:space-between; align-items:center; margin-bottom:21px;`;
export const PlatformTag = styled.div<{ $color: string }>`display:flex; gap:9px; align-items:center; font-weight:750; font-size:14px; &:before { content:''; width:9px; height:9px; background:${p => p.$color}; border-radius:50%; box-shadow:0 0 0 4px color-mix(in srgb, ${p => p.$color} 13%, transparent); }`;
export const ViewLink = styled.span`font-size:12px; font-weight:700; color:#5d59ab;`;
export const BigNumber = styled.div`font-size:25px; font-weight:800; letter-spacing:-.04em; margin-bottom:4px;`;
export const Label = styled.div`color:#83889a; font-size:12px;`;
export const MetricRow = styled.div`display:flex; justify-content:space-between; margin-top:18px; padding-top:15px; border-top:1px solid #f0f1f5; font-size:12px; color:#73788d; strong { color:#333647; font-size:13px; display:block; margin-top:3px; }`;
export const Delta = styled.span<{ $tone: 'good' | 'bad' | 'neutral' }>`color:${p => p.$tone === 'good' ? '#15966a' : p.$tone === 'bad' ? '#d14b58' : '#777c8d'}; background:${p => p.$tone === 'good' ? '#e8f8f1' : p.$tone === 'bad' ? '#fff0f1' : '#f2f3f6'}; padding:4px 7px; font-weight:750; border-radius:6px; font-size:11px;`;
export const DetailGrid = styled.div`display:grid; grid-template-columns:1.32fr .9fr; gap:18px; @media(max-width:900px){grid-template-columns:1fr}`;
export const Panel = styled.section`background:#fff; border:1px solid #e9eaf0; border-radius:16px; padding:22px;`;
export const PanelTitle = styled.h2`font-size:16px; margin:0; letter-spacing:-.025em;`;
export const PanelHint = styled.p`font-size:12px; color:#858a9a; margin:5px 0 16px;`;
export const Toolbar = styled.div`display:flex; flex-wrap:wrap; align-items:center; gap:9px;`;
export const Input = styled.input`padding:9px 10px; border:1px solid #dfe1e9; border-radius:8px; color:#35394a; font-size:13px; background:#fff;`;
export const Button = styled.button`border:0; border-radius:8px; padding:10px 13px; background:#312e81; color:white; font-size:13px; font-weight:700; &:hover{background:#272264} &:disabled{opacity:.55; cursor:wait;}`;
export const GhostButton = styled(Button)`background:#f0effb; color:#514c9d; &:hover{background:#e6e4fa;}`;
export const MetricGrid = styled.div`display:grid; grid-template-columns:repeat(3,1fr); gap:11px; @media(max-width:540px){grid-template-columns:repeat(2,1fr)}`;
export const MetricCard = styled.div`padding:13px; border:1px solid #eef0f4; border-radius:11px; background:#fcfcfe; min-width:0;`;
export const Loader = styled.div`padding:56px; text-align:center; color:#74798a;`;
export const ErrorBox = styled.div`padding:16px; color:#a83847; background:#fff0f1; border-radius:10px; font-size:14px;`;
export const Divider = styled.div`height:1px; background:#eef0f4; margin:20px 0;`;
export const Footnote = styled.p`font-size:11px; color:#8c90a0; margin:20px 0 0;`;
export const Toggle = styled.div`display:flex; gap:4px; background:#f3f4f8; border-radius:9px; padding:3px; button{border:0;background:transparent;color:#797d8e;padding:7px 10px;border-radius:6px;font-size:12px;font-weight:700;&.selected{background:white;color:#302d73;box-shadow:0 1px 4px #dfe0e8}}`;
export const ExportControl = styled.div`position:relative;`;
export const ExportMenu = styled.div`position:absolute; z-index:10; right:0; top:calc(100% + 7px); min-width:190px; padding:5px; background:white; border:1px solid #e1e3eb; border-radius:10px; box-shadow:0 12px 28px rgba(32,35,51,.15); button{display:block; width:100%; padding:9px 10px; border:0; border-radius:7px; color:#36394a; background:transparent; font-size:13px; text-align:left; font-weight:650; &:hover{background:#f1f0fb; color:#312e81;}}`;
export const Funnel = styled.div`display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:18px; @media(max-width:600px){grid-template-columns:1fr}`;
export const FunnelStep = styled.div`padding:15px; background:#fafafe; border:1px solid #ececf5; border-radius:11px;`;
export const FunnelNumber = styled.strong`display:block; margin:5px 0; font-size:22px; letter-spacing:-.04em;`;
export const FunnelRate = styled.div`font-size:12px; color:#5f5aab; font-weight:700;`;
export const TableWrap = styled.div`overflow-x:auto; margin-top:15px;`;
export const ComparisonTable = styled.table`border-collapse:collapse; width:100%; min-width:630px; font-size:13px; th{text-align:right; color:#858a9a; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:.04em; padding:0 10px 10px; &:first-child{text-align:left;padding-left:0;}} td{text-align:right; padding:13px 10px; border-top:1px solid #edf0f4; color:#36394a; font-weight:700; &:first-child{text-align:left;padding-left:0;}}`;
export const InsightGrid = styled.div`display:grid; grid-template-columns:repeat(3,1fr); gap:11px; margin-top:16px; @media(max-width:700px){grid-template-columns:1fr}`;
export const InsightCard = styled.div`padding:15px; border:1px solid #ececf5; border-radius:11px; background:#fcfcfe; strong{display:block; margin:5px 0 3px; font-size:16px; letter-spacing:-.025em;} span{font-size:12px;color:#83889a;}`;
