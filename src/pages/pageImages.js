import { TILES } from '../components/work/tiles.js'

/* The pictures each page opens on (2026-11-23, the performance pass). `first` are on screen when the page
   lands: a click waits for them before the page change (routes.js), and a direct load asks for them from
   the page's <head> (vite.config.js). `rest` are fetched early in the background.
   Plain data, no browser APIs: vite.config.js imports this at build time. */
const tileImages = (ids) => TILES.filter((t) => ids.includes(t.id)).flatMap((t) => t.layers.filter((l) => l.on).map((l) => l.src))
const allTiles = TILES.map((t) => t.id)

export const PAGE_IMAGES = {
  // the first row: Bolt's two phones and the FCI laptop; then the rest of the tiles
  '/work': { first: tileImages(['bolt', 'fci']), rest: tileImages(allTiles.filter((id) => id !== 'bolt' && id !== 'fci')) },
  // the hero's two phones
  '/work/bolt': { first: tileImages(['bolt']), rest: [] },
  '/about': { first: ['/about/me.webp'], rest: [] },
}
