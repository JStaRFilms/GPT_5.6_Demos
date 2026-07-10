import { readFile, writeFile } from 'node:fs/promises'

const outDirectory = new URL('../out/', import.meta.url)
const indexPath = new URL('index.html', outDirectory)
let html = await readFile(indexPath, 'utf8')

const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
const styleMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)

if (!scriptMatch || !styleMatch) {
  throw new Error('Could not find Vite script and stylesheet references in out/index.html')
}

const script = (await readFile(new URL(scriptMatch[1], outDirectory), 'utf8'))
  .replace(/<\/script/gi, '<\\/script')
const styles = (await readFile(new URL(styleMatch[1], outDirectory), 'utf8'))
  .replace(/<\/style/gi, '<\\/style')

html = html
  .replace(scriptMatch[0], '')
  .replace(styleMatch[0], `<style>${styles}</style>`)
  .replace('</body>', `<script>${script}</script>\n  </body>`)

await writeFile(indexPath, html)
console.log('Self-contained sandbox artifact written to out/index.html')
