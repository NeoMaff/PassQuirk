## Objetivo
- Diseñar e implementar una base de datos completa y unificada para el bot PassQuirk RPG, reemplazando almacenamiento JSON y consolidando el uso de SQLite/Sequelize con opción a PostgreSQL (Neon/Supabase), manteniendo compatibilidad con discord.js v14 y Node.js v16.

## Tecnología
- ORM principal: Sequelize v6 sobre Node.js v16 (ya presente).
- Motor por defecto: SQLite local usando `bot/passquirk.db` (`src/database/connection.js:6-15`, `bot/config/database.js:6-15`).
- Opciones en producción: PostgreSQL (Neon `database/neon.js`) o Supabase (`database/supabase.js`).
- Selección por `.env`: `DB_PROVIDER=sqlite|neon|supabase` y variables específicas.

## Esquema de Datos (tablas principales)
- `users`: perfil Discord, economía, ajustes, cooldowns, logros. Ya modelado parcialmente en `bot/models/User.js:5-155`.
- `characters`: ficha RPG y progreso; 1–1 con `users`. Ya modelado parcialmente en `bot/models/Character.js:5-214`.
- `enemies`: catálogo de enemigos y atributos. Ya modelado en `bot/models/Enemy.js:5-185`.
- `inventories`: relación personaje–items (cantidad, equipamiento). Referenciado en scripts Neon (`database/setup-neon-tables.js:69-83`).
- `items`: catálogo maestro (nombre, tipo, rareza, stats, valor).
- `quests` y `character_quests`: misiones disponibles y progreso por personaje.
- `combats`: instancias de combate, estado, recompensas (`database/setup-neon-tables.js:86-103`).
- `explorations`: sesiones de exploración y eventos.
- `shops` y `transactions`: tienda, compras/ventas y auditoría económica.
- `zones`: regiones/zonas del mundo para spawn/dificultad.
- `game_logs`: auditoría de acciones (usado en Supabase `database/supabase.js:578-603`).

## Asociaciones
- `User` 1–1 `Character` (FK `characters.user_id`), ya esbozado en `bot/config/database.js:46-61`.
- `Character` 1–N `Inventory` (FK `inventories.character_id`).
- `Inventory` N–1 `Item` (FK `inventories.item_id` → `items.id`).
- `Combat` y `Exploration` N–1 `Character`.
- Índices: `users.discord_id`, `characters.user_id`, `inventories.character_id` (`database/setup-neon-tables.js:106-110`).

## Normalización y JSON
- Mantener campos complejos (equipamiento, resistencias, drops, stats) en JSON donde convenga, pero claves y relaciones en columnas para consultas eficientes.
- Homologar nombres y tipos entre `src/models/User.js` y `bot/models/User.js` (consolidación a un único modelo `User`).

## Capa de Acceso
- Crear una capa `DatabaseProvider` con adaptadores:
  - `SequelizeProvider` (SQLite/Postgres vía Sequelize) usando `src/database/connection.js` como instancia única.
  - `SupabaseProvider` y `NeonProvider` ya existen (`database/supabase.js`, `database/neon.js`).
- Unificar el `UserManager` actual basado en JSON (`bot/database/userManager.js`) hacia interfaz común (métodos `getUser`, `createUser`, `updateUser`, `createCharacter`, `addExperience`, `addItem`, etc.), con implementación que delega al provider elegido y un modo fallback JSON si `DB_PROVIDER` no está configurado.

## Migración de Datos
- Importar `bot/database/data/users.json` y `bot/data/players.json` a tablas `users`, `characters`, `inventories`.
- Script de migración: detecta proveedor y usa bulk insert con validaciones; registra errores.
- Mapeo de campos: conservar economía (`balance`, `gems`, `pg`), stats RPG, inventario y misiones.

## Seeds Iniciales
- Poblar `enemies` (ya en `bot/config/database.js:63-100`).
- Poblar `items` (pociones, armas base), `zones` (Akai, Say, Masai) y `shops`.
- Datos de prueba mínimos para `quests`.

## Variables de Entorno
- `DB_PROVIDER=sqlite|neon|supabase`.
- SQLite: `SQLITE_PATH=./bot/passquirk.db`.
- Neon: `NEON_DATABASE_URL`, `NEON_PROJECT_ID` (ya referidos en `database/neon.js:9-21`).
- Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (ya referidos en `database/supabase.js:9-11`).

## Integración con Comandos
- Los comandos en `src/commands/...` reciben `command.userManager` desde `bot/index.js:116-123`.
- Reemplazar/internamente `userManager` por el nuevo manager que usa DB sin cambiar la firma.
- Revisar comandos críticos: `character-creator.js`, `inventory.js`, `combate.js`, `explorar.js`, `tienda.js` para usar relaciones y transacciones.

## Verificación
- Pruebas unitarias mínimas para `User`/`Character` CRUD y economía.
- Comando de smoke test que crea usuario, personaje, añade item, inicia combate y persiste.
- Validar SQLite local y, si se configuran, ejecutar `database/setup-neon-tables.js` y pruebas con Neon/Supabase.

## Entregables
- Modelos Sequelize consolidados y asociaciones.
- Capa `DatabaseProvider` y `UserManager` unificado.
- Scripts de migración y seeds.
- Actualizaciones de comandos para persistencia.
- Guía `.env` y pasos de verificación.

## Notas de Compatibilidad
- Mantener compatibilidad Node v16; evitar APIs de Node 18.
- Conservar datos existentes; la migración no destruirá los archivos JSON y generará un reporte.

¿Confirmas este plan para proceder con la implementación y migración?