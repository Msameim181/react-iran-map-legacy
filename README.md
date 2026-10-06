# React Iran Map

An interactive, responsive SVG map of Iran for React. It supports nationwide province and county views, custom regions made from provinces, selective county detail on top of a province or region map, configurable choropleth color bands, optional province-capital and county-center markers, and geographic context for Iran's surrounding waters and islands.

The component remains backward compatible with the original province-based API.

## Live local demo

The repository includes an interactive React demo covering province, county, mixed-detail, and custom-region modes.

```bash
npm install
npm run demo
```

Then open `http://127.0.0.1:5173/`. A production demo build can be verified with `npm run demo:build`.

## Installation

```bash
npm install react-iran-map
```

## Province map

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

If `colorBands` is omitted, the legacy `colorRange='30, 70, 181'` RGB gradient is used. Missing values, unmatched bands, and zero values in legacy-gradient mode use `deactiveProvinceColor`.

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
| `data`                  | `Record<string, number>`                               | required        | Values keyed by province, county, or region ID/name  |
| `mode`                  | `'province' \| 'county' \| 'region'`                   | `'province'`    | Nationwide display mode                              |
| `regions`               | `IranMapRegion[]`                                      | `[]`            | Custom groups of provinces                           |
| `detailedCounties`      | `string[]`                                             | `[]`            | Counties overlaid in province or region mode         |
| `focusProvince`         | `string`                                               | —               | Render and fit the map to one province               |
| `focusPadding`          | `number`                                               | `28`            | SVG view-box padding around a focused province       |
| `colorBands`            | `IranMapColorBand[]`                                   | —               | Explicit configurable color thresholds               |
| `colorRange`            | RGB triplet string                                     | `'30, 70, 181'` | Legacy automatic gradient color                      |
| `regionAggregation`     | `'sum' \| 'average' \| 'min' \| 'max'`                 | `'sum'`         | Fallback calculation for region values               |
| `onSelect`              | `(area) => void`                                       | —               | Receives province, county, or region selection       |
| `onHover`               | `(area \| null) => void`                               | —               | Receives hover/focus changes                         |
| `width`                 | `number \| string`                                     | `500`           | Map width                                            |
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
