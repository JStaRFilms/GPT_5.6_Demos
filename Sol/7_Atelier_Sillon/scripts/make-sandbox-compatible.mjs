import { readFile, writeFile } from 'node:fs/promises'

const indexPath = new URL('../out/index.html', import.meta.url)
let html = await readFile(indexPath, 'utf8')

html = html
  .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>')
  .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, '<link rel="stylesheet" href="$1">')

if (html.includes('type="module"') || html.includes(' crossorigin')) {
  throw new Error('Sandbox compatibility transform left unsupported module or crossorigin attributes in out/index.html')
}

await writeFile(indexPath, html)
console.log('Sandbox-compatible artifact written to out/index.html')
