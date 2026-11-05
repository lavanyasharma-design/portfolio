import { useEffect, useRef } from 'react'
import './MotifField.css'
import { MOTIF } from './motifConfig'

/**
 * Hover effect for the tiled motif background: near the pointer the motifs turn from the idle
 * lilac to the deep one, like water clearing. Drop it as the first child of any element that
 * has the motif as its CSS background (see .site in Hero.css); it lines itself up with that
 * element's tiles every frame, so scrolling and resizing need nothing extra.
 *
 * Add ?motif to the URL for a live control panel. Settle values there, then copy them into
 * MOTIF in motifConfig.js.
 */

const PX_PER_CM = 96 / 2.54

function MotifField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas.parentElement
    const ctx = canvas.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const cfg = { ...MOTIF }

    // the dark tile: the same SVG with every fill swapped to the hover colour, rasterised at the
    // screen's own pixel size. (Drawing it bigger and shrinking it drops pixels from the thin
    // strokes, which reads as a dotted line.) The pattern transform absorbs the fractional spacing.
    const tile = document.createElement('canvas')
    let pattern = null, ready = false, svgText = null
    const buildTile = async () => {
      svgText ??= await (await fetch('/motif.svg')).text()
      // the motif's strokes are ~0.3 screen px wide, which the screen can only show as broken,
      // faint pixels. An outline in the same colour gives them enough body to read as solid lines.
      const c = cfg.hover
      const svg = svgText.replace(/fill="#E8DBFF"/gi,
        `fill="${c}" stroke="${c}" stroke-width="${cfg.weight}" stroke-linejoin="round"`)
      const img = new Image()
      img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
      await img.decode()
      const k = Math.min(devicePixelRatio || 1, 2)
      tile.width = Math.round(cfg.tile.w * k); tile.height = Math.round(cfg.tile.h * k)
      const t = tile.getContext('2d')
      t.clearRect(0, 0, tile.width, tile.height)
      t.drawImage(img, 0, 0, tile.width, tile.height)
      URL.revokeObjectURL(img.src)
      pattern = ctx.createPattern(tile, 'repeat')
      ready = true
    }
    buildTile()

    let dpr = 1, W = 0, H = 0
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2)
      W = innerWidth; H = innerHeight
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
    }
    resize()

    // pointer and the blob that chases it
    const ptr = { x: 0, y: 0, in: false }
    const head = { x: 0, y: 0, a: 0 }       // a: overall presence, fades in/out with the pointer
    let wake = []                              // soft mode: { x, y, life }
    const cells = new Map()                    // tiles mode: "i,j" -> intensity 0-1
    let raf = 0, last = 0, t = 0, lastMove = 0, wx = 0, wy = 0
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    const onMove = (e) => {
      // anything marked data-no-motif (the butterfly) has its own hover; the water drains while over it
      if (e.target.closest?.('[data-no-motif]')) { if (ptr.in) onLeave(); return }
      if (!ptr.in) { head.x = e.clientX; head.y = e.clientY }
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.in = true
      lastMove = performance.now()
      kick()
    }
    const onLeave = () => { ptr.in = false; lastMove = performance.now(); kick() }
    const onOut = (e) => { if (!e.relatedTarget) onLeave() }

    function frame(now) {
      // rAF's timestamp can be earlier than the performance.now() taken in kick(); never let time run backwards
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = Math.max(last, now); t += dt
      const step = (k) => 1 - Math.pow(1 - k, dt * 60)   // frame-rate independent easing

      const f = reduce ? 1 : step(cfg.follow)
      head.x += (ptr.x - head.x) * f
      head.y += (ptr.y - head.y) * f
      head.a += ((ptr.in ? 1 : 0) - head.a) * step(ptr.in ? 0.2 : 0.08)

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const r = host.getBoundingClientRect()
      const ox = r.left + cfg.tile.x, oy = r.top + cfg.tile.y
      const decay = reduce ? 1 : dt / Math.max(0.05, cfg.trail)
      let busy = Math.abs(ptr.x - head.x) + Math.abs(ptr.y - head.y) > 0.3 || (head.a > 0.003 && head.a < 0.997)

      if (ready && cfg.mode === 'tiles') {
        const { w, h } = cfg.tile, R = cfg.radius
        // light up the motifs whose centres fall inside the radius; they rise quickly and drain slowly
        if (head.a > 0.01) {
          const i0 = Math.floor((head.x - R - ox) / w), i1 = Math.floor((head.x + R - ox) / w)
          const j0 = Math.floor((head.y - R - oy) / h), j1 = Math.floor((head.y + R - oy) / h)
          for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
            const d = Math.hypot(ox + (i + 0.5) * w - head.x, oy + (j + 0.5) * h - head.y)
            if (d > R) continue
            const target = head.a * Math.min(1, (1 - d / R) * 2.2)
            const k = `${i},${j}`, v = cells.get(k) || 0
            if (target > v) cells.set(k, v + (target - v) * (reduce ? 1 : step(0.35)))
          }
        }
        for (const [k, v] of cells) {
          const n = v - decay * 0.6
          if (n <= 0.004) { cells.delete(k); continue }
          cells.set(k, n)
          const [i, j] = k.split(',').map(Number)
          ctx.globalAlpha = n
          ctx.drawImage(tile, ox + i * w, oy + j * h, w, h)
        }
        ctx.globalAlpha = 1
        if (cells.size) busy = true
      } else if (ready) {
        // mask first (blob + wake), then pour the dark pattern into it
        const R = cfg.radius
        // the wake only grows while the blob travels, so a resting pointer lets the loop sleep
        if (head.a > 0.01 && !reduce && Math.hypot(head.x - wx, head.y - wy) > 2) {
          wake.push({ x: head.x, y: head.y, life: head.a }); wx = head.x; wy = head.y
        }
        wake = wake.filter((p) => (p.life -= decay) > 0)
        for (const p of wake) blob(p.x, p.y, R * (0.55 + 0.35 * p.life), p.life * 0.55)
        if (head.a > 0.01) {
          // three lobes drifting round the centre make the edge breathe like a drop of water
          const wob = reduce ? 0 : R * cfg.wobble
          for (let n = 0; n < 3; n++) {
            const ang = t * (0.9 + n * 0.37) + n * 2.1
            blob(head.x + Math.cos(ang) * wob, head.y + Math.sin(ang * 1.3) * wob, R * (1 - n * 0.06), head.a)
          }
        }
        ctx.globalCompositeOperation = 'source-in'
        pattern.setTransform(new DOMMatrix([cfg.tile.w / tile.width, 0, 0, cfg.tile.h / tile.height, ox, oy]))
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, W, H)
        ctx.globalCompositeOperation = 'source-over'
        // keep the edge breathing for a moment after the pointer stops, then rest on the last frame
        if (wake.length || (cfg.wobble && head.a > 0.01 && now - lastMove < 1500)) busy = true
      }

      raf = busy || !ready ? requestAnimationFrame(frame) : 0
    }

    function blob(x, y, R, a) {
      if (R <= 0 || a <= 0) return
      const g = ctx.createRadialGradient(x, y, R * (1 - cfg.soft), x, y, R)
      g.addColorStop(0, `rgba(0,0,0,${a})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill()
    }

    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('pointerdown', onMove, { passive: true })
    const onUp = (e) => { if (e.pointerType !== 'mouse') onLeave() }   // a lifted finger lets the water settle
    addEventListener('pointerup', onUp)
    document.addEventListener('pointerout', onOut)
    addEventListener('blur', onLeave)
    // resizing wipes the canvas; a zoom or screen change also changes the pixel ratio, so re-rasterise
    const onResize = () => {
      const old = dpr; resize()
      if (dpr !== old) buildTile().then(kick); else kick()
    }
    addEventListener('resize', onResize)

    const panel = new URLSearchParams(location.search).has('motif') ? mountPanel(cfg, buildTile, kick) : null

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerdown', onMove)
      removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerout', onOut)
      removeEventListener('blur', onLeave)
      removeEventListener('resize', onResize)
      panel?.remove()
    }
  }, [])

  return <canvas ref={canvasRef} className="motif-field" aria-hidden="true" />
}

/* ?motif: a small live control so the look is chosen by eye, not by me */
function mountPanel(cfg, rebuild, kick) {
  const el = document.createElement('div')
  el.className = 'motif-panel'
  const row = (label, input, out) => `<label><span>${label}</span>${input}<output>${out ?? ''}</output></label>`
  const range = (k, min, max, st) => `<input type="range" data-k="${k}" min="${min}" max="${max}" step="${st}" value="${cfg[k]}">`
  el.innerHTML = `
    <b>motif hover</b>
    ${row('mode', `<select data-k="mode"><option value="soft">soft blob + wake</option><option value="tiles">whole motifs</option></select>`)}
    ${row('radius', range('radius', 20, 240, 1), '')}
    ${row('line weight', range('weight', 0, 1.5, 0.05), '')}
    ${row('feather', range('soft', 0, 1, 0.01), '')}
    ${row('follow', range('follow', 0.02, 1, 0.01), '')}
    ${row('settle', range('trail', 0.1, 3, 0.05), '')}
    ${row('wobble', range('wobble', 0, 0.4, 0.01), '')}
    ${row('colour', `<input type="text" data-k="hover" value="${cfg.hover}" size="8">`)}
    <button type="button">copy values</button>`
  el.querySelector('select').value = cfg.mode
  const show = () => el.querySelectorAll('label').forEach((l) => {
    const i = l.querySelector('[data-k]'), o = l.querySelector('output'), k = i.dataset.k
    if (k === 'radius') o.textContent = `${cfg.radius}px · ${(cfg.radius / PX_PER_CM).toFixed(1)}cm · ${((cfg.radius * 2) / cfg.tile.w).toFixed(1)} motifs across`
    else if (k === 'trail') o.textContent = `${cfg.trail}s`
    else if (o && i.type === 'range') o.textContent = cfg[k]
  })
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return
    if (k === 'hover') { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) { cfg.hover = e.target.value; rebuild().then(kick) } return }
    cfg[k] = e.target.type === 'range' ? +e.target.value : e.target.value
    show()
    if (k === 'weight') rebuild().then(kick); else kick()
  })
  el.querySelector('button').addEventListener('click', () => {
    const { mode, radius, weight, soft, follow, trail, wobble, hover } = cfg
    navigator.clipboard?.writeText(JSON.stringify({ mode, radius, weight, soft, follow, trail, wobble, hover }, null, 2))
    el.querySelector('button').textContent = 'copied'
  })
  show()
  document.body.append(el)
  return el
}

export default MotifField
