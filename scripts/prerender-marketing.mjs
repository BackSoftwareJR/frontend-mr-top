/**
 * Post-build static prerender for marketing routes.
 * Uses Playwright against vite preview — no framework migration required.
 */
import { preview } from 'vite'
import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

// Homepage must be prerendered last — earlier writes to dist/index.html would break SPA
// fallback for subsequent routes on the preview server.
const ROUTES = [
  { url: '/come-funziona', outFile: 'come-funziona/index.html', readySelector: 'h1' },
  { url: '/chi-siamo', outFile: 'chi-siamo/index.html', readySelector: 'h1' },
  { url: '/', outFile: 'index.html', readySelector: '#hero' },
]

function injectPrerenderedRoot(templateHtml, rootHtml) {
  const rootOpen = templateHtml.indexOf('<div id="root"')
  if (rootOpen < 0) {
    throw new Error('Could not find #root in dist/index.html template')
  }

  const rootTagEnd = templateHtml.indexOf('>', rootOpen)
  const rootClose = templateHtml.indexOf('</div>', rootTagEnd)
  if (rootTagEnd < 0 || rootClose < 0) {
    throw new Error('Malformed #root container in dist/index.html')
  }

  const rootTag = templateHtml.slice(rootOpen, rootTagEnd + 1)
  const prerenderedRootTag = rootTag.includes('data-prerendered')
    ? rootTag
    : rootTag.replace('<div id="root"', '<div id="root" data-prerendered="true"')

  return `${templateHtml.slice(0, rootOpen)}${prerenderedRootTag}${rootHtml}${templateHtml.slice(rootClose)}`
}

async function main() {
  const templateHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')

  const previewPort = 4173 + Math.floor(Math.random() * 200)
  const previewServer = await preview({
    root: rootDir,
    preview: { port: previewPort, strictPort: true },
  })

  const baseUrl =
    previewServer.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${previewPort}`
  const browser = await chromium.launch({ headless: true })

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
      })

      await page.goto(`${baseUrl}${route.url}`, {
        waitUntil: 'networkidle',
        timeout: 45_000,
      })
      await page.waitForSelector(route.readySelector, {
        state: 'visible',
        timeout: 20_000,
      })
      await page.waitForFunction(
        () => (document.querySelector('#root')?.innerText?.trim().length ?? 0) > 120,
        { timeout: 10_000 },
      )

      const rootHtml = await page.locator('#root').innerHTML()
      const html = injectPrerenderedRoot(templateHtml, rootHtml)
      const outPath = path.join(distDir, route.outFile)

      await fs.mkdir(path.dirname(outPath), { recursive: true })
      await fs.writeFile(outPath, html, 'utf8')

      console.log(`prerendered ${route.url} → dist/${route.outFile}`)
      await page.close()
    }
  } finally {
    await browser.close()
    await previewServer.close()
  }
}

main().catch((err) => {
  console.error('[prerender-marketing] failed:', err)
  process.exit(1)
})
