import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { openApiDocument } from '../src/openapi/document'

const outPath = resolve(__dirname, '../openapi.json')
writeFileSync(outPath, JSON.stringify(openApiDocument, null, 2) + '\n')
console.log(`OpenAPI spec gerada em ${outPath}`)