/* ?perf: a readout of how the page is running on this machine (2026-11-23), for a visitor whose screen we can't
   see (a friend's gaming laptop stuttered in the footer and nothing here reproduced it). Frames, dropped frames,
   long tasks, the screen's scaling and graphics chip, and the garden's own numbers when it's on screen.
   "copy" puts it all on the clipboard to send back. Loaded only with ?perf (App.jsx); nothing else runs it. */

function gpuName() {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const info = gl?.getExtension('WEBGL_debug_renderer_info')
    return (info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER)) || 'unknown'
  } catch { return 'unknown' }
}

export function mountPerfProbe() {
  const gpu = gpuName()
  const gaps = []   // ms between frames, the last 5 seconds
  const longTasks = []
  let prev = 0, raf = 0

  const loop = (t) => {
    if (prev) gaps.push([t, t - prev])
    prev = t
    while (gaps.length && t - gaps[0][0] > 5000) gaps.shift()
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  let po = null
  try {
    po = new PerformanceObserver((list) => list.getEntries().forEach((e) => longTasks.push([e.startTime, e.duration])))
    po.observe({ type: 'longtask', buffered: true })
  } catch { /* not in this browser */ }

  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'top:auto;bottom:12px;left:12px;right:auto;width:min(340px, calc(100vw - 24px));font:12px/1.5 ui-monospace, monospace;white-space:pre-wrap'
  const out = document.createElement('div')
  const copy = Object.assign(document.createElement('button'), { type: 'button', textContent: 'copy' })
  el.append(out, copy)
  document.body.append(el)

  const report = () => {
    const now = performance.now()
    const list = gaps.map((g) => g[1]).sort((a, b) => a - b)
    const median = list[list.length >> 1] || 0
    const p95 = list[Math.floor(list.length * 0.95)] || 0
    const dropped = list.filter((g) => g > median * 1.6).length
    const recent = longTasks.filter((l) => now - l[0] < 10000)
    const g = window.__garden
    const scrollEl = document.documentElement
    return [
      `page      ${location.pathname}`,
      `screen    ${innerWidth}x${innerHeight}, scaling ${devicePixelRatio}`,
      `graphics  ${gpu}`,
      `browser   ${navigator.userAgentData?.brands?.map((b) => `${b.brand} ${b.version}`).filter((b) => !/Not/.test(b)).join(', ') || navigator.userAgent}`,
      `refresh   about ${median ? Math.round(1000 / median) : '?'} Hz (frame every ${median.toFixed(1)} ms)`,
      `frames    slowest 5%: ${p95.toFixed(1)} ms, dropped in 5 s: ${dropped}`,
      `long jobs ${recent.length} in 10 s${recent.length ? `, longest ${Math.round(Math.max(...recent.map((l) => l[1])))} ms` : ''}`,
      `scrolled  ${Math.round(scrollY)} of ${scrollEl.scrollHeight - innerHeight}`,
      g ? `garden    ${g.kind}: ${g.cost.toFixed(1)} ms a draw, ${Math.round(g.rate)} draws/s\n          canvas ${g.size} at ${g.dpr}x (screen ${g.screen}x), stepped down ${g.lowered} time${g.lowered === 1 ? "" : "s"}${g.retried ? ', tried full sharpness again' : ''}${g.restored ? ', stepped back up (it did not help)' : ''}
          full paint ${g.firstPaint.toFixed(1)} ms, beat ${(g.beat * 1000).toFixed(1)} ms, rebuilt ${g.rebuilds}x`
        : 'garden    not on screen yet (scroll down to it)',
    ].join('\n')
  }
  const tick = setInterval(() => { out.textContent = report() }, 500)
  copy.addEventListener('click', () => {
    navigator.clipboard?.writeText(report()).then(() => { copy.textContent = 'copied' }, () => { copy.textContent = 'select the text and copy it' })
  })

  return () => { cancelAnimationFrame(raf); clearInterval(tick); po?.disconnect(); el.remove() }
}
