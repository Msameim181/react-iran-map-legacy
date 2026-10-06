import React, { useMemo, useState } from 'react'
import { IranMap, countyBoundaries, provinceBoundaries } from '../../src'
import type {
  IranMapArea,
  IranMapCapital,
  IranMapCapitalLayer,
  IranMapIsland,
  IranMapMode,
  IranMapRegion,
} from '../../src'

type DemoMode = IranMapMode | 'mixed' | 'focus'

const modes: Array<{ id: DemoMode; label: string; caption: string }> = [
  { id: 'province', label: 'Provinces', caption: '31 administrative areas' },
  { id: 'county', label: 'Counties', caption: '478 detailed boundaries' },
  { id: 'mixed', label: 'Mixed detail', caption: 'Selected counties on provinces' },
  { id: 'focus', label: 'Province focus', caption: 'One province + selected counties' },
  { id: 'region', label: 'Custom regions', caption: 'Province groups + county detail' },
]

const regions: IranMapRegion[] = [
  {
    id: 'greater-khorasan',
    name: 'Greater Khorasan',
    faName: 'منطقه خراسان',
    provinces: ['razaviKhorasan', 'northKhorasan', 'southKhorasan'],
  },
  {
    id: 'northwest',
    name: 'Northwest',
    faName: 'منطقه شمال غرب',
    provinces: ['eastAzerbaijan', 'westAzerbaijan', 'ardabil', 'zanjan'],
  },
]

const detailCounties = ['razaviKhorasan.mashhad', 'tehran.tehran', 'fars.shiraz']
const focusCounties = ['razaviKhorasan.mashhad', 'razaviKhorasan.neyshabur', 'razaviKhorasan.torbatEHeydarieh']

const capitalLayers: Array<{ id: IranMapCapitalLayer; label: string }> = [
  { id: 'auto', label: 'Context' },
  { id: 'both', label: 'Both' },
  { id: 'none', label: 'Off' },
]

const colorBands = [
  { max: 25, color: '#bedfd5', label: 'Low' },
  { min: 25, max: 50, color: '#75b9ad', label: 'Watch' },
  { min: 50, max: 70, color: '#f2c15a', label: 'Elevated' },
  { min: 70, max: 85, color: '#e47b58', label: 'High' },
  { min: 85, color: '#a93f46', label: 'Critical' },
]

const provinceData = Object.fromEntries(
  provinceBoundaries.map((province, index) => [province.id, (index * 19 + 14) % 101]),
)

const countyData = Object.fromEntries(countyBoundaries.map((county, index) => [county.id, (index * 23 + 11) % 101]))

const demoData = {
  ...provinceData,
  ...countyData,
  'greater-khorasan': 76,
  northwest: 43,
  'razaviKhorasan.mashhad': 92,
  'tehran.tehran': 81,
  'fars.shiraz': 66,
}

const App: React.FC = () => {
  const [demoMode, setDemoMode] = useState<DemoMode>('mixed')
  const [selectedArea, setSelectedArea] = useState<IranMapArea | null>(null)
  const [hoveredArea, setHoveredArea] = useState<IranMapArea | null>(null)
  const [selectedCapital, setSelectedCapital] = useState<IranMapCapital | null>(null)
  const [capitalLayer, setCapitalLayer] = useState<IranMapCapitalLayer>('auto')
  const [showGeography, setShowGeography] = useState(true)
  const [selectedIsland, setSelectedIsland] = useState<IranMapIsland | null>(null)
  const [focusProvinceId, setFocusProvinceId] = useState('razaviKhorasan')

  const activeMode = useMemo<IranMapMode>(
    () => (demoMode === 'mixed' || demoMode === 'focus' ? 'province' : demoMode),
    [demoMode],
  )
  const activeArea = hoveredArea || selectedArea
  const activeModeCopy = modes.find((mode) => mode.id === demoMode)
  const activeCapital = hoveredArea ? null : selectedCapital

  return (
    <main className='demo-shell'>
      <header className='masthead'>
        <div className='brand-lockup'>
          <span className='brand-mark' aria-hidden='true'>
            IR
          </span>
          <div>
            <p className='eyebrow'>React Iran Map / live demo</p>
            <h1>Layer lab</h1>
          </div>
        </div>
        <div className='coverage-index' aria-label='Map coverage'>
          <div>
            <strong>31</strong>
            <span>provinces</span>
          </div>
          <span className='coverage-arrow' aria-hidden='true'>
            →
          </span>
          <div>
            <strong>478</strong>
            <span>counties</span>
          </div>
        </div>
      </header>

      <section className='workbench'>
        <aside className='layer-panel' aria-label='Map controls'>
          <div className='panel-heading'>
            <p className='panel-kicker'>Layer mode</p>
            <p>Switch the same React component between administrative views.</p>
          </div>

          <div className='mode-list' role='radiogroup' aria-label='Map display mode'>
            {modes.map((mode, index) => (
              <button
                key={mode.id}
                type='button'
                role='radio'
                aria-checked={demoMode === mode.id}
                className={`mode-option ${demoMode === mode.id ? 'is-active' : ''}`}
                onClick={() => {
                  setDemoMode(mode.id)
                  setHoveredArea(null)
                }}
              >
                <span className='mode-number'>{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <strong>{mode.label}</strong>
                  <small>{mode.caption}</small>
                </span>
                <span className='mode-indicator' aria-hidden='true' />
              </button>
            ))}
          </div>

          {demoMode === 'focus' && (
            <label className='focus-picker'>
              <span className='panel-kicker'>Focused Ostan</span>
              <select
                value={focusProvinceId}
                onChange={(event) => {
                  setFocusProvinceId(event.target.value)
                  setSelectedArea(null)
                  setSelectedIsland(null)
                }}
              >
                {provinceBoundaries.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name} — {province.faName}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className='capital-control'>
            <div className='capital-control-heading'>
              <p className='panel-kicker'>Capital points</p>
              <span>31 / 484</span>
            </div>
            <div className='capital-options' role='radiogroup' aria-label='Capital marker layer'>
              {capitalLayers.map((layer) => (
                <button
                  key={layer.id}
                  type='button'
                  role='radio'
                  aria-checked={capitalLayer === layer.id}
                  className={capitalLayer === layer.id ? 'is-active' : ''}
                  onClick={() => setCapitalLayer(layer.id)}
                >
                  {layer.label}
                </button>
              ))}
            </div>
            <small>Context follows the current province or county view.</small>
          </div>

          <div className='capital-control geography-control'>
            <div className='capital-control-heading'>
              <p className='panel-kicker'>Geographic context</p>
              <span>3 seas + strait / 17 islands</span>
            </div>
            <div className='capital-options geography-options' role='radiogroup' aria-label='Geographic context layer'>
              <button
                type='button'
                role='radio'
                aria-checked={showGeography}
                className={showGeography ? 'is-active' : ''}
                onClick={() => setShowGeography(true)}
              >
                Full
              </button>
              <button
                type='button'
                role='radio'
                aria-checked={!showGeography}
                className={!showGeography ? 'is-active' : ''}
                onClick={() => setShowGeography(false)}
              >
                Boundaries
              </button>
            </div>
            <small>Physical coastlines replace maritime administrative envelopes.</small>
          </div>

          <div className='legend-block'>
            <p className='panel-kicker'>Configurable score bands</p>
            <div className='legend-scale' aria-label='Map color legend'>
              {colorBands.map((band) => (
                <span key={band.label} style={{ backgroundColor: band.color }} title={band.label} />
              ))}
            </div>
            <div className='legend-labels'>
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>70</span>
              <span>85+</span>
            </div>
          </div>
        </aside>

        <div className='map-stage'>
          <div className='stage-meta'>
            <div>
              <span className='live-dot' aria-hidden='true' />
              <span>Live layer</span>
              <strong>{activeModeCopy?.label}</strong>
            </div>
            <p>
              {demoMode === 'mixed'
                ? 'Mashhad, Tehran and Shiraz are independently selectable.'
                : activeModeCopy?.caption}
            </p>
          </div>

          <div className='map-canvas' key={demoMode}>
            <IranMap
              mode={activeMode}
              focusProvince={demoMode === 'focus' ? focusProvinceId : undefined}
              regions={demoMode === 'region' ? regions : []}
              detailedCounties={
                demoMode === 'focus' && focusProvinceId === 'razaviKhorasan'
                  ? focusCounties
                  : demoMode === 'mixed' || demoMode === 'region'
                    ? detailCounties
                    : []
              }
              data={demoData}
              colorBands={colorBands}
              width='100%'
              deactiveProvinceColor='#dce5e1'
              selectedAreaColor='#123f4b'
              strokeColor='#f8faf7'
              strokeWidth={0.35}
              tooltipTitle='Score:'
              capitalMarkers={capitalLayer}
              capitalMarkerColor='#123f4b'
              capitalMarkerSize={demoMode === 'county' ? 3.2 : 4}
              showLabels={demoMode === 'province' || demoMode === 'mixed' || demoMode === 'focus'}
              showWater={showGeography}
              showSeaLabels={showGeography}
              showIslands={showGeography}
              showIslandLabels={showGeography}
              onSelect={(area) => {
                setSelectedArea(area)
                setSelectedCapital(null)
                setSelectedIsland(null)
              }}
              onHover={setHoveredArea}
              onCapitalSelect={(capital) => {
                setSelectedCapital(capital)
                setSelectedArea(null)
                setSelectedIsland(null)
              }}
              onIslandSelect={(island) => {
                setSelectedIsland(island)
                setSelectedCapital(null)
              }}
              ariaLabel={`Iran map in ${activeModeCopy?.label.toLowerCase()} mode`}
            />
          </div>

          <footer className='inspection-strip' aria-live='polite'>
            <div>
              <span className='inspection-label'>
                {hoveredArea
                  ? 'Inspecting'
                  : selectedIsland
                    ? 'Iranian island'
                    : activeCapital
                      ? 'Capital point'
                      : selectedArea
                        ? 'Selected'
                        : 'Try the map'}
              </span>
              <strong>
                {selectedIsland
                  ? selectedIsland.name
                  : activeCapital
                    ? activeCapital.name
                    : activeArea
                      ? activeArea.name
                      : 'Hover or select an area'}
              </strong>
              <small lang='fa' dir='rtl'>
                {selectedIsland?.faName ||
                  activeCapital?.faName ||
                  activeArea?.faName ||
                  'استان‌ها و شهرستان‌ها تعاملی هستند'}
              </small>
            </div>
            <div className='score-readout'>
              <span>{activeCapital || selectedIsland ? 'Coordinates' : 'Score'}</span>
              {activeCapital || selectedIsland ? (
                <small>
                  {(activeCapital?.latitude || selectedIsland?.latitude)?.toFixed(4)}° N<br />
                  {(activeCapital?.longitude || selectedIsland?.longitude)?.toFixed(4)}° E
                </small>
              ) : (
                <strong>{activeArea?.value === undefined ? '—' : Math.round(activeArea.value)}</strong>
              )}
            </div>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default App
