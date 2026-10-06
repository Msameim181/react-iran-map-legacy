import React from 'react'
import { Tooltip } from 'react-tooltip'
import { IranMapCapital, MapProps, RenderableMapArea } from '../../interfaces'

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

const IranMapWrapper: React.FC<MapProps> = ({
  areas,
  capitals,
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
