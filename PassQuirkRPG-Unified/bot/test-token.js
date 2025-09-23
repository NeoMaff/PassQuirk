require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
console.log('Token length:', token ? token.length : 'undefined');
console.log('Token format check:', token ? token.split('.').length === 3 : 'invalid');

// Test with discord.js
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log('✅ Bot conectado exitosamente!');
    console.log(`Logged in as ${client.user.tag}`);
    process.exit(0);
});

client.on('error', (error) => {
    console.error('❌ Error del cliente:', error);
    process.exit(1);
});

console.log('🔑 Intentando conectar...');
client.login(token).catch(error => {
    console.error('❌ Error de login:', error.message);
    process.exit(1);
});

// Timeout después de 10 segundos
setTimeout(() => {
    console.log('❌ Timeout - No se pudo conectar en 10 segundos');
    process.exit(1);
}, 10000);