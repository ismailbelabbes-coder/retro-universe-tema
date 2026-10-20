/* Portada: cabina arcade (modo demo) y fondo de estrellas en píxel. */
(() => {
  'use strict';
  const cab = document.getElementById('cab');
  if (!cab) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionOn = document.body.dataset.motion !== 'false' && !reduce;
  const slides = [...cab.querySelectorAll('[data-slide]')];
  const names = [...cab.querySelectorAll('[data-name]')];
  const stick = document.getElementById('stick');
  let i = 0, idleUntil = 0, visible = true;

  function show(n, dir) {
    if (!slides.length) return;
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => { s.classList.toggle('is-on', k === i); });
    names.forEach((s, k) => { s.hidden = k !== i; });
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

  /* ---- fondo de estrellas: lienzo de baja resolución escalado sin suavizar ---- */
  const cv = document.getElementById('space'), hero = cv && cv.parentElement;
  if (!cv) return;
  const g = cv.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const col = n => css.getPropertyValue(n).trim() || '#fff';
  const COLORS = ['#5d4c88', '#c9bde3', col('--cyan'), col('--pink'), col('--yellow'), '#ffffff'];
  let W = 0, H = 0, stars = [], raf = 0, last = 0, on = true;
  function build() {
    const r = hero.getBoundingClientRect(), s = r.width > 900 ? 4 : 3;
    W = Math.ceil(r.width / s); H = Math.ceil(r.height / s);
    cv.width = W; cv.height = H;
    const n = Math.round(W * H / 140);
    stars = Array.from({ length: n }, () => {
      const l = Math.random() < .6 ? 0 : Math.random() < .7 ? 1 : 2;
      return { x: Math.random() * W, y: Math.random() * H, v: [.06, .16, .38][l], s: l === 2 ? 2 : 1, c: l === 0 ? COLORS[0] : l === 1 ? COLORS[1] : COLORS[2 + Math.floor(Math.random() * 4)] };
    });
    draw();
  }
  function draw() {
    g.clearRect(0, 0, W, H);
    for (const s of stars) { g.fillStyle = s.c; g.fillRect(s.x | 0, s.y | 0, s.s, s.s); }
  }
  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (t - last < 40) return;
    last = t;
    for (const s of stars) { s.x -= s.v; if (s.x < 0) { s.x += W; s.y = Math.random() * H; } }
    draw();
  }
  build();
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
  if (!motionOn) return;
  const run = () => { cancelAnimationFrame(raf); if (on && !document.hidden) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(([e]) => { on = e.isIntersecting; run(); }).observe(hero);
  document.addEventListener('visibilitychange', run);
  run();
})();
