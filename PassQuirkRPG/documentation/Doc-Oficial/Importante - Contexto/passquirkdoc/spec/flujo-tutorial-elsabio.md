# Inicio con ElSabio

## Objetivo
- Dar la bienvenida y guiar al usuario en un tutorial narrativo inicial.

## Comando
- `/passquirkrpg` muestra la bienvenida de ElSabio y botones de acción.

## Estados
- `BIENVENIDA` → `CREANDO_PERSONAJE` → `NOMBRE_PERSONAJE` → `GENERO_PERSONAJE` → `HISTORIA_PERSONAJE` → `ELIGIENDO_CLASE` → `ELIGIENDO_REINO` → `EXPLICANDO_PASSQUIRKS` → `CONFIRMANDO_PERSONAJE` → `TUTORIAL_COMPLETADO`.

## Interacciones
- Botón `tutorial_crear_personaje` → transición a creación.
- Modal `tutorial_modal_nombre` → guarda nombre y avanza.
- Botones de clase/reino → avanzan con `interaction.update`.
- Confirmación final → crea personaje y lleva a Space Central.

## Reglas
- Usar `interaction.update` en botones para actualizar el mensaje.
- Verificar si el usuario ya tiene personaje y redirigir a Space Central.