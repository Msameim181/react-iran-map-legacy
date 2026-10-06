import React from 'react'
import { Tooltip } from 'react-tooltip'
import { IranMapCapital, MapProps, RenderableMapArea, RenderableMapIsland } from '../../interfaces'

const getTooltip = (area: RenderableMapArea, title: string) => {
  const value = area.value === undefined ? '—' : String(area.value)
  return `${area.faName || area.name} — ${title ? `${title} ` : ''}${value}`
}

const getCapitalTooltip = (capital: IranMapCapital) => {
  const type = capital.areaType === 'province' ? 'Province capital' : 'County center'
  return `${type}: ${capital.faName} (${capital.name}) — ${capital.latitude.toFixed(5)}, ${capital.longitude.toFixed(
    5,
  )}`
}

const getIslandTooltip = (island: RenderableMapIsland) =>
  `Island: ${island.faName} (${island.name}) — ${island.area.faName} (${island.area.name})`

const IranMapWrapper: React.FC<MapProps> = ({
  areas,
  capitals,
  islands,
  waterBodies,
  landBackgrounds,
  landBackgroundColor,
  width,
  textColor,
  tooltipTitle,
  strokeColor,
  strokeWidth,
  selectedAreaId,
  selectedAreaColor,
  onAreaClick,
  onAreaHover,
  ariaLabel,
  showLabels,
  capitalMarkerColor,
  capitalMarkerSize,
  showCapitalLabels,
  onCapitalSelect,
  showWater,
  waterColor,
  seaLabelColor,
  showSeaLabels,
  showIslands,
  showIslandLabels,
  onIslandClick,
}) => {
  const mapScale = 1

  return (
    <>
      <svg
        className='iran-map'
        viewBox='0 0 1000 825'
        xmlns='http://www.w3.org/2000/svg'
        role='img'
        aria-label={ariaLabel}
        style={{ width, height: 'auto', color: textColor }}
      >
        {showWater && (
          <g className='iran-map-water-layer' aria-hidden='true'>
            {waterBodies.map((water) => (
              <path key={water.id} data-water-id={water.id} d={water.path} fill={waterColor} fillRule='evenodd' />
            ))}
            {showSeaLabels &&
              waterBodies
                .filter((water) => water.showLabel !== false)
                .map((water) => (
                  <g
                    key={`water-label:${water.id}`}
                    className='iran-map-water-label'
                    transform={`translate(${water.labelX} ${water.labelY})`}
                    fill={seaLabelColor}
                  >
                    <text className='iran-map-water-label-fa' textAnchor='middle' lang='fa' fontSize={14 * mapScale}>
                      {water.faName}
                    </text>
                    <text
                      className='iran-map-water-label-en'
                      y={14 * mapScale}
                      textAnchor='middle'
                      fontSize={7 * mapScale}
                    >
                      {water.name}
                    </text>
                  </g>
                ))}
          </g>
        )}
        {landBackgrounds.length > 0 && (
          <g className='iran-map-land-background' aria-hidden='true'>
            {landBackgrounds.map((boundary) => (
              <path key={boundary.id} d={boundary.path} fill={landBackgroundColor} fillRule='evenodd' />
            ))}
          </g>
        )}
        {areas.map((area, index) => (
          <path
            key={`${area.type}:${area.id}:${index}`}
            d={area.path}
            fill={area.id === selectedAreaId && selectedAreaColor ? selectedAreaColor : area.fill}
            fillRule='evenodd'
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            vectorEffect='non-scaling-stroke'
            tabIndex={0}
            role='button'
            aria-label={getTooltip(area, tooltipTitle)}
            data-testid={`iran-map-${area.type}-${area.id}`}
            data-area-id={area.id}
            data-area-type={area.type}
            data-tooltip-id='iran-map-tooltip'
            data-tooltip-content={getTooltip(area, tooltipTitle)}
            className='iran-map-area'
            onClick={() => onAreaClick(area)}
            onMouseEnter={() => onAreaHover(area)}
            onMouseLeave={() => onAreaHover(null)}
            onFocus={() => onAreaHover(area)}
            onBlur={() => onAreaHover(null)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onAreaClick(area)
              }
            }}
          />
        ))}
        {showIslands &&
          islands.map((island) => {
            const tooltip = getIslandTooltip(island)
            const selected = island.area.id === selectedAreaId
            return (
              <g
                key={island.id}
                className='iran-map-island'
                tabIndex={0}
                role='button'
                aria-label={tooltip}
                data-testid={`iran-map-island-${island.id}`}
                data-island-id={island.id}
                data-province-id={island.provinceId}
                data-county-id={island.countyId}
                data-latitude={island.latitude}
                data-longitude={island.longitude}
                data-tooltip-id='iran-map-tooltip'
                data-tooltip-content={tooltip}
                onClick={() => onIslandClick(island)}
                onMouseEnter={() => onAreaHover(island.area)}
                onMouseLeave={() => onAreaHover(null)}
                onFocus={() => onAreaHover(island.area)}
                onBlur={() => onAreaHover(null)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onIslandClick(island)
                  }
                }}
              >
                <circle className='iran-map-island-hit' cx={island.labelX} cy={island.labelY} r={6 * mapScale} />
                <path
                  className='iran-map-island-shape'
                  d={island.path}
                  fill={selected && selectedAreaColor ? selectedAreaColor : island.fill}
                  fillRule='evenodd'
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  vectorEffect='non-scaling-stroke'
                />
                {showIslandLabels && island.featured && (
                  <text
                    className='iran-map-island-label'
                    x={island.labelX}
                    y={island.labelY - 8 * mapScale}
                    fill={textColor}
                    textAnchor='middle'
                    fontSize={7 * mapScale}
                  >
                    {island.faName}
                  </text>
                )}
              </g>
            )
          })}
        {showLabels &&
          areas
            .filter((area) => area.type === 'province' && area.labelX !== undefined && area.labelY !== undefined)
            .map((area) => (
              <text
                key={`label:${area.id}`}
                className='iran-map-label'
                x={area.labelX}
                y={area.labelY}
                fill={textColor}
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize={12 * mapScale}
              >
                {area.faName}
              </text>
            ))}
        {capitals.map((capital) => {
          const baseSize = capital.areaType === 'province' ? capitalMarkerSize * 1.25 : capitalMarkerSize
          const size = baseSize * mapScale
          const tooltip = getCapitalTooltip(capital)
          return (
            <g
              key={capital.id}
              className={`iran-map-capital iran-map-capital--${capital.areaType}`}
              transform={`translate(${capital.x} ${capital.y})`}
              tabIndex={0}
              role='button'
              aria-label={tooltip}
              data-testid={`iran-map-capital-${capital.areaType}-${capital.areaId}`}
              data-area-id={capital.areaId}
              data-capital-type={capital.areaType}
              data-latitude={capital.latitude}
              data-longitude={capital.longitude}
              data-tooltip-id='iran-map-tooltip'
              data-tooltip-content={tooltip}
              onClick={() => onCapitalSelect && onCapitalSelect(capital)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onCapitalSelect && onCapitalSelect(capital)
                }
              }}
            >
              <circle className='iran-map-capital-hit' r={Math.max(9, size * 2)} />
              <circle className='iran-map-capital-halo' r={size * 1.75} />
              {capital.areaType === 'province' ? (
                <path
                  className='iran-map-capital-core'
                  d={`M0 ${-size * 1.35} L${size * 1.35} 0 L0 ${size * 1.35} L${-size * 1.35} 0 Z`}
                  fill={capitalMarkerColor}
                />
              ) : (
                <circle className='iran-map-capital-core' r={size} fill={capitalMarkerColor} />
              )}
              <circle className='iran-map-capital-center' r={Math.max(1.1, size * 0.28)} />
              {showCapitalLabels && (
                <text
                  className='iran-map-capital-label'
                  x={size * 2.2}
                  y={-size * 1.5}
                  fill={textColor}
                  fontSize={10 * mapScale}
                >
                  {capital.faName}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <Tooltip id='iran-map-tooltip' variant='light' float className='iran-map-tooltip' />
    </>
  )
}

export default IranMapWrapper
