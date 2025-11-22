## Objetivo
Entregar un inicio pulido con ElSabio, un flujo robusto de creación de personaje y una base de datos funcional y unificada, todo sobre Discord.js v14 y Node.js v16.

## Arquitectura del Bot
- Unificar punto de entrada en `bot/index.js` usando `Client`, `GatewayIntentBits` y carga recursiva de comandos en `src/commands`.
- Mantener un único manejador de eventos en `bot/events/interactionCreate.js` y eliminar duplicados/legacy de `events/` raíz.
- Ajustar registro de comandos para desarrollo por-gremio con `Routes.applicationGuildCommands` y `GUILD_ID` y global para producción.
- Alinear entorno `.env` con `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`.

## Base de Datos (SQLite con Sequelize)
- Usar `bot/config/database.js` (Sequelize + SQLite `passquirk.db`) para sincronizar modelos.
- Modelos activos: `bot/models/User.js`, `bot/models/Character.js`, `bot/models/Enemy.js` con relaciones (`User.hasOne(Character)`).
- Poblar datos mínimos: enemigo Slime Verde (tutorial) ya definido en `database.js`.
- Establecer capa de acceso coherente: priorizar Sequelize; dejar `database/supabase.js` como opcional, detrás de un adaptador común.

## Inicio con ElSabio
- Slash `/passquirkrpg` muestra bienvenida e inicia tutorial de ElSabio con botones (IDs consistentes).
- Corregir errores en `systems/TutorialSabio.js`:
  - Variables de componentes: usar `rowReinos` donde corresponde y no `row` (ej. líneas 153 y 504).
  - Firma de creación de personaje: llamar `createCharacter(userId, characterData)` en vez de pasar un único objeto.
  - `handleInteraction` en `src/commands/.../passquirkrpg.js` debe enviar `customId` a `TutorialSabio.manejarInteraccion(interaction, customId)`.
- Integrar verificación de personaje previo con Sequelize: si existe, dirigir a Space Central.

## Creación de Personaje (flujo unificado)
- Mantener el comando `/character-creator` de `src/commands/.../character-creator.js` por su UX paso a paso.
- Unificar persistencia: reemplazar `interaction.client.playerDatabase` (JSON) por `User`/`Character` (Sequelize):
  - Verificar existencia con `Character.findOne({ where: { userId } })`.
  - Crear usuario si falta; crear personaje con stats base según clase y reino.
- Eventos de creación:
  - Mover/merge `src/events/characterCreatorHandler.js` al manejador de `bot/events/interactionCreate.js` para IDs: `class_*`, `kingdom_*`, `passquirk_selection`, `upload_avatar`, `default_avatar`, `skip_avatar`, `confirm_character`.
  - Mantener select menu para PassQuirks compatibles y modal de avatar.

## Registro de Comandos y Estados
- Validación de comandos existente en `bot/index.js` se mantiene (nombres, duplicados).
- Registro de comandos:
  - Desarrollo: `Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)`.
  - Producción: `Routes.applicationCommands(process.env.CLIENT_ID)`.

## Verificaciones y Pruebas
- Al iniciar: `connectDatabase()` en `bot/events/ready.js` crea/sincroniza tablas.
- Flujo `/passquirkrpg` → bienvenida ElSabio → crear personaje → Space Central.
- Flujo `/character-creator`: modal datos básicos → clase → reino → PassQuirk → avatar → confirmación → persistencia Sequelize.
- Revisar que los IDs de botones/menús estén cubiertos por `interactionCreate`.

## Cambios Concretos (referencias)
- `systems/TutorialSabio.js`:
  - Corregir retorno con `rowReinos` (ejecuta render de selección de reinos) y firma `createCharacter(userId, characterData)`.
  - Usar Sequelize cuando Supabase no esté configurado (consulta `User`/`Character`).
- `src/commands/.../passquirkrpg.js`: pasar `customId` a `manejarInteraccion`.
- `src/commands/.../character-creator.js`: sustituir `playerDb.createPlayer(newPlayer)` por persistencia Sequelize; verificar existencia con `Character`.
- `src/events/characterCreatorHandler.js`: integrar en `bot/events/interactionCreate.js` o registrar como evento cargado por `bot/index.js`.

## Entregables de esta fase
- Bienvenida de ElSabio estable y sin errores.
- Creación de personaje guardada en SQLite (`passquirk.db`) con relaciones y stats base.
- Space Central accesible tras creación con resumen del personaje.

## Siguientes fases (posteriores)
- Unificación completa de supabase/neon bajo interfaz `DatabaseProvider`.
- Revisión integral de comandos y estilos de embeds (documentación oficial).
- Migración opcional a TypeScript manteniendo compatibilidad Node 16.

¿Confirmas que proceda con estos cambios para implementar ElSabio, creación de personaje y BD unificada?