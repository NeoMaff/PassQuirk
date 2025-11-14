# 🚀 PassQuirk RPG Bot - Guía de Instalación

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (v16.9.0 o superior)
   ```bash
   node --version  # Debe mostrar v16.9.0 o superior
   ```

2. **MongoDB** (v4.4 o superior)
   - Puedes usar MongoDB local o MongoDB Atlas (nube)
   - Para MongoDB local: https://www.mongodb.com/try/download/community
   - Para MongoDB Atlas: https://www.mongodb.com/cloud/atlas

3. **Git** (para clonar el repositorio)
   ```bash
   git --version
   ```

## 🤖 Configurar el Bot de Discord

1. Ve a https://discord.com/developers/applications
2. Haz clic en "New Application"
3. Dale un nombre (ej: "PassQuirk RPG")
4. Ve a la sección "Bot" en el menú lateral
5. Haz clic en "Add Bot"
6. En la sección "Privileged Gateway Intents", activa:
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
   - ✅ PRESENCE INTENT
7. Copia el **Token** del bot (necesario para `.env`)
8. Ve a "OAuth2" → "General"
9. Copia el **Application ID** (necesario para `.env`)

## 📥 Instalación del Bot

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd passquirk-rpg
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Discord Bot Configuration
DISCORD_TOKEN=tu_token_del_bot_aqui
CLIENT_ID=tu_client_id_aqui

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/passquirk-rpg

# Bot Configuration (opcional, ya tienen valores por defecto)
PREFIX=!
DEFAULT_COOLDOWN=3000
MAX_INVENTORY_SIZE=100

# Economy Configuration (opcional)
STARTING_BALANCE=1000
STARTING_GEMS=0
WORK_COOLDOWN=3600000
DAILY_COOLDOWN=86400000
WORK_MIN_REWARD=100
WORK_MAX_REWARD=500
DAILY_MIN_REWARD=500
DAILY_MAX_REWARD=1000

# Game Configuration (opcional)
MAX_LEVEL=100
BASE_XP_REQUIRED=1000
XP_MULTIPLIER=1.5
COMBAT_TIMEOUT=300000

# Development
NODE_ENV=development
DEBUG=false
```

### 4. Invitar el Bot a tu Servidor

1. Ve a https://discord.com/developers/applications
2. Selecciona tu aplicación
3. Ve a "OAuth2" → "URL Generator"
4. Selecciona los siguientes **scopes**:
   - ✅ `bot`
   - ✅ `applications.commands`
5. Selecciona los siguientes **permisos de bot**:
   - ✅ Send Messages
   - ✅ Send Messages in Threads
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Use External Emojis
   - ✅ Add Reactions
   - ✅ Use Slash Commands
6. Copia la URL generada y ábrela en tu navegador
7. Selecciona el servidor donde quieres añadir el bot
8. Autoriza los permisos

## ▶️ Iniciar el Bot

### Modo Producción

```bash
npm start
```

### Modo Desarrollo (con auto-reinicio)

```bash
npm run dev
```

Si todo está configurado correctamente, verás:

```
✅ Conectado a MongoDB
✅ Comando cargado: start
✅ Comando cargado: personaje
✅ Comando cargado: explorar
✅ Comando cargado: inventario
✅ Comando cargado: ayuda
... (más comandos)
✅ PassQuirkRPGBot está en línea.
🔁 Actualizando comandos de aplicación (/).
✅ Comandos de aplicación (/) actualizados.
```

## 🧪 Probar el Bot

Una vez que el bot esté en línea:

1. Ve a tu servidor de Discord
2. Escribe `/` para ver los comandos slash disponibles
3. Prueba con `/start` para crear tu primer personaje
4. Usa `/ayuda` para ver todos los comandos disponibles

## ⚠️ Solución de Problemas

### El bot no se conecta a Discord

- Verifica que el `DISCORD_TOKEN` en `.env` sea correcto
- Asegúrate de que el token no tenga espacios adicionales
- Verifica que los intents estén activados en el Discord Developer Portal

### Error de conexión a MongoDB

- Si usas MongoDB local, asegúrate de que esté corriendo:
  ```bash
  # En Windows (si MongoDB está instalado como servicio)
  net start MongoDB

  # En Mac/Linux
  sudo systemctl start mongod
  ```
- Si usas MongoDB Atlas, verifica que la URL de conexión sea correcta
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas

### Los comandos slash no aparecen

- Espera unos minutos (Discord puede tardar en actualizar los comandos)
- Verifica que `CLIENT_ID` en `.env` sea correcto
- Asegúrate de que el bot tenga permisos para usar comandos slash en tu servidor
- Intenta reiniciar Discord

### El bot se conecta pero los comandos no funcionan

- Verifica los logs en la consola para ver errores específicos
- Asegúrate de que MongoDB esté conectado
- Verifica que todas las dependencias estén instaladas (`npm install`)

## 📊 Verificar Estado de MongoDB

### MongoDB Local

```bash
# Conectar a MongoDB
mongosh

# Ver bases de datos
show dbs

# Usar la base de datos de PassQuirk
use passquirk-rpg

# Ver colecciones
show collections

# Ver usuarios (ejemplo)
db.users.find()
```

### MongoDB Atlas

1. Ve a https://cloud.mongodb.com
2. Selecciona tu cluster
3. Haz clic en "Browse Collections"
4. Navega a la base de datos `passquirk-rpg`

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real (modo desarrollo)
npm run dev

# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar sintaxis de código
npm run lint  # (si tienes ESLint configurado)
```

## 📝 Próximos Pasos

Una vez que el bot esté funcionando:

1. **Personaliza el bot**:
   - Edita los valores en `.env` para ajustar la economía
   - Modifica `bot/utils/gameData.js` para añadir más clases, enemigos o items

2. **Añade más contenido**:
   - Crea nuevas misiones en la base de datos
   - Añade más regiones y zonas
   - Crea eventos especiales

3. **Mejora el bot**:
   - Implementa el sistema de combate completo
   - Añade más comandos
   - Crea una interfaz web

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs de la consola
2. Verifica que todas las configuraciones sean correctas
3. Consulta la documentación oficial de Discord.js: https://discord.js.org
4. Revisa los issues en GitHub

## 📚 Recursos Adicionales

- [Discord.js Guide](https://discordjs.guide/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Discord Developer Portal](https://discord.com/developers/docs/)

---

**¡Listo! Tu bot PassQuirk RPG debería estar funcionando ahora. ¡Disfruta!** 🎮🐉
