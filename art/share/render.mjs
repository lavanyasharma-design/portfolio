// Renders art/share/share.html to public/share.jpg (2400 x 1260: the 1200 x 630 card at 2x, so it stays
// sharp on retina timelines). Needs the dev server on :5173. Run: node art/share/render.mjs
import { chromium } from 'playwright'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
await page.goto('http://localhost:5173/art/share/share.html', { waitUntil: 'load' })
await page.waitForSelector('body[data-ready]', { timeout: 20000 })
await page.locator('.card').screenshot({ path: 'public/share.jpg', type: 'jpeg', quality: 90 })
await browser.close()
console.log('public/share.jpg')
