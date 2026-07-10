import { readdir, readFile, writeFile } from 'node:fs/promises'

const outDirectory = new URL('../out/', import.meta.url)
const indexPath = new URL('index.html', outDirectory)
const cssDirectory = new URL('_next/static/css/', outDirectory)
const cssFile = (await readdir(cssDirectory)).find((file) => file.endsWith('.css'))

if (!cssFile) {
  throw new Error('No exported Next.js stylesheet found in out/_next/static/css')
}

let html = await readFile(indexPath, 'utf8')
const styles = (await readFile(new URL(cssFile, cssDirectory), 'utf8'))
  .replace(/<\/style/gi, '<\\/style')
const stylesheetPattern = /<link rel="stylesheet" href="[^"]+" data-precedence="next"\/>/

if (!stylesheetPattern.test(html)) {
  throw new Error('Could not find the Next.js stylesheet link in out/index.html')
}

html = html.replace(stylesheetPattern, `<style data-precedence="next">${styles}</style>`)
await writeFile(indexPath, html)
console.log('Sandbox-compatible stylesheet inlined into out/index.html')
