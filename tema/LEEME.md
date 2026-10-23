# Retro Universe Arcade · tema Online Store 2.0

Tema personalizado en Liquid, HTML, CSS y JS para RetroUniverse.es. Shopify sigue siendo el backend completo (productos, stock, clientes, pedidos, pagos, impuestos, envíos y checkout). El tema solo cambia el diseño. No toca el checkout.

Estructura de buenas prácticas basada en [Dawn](https://github.com/Shopify/dawn). Su aviso de licencia está en `LICENSE-DAWN.md`. El diseño visual es el de la demo arcade, no el de Dawn. Las fuentes (Jersey 10, Press Start 2P, Space Grotesk) están incluidas en `assets/`, con licencia OFL (ver `assets/FUENTES-LICENCIAS.txt`), así que no se llama a Google Fonts.

## Subirlo como tema sin publicar

Desde tu ordenador, con tu acceso de colaborador:

```bash
npm i -g @shopify/cli
shopify theme push --path tema --unpublished --theme "Retro Universe Arcade"
```

Se crea una copia sin publicar. El tema actual de la tienda no se toca.

## Previsualizar

- Con `shopify theme push --unpublished` se muestra el enlace de vista previa. También aparece en Tienda online > Temas > ⋯ > Vista previa.
- Para pulir en local con recarga en vivo: `shopify theme dev --path tema` (usa tu sesión y los datos reales de la tienda).
- Para comprobar el código: `shopify theme check --path tema`. En el último pase no daba ningún aviso.
- En el editor de temas, la pantalla Insert Coin no se muestra para poder editar.
- Revisa la vista previa en móvil (375 px), en escritorio, con `prefers-reduced-motion` activado y con el JavaScript desactivado.

## Qué es editable desde el editor de Shopify

**Ajustes del tema:** paleta (los 5 colores), tipografías, efectos CRT, interruptor de animaciones, pantalla Insert Coin (activar, recordar, cierre automático), WhatsApp (número y mensaje), correo, dirección, redes, anuncio opcional, logotipo, favicon, imagen para compartir y datos legales.

**Secciones de la portada** (todas con textos, bloques, colores y espaciado editables): Arranque Insert Coin, Portada: cabina arcade, Marquesina, High Scores, Selecciona tu jugador, Cuadrícula de colección (con pestañas de categoría que filtran sin recargar, una colección por pestaña), Bloque Pandora, Selector de pinball (un producto por tamaño), Power-ups, Contacto «Continue?», Banner y Texto. El **carrito lateral** (sección `cart-drawer`) se abre al añadir o al pulsar el icono de la cesta; sin JavaScript el icono lleva a `/cart`. Las secciones se pueden reordenar, añadir y quitar.

**Cabecera y pie:** grupos de secciones con el menú elegido en el editor. Plantillas: `index`, `collection`, `product`, `cart`, `page`, `search`, `404`, `list-collections`, `blog` y `article`, más `password` y `gift_card`.

### Imágenes

Ninguna imagen de producto o banner está fija en el código. Salen de la tienda (imagen de la colección o del producto) o de los selectores del editor. Los renders de la demo (`assets/demo-*.webp`) solo se muestran dentro del editor de temas, como valor por defecto visual, y nunca en la tienda pública.

### Pantalla Insert Coin

Está en Ajustes del tema > Pantalla Insert Coin. Nunca bloquea el acceso a los productos:

- Sin JavaScript no se muestra.
- Se salta con un toque en cualquier sitio, con Enter o con Escape.
- Se cierra sola a los 5 s (configurable) y tiene un cierre de seguridad a los 15 s.
- Recuerda que se saltó, en el dispositivo o solo en la visita, según el ajuste.
- `?skip` en la URL la salta.
- Se puede desactivar del todo con una casilla.

### Texto en Press Start 2P

Press Start 2P solo se usa en etiquetas, botones y números. El tema quita las tildes en esos textos con el snippet `px`, también en lo que escriba el cliente en el editor. Los titulares usan Jersey 10, que sí admite tildes.

## Compra

Se usa el carrito y el checkout nativos: `{% form 'product' %}`, `/cart` y el botón «Finalizar compra» con `name="checkout"`. El botón «Añadir» funciona sin recargar (se confirma con un aviso y el contador de la cabecera), y si falla se envía el formulario nativo. En la ficha de producto está «Comprar ahora» (pago acelerado de Shopify). El pedido por WhatsApp es solo una opción secundaria. Todas las URLs salen del objeto `routes` y de los `handle` de Shopify.

## Lista de comprobación SEO

### Antes de publicar (en la vista previa)

- [ ] **Títulos:** compara el `<title>` de portada, 3 colecciones, 3 productos, una página y el blog con la web actual. El tema usa `page_title` y, si está activo Ajustes > Logotipo y SEO > «Añadir el nombre de la tienda», añade « – Retro Universe». Desactívalo si el tema actual no lo hace.
- [ ] **Metadescripciones:** comprueba que `<meta name="description">` coincide con la de Shopify (Editar SEO de cada recurso).
- [ ] **Un solo `<h1>` por página.** Portada: titular de la cabina. Colección y producto: su título.
- [ ] **Canonical** y `<html lang="es">` correctos en la vista previa.
- [ ] **Datos estructurados:** pega 2 o 3 URLs de producto de la vista previa en el «Test de resultados enriquecidos» de Google. Deben salir Product y Offer sin errores. Los artículos del blog llevan Article.
- [ ] **Open Graph y Twitter:** `og:title`, `og:description` y `og:image` por página.
- [ ] **Enlaces:** recorre menú, pie, colecciones y productos (sin 404 ni enlaces internos a URLs antiguas). Los `handle` no se han tocado.
- [ ] **Redirecciones 301:** están en Contenido > Menús > Redirecciones de URL, no en el tema. Pruébalas.
- [ ] **Imágenes:** todas con `alt` (el de Shopify; si falta, el tema usa el título del producto o de la colección).
- [ ] **Píxeles y analítica:** en Ajustes > Eventos de cliente y en Canales (Google & YouTube) no debe aparecer ningún error. Cargan por `content_for_header`, y no hay scripts de seguimiento a mano en el tema.
- [ ] **Compra completa:** añadir al carrito desde una tarjeta y desde la ficha, cambiar cantidad, ir a checkout (sin pagar).

### Después de publicar

- [ ] Comprueba que la portada, una colección y un producto devuelven 200 y que https://retrouniverse.es/robots.txt y el sitemap (`/sitemap.xml`) siguen bien.
- [ ] Haz un pedido de prueba (o comprueba el siguiente real) y revisa que llegan los eventos de compra a Analytics y Google Ads.
- [ ] Google Merchant Center: Productos > Diagnósticos, sin nuevos avisos. En Search Console, inspecciona la portada y un producto y pide indexación.
- [ ] Una semana después: Search Console (cobertura y errores 404), posiciones y tráfico frente a la semana anterior, y que las conversiones de Google Ads siguen registrándose.

## Lo que he visto en la tienda actual (retrouniverse.es)

- Usa el tema **Horizon** de Shopify. Las colecciones son `arcade-recreativas`, `pinball-virtual`, `pandora-box`, `lamparas-backglass-rgb`, `consolas-portatiles` y `consolas-stick`. La portada del tema las trae como valor por defecto (por handle); si una no existe en la tienda, el editor la deja vacía.
- **Apps que inyectan código:** botón flotante de WhatsApp (Webux) y traducción (Transtore). Son extensiones de aplicación: al activar el tema nuevo hay que habilitarlas en el editor de temas, en «Embeds de aplicaciones» (icono lateral), o dejarán de verse. Lo mismo para cualquier otra app instalada.
- **Envío gratuito:** la web actual dice «a partir de 30 € para España (solo Península) y Portugal». La demo decía 80 €, así que el tema usa los 30 € como texto por defecto. Compruébalo con el cliente.
- Los títulos de producto son muy largos (hasta 150 caracteres). El tema los corta a 3 líneas en las tarjetas.
- La portada actual publica datos estructurados `Organization`; el tema también.

## Revisión de calidad (última pasada)

- Contraste medido con la paleta por defecto: todo el texto supera 4,5:1 (el texto secundario, 5,6 a 6,5:1; el blanco sobre violeta, 5,4:1). Los campos de formulario tienen borde de alto contraste.
- Un solo `<h1>` por página: los `<h1>` que traen las descripciones de producto, página, artículo o colección se convierten en `<h2>`.
- La etiqueta «Oferta» solo sale en descuentos del 25 % o más (la web anterior ponía «OFERTA» en todo). El precio tachado y el porcentaje se ven siempre que haya descuento.
- Los elementos que aparecen con animación solo se ocultan si están bajo el pliegue y los gestiona JavaScript: si algo falla, todo queda visible. En el editor de temas nunca se ocultan.
- Comprobado en la vista previa de la tienda real a 375 px y a 1366 px: sin desbordamiento horizontal.

## Fotos de producto y conversión

- **Encuadre de fotos:** en las secciones «Cuadrícula de colección» y «Colección» (y la ficha de producto) se elige «Foto completa» o «Recortada». En modo recortado se usa el punto de enfoque de cada imagen (Shopify > Productos > imagen > Editar > Punto de enfoque).
- **Animación retro de las fotos:** al entrar en pantalla la foto «se enciende» como un tubo CRT, y al pasar el ratón rebota en dos fotogramas y un brillo de pantalla la cruza (solo `transform` y `opacity`; sin movimiento con «reducir movimiento»).
- **Fondo decorativo** (Ajustes del tema > Efectos arcade): moqueta de recreativa (por defecto), suelo de rejilla en perspectiva, brillos y estrellas, solo brillos, rejilla tenue o fondo liso.
- **Textos largos plegables** («Leer más»): descripciones de colección y de producto.
- **Zoom** al pasar el ratón en la ficha, al tocar en móvil, y deslizamiento para cambiar de foto.
- **Envío gratuito:** barra de progreso en el cajón y en la página del carrito. Se configura en Ajustes del tema > Envío gratuito (30 € por defecto, el de su web actual). Solo informa: la condición real se configura en los envíos de Shopify.
- **Barra de compra fija en móvil** en la ficha (se puede apagar en la sección).
- **Título corto para las tarjetas (opcional):** si creas en Shopify un metacampo de producto `custom.titulo_corto` (texto), las tarjetas lo usan en lugar del título largo de SEO. Si no existe, se usa el título normal. Para crearlo: Ajustes > Datos personalizados > Productos > Añadir definición, con espacio de nombres `custom` y clave `titulo_corto`.
- **Descripción larga plegable** en la ficha (solo si es muy larga).
- Copia de seguridad previa a estos cambios: rama `backup-antes-de-imagenes`.

## Notas para quien siga desarrollando

- Movimiento solo con `transform` y `opacity`. Con `prefers-reduced-motion` o con la casilla de animaciones desactivada se ve una versión estática completa.
- Animaciones de la demo incluidas (solo `transform` y `opacity`, desactivables con la casilla de Efectos y con «reducir movimiento»): fondo espacial con planeta, anillo, luna y estrella fugaz; estática y rollo al cambiar de máquina en la pantalla CRT; apagado y encendido CRT al saltar Insert Coin; cartuchos que caen en las tarjetas; moneda que vuela a la cesta; esquinas parpadeantes en el selector de jugador; sprites que cruzan la portada.
- Faltan por diseño: sonido 8-bit, cursor de píxel, código Konami, disolución de píxeles al pasar el ratón (usa máscaras, no solo transform/opacity), predicción de búsqueda, recomendaciones de producto y planes de suscripción (selling plans).
- Los textos de la tienda están en `locales/es.default.json`. Los textos de los esquemas del editor están escritos en español directamente.
