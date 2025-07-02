// 🚀 EVENTO READY - Cuando el bot se conecta exitosamente
const { ActivityType } = require('discord.js');
const { connectDatabase } = require('../config/database');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        try {
            // Conectar a SQLite (base de datos local)
            const connected = await connectDatabase();
            
            if (!connected) {
                console.error('❌ No se pudo conectar a la base de datos');
                return;
            }
            
            // Establecer el estado del bot
            const activities = [
                { name: 'PassQuirk RPG', type: ActivityType.Playing },
                { name: '¡Usa /ayuda!', type: ActivityType.Listening },
                { name: 'Desarrollado con ❤️', type: ActivityType.Watching },
            ];
            
            let activityIndex = 0;
            
            // Cambiar actividad cada 30 segundos
            setInterval(() => {
                const activity = activities[activityIndex % activities.length];
                client.user.setActivity(activity);
                activityIndex++;
            }, 30000);
            
            // Iniciar con la primera actividad
            client.user.setActivity(activities[0]);
            
            console.log(`✅ ${client.user.tag} está en línea y listo.`);
            
        } catch (error) {
            console.error('Error al iniciar el bot:', error);
            process.exit(1);
        }
    },
};
