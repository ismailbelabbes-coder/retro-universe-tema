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
  const drawer = $('#cart-drawer'), backdrop = $('[data-drawer-backdrop]');
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

  /* ---------- Plantillas de píxel-art (moneda, fantasma...) ---------- */
  const sprite = name => {
    const t = $(`#sprites [data-sprite="${name}"]`);
    return t ? t.firstElementChild.cloneNode(true) : null;
  };

  /* moneda que vuela hacia la cesta (solo transform) */
  function flyCoin(from) {
    if (!motionOn || !from) return;
    const to = $$('[data-cart-link]').find(el => el.offsetParent !== null);
    const coin = sprite('coin');
    if (!to || !coin) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const x0 = a.left + a.width / 2 - 11, y0 = a.top + a.height / 2 - 11, x1 = b.left + b.width / 2 - 11, y1 = b.top + b.height / 2 - 11;
    const outer = document.createElement('div'); outer.className = 'fly'; outer.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('div'); inner.style.cssText = 'width:100%;height:100%'; inner.append(coin); outer.append(inner);
    document.body.append(outer);
    const lift = Math.min(160, Math.abs(y1 - y0) * .5 + 80);
    outer.animate([{ transform: `translate(${x0}px,0)` }, { transform: `translate(${x1}px,0)` }], { duration: 650, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' });
    inner.animate([
      { transform: `translateY(${y0}px) rotateY(0)` },
      { transform: `translateY(${Math.min(y0, y1) - lift}px) rotateY(540deg)`, offset: .45, easing: 'cubic-bezier(.2,0,.6,1)' },
      { transform: `translateY(${y1}px) rotateY(1080deg) scale(.6)` }
    ], { duration: 650, easing: 'cubic-bezier(.3,0,.7,1)', fill: 'forwards' }).onfinish = () => outer.remove();
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
      flyCoin(btn);
      setTimeout(() => setCount(cart.item_count), motionOn ? 650 : 0);
      if (drawer) { await refreshDrawer(); setTimeout(openDrawer, motionOn ? 700 : 0); }
      else toast(S.toast, item.product_title, cfg.cartUrl, S.viewCart);
      if (btn) {
        btn.classList.add('is-added'); btn.textContent = S.added;
        setTimeout(() => { btn.classList.remove('is-added'); btn.textContent = label; btn.disabled = false; }, 1400);
      }
    } catch (err) {
      form.submit(); /* si algo falla, el formulario nativo hace el trabajo */
    }
  });

  /* ---------- Carrito lateral ---------- */
  let lastFocus = null;
  const openDrawer = () => {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open'); backdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false'); document.body.classList.add('drawer-open');
    setTimeout(() => { const c = $('[data-drawer-close]', drawer); if (c) c.focus(); }, 60);
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open'); backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true'); document.body.classList.remove('drawer-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };
  async function refreshDrawer() {
    if (!drawer) return;
    try {
      const res = await fetch(cfg.root + '?sections=cart-drawer', { headers: { Accept: 'application/json' } });
      const html = (await res.json())['cart-drawer'];
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = $('[data-drawer-inner]', doc);
      if (fresh) $('[data-drawer-inner]', drawer).innerHTML = fresh.innerHTML;
    } catch (e) {}
  }
  if (drawer) {
    /* el icono de la cesta abre el cajón; sin JS o en /cart lleva a la página de la cesta */
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-cart-link]');
      if (!a || document.body.classList.contains('template-cart') || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); refreshDrawer().then(openDrawer);
    });
    drawer.addEventListener('click', async e => {
      if (e.target.closest('[data-drawer-close]')) { closeDrawer(); return; }
      const b = e.target.closest('[data-line]'); if (!b) return;
      b.disabled = true;
      try {
        const res = await fetch(cfg.cartChange, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ line: +b.dataset.line, quantity: +b.dataset.to }) });
        const cart = await res.json();
        setCount(cart.item_count);
        await refreshDrawer();
      } catch (err) { b.disabled = false; }
    });
    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeDrawer();
      if (e.key === 'Tab') {
        const f = $$('button:not([disabled]), a[href]', drawer).filter(x => x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

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
  const design = document.body.dataset.design === 'true';
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.replace('pre', 'is-in');
      if (e.target.dataset.countTo) countUp(e.target);
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal, [data-count-to]').forEach(el => {
      /* solo se oculta lo que está bajo el pliegue; si JS falla, todo queda visible */
      if (el.classList.contains('reveal') && motionOn && !design && el.getBoundingClientRect().top > innerHeight * .92) el.classList.add('pre');
      io.observe(el);
    });
  }

  /* quita la clase de entrada cuando acaba la animación, para que no se repita al pasar el ratón */
  const settle = card => {
    const img = $('.card__img1', card) || card;
    img.addEventListener('animationend', () => card.classList.remove('in'), { once: true });
  };

  /* ---------- Cartuchos que caen al entrar en pantalla (solo los que están bajo el pliegue) ---------- */
  if (motionOn && !design && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting).forEach((e, k) => {
        e.target.style.setProperty('--i', k);
        e.target.classList.replace('pre', 'in'); settle(e.target);
        cio.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.card').forEach(c => {
      if (c.getBoundingClientRect().top > innerHeight * .92) { c.classList.add('pre'); cio.observe(c); }
    });
  }

  /* ---------- Selector de tamaño (pinball) ---------- */
  const initSizer = box => {
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
  };
  $$('[data-sizer]').forEach(initSizer);
  document.addEventListener('shopify:section:load', e => $$('[data-sizer]', e.target).forEach(initSizer));

  /* ---------- Pestañas de categoría (cuadrícula de la portada) ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-tabs] .tab'); if (!t) return;
    const box = t.closest('[data-tabs]'), cat = t.dataset.filter, scope = box.parentElement;
    $$('.tab', box).forEach(x => x.setAttribute('aria-pressed', String(x === t)));
    let k = 0;
    $$('[data-tab-grid] > li', scope).forEach(li => {
      const show = cat === 'all' || li.dataset.cat === cat;
      li.hidden = !show;
      const c = $('.card', li);
      if (show && c && motionOn) { c.classList.remove('pre', 'in'); void c.offsetWidth; c.style.setProperty('--i', Math.min(k++, 6)); c.classList.add('in'); settle(c); }
    });
    $$('[data-more]', scope).forEach(a => { a.hidden = a.dataset.more !== cat; });
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
      const main = $('#MainContent');
      boot.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.02, .006)', opacity: 1 }, { transform: 'scale(0, .006)', opacity: 0 }],
        { duration: 420, easing: 'cubic-bezier(.7,0,.84,0)', fill: 'forwards' }).onfinish = () => {
        boot.remove(); root.classList.add('booted');
        const flash = document.createElement('div'); flash.className = 'crt-flash'; flash.setAttribute('aria-hidden', 'true');
        document.body.append(flash);
        flash.animate([{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1, offset: .35 }, { transform: 'scaleX(1) scaleY(260)', opacity: 0 }],
          { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => flash.remove();
        if (main) main.animate([{ transform: 'scaleY(.02)', opacity: .2 }, { transform: 'scaleY(1)', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      };
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

  /* ---------- Sprites que cruzan la pantalla (decorativo, solo portada) ---------- */
  if (motionOn && document.body.classList.contains('template-index')) {
    const kinds = [['coin', 'coin', 'coin', 'ghost'], ['bolt'], ['ghost'], ['star']];
    let n = 0;
    const spawn = () => {
      if (document.hidden || !root.classList.contains('is-live')) return;
      const kind = kinds[n++ % kinds.length];
      const wrap = document.createElement('div');
      wrap.className = 'sprite'; wrap.setAttribute('aria-hidden', 'true');
      wrap.style.gap = kind.length > 1 ? '22px' : '0';
      kind.forEach((name, k) => {
        const el = sprite(name); if (!el) return;
        if (kind.length > 1 && k < kind.length - 1) el.classList.add('sm');
        el.style.display = 'block'; wrap.append(el);
      });
      document.body.append(wrap);
      const ltr = n % 2 === 0, y = 90 + Math.random() * innerHeight * .55, w = 260, flip = ltr ? '' : ' scaleX(-1)';
      const from = ltr ? -w : innerWidth + 40, to = ltr ? innerWidth + 40 : -w;
      wrap.animate([{ transform: `translate(${from}px, ${y}px)${flip}` }, { transform: `translate(${to}px, ${y + (Math.random() * 60 - 30)}px)${flip}` }],
        { duration: 7000 + Math.random() * 3000, easing: 'linear' }).onfinish = () => wrap.remove();
    };
    setTimeout(spawn, 2600);
    setInterval(spawn, 11000);
  }

  /* ---------- Textos largos plegables: ficha, descripción de colección... ---------- */
  const collapse = () => $$('[data-collapsible]').forEach(el => {
    const max = +el.dataset.max || 560;
    if (el.dataset.ready || el.scrollHeight < max + 60) return;
    el.dataset.ready = '1';
    el.classList.add('is-collapsed'); el.style.setProperty('--cmax', max + 'px');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn btn--ghost desc-toggle'; btn.setAttribute('aria-expanded', 'false');
    const more = el.dataset.more, less = el.dataset.less; btn.textContent = more;
    btn.addEventListener('click', () => {
      const open = el.classList.toggle('is-collapsed') === false;
      btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? less : more;
    });
    el.after(btn);
  });
  if (document.readyState === 'complete') collapse(); else addEventListener('load', collapse);

  /* ---------- Preferencias de cookies: reabre el panel de consentimiento de Shopify ---------- */
  const prefsBtn = $('[data-privacy-prefs]');
  if (prefsBtn) {
    const api = () => window.Shopify && window.Shopify.customerPrivacy && typeof window.Shopify.customerPrivacy.showPreferences === 'function' ? window.Shopify.customerPrivacy : null;
    const sync = () => { prefsBtn.hidden = !api(); };
    sync(); [800, 2500, 6000].forEach(t => setTimeout(sync, t));
    document.addEventListener('visitorConsentCollected', sync);
    prefsBtn.addEventListener('click', () => { const a = api(); if (a) a.showPreferences(); });
  }

  /* ---------- Cabecera: pasa al botón de menú si los enlaces no caben (idiomas con palabras largas) ---------- */
  const hud = $('.hud');
  if (hud) {
    const nav = $('.hud__nav', hud), list = nav && $('ul', nav);
    const fit = () => {
      if (!list) return;
      hud.classList.remove('is-compact');
      if (matchMedia('(min-width: 990px)').matches && list.scrollWidth > nav.clientWidth + 2) hud.classList.add('is-compact');
    };
    fit();
    addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    addEventListener('load', fit);
  }
})();
