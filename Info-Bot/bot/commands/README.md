# 📚 Estructura de Comandos PassQuirk RPG

## 🎯 Organización Mejorada

La estructura de comandos ha sido reorganizada para eliminar duplicaciones y mejorar la eficiencia:

### 📁 Directorios

#### `/admin/` - Comandos de Administración
- `config.js` - Panel de configuración completo (antes `configuracion.js`)
- `configurar-tiempo.js` - Configuración específica de tiempo y clima
- `cambiar-zona.js` - Gestión de zonas horarias

#### `/economy/` - Sistema Económico
- `shop.js` - Tienda consolidada (incluye funcionalidad de compra)
- `inventory.js` - Gestión de inventario
- `balance.js` - Consulta de saldos
- `work.js` - Sistema de trabajo
- `pay.js` - Transferencias entre usuarios
- `transactions.js` - Historial de transacciones

#### Comandos Principales
- `passquirkrpg.js` - Comando principal del juego (mejorado con opciones)
- `help.js` - Sistema de ayuda consolidado (antes `comandos.js`)
- `dialogo.js` - Sistema de diálogos con NPCs

## ✅ Mejoras Implementadas

### 🔄 Consolidación de Funcionalidades
1. **Tienda + Compra**: `shop.js` ahora incluye la funcionalidad de `buy.js` (eliminado)
2. **Configuración**: Reorganizada con subcomandos en lugar de menús complejos
3. **Ayuda**: Sistema más intuitivo con autocompletado y categorías

### 🎮 Comandos Optimizados

#### `/tienda` (Consolidado)
```
/tienda categoria:consumibles
/tienda comprar:pocion_vida cantidad:5
```

#### `/config` (Reorganizado)
```
/config panel          # Panel interactivo
/config tiempo         # Configurar tiempo
/config canales        # Gestionar canales
/config roles          # Configurar roles
/config modulos        # Habilitar/deshabilitar módulos
```

#### `/help` (Mejorado)
```
/help                           # Ayuda general
/help comando:tienda           # Ayuda específica
/help categoria:economia       # Ayuda por categoría
```

#### `/passquirkrpg` (Expandido)
```
/passquirkrpg                  # Panel principal
/passquirkrpg accion:perfil    # Ver perfil directamente
/passquirkrpg accion:inventario # Abrir inventario
/passquirkrpg accion:combate   # Iniciar combate
```

## 🚀 Beneficios de la Reorganización

1. **Eliminación de Duplicaciones**: No más comandos redundantes
2. **Mejor UX**: Comandos más intuitivos con autocompletado
3. **Estructura Lógica**: Agrupación coherente por funcionalidad
4. **Mantenimiento Simplificado**: Código más limpio y organizado
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades

## 📋 Comandos Eliminados/Consolidados

- ❌ `buy.js` → ✅ Integrado en `shop.js`
- ❌ `configuracion.js` → ✅ Renombrado a `config.js` con subcomandos
- ❌ `comandos.js` → ✅ Renombrado a `help.js` con mejoras
- ❌ Directorio `/configuracion/` → ✅ Movido a `/admin/`

## 🎨 Convenciones de Nomenclatura

- **Nombres de comandos**: Descriptivos y en español
- **Emojis**: Utilizados para mejor identificación visual
- **Subcomandos**: Para funcionalidades relacionadas
- **Autocompletado**: Implementado donde es útil

---

*Esta reorganización mejora significativamente la experiencia del usuario y la mantenibilidad del código.*