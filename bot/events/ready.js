const { ActivityType } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        try {
            // Conectar a MongoDB
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/passquirk', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            
            console.log(`✅ Conectado a MongoDB`);
            
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
