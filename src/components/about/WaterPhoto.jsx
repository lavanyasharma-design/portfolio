import { useEffect, useRef } from 'react'
import { LAYOUT } from './aboutLayout'

/**
 * Her photo as water, from her hello page (D:\hello-page, src/ripple/WaterImage.jsx, the X intro page,
 * 2026-11-22): a WebGL pass that pushes the picture along the pointer's path in small drops that spread and
 * fade (1.5s), plus a faint drop every 1.1s on its own, round the corners and the middle, so it's never quite
 * still. A finger dragging over it ripples it too. Values as hers there; the drops brighten the picture a
 * touch where they land.
 * Ported: the zoom and focus from ?about stay a CSS transform on the canvas (as on the <img> it replaces),
 * the canvas is drawn at that zoom so it stays sharp, the picture can be cropped both ways, and it only
 * animates while on screen. Reduced motion, or no WebGL: the plain photo.
 */
const MAX_DROPS = 18
const DROP_LIFETIME = 1.5
const INTERACTIVE_AMPLITUDE = 0.007
const AMBIENT_AMPLITUDE = 0.002
const INTERACTIVE_MIN_INTERVAL = 0.045
const AMBIENT_INTERVAL = 1.1
const AMBIENT_POINTS = [[0.5, 0.5], [0.12, 0.12], [0.88, 0.15], [0.5, 0.9], [0.15, 0.85], [0.9, 0.9], [0.9, 0.5], [0.1, 0.5]]

const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() { vUv = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }
`
const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform float uTime;
uniform float uAspect;
uniform vec2 uCoverScale;
uniform vec2 uCoverOffset;
uniform vec2 uDropPos[${MAX_DROPS}];
uniform vec2 uDropDir[${MAX_DROPS}];
uniform float uDropStart[${MAX_DROPS}];
uniform float uDropAmp[${MAX_DROPS}];
const float LIFETIME = ${DROP_LIFETIME.toFixed(2)};
const float TIME_DECAY = 3.5;
const float RADIUS = 0.15;
void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  vec2 displacement = vec2(0.0);
  float weightSum = 0.0;
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    float age = uTime - uDropStart[i];
    if (age < 0.0 || age > LIFETIME) continue;
    vec2 dropP = vec2(uDropPos[i].x * uAspect, uDropPos[i].y);
    float d = distance(p, dropP);
    float envelope = exp(-age * TIME_DECAY) * exp(-(d * d) / (2.0 * RADIUS * RADIUS)) * smoothstep(0.0, 0.04, age);
    float weight = envelope * uDropAmp[i];
    displacement += uDropDir[i] * weight;
    weightSum += weight;
  }
  vec2 uv = clamp(vUv + displacement, 0.0, 1.0);
  vec3 color = texture2D(uImage, uCoverOffset + uv * uCoverScale).rgb;
  color += clamp(weightSum * 4.0, 0.0, 0.08);
  gl_FragColor = vec4(color, 1.0);
}
`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src); gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
  return s
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export default function WaterPhoto({ src, alt }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced()) return undefined
    const gl = canvas.getContext('webgl', { alpha: false, premultipliedAlpha: false })
    if (!gl) return undefined
    let program
    try {
      program = gl.createProgram()
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link')
    } catch { return undefined }
    gl.useProgram(program)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPosition = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
    const u = (n) => gl.getUniformLocation(program, n)
    const uTime = u('uTime'), uAspect = u('uAspect'), uCoverScale = u('uCoverScale'), uCoverOffset = u('uCoverOffset')
    const uDropPos = u('uDropPos[0]'), uDropDir = u('uDropDir[0]'), uDropStart = u('uDropStart[0]'), uDropAmp = u('uDropAmp[0]')

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([252, 250, 255, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.uniform1i(u('uImage'), 0)

    const pos = new Float32Array(MAX_DROPS * 2), dir = new Float32Array(MAX_DROPS * 2)
    const start = new Float32Array(MAX_DROPS).fill(-1000), amp = new Float32Array(MAX_DROPS)
    let next = 0, clock = 0, lastHand = -1000, lastAmbient = -1000, ambientIndex = 0
    const addDrop = (x, y, dx, dy, a) => {
      pos[next * 2] = x; pos[next * 2 + 1] = y; dir[next * 2] = dx; dir[next * 2 + 1] = dy
      start[next] = clock; amp[next] = a; next = (next + 1) % MAX_DROPS
    }

    // cover: the picture fills the canvas, cropped evenly on whichever side is too long
    let imageAspect = 1, ready = false, gone = false, aspect = 1
    const cover = [1, 1], offset = [0, 0]
    const updateCover = () => {
      aspect = canvas.clientWidth / canvas.clientHeight || 1
      if (imageAspect > aspect) { cover[0] = aspect / imageAspect; cover[1] = 1 } else { cover[0] = 1; cover[1] = imageAspect / aspect }
      offset[0] = (1 - cover[0]) / 2; offset[1] = (1 - cover[1]) / 2
    }
    const image = new Image()
    image.onload = () => {
      if (gone) return
      imageAspect = image.naturalWidth / image.naturalHeight
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      ready = true
      updateCover()
      canvas.classList.add('ready')
    }
    image.src = src

    // drawn at the zoom it's shown at (the CSS scale from ?about), so it stays sharp
    const resize = () => {
      const k = Math.min(devicePixelRatio || 1, 2) * Math.max(1, LAYOUT.meZoom, LAYOUT.meZoomPhone)
      const w = Math.max(1, Math.round(canvas.clientWidth * k)), h = Math.max(1, Math.round(canvas.clientHeight * k))
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h) }
      updateCover()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // the push follows the way the pointer is heading, so it reads as one stroke, not rings
    let lastDir = [1, 0], lastPt = null
    const toUv = (x, y) => { const r = canvas.getBoundingClientRect(); return [(x - r.left) / r.width, 1 - (y - r.top) / r.height] }
    const stroke = (cx, cy) => {
      if (clock - lastHand < INTERACTIVE_MIN_INTERVAL) return
      lastHand = clock
      const [x, y] = toUv(cx, cy)
      if (lastPt) { const dx = x - lastPt[0], dy = y - lastPt[1], l = Math.hypot(dx, dy); if (l > 0.001) lastDir = [dx / l, dy / l] }
      lastPt = [x, y]
      addDrop(x, y, lastDir[0], lastDir[1], INTERACTIVE_AMPLITUDE)
    }
    const onMove = (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') stroke(e.clientX, e.clientY) }
    const onTouch = (e) => { const t = e.touches[0]; if (t) stroke(t.clientX, t.clientY) }
    const onEnd = () => { lastPt = null }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onEnd)
    canvas.addEventListener('touchstart', onTouch, { passive: true })
    canvas.addEventListener('touchmove', onTouch, { passive: true })
    canvas.addEventListener('touchend', onEnd, { passive: true })
    canvas.addEventListener('touchcancel', onEnd, { passive: true })

    let raf = 0, last = performance.now(), visible = true
    const frame = (now) => {
      raf = visible ? requestAnimationFrame(frame) : 0
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      clock += dt
      if (clock - lastAmbient > AMBIENT_INTERVAL) {
        lastAmbient = clock
        const [ax, ay] = AMBIENT_POINTS[ambientIndex++ % AMBIENT_POINTS.length]
        const a = clock * 0.3
        addDrop(ax + (Math.random() - 0.5) * 0.08, ay + (Math.random() - 0.5) * 0.08, Math.cos(a), Math.sin(a), AMBIENT_AMPLITUDE)
      }
      if (!ready) return
      gl.uniform1f(uTime, clock); gl.uniform1f(uAspect, aspect)
      gl.uniform2f(uCoverScale, cover[0], cover[1]); gl.uniform2f(uCoverOffset, offset[0], offset[1])
      gl.uniform2fv(uDropPos, pos); gl.uniform2fv(uDropDir, dir); gl.uniform1fv(uDropStart, start); gl.uniform1fv(uDropAmp, amp)
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    // only while on screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame) }
    })
    io.observe(canvas)

    return () => {
      gone = true
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onEnd)
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('touchmove', onTouch)
      canvas.removeEventListener('touchend', onEnd)
      canvas.removeEventListener('touchcancel', onEnd)
      gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program)
    }
  }, [src])

  // the plain photo sits underneath until the water is drawn (and stays, with reduced motion or no WebGL)
  return (
    <>
      <img src={src} alt={alt} />
      {!reduced() && <canvas ref={canvasRef} className="ab-water" aria-hidden="true" />}
    </>
  )
}
