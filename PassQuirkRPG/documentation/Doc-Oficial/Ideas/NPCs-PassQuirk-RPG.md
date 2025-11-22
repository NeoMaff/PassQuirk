
# 🎭 NPCs de PassQuirk RPG - Documentación Oficial

## 📖 Introducción
Este documento detalla todos los NPCs (Personajes No Jugadores) del mundo de PassQuirk RPG, sus funciones, diálogos y ubicaciones.

## 🏛️ NPCs Principales

### 🧙‍♂️ ElSabio
- **Ubicación**: Plaza Central
- **Función**: Mentor principal y guía del tutorial
- **Diálogos**:
  - Bienvenida: "¡Bienvenido al mundo de PassQuirk, joven aventurero!"
  - Tutorial: "Permíteme enseñarte los fundamentos de este mundo mágico..."
  - Consejos: "Recuerda, la sabiduría se gana con experiencia."



## 🌍 NPCs por Reino

### 🔴 Reino Akai
#### 🛡️ Guardia Real Akai
- **Función**: Protección y misiones de seguridad
- **Recompensas**: 150-300 monedas, XP de combate

#### 🏪 Comerciante Akai
- **Función**: Venta de armas y armaduras rojas
- **Inventario**: Espadas de fuego, armaduras carmesí

### 🔵 Reino Say
#### 🌊 Mago del Agua
- **Función**: Enseñanza de magia acuática
- **Habilidades**: Curación, escudos mágicos

#### 🐟 Pescador Say
- **Función**: Misiones de pesca y comercio marino
- **Recompensas**: Peces raros, pociones de agua

### 🟡 Reino Masai
#### ⚡ Ingeniero Eléctrico
- **Función**: Creación de dispositivos tecnológicos
- **Especialidad**: Armas eléctricas, mejoras de equipo

#### 🔧 Mecánico Masai
- **Función**: Reparación y mantenimiento
- **Servicios**: Reparar armas, mejorar estadísticas

## 💼 NPCs de Economía

### 🏪 Tendero Universal
- **Comando**: `/shop`
- **Función**: Venta de objetos básicos
- **Inventario**:
  - Pociones de vida: 50 monedas
  - Pociones de maná: 75 monedas
  - Comida básica: 25 monedas

### 💰 Banquero
- **Comando**: `/bank`
- **Función**: Gestión financiera
- **Servicios**:
  - Depósitos y retiros
  - Préstamos (próximamente)
  - Inversiones (próximamente)

## 🎯 NPCs de Misiones

### 📜 Tablón de Misiones
- **Función**: Distribuidor de misiones diarias
- **Tipos de misiones**:
  - Recolección: 100-200 monedas
  - Combate: 200-400 monedas
  - Exploración: 150-300 monedas

## 💻 Estructura de Diálogos (JavaScript)

```javascript
const NPCDialogues = {
    elSabio: {
        welcome: {
            text: "¡Bienvenido al mundo de PassQuirk, joven aventurero!",
            options: [
                { text: "¿Qué es este lugar?", next: "explanation" },
                { text: "¿Cómo empiezo?", next: "tutorial" },
                { text: "Adiós", next: "goodbye" }
            ]
        },
        explanation: {
            text: "Este es un mundo mágico lleno de aventuras y desafíos...",
            options: [
                { text: "Entiendo", next: "welcome" },
                { text: "¿Hay más reinos?", next: "kingdoms" }
            ]
        }
    },
    
    paraySikatu: {
        training: {
            text: "¿Listo para entrenar tus habilidades de combate?",
            options: [
                { text: "¡Sí, estoy listo!", action: "startCombat" },
                { text: "Necesito prepararme más", next: "advice" },
                { text: "Tal vez después", next: "goodbye" }
            ]
        }
    }
};