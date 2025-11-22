// Importar path primero
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Importar módulos necesarios
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
// Asegurar que libsodium esté cargado para voz
try { require('libsodium-wrappers'); } catch (e) { console.error('Error cargando libsodium:', e); }
const UserManager = require('./database/userManager');
const config = require('./config/config');
const GameUtils = require('./utils/gameUtils');

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

// Inicializar sistemas del juego
client.userManager = new UserManager();
client.config = config;
client.gameUtils = GameUtils;
client.cooldowns = new Map();

// Inicializar el gestor de diálogos
// const DialogueManager = require('./systems/dialogs/DialogueManager');
// client.dialogueManager = new DialogueManager(client);

// Inicializar el PassQuirk Game Manager
const PassQuirkGameManager = require('./core/passquirk-game-manager');
client.gameManager = new PassQuirkGameManager(client);

// Inicializar el sistema de tutorial completo
// const TutorialCompleto = require('./systems/tutorial-completo');
client.gameManager.systems = {
    user: client.userManager,
    dialogue: client.dialogueManager,
    // tutorialCompleto: new TutorialCompleto()
};

// Inicializar el sistema de tutoriales
// const TutorialRegistration = require('./systems/dialogs/register-tutorials');
// client.tutorialSystem = new TutorialRegistration(client, client.gameManager);

// Inicializar el manejador de interacciones del tutorial
// const InteractionHandler = require('./handlers/interactionHandler');
// client.interactionHandler = new InteractionHandler(client);
// client.interactionHandler.init();

// Configurar sistemas del juego
client.gameManager.userManager = client.userManager;
client.gameManager.config = config;
client.gameManager.gameUtils = GameUtils;

// Colecciones para comandos y eventos
client.commands = new Collection();
client.events = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

// Sistema de validación de comandos
const loadedCommands = new Set();
const commandErrors = [];

// Función para validar comando antes de cargarlo
function validateCommand(command, filePath) {
    if (!command.data || !command.execute) {
        throw new Error('Comando sin estructura válida (falta data o execute)');
    }

    const commandName = command.data.name;
    if (loadedCommands.has(commandName)) {
        throw new Error(`Comando duplicado detectado: '${commandName}'`);
    }

    // Validar que el nombre del comando sea válido
    if (!/^[a-z0-9_-]+$/.test(commandName)) {
        throw new Error(`Nombre de comando inválido: '${commandName}' (solo letras minúsculas, números, guiones y guiones bajos)`);
    }

    return true;
}

// Función para cargar comandos recursivamente con validación
function loadCommandsRecursively(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            // Saltar directorios de desarrollo en producción
            if (item.name === 'in-development' && process.env.NODE_ENV === 'production') {
                console.log(`⏭️ Saltando directorio de desarrollo: ${item.name}`);
                continue;
            }
            // Si es un directorio, cargar recursivamente
            loadCommandsRecursively(fullPath);
        } else if (item.isFile() && item.name.endsWith('.js')) {
            // Si es un archivo .js, cargarlo como comando
            try {
                const command = require(fullPath);

                // Validar comando antes de cargarlo
                validateCommand(command, fullPath);

                // Inyectar dependencias en el comando
                command.userManager = client.userManager;
                command.config = config;
                command.gameUtils = GameUtils;

                // Cargar comando
                client.commands.set(command.data.name, command);
                loadedCommands.add(command.data.name);
                console.log(`✅ Comando cargado: ${command.data.name} desde ${fullPath}`);

            } catch (error) {
                const errorMsg = `❌ Error al cargar comando ${item.name}: ${error.message}`;
                console.error(errorMsg);
                commandErrors.push({ file: item.name, error: error.message, path: fullPath });
            }
        }
    }
}

// Cargar comandos
console.log('🔄 Cargando comandos...');
const commandsPath = path.join(__dirname, '../src/commands');
loadCommandsRecursively(commandsPath);

// Reporte de carga de comandos
console.log(`✅ ${client.commands.size} comandos cargados exitosamente.`);
console.log('📜 Comandos cargados:', Array.from(client.commands.keys()).join(', '));
if (commandErrors.length > 0) {
    console.log(`⚠️ ${commandErrors.length} errores durante la carga:`);
    commandErrors.forEach(err => {
        console.log(`   - ${err.file}: ${err.error}`);
    });
}

// Lista de comandos cargados
console.log('📋 Comandos disponibles:', Array.from(loadedCommands).join(', '));

// Cargar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, async (...args) => {
            try {
                await event.execute(...args, client);
            } catch (error) {
                console.error(`❌ Error en evento ${event.name}:`, error);
            }
        });
    }
}

// Iniciar el bot
(async () => {
    try {
        // Esperar a que libsodium esté listo (crítico para voz)
        await require('libsodium-wrappers').ready;
        console.log('🧂 Libsodium listo.');

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
        const commands = collectCommandsForRegistration(path.join(__dirname, '../src/commands'));
        console.log(`📋 Total de comandos para registrar: ${commands.length}`);

        // Iniciar el bot
        console.log('🚀 Iniciando PassQuirk RPG Bot...');
        console.log('🔑 Iniciando sesión con el token');
        await client.login(config.bot.token || process.env.DISCORD_TOKEN);

        // Manejar cierre del bot
        process.on('SIGINT', async () => {
            console.log('\n🔄 Cerrando bot...');

            try {
                // Guardar datos antes de cerrar
                if (client.userManager) {
                    await client.userManager.close();
                }

                // Cerrar conexión de Discord
                client.destroy();

                console.log('✅ Bot cerrado correctamente');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error al cerrar el bot:', error);
                process.exit(1);
            }
        });

        // Manejar errores no capturados
        process.on('unhandledRejection', error => {
            console.error('Error no capturado (unhandledRejection):', error);
            fs.appendFileSync('crash_log.txt', `[${new Date().toISOString()}] UnhandledRejection: ${error.stack || error}\n`);
        });

        process.on('uncaughtException', error => {
            console.error('Excepción no capturada (uncaughtException):', error);
            fs.appendFileSync('crash_log.txt', `[${new Date().toISOString()}] UncaughtException: ${error.stack || error}\n`);

            // Intentar guardar datos antes de salir
            if (client.userManager) {
                client.userManager.close().finally(() => {
                    process.exit(1);
                });
            } else {
                process.exit(1);
            }
        });
        console.log(`✅ ${client.user.tag} está en línea.`);

        // Iniciar sistema de mundo (Canales de tiempo y clima)
        const worldSystem = require('./utils/worldSystem');
        worldSystem.startUpdateLoop(client);
        console.log('🌍 Sistema de mundo iniciado (Canales dinámicos)');

        // Reanudar música si estaba sonando
        // Reanudar música si estaba sonando
        const musicManager = require('./utils/musicManager');
        // await musicManager.resumeState(client); // Desactivado por error DAVE

        // Registrar comandos
        console.log('🔄 Actualizando comandos de aplicación...');
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        try {
            console.log(`📤 Intentando registrar ${commands.length} comandos...`);

            const isDev = process.env.NODE_ENV === 'development' && process.env.GUILD_ID;
            const route = isDev
                ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
                : Routes.applicationCommands(process.env.CLIENT_ID);

            await rest.put(route, { body: commands });
            console.log(`✅ Comandos ${(isDev ? 'de Gremio' : 'Globales')} actualizados (${commands.length}).`);
        } catch (error) {
            console.error('❌ Error al registrar comandos en Discord:');
            console.error('Código de error:', error.code);
            console.error('Mensaje:', error.message);

            if (error.code === 50035) {
                console.error('🔍 Error 50035 - Invalid Form Body detectado.');
                console.error('Esto usualmente indica:');
                console.error('- Comandos con nombres duplicados');
                console.error('- Opciones mal formateadas');
                console.error('- Límites de caracteres excedidos');

                // Intentar identificar comandos problemáticos
                console.error('🔍 Comandos a registrar:');
                commands.forEach((cmd, index) => {
                    console.error(`${index + 1}. ${cmd.name} - ${cmd.description?.length || 0} chars`);
                });
            }

            throw error;
        }
    } catch (error) {
        console.error('Error al iniciar el bot:', error);
        process.exit(1);
    }
})();

// Los manejadores de interacciones están en events/interactionCreate.js
// No necesitamos cargar manejadores adicionales aquí



// Manejo de errores
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

module.exports = client;
