const { connectDatabase } = require('../config/database');
const { ActivityType } = require('discord.js');
const { PlayerDatabase } = require('../data/player-database');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('🔗 Conectando a la base de datos...');
        await connectDatabase();
        
        // Inicializar el sistema de base de datos de jugadores
        console.log('🎮 Inicializando sistema de jugadores...');
        client.playerDatabase = new PlayerDatabase();
        console.log('✅ Sistema de jugadores inicializado');
        
        console.log(`✅ ${client.user.tag} está listo!`);
        
        // Configurar actividad del bot
        client.user.setActivity('PassQuirk RPG | /passquirkrpg', {
            type: ActivityType.Playing
        });
    },
};
