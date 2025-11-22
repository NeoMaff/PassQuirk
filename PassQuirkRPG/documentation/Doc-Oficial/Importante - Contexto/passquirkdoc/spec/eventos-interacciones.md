# Eventos e Interacciones

## Manejador Principal
- `bot/events/interactionCreate.js` gestiona:
  - Slash: `isChatInputCommand`
  - Botones: `isButton`
  - Modales: `isModalSubmit`
  - Select Menus: `isStringSelectMenu`

## IDs Críticos
- Tutorial ElSabio: `tutorial_*` (crear, continuar, clase, reino, confirmar).
- Creador oficial: `class_*`, `kingdom_*`, `passquirk_selection`, `upload_avatar`, `default_avatar`, `skip_avatar`, `confirm_character`.

## Reglas
- Botones: usar `interaction.update`.
- Modales: `showModal` y luego `reply`/`followUp`.
- Select Menus: `update` o `reply` según contexto.