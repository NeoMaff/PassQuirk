# 🐉 PassQuirk RPG - Documentación Oficial

## 📜 Índice
1. [Visión General](#-visión-general)
2. [Sistema de Juego](#-sistema-de-juego)
3. [Mundo del Juego](#-mundo-del-juego)
4. [Sistema de Combate](#-sistema-de-combate)
5. [Sistema de Personajes](#-sistema-de-personajes)
6. [Sistema de Niveles y Progresión](#-sistema-de-niveles-y-progresión)
7. [Sistema de Misiones](#-sistema-de-misiones)
8. [Interfaz de Usuario](#-interfaz-de-usuario)
9. [Comandos](#-comandos)
10. [Guía de Desarrollo](#-guía-de-desarrollo)

---

## 🌟 Visión General

PassQuirk RPG es un juego de rol por turnos en Discord donde los jugadores exploran un mundo mágico, mejoran sus habilidades y luchan contra enemigos. El juego se centra en la exploración, el combate estratégico y la personalización de personajes.

**Características principales:**
- Sistema de combate por turnos estilo Pokémon
- Sistema de clases y habilidades únicas
- Mundo abierto con múltiples regiones
- Sistema de misiones y eventos
- Interacción entre jugadores
- Sistema de mejoras y personalización

---

## 🎮 Sistema de Juego

### Flujo Principal del Juego
1. **Creación de Personaje**
   - Elección de nombre, género y apariencia
   - Selección de clase inicial
   - Tutorial interactivo

2. **Exploración**
   - Viaje entre regiones
   - Encuentros aleatorios
   - Descubrimiento de mazmorras y eventos

3. **Combate**
   - Sistema por turnos
   - Habilidades especiales
   - Estrategia y gestión de recursos

4. **Progresión**
   - Subida de nivel
   - Mejora de equipo
   - Aprendizaje de habilidades

---

## 🌍 Mundo del Juego

### Reinos Principales

#### 🔴 Reino de Akai
- **Tema**: Guerrero y combate
- **Características**: Tierras volcánicas, fortalezas
- **Habitantes**: Guerreros, herreros, bestias

#### 🟢 Reino de Say
- **Tema**: Magia y conocimiento
- **Características**: Bosques encantados, bibliotecas
- **Habitantes**: Magos, eruditos, criaturas mágicas

#### 🟡 Reino de Masai
- **Tema**: Comercio y artesanía
- **Características**: Ciudades bulliciosas, desiertos
- **Habitantes**: Comerciantes, artesanos, ladrones

### Zonas de Juego
- **Niveles 1-5**: Zonas seguras y tutoriales
- **Niveles 5-15**: Zonas de dificultad media
- **Niveles 15-25**: Zonas de alto nivel
- **Niveles 25+**: Mazmorras y jefes finales

---

## ⚔️ Sistema de Combate

### Mecánicas Principales
- **Turnos**: Los jugadores y enemigos actúan por turnos
- **Puntos de Acción (PA)**: Cada habilidad consume PA
- **Estados Alterados**: Veneno, parálisis, etc.

### Tipos de Ataques
1. **Físicos**: Daño basado en el ataque
2. **Mágicos**: Daño basado en la inteligencia
3. **Estado**: Aplican efectos sin daño directo
4. **Curación**: Recuperan PV o eliminan estados

### Estrategia
- Ventajas de tipos
- Gestión de recursos
- Combinación de habilidades

---

## 🧙 Sistema de Personajes

### Clases Disponibles
1. **Guerrero**
   - Enfoque: Defensa y daño cuerpo a cuerpo
   - Habilidades: Golpes poderosos, defensa aumentada

2. **Mago**
   - Enfoque: Daño mágico a distancia
   - Habilidades: Hechizos elementales, control de masas

3. **Arquero**
   - Enfoque: Daño a distancia y precisión
   - Habilidades: Disparos rápidos, trampas

4. **Ladrón**
   - Enfoque: Velocidad y críticos
   - Habilidades: Robo, evasión, ataques sorpresa

### Estadísticas
- **Fuerza**: Ataque físico
- **Destreza**: Precisión y evasión
- **Inteligencia**: Poder mágico
- **Constitución**: Puntos de vida
- **Suerte**: Críticos y recompensas

---

## 📈 Sistema de Niveles y Progresión

### Experiencia (EXP)
- Se obtiene derrotando enemigos y completando misiones
- Cada nivel requiere más EXP que el anterior

### Mejoras por Nivel
- Aumento de estadísticas
- Nuevas habilidades
- Mejora de habilidades existentes

### Sistema de Talentos
- Árbol de habilidades pasivas
- Especializaciones de clase
- Bonificaciones únicas

---

## 📜 Sistema de Misiones

### Tipos de Misiones
1. **Historia Principal**
   - Avanzan la trama principal
   - Recompensas significativas

2. **Secundarias**
   - Historias opcionales
   - Recompensas variadas

3. **Diarias/Semanales**
   - Recompensas recurrentes
   - Objetivos aleatorios

4. **Épicas**
   - Desafíos difíciles
   - Recompensas exclusivas

### Sistema de Logros
- Desbloqueables por acciones específicas
- Recompensas únicas
- Muestra de maestría

---

## 🖥️ Interfaz de Usuario

### Comandos Principales
- `/aventura` - Inicia una nueva partida
- `/personaje` - Muestra tu hoja de personaje
- `/inventario` - Gestiona tu equipo y objetos
- `/mapa` - Muestra el mapa del mundo
- `/combate` - Inicia un combate de prueba

### Menús Interactivos
- Sistema de botones para acciones principales
- Menús desplegables para inventario y habilidades
- Barras de progreso visuales

### Notificaciones
- Alertas de eventos
- Recompensas obtenidas
- Logros desbloqueados

---

## ⌨️ Comandos

### Básicos
- `/ayuda` - Muestra la lista de comandos
- `/estadisticas` - Muestra tus estadísticas
- `/equipo` - Gestiona tu equipo

### Combate
- `/atacar [habilidad]` - Usa una habilidad
- `/usar [objeto]` - Usa un objeto del inventario
- `/huyr` - Intenta huir del combate

### Social
- `/amigos` - Gestiona tu lista de amigos
- `/grupo` - Crea o únete a un grupo
- `/comerciar [usuario]` - Inicia un intercambio

### Economía
- `/trabajar` - Gana monedas
- `/tienda` - Accede a la tienda
- `/banco` - Gestiona tus ahorros

---

## 🛠️ Guía de Desarrollo

### Requisitos Técnicos
- Node.js 16+
- Discord.js 14+
- Base de datos (MongoDB/PostgreSQL)

### Estructura del Proyecto
```
passquirk-rpg/
├── src/
│   ├── commands/      # Comandos de barra
│   ├── events/        # Eventos de Discord
│   ├── models/        # Modelos de base de datos
│   ├── systems/       # Sistemas del juego
│   ├── utils/         # Utilidades
│   └── index.js       # Punto de entrada
├── assets/            # Recursos del juego
├── .env               # Variables de entorno
└── package.json       # Dependencias
```

### Convenciones de Código
- Usar TypeScript para tipado estático
- Seguir el patrón MVC
- Documentar funciones y clases
- Usar async/await para operaciones asíncronas

### Próximas Actualizaciones
- [ ] Sistema de gremios
- [ ] Eventos en tiempo real
- [ ] Más misiones y áreas
- [ ] Sistema de comercio entre jugadores

---

## 📝 Notas del Desarrollador

Esta documentación está en constante evolución. Se actualizará con cada nueva característica o cambio importante en el juego.

**Última actualización:** 24/05/2025
