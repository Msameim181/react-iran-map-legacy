import React from 'react'
import { Tooltip } from 'react-tooltip'
import { MapProps, RenderableMapArea } from '../../interfaces'

const getTooltip = (area: RenderableMapArea, title: string) => {
  const value = area.value === undefined ? '—' : String(area.value)
  return `${area.faName || area.name} — ${title ? `${title} ` : ''}${value}`
}

const IranMapWrapper: React.FC<MapProps> = ({
  areas,
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
      </svg>
      <Tooltip id='iran-map-tooltip' variant='light' float className='iran-map-tooltip' />
    </>
  )
}

export default IranMapWrapper
