import { writeFile } from 'node:fs/promises'
import { flatConfigsToRulesDTS } from 'eslint-typegen/core'
import plugin from '../src/index.js'

const dts = await flatConfigsToRulesDTS([
  {
    plugins: {
      ceviz: plugin,
    },
  },
])

await writeFile('src/types-gen.d.ts', dts)
console.log('Types generated!')
