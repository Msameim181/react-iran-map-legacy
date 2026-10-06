/* eslint-disable @typescript-eslint/no-var-requires */
const { copyFileSync, mkdirSync } = require('node:fs')
const { dirname, resolve } = require('node:path')

const styles = ['components/mapSvg/iran-map.css', 'components/scoreBands/score-bands.css']

for (const format of ['esm', 'cjs']) {
  for (const stylesheet of styles) {
    const destination = resolve(__dirname, `../dist/${format}/${stylesheet}`)
    mkdirSync(dirname(destination), { recursive: true })
    copyFileSync(resolve(__dirname, `../src/${stylesheet}`), destination)
  }
}
