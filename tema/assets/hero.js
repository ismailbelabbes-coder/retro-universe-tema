/* Portada: cabina arcade (modo demo) y fondo espacial en píxel. Movimiento solo si el usuario no pidió reducirlo. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionOn = document.body.dataset.motion !== 'false' && !reduce;
  const cab = document.getElementById('cab');
  if (!cab) return;

  /* ruido de pantalla CRT (se genera una vez) */
  if (motionOn) {
    const c = document.createElement('canvas'); c.width = c.height = 120;
    const x = c.getContext('2d'), img = x.createImageData(120, 120);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0);
    document.documentElement.style.setProperty('--noise', `url(${c.toDataURL('image/png')})`);
  }

  const crt = cab.querySelector('.crt');
  const slides = [...cab.querySelectorAll('[data-slide]')];
  const names = [...cab.querySelectorAll('[data-name]')];
  const stick = document.getElementById('stick');
  let i = 0, idleUntil = 0, visible = true;

  function show(n, dir) {
    if (!slides.length) return;
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => { s.classList.toggle('is-on', k === i); });
    names.forEach((s, k) => { s.hidden = k !== i; });
    if (motionOn && dir && crt) { crt.classList.remove('is-switch'); void crt.offsetWidth; crt.classList.add('is-switch'); }
    if (stick && dir) {
      stick.classList.remove('l', 'r'); stick.classList.add(dir < 0 ? 'l' : 'r');
      setTimeout(() => stick.classList.remove('l', 'r'), 220);
    }
  }
  const user = d => { idleUntil = Date.now() + 9000; show(i + d, d); };
  cab.querySelectorAll('[data-cab]').forEach(b => b.addEventListener('click', () => user(+b.dataset.cab)));
  if (stick) stick.addEventListener('click', () => user(1));
  cab.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); user(e.key === 'ArrowLeft' ? -1 : 1); }
  });
  show(0);
  if (motionOn && slides.length > 1) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cab);
    setInterval(() => { if (visible && !document.hidden && Date.now() > idleUntil) show(i + 1, 1); }, 3800);
  }

  /* ---- fondo espacial: planeta con anillo, luna, estrellas y estrella fugaz ---- */
function startSpace() {
  const cv = document.getElementById('space'), hero = document.querySelector('.hero');
  if (!cv) return;
  const g = cv.getContext('2d');
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const SKY = ['#05020b', '#080414', '#0c051d', '#120727', '#190a32', '#210c3c', '#2a0f47'].map(rgb);
  const PLANET = ['#1a0730', '#3d0f5c', '#7a1d7e', '#c4237f', '#ff2e93', '#ff8fc4'].map(rgb);
  const RING = ['#5c2a00', '#c97a00', '#ffd23f', '#fff1b0'].map(rgb);
  const MOON = ['#2a2440', '#5a5470', '#8c87a0', '#c9c5d6'].map(rgb);
  let W = 0, H = 0, layers = null, stars = [], shoot = null, frame = 0, raf = 0, last = 0, onScreen = true;
  const dith = (pal, v, x, y) => { const t = Math.max(0, Math.min(.999, v)) * (pal.length - 1), i = Math.floor(t); return pal[(t - i) * 16 > BAYER[(x & 3) + (y & 3) * 4] ? Math.min(i + 1, pal.length - 1) : i]; };
  function build() {
    const r = hero.getBoundingClientRect(), s = r.width > 900 ? 4 : 3;
    W = Math.ceil(r.width / s); H = Math.ceil(r.height / s);
    cv.width = W; cv.height = H;
    const mobile = r.width <= 900;
    const sky = new ImageData(W, H), fg = new ImageData(W, H);
    const put = (img, x, y, c) => { const k = (y * W + x) * 4; img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(sky, x, y, dith(SKY, y / H, x, y));
    const R = Math.round(Math.min(W, H) * (mobile ? .16 : .14)), cx = Math.round(W * (mobile ? .8 : .56)), cy = Math.round(H * (mobile ? .37 : .18));
    for (let y = Math.max(0, cy - R * 2); y < Math.min(H, cy + R * 2); y++) {
      for (let x = Math.max(0, cx - R * 2); x < Math.min(W, cx + R * 2); x++) {
        const dx = (x - cx) / R, dy = (y - cy) / R, d2 = dx * dx + dy * dy;
        const rx = dx * .94 + dy * .34, ry = -dx * .34 + dy * .94;
        const e = (rx / 1.85) ** 2 + (ry / .42) ** 2;
        const ring = e > .62 && e < 1 && !(e > .78 && e < .83);
        if (ring && (d2 > 1 || ry > 0)) { put(fg, x, y, dith(RING, 1.15 - e * .9 + (ry > 0 ? .15 : -.1), x, y)); continue; }
        if (d2 <= 1) {
          const nz = Math.sqrt(1 - d2), light = -dx * .5 - dy * .55 + nz * .7;
          const band = .14 * Math.sin((dy * 9 + dx * 1.5) * 1.7) + .06 * Math.sin(dy * 23);
          put(fg, x, y, dith(PLANET, light * .75 + .25 + band, x, y));
        }
      }
    }
    const mr = Math.max(5, Math.round(H * .045)), mx = Math.round(W * (mobile ? .14 : .08)), my = Math.round(H * (mobile ? .12 : .16));
    for (let y = my - mr; y <= my + mr; y++) for (let x = mx - mr; x <= mx + mr; x++) {
      const dx = (x - mx) / mr, dy = (y - my) / mr, d2 = dx * dx + dy * dy;
      if (d2 > 1 || x < 0 || y < 0 || x >= W || y >= H) continue;
      const crater = ((dx + .3) ** 2 + (dy + .2) ** 2 < .06) || ((dx - .35) ** 2 + (dy - .3) ** 2 < .04);
      put(fg, x, y, dith(MOON, (-dx * .5 - dy * .5 + Math.sqrt(1 - d2) * .8) * .7 + .25 - (crater ? .3 : 0), x, y));
    }
    layers = { sky, fg };
    const n = Math.round(W * H / 140);
    stars = Array.from({ length: n }, () => {
      const l = Math.random() < .6 ? 0 : Math.random() < .7 ? 1 : 2;
      return { x: Math.random() * W, y: Math.random() * H, v: [.06, .16, .38][l], s: l === 2 ? 2 : 1, c: ['#5d4c88', '#c9bde3', ['#ffffff', '#27f0ff', '#ff8fc4', '#ffd23f'][Math.floor(Math.random() * 4)]][l], tw: Math.random() < .3, p: Math.floor(Math.random() * 60) };
    });
    skyC.width = fgC.width = W; skyC.height = fgC.height = H;
    skyC.getContext('2d').putImageData(sky, 0, 0); fgC.getContext('2d').putImageData(fg, 0, 0);
    draw();
  }
  const skyC = document.createElement('canvas'), fgC = document.createElement('canvas');
  function draw() {
    g.drawImage(skyC, 0, 0);
    for (const s of stars) {
      if (s.tw && (frame + s.p) % 60 < 6) continue;
      g.fillStyle = s.c; g.fillRect(s.x | 0, s.y | 0, s.s, s.s);
    }
    if (shoot) {
      g.fillStyle = '#fff';
      for (let k = 0; k < 7; k++) { g.globalAlpha = 1 - k / 7; g.fillRect((shoot.x - k * 2) | 0, (shoot.y - k) | 0, 2, 1); }
      g.globalAlpha = 1;
    }
    g.drawImage(fgC, 0, 0);
  }
  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (t - last < 33) return;
    last = t; frame++;
    for (const s of stars) { s.x -= s.v; if (s.x < 0) { s.x += W; s.y = Math.random() * H; } }
    if (!shoot && Math.random() < .004) shoot = { x: W * (.3 + Math.random() * .7), y: Math.random() * H * .4 };
    if (shoot) { shoot.x -= 4; shoot.y += 2; if (shoot.x < 0 || shoot.y > H) shoot = null; }
    draw();
  }
  build();
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
  if (!motionOn) return;
  const run = () => { cancelAnimationFrame(raf); if (onScreen && !document.hidden) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); }).observe(hero);
  document.addEventListener('visibilitychange', run);
}
startSpace();
})();
