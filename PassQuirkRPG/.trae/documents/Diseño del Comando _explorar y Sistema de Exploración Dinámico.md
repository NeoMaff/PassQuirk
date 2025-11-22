## Visión General
- Implementar `/explorar` como comando slash (discord.js v14) que abre un único embed dinámico con botones para continuar la exploración, ver historial y salir.
- La exploración genera eventos según zona, nivel, clima y periodo del día, y aplica tablas de rareza y drops definidas en la documentación.
- Integración con el sistema horario/clima existente y respeto a las restricciones (LOY, enemigos Caos/Celestial).

## Diagrama de Flujo (Texto)
- Usuario ejecuta `/explorar` → Validación de nivel y zona → Crear sesión → Mostrar Embed Inicial
- Usuario pulsa "Explorar" → Pipeline de Probabilidades → Selección de Evento
- Evento:
  - Nada → Registrar historial → Actualizar embed
  - Ítem/Cofre → Determinar tipo de cofre/ítem → Aplicar rareza → Registrar → Actualizar embed
  - Enemigo → Elegir enemigo por zona → Escalar nivel → Chequear LOY → Registrar → Actualizar embed
  - Quirk raro → Selección preliminar y vista previa → Registrar → Actualizar embed
- Usuario pulsa "Atrás" → Navegación por historial
- Usuario pulsa "Salir" o timeout → Cerrar sesión, desactivar componentes

## Diagrama de Estados de Sesión
- `idle` → `/explorar` → `active`
- `active`:
  - `waiting_input` (botones activos)
  - `rolling_event` (bloqueo temporal de spams)
  - `showing_result` (embed actualizado)
- `active` → `closed` (salir/manual/timeout)

## Pipeline de Generación de Encuentros
- Inputs: `zona`, `nivelJugador`, `clima`, `periodoDia`, `passquirksActivos`, `modificadores temporales`.
- Paso 1: Pesos base de evento (configurables), p.ej.: Nada 30, Ítem 25, Enemigo 30, Quirk 10, Tesoro 5.
- Paso 2: Modificadores:
  - Clima/periodo (según Sistemas - PassQuirk.txt):
    - Soleado: +enemigos fuego/desierto, +rareza en desierto
    - Lluvia: +agua/elementales, -arena
    - Niebla: +tesoros ocultos, +nada
    - Tormenta: +enemigos, +rareza global, -nada
    - Nevada: +raros en Montañas Heladas
  - Zona y dificultad (Mapa): habilita/pondera enemigos y cofres según progresión.
  - PassQuirks (Sistema de Quirks y PassQuirks): multiplicadores sobre daño/beneficios, y ligera mejora en hallar su elemento.
- Paso 3: Normalización de pesos y tirada (random ponderado).
- Paso 4: Resolución de evento:
  - Ítem/Cofre: aplicar tabla de `sistema-de-drops-y-cofres.md` y rarezas de `sistema-de-rarezas.md`.
  - Enemigo: elegir desde `enemigos.md` por zona; escalado de nivel; marcar restricciones LOY.
  - Quirk: vista previa con poder base y rareza de `sistema-de-quirks.md`.

## Reglas de Rareza y Drops
- Rareza global de objetos (`sistema-de-rarezas.md`): Común 40%, Raro 30%, Épico 20%, Legendario 9%, Mítico 1%.
- Cofres (`sistema-de-drops-y-cofres.md`):
  - Cofre Común: 80% común, 20% raro
  - Cofre Épico: 40% raro, 40% épico, 20% legendario
  - Enemigos normales: 70% común, 30% raro
  - Jefes de Mapa: siempre ≥ raro
  - Evento especial: configurable
- Ítems (`objetos.md`): pociones, armas/escudos, gemas, artefactos, LOY (con sus límites: no funciona contra Caos/Celestial; cooldown 72h y duración 10 minutos en combate).

## Integración con Tiempo/Clima
- Fuente: sistema horario/clima del proyecto (p.ej. `worldSystem`).
- Mostrar en el embed: hora local, fecha, periodo del día, clima actual.
- Modificadores de probabilidad aplicados en tiempo real.

## UI/UX del Embed
- Un único embed con:
  - Cabecera: Zona, nivel, clima, periodo del día.
  - Cuerpo: Último evento (emoji + título + descripción + rareza + efecto).
  - Pie: Contadores y resumen de hallazgos.
- Componentes:
  - Botón "Explorar" (primario)
  - Botón "Atrás" (secundario) para historial
  - Botón "Salir" (peligro)
- Políticas:
  - Solo el invocador puede interactuar
  - Timeout de 2–5 min; al expirar, deshabilitar botones

## Contratos y Estructuras de Datos
- `ExplorationSession`: `{ userId, zona, nivel, clima, periodo, history: Encounter[], lastInteractionAt, state }`
- `Encounter`: `{ type: 'nada'|'item'|'enemigo'|'quirk'|'tesoro', rarity?, payload, at }`
- `Item`: `{ nombre, tipo, rareza, efecto }` (de `objetos.md`)
- `Enemy`: `{ nombre, zona, nivelMinMax, rareza }` (de `enemigos.md`)
- `Quirk`: `{ nombre, poderBase, rareza, clasesCompatibles }` (de `sistema-de-quirks.md` y `passquirks.md`)
- `WeightsConfig`: `{ baseEventWeights, climateModifiers, zoneModifiers }`

## Seguridad y Concurrencia
- Bloqueo por usuario: una sesión activa por usuario/canal.
- Anti-spam: deshabilitar "Explorar" mientras se resuelve el evento (cooldown breve).
- Coleccionistas v14: `MessageComponentCollector` con filtros por `userId`.

## Validaciones
- Nivel vs zona (`mapa.md`): impedir zonas fuera de rango recomendado.
- LOY: cooldown 72h; ineficaz contra Caos/Celestial.
- Jefes: mostrar claramente rareza y peligro.

## Telemetría y Errores
- Contadores de sesiones, eventos y tasas de éxito (memoria temporal).
- Manejo de errores: respuestas ephemerals con mensajes breves; logs internos.

## Plan de Implementación
1. Definir `src/systems/exploration-system.js` con el motor de probabilidades y resolución de eventos.
2. Crear comando `src/commands/slash/rpg/explorar.js` con `SlashCommandBuilder`, opciones `zona` (opcional), y bootstrap de sesión.
3. Integrar tiempo/clima desde el sistema existente y reflejarlo en el embed.
4. Implementar botones y coleccionistas; navegación de historial.
5. Cargar tablas de enemigos (`enemigos.md`), rarezas, drops y objetos como constantes estructuradas.
6. Añadir reglas LOY y validaciones de zonas/nível.
7. Pruebas manuales: escenarios por clima, por zona y por nivel; verificación de rarezas.
8. Optimizar texto y visuales (emojis, separadores) sin cambiar la arquitectura.

## Entregables
- Comando `/explorar` funcional con embed único reactivo.
- Motor de exploración con probabilidades, rarezas y drops configurables.
- Integración de clima/periodo y restricciones documentadas.
- Sin tocar otros sistemas fuera del comando y su motor dedicado.

¿Confirmas este plan para proceder con la implementación exacta del comando `/explorar`? 