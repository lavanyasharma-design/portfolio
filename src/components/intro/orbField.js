/* =====================================================================
   ORB FIELD. One WebGL canvas behind the whole page.
   Seven blurred colour orbs at different depths, drifting on slow orbits.
   uCam is the camera pushing forward: near orbs swell faster than far ones,
   which is the parallax you feel when you go through the window. Grain on top.
   ===================================================================== */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

/* ---- pass A: the scene. Orb field, and during the intro the wall + wooden window on top of it ---- */
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uCam; uniform vec2 uPointer;
uniform float uNight; uniform float uGrain; uniform float uAmt; uniform float uSoft;
uniform vec3 uPaper; uniform vec3 uCol[7]; uniform vec4 uOrb[7];
uniform float uIntro; uniform vec4 uWin; uniform float uW0; uniform float uProg;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<4;i++){ v+=a*noise(p); p=m*p; a*=.5; } return v; }
bool inRect(vec2 p, vec4 r){ return p.x>=r.x && p.x<=r.x+r.z && p.y>=r.y && p.y<=r.y+r.w; }
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  float aspect = uRes.x/uRes.y;
  vec2 w = (uv-.5)*vec2(aspect,1.)*2.;
  vec2 wob = vec2(noise(w*1.3+uTime*0.07), noise(w*1.3+vec2(7.3,2.1)-uTime*0.05)) - .5;
  vec3 col = uPaper; vec3 glow = vec3(0.);
  for(int i=0;i<7;i++){
    vec4 o = uOrb[i]; float z = o.w;
    float s = 1. + uCam*2.2/z;
    vec2 c = o.xy*s + uPointer*(0.10/z);
    float r = o.z*s*uSoft;
    float d = length(w + wob*0.30*r - c);
    float k = exp(-(d*d)/(2.*r*r));
    float thin = 1./(1. + (s-1.)*0.55);
    float a = k*thin*uAmt;
    col = mix(col, uCol[i], a*(1.-uNight));
    glow += uCol[i]*a;
  }
  col = mix(col, uPaper + glow*1.1, uNight);
  float haze = fbm(w*1.1 + vec2(uTime*0.018, -uTime*0.011));
  haze = smoothstep(0.35, 0.75, haze);
  col = mix(col, mix(uPaper, vec3(1.), 0.6), haze*0.42);
  float fibre = noise(w*vec2(38.,42.) + vec2(3.1,7.7)) * noise(w*vec2(9.,11.)+1.3);
  col += (fibre-.25)*0.012;

  if (uIntro > 0.5){
    // window-local coords in base CSS px, origin top-left of the window box
    vec2 lp = vec2(gl_FragCoord.x - uWin.x, (uWin.y + uWin.w) - gl_FragCoord.y) * (uW0 / uWin.z);
    float W=uW0, H=W*1.4, F=W*0.05, gx=F, gy=F, gw=W-2.*F, gh=H-2.*F, sh=gh*0.5;
    float st=F*0.62, rail=F*1.15, mul=F*0.32, meet=st*0.5, hf=(gw-2.*st-mul)*0.5;
    bool inBox  = inRect(lp, vec4(0.,0.,W,H));
    bool inSill = inRect(lp, vec4(-F*0.9, H, W+1.8*F, F*0.6));
    vec3 wall = vec3(0.978,0.982,0.979);
    if (!inBox && !inSill){ col = wall; }
    else {
      bool glass = inRect(lp, vec4(gx,gy,gw,gh)) && !inSill;
      float wood = glass ? 0. : 1.;
      vec2 up = lp - vec2(gx,gy);
      if (glass && up.y < sh){
        if (up.x < st || up.x > gw-st || up.y < st || up.y > sh-meet || abs(up.x-(st+hf+mul*0.5)) < mul*0.5) wood = 2.;
      }
      vec2 lo = lp - vec2(gx, gy + sh - uProg*sh);
      if (glass && lo.y >= 0. && lo.y <= sh){
        if (lo.x < st || lo.x > gw-st || lo.y < st || lo.y > sh-rail || abs(lo.x-(st+hf+mul*0.5)) < mul*0.5) wood = 3.;
        if (abs(lo.x-gw*0.5) < gw*0.09 && lo.y > sh-rail*0.5 && lo.y < sh-rail*0.3) wood = 4.;
      }
      if (wood > 0.5){
        float g = fbm(lp*vec2(0.9,0.12)) * 0.5 + fbm(lp*vec2(0.12,0.9)) * 0.5;   // grain both ways; the pencil pass decides
        vec3 w1 = vec3(0.86,0.72,0.55), w2 = vec3(0.62,0.45,0.29);
        col = mix(w2, w1, 0.35 + 0.65*g);
        if (wood > 2.5 && wood < 3.5) col *= 1.06;                  // lower sash catches more light
        if (wood > 3.5) col = vec3(0.80,0.66,0.34);                 // brass lift
        // soft shadow where the raised sash overlaps the upper glass
      } else {
        // glass: a hair of tint and the sash's shadow onto the view
        float shadow = smoothstep(0., 18., lo.y) * (1.-smoothstep(-18., 0., lo.y));
        col *= 1. - 0.10*(1.-smoothstep(-16., 2., lo.y + (uProg>0.02 ? 0. : 1e4)));
      }
    }
  }
  float g = hash(gl_FragCoord.xy + fract(uTime*3.7)*97.) - .5;
  col += g*uGrain;
  gl_FragColor = vec4(col,1.);
}`

/* ---- pass B: pencil. "notebook drawings" by Florian Berger (flockaroo), 2016, shadertoy.com/view/XtVGD1
   CC BY-NC-SA 3.0. Adapted: colour is kept instead of clamped to grey, no squared paper, no vignette,
   and the result is mixed with the clean scene by uSketch. ---- */
const PENCIL = `
precision highp float;
uniform sampler2D uScene; uniform sampler2D uNoise; uniform vec2 uRes; uniform float uSketch; uniform float uTime;
#define AngleNum 3
#define SampNum 12
#define PI2 6.28318530717959
vec4 getRand(vec2 pos){ return texture2D(uNoise, pos/256./uRes.y*1080.); }
vec4 getCol(vec2 pos){
  vec4 c1 = texture2D(uScene, pos/uRes);
  float d = clamp(dot(c1.xyz, vec3(-.5,1.,-.5)), 0., 1.);
  return mix(c1, vec4(.7), 0.3*d);
}
vec4 getColHT(vec2 pos){ return smoothstep(.95, 1.05, getCol(pos)*.8 + .2 + getRand(pos*.7)); }
float getVal(vec2 pos){ return dot(getCol(pos).xyz, vec3(.333)); }
vec2 getGrad(vec2 pos, float eps){ vec2 d=vec2(eps,0); return vec2(getVal(pos+d.xy)-getVal(pos-d.xy), getVal(pos+d.yx)-getVal(pos-d.yx))/eps/2.; }
void main(){
  vec2 pos = gl_FragCoord.xy + 1.2*sin(uTime*0.9*vec2(1.,1.7))*uRes.y/400.;
  vec3 col = vec3(0.), col2 = vec3(0.); float sum = 0.;
  for(int i=0;i<AngleNum;i++){
    float ang = PI2/float(AngleNum)*(float(i)+.8);
    vec2 v = vec2(cos(ang), sin(ang));
    for(int j=0;j<SampNum;j++){
      vec2 dpos  = v.yx*vec2(1.,-1.)*float(j)*uRes.y/400.;
      vec2 dpos2 = v.xy*float(j*j)/float(SampNum)*.5*uRes.y/400.;
      for(float s=-1.; s<=1.; s+=2.){
        vec2 pos2 = pos + s*dpos + dpos2;
        vec2 pos3 = pos + (s*dpos + dpos2).yx*vec2(1.,-1.)*2.;
        vec2 g = getGrad(pos2, .4);
        float fact = dot(g,v) - .5*abs(dot(g, v.yx*vec2(1.,-1.)));
        float fact2 = abs(dot(normalize(g+vec2(.0001)), v.yx*vec2(1.,-1.)));
        fact = clamp(fact, 0., .05);
        fact *= 1. - float(j)/float(SampNum);
        col += fact;
        col2 += fact2*getColHT(pos3).xyz;
        sum += fact2;
      }
    }
  }
  col /= float(SampNum*AngleNum)*.75/sqrt(uRes.y);
  col.x *= (.6 + .8*getRand(pos*.7).x);
  col.x = 1. - col.x;
  col.x *= col.x*col.x;                       // 1 on flat areas, dips toward 0 along edges: the pencil line
  vec3 scene = texture2D(uScene, gl_FragCoord.xy/uRes).rgb;
  // coloured pencil, not graphite: keep the scene colour, draw the lines over it,
  // and lay a fine directional grain like pigment catching paper tooth
  vec3 lined = scene * mix(1., col.x, 0.9);
  float tooth = getRand(pos*vec2(0.9,1.6)).x;
  lined *= 1. - 0.14*(tooth-.5);
  float l = dot(lined, vec3(.299,.587,.114)); lined = mix(vec3(l), lined, 1.08);
  gl_FragColor = vec4(mix(scene, lined, uSketch), 1.);
}`

const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]
export const lerp = (a, b, k) => a + (b - a) * k
const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]
// pastel purple, pink and teal orbs, each at the lightness of the blue/green it replaced
const DAY = { paper: '#fafbf9', c: ['#b9a3ee', '#d5c7f5', '#f4c3d7', '#eda6c6', '#8fd8cc', '#cdeee8', '#ece6fa'] }
const NIGHT = { paper: '#0e131a', c: ['#2f6fa8', '#3b86c9', '#3f8f66', '#2b6b4a', '#4aa3a0', '#6a9a5a', '#3a5a8a'] }
const ORBS = [
  { x: -0.16, y: 0.22, ax: 0.14, ay: 0.12, sx: 0.23, sy: 0.19, ph: 0.0, r: 0.17, z: 0.60 },
  { x: 0.18, y: 0.02, ax: 0.12, ay: 0.16, sx: 0.17, sy: 0.21, ph: 1.7, r: 0.19, z: 0.80 },
  { x: -0.04, y: -0.30, ax: 0.16, ay: 0.10, sx: 0.20, sy: 0.25, ph: 3.1, r: 0.15, z: 0.70 },
  { x: 0.08, y: 0.42, ax: 0.14, ay: 0.09, sx: 0.14, sy: 0.18, ph: 4.4, r: 0.14, z: 1.30 },
  { x: -0.26, y: -0.06, ax: 0.10, ay: 0.14, sx: 0.22, sy: 0.15, ph: 5.6, r: 0.13, z: 1.10 },
  { x: 0.26, y: -0.34, ax: 0.10, ay: 0.12, sx: 0.19, sy: 0.23, ph: 0.9, r: 0.12, z: 1.70 },
  { x: 0.02, y: 0.06, ax: 0.18, ay: 0.16, sx: 0.12, sy: 0.15, ph: 2.3, r: 0.22, z: 2.20 },
]
const ORDER = ORBS.map((o, i) => i).sort((a, b) => ORBS[b].z - ORBS[a].z)

// the field's live parameters; the intro writes to these and the next frame picks them up
export function fieldState() {
  return { cam: 0, night: 0, grain: 0.0, amt: 0.95, soft: 1.0, speed: 1.0, pointer: [0, 0], tOrb: 0, sketch: 0.85, intro: 0, win: [0, 0, 1, 1], w0: 360, prog: 0 }
}

export function makeField(canvas, F) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
  if (!gl) return null
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s }
  const mk = (frag) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p)); return p }
  const progA = mk(FRAG), progB = mk(PENCIL)
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const bindAttr = (p) => { const a = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0) }
  const UA = {}; for (const n of ['uRes', 'uTime', 'uCam', 'uPointer', 'uNight', 'uGrain', 'uAmt', 'uSoft', 'uPaper', 'uCol', 'uOrb', 'uIntro', 'uWin', 'uW0', 'uProg']) UA[n] = gl.getUniformLocation(progA, n)
  const UB = {}; for (const n of ['uScene', 'uNoise', 'uRes', 'uSketch', 'uTime']) UB[n] = gl.getUniformLocation(progB, n)
  // noise texture for the pencil pass
  const nz = new Uint8Array(256 * 256 * 4); for (let i = 0; i < nz.length; i++) nz[i] = Math.random() * 255 | 0
  const noiseTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, noiseTex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, nz)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  // scene render target
  const sceneTex = gl.createTexture(), fbo = gl.createFramebuffer()
  const cols = new Float32Array(21), orbs = new Float32Array(28)
  let dpr = 1
  function size() {
    dpr = 1   // the pencil pass is heavy; the DOM stays crisp regardless
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr)
    gl.bindTexture(gl.TEXTURE_2D, sceneTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }
  function render(t, dt) {
    F.tOrb += dt * F.speed
    const k = F.night, T = F.tOrb
    for (let n = 0; n < 7; n++) {
      const i = ORDER[n], o = ORBS[i], c = lerp3(hex(DAY.c[i]), hex(NIGHT.c[i]), k)
      cols[n * 3] = c[0]; cols[n * 3 + 1] = c[1]; cols[n * 3 + 2] = c[2]
      orbs[n * 4] = o.x + Math.sin(T * o.sx + o.ph) * o.ax
      orbs[n * 4 + 1] = o.y + Math.cos(T * o.sy + o.ph * 1.3) * o.ay
      orbs[n * 4 + 2] = o.r * (1 + 0.08 * Math.sin(T * 0.31 + o.ph))
      orbs[n * 4 + 3] = o.z
    }
    // pass A → texture
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null)   // never sample the target we draw into
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(progA); bindAttr(progA)
    gl.uniform2f(UA.uRes, canvas.width, canvas.height)
    gl.uniform1f(UA.uTime, t); gl.uniform1f(UA.uCam, F.cam); gl.uniform2f(UA.uPointer, F.pointer[0], F.pointer[1])
    gl.uniform1f(UA.uNight, k); gl.uniform1f(UA.uGrain, F.grain); gl.uniform1f(UA.uAmt, F.amt); gl.uniform1f(UA.uSoft, F.soft)
    gl.uniform3fv(UA.uPaper, lerp3(hex(DAY.paper), hex(NIGHT.paper), k))
    gl.uniform3fv(UA.uCol, cols); gl.uniform4fv(UA.uOrb, orbs)
    gl.uniform1f(UA.uIntro, F.intro)
    // window rect: DOM top-left px → GL bottom-left px
    const [wx, wy, ww, wh] = F.win
    gl.uniform4f(UA.uWin, wx * dpr, (innerHeight - (wy + wh)) * dpr, ww * dpr, wh * dpr)
    gl.uniform1f(UA.uW0, F.w0); gl.uniform1f(UA.uProg, Math.max(0, Math.min(1, F.prog)))
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    // pass B → screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(progB); bindAttr(progB)
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneTex); gl.uniform1i(UB.uScene, 0)
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, noiseTex); gl.uniform1i(UB.uNoise, 1)
    gl.uniform2f(UB.uRes, canvas.width, canvas.height); gl.uniform1f(UB.uSketch, F.sketch); gl.uniform1f(UB.uTime, t)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  function destroy() {
    gl.deleteProgram(progA); gl.deleteProgram(progB); gl.deleteBuffer(buf)
    gl.deleteTexture(noiseTex); gl.deleteTexture(sceneTex); gl.deleteFramebuffer(fbo)
  }
  return { size, render, destroy }
}
