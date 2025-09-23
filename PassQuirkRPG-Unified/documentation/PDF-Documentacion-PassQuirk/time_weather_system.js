const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// Sistema de Hora, Fecha, Periodo del Día y Clima
class TimeWeatherSystem {
    constructor() {
        this.weatherTypes = [
            { name: 'Soleado', emoji: '☀️', probability: 0.3 },
            { name: 'Nublado', emoji: '☁️', probability: 0.25 },
            { name: 'Lluvia', emoji: '🌧️', probability: 0.2 },
            { name: 'Niebla', emoji: '🌫️', probability: 0.1 },
            { name: 'Tormenta', emoji: '⛈️', probability: 0.1 },
            { name: 'Nevada', emoji: '❄️', probability: 0.05 }
        ];
        
        this.currentWeather = this.generateRandomWeather();
        this.lastWeatherUpdate = Date.now();
        this.weatherChangeInterval = 2 * 60 * 60 * 1000; // 2 horas en ms
        
        // Mapa de países a zonas horarias
        this.timezoneMap = {
            'España': 'Europe/Madrid',
            'México': 'America/Mexico_City',
            'Argentina': 'America/Argentina/Buenos_Aires',
            'Colombia': 'America/Bogota',
            'Chile': 'America/Santiago',
            'Perú': 'America/Lima',
            'Venezuela': 'America/Caracas',
            'Estados Unidos': 'America/New_York',
            'Brasil': 'America/Sao_Paulo',
            'Reino Unido': 'Europe/London',
            'Francia': 'Europe/Paris',
            'Alemania': 'Europe/Berlin',
            'Italia': 'Europe/Rome',
            'Japón': 'Asia/Tokyo',
            'China': 'Asia/Shanghai',
            'India': 'Asia/Kolkata',
            'Australia': 'Australia/Sydney',
            'Canadá': 'America/Toronto'
        };
    }

    // Generar clima aleatorio basado en probabilidades
    generateRandomWeather() {
        const random = Math.random();
        let accumulated = 0;
        
        for (const weather of this.weatherTypes) {
            accumulated += weather.probability;
            if (random <= accumulated) {
                return weather;
            }
        }
        return this.weatherTypes[0]; // Fallback
    }

    // Actualizar clima si es necesario
    updateWeatherIfNeeded() {
        const now = Date.now();
        if (now - this.lastWeatherUpdate >= this.weatherChangeInterval) {
            this.currentWeather = this.generateRandomWeather();
            this.lastWeatherUpdate = now;
            return true; // Indica que el clima cambió
        }
        return false;
    }

    // Obtener información de tiempo para un país
    getTimeInfo(country) {
        const timezone = this.timezoneMap[country] || 'UTC';
        const now = new Date();
        
        // Formatear fecha y hora
        const dateOptions = { 
            timeZone: timezone, 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const timeOptions = { 
            timeZone: timezone, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        };
        
        const date = now.toLocaleDateString('es-ES', dateOptions);
        const time = now.toLocaleTimeString('es-ES', timeOptions);
        const hour = now.toLocaleTimeString('es-ES', { timeZone: timezone, hour: 'numeric', hour12: false });
        
        return {
            date,
            time,
            hour: parseInt(hour),
            timezone,
            period: this.getDayPeriod(parseInt(hour))
        };
    }

    // Determinar periodo del día
    getDayPeriod(hour) {
        if (hour >= 6 && hour < 12) {
            return { name: 'Amanecer', emoji: '🌅' };
        } else if (hour >= 12 && hour < 18) {
            return { name: 'Mediodía', emoji: '☀️' };
        } else if (hour >= 18 && hour < 21) {
            return { name: 'Atardecer', emoji: '🌇' };
        } else {
            return { name: 'Noche', emoji: '🌙' };
        }
    }

    // Crear embed de información temporal
    createTimeWeatherEmbed(userData) {
        this.updateWeatherIfNeeded();
        
        const country = userData.country || 'España';
        const timeInfo = this.getTimeInfo(country);
        
        const embed = new EmbedBuilder()
            .setTitle('🌍 Información de Tiempo y Clima')
            .setColor('#4A90E2')
            .addFields(
                {
                    name: '📍 País',
                    value: `${country}`,
                    inline: true
                },
                {
                    name: '📅 Fecha',
                    value: `${timeInfo.date}`,
                    inline: true
                },
                {
                    name: '🕐 Hora Local',
                    value: `${timeInfo.time}`,
                    inline: true
                },
                {
                    name: '🌅 Periodo del Día',
                    value: `${timeInfo.period.emoji} ${timeInfo.period.name}`,
                    inline: true
                },
                {
                    name: '🌤️ Clima Global',
                    value: `${this.currentWeather.emoji} ${this.currentWeather.name}`,
                    inline: true
                },
                {
                    name: '⏰ Próximo Cambio de Clima',
                    value: `<t:${Math.floor((this.lastWeatherUpdate + this.weatherChangeInterval) / 1000)}:R>`,
                    inline: true
                }
            )
            .setFooter({ 
                text: '🔄 Este embed se actualiza automáticamente',
                iconURL: 'https://cdn.discordapp.com/emojis/123456789.png' // Reemplazar con icono real
            })
            .setTimestamp();

        return embed;
    }

    // Crear menú de selección de país
    createCountrySelectMenu() {
        const countries = Object.keys(this.timezoneMap).slice(0, 25); // Discord limit
        
        const options = countries.map(country => ({
            label: country,
            value: country,
            emoji: this.getCountryEmoji(country)
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_country')
            .setPlaceholder('🌍 Selecciona tu país...')
            .addOptions(options);

        return new ActionRowBuilder().addComponents(selectMenu);
    }

    // Obtener emoji del país (básico)
    getCountryEmoji(country) {
        const emojiMap = {
            'España': '🇪🇸',
            'México': '🇲🇽',
            'Argentina': '🇦🇷',
            'Colombia': '🇨🇴',
            'Chile': '🇨🇱',
            'Perú': '🇵🇪',
            'Venezuela': '🇻🇪',
            'Estados Unidos': '🇺🇸',
            'Brasil': '🇧🇷',
            'Reino Unido': '🇬🇧',
            'Francia': '🇫🇷',
            'Alemania': '🇩🇪',
            'Italia': '🇮🇹',
            'Japón': '🇯🇵',
            'China': '🇨🇳',
            'India': '🇮🇳',
            'Australia': '🇦🇺',
            'Canadá': '🇨🇦'
        };
        return emojiMap[country] || '🌍';
    }

    // Obtener efectos del clima para el juego
    getWeatherEffects() {
        const effects = {
            'Soleado': { 
                description: 'El buen tiempo aumenta las posibilidades de encontrar tesoros',
                lootBonus: 1.2,
                enemySpawn: 1.0
            },
            'Nublado': { 
                description: 'El tiempo nublado no afecta significativamente',
                lootBonus: 1.0,
                enemySpawn: 1.0
            },
            'Lluvia': { 
                description: 'La lluvia dificulta la exploración pero puede revelar objetos ocultos',
                lootBonus: 1.1,
                enemySpawn: 0.8
            },
            'Niebla': { 
                description: 'La niebla hace aparecer enemigos misteriosos más frecuentemente',
                lootBonus: 0.9,
                enemySpawn: 1.3
            },
            'Tormenta': { 
                description: 'Las tormentas son peligrosas pero pueden revelar quirks eléctricos',
                lootBonus: 1.3,
                enemySpawn: 1.5
            },
            'Nevada': { 
                description: 'La nieve ralentiza todo pero conserva mejor los objetos',
                lootBonus: 1.1,
                enemySpawn: 0.7
            }
        };
        
        return effects[this.currentWeather.name] || effects['Nublado'];
    }
}

// Ejemplo de uso del sistema
class TimeWeatherHandler {
    constructor(timeWeatherSystem) {
        this.timeWeatherSystem = timeWeatherSystem;
    }

    // Comando para mostrar información de tiempo
    async handleTimeCommand(interaction, userData) {
        const embed = this.timeWeatherSystem.createTimeWeatherEmbed(userData);
        const countryMenu = this.timeWeatherSystem.createCountrySelectMenu();
        
        await interaction.reply({
            embeds: [embed],
            components: [countryMenu],
            ephemeral: false
        });
    }

    // Manejar selección de país
    async handleCountrySelection(interaction, userData) {
        const selectedCountry = interaction.values[0];
        
        // Actualizar datos del usuario (esto debes implementarlo según tu sistema)
        userData.country = selectedCountry;
        userData.timezone = this.timeWeatherSystem.timezoneMap[selectedCountry];
        
        const embed = this.timeWeatherSystem.createTimeWeatherEmbed(userData);
        
        await interaction.update({
            embeds: [embed],
            components: []
        });
        
        await interaction.followUp({
            content: `✅ País actualizado a **${selectedCountry}**`,
            ephemeral: true
        });
    }

    // Actualizar embed automáticamente (llamar periódicamente)
    async updateTimeEmbed(message, userData) {
        const embed = this.timeWeatherSystem.createTimeWeatherEmbed(userData);
        
        try {
            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error('Error actualizando embed de tiempo:', error);
        }
    }
}

module.exports = { TimeWeatherSystem, TimeWeatherHandler };