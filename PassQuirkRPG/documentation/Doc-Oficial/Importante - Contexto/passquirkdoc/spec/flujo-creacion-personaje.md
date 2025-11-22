# Creación de Personaje

## Objetivo
- Registrar identidad inicial del jugador con datos coherentes.

## Comando
- `/character-creator` con pasos guiados: Datos básicos → Clase → Reino → PassQuirk → Avatar → Confirmación.

## Datos
- `name` (2–20), `description` (≤200), `country`, `timezone`.
- `class` entre: Celestial, Fenix, Berserker, Inmortal, Demon, Sombra.
- `kingdom`: Akai, Say, Masai.
- `passquirk`: compatible con clase.
- `avatarUrl`: opcional (URL o por defecto).

## Validaciones
- Nombres válidos, longitudes y compatibilidades.
- Para botones: usar `interaction.update`.
- Para modales: `reply` o `showModal` seguido de `reply`.

## Persistencia
- Crear `User` si falta; marcar `hasCharacter=true`.
- Crear `Character` con enums de clase y región y stats base.

## Resultados
- Mostrar embed de éxito y ofrecer tutorial de combate o Space Central.