# ⚡ PassQuirk RPG - Quick Start Guide

## 🚀 Inicio Rápido (5 minutos)

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
nano .env  # o usa tu editor favorito
```

**Mínimo requerido en .env:**
```env
DISCORD_TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id_aqui
MONGODB_URI=mongodb://localhost:27017/passquirk-rpg
```

### 3. Iniciar el Bot
```bash
npm start
```

### 4. Probar el Bot
En Discord, escribe:
```
/start    → Crea tu personaje
/ayuda    → Ve todos los comandos
```

---

## 📋 Checklist Pre-Inicio

- [ ] Node.js v16.9+ instalado
- [ ] MongoDB corriendo (local o Atlas)
- [ ] Bot creado en Discord Developer Portal
- [ ] Token del bot copiado
- [ ] Client ID copiado
- [ ] Bot invitado a tu servidor
- [ ] Intents activados (Server Members, Message Content)
- [ ] `.env` configurado correctamente

---

## 🎮 Primeros Pasos en el Juego

### 1. Crear Personaje
```
/start
```
- Selecciona tu país
- Elige tu clase (Guerrero, Mago, Arquero, Ladrón, Ninja)
- Ingresa un nombre

### 2. Ver tu Perfil
```
/personaje
```
- Ve tus stats
- Revisa tu equipo
- Chequea tu progreso

### 3. Comenzar a Explorar
```
/explorar
```
- Encuentra enemigos
- Busca tesoros
- Gana experiencia

### 4. Gestionar Inventario
```
/inventario
```
- Ve tus objetos
- Revisa tu balance

---

## ⚙️ Configuración del Bot de Discord

### Crear Bot
1. Ve a: https://discord.com/developers/applications
2. Click "New Application"
3. Nombra tu bot: "PassQuirk RPG"
4. Ve a "Bot" → "Add Bot"

### Configurar Permisos
En "Bot" sección:
- ✅ SERVER MEMBERS INTENT
- ✅ MESSAGE CONTENT INTENT
- ✅ PRESENCE INTENT

### Obtener Token
- En "Bot" sección
- Click "Reset Token"
- Copia el token
- Pégalo en `.env` → `DISCORD_TOKEN`

### Obtener Client ID
- En "General Information"
- Copia "Application ID"
- Pégalo en `.env` → `CLIENT_ID`

### Invitar Bot
1. Ve a "OAuth2" → "URL Generator"
2. Selecciona: `bot` y `applications.commands`
3. Permisos del bot:
   - Send Messages
   - Embed Links
   - Attach Files
   - Read Message History
   - Use Slash Commands
4. Copia la URL generada
5. Abre en navegador
6. Selecciona tu servidor

---

## 💾 Configuración de MongoDB

### Opción 1: MongoDB Local
```bash
# Instalar MongoDB
# Windows: https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Iniciar MongoDB
# Windows: net start MongoDB
# Mac/Linux: sudo systemctl start mongod

# Verificar que está corriendo
mongosh
```

### Opción 2: MongoDB Atlas (Nube)
1. Ve a: https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratis
3. Crea un cluster
4. Crea un usuario de base de datos
5. Whitelist tu IP
6. Obtén la connection string
7. Pégala en `.env` → `MONGODB_URI`

---

## 🐛 Solución Rápida de Problemas

### Bot no se conecta
```bash
# Verificar token
echo $DISCORD_TOKEN  # Linux/Mac
echo %DISCORD_TOKEN%  # Windows

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### MongoDB no conecta
```bash
# Verificar que MongoDB está corriendo
mongosh

# Si no está corriendo (Linux/Mac)
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Comandos no aparecen
1. Espera 1-2 minutos
2. Cierra y abre Discord
3. Verifica que CLIENT_ID sea correcto
4. Reinicia el bot

---

## 📝 Comandos Esenciales

| Comando | Descripción |
|---------|-------------|
| `/start` | Crear personaje |
| `/personaje` | Ver perfil |
| `/explorar` | Explorar mundo |
| `/inventario` | Ver items |
| `/balance` | Ver dinero |
| `/work` | Trabajar |
| `/ayuda` | Lista de comandos |

---

## 🎯 Objetivos Iniciales

1. ✅ Crear tu personaje
2. ✅ Completar tu primera exploración
3. ✅ Llegar a nivel 2
4. ✅ Encontrar tu primer item
5. ✅ Ganar 100 monedas

---

## 📚 Documentación Completa

- `README.md` - Información general del proyecto
- `SETUP.md` - Guía detallada de instalación
- `PROJECT_SUMMARY.md` - Resumen técnico completo

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisa los logs** en la consola del bot
2. **Verifica `.env`** tiene todos los valores correctos
3. **Consulta SETUP.md** para guía detallada
4. **Revisa Discord.js docs**: https://discord.js.org

---

**¡Listo para jugar! Usa `/start` para comenzar tu aventura** 🐉
