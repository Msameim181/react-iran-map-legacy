import type { IranMapValue } from '../interfaces'

export const normalizeMapValue = (value: IranMapValue): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value !== -1 ? value : undefined
