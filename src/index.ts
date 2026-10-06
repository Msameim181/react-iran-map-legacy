import IranMap from './components/mapSvg/IranMap'

export { IranMap }
export { default as ScoreBands } from './components/scoreBands/ScoreBands'
export type { ScoreBandsProps } from './components/scoreBands/ScoreBands'
export { countyBoundaries, provinceBoundaries } from './data/boundaries'
export { countyCapitalMarkers, provinceCapitalMarkers } from './data/capitals'
export { iranIslands, iranWaterBodies } from './data/geography'
export type {
  IranMapArea,
  IranMapAreaType,
  IranMapCapital,
  IranMapCapitalLayer,
  IranMapCapitalType,
  IranMapColorBand,
  IranMapMode,
  IranMapIsland,
  IranMapRegion,
  IranMapWaterBody,
  IranMapWrapperProps,
  MapBoundary,
  RegionAggregation,
} from './interfaces'
