## Objetivo
- Unificar y aplicar un sistema de diseño de embeds consistente, con color amarillo predominante, en todos los comandos y flujos del bot, alineado con las referencias visuales en `documentation/Doc-Oficial/Imagenes - Diseño`.

## Hallazgos del código actual
- Existe un sistema avanzado de estilos en `bot/utils/embedStyles.js` (clases `PassQuirkEmbed`, `DialogEmbed`, `ShopEmbed`, `InventoryEmbed`, `ProfileEmbed`, `ErrorEmbed`, `SuccessEmbed`, `MenuEmbed`, `BattleEmbed`, `NotificationEmbed`, `ItemEmbed`) ya orientado a amarillo (`COLORS.PRIMARY='#FFFF00'`).
- En `src/utils/embedStyles.js` hay otro sistema con paleta distinta (no amarillo) y builders oficiales (`OfficialEmbedBuilder`, botones y selects), que se usa en varios comandos.
- Comandos actuales (ejemplos) usan `EmbedBuilder` directo y paletas de `COLORS.SYSTEM` no amarillas, p. ej.: `src/commands/slash/functional/general/perfil.js` y `src/commands/slash/functional/general/tienda.js`.

## Línea de diseño (amarillo)
- Color base: `#FFFF00` para embeds generales; acentos por estado (`SUCCESS`, `WARNING`, `DANGER`, `INFO`) desde `bot/utils/embedStyles.js:6–49`.
- Footer unificado con sello del juego y timestamp (`PassQuirkEmbed` ya lo aplica: `bot/utils/embedStyles.js:123–133`).
- Tipografía visual por secciones: uso de emojis oficiales y campos compactos (`addStatsField`, `addProgressField`).

## Mapeo con referencias visuales
- Lucha: `Diseño - Lucha.png` y `Refencia en el diseño de lucha...gif` → usar `BattleEmbed` con barras de HP/MP y bloque jugador vs enemigo.
- Tienda: `Diseño - Items Tienda.png` y `Diseño para la tienda...png` → `ShopEmbed` con categorías, ofertas y monedas.
- Diálogos y Exploración: `Diseño - Dialogos y Exploración.png` y `Referencia - Mapa...png` → `DialogEmbed` + `MenuEmbed` con opciones de respuesta y miniaturas.
- Inventario y Perfil: `Diseño del Personaje...png` → `InventoryEmbed` y `ProfileEmbed` mostrando estadísticas, economía y logros.
- Búsqueda/Sistemas: `Diseño del sistema de busqueda.png` → `MenuEmbed` con opciones filtradas y progresos.

## Unificación técnica
- Adoptar `bot/utils/embedStyles.js` como sistema canónico de UI.
- Mantener utilidades de componentes (botones/selects) de `src/utils/embedStyles.js` donde aporte valor, pero alinear colores a amarillo al usarlas.
- Exportar y reutilizar clases de `embedStyles` en todos los comandos de `src/commands` para evitar `EmbedBuilder` directo.

## Adaptación por comandos (ejemplos representativos)
- `perfil.js` → `ProfileEmbed` con color por nivel y progreso (`bot/utils/embedStyles.js:407–523`).
- `tienda.js` → `ShopEmbed` con agrupación por categoría y monedas (`bot/utils/embedStyles.js:263–350`).
- `combate.js` → `BattleEmbed` con estado, última acción y barras (`bot/utils/embedStyles.js:603–666`).
- `inventario.js` → `InventoryEmbed` agrupado por tipo y estadísticas (`bot/utils/embedStyles.js:353–403`).
- `explorar.js` / `ayuda.js` → `MenuEmbed` con opciones y miniaturas.
- `character-creator.js` → `MenuEmbed` + botones estándar, manteniendo el tema amarillo.

## Gestión de assets
- Usar `setThumbnail`/`setImage` con archivos de `documentation/Doc-Oficial/Imagenes - Diseño` como referencia visual.
- Cuando corresponda, adjuntar imágenes locales como attachments (`embedGenerator` permite adjuntos: `bot/utils/embedGenerator.js:76–85`).

## Interacciones y componentes
- Botones y menús desde `src/utils/embedStyles.js` (clases oficiales) pero con color temático en el embed que acompaña.
- Estados de respuesta estandarizados con `SuccessEmbed` y `ErrorEmbed`.

## Verificación
- Ejecutar comandos clave y validar visualmente: tienda, perfil, combate, inventario, diálogos.
- Comprobar consistencia de color amarillo, footer y formato de campos.

## Entregables
- Refactor de comandos para construir embeds usando las clases de `bot/utils/embedStyles.js`.
- Ajustes mínimos donde los builders oficiales se mantengan (solo color/imágenes).
- Sin librerías nuevas; compatible con `discord.js v14` y Node.js v16.

¿Confirmas que avancemos con esta unificación y aplicación del diseño amarillo en todo el bot?