/* Retro Universe Arcade · JavaScript global. Sin librerías. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionOn = document.body.dataset.motion !== 'false' && !reduce;
  let cfg = { strings: {}, boot: {} };
  try { cfg = JSON.parse($('#theme-config').textContent); } catch (e) {}
  const S = cfg.strings || {};
  const dots = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  /* ---------- Avisos ---------- */
  function toast(title, text, href, linkText) {
    const box = $('#toasts'); if (!box) return;
    const t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status');
    t.append(document.createTextNode(title));
    if (text) { const b = document.createElement('b'); b.textContent = text; t.append(b); }
    if (href) { const a = document.createElement('a'); a.href = href; a.textContent = linkText; t.append(a); }
    box.append(t);
    setTimeout(() => t.remove(), 3100);
  }

  /* ---------- Cesta: contador y añadir sin recargar ---------- */
  function setCount(n) {
    $$('[data-count]').forEach(el => { el.textContent = String(n).padStart(2, '0'); });
    $$('[data-cart-link]').forEach(el => {
      el.classList.remove('bump'); void el.offsetWidth; if (motionOn) el.classList.add('bump');
    });
  }
  document.addEventListener('submit', async e => {
    const form = e.target.closest('form[data-ajax-cart]');
    if (!form || !window.fetch) return;
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const label = btn ? btn.dataset.label || btn.textContent : '';
    if (btn) { btn.disabled = true; }
    try {
      const res = await fetch(cfg.cartAdd + '.js', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      if (!res.ok) throw new Error('add');
      const item = await res.json();
      const cart = await (await fetch(cfg.cartJs, { headers: { Accept: 'application/json' } })).json();
      setCount(cart.item_count);
      toast(S.toast, item.product_title, cfg.cartUrl, S.viewCart);
      if (btn) {
        btn.classList.add('is-added'); btn.textContent = S.added;
        setTimeout(() => { btn.classList.remove('is-added'); btn.textContent = label; btn.disabled = false; }, 1400);
      }
    } catch (err) {
      form.submit(); /* si algo falla, el formulario nativo hace el trabajo */
    }
  });

  /* ---------- Cantidad ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-qty-step]'); if (!b) return;
    const input = b.closest('.qty').querySelector('input');
    const next = Math.max(+input.min || 0, (+input.value || 0) + (+b.dataset.qtyStep));
    input.value = next;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  $$('[data-cart-form] .qty input').forEach(i => i.addEventListener('change', () => {
    const u = i.form.querySelector('[name="update"]');
    if (i.form.requestSubmit) i.form.requestSubmit(u); else i.form.submit();
  }));
  $$('select[data-autosubmit]').forEach(s => s.addEventListener('change', () => s.form.submit()));

  /* ---------- Menú móvil: cerrar con Escape y al elegir enlace ---------- */
  const menu = $('.menu');
  if (menu) {
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    menu.addEventListener('click', e => { if (e.target.closest('a')) menu.open = false; });
  }

  /* ---------- Barra de progreso de scroll ---------- */
  const xp = $('[data-xp]');
  if (xp) {
    let tick = false;
    const on = () => {
      const h = root.scrollHeight - innerHeight;
      xp.style.setProperty('--p', h > 0 ? Math.min(1, scrollY / h) : 0);
      tick = false;
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(on); } }, { passive: true });
    on();
  }

  /* ---------- Aparición y contadores ---------- */
  const countUp = el => {
    const to = +el.dataset.countTo, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (!motionOn || !isFinite(to)) { el.textContent = pre + dots(to) + suf; return; }
    const t0 = performance.now(), dur = to > 100 ? 1600 : 1100;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + dots(Math.round(to * e)) + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.dataset.countTo) countUp(e.target);
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -12% 0px' });
    $$('.reveal, [data-count-to]').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Selector de tamaño (pinball) ---------- */
  $$('[data-sizer]').forEach(box => {
    const tabs = $$('[role="tab"]', box), panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const imgs = $$('[data-pin]', box), ruler = $('[data-ruler]', box);
    const sel = (i, focus) => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => { if (p) p.hidden = k !== i; });
      imgs.forEach((im, k) => im.classList.toggle('on', k === i));
      if (ruler) ruler.style.setProperty('--r', (i + 1) / tabs.length);
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => sel(i));
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); sel((i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length, true); }
      });
    });
    sel(Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true')));
  });

  /* ---------- Pandora: cursor de selección de juego ---------- */
  const chips = $$('.chips .chip:not(.chip--more)');
  if (chips.length) {
    let i = 0, timer = 0;
    const tick = () => { chips.forEach((c, k) => c.classList.toggle('is-sel', k === i)); i = (i + 1) % chips.length; };
    tick();
    if (motionOn && 'IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => {
        clearInterval(timer);
        if (e.isIntersecting) timer = setInterval(tick, 850);
      })).observe(chips[0].parentElement);
    }
  }

  /* ---------- Continue? cuenta atrás decorativa ---------- */
  const cd = $('[data-countdown]');
  if (cd && motionOn && 'IntersectionObserver' in window) {
    let v = 9, timer = 0;
    new IntersectionObserver(es => es.forEach(e => {
      clearInterval(timer);
      if (!e.isIntersecting) return;
      timer = setInterval(() => {
        v = v <= 0 ? 9 : v - 1; cd.textContent = v;
        cd.animate([{ transform: 'scale(1.2)', opacity: .4 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300, easing: 'steps(3)' });
      }, 1000);
    }), { threshold: .4 }).observe(cd);
  }

  /* ---------- Insert Coin: nunca bloquea ---------- */
  const boot = $('#boot');
  if (boot && !root.classList.contains('booted')) {
    let done = false;
    const remember = () => {
      try {
        if (cfg.boot.remember === 'device') localStorage.setItem('ru-booted', '1');
        else if (cfg.boot.remember === 'session') sessionStorage.setItem('ru-booted', '1');
      } catch (e) {}
    };
    const finish = () => {
      if (done) return; done = true;
      remember();
      document.body.classList.remove('booting');
      root.classList.add('is-live');
      if (!motionOn) { boot.remove(); root.classList.add('booted'); return; }
      boot.classList.add('is-leaving');
      setTimeout(() => { boot.remove(); root.classList.add('booted'); }, 320);
    };
    const coin = $('#insert-coin');
    const start = () => {
      if (done) return;
      boot.classList.add('is-ready');
      const c = $('#boot-cred'); if (c) c.textContent = '01';
      if (coin && coin.firstElementChild) coin.firstElementChild.textContent = S.bootReady || 'READY!';
      setTimeout(finish, motionOn ? 350 : 0);
    };
    boot.addEventListener('click', start);
    document.addEventListener('keydown', e => { if (!done && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) { e.preventDefault(); start(); } });
    if (coin) coin.focus({ preventScroll: true });
    if (cfg.boot.auto > 0) setTimeout(start, cfg.boot.auto * 1000);
    /* seguridad: por si algo falla, a los 15 s la pantalla desaparece sí o sí */
    setTimeout(finish, 15000);
  } else {
    document.body.classList.remove('booting');
    root.classList.add('is-live');
  }
})();
