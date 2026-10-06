import * as React from 'react'
import { fireEvent, render } from '@testing-library/react'
import 'jest-canvas-mock'
import IranMap from '../src/components/mapSvg/IranMap'
import { countyBoundaries, provinceBoundaries } from '../src/data/boundaries'

const provinceData = {
  ardabil: 0,
  isfahan: 20,
  alborz: 11,
  ilam: 18,
  eastAzerbaijan: 10,
  westAzerbaijan: 20,
  bushehr: 15,
  tehran: 55,
  chaharmahalandBakhtiari: 25,
  southKhorasan: 29,
  razaviKhorasan: 11,
  northKhorasan: 19,
  khuzestan: 12,
  zanjan: 18,
  semnan: 9,
  sistanAndBaluchestan: 3,
  fars: 7,
  qazvin: 35,
  qom: 30,
  kurdistan: 24,
  kerman: 23,
  kohgiluyehAndBoyerAhmad: 2,
  kermanshah: 7,
  golestan: 18,
  gilan: 14,
  lorestan: 7,
  mazandaran: 28,
  markazi: 25,
  hormozgan: 14,
  hamadan: 19,
  yazd: 32,
}

// Regression probes for land that was removed by clipping the county catalog
// against an unrelated province snapshot. Work in the map's WGS84 projection.
const pathContainsCoordinate = (path: string, longitude: number, latitude: number) => {
  const x = (longitude - 44) * 50
  const y = (40.5 - latitude) * 50
  let inside = false
  for (const subpath of path.match(/M[^Z]*Z/g) || []) {
    const ring = Array.from(subpath.matchAll(/[ML]([\d.-]+) ([\d.-]+)/g), (match) => [
      Number(match[1]),
      Number(match[2]),
    ])
    for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
      const [a, b] = ring[index]
      const [c, d] = ring[previous]
      if (b > y !== d > y && x < ((c - a) * (y - b)) / (d - b) + a) inside = !inside
    }
  }
  return inside
}

describe('IranMap', () => {
  it('renders the backward-compatible province map', () => {
    const { container } = render(<IranMap data={provinceData} colorRange='30, 70, 181' />)

    expect(container.querySelectorAll('[data-area-type="province"]')).toHaveLength(31)
  })

  it('renders the complete county map', () => {
    const { container, getByTestId } = render(<IranMap mode='county' data={{ 'razaviKhorasan.mashhad': 80 }} />)

    expect(container.querySelectorAll('[data-area-type="county"]')).toHaveLength(478)
    expect(getByTestId('iran-map-county-razaviKhorasan.mashhad')).toBeTruthy()
  })

  it('overlays selected counties on a province map', () => {
    const { container, getByTestId } = render(
      <IranMap data={{ ...provinceData, 'razaviKhorasan.mashhad': 90 }} detailedCounties={['mashhad']} />,
    )

    expect(container.querySelectorAll('[data-area-type="province"]')).toHaveLength(31)
    expect(container.querySelectorAll('[data-area-type="county"]')).toHaveLength(1)
    expect(getByTestId('iran-map-county-razaviKhorasan.mashhad')).toBeTruthy()
  })

  it('groups provinces into an interactive region and supports county detail', () => {
    const onSelect = jest.fn()
    const { getAllByTestId, getByTestId } = render(
      <IranMap
        mode='region'
        regions={[
          {
            id: 'khorasan-region',
            name: 'Khorasan Region',
            faName: 'منطقه خراسان',
            provinces: ['razaviKhorasan', 'northKhorasan', 'southKhorasan'],
          },
        ]}
        data={{ 'khorasan-region': 72, 'razaviKhorasan.mashhad': 91 }}
        detailedCounties={['razaviKhorasan.mashhad']}
        onSelect={onSelect}
      />,
    )

    expect(getAllByTestId('iran-map-region-khorasan-region')).toHaveLength(3)
    expect(getByTestId('iran-map-county-razaviKhorasan.mashhad')).toBeTruthy()
    fireEvent.click(getAllByTestId('iran-map-region-khorasan-region')[0])
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'khorasan-region', type: 'region' }))
  })

  it('does not render the former Bushehr maritime envelope as a detached dot', () => {
    const bushehr = provinceBoundaries.find((province) => province.id === 'bushehr')

    expect(bushehr?.path.match(/M[^Z]+Z/g)).toHaveLength(1)
  })

  it('retains high-detail province and Shahrestan geometry', () => {
    const countVertices = (path: string) => path.match(/[ML][\d.-]+ [\d.-]+/g)?.length || 0
    const provinceVertices = provinceBoundaries.reduce((total, boundary) => total + countVertices(boundary.path), 0)
    const countyVertices = countyBoundaries.reduce((total, boundary) => total + countVertices(boundary.path), 0)

    expect(provinceVertices).toBeGreaterThan(50_000)
    expect(countyVertices).toBeGreaterThan(150_000)
  })

  it.each([
    ['hormozgan.minab', 57.55, 27],
    ['hormozgan.minab', 57.8, 26.9],
    ['hormozgan.bashagard', 58.3, 26.5],
  ])('preserves county coverage in %s at %s E, %s N', (id, longitude, latitude) => {
    const county = countyBoundaries.find((boundary) => boundary.id === id)!
    const province = provinceBoundaries.find((boundary) => boundary.id === 'hormozgan')!
    const kerman = provinceBoundaries.find((boundary) => boundary.id === 'kerman')!

    expect(pathContainsCoordinate(county.path, longitude, latitude)).toBe(true)
    expect(pathContainsCoordinate(province.path, longitude, latitude)).toBe(true)
    expect(pathContainsCoordinate(kerman.path, longitude, latitude)).toBe(false)
  })

  it.each([
    [56.43, 27.09],
    [53.98, 26.53],
  ])('keeps open water clear of mainland county polygons at %s E, %s N', (longitude, latitude) => {
    expect(countyBoundaries.some((boundary) => pathContainsCoordinate(boundary.path, longitude, latitude))).toBe(false)
  })
})
