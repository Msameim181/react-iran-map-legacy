/* eslint-disable @typescript-eslint/no-var-requires */
const { copyFileSync, mkdirSync } = require('node:fs')
const { resolve } = require('node:path')

const source = resolve(__dirname, '../src/components/mapSvg/iran-map.css')

for (const format of ['esm', 'cjs']) {
  const destination = resolve(__dirname, `../dist/${format}/components/mapSvg`)
  mkdirSync(destination, { recursive: true })
  copyFileSync(source, resolve(destination, 'iran-map.css'))
}
