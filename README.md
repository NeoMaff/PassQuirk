# 🐉 PassQuirk RPG Bot

Un bot de Discord RPG interactivo con sistema completo de personajes, combate por turnos, economía y progresión.

## ✨ Características

- 🎮 **Sistema de Tutorial Interactivo** - Guía paso a paso para nuevos jugadores
- 👤 **Creación de Personajes** - 4 clases únicas con estadísticas y habilidades propias
- ⚔️ **Sistema de Combate** - Combate por turnos estilo RPG clásico
- 📊 **Sistema de Progresión** - Niveles, experiencia y mejoras de estadísticas
- 💰 **Economía** - PassCoins, Gemas y Puntos de Guerra
- 🎒 **Inventario y Equipo** - Sistema completo de objetos y equipamiento
- 🌍 **Mundo Expansivo** - Tres reinos únicos para explorar

## 🚀 Instalación

### Requisitos Previos

- Node.js 16.9.0 o superior
- MongoDB (local o Atlas)
- Una aplicación de Discord Bot

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd passquirk-rpg-bot
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   El archivo `.env` ya está configurado con:
   ```env
   DISCORD_TOKEN=MTM3OTQ2NjAzMjU5NDI5Mjg4OA.G57OCe.VMQS3giRx30zFIWgjiDlusi97eg8GbSuTK3UJU
   CLIENT_ID=1379466032594292888
   MONGODB_URI=mongodb://localhost:27017/passquirk
   ```

   **Importante:** Cambia `MONGODB_URI` si usas MongoDB Atlas u otra configuración.

4. **Iniciar MongoDB** (si usas MongoDB local)
   ```bash
   mongod
   ```

5. **Iniciar el bot**
   ```bash
   npm start
   ```

   Para desarrollo con auto-reload:
   ```bash
   npm run dev
   ```

## 📚 Comandos Disponibles

### Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `/tutorial` | Inicia el tutorial interactivo para nuevos jugadores |
| `/crearpersonaje` | Crea tu personaje y comienza tu aventura |
| `/personaje [usuario]` | Muestra información del personaje |
| `/ayuda` | Muestra la lista completa de comandos |

### Sistema de Clases

#### ⚔️ Guerrero
- **Enfoque:** Combate cuerpo a cuerpo y defensa
- **Habilidades:** Golpe Poderoso, Defensa Férrea, Grito de Guerra
- **Estadísticas:** Alta Fuerza y Constitución

#### 🔮 Mago
- **Enfoque:** Magia y daño a distancia
- **Habilidades:** Bola de Fuego, Rayo de Hielo, Escudo Arcano
- **Estadísticas:** Alta Inteligencia y Suerte

#### 🏹 Arquero
- **Enfoque:** Precisión y velocidad
- **Habilidades:** Disparo Rápido, Flecha Perforante, Trampa de Red
- **Estadísticas:** Alta Destreza

#### 🗡️ Ladrón
- **Enfoque:** Críticos y evasión
- **Habilidades:** Ataque Furtivo, Evasión, Robo
- **Estadísticas:** Alta Suerte y Destreza

## 🎨 Diseño de Embeds

El bot utiliza un sistema de embeds personalizado con colores temáticos:

- **Púrpura (#6C5CE7)** - Color principal del bot
- **Verde (#00B894)** - Mensajes de éxito y tienda
- **Rojo (#FF7675)** - Errores y alertas
- **Azul (#0984E3)** - Información y diálogos
- **Amarillo (#FDCB6E)** - Advertencias y economía

Cada clase tiene su propio color:
- **Guerrero:** Rojo (#FF6B6B)
- **Mago:** Azul turquesa (#4ECDC4)
- **Arquero:** Verde menta (#95E1D3)
- **Ladrón:** Rojo coral (#F38181)

## 🗂️ Estructura del Proyecto

```
passquirk-rpg-bot/
├── bot/
│   ├── commands/          # Comandos slash
│   │   ├── tutorial.js
│   │   ├── crearpersonaje.js
│   │   ├── personaje.js
│   │   └── ayuda.js
│   ├── events/            # Eventos de Discord
│   │   ├── ready.js
│   │   └── interactionCreate.js
│   ├── models/            # Modelos de MongoDB
│   │   └── User.js
│   ├── utils/             # Utilidades
│   │   ├── embedStyles.js
│   │   └── helpers.js
│   └── index.js           # Punto de entrada
├── Doc Oficial/           # Documentación del juego
├── .env                   # Variables de entorno
├── package.json
└── README.md
```

## 🎯 Flujo de Juego

1. **Nuevo Jugador**
   - Ejecuta `/tutorial` para aprender los conceptos básicos
   - Completa el tutorial interactivo con El Sabio
   - Derrota al Slime de Tutorial

2. **Creación de Personaje**
   - Ejecuta `/crearpersonaje`
   - Elige nombre, género y clase
   - Confirma tu selección
   - ¡Comienza tu aventura!

3. **Progresión**
   - Explora el mundo
   - Completa misiones
   - Derrota enemigos
   - Sube de nivel
   - Mejora tu equipo

## 🔧 Configuración Adicional

### MongoDB Atlas (Recomendado para Producción)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Obtén tu connection string
4. Actualiza `MONGODB_URI` en `.env`:
   ```env
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/passquirk
   ```

### Permisos del Bot

El bot necesita los siguientes permisos:
- Send Messages
- Embed Links
- Read Message History
- Use Slash Commands
- Add Reactions

Intents requeridos:
- Guilds
- Guild Messages
- Message Content
- Guild Voice States

## 📖 Documentación Completa

Consulta la documentación completa en:
- `Doc Oficial/PassQuirk RPG - Documentación Oficial.md`
- `PassQuirkRPG_Esquema_Completo.txt`

## 🐛 Solución de Problemas

### El bot no responde a comandos

1. Verifica que el token sea correcto en `.env`
2. Asegúrate de que el bot tenga los permisos necesarios
3. Revisa que los comandos estén registrados (el bot lo hace automáticamente al iniciar)

### Error de conexión a MongoDB

1. Verifica que MongoDB esté ejecutándose
2. Comprueba la URI de conexión en `.env`
3. Asegúrate de que tu IP esté en la whitelist (si usas Atlas)

### Los botones/modales no funcionan

1. Verifica que `interactionCreate.js` esté cargado correctamente
2. Revisa la consola para errores específicos
3. Asegúrate de que el bot tenga permisos para enviar embeds y usar componentes

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 👥 Autores

- **PassQuirk Team** - Desarrollo inicial

## 🙏 Agradecimientos

- Comunidad de Discord.js
- Inspiración de RPGs clásicos como Pokémon y Final Fantasy
- Todos los beta testers y contribuidores

---

**¡Que tu aventura en PassQuirk esté llena de gloria y fortuna!** 🐉✨
