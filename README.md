# Pulse — multi-channel marketing dashboard

## Run locally

```bash
npm install
npm run dev
```

The app calls the supplied Eulerity API directly from the browser. It uses React + TypeScript, styled-components, React Router, Recharts, and Papa Parse.

## Product decision: interpreting deltas

The brief does not define what makes a change in spend favourable. This dashboard classifies **outcome metrics** (impressions, clicks, conversions, reach, and engagement) as favourable when they rise, and **efficiency metrics** (CPC, CPM, cost per conversion) as favourable when they fall. Spend is shown as contextual: it is neutral by itself, because an increase can be good or bad depending on budget intent. This rule is shown in the detail-page metric tooltips.

The detail view defaults to the latest 14 calendar days, supports inclusive 7–30-day ranges, and requests the API-provided equal-length comparison period automatically.

## API tests

The [api-test](./api-test) folder is a Bruno collection. It verifies the summary endpoint, all three insight-network shapes, and every documented validation/routing error. Open the folder in Bruno and run the collection.
