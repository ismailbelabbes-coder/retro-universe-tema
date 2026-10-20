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
