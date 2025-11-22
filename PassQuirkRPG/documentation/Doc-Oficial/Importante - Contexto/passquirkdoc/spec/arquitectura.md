# Arquitectura del Bot PassQuirk RPG

## Visión General
- Cliente `discord.js` v14 con intents: `Guilds`, `GuildMessages`, `MessageContent`, `GuildMessageReactions`, `DirectMessages`, `GuildVoiceStates`.
- Punto de entrada: `bot/index.js` carga comandos desde `src/commands` y eventos desde `bot/events`.
- Manejador principal: `bot/events/interactionCreate.js` gestiona `slash`, `botones`, `modales`, `select menus`.
- Sistemas de juego: combate, exploración, inventario, quirks, tienda, diálogos, tutorial (ElSabio).
- Persistencia: SQLite (Sequelize). Opcional: Supabase a través de adaptador.

## Estructura de Carpetas
- `bot/` núcleo del runtime del bot (config, events, models, systems, utils).
- `src/commands/` comandos slash organizados por categorías.
- `documentation/` documentación oficial y diseño.

## Carga de Comandos
- Validación de estructura `{ data, execute }` y nombres únicos.
- Registro:
  - Desarrollo: por-gremio con `CLIENT_ID` y `GUILD_ID`.
  - Producción: global con `CLIENT_ID`.

## Flujo de Interacciones
- Slash → `execute()`.
- Botón → `interactionCreate` enruta por `customId`.
- Modal → `interactionCreate` procesa por `customId`.
- Select → `interactionCreate` procesa por `customId`.

## Estados y Dependencias
- `client` almacena managers: `userManager`, `dialogueManager`, `gameManager`.
- Cooldowns y estado de juego encapsulados en utilidades.