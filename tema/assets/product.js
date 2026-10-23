/* Ficha de producto: galería y selector de variantes (el envío al checkout es el nativo de Shopify). */
(() => {
  'use strict';
  const root = document.querySelector('[data-product]');
  if (!root) return;
  const data = JSON.parse(root.querySelector('[data-product-json]').textContent);
  const form = root.querySelector('form[data-product-form]');
  const S = (() => { try { return JSON.parse(document.getElementById('theme-config').textContent).strings; } catch (e) { return {}; } })();

  /* galería */
  const slides = [...root.querySelectorAll('[data-slide]')], thumbs = [...root.querySelectorAll('[data-thumb]')];
  const showSlide = i => {
    slides.forEach((s, k) => s.classList.toggle('is-on', k === i));
    thumbs.forEach((t, k) => t.setAttribute('aria-current', String(k === i)));
  };
  thumbs.forEach((t, i) => t.addEventListener('click', () => showSlide(i)));
  if (slides.length) showSlide(0);

  /* ampliar al pasar el ratón (escritorio) o al tocar (móvil) y deslizar para cambiar de foto */
  const main = root.querySelector('.gallery__main');
  if (main && main.classList.contains('gallery--zoomable')) {
    const hover = matchMedia('(hover:hover)').matches;
    const move = e => {
      const r = main.getBoundingClientRect();
      main.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%');
      main.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%');
    };
    if (hover) {
      main.addEventListener('mouseenter', e => { move(e); main.classList.add('is-zoom'); });
      main.addEventListener('mousemove', move);
      main.addEventListener('mouseleave', () => main.classList.remove('is-zoom'));
    } else {
      main.addEventListener('click', e => { move(e.touches ? e.touches[0] : e); main.classList.toggle('is-zoom'); });
    }
  }
  if (main && slides.length > 1) {
    let x0 = null;
    const current = () => Math.max(0, slides.findIndex(s => s.classList.contains('is-on')));
    const goto = n => showSlide((n + slides.length) % slides.length);
    main.addEventListener('touchstart', e => { x0 = main.classList.contains('is-zoom') ? null : e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) { goto(current() + (dx < 0 ? 1 : -1)); main.classList.remove('is-zoom'); }
    });
  }

  /* variantes */
  if (!form || data.variants.length < 2) return;
  const idInput = form.querySelector('[name="id"]');
  const btn = form.querySelector('[data-submit]');
  const priceBox = root.querySelector('[data-price]');
  const money = c => new Intl.NumberFormat(document.documentElement.lang || 'es', { style: 'currency', currency: data.currency }).format(c / 100);

  function current() {
    const chosen = [...form.querySelectorAll('.opt')].map(fs => (fs.querySelector('input:checked') || {}).value);
    return data.variants.find(v => v.options.every((o, k) => o === chosen[k]));
  }
  function update() {
    const v = current();
    if (!v) { btn.disabled = true; btn.textContent = S.unavailable; return; }
    idInput.value = v.id;
    btn.disabled = !v.available;
    btn.textContent = v.available ? btn.dataset.label : S.soldOut;
    if (priceBox) {
      const sale = v.compare_at_price > v.price;
      priceBox.innerHTML = (sale ? '<s>' + money(v.compare_at_price) + '</s>' : '') + '<strong>' + money(v.price) + '</strong>';
    }
    const url = new URL(location.href); url.searchParams.set('variant', v.id);
    history.replaceState(null, '', url);
    if (v.featured_media_index != null && slides[v.featured_media_index]) showSlide(v.featured_media_index);
  }
  form.addEventListener('change', e => { if (e.target.closest('.opt')) update(); });
})();

/* Barra de compra fija en móvil: aparece cuando el botón principal sale de la pantalla. */
(() => {
  const bar = document.querySelector('[data-sticky-buy]');
  const form = document.querySelector('form[data-product-form]');
  if (!bar || !form || !('IntersectionObserver' in window)) return;
  const btn = form.querySelector('[data-submit]');
  bar.hidden = false;
  new IntersectionObserver(([e]) => {
    const below = e.boundingClientRect.top > 0;
    bar.classList.toggle('is-on', !e.isIntersecting && !below);
  }).observe(btn);
  bar.querySelector('[data-sticky-submit]').addEventListener('click', () => { if (form.requestSubmit) form.requestSubmit(btn); else form.submit(); });
  /* mantiene el precio de la barra igual que el de la ficha (cambia al elegir variante) */
  const price = document.querySelector('[data-price]'), out = bar.querySelector('[data-sticky-price]');
  if (price && out) new MutationObserver(() => { const s = price.querySelector('strong'); if (s) out.textContent = s.textContent; }).observe(price, { childList: true, subtree: true });
})();

/* Descripción larga plegable: solo se pliega si es muy larga; sin JavaScript se ve completa. */
(() => {
  const run = () => {
  const el = document.querySelector('[data-collapsible]');
  if (!el || el.scrollHeight < 760) return;
  el.classList.add('is-collapsed');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn btn--ghost desc-toggle'; btn.setAttribute('aria-expanded', 'false');
  const more = el.dataset.more || 'Ver toda la descripción', less = el.dataset.less || 'Ver menos';
  btn.textContent = more;
  btn.addEventListener('click', () => {
    const open = el.classList.toggle('is-collapsed') === false;
    btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? less : more;
    if (!open) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  el.after(btn);
  };
  if (document.readyState === 'complete') run(); else addEventListener('load', run);
})();
