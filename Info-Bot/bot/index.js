// Importar path primero
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Importar módulos necesarios
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

// Inicializar el cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
    ],
});

// Inicializar el gestor de diálogos
const DialogueManager = require('./systems/dialogs/DialogueManager');
client.dialogueManager = new DialogueManager(client);

// Inicializar el PassQuirk Game Manager
const PassQuirkGameManager = require('./core/passquirk-game-manager');
client.gameManager = new PassQuirkGameManager(client);

// Colecciones para comandos y eventos
client.commands = new Collection();
client.events = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

// Función para cargar comandos recursivamente
function loadCommandsRecursively(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
            // Si es un directorio, cargar recursivamente
            loadCommandsRecursively(fullPath);
        } else if (item.isFile() && item.name.endsWith('.js')) {
            // Si es un archivo .js, cargarlo como comando
            try {
                const command = require(fullPath);
                if (command.data && command.data.name) {
                    client.commands.set(command.data.name, command);
                    console.log(`✅ Comando cargado: ${command.data.name} desde ${fullPath}`);
                }
            } catch (error) {
                console.error(`❌ Error al cargar comando ${item.name}:`, error.message);
            }
        }
    }
}

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands');
loadCommandsRecursively(commandsPath);

// Cargar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Iniciar el bot
(async () => {
    try {
        // Función para recopilar comandos recursivamente para el registro
        function collectCommandsForRegistration(dir, commands = []) {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    collectCommandsForRegistration(fullPath, commands);
                } else if (item.isFile() && item.name.endsWith('.js')) {
                    try {
                        const command = require(fullPath);
                        if (command.data && command.data.name) {
                            commands.push(command.data.toJSON());
                        }
                    } catch (error) {
                        console.error(`❌ Error al procesar comando ${item.name} para registro:`, error.message);
                    }
                }
            }
            return commands;
        }

        // Recopilar comandos para registro
        const commands = collectCommandsForRegistration(path.join(__dirname, 'commands'));
        console.log(`📋 Total de comandos para registrar: ${commands.length}`);

        // Iniciar el bot
        console.log('🔑 Iniciando sesión con el token');
        await client.login(process.env.DISCORD_TOKEN);
        
        // Manejar errores no capturados
        process.on('unhandledRejection', error => {
            console.error('Error no capturado (unhandledRejection):', error);
        });
        
        process.on('uncaughtException', error => {
            console.error('Excepción no capturada (uncaughtException):', error);
        });
        console.log(`✅ ${client.user.tag} está en línea.`);

        // Registrar comandos
        console.log('🔄 Actualizando comandos de aplicación...');
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        try {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ Comandos de aplicación (/) actualizados (${commands.length} comandos).`);
        } catch (error) {
            console.error('Error al actualizar comandos:', error);
        }
    } catch (error) {
        console.error('Error al iniciar el bot:', error);
        process.exit(1);
    }
})();

// Cargar manejadores de interacciones
const rpgButtons = require('./buttons/rpgButtons');
const rpgMenus = require('./selectMenus/rpgMenus');

// Los manejadores de interacciones están en events/interactionCreate.js
// No duplicar aquí para evitar conflictos



// Manejo de errores
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

module.exports = client;
