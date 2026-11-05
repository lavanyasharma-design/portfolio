import { GLASS, setGlassTint } from './orbField'

/* ?glass: live controls for the view through the window. Copy the values into GLASS (orbField.js)
   and the defaults in fieldState() when it looks right. */
export function mountGlassPanel(F) {
  const el = document.createElement('div')
  el.className = 'glass-panel'
  const row = (k, label, min, max, step, val) =>
    `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${val}"><output>${val}</output></label>`
  el.innerHTML = `
    <b>window glass</b>
    ${row('tint', 'colour', 0, 1, 0.01, GLASS.tint)}
    ${row('amt', 'orb strength', 0.2, 1.2, 0.01, F.amt)}
    ${row('soft', 'softness', 0.6, 2, 0.01, F.soft)}
    ${row('sketch', 'pencil', 0, 1, 0.01, F.sketch)}
    ${row('speed', 'drift speed', 0, 2, 0.05, F.speed)}
    <button type="button">copy values</button>`
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k, v = +e.target.value
    e.target.nextElementSibling.textContent = v
    if (k === 'tint') setGlassTint(v)
    else F[k] = v
  })
  el.querySelector('button').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify({ tint: GLASS.tint, amt: F.amt, soft: F.soft, sketch: F.sketch, speed: F.speed }, null, 2))
    e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
