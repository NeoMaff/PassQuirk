# Organización de Comandos Slash

Esta carpeta contiene todos los comandos slash del bot organizados por su estado de desarrollo.

## 📁 Estructura de Carpetas

### `functional/`
**Comandos completamente funcionales y probados**
- Listos para producción
- Completamente documentados
- Probados y sin errores conocidos
- Incluyen manejo de errores apropiado

### `in-review/`
**Comandos funcionales pendientes de revisión**
- Funcionalidad básica implementada
- Pendientes de revisión de código
- Pueden necesitar ajustes menores
- Documentación básica presente

### `in-development/`
**Comandos en desarrollo activo**
- Funcionalidad parcial o en construcción
- Pueden tener errores conocidos
- Documentación en progreso
- No listos para producción

### `future/`
**Comandos planificados para futuras versiones**
- Especificaciones y diseños
- Prototipos o bocetos
- Ideas y conceptos
- Roadmap de desarrollo

## 🔄 Flujo de Desarrollo

```
future/ → in-development/ → in-review/ → functional/
```

1. **Planificación**: Los nuevos comandos comienzan en `future/`
2. **Desarrollo**: Se mueven a `in-development/` cuando se inicia la implementación
3. **Revisión**: Pasan a `in-review/` cuando la funcionalidad básica está completa
4. **Producción**: Finalmente se mueven a `functional/` después de la revisión y pruebas

## 📝 Convenciones de Nomenclatura

- Usar kebab-case para nombres de archivos: `create-character.js`
- Incluir prefijo de categoría cuando sea apropiado: `rpg-battle.js`, `admin-ban.js`
- Mantener nombres descriptivos pero concisos

## 📋 Checklist para Comandos

### Para mover de `in-development/` a `in-review/`:
- [ ] Funcionalidad básica implementada
- [ ] Manejo básico de errores
- [ ] Documentación JSDoc básica
- [ ] Pruebas manuales realizadas

### Para mover de `in-review/` a `functional/`:
- [ ] Revisión de código completada
- [ ] Manejo completo de errores
- [ ] Documentación completa
- [ ] Pruebas exhaustivas realizadas
- [ ] Optimización de rendimiento
- [ ] Cumple estándares de código

## 🚨 Notas Importantes

- **NUNCA** mover comandos directamente a `functional/` sin pasar por el proceso de revisión
- Mantener un registro de cambios en cada comando
- Documentar cualquier dependencia externa
- Incluir ejemplos de uso en la documentación

## 🔧 Plantilla de Comando

```javascript
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comando-ejemplo')
        .setDescription('Descripción del comando'),
    
    async execute(interaction) {
        // Implementación del comando
        try {
            // Lógica principal
            await interaction.reply('Respuesta del comando');
        } catch (error) {
            console.error('Error en comando-ejemplo:', error);
            await interaction.reply({
                content: 'Ocurrió un error al ejecutar el comando.',
                ephemeral: true
            });
        }
    },
    
    // Metadatos opcionales
    category: 'general',
    permissions: [],
    cooldown: 3,
    guildOnly: false
};
```

---

**Recuerda**: La organización es clave para mantener un código limpio y un desarrollo eficiente. ¡Sigue estas convenciones para un proyecto exitoso! 🚀