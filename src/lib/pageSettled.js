import { pageChange } from '../router'

/* Resolves once the page on screen has its pictures (2026-11-26), for downloads that can wait: the sound
   samples (about 670 KB) used to start on the first press, which is often the click that opens a page, and on
   a friend's slow line Bolt's posters came 15 to 19 s after his click, behind them. Waits for a click's page
   change to finish, then for the pictures on and near the screen (images and clip posters) and the fonts.
   Never longer than `max`: on a fast line it's a few hundred ms. */
const near = (el) => {
  const b = el.getBoundingClientRect()
  return b.bottom > -innerHeight && b.top < innerHeight * 2
}
const loaded = (img) => new Promise((r) => {
  img.addEventListener('load', r, { once: true })
  img.addEventListener('error', r, { once: true })
})

export function pageSettled(max = 10000) {
  const settle = new Promise((r) => setTimeout(r, 300))   // a press's click, and the page change it starts
    .then(() => pageChange())
    .then(() => new Promise((r) => requestAnimationFrame(() => r())))
    .then(() => Promise.all([
      ...[...document.images].filter((i) => !i.complete && near(i)).map(loaded),
      ...[...document.querySelectorAll('video[poster]')].filter(near).map((v) => {
        const img = new Image()   // the same file the poster asked for: waits on it, doesn't fetch it twice
        img.src = v.poster
        return img.decode().catch(() => {})
      }),
      document.fonts.ready,
    ]))
  return Promise.race([settle, new Promise((r) => setTimeout(r, max))])
}
