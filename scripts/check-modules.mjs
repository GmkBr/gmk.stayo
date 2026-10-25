import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const src = fileURLToPath(new URL('../src/', import.meta.url))
const compatibility = new Set([
  'api/index.ts', 'api/mappers.ts', 'types/index.ts', 'context/AppContext.tsx',
].map(file => path.resolve(src, file)))

async function sourceFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const groups = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(file) : /\.tsx?$/.test(file) ? [file] : []
  }))
  return groups.flat()
}

const failures = []
const files = [...await sourceFiles(path.join(src, 'modules')), ...await sourceFiles(path.join(src, 'shared'))]
for (const file of files) {
  const content = await fs.readFile(file, 'utf8')
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true)
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    if (!specifier || !ts.isStringLiteral(specifier) || !specifier.text.startsWith('.')) continue
    const target = path.resolve(path.dirname(file), specifier.text)
    const relative = path.relative(src, target).replaceAll('\\', '/')
    const fromShared = path.relative(src, file).replaceAll('\\', '/').startsWith('shared/')
    if (compatibility.has(target) || relative.startsWith('app/') || (fromShared && relative.startsWith('modules/'))) {
      const { line } = source.getLineAndCharacterOfPosition(statement.getStart(source))
      failures.push(`${path.relative(src, file)}:${line + 1}: import ${specifier.text} breaks the module boundary`)
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Module boundaries checked in ${files.length} source files.`)
}
