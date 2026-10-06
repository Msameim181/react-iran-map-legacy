import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { countyBoundaries, provinceBoundaries } from '../../data/boundaries'
import { countyCapitalMarkers, provinceCapitalMarkers } from '../../data/capitals'
import { iranIslands, iranWaterBodies } from '../../data/geography'
import {
  IranMapArea,
  IranMapCapital,
  IranMapColorBand,
  IranMapRegion,
  IranMapIsland,
  IranMapWrapperProps,
  MapBoundary,
  RegionAggregation,
  RenderableMapArea,
  RenderableMapIsland,
  mapDataType,
} from '../../interfaces'
import { normalizeMapValue } from '../../utils/mapValues'
import IranMapWrapper from './IranMapWrapper'
import './iran-map.css'

const getValue = (data: mapDataType, keys: Array<string | undefined>) => {
  for (const key of keys) {
    if (key !== undefined && Object.prototype.hasOwnProperty.call(data, key)) return normalizeMapValue(data[key])
  }
  return undefined
}

const getBoundaryValue = (boundary: MapBoundary, data: mapDataType) =>
  getValue(data, [
    boundary.id,
    boundary.id.includes('.') ? boundary.id.split('.').pop() : undefined,
    boundary.code,
    boundary.faName,
    boundary.name,
  ])

const aggregate = (values: number[], operation: RegionAggregation) => {
  if (!values.length) return undefined
  if (operation === 'average') return values.reduce((total, value) => total + value, 0) / values.length
  if (operation === 'min') return Math.min(...values)
  if (operation === 'max') return Math.max(...values)
  return values.reduce((total, value) => total + value, 0)
}

const getRegionValue = (region: IranMapRegion, data: mapDataType, operation: RegionAggregation) => {
  const keys = [region.id, region.faName, region.name]
  // An explicitly missing region value must not fall back to province aggregation.
  if (keys.some((key) => key !== undefined && Object.prototype.hasOwnProperty.call(data, key))) {
    return getValue(data, keys)
  }
  const values = region.provinces
    .map((provinceKey) => {
      const province = provinceBoundaries.find(
        (item) =>
          item.id === provinceKey ||
          item.code === provinceKey ||
          item.faName === provinceKey ||
          item.name === provinceKey,
      )
      return province ? getBoundaryValue(province, data) : undefined
    })
    .filter((value): value is number => value !== undefined)
  return normalizeMapValue(aggregate(values, operation))
}

const colorFromBand = (value: number, bands: IranMapColorBand[]) =>
  bands.find((band) => (band.min === undefined || value >= band.min) && (band.max === undefined || value < band.max))
    ?.color

const colorFromGradient = (value: number, min: number, max: number, rgb: string) => {
  const alpha = min === max ? (value > 0 ? 1 : 0.1) : Math.max(0.1, Math.min(1, (value - min) / (max - min)))
  return `rgba(${rgb}, ${alpha})`
}

const matchesBoundary = (boundary: MapBoundary, key: string) =>
  boundary.id === key ||
  boundary.id.split('.').pop() === key ||
  boundary.faName === key ||
  boundary.name === key ||
  String(boundary.osmId) === key

const getPublicIsland = (island: RenderableMapIsland): IranMapIsland => ({
  id: island.id,
  name: island.name,
  faName: island.faName,
  path: island.path,
  code: island.code,
  provinceId: island.provinceId,
  osmId: island.osmId,
  countyId: island.countyId,
  longitude: island.longitude,
  latitude: island.latitude,
  labelX: island.labelX,
  labelY: island.labelY,
  featured: island.featured,
  sourceId: island.sourceId,
})

const getPathBounds = (paths: string[], padding: number) => {
  const coordinates = paths.flatMap((path) =>
    Array.from(path.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g), (match) => [Number(match[1]), Number(match[2])]),
  )
  if (!coordinates.length) return '0 0 1000 825'
  const xValues = coordinates.map(([x]) => x)
  const yValues = coordinates.map(([, y]) => y)
  const minX = Math.max(0, Math.min(...xValues) - padding)
  const minY = Math.max(0, Math.min(...yValues) - padding)
  const maxX = Math.min(1000, Math.max(...xValues) + padding)
  const maxY = Math.min(825, Math.max(...yValues) + padding)
  return `${minX} ${minY} ${Math.max(1, maxX - minX)} ${Math.max(1, maxY - minY)}`
}

const IranMap: React.FC<IranMapWrapperProps> = ({
  data,
  width,
  colorRange = '30, 70, 181',
  colorBands,
  mode = 'province',
  regions = [],
  detailedCounties = [],
  focusProvince,
  focusPadding = 28,
  regionAggregation = 'sum',
  defaultSelectedProvince,
  defaultSelectedArea,
  textColor = '#000',
  deactiveProvinceColor = '#e6e6e6',
  selectedProvinceColor,
  selectedAreaColor,
  tooltipTitle = '',
  selectProvinceHandler,
  onSelect,
  onDeselect,
  onHover,
  strokeColor = '#ffffff',
  strokeWidth = 0.35,
  className = '',
  ariaLabel = 'Interactive map of Iran',
  showLabels,
  capitalMarkers = 'none',
  capitalMarkerColor = '#123f4b',
  capitalMarkerSize = 4,
  showCapitalLabels = false,
  onCapitalSelect,
  showWater = true,
  waterColor = '#dcebed',
  seaLabelColor = '#477983',
  showSeaLabels = true,
  showIslands = true,
  showIslandLabels = true,
  onIslandSelect,
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState(defaultSelectedArea || defaultSelectedProvince)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const clearSelection = useCallback(() => {
    if (selectedAreaId === undefined) return
    setSelectedAreaId(undefined)
    onDeselect?.()
    onHover?.(null)
    if (provinceBoundaries.some((province) => province.id === selectedAreaId)) {
      selectProvinceHandler?.({ name: undefined, faName: undefined })
    }
  }, [onDeselect, onHover, selectedAreaId, selectProvinceHandler])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || selectedAreaId === undefined) return
    const ownerDocument = wrapper.ownerDocument
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null
      const element = target?.nodeType === 1 ? (target as Element) : target?.parentElement
      if (wrapper.contains(target) && element?.closest('.iran-map-area, .iran-map-island, .iran-map-capital')) return
      clearSelection()
    }
    ownerDocument.addEventListener('click', handleClick, true)
    return () => ownerDocument.removeEventListener('click', handleClick, true)
  }, [clearSelection, selectedAreaId])

  const focusedProvince = useMemo(
    () => (focusProvince ? provinceBoundaries.find((province) => matchesBoundary(province, focusProvince)) : undefined),
    [focusProvince],
  )

  const viewBox = useMemo(() => {
    if (!focusedProvince) return '0 0 1000 825'
    const paths = [
      focusedProvince.path,
      ...iranIslands.filter((island) => island.provinceId === focusedProvince.id).map((island) => island.path),
    ]
    return getPathBounds(paths, focusPadding)
  }, [focusPadding, focusedProvince])

  const areas = useMemo(() => {
    const provinceToRegion = new Map<string, IranMapRegion>()
    regions.forEach((region) => {
      region.provinces.forEach((key) => {
        const province = provinceBoundaries.find(
          (item) => item.id === key || item.code === key || item.faName === key || item.name === key,
        )
        if (province && !provinceToRegion.has(province.id)) provinceToRegion.set(province.id, region)
      })
    })

    const rawAreas: Array<Omit<RenderableMapArea, 'fill'>> = []
    const scopedProvinces = focusedProvince ? [focusedProvince] : provinceBoundaries

    if (mode === 'county') {
      countyBoundaries
        .filter((county) => !focusedProvince || county.provinceId === focusedProvince.id)
        .forEach((county) => {
          rawAreas.push({
            ...county,
            type: 'county',
            value: getBoundaryValue(county, data),
          })
        })
    } else {
      scopedProvinces.forEach((province) => {
        const region = mode === 'region' ? provinceToRegion.get(province.id) : undefined
        if (region) {
          rawAreas.push({
            id: region.id,
            name: region.name,
            faName: region.faName || region.name,
            type: 'region',
            regionId: region.id,
            provinceId: province.id,
            path: province.path,
            value: getRegionValue(region, data, regionAggregation),
          })
        } else {
          rawAreas.push({
            ...province,
            type: 'province',
            value: getBoundaryValue(province, data),
          })
        }
      })

      const detailSet = new Set(detailedCounties)
      countyBoundaries
        .filter((county) => !focusedProvince || county.provinceId === focusedProvince.id)
        .filter((county) => Array.from(detailSet).some((key) => matchesBoundary(county, key)))
        .forEach((county) => {
          rawAreas.push({
            ...county,
            type: 'county',
            value: getBoundaryValue(county, data),
          })
        })
    }

    const numericValues = rawAreas.map((area) => area.value).filter((value): value is number => value !== undefined)
    const min = numericValues.length ? Math.min(...numericValues) : 0
    const max = numericValues.length ? Math.max(...numericValues) : 0

    return rawAreas.map((area) => {
      let fill = deactiveProvinceColor
      if (area.value !== undefined) {
        if (colorBands && colorBands.length) {
          fill = colorFromBand(area.value, colorBands) || deactiveProvinceColor
        } else {
          fill = colorFromGradient(area.value, min, max, colorRange)
        }
      }
      return { ...area, fill }
    })
  }, [
    colorBands,
    colorRange,
    data,
    deactiveProvinceColor,
    detailedCounties,
    focusedProvince,
    mode,
    regionAggregation,
    regions,
  ])

  const islands = useMemo<RenderableMapIsland[]>(() => {
    if (!showIslands) return []
    return iranIslands
      .filter((island) => !focusedProvince || island.provinceId === focusedProvince.id)
      .map((island) => {
        const countyOwner = areas.find((area) => area.type === 'county' && area.id === island.countyId)
        const administrativeOwner = areas.find(
          (area) => area.type !== 'county' && (area.provinceId === island.provinceId || area.id === island.provinceId),
        )
        const area = countyOwner || administrativeOwner
        return area ? { ...island, area, fill: area.fill } : undefined
      })
      .filter((island): island is RenderableMapIsland => island !== undefined)
  }, [areas, focusedProvince, showIslands])

  const landBackgrounds = useMemo(
    () => (mode === 'county' ? (focusedProvince ? [focusedProvince] : provinceBoundaries) : []),
    [focusedProvince, mode],
  )

  const handleSelect = (area: RenderableMapArea, toggle = true) => {
    if (toggle && area.id === selectedAreaId) {
      clearSelection()
      return
    }
    setSelectedAreaId(area.id)
    const publicArea: IranMapArea = {
      id: area.id,
      name: area.name,
      faName: area.faName,
      type: area.type,
      value: area.value,
      provinceId: area.provinceId,
      regionId: area.regionId,
      code: area.code,
    }
    onSelect && onSelect(publicArea)
    if (area.type === 'province' && selectProvinceHandler) {
      selectProvinceHandler({ name: area.id, faName: area.faName })
    }
  }

  const publicArea = (area: RenderableMapArea): IranMapArea => ({
    id: area.id,
    name: area.name,
    faName: area.faName,
    type: area.type,
    value: area.value,
    provinceId: area.provinceId,
    regionId: area.regionId,
    code: area.code,
  })

  const handleIslandSelect = (island: RenderableMapIsland) => {
    handleSelect(island.area, false)
    onIslandSelect && onIslandSelect(getPublicIsland(island), publicArea(island.area))
  }

  const capitals = useMemo<IranMapCapital[]>(() => {
    const activeLayer = capitalMarkers === 'auto' ? (mode === 'county' ? 'county' : 'province') : capitalMarkers
    const provinceMarkers = focusedProvince
      ? provinceCapitalMarkers.filter((capital) => capital.provinceId === focusedProvince.id)
      : provinceCapitalMarkers
    const countyMarkers = focusedProvince
      ? countyCapitalMarkers.filter((capital) => capital.provinceId === focusedProvince.id)
      : countyCapitalMarkers
    if (activeLayer === 'province') return provinceMarkers
    if (activeLayer === 'county') return countyMarkers
    if (activeLayer === 'both') return [...countyMarkers, ...provinceMarkers]
    return []
  }, [capitalMarkers, focusedProvince, mode])

  return (
    <div ref={wrapperRef} className={`iran-map-wrapper ${className}`.trim()} style={{ width: width || 500 }}>
      <IranMapWrapper
        areas={areas}
        capitals={capitals}
        islands={islands}
        waterBodies={iranWaterBodies}
        landBackgrounds={landBackgrounds}
        landBackgroundColor={deactiveProvinceColor}
        viewBox={viewBox}
        width='100%'
        textColor={textColor}
        tooltipTitle={tooltipTitle}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        selectedAreaId={selectedAreaId}
        selectedAreaColor={selectedAreaColor || selectedProvinceColor}
        onAreaClick={handleSelect}
        onAreaHover={(area) => onHover && onHover(area)}
        ariaLabel={ariaLabel}
        showLabels={showLabels === undefined ? mode === 'province' : showLabels}
        capitalMarkerColor={capitalMarkerColor}
        capitalMarkerSize={capitalMarkerSize}
        showCapitalLabels={showCapitalLabels}
        onCapitalSelect={onCapitalSelect}
        showWater={showWater}
        waterColor={waterColor}
        seaLabelColor={seaLabelColor}
        showSeaLabels={showSeaLabels}
        showIslands={showIslands}
        showIslandLabels={showIslandLabels}
        onIslandClick={handleIslandSelect}
      />
    </div>
  )
}

export default IranMap
