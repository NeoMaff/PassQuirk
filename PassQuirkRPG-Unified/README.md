# PassQuirk RPG - Unified Project

## 🎮 Descripción

PassQuirk RPG es un bot de Discord completo con sistema de RPG que incluye combates, exploración de mazmorras, sistema de gremios, torneos PvP y mucho más. Este proyecto unifica toda la funcionalidad en una estructura organizada y mantenible.

## 🚀 Características Principales

- **Sistema de Combate**: Batallas épicas con mecánicas avanzadas
- **Exploración de Mazmorras**: Aventuras procedurales con recompensas
- **Sistema de Gremios**: Colaboración y competencia entre jugadores
- **Torneos PvP**: Competencias regulares con rankings
- **Gestión de Inventario**: Sistema completo de items y equipamiento
- **Creación de Personajes**: Personalización detallada de avatares
- **Sistema de Niveles**: Progresión y desarrollo de personajes
- **Economía del Juego**: Monedas, comercio y mercado

## 📁 Estructura del Proyecto

```
PassQuirkRPG-Unified/
├── bot/                    # Código principal del bot
│   ├── commands/          # Comandos del bot
│   ├── events/            # Eventos de Discord
│   ├── core/              # Lógica central del juego
│   ├── panels/            # Paneles de interfaz
│   └── index.js           # Punto de entrada
├── src/                   # Código fuente organizado
│   └── commands/
│       └── slash/         # Comandos slash organizados
│           ├── functional/     # Comandos completamente funcionales
│           ├── in-review/      # Comandos en revisión
│           ├── in-development/ # Comandos en desarrollo
│           └── future/         # Comandos planificados
├── PassQuirk-RPG-Official/ # Código oficial del proyecto
├── documentation/         # Documentación completa
│   ├── Doc-Oficial/       # Documentación oficial
│   ├── Doc-Antiguo/       # Documentación legacy
│   ├── PDF-Documentacion-PassQuirk/ # PDFs de referencia
│   ├── PLAN_MAESTRO_PASSQUIRKRPG.md
│   ├── ANALISIS_PANELES_V0DEV.md
│   └── PassQuirkRPG_Esquema_Completo.txt
├── design-reference/      # Referencias de diseño
│   ├── components/        # Componentes de UI
│   ├── embeds/           # Embeds de Discord
│   └── embed-preview-showcase.tsx
├── lib/                   # Utilidades y librerías
├── package.json          # Dependencias del proyecto
├── .env.example          # Configuración de ejemplo
└── README.md             # Este archivo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Discord Bot Token

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/passquirk/passquirk-rpg-unified.git
   cd passquirk-rpg-unified
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar el bot**
   ```bash
   npm start
   # Para desarrollo:
   npm run dev
   ```

## 📋 Estado del Proyecto

### ✅ Completado
- [x] Estructura base del bot
- [x] Sistema de eventos de Discord
- [x] Gestión de base de datos
- [x] Sistema de paneles básicos
- [x] Documentación organizada
- [x] Referencias de diseño consolidadas

### 🔄 En Progreso
- [ ] Migración completa de comandos slash
- [ ] Integración de paneles de diseño
- [ ] Sistema de combate avanzado
- [ ] Sistema de gremios completo

### 📅 Pendiente
- [ ] Sistema de torneos PvP
- [ ] Exploración de mazmorras procedurales
- [ ] Sistema de comercio entre jugadores
- [ ] Interfaz web de administración
- [ ] Sistema de logros y recompensas

## 🎯 Organización de Comandos Slash

Los comandos slash están organizados por estado de desarrollo:

- **`functional/`**: Comandos completamente funcionales y probados
- **`in-review/`**: Comandos funcionales pendientes de revisión
- **`in-development/`**: Comandos en desarrollo activo
- **`future/`**: Comandos planificados para futuras versiones

## 📚 Documentación

La documentación completa se encuentra en la carpeta `documentation/`:

- **Plan Maestro**: Visión general del proyecto
- **Análisis de Paneles**: Detalles técnicos de la interfaz
- **Esquema Completo**: Arquitectura del sistema
- **Documentación Oficial**: Guías de usuario y desarrollador

## 🎨 Referencias de Diseño

Todos los elementos de diseño están en `design-reference/`:

- Componentes de interfaz reutilizables
- Embeds de Discord personalizados
- Previews y mockups de paneles

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación en `documentation/`
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🏆 Créditos

Desarrollado por el equipo de PassQuirk con amor y dedicación para la comunidad de Discord.

---

**¡Que comience la aventura! 🗡️⚔️🛡️**