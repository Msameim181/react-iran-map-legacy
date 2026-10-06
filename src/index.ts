import IranMap from './components/mapSvg/IranMap'

export { IranMap }
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
