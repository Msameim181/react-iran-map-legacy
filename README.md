# Best Iran Map

An interactive, responsive SVG map of Iran for React. It supports nationwide province and county views, custom regions made from provinces, selective county detail on top of a province or region map, configurable choropleth color bands, optional province-capital and county-center markers, and geographic context for Iran's surrounding waters and islands.

The component remains backward compatible with the original province-based API.

[**Open the live demo →**](https://msameim181.github.io/best-iran-map/)

![Best Iran Map demo showing province colors, selected county detail, capital markers, surrounding seas, and independent islands](docs/images/demo-mixed.webp)

## Features

- **Whole-country views:** 31 Ostans (provinces) or 478 Shahrestan (county) boundaries.
- **Mixed detail:** show one or more selected counties within province or custom-region views.
- **Province focus:** fit the map to a single province, with selected counties or all its counties.
- **Custom regions:** group provinces and aggregate values by sum, average, minimum, or maximum.
- **Choropleth colors:** configurable score ranges, colors, labels, and missing-data fallback.
- **Reusable score-band component:** standalone legend or controlled editor for 0–100 scores and arbitrary numeric x–y ranges.
- **No-data values:** missing, `null`, or `-1` values render gray; province and county availability can be toggled independently in the demo.
- **Capital markers:** optional province capitals and county administrative centers, with coordinates and selection callbacks.
- **Geographic context:** Caspian Sea, Persian Gulf, Gulf of Oman, Strait of Hormuz, and 17 independent island objects linked to their administrative owners.
- **Detailed SVG geometry:** high-detail coastlines and boundaries with thin, rounded, non-scaling strokes.
- **Interaction and accessibility:** tooltips, keyboard selection, hover/click callbacks, Persian labels, and responsive sizing.
- **React + TypeScript:** typed props and exported boundary, capital, island, and water catalogs. Vue support is not included yet.

![Nationwide Shahrestan view in the interactive demo](docs/images/demo-counties.webp)

## Run the demo locally

Use Node.js 22 or newer. The demo includes five modes: provinces, counties, mixed detail, province focus, and custom regions. Its scores are synthetic examples, not real health or statistical data.

```bash
git clone https://github.com/Msameim181/best-iran-map.git
cd best-iran-map
npm ci
npm run demo -- --host 0.0.0.0
```

Open `http://localhost:5173/`, or use your machine's network IP to access the demo from another device.

Choose a layer mode in the left panel, toggle capital points or geographic context, and click an area, capital, or island to inspect its details. In **Province focus**, use the **Focused Ostan** selector to choose a province, search its county list in English or Persian, and enable the counties you want to display. Edit each enabled county's numeric value to update its color immediately, or use **Enable all counties** / **Clear selection**. Selections and values are preserved when switching provinces or modes during the session; refreshing the page restores the demo defaults.

Clicking a province, county, or region selects it; clicking it again unselects it. Clicking outside the map or on its empty/water background also clears the selected area. Keyboard Enter/Space toggles selection in the same way. County visibility/value settings are not reset by deselection.

Use `onDeselect={() => setSelectedArea(null)}` to clear selection in your own UI. `onSelect` still receives only selected areas, and `onHover(null)` clears any stale hover readout when deselecting. The legacy `selectProvinceHandler` receives `{ name: undefined, faName: undefined }` when a province is deselected.

Use **Metric name** to rename “Score” to Population, Revenue, or another label. The demo updates the tooltips, legend heading, county-input labels, and inspection readout together. The example color thresholds stay unchanged; adapt `colorBands` to your metric's actual ranges.

In **Province focus**, turn off **Use province value** to leave the province gray while keeping the selected counties colored. A county's **No data** checkbox keeps its boundary visible but gray, independently of its **Show** checkbox. You can also enter `-1` to mark a value as missing. Choose **Metric scale** and open **Edit bands** to change thresholds, colors, and labels. Numeric mode accepts custom x–y domains, negative values, and decimals; switching back to Score restores the 0–100 demo preset.

## Installation

Install this enhanced fork from GitHub:

```bash
npm install github:Msameim181/best-iran-map#main
```

The package/import name remains `react-iran-map`. The original npm release does not contain this fork's new features. For reproducible deployments, replace `main` with a specific commit SHA. Git installs build the package through its `prepare` script and require Node.js 22 or newer.

## Usage: province map

```tsx
import { IranMap } from 'react-iran-map'

const provinceData = {
  tehran: 42,
  razaviKhorasan: 68,
  fars: 25,
}

export function ProvinceMap() {
  return (
    <IranMap
      mode='province'
      data={provinceData}
      width={640}
      tooltipTitle='Score:'
      onSelect={(area) => console.log(area)}
    />
  )
}
```

## Full-country county map

County IDs use the form `provinceId.countyId`, for example `razaviKhorasan.mashhad`. The exported `countyBoundaries` catalog contains every available ID and its Persian and English names.

```tsx
import { IranMap } from 'react-iran-map'

const countyData = {
  'razaviKhorasan.mashhad': 78,
  'tehran.tehran': 64,
  'fars.shiraz': 38,
}

export function CountyMap() {
  return <IranMap mode='county' data={countyData} width='100%' />
}
```

## Mixed province/county map

Use `detailedCounties` to keep the country in province mode while exposing selected counties as separate interactive areas.

```tsx
<IranMap
  mode='province'
  data={{
    razaviKhorasan: 45,
    'razaviKhorasan.mashhad': 82,
  }}
  detailedCounties={['razaviKhorasan.mashhad']}
  onSelect={(area) => console.log(area.type, area.id)}
/>
```

County selectors may be a full ID, a county-only ID (`mashhad`), a Persian name (`مشهد`), an English name (`Mashhad`), or an OSM relation ID.

## One-province detail view

Use `focusProvince` to remove the rest of the country and fit the SVG viewport tightly around one Ostan. Combine it with `detailedCounties` to expose only selected Shahrestans, or with `mode='county'` to show every Shahrestan in that province.

```tsx
<IranMap
  focusProvince='razaviKhorasan'
  mode='province'
  data={data}
  detailedCounties={['razaviKhorasan.mashhad', 'razaviKhorasan.neyshabur']}
/>

// All Shahrestans of one Ostan:
<IranMap focusProvince='fars' mode='county' data={countyData} />
```

`focusProvince` accepts the province ID, source code, Persian name, or English name. `focusPadding` controls the fitted view-box margin. Province capitals, Shahrestan centers, and islands are automatically limited to the focused province.

## Custom regions

Regions are groups of provinces. Province references may use a province ID, Persian name, English name, or source code. Data can be supplied directly by region ID. If it is not, province values are aggregated using `regionAggregation` (`sum` by default).

```tsx
const regions = [
  {
    id: 'khorasan-region',
    name: 'Khorasan Region',
    faName: 'منطقه خراسان',
    provinces: ['razaviKhorasan', 'northKhorasan', 'southKhorasan'],
  },
]

<IranMap
  mode='region'
  regions={regions}
  data={{ 'khorasan-region': 72, 'razaviKhorasan.mashhad': 91 }}
  detailedCounties={['mashhad']}
/>
```

Provinces not assigned to a custom region remain individually interactive.

## Configurable color bands

“Score” is just a label, not a fixed metric. In your own app, set `tooltipTitle` to any text; `data` still supplies the numeric values:

```tsx
<IranMap data={populationByProvince} tooltipTitle='Population:' />
```

Color bands are evaluated in array order. `min` is inclusive and `max` is exclusive, so `{ min: 50, max: 70 }` represents `50 <= value < 70`.

```tsx
const colorBands = [
  { max: 50, color: '#facc15', label: 'Below 50' },
  { min: 50, max: 70, color: '#ef4444', label: '50 to 69.99' },
  { min: 70, max: 80, color: '#22c55e', label: '70 to 79.99' },
  { min: 80, color: '#166534', label: '80 and above' },
]

<IranMap data={provinceData} colorBands={colorBands} />
```

If `colorBands` is omitted, the `colorRange='30, 70, 181'` RGB gradient is used. Missing values and unmatched bands use `deactiveProvinceColor`. Zero is a valid numeric value, including in gradient mode.

## Missing values: gray means no data

`data` accepts `number | null | undefined`. A missing key, `null`, `undefined`, or the sentinel `-1` means **no data**; non-finite numbers are treated the same way. These areas use `deactiveProvinceColor` (gray `#e6e6e6` by default), remain gray when selected, and show “No data” in area tooltips. Their islands inherit the same no-data color. Selection/hover callbacks expose `value: undefined` for missing data.

```tsx
<IranMap
  focusProvince='razaviKhorasan'
  detailedCounties={['razaviKhorasan.mashhad', 'razaviKhorasan.neyshabur']}
  data={{
    razaviKhorasan: null, // Province stays gray
    'razaviKhorasan.mashhad': 85, // County has data
    'razaviKhorasan.neyshabur': -1, // County has no data
  }}
  colorBands={colorBands}
/>
```

Missing values are excluded from gradients and region aggregation; zero is included. An explicitly missing region value does not fall back to aggregating its provinces. Other finite negative numbers are valid in numeric mode, but `-1` is reserved for no data.

## Standalone score-band legend and editor

`ScoreBands` is an exported React component, independent of the map. Place it in any sidebar, toolbar, settings panel, or separate page. Share the same band state with `IranMap` to keep colors synchronized.

```tsx
import React, { useState } from 'react'
import { IranMap, ScoreBands } from 'react-iran-map'
import type { IranMapColorBand } from 'react-iran-map'

export function RevenueMap() {
  const [bands, setBands] = useState<IranMapColorBand[]>([
    { max: 0, color: '#ef4444', label: 'Negative' },
    { min: 0, max: 1000, color: '#facc15', label: 'Below target' },
    { min: 1000, color: '#166534', label: 'On target' },
  ])

  return (
    <>
      <ScoreBands
        bands={bands}
        onChange={setBands}
        scale='numeric'
        min={-500}
        max={5000}
        metricLabel='Revenue'
        formatValue={(value) => `${value} USD`}
      />
      <IranMap data={{ tehran: 1500, fars: 0, bushehr: null }} colorBands={bands} tooltipTitle='Revenue:' />
    </>
  )
}
```

Omit `onChange` for a read-only legend. Use `scale='score'` for 0–100 thresholds, or `scale='numeric'` for arbitrary finite thresholds, including decimals and negative numbers. Numeric `min`/`max` set the displayed x–y domain; they do not rescale, clamp, or normalize your data or thresholds. Open-ended bands can extend beyond that displayed domain. Intervals stay half-open (`min` inclusive, `max` exclusive); leave the final `max` blank to include a score of 100 and larger values.

The controlled editor supports bounds, labels, colors, adding/removing bands, and unbounded intervals. Invalid threshold drafts do not call `onChange`; overlapping bands retain the map's first-match behavior. Changing values supplied from outside the component resets its temporary drafts.

| Prop                 | Default        | Purpose                                                    |
| -------------------- | -------------- | ---------------------------------------------------------- |
| `bands`              | required       | Same `IranMapColorBand[]` accepted by the map              |
| `onChange`           | omitted        | Enable a controlled editor; parent must update `bands`     |
| `scale`              | `'score'`      | `'score'` (0–100) or `'numeric'` (arbitrary finite bounds) |
| `min`, `max`         | `0`, `100`     | Display-domain endpoints, with `min < max`                 |
| `metricLabel`        | `'Score'`      | Rename the metric heading                                  |
| `orientation`        | `'horizontal'` | Horizontal or vertical legend layout                       |
| `formatValue`        | `String`       | Format domain and interval labels, e.g. currency or units  |
| `showNoData`         | `true`         | Show the no-data legend key                                |
| `noDataColor`        | `'#e6e6e6'`    | Match the map's `deactiveProvinceColor`                    |
| `noDataLabel`        | `'No data'`    | Customize the missing-data legend text                     |
| `className`, `style` | omitted        | Placement and styling hooks                                |

## Capital and administrative-center markers

`capitalMarkers='auto'` displays the 31 province capitals in province or region mode and the 484 Shahrestan administrative centers in county mode. Use `province`, `county`, or `both` to select a layer explicitly, regardless of the current boundary mode.

```tsx
<IranMap
  mode='county'
  data={countyData}
  capitalMarkers='auto'
  capitalMarkerColor='#123f4b'
  onCapitalSelect={(capital) => {
    console.log(capital.faName, capital.latitude, capital.longitude)
  }}
/>
```

Set `showCapitalLabels` to display names beside the points. It is disabled by default to avoid label collisions on the nationwide county view. Every marker remains keyboard-selectable and exposes its Persian/English name and WGS84 latitude/longitude in the tooltip.

## Seas and Iranian islands

The Persian Gulf, Gulf of Oman, Caspian Sea, and connecting Strait of Hormuz are enabled by default using OpenStreetMap water geometry. Seventeen physical island coastlines are rendered as independent interactive objects, including Qeshm, Kish, Hormuz, Abu Musa, the Tunbs, Kharg, Farsi, and Ashuradeh. Islands are not merged into province or Shahrestan paths; each island inherits the fill, score, and selection behavior of its related province, county, or custom region.

```tsx
<IranMap
  data={provinceData}
  showWater
  showSeaLabels
  showIslands
  showIslandLabels
  waterColor='#dcebed'
  onIslandSelect={(island, administrativeArea) => {
    console.log(island.name, administrativeArea.id)
  }}
/>
```

Set any of the `show*` options to `false` for a boundaries-only view. Tiny islands retain a larger transparent interaction target without visually inflating their coastline.

## Main props

| Prop                    | Type                                                   | Default         | Description                                          |
| ----------------------- | ------------------------------------------------------ | --------------- | ---------------------------------------------------- |
| `data`                  | `Record<string, IranMapValue>`                         | required        | Numbers or null/undefined; -1 means no data          |
| `mode`                  | `'province' \| 'county' \| 'region'`                   | `'province'`    | Nationwide display mode                              |
| `regions`               | `IranMapRegion[]`                                      | `[]`            | Custom groups of provinces                           |
| `detailedCounties`      | `string[]`                                             | `[]`            | Counties overlaid in province or region mode         |
| `focusProvince`         | `string`                                               | —               | Render and fit the map to one province               |
| `focusPadding`          | `number`                                               | `28`            | SVG view-box padding around a focused province       |
| `colorBands`            | `IranMapColorBand[]`                                   | —               | Explicit configurable color thresholds               |
| `colorRange`            | RGB triplet string                                     | `'30, 70, 181'` | Legacy automatic gradient color                      |
| `regionAggregation`     | `'sum' \| 'average' \| 'min' \| 'max'`                 | `'sum'`         | Fallback calculation for region values               |
| `onSelect`              | `(area) => void`                                       | —               | Receives province, county, or region selection       |
| `onDeselect`            | `() => void`                                           | —               | Called on toggle-off or outside/background click     |
| `onHover`               | `(area \| null) => void`                               | —               | Receives hover/focus changes                         |
| `width`                 | `number \| string`                                     | `500`           | Map width                                            |
| `tooltipTitle`          | `string`                                               | `''`            | Custom area-tooltip label, e.g. Population:          |
| `selectedAreaColor`     | `string`                                               | —               | Selected area fill                                   |
| `deactiveProvinceColor` | `string`                                               | `'#e6e6e6'`     | Fill for missing/inactive values                     |
| `strokeColor`           | `string`                                               | `'#ffffff'`     | Boundary color                                       |
| `strokeWidth`           | `number`                                               | `0.35`          | Thin non-scaling boundary width with rounded joins   |
| `showLabels`            | `boolean`                                              | province mode   | Show Persian province labels                         |
| `capitalMarkers`        | `'none' \| 'auto' \| 'province' \| 'county' \| 'both'` | `'none'`        | Optional capital/administrative-center point layer   |
| `capitalMarkerColor`    | `string`                                               | `'#123f4b'`     | Capital marker color                                 |
| `capitalMarkerSize`     | `number`                                               | `4`             | Marker radius in SVG view-box units                  |
| `showCapitalLabels`     | `boolean`                                              | `false`         | Show Persian capital labels                          |
| `onCapitalSelect`       | `(capital) => void`                                    | —               | Receives the marker and its WGS84 coordinates        |
| `showWater`             | `boolean`                                              | `true`          | Show the Persian Gulf, Gulf of Oman, and Caspian Sea |
| `waterColor`            | `string`                                               | `'#dcebed'`     | Water-body fill                                      |
| `showSeaLabels`         | `boolean`                                              | `true`          | Show Persian and English water-body names            |
| `showIslands`           | `boolean`                                              | `true`          | Show physical Iranian island coastlines              |
| `showIslandLabels`      | `boolean`                                              | `true`          | Label the featured islands                           |
| `onIslandSelect`        | `(island, area) => void`                               | —               | Receives the island and active administrative owner  |

The legacy props `defaultSelectedProvince`, `selectedProvinceColor`, and `selectProvinceHandler` are still supported for province maps.

## Boundary catalogs

```tsx
import {
  provinceBoundaries,
  countyBoundaries,
  provinceCapitalMarkers,
  countyCapitalMarkers,
  iranIslands,
  iranWaterBodies,
} from 'react-iran-map'

const mashhad = countyBoundaries.find((county) => county.faName === 'مشهد')
const mashhadPoint = provinceCapitalMarkers.find((capital) => capital.faName === 'مشهد')
const qeshm = iranIslands.find((island) => island.id === 'qeshm')
```

Each catalog item contains `id`, `name`, `faName`, and `path`, plus relevant province/source metadata. The checked-in paths use a high-detail build tolerance of `0.00015°`, preserve projected coordinates to three decimal places, and contain approximately 71,000 province vertices and 172,000 Shahrestan vertices. Province and county inland boundaries come from the same administrative snapshot. Water polygons trim maritime envelopes without clipping county land against a different province dataset. Islands remain independent objects. Thin strokes use rounded joins and caps to avoid projecting sharp spikes beyond the actual geometry.

The capital catalogs contain 31 province capitals and 484 Shahrestan centers. Seven recently changed Shahrestan records do not yet have a one-to-one polygon in the 478-boundary catalog, but their point markers are still included. Coordinates are reference points for display and are not a substitute for an official legal or surveying source.

## Data attribution

Administrative boundaries, physical coastlines, water bodies, and coordinate corrections are derived from [OpenStreetMap](https://www.openstreetmap.org/copyright) data and are available under the Open Data Commons Open Database License (ODbL) 1.0. Province and county boundaries use the [Iran GeoJSON](https://github.com/hosseinhabibi2004/iran-geojson) administrative catalog. Physical coastlines use OpenStreetMap water relations 3987743 (Caspian Sea), 9326283 (Persian Gulf), 9326279 (Gulf of Oman), and 9326284 (Strait of Hormuz). Capital coordinates are primarily derived from [GeoNames](https://www.geonames.org/) and are available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See `NOTICE`.

These boundaries are appropriate for detailed thematic cartography, but they are not cadastral, hydrographic, surveying, or legally authoritative boundaries.

Application code is MIT licensed.

## Development and deployment

```bash
npm test -- --runInBand             # Component and geometry regression tests
npm run lint                       # Lint source, tests, demo, and scripts
npm run build                      # ESM/CJS library and TypeScript declarations
npm run demo:build                 # Static demo in demo-dist/
```

The [GitHub Pages workflow](.github/workflows/pages.yml) tests, lints, builds, and deploys the demo whenever a commit is pushed to `main`. It can also be run manually from the repository's Actions tab. Only the demo is published; this does not publish a new npm release.

The Pages build uses `/best-iran-map/` as its Vite base path:

```bash
npm run demo:build -- --base /best-iran-map/
```

If you fork or rename the repository, update that base path in the workflow and the live-demo link above. The development server continues to use `/`.
