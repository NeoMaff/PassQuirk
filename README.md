# 🐉 PassQuirk RPG - Bot de Discord

Un completo bot de RPG para Discord con sistema de combate por turnos, exploración, economía y mucho más.

## 🌟 Características

- **Sistema de Personajes**: Crea tu personaje eligiendo entre 5 clases únicas
- **Combate por Turnos**: Sistema de combate táctico estilo Pokémon
- **Exploración Dinámica**: Explora diferentes regiones y encuentra enemigos, tesoros y misiones
- **Sistema de Clima y Tiempo**: El clima y la hora del día afectan la jugabilidad
- **Economía**: Gana dinero, compra objetos y mejora tu equipo
- **Gremios**: Únete o crea gremios con otros jugadores
- **Misiones**: Completa misiones para ganar recompensas
- **Sistema de Niveles**: Sube de nivel y mejora tus estadísticas

## 📋 Requisitos

- Node.js 16.9.0 o superior
- MongoDB 4.4 o superior
- Una aplicación de Discord Bot configurada

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd passquirk-rpg
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia `.env.example` a `.env`
   - Completa las variables necesarias:

```env
DISCORD_TOKEN=tu_token_de_bot
CLIENT_ID=tu_client_id
MONGODB_URI=mongodb://localhost:27017/passquirk-rpg
```

4. Inicia el bot:
```bash
npm start
```

Para desarrollo con auto-reinicio:
```bash
npm run dev
```

## 🎮 Comandos Principales

### Personaje
- `/start` - Crea tu personaje e inicia tu aventura
- `/personaje` - Ver tu perfil y estadísticas
- `/inventario` - Ver tu inventario de objetos

### Aventura
- `/explorar` - Explora el mundo en busca de aventuras
- `/combate` - Inicia un combate
- `/misiones` - Ver misiones disponibles

### Economía
- `/balance` - Ver tu dinero
- `/work` - Trabaja para ganar dinero
- `/shop` - Ver la tienda
- `/daily` - Reclamar recompensa diaria

### Gremios
- `/guild create` - Crear un gremio
- `/guild info` - Ver información del gremio
- `/guild join` - Unirse a un gremio

## 🏗️ Estructura del Proyecto

```
passquirk-rpg/
├── bot/
│   ├── commands/         # Comandos de slash
│   │   ├── character/    # Comandos de personaje
│   │   ├── adventure/    # Comandos de aventura
│   │   ├── economy/      # Comandos de economía
│   │   └── rpg/          # Comandos generales de RPG
│   ├── events/           # Eventos de Discord
│   ├── handlers/         # Manejadores de interacciones
│   ├── models/           # Modelos de MongoDB
│   │   ├── Character.js  # Modelo de personaje
│   │   ├── User.js       # Modelo de usuario
│   │   ├── Combat.js     # Modelo de combate
│   │   ├── Guild.js      # Modelo de gremio
│   │   ├── Item.js       # Modelo de objetos
│   │   └── Quest.js      # Modelo de misiones
│   ├── utils/            # Utilidades
│   │   ├── embedStyles.js         # Estilos de embeds
│   │   ├── gameStateManager.js    # Gestor de estados
│   │   ├── timeWeatherSystem.js   # Sistema de tiempo y clima
│   │   └── gameData.js            # Datos del juego (clases, enemigos, etc.)
│   └── index.js          # Punto de entrada
├── web/                  # Interfaz web (futuro)
├── .env.example          # Plantilla de variables de entorno
├── package.json          # Dependencias
└── README.md             # Este archivo
```

## 🎭 Clases Disponibles

### ⚔️ Guerrero
- **Enfoque**: Defensa y daño cuerpo a cuerpo
- **Pasiva**: Voluntad de Hierro (+10% HP, +15% Defensa)
- **Habilidades**: Tajo, Defender, Golpe Poderoso

### 🔮 Mago
- **Enfoque**: Daño mágico a distancia
- **Pasiva**: Maestría Arcana (+20% Poder Mágico, +10% Maná)
- **Habilidades**: Bola de Fuego, Escudo Mágico, Explosión de Maná

### 🏹 Arquero
- **Enfoque**: Daño a distancia y precisión
- **Pasiva**: Ojo de Águila (+15% Precisión, +10% Crítico)
- **Habilidades**: Disparo Rápido, Disparo Certero, Lluvia de Flechas

### 🗡️ Ladrón
- **Enfoque**: Velocidad y críticos
- **Pasiva**: Golpe Crítico (+20% Prob. Crítica, +25% Daño Crítico)
- **Habilidades**: Apuñalar, Evadir, Robar

### 🥷 Ninja
- **Enfoque**: Velocidad y técnicas letales
- **Pasiva**: Velocidad Sombría (+25% Velocidad, +15% Evasión)
- **Habilidades**: Golpe Sombrío, Bomba de Humo, Shuriken

## 🌍 Regiones del Juego

### 🔴 Reino de Akai
- **Tema**: Fuego y combate
- **Niveles**: 1-15
- **Enemigos**: Slimes, Goblins, Lobos

### 🟢 Reino de Say
- **Tema**: Naturaleza y magia
- **Niveles**: 10-25
- **Enemigos**: Goblins, Esqueletos, Orcos

### 🟡 Reino de Masai
- **Tema**: Desierto y comercio
- **Niveles**: 15-30
- **Enemigos**: Orcos, Esqueletos, Dragones

## 📊 Sistema de Combate

El sistema de combate es por turnos con las siguientes características:

- **Puntos de Acción (PA)**: Cada turno tienes 5 PA máximo
- **Habilidades**: Cada habilidad consume PA y/o Maná
- **Estados Alterados**: Veneno, quemadura, congelación, etc.
- **Sistema de Turnos**: Basado en la velocidad de los participantes
- **Críticos**: Posibilidad de hacer daño crítico
- **Evasión**: Posibilidad de esquivar ataques

## 🌤️ Sistema de Tiempo y Clima

El juego cuenta con un sistema dinámico de tiempo y clima:

- **Periodos del Día**: Amanecer, Mañana, Mediodía, Tarde, Atardecer, Noche
- **Climas**: Soleado, Lluvia, Niebla, Tormenta, Nevada, Nublado, Ventoso
- **Efectos**: El clima y la hora afectan los encuentros, el loot y las bonificaciones

## 🔧 Desarrollo

### Scripts Disponibles

```bash
npm start       # Inicia el bot
npm run dev     # Modo desarrollo con nodemon
npm test        # Ejecuta tests (próximamente)
```

### Agregar Nuevos Comandos

1. Crea un archivo en `bot/commands/<categoría>/<comando>.js`
2. Sigue la estructura de comandos existente
3. El comando se cargará automáticamente al iniciar

### Agregar Nuevos Modelos

1. Crea un archivo en `bot/models/<Modelo>.js`
2. Define el schema de Mongoose
3. Exporta el modelo

## 📝 To-Do List

- [ ] Sistema de PvP
- [ ] Eventos especiales
- [ ] Más misiones y contenido
- [ ] Sistema de comercio entre jugadores
- [ ] Mazmorras cooperativas
- [ ] Interfaz web
- [ ] Sistema de logros avanzado
- [ ] Más regiones y enemigos

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- **PassQuirk Team** - *Desarrollo Inicial*

## 🙏 Agradecimientos

- Comunidad de Discord.js
- Contribuidores del proyecto
- Jugadores y testers

---

**¡Disfruta tu aventura en PassQuirk RPG!** 🐉
