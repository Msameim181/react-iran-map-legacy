export type IranMapMode = 'province' | 'county' | 'region'

export type IranMapAreaType = 'province' | 'county' | 'region'

export type IranMapCapitalLayer = 'none' | 'auto' | 'province' | 'county' | 'both'

export type IranMapCapitalType = 'province' | 'county'

export type RegionAggregation = 'sum' | 'average' | 'min' | 'max'

export interface selectedProvinceType {
  name: string | undefined
  faName: string | undefined
}

export interface provinceType {
  provinceName: string
  provinceFaName: string
}

export interface mapDataType {
  [key: string]: number
}

export interface MapBoundary {
  id: string
  name: string
  faName: string
  path: string
  code?: string
  provinceId?: string
  osmId?: number
  labelX?: number
  labelY?: number
}

export interface IranMapRegion {
  id: string
  name: string
  faName?: string
  provinces: string[]
}

/** A half-open numeric interval: min is inclusive and max is exclusive. */
export interface IranMapColorBand {
  min?: number
  max?: number
  color: string
  label?: string
}

export interface IranMapArea {
  id: string
  name: string
  faName: string
  type: IranMapAreaType
  value?: number
  provinceId?: string
  regionId?: string
  code?: string
}

export interface IranMapCapital {
  id: string
  areaId: string
  areaType: IranMapCapitalType
  name: string
  faName: string
  provinceId: string
  countyId?: number
  latitude: number
  longitude: number
  x: number
  y: number
  sourceId: string
  sourceFeatureId: string
}

export interface IranMapWrapperProps {
  data: mapDataType
  width?: number | string
  /** Legacy RGB triplet used for automatic gradient coloring, e.g. "30, 70, 181". */
  colorRange?: string
  colorBands?: IranMapColorBand[]
  mode?: IranMapMode
  regions?: IranMapRegion[]
  detailedCounties?: string[]
  regionAggregation?: RegionAggregation
  textColor?: string
  defaultSelectedProvince?: string
  defaultSelectedArea?: string
  selectedProvinceColor?: string
  selectedAreaColor?: string
  tooltipTitle?: string
  selectProvinceHandler?: (province: selectedProvinceType) => void
  onSelect?: (area: IranMapArea) => void
  onHover?: (area: IranMapArea | null) => void
  deactiveProvinceColor?: string
  strokeColor?: string
  strokeWidth?: number
  className?: string
  ariaLabel?: string
  showLabels?: boolean
  /** Capital markers to render. "auto" follows the active administrative mode. */
  capitalMarkers?: IranMapCapitalLayer
  capitalMarkerColor?: string
  capitalMarkerSize?: number
  showCapitalLabels?: boolean
  onCapitalSelect?: (capital: IranMapCapital) => void
}

export interface RenderableMapArea extends IranMapArea {
  path: string
  fill: string
  labelX?: number
  labelY?: number
}

export interface MapProps {
  areas: RenderableMapArea[]
  capitals: IranMapCapital[]
  width?: number | string
  textColor: string
  tooltipTitle: string
  strokeColor: string
  strokeWidth: number
  selectedAreaId?: string
  selectedAreaColor?: string
  onAreaClick: (area: RenderableMapArea) => void
  onAreaHover: (area: RenderableMapArea | null) => void
  ariaLabel: string
  showLabels: boolean
  capitalMarkerColor: string
  capitalMarkerSize: number
  showCapitalLabels: boolean
  onCapitalSelect?: (capital: IranMapCapital) => void
}
