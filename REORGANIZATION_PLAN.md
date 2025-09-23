# 📋 Plan de Reorganización PassQuirkRPG

## 🎯 Objetivos
1. Fusionar Info-Bot y PassQuirk-RPG-Official
2. Separar documentación en carpeta dedicada
3. Organizar código funcional
4. Eliminar archivos innecesarios
5. Crear sistema de slash commands organizado

## 📁 Nueva Estructura Propuesta

```
PassQuirkRPG/
├── 📁 src/                     # Código principal del bot
│   ├── 📁 commands/            # Slash commands organizados
│   │   ├── 📁 functional/      # Commands funcionales
│   │   ├── 📁 in-review/       # Commands en revisión
│   │   └── 📁 future/          # Commands futuros
│   ├── 📁 core/               # Lógica principal
│   ├── 📁 panels/             # Paneles de Discord
│   ├── 📁 database/           # Base de datos y modelos
│   ├── 📁 utils/              # Utilidades
│   └── 📁 config/             # Configuraciones
├── 📁 docs/                   # Documentación completa
│   ├── 📁 official-data/      # Datos oficiales (clases, passquirks)
│   ├── 📁 design-reference/   # Referencias de diseño
│   ├── 📁 analysis/           # Análisis y estudios
│   └── 📁 archive/            # Archivos históricos
├── 📁 assets/                 # Recursos multimedia
│   ├── 📁 images/
│   ├── 📁 sounds/
│   └── 📁 sprites/
├── 📁 design-panels/          # Paneles de diseño funcionales
│   ├── 📁 battle-panel/
│   ├── 📁 character-creation-panel/
│   ├── 📁 inventory-panel/
│   └── 📁 tournament-panel/
└── 📄 package.json
└── 📄 README.md
```

## 🗑️ Archivos/Carpetas a Eliminar
- .cursor/
- app/
- hooks/
- web-preview/ (mover docs a archive)
- config.js (revisar si es necesario)
- lib/ (revisar si es necesario)

## 📋 Archivos/Carpetas a Revisar
- previews/
- public/
- styles/
- utils/

## 🔄 Proceso de Reorganización
1. Crear nueva estructura de carpetas
2. Mover archivos de Info-Bot y PassQuirk-RPG-Official
3. Organizar documentación
4. Consolidar paneles de diseño
5. Limpiar slash commands
6. Actualizar configuraciones
7. Verificar funcionalidad