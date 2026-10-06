import React, { useMemo, useState } from 'react'
import { countyBoundaries, provinceBoundaries } from '../../data/boundaries'
import { countyCapitalMarkers, provinceCapitalMarkers } from '../../data/capitals'
import {
  IranMapArea,
  IranMapCapital,
  IranMapColorBand,
  IranMapRegion,
  IranMapWrapperProps,
  MapBoundary,
  RegionAggregation,
  RenderableMapArea,
} from '../../interfaces'
import IranMapWrapper from './IranMapWrapper'
import './iran-map.css'

const getValue = (data: Record<string, number>, keys: Array<string | undefined>) => {
  for (const key of keys) {
    if (key !== undefined && Object.prototype.hasOwnProperty.call(data, key)) return data[key]
  }
  return undefined
}

const getBoundaryValue = (boundary: MapBoundary, data: Record<string, number>) =>
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

const getRegionValue = (region: IranMapRegion, data: Record<string, number>, operation: RegionAggregation) => {
  const directValue = getValue(data, [region.id, region.faName, region.name])
  if (directValue !== undefined) return directValue
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
  return aggregate(values, operation)
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

const IranMap: React.FC<IranMapWrapperProps> = ({
  data,
  width,
  colorRange = '30, 70, 181',
  colorBands,
  mode = 'province',
  regions = [],
  detailedCounties = [],
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
  onHover,
  strokeColor = '#ffffff',
  strokeWidth = 0.8,
  className = '',
  ariaLabel = 'Interactive map of Iran',
  showLabels,
  capitalMarkers = 'none',
  capitalMarkerColor = '#123f4b',
  capitalMarkerSize = 4,
  showCapitalLabels = false,
  onCapitalSelect,
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState(defaultSelectedArea || defaultSelectedProvince)

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
    const scopedProvinces = provinceBoundaries

    if (mode === 'county') {
      countyBoundaries.forEach((county) => {
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
        } else if (area.value !== 0) {
          fill = colorFromGradient(area.value, min, max, colorRange)
        }
      }
      return { ...area, fill }
    })
  }, [colorBands, colorRange, data, deactiveProvinceColor, detailedCounties, mode, regionAggregation, regions])

  const handleSelect = (area: RenderableMapArea) => {
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

  const capitals = useMemo<IranMapCapital[]>(() => {
    const activeLayer = capitalMarkers === 'auto' ? (mode === 'county' ? 'county' : 'province') : capitalMarkers
    if (activeLayer === 'province') return provinceCapitalMarkers
    if (activeLayer === 'county') return countyCapitalMarkers
    if (activeLayer === 'both') return [...countyCapitalMarkers, ...provinceCapitalMarkers]
    return []
  }, [capitalMarkers, mode])

  return (
    <div className={`iran-map-wrapper ${className}`.trim()} style={{ width: width || 500 }}>
      <IranMapWrapper
        areas={areas}
        capitals={capitals}
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
      />
    </div>
  )
}

export default IranMap
