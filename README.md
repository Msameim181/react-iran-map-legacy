> **DEPRECATED / ARCHIVED — Development has moved to the React, Vue and core packages below.**
> This legacy repository is archived and has been renamed `react-iran-map-legacy`.

# react-iran-map-legacy

Formerly **best-iran-map**, this MIT-licensed fork of
[Sima Mojtahedi's react-iran-map](https://github.com/simamojtahedi/react-iran-map)
added counties, capital markers, islands, seas, selection and configurable color bands.
Use the new packages for continued development.

نقشه ایران: استان‌ها، شهرستان‌ها، مراکز استان، جزایر، دریاها و رنگ‌بندی؛ توسعه به بسته‌های جدید React، Vue و Core منتقل شده است.

## New packages

| Package | npm install command | GitHub repository | Live demo | What it is |
| --- | --- | --- | --- | --- |
| `@msameim181/iran-map-react` | `npm install @msameim181/iran-map-react` | [iran-map-react](https://github.com/Msameim181/iran-map-react) | [React demo](https://msameim181.github.io/iran-map-react/) | Interactive SVG map and score-band components for React, built on core. |
| `@msameim181/iran-map-vue` | `npm install @msameim181/iran-map-vue vue` | [iran-map-vue](https://github.com/Msameim181/iran-map-vue) | [Vue demo](https://msameim181.github.io/iran-map-vue/) | Vue 3 map and score-band components, built on core. |
| `@msameim181/iran-map-core` | `npm install @msameim181/iran-map-core` | [iran-map-core](https://github.com/Msameim181/iran-map-core) | [Data-level comparison](https://msameim181.github.io/iran-map-core/) | Framework-free data, types and map-model builders; no React, Vue or DOM code. |

## Migrate from this fork

The old GitHub installation was:

```sh
npm install github:Msameim181/best-iran-map#main
```

Its package and import name was `react-iran-map`. Replace that dependency:

```sh
npm uninstall react-iran-map
npm install @msameim181/iran-map-react
```

Replace imports from `react-iran-map` with the **full** entry for a drop-in
replacement with all map data. Import the stylesheet once in your app entry;
the new package does not import CSS from JavaScript.

```tsx
import { IranMap } from "@msameim181/iran-map-react/full"
import "@msameim181/iran-map-react/styles.css"

export function Map() {
  return <IranMap data={{ tehran: 42, fars: 25 }} />
}
```

`ScoreBands`, types and catalogs previously imported from `react-iran-map`
can also be imported from `@msameim181/iran-map-react/full`.
The existing map props remain supported, including `mode`, `regions`,
`detailedCounties`, `focusProvince`, `colorBands` and the optional geography layers.
The province-only legacy props remain supported; these are their area-based equivalents:

| Old prop | Area-based equivalent |
| --- | --- |
| `defaultSelectedProvince` | `defaultSelectedArea` (initial area ID) |
| `selectedProvinceColor` | `selectedAreaColor` |
| `selectProvinceHandler` | `onSelect` receives an area; use `area.id` for the old province `name`, and `area.faName` for its Persian name. Handle clearing with `onDeselect`. |

Check [the legacy prop types](src/interfaces.ts) and the
[new React README](https://github.com/Msameim181/iran-map-react#readme) for details:

- **Hover payload:** `onHover` now receives the public `IranMapArea` or `null`;
  the old implementation also leaked rendering fields such as `path` and `fill`.
  Update handlers that relied on those fields.
- **Lean versus full:** the React root entry includes only provinces and province
  capitals. `/full` includes all catalogs; `/lite` includes all catalogs at lighter detail.
- **Catalogs:** the `catalogs` prop merges supplied fields with the entry's defaults.
  Use it to add or override data; a feature with a missing catalog is skipped and
  produces a development-only warning. Core also provides `standard` and `mini` presets.
- **Interaction differences:** the SVG uses `role="group"`; capital markers are
  keyboard-focusable only with `onCapitalSelect`; Space activates on key release.
  See the new README for tooltip, selection and score-band editor behavior.

## Credit and license

Original author: **Sima Mojtahedi**. Upstream:
[simamojtahedi/react-iran-map](https://github.com/simamojtahedi/react-iran-map).
Application code is licensed under MIT; see [LICENSE](LICENSE).
Preserve the code license and the data attribution in [NOTICE](NOTICE).

## Data attribution

Administrative boundaries, physical coastlines, water bodies and coordinate corrections
are derived from [OpenStreetMap](https://www.openstreetmap.org/copyright) data,
© OpenStreetMap contributors, under the Open Data Commons Open Database License
([ODbL 1.0](https://opendatacommons.org/licenses/odbl/)). Province and county boundaries
use the [Iran GeoJSON](https://github.com/hosseinhabibi2004/iran-geojson) administrative catalog.
Physical coastlines use OpenStreetMap water relations 3987743 (Caspian Sea),
9326283 (Persian Gulf), 9326279 (Gulf of Oman) and 9326284 (Strait of Hormuz).
Capital coordinates are primarily derived from [GeoNames](https://www.geonames.org/),
under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [NOTICE](NOTICE).

These boundaries suit thematic cartography; they are not cadastral, hydrographic,
surveying or legally authoritative boundaries.
