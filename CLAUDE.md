# Retro Universe: tema Shopify OS 2.0 (contexto mínimo)

Idioma de trabajo: español. Sé breve; gasta pocos créditos.

## Qué es
Tema personalizado "Retro Universe Arcade" para la tienda del cliente (RetroUniverse.es, Shopify ya en producción). Estética arcade de la demo (`index.html`, `PRODUCT.md`): cabina, CRT, rejilla, sol, píxel-art. Código del tema en `tema/` (Liquid + CSS + JS, sin librerías). Rama de trabajo: `claude/cool-keller-383yyy`.

## Datos
- Tienda: `svbu1m-jx.myshopify.com`. Tema sin publicar: id `200513847680`. El cliente lo publica cuando apruebe.
- Subir: `shopify theme push --path tema --store svbu1m-jx.myshopify.com --theme 200513847680` (si sale 401: `shopify auth logout` y repetir). Vista previa en vivo: `shopify theme dev --path tema --store svbu1m-jx.myshopify.com`.
- Vista previa pública: `https://retrouniverse.es/?preview_theme_id=200513847680`. Editor: `https://admin.shopify.com/store/svbu1m-jx/themes/200513847680/editor`.
- Comprobar código: `shopify theme check --path tema` (debe dar 0 avisos).
- Revisar idiomas: `node herramientas/revisar-idiomas.mjs` (desde el PC del usuario).
- Permisos de colaborador: Temas, ver Productos/Colecciones, Idiomas y Contenido. No hay acceso a pedidos, clientes ni pagos. No iniciar sesión por el usuario ni pedir credenciales.

## Reglas del proyecto (no negociables)
- Shopify es el backend: carrito, checkout y pagos nativos. No tocar el checkout. No cambiar `handle` ni rutas (usar `routes`). Las 301 viven en la tienda.
- No quitar `content_for_header` ni `content_for_layout`. Un solo `<h1>` por página. Sin scripts de seguimiento a mano.
- Móvil primero, botones >= 48 px, contraste >= 4,5:1, solo `transform` y `opacity` para animar, respetar `prefers-reduced-motion`.
- Press Start 2P solo en etiquetas, botones y números, sin mayúsculas con tilde (snippet `px`). Titulares Jersey 10, cuerpo Space Grotesk (alojadas en `assets/`).
- Imágenes de producto y banners siempre de Shopify; las `assets/demo-*.webp` solo se ven dentro del editor.
- No inventar datos, garantías ni cifras que no estén en `PRODUCT.md` o en la web actual.

## Decisiones tomadas con el cliente
- Insert Coin: opcional, saltable con un toque, nunca bloquea; se desactiva en Ajustes del tema.
- Fotos de producto limpias (sin CRT ni filtros); galería grande; descripción a todo el ancho; precio en amarillo; "Oferta" solo con descuento >= 25 %.
- Fondo decorativo: moqueta de recreativa por defecto (ajustable). Sonidos: preguntado al cliente, sin respuesta; si dice que sí, apagado por defecto.
- Idiomas publicados: es (predeterminado), de, fr, it, en, ca, pt-PT. `locales/` tiene es, en, de, fr, it, ca, pt, nl. Traducciones del contenido con Translate & Adapt (no Transtore).
- Precio acordado: 600 EUR + IVA (retención 7 %). Pago al aprobar la vista previa; incluye 2 rondas de ajustes.

## Pendiente
- Traducir en Translate & Adapt, para el tema "Retro Universe Arcade": Plantillas, Grupos de secciones, Secciones estáticas, Configuración del tema (cada idioma). Políticas legales: a mano (no se traducen automáticamente). Asignar pt-PT a un mercado (daba 404).
- Revisión del cliente y correcciones. Revisar cabecera en alemán (adaptable: pasa a menú si no cabe).
- Textos legales: borradores en `tema/legal/` para su asesor; función de desistimiento (enlace en Ajustes del tema).
- Antes de publicar: activar WhatsApp (Webux) en Embeds de aplicaciones, apagar el traductor de Transtore, lista SEO de `tema/LEEME.md`.
