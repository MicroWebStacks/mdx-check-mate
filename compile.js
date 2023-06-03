import fs from 'node:fs/promises'
import {compile} from '@mdx-js/mdx'

const mdx_text = await fs.readFile('good.mdx','utf-8')

const compiled = await compile({value:mdx_text},{format:'mdx'})

await fs.writeFile('out/component.js',String(compiled))
