// Revisa la vista previa del tema en cada idioma. Uso (Node 18 o superior, sin instalar nada):
//   node herramientas/revisar-idiomas.mjs
// Hace pocas peticiones, espaciadas, desde tu ordenador. Solo lee páginas públicas de la vista previa.
const BASE = 'https://retrouniverse.es';
const THEME = '200513847680';
const IDIOMAS = ['de', 'fr', 'it', 'en', 'ca', 'pt-pt'];
const PAGINAS = [['portada', ''], ['colección', '/collections/pinball-virtual'], ['ficha', '/products/pandora-box-10-9800-juegos'], ['contacto', '/pages/contact']];
const ESPANOL = ['Añadir', 'Cesta', 'Inicio', 'Contacto', 'Elige tu máquina', 'Selecciona tu jugador', 'Envío gratuito', 'Saltar al contenido', 'Ver todo', 'Ver opciones', 'Finalizar compra', 'Agotado', 'Política de privacidad', 'Todos los precios', 'Buscar', 'juegos'];
const espera = ms => new Promise(r => setTimeout(r, ms));
let cookies = '';
const guardar = res => { const c = res.headers.getSetCookie?.() || []; if (c.length) { const mapa = new Map(cookies.split('; ').filter(Boolean).map(x => x.split('=')).map(([k, ...v]) => [k, v.join('=')])); c.forEach(x => { const [kv] = x.split(';'); const [k, ...v] = kv.split('='); mapa.set(k, v.join('=')); }); cookies = [...mapa].map(([k, v]) => `${k}=${v}`).join('; '); } };
async function pedir(url) {
  let u = url;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(u, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0', cookie: cookies, 'accept-language': 'es' } });
    guardar(res);
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) { u = new URL(res.headers.get('location'), u).href; continue; }
    return { status: res.status, html: await res.text() };
  }
  return { status: 0, html: '' };
}
const texto = h => h.replace(/<(script|style|svg|noscript|template)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ');
await pedir(`${BASE}/?preview_theme_id=${THEME}`);
for (const lang of IDIOMAS) {
  console.log(`\n===== /${lang}`);
  for (const [nombre, ruta] of PAGINAS) {
    await espera(1500);
    const { status, html } = await pedir(`${BASE}/${lang}${ruta}`);
    if (status === 403) { console.log(`  ${nombre}: BLOQUEADO (403). Espera unos minutos y vuelve a ejecutar.`); continue; }
    const tema = (html.match(/Shopify\.theme = \{"name":"([^"]+)"/) || [])[1] || '?';
    const htmlLang = (html.match(/<html[^>]*lang="([^"]+)"/) || [])[1] || '?';
    const titulo = ((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').replace(/\s+/g, ' ').trim().slice(0, 70);
    const t = texto((html.match(/<body[\s\S]*/) || [html])[0]);
    const sobrantes = ESPANOL.filter(p => t.includes(p));
    console.log(`  ${nombre}: ${status} · lang=${htmlLang} · tema=${tema.startsWith('Retro Universe Arcade') ? 'nuevo' : tema} · título: ${titulo}`);
    if (sobrantes.length) console.log(`     ⚠ palabras en español: ${sobrantes.join(', ')}`);
  }
}
console.log('\nFin. Si algo sale con ⚠, pégame esta salida completa.');
