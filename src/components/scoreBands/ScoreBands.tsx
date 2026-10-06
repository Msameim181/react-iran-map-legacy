import React, { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { IranMapColorBand } from '../../interfaces'
import './score-bands.css'

export interface ScoreBandsProps {
  bands: IranMapColorBand[]
  /** With onChange, render a controlled band editor; without it, render a legend. */
  onChange?: (bands: IranMapColorBand[]) => void
  scale?: 'score' | 'numeric'
  /** Display domain. Defaults to 0–100; numeric scales may use any finite x–y domain. */
  min?: number
  max?: number
  metricLabel?: string
  orientation?: 'horizontal' | 'vertical'
  formatValue?: (value: number) => string
  showNoData?: boolean
  noDataColor?: string
  noDataLabel?: string
  className?: string
  style?: CSSProperties
}

const ScoreBands: React.FC<ScoreBandsProps> = ({
  bands,
  onChange,
  scale = 'score',
  min = 0,
  max = 100,
  metricLabel = 'Score',
  orientation = 'horizontal',
  formatValue = String,
  showNoData = true,
  noDataColor = '#e6e6e6',
  noDataLabel = 'No data',
  className = '',
  style,
}) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  useEffect(() => setDrafts({}), [bands])
  const label = metricLabel.trim() || 'Score'
  const validDomain =
    Number.isFinite(min) && Number.isFinite(max) && min < max && (scale === 'numeric' || (min >= 0 && max <= 100))
  const rangeLabel = (band: IranMapColorBand) => {
    if (band.min === undefined && band.max === undefined) return 'All values'
    if (band.min === undefined) return `Below ${formatValue(band.max!)}`
    if (band.max === undefined) return `${formatValue(band.min)} and above`
    return `${formatValue(band.min)} ≤ value < ${formatValue(band.max)}`
  }
  const draftBand = (band: IranMapColorBand, index: number) => {
    const result = { ...band }
    for (const field of ['min', 'max'] as const) {
      const draft = drafts[`${index}:${field}`]
      if (draft !== undefined) result[field] = draft.trim() === '' ? undefined : Number(draft)
    }
    return result
  }
  const validBand = (band: IranMapColorBand) => {
    const bounds = [band.min, band.max].filter((value): value is number => value !== undefined)
    return (
      bounds.every((value) => Number.isFinite(value) && (scale === 'numeric' || (value >= 0 && value <= 100))) &&
      (band.min === undefined || band.max === undefined || band.min < band.max)
    )
  }
  const invalid = bands.some((band, index) => !validBand(draftBand(band, index)))
  const updateBound = (index: number, field: 'min' | 'max', draft: string) => {
    setDrafts((current) => ({ ...current, [`${index}:${field}`]: draft }))
    const band = { ...draftBand(bands[index], index), [field]: draft.trim() === '' ? undefined : Number(draft) }
    if (validBand(band)) onChange?.(bands.map((item, position) => (position === index ? band : item)))
  }

  return (
    <section className={`iran-score-bands ${className}`.trim()} style={style} aria-label={`${label} bands`}>
      <header className='iran-score-bands-heading'>
        <h2>{label} bands</h2>
        {validDomain && <span>{`${formatValue(min)} – ${formatValue(max)}`}</span>}
      </header>
      {!validDomain && (
        <p role='alert'>
          Use finite display endpoints with minimum below maximum. Score domains must stay within 0–100.
        </p>
      )}
      <ul className={`iran-score-bands-legend iran-score-bands-legend--${orientation}`}>
        {bands.map((band, index) => (
          <li key={index}>
            <span className='iran-score-bands-swatch' style={{ backgroundColor: band.color }} aria-hidden='true' />
            <strong>{band.label || rangeLabel(band)}</strong>
            {band.label && <small>{rangeLabel(band)}</small>}
          </li>
        ))}
        {showNoData && (
          <li>
            <span className='iran-score-bands-swatch' style={{ backgroundColor: noDataColor }} aria-hidden='true' />
            <strong>{noDataLabel}</strong>
          </li>
        )}
      </ul>
      {bands.length === 0 && <p>No bands configured.</p>}
      {onChange && (
        <div className='iran-score-bands-editor'>
          {bands.map((band, index) => (
            <fieldset key={index}>
              <legend>Band {index + 1}</legend>
              <label>
                <span>Label</span>
                <input
                  type='text'
                  value={band.label || ''}
                  onChange={(event) =>
                    onChange(
                      bands.map((item, position) =>
                        position === index ? { ...item, label: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
              {(['min', 'max'] as const).map((field) => (
                <label key={field}>
                  <span>{field === 'min' ? 'Minimum (inclusive)' : 'Maximum (exclusive)'}</span>
                  <input
                    type='number'
                    step='any'
                    min={scale === 'score' ? 0 : undefined}
                    max={scale === 'score' ? 100 : undefined}
                    placeholder='Unbounded'
                    value={drafts[`${index}:${field}`] ?? band[field] ?? ''}
                    aria-invalid={!validBand(draftBand(band, index))}
                    onChange={(event) => updateBound(index, field, event.target.value)}
                  />
                </label>
              ))}
              <label>
                <span>Color</span>
                <input
                  type='color'
                  value={/^#[\da-f]{6}$/i.test(band.color) ? band.color : '#000000'}
                  onChange={(event) =>
                    onChange(
                      bands.map((item, position) =>
                        position === index ? { ...item, color: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
              <button
                type='button'
                aria-label={`Remove band ${index + 1}`}
                onClick={() => onChange(bands.filter((_, position) => position !== index))}
              >
                Remove
              </button>
            </fieldset>
          ))}
          {invalid && (
            <p role='alert'>
              Use finite bounds with minimum below maximum. Score bounds must be between 0 and 100. Invalid edits do not
              change the map.
            </p>
          )}
          <button
            type='button'
            disabled={!validDomain}
            onClick={() => onChange([...bands, { min, max, color: '#75b9ad', label: 'New band' }])}
          >
            Add band
          </button>
          <p>Blank bounds are unbounded. Bands are matched in order; the first matching band wins.</p>
        </div>
      )}
    </section>
  )
}

export default ScoreBands
