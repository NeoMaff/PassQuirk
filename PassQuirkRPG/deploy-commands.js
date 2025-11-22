const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

console.log('🧹 Limpiando TODOS los comandos existentes...');

const commands = [];

// Función para cargar comandos recursivamente
function loadCommandsRecursively(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Si es un directorio, buscar recursivamente
            loadCommandsRecursively(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                
                // Verificar que el comando tenga la estructura correcta
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(`✅ Comando cargado: ${command.data.name}`);
                } else {
                    console.log(`⚠️ El archivo ${filePath} no tiene la estructura correcta de comando.`);
                }
            } catch (error) {
                console.error(`❌ Error cargando comando desde ${filePath}:`, error.message);
            }
        }
    }
}

// Esta función ya no se ejecuta automáticamente - solo limpia comandos

// Construir y preparar una instancia del módulo REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🗑️ Eliminando TODOS los comandos existentes...');
        
        // Eliminar comandos del guild específico
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] },
        );
        console.log('✅ Comandos del guild eliminados');

        // Eliminar comandos globales
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] },
        );
        console.log('✅ Comandos globales eliminados');

        console.log('🎉 ¡Limpieza completada! Todos los comandos han sido eliminados.');
        console.log('💡 Ahora ejecuta el bot con "node bot/index.js" para cargar solo los comandos necesarios.');
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    }
})();