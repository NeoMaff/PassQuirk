const { ChannelType, PermissionFlagsBits } = require('discord.js');

const CLIMAS = [
    { name: 'Soleado', emoji: '☀️' },
    { name: 'Lluvioso', emoji: '🌧️' },
    { name: 'Nublado', emoji: '☁️' },
    { name: 'Tormenta', emoji: '⛈️' },
    { name: 'Noche Estrellada', emoji: '🌌' }
];

class WorldSystem {
    constructor() {
        this.currentWeather = this.getRandomWeather();
        this.lastWeatherUpdate = Date.now();
        this.weatherDuration = 3600000; // 1 hora
    }

    getLocalTime() {
        const now = new Date();
        return now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    getGlobalTime() {
        const now = new Date();
        // Space Central Time (PassQuirk World) - UTC+7 offset relative to local
        now.setHours(now.getHours() + 7);

        return now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    getRandomWeather() {
        return CLIMAS[Math.floor(Math.random() * CLIMAS.length)];
    }

    getWorldState() {
        // Actualizar clima si ha pasado el tiempo
        if (Date.now() - this.lastWeatherUpdate > this.weatherDuration) {
            this.currentWeather = this.getRandomWeather();
            this.lastWeatherUpdate = Date.now();
        }

        return {
            localTime: this.getLocalTime(),
            globalTime: this.getGlobalTime(),
            weather: this.currentWeather
        };
    }

    async updateWorldChannels(client) {
        const state = this.getWorldState();
        // Format: 🕒 L: HH:MM | 🌍 G: HH:MM | ☀️ Clima
        const channelName = `🕒 L: ${state.localTime} | 🌍 G: ${state.globalTime} | ${state.weather.emoji}`;

        for (const [guildId, guild] of client.guilds.cache) {
            try {
                // Asegurar caché actualizada
                await guild.channels.fetch();

                let category = guild.channels.cache.find(c => c.name === '🌍 MUNDO PASSQUIRK' && c.type === ChannelType.GuildCategory);

                if (!category) {
                    category = await guild.channels.create({
                        name: '🌍 MUNDO PASSQUIRK',
                        type: ChannelType.GuildCategory
                    });
                }

                // Buscar todos los canales que empiecen con el icono de reloj en la categoría
                const timeChannels = guild.channels.cache.filter(c => c.name.startsWith('🕒') && c.parentId === category.id);
                let channel;

                if (timeChannels.size > 0) {
                    // Usar el primero encontrado
                    channel = timeChannels.first();

                    // Borrar duplicados si existen
                    if (timeChannels.size > 1) {
                        const duplicates = timeChannels.filter(c => c.id !== channel.id);
                        for (const [id, dupChannel] of duplicates) {
                            try {
                                await dupChannel.delete();
                                console.log(`Eliminado canal duplicado: ${dupChannel.name}`);
                            } catch (err) {
                                console.error('Error borrando canal duplicado:', err);
                            }
                        }
                    }
                }

                if (!channel) {
                    channel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildVoice, // Canal de voz para que sea "solo lectura" visualmente
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect], // Nadie puede conectarse
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    });
                } else {
                    // Solo actualizar si el nombre ha cambiado (para evitar rate limits)
                    if (channel.name !== channelName) {
                        await channel.setName(channelName);
                    }
                }
            } catch (error) {
                console.error(`Error actualizando canales de mundo en guild ${guild.name}:`, error);
            }
        }
    }

    startUpdateLoop(client) {
        // Actualizar inmediatamente
        this.updateWorldChannels(client);

        // Actualizar cada 5 minutos (Discord tiene rate limits de 2 updates/10min por canal)
        setInterval(() => {
            this.updateWorldChannels(client);
        }, 5 * 60 * 1000);
    }
}

module.exports = new WorldSystem();
