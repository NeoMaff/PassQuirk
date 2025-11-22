## Objetivo
- Convertir `/explorar` en un comando rico con subcomandos, opciones avanzadas, validaciones y panel inicial detallado, sin tocar otros sistemas.

## Subcomandos y Opciones
- `iniciar` (por defecto): inicia exploración con configuración avanzada.
  - `zona` (string, choices): zonas existentes.
  - `objetivo` (string, choices): `equilibrado`, `buscar_cofre`, `buscar_enemigo`, `buscar_quirk`, `tesoro`.
  - `riesgo` (integer 1–5): ajusta dificultad percibida (solo informativo, sin modificar sistemas externos).
  - `max_eventos` (integer 1–10): límite sugerido del usuario (informativo y mostrado en embed).
  - `ephemeral` (boolean): respuestas ephemerals para privacidad inicial.
- `historial`: muestra resumen corto de últimas exploraciones del jugador (lee y presenta de `player.exploration` si existe).
- `preferencias`: guarda preferencias del usuario para futuras exploraciones dentro de `player.exploration.preferences` (solo lectura/escritura desde el comando).
- `resumen`: genera un panel de resumen del estado actual del mundo (hora local/global, clima) y tu zona actual.
- `abandonar`: finaliza una exploración activa del usuario si el sistema la tiene registrada (pedido al usuario, mensaje ephemera; sin tocar otros sistemas).

## Validaciones
- Verificación de jugador existente (perfil creado) y cooldown de exploración usando `TIME_CONFIG.COOLDOWNS.EXPLORATION`.
- Validación de nivel vs zona según los rangos del motor (`minLevel`/`maxLevel`) mostrando advertencias si estás fuera de recomendación.
- Reglas LOY (solo informativa): aviso cuando el enemigo sea de tipo Caos/Celestial no compatible con LOY, tal como documentado.

## Integraciones de Contexto
- `worldSystem`: mostrar hora local y global + clima actual en el panel inicial.
- `playerDB`: leer/escribir `player.exploration.preferences`, `currentZone`, y contadores básicos sin modificar otros sistemas.

## UI/UX del Panel Inicial
- Embed inicial antes de delegar al sistema de exploración:
  - Cabecera: zona seleccionada, riesgo, objetivo, max_eventos.
  - Contexto: hora local/global, clima.
  - Validaciones: nivel recomendado y avisos.
  - Botón de continuar indica que se iniciará la sesión del sistema.
- Tras el panel, se invoca `gameManager.systems.exploration.startExploration(...)` para mantener el flujo actual.

## Seguridad y Concurrencia
- Una sesión por usuario; si hay una activa, se ofrece `abandonar` y se evita iniciar otra.
- Ephemeral configurable en el panel inicial.

## Telemetría
- Contadores internos del comando (en memoria del proceso) para medir uso de subcomandos.
- Logs discretos en consola para diagnosis.

## Implementación (únicamente en `src/commands/slash/rpg/explorar.js`)
1. Expandir `SlashCommandBuilder` con subcomandos `iniciar`, `historial`, `preferencias`, `resumen`, `abandonar` y opciones descritas.
2. Resolver `zona` y preferencias del usuario; construir embed inicial con datos de `worldSystem`.
3. Validar cooldown y estado de sesión, y presentar UI ephemera si corresponde.
4. Delegar a `startExploration` cuando el usuario confirme o directamente tras el panel según `ephemeral`.
5. `historial`: leer y formatear últimos eventos/resúmenes si están en `player.exploration`.
6. `preferencias`: guardar en DB sin alterar otros sistemas.
7. `resumen`: construir embed de estado del mundo y zona actual.
8. `abandonar`: si existe exploración activa del usuario, mostrar mensaje informativo y/o guía (sin intentar cerrar sistemas externos).

## Entregable
- Comando `/explorar` mucho más complejo con subcomandos, opciones y panel informativo; todas las acciones confinadas al archivo del comando sin tocar nada más.

¿Confirmas que avance con esta ampliación del comando `/explorar` manteniendo cambios sólo en el propio archivo del slash command?