# PassQuirk RPG Bot 🎮

Bot oficial de Discord para PassQuirk RPG - Un juego de rol épico con sistema de combate, exploración, PassQuirks y más.

## 🌟 Características Principales

### 🎯 Sistemas del Juego
- **Sistema de Personajes**: Creación completa con clases únicas
- **Sistema de PassQuirks**: 11 PassQuirks únicos con poderes especiales
- **Sistema de Combate**: Batallas por turnos estilo Pokémon
- **Sistema de Exploración**: Explora los 3 reinos principales
- **Sistema de Inventario**: Gestión de objetos y equipamiento
- **Sistema de Tienda**: Compra objetos con PassCoins
- **Sistema de Gachapón**: Consigue ítems raros y quirks
- **Sistema de Tiempo**: Ciclos día/noche con eventos especiales

### 🏰 Los 3 Reinos de PassQuirk
- **🔴 Akai** - Reino de la fuerza, la guerra y la resistencia
- **🟢 Say** - Reino de la magia, el conocimiento y lo ancestral  
- **🟡 Masai** - Reino del comercio, la alquimia y la diplomacia

### 🏹 Clases Disponibles
| Clase | Emoji | Descripción |
|-------|-------|-------------|
| **Celestial** | 🪽 | Ser de luz con habilidades curativas y ataques sagrados de área |
| **Fénix** | 🔥 | Renace tras ser derrotado; domina el fuego y el resurgir explosivo |
| **Berserker** | ⚔️ | Guerrero desatado con fuerza bruta creciente cuanto más daño recibe |
| **Inmortal** | ☠️ | No puede morir fácilmente; regenera y resiste efectos mortales |
| **Demon** | 👹 | Poder oscuro, drenaje de vida y habilidades infernales |
| **Sombra** | ⚔️🌀 | Ninja silencioso y letal; experto en clones, humo y ataques críticos |

### 🌟 PassQuirks Oficiales
| Nº | PassQuirk | Poder | Clases Compatibles |
|----|-----------|-------|--------------------|
| 1 | **Fénix** | Potencia habilidades de regeneración y fuego | 🧙‍♂️ Mago, 🛡️ Guerrero |
| 2 | **Vendaval** | Otorga velocidad extrema y control del viento | 🏹 Arquero, 🥷 Ninja |
| 3 | **Tierra** | Control masivo de rocas y tierra | ⚔️ Espadachín, 🛡️ Guerrero |
| 4 | **Oscuridad** | Absorbe luz, permite invisibilidad | 🥷 Ninja, 🧙‍♂️ Mago |
| 5 | **Bestia** | Fuerza y resistencia física extremas | 🛡️ Guerrero, ⚔️ Espadachín |
| 6 | **Trueno** | Control de rayos y velocidad mejorada | 🏹 Arquero, 🧙‍♂️ Mago |
| 7 | **Dragón** | Fuerza y defensa dracónica | 🛡️ Guerrero, ⚔️ Espadachín |
| 8 | **Agua** | Control de agua y curación de aliados | 🧙‍♂️ Mago, 🏹 Arquero |
| 9 | **Vacío** | Control gravitacional y manipulación del espacio | 🥷 Ninja, 🧙‍♂️ Mago |
| 10 | **Caos** | Poder inestable capaz de causar destrucción masiva | 🔓 **Universal** |
| 11 | **Luz** | Energía brillante pero inestable, riesgo de volverse contra su portador | 🔓 **Universal** |

## 🚀 Instalación

### Prerrequisitos
- Node.js 16.0.0 o superior
- Una aplicación de Discord Bot
- Token de bot de Discord

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone [repositorio]
   cd PassQuirkRPG/bot
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Copia `.env.example` a `.env` y configura:
   ```env
   DISCORD_TOKEN=tu_token_de_bot_aqui
   CLIENT_ID=id_de_tu_aplicacion
   GUILD_ID=id_de_tu_servidor_de_prueba
   NODE_ENV=development
   ```

4. **Despliega los comandos**
   ```bash
   node deploy-commands.js
   ```

5. **Inicia el bot**
   ```bash
   node index.js
   ```

## 🎮 Comandos del Bot

### 🐉 Comando Principal
- `/passquirkrpg` - **Punto de inicio único del juego**. Muestra botón "Iniciar Aventura" y enlaza al tutorial

### 👤 Gestión de Personaje
- `/personaje` - Muestra el perfil completo: nivel, quirk, clase, estadísticas, historia, imagen

### ⚔️ Combate y Exploración
- `/explorar` - Inicia la exploración por regiones. Puede generar eventos o enemigos
- `/mapa` - Muestra el mapa completo con áreas desbloqueadas y clasificadas por dificultad

### 🏋️ Entrenamiento y Mejoras
- `/entrenamiento` - Mejora stats como fuerza, agilidad, resistencia y estrategia

### 🛒 Economía y Objetos
- `/tienda` - Abre la tienda para comprar objetos usando PassCoins
- `/inventario` - Muestra los objetos que posee el jugador (pociones, armas, gemas, etc.)
- `/gachapon` - Usa el gachapón para conseguir ítems raros o nuevos quirks
- `/balance [usuario]` - Muestra tu saldo (monedas 🪙, gemas 💎, PG ✨)

### 📚 Ayuda y Información
- `/ayuda [categoria]` - Lista de todos los comandos del juego y su función
- `/comandos` - Panel interactivo de comandos con menús desplegables

### 🔒 Administración (Solo Administradores)
- `/admin` - Navegación libre: saltar tutorial, retroceder zonas, editar estados
- `/configuracion` - Panel principal de configuración del servidor
- `/configurar-tiempo` - Configura canales de tiempo automáticos
- `/cambiar-zona` - Cambia la zona horaria de los canales de tiempo

## 🎯 Tutorial del Juego

### 📖 Flujo del Tutorial
1. **Inicio**: Comando `/passquirkrpg` muestra embed con botón "Iniciar Aventura"
2. **Guía de ElSabio**: NPC 🧙‍♂️ guía la creación del personaje paso a paso
3. **Creación de Personaje**: Nombre, avatar, descripción, clase y reino
4. **Tutorial de Combate**: Combate por turnos contra Slime Verde 🧪
5. **Quirk Inicial**: Recibe un Quirk común aleatorio
6. **Space Central**: Ciudad base donde termina el tutorial

### 🗡️ Sistema de Combate
- **Estilo Pokémon**: Combate por turnos
- **Opciones**: Atacar, Defender, Usar objetos
- **Visual**: Barras de vida, daño visual, botones embellecidos
- **Ataque Final**: Movimiento especial para terminar combates

## 🏗️ Estructura del Proyecto

```
bot/
├── commands/           # Comandos slash del bot
├── config/             # Configuración del bot
├── core/               # Sistemas principales
├── data/               # Gestión de datos de jugadores
├── database/           # Sistema de base de datos
├── events/             # Eventos de Discord.js
├── models/             # Modelos de datos
├── systems/            # Sistemas del juego (combate, exploración, etc.)
├── utils/              # Utilidades y helpers
├── index.js            # Archivo principal del bot
├── deploy-commands.js  # Script para desplegar comandos
└── package.json        # Dependencias y scripts
```

## ⚙️ Sistemas del Juego

### 🕐 Sistema de Tiempo
- Ciclos día/noche configurables (ej: 24 minutos = 24 horas reales)
- Eventos programados en momentos específicos
- Reloj interno que controla aparición de enemigos y drops raros

### 💸 Sistema de Economía
- **PassCoins**: Moneda principal del juego
- **Gachapón**: Sistema aleatorio para conseguir objetos raros
- **Comercio**: Compra/venta en tiendas y con NPCs
- **Recompensas**: Por misiones, exploración y combates

### 🗺️ Sistema de Exploración
- **Zonas Diversas**: Diferentes áreas con enemigos únicos
- **Encuentros Aleatorios**: Eventos según nivel y zona
- **Drops y Cofres**: Sistema de recompensas basado en rareza
- **Interacción con NPCs**: Pistas, objetos y misiones

### ✨ Sistema de Quirks
- **Poder Base**: Cada Quirk tiene poder numérico
- **Escalado**: Crece con nivel y mejoras
- **Bonificaciones**: PassQuirks añaden multiplicadores
- **Rareza**: Define poder inicial y velocidad de crecimiento

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Bot no responde**
   - Verifica que el token sea correcto en `.env`
   - Asegúrate de que el bot tenga permisos en el servidor

2. **Comandos no aparecen**
   - Ejecuta `node deploy-commands.js`
   - Verifica CLIENT_ID y GUILD_ID en `.env`

3. **Errores de módulos**
   - Ejecuta `npm install` para instalar dependencias
   - Verifica que Node.js sea versión 16 o superior

### Testing

El proyecto incluye scripts de testing:
- `node test-modules.js` - Verifica carga de módulos
- `node test-token.js` - Verifica conexión del bot

## 📝 Desarrollo

### Añadir Nuevos Comandos

1. Crea archivo en `commands/`
2. Usa la estructura estándar de Discord.js v14
3. Implementa `data` y `execute`
4. Redespliega comandos con `deploy-commands.js`

### Estructura de Comando

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('micomando')
        .setDescription('Descripción del comando'),
    
    async execute(interaction) {
        // Lógica del comando
        await interaction.reply('¡Comando ejecutado!');
    }
};
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

**Importante**: Siempre usar los datos oficiales de la documentación en `documentation/Doc-Oficial/Importante - Contexto/passquirkdoc/`

---

**¡Bienvenido al mundo de PassQuirk RPG!** 🎮✨

*"No eres un invitado. Eres el protagonista."* - ElSabio 🧙‍♂️