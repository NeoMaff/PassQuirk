const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Script para desplegar comandos de barra (slash commands) en Discord
 */

const commands = [];
const foldersPath = path.join(__dirname, 'commands');

// Función para cargar comandos recursivamente
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                
                if (command.data && command.data.name) {
                    commands.push(command.data.toJSON());
                    console.log(`✅ Comando cargado: ${command.data.name}`);
                } else {
                    console.warn(`⚠️ Archivo de comando inválido: ${filePath}`);
                }
            } catch (error) {
                console.error(`❌ Error al cargar comando ${filePath}:`, error.message);
            }
        }
    }
}

// Cargar comandos desde la carpeta commands
if (fs.existsSync(foldersPath)) {
    loadCommands(foldersPath);
} else {
    console.error('❌ La carpeta de comandos no existe:', foldersPath);
    process.exit(1);
}

// Cargar comandos desde src/commands si existe (compatibilidad)
const srcCommandsPath = path.join(__dirname, '..', 'src', 'commands');
if (fs.existsSync(srcCommandsPath)) {
    console.log('📁 Cargando comandos adicionales desde src/commands...');
    loadCommands(srcCommandsPath);
}

// Cargar comandos desde commands en la raíz si existe
const rootCommandsPath = path.join(__dirname, '..', 'commands');
if (fs.existsSync(rootCommandsPath)) {
    console.log('📁 Cargando comandos adicionales desde commands...');
    loadCommands(rootCommandsPath);
}

console.log(`📋 Total de comandos a desplegar: ${commands.length}`);

// Verificar variables de entorno
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN no está definido en las variables de entorno');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('❌ CLIENT_ID no está definido en las variables de entorno');
    process.exit(1);
}

// Construir y preparar una instancia del módulo REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Función principal de despliegue
async function deployCommands() {
    try {
        console.log('🚀 Iniciando despliegue de comandos...');
        
        let data;
        
        if (process.env.GUILD_ID && process.env.NODE_ENV === 'development') {
            // Despliegue en servidor específico (desarrollo)
            console.log(`🔧 Desplegando ${commands.length} comandos en el servidor de desarrollo...`);
            
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            
            console.log(`✅ ${data.length} comandos desplegados exitosamente en el servidor de desarrollo.`);
        } else {
            // Despliegue global (producción)
            console.log(`🌍 Desplegando ${commands.length} comandos globalmente...`);
            console.log('⚠️ Los comandos globales pueden tardar hasta 1 hora en aparecer.');
            
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            
            console.log(`✅ ${data.length} comandos desplegados exitosamente globalmente.`);
        }
        
        // Mostrar lista de comandos desplegados
        console.log('\n📋 Comandos desplegados:');
        data.forEach(command => {
            console.log(`   • /${command.name} - ${command.description}`);
        });
        
    } catch (error) {
        console.error('❌ Error al desplegar comandos:', error);
        
        // Manejo específico de errores comunes
        if (error.code === 50001) {
            console.error('💡 El bot no tiene acceso al servidor especificado.');
        } else if (error.code === 50013) {
            console.error('💡 El bot no tiene permisos suficientes.');
        } else if (error.code === 10002) {
            console.error('💡 El CLIENT_ID o GUILD_ID es inválido.');
        } else if (error.status === 401) {
            console.error('💡 El token del bot es inválido.');
        }
        
        process.exit(1);
    }
}

// Función para limpiar comandos
async function clearCommands() {
    try {
        console.log('🧹 Limpiando comandos existentes...');
        
        if (process.env.GUILD_ID && process.env.NODE_ENV === 'development') {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: [] },
            );
            console.log('✅ Comandos del servidor de desarrollo limpiados.');
        } else {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: [] },
            );
            console.log('✅ Comandos globales limpiados.');
        }
    } catch (error) {
        console.error('❌ Error al limpiar comandos:', error);
    }
}

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--clear') || args.includes('-c')) {
    clearCommands();
} else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📖 Uso del script de despliegue:

  node deploy-commands.js          Despliega todos los comandos
  node deploy-commands.js --clear  Limpia todos los comandos
  node deploy-commands.js --help   Muestra esta ayuda

🔧 Variables de entorno requeridas:
  DISCORD_TOKEN  - Token del bot de Discord
  CLIENT_ID      - ID de la aplicación de Discord
  GUILD_ID       - ID del servidor (opcional, solo para desarrollo)
  NODE_ENV       - Entorno (development/production)

💡 Consejos:
  • En desarrollo, usa GUILD_ID para despliegue rápido
  • En producción, omite GUILD_ID para despliegue global
  • Los comandos globales tardan hasta 1 hora en aparecer
`);
} else {
    deployCommands();
}

// Manejar cierre del proceso
process.on('SIGINT', () => {
    console.log('\n👋 Proceso interrumpido.');
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
    process.exit(1);
});