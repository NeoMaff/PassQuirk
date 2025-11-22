# 📋 DIAGRAMA DE FLUJO DEL TUTORIAL - PassQuirk RPG

## 🎯 Flujo Principal del Tutorial

### 1️⃣ INICIO ÚNICO
```
/passquirkrpg
    ↓
[EMBED VISUAL LLAMATIVO]
    ↓
🐲 Botón: "Iniciar Aventura" (amarillo brillante)
```

### 2️⃣ ACTIVACIÓN DEL TUTORIAL
```
Click en "Iniciar Aventura"
    ↓
Aparece ElSabio 🧙‍♂️
    ↓
[EMBED con imagen: NPC - ElSabio]
```

### 3️⃣ CREACIÓN DEL PERSONAJE (Guiado por ElSabio)

#### 3.1 Datos Básicos
```
ElSabio: Mensaje de bienvenida decorado
    ↓
Pregunta: Nombre del jugador
    ↓
[Input por botón]
    ↓
Pregunta: Apariencia del personaje
    ↓
[Opciones: Subir imagen | Generar con IA (pixelart)]
    ↓
Pregunta: Género
    ↓
[Botones de selección]
    ↓
Pregunta: Historia personal
    ↓
[Input de texto]
```

#### 3.2 Elección de Clase
```
ElSabio: "Elige tu clase"
    ↓
[5 BOTONES DE CLASE]
    ↓
🎯 Arquero
🥷 Ninja  
🗡️ Espadachín
🛡️ Guerrero
🧙‍♂️ Mago
```

#### 3.3 Elección de Reino/Región
```
ElSabio: "Elige tu reino inicial"
    ↓
[BOTONES DE REINO]
    ↓
🔴 Reino de Akai (fuerza, guerra, resistencia)
🟢 Reino de Say (magia, conocimiento, ancestral)
🟡 Reino de Masai (comercio, alquimia, diplomacia)
🌑 Bosque Misterioso
🕳️ Cueva Oscura
```

#### 3.4 Finalización de Creación
```
Guardar perfil del personaje
    ↓
ElSabio: "Tu personaje está listo"
    ↓
Avanzar al Tutorial de Combate
```

### 4️⃣ TUTORIAL DE COMBATE INTERACTIVO

#### 4.1 Preparación del Combate
```
ElSabio activa combate tutorial
    ↓
Enemigo: Slime Verde 🧪
    ↓
Jugador recibe:
- Quirk común aleatorio
- 1 habilidad desbloqueada (según clase elegida)
- Poción de vida en inventario
```

#### 4.2 Desarrollo del Combate (Estilo Pokémon por turnos)
```
=== TURNO 1 DEL JUGADOR ===
[EMBED de combate con barras de vida]
    ↓
[2 BOTONES]
⚔️ Atacar | 🛡️ Defender
    ↓
Jugador elige acción
    ↓
=== TURNO DEL ENEMIGO ===
Slime ataca automáticamente
    ↓
[Actualización visual del daño]
    ↓
=== INVENTARIO ===
[BOTÓN]
🧪 Usar poción de vida
    ↓
Jugador puede usar poción (opcional)
    ↓
=== TURNO 2 DEL JUGADOR ===
[BOTÓN]
💥 Ataque Final
    ↓
VICTORIA AUTOMÁTICA
```

#### 4.3 Elementos Visuales del Combate
```
- Barras de vida visual
- Efectos de daño
- Botones embellecidos
- Estilo por turnos
- Embeds que se actualizan
```

### 5️⃣ CIERRE DEL TUTORIAL

#### 5.1 Llegada a Space Central
```
Victoria contra Slime
    ↓
[EMBED DECORADO]
"¡Has completado el tutorial!"
    ↓
"Tu aventura comienza ahora desde Space Central"
    ↓
[Ciudad base del universo PassQuirk]
```

#### 5.2 Botones Finales
```
[3 BOTONES DISPONIBLES]
    ↓
👤 Crear Personaje (si no lo hizo antes)
🗺️ Explorar
❓ Ayuda
```

## 🎨 ESPECIFICACIONES TÉCNICAS

### Elementos Visuales Requeridos
- **Todos los mensajes**: Embeds decorados
- **Colores**: Amarillo predeterminado, rojo (peligro/batalla), verde (recompensas)
- **Emojis**: Solo emojis animados (nunca normales)
- **Interacción**: Solo botones (no texto libre)
- **Imágenes necesarias**: NPC - ElSabio

### Flujo de Datos
```
Datos del Personaje a Guardar:
- Nombre
- Imagen/Avatar
- Género
- Historia personal
- Clase elegida
- Reino inicial
- Quirk inicial aleatorio
- Estadísticas base según clase
- Ubicación: Space Central
```

### Estados del Tutorial
```
1. NO_INICIADO
2. CREANDO_PERSONAJE
3. ELIGIENDO_CLASE
4. ELIGIENDO_REINO
5. COMBATE_TUTORIAL
6. TUTORIAL_COMPLETADO
```

## 🚫 RESTRICCIONES IMPORTANTES

### Lo que NO debe hacer ElSabio:
- ❌ Contar la historia del mundo como autoayuda
- ❌ Explicar mecánicas complejas
- ❌ Dar información sobre PassQuirks
- ❌ Spoilers del juego
- ❌ No explicarle nada del mundo, solamente darle la bienvenido para se cree el personaje

### Lo que SÍ debe hacer ElSabio:
- ✅ Guiar la creación del personaje paso a paso
- ✅ Enseñar combate básico con ejemplo práctico
- ✅ Usar diálogos inspiradores pero concisos
- ✅ Permitir que el jugador explore y aprenda solo

## 🔄 FLUJOS ALTERNATIVOS

### Si el jugador ya tiene personaje:
```
/passquirkrpg
    ↓
[Detectar personaje existente]
    ↓
[EMBED]: "¡Bienvenido de vuelta!"
    ↓
[BOTONES]
🗺️ Continuar Aventura
👤 Ver Perfil
❓ Ayuda
```

### Si el jugador abandona el tutorial:
```
Guardar progreso actual
    ↓
Permitir retomar desde el último paso
    ↓
No reiniciar desde cero
```

---

**📝 Nota**: Este diagrama está basado en la documentación oficial del "📦 BotCompletoV1 - Documento Base" y debe implementarse exactamente como se especifica, sin agregar funcionalidades no documentadas.