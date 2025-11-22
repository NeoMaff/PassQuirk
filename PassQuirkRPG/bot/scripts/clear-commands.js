const { REST, Routes } = require('discord.js');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('❌ Error: DISCORD_TOKEN no encontrado en .env');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('🔄 Iniciando limpieza de comandos...');

        // 1. Limpiar comandos globales
        console.log('🌐 Eliminando comandos globales...');
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('✅ Comandos globales eliminados.');

        // 2. Limpiar comandos de gremio (si existe GUILD_ID)
        if (guildId) {
            console.log(`🏰 Eliminando comandos del gremio ${guildId}...`);
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
            console.log('✅ Comandos de gremio eliminados.');
        } else {
            console.log('⚠️ No se proporcionó GUILD_ID, saltando limpieza de gremio.');
        }

        console.log('✨ ¡Limpieza completada! Reinicia el bot para registrar los comandos correctos.');
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    }
})();
