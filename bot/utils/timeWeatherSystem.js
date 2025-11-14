const moment = require('moment-timezone');

// Weather types and their effects
const WEATHER_TYPES = {
    SUNNY: {
        emoji: '☀️',
        name: 'Soleado',
        effects: {
            lootBonus: 1.1,
            encounterRate: 1.0,
            goldBonus: 1.1
        }
    },
    RAINY: {
        emoji: '🌧️',
        name: 'Lluvia',
        effects: {
            lootBonus: 1.2,
            encounterRate: 0.9,
            waterEnemiesBonus: 1.3
        }
    },
    FOGGY: {
        emoji: '🌫️',
        name: 'Niebla',
        effects: {
            lootBonus: 1.0,
            encounterRate: 1.2,
            rareEncounterBonus: 1.5
        }
    },
    STORMY: {
        emoji: '⛈️',
        name: 'Tormenta',
        effects: {
            lootBonus: 1.3,
            encounterRate: 1.3,
            electricEnemiesBonus: 1.4,
            expBonus: 1.2
        }
    },
    SNOWY: {
        emoji: '❄️',
        name: 'Nevada',
        effects: {
            lootBonus: 1.15,
            encounterRate: 0.8,
            iceEnemiesBonus: 1.3
        }
    },
    CLOUDY: {
        emoji: '☁️',
        name: 'Nublado',
        effects: {
            lootBonus: 1.0,
            encounterRate: 1.0
        }
    },
    WINDY: {
        emoji: '💨',
        name: 'Ventoso',
        effects: {
            lootBonus: 1.1,
            encounterRate: 1.1,
            windEnemiesBonus: 1.3
        }
    }
};

// Time periods and their effects
const TIME_PERIODS = {
    DAWN: {
        emoji: '🌅',
        name: 'Amanecer',
        hours: [5, 6, 7],
        effects: {
            encounterRate: 0.9,
            expBonus: 1.1
        }
    },
    MORNING: {
        emoji: '☀️',
        name: 'Mañana',
        hours: [8, 9, 10, 11],
        effects: {
            encounterRate: 1.0,
            goldBonus: 1.1
        }
    },
    NOON: {
        emoji: '🌤️',
        name: 'Mediodía',
        hours: [12, 13],
        effects: {
            encounterRate: 1.0,
            expBonus: 1.0
        }
    },
    AFTERNOON: {
        emoji: '🌇',
        name: 'Tarde',
        hours: [14, 15, 16, 17],
        effects: {
            encounterRate: 1.0,
            lootBonus: 1.1
        }
    },
    DUSK: {
        emoji: '🌆',
        name: 'Atardecer',
        hours: [18, 19],
        effects: {
            encounterRate: 1.1,
            rareEncounterBonus: 1.2
        }
    },
    NIGHT: {
        emoji: '🌙',
        name: 'Noche',
        hours: [20, 21, 22, 23, 0, 1, 2, 3, 4],
        effects: {
            encounterRate: 1.3,
            rareEncounterBonus: 1.4,
            darkEnemiesBonus: 1.5
        }
    }
};

// Countries and their timezones
const COUNTRIES = {
    'España': 'Europe/Madrid',
    'México': 'America/Mexico_City',
    'Argentina': 'America/Argentina/Buenos_Aires',
    'Colombia': 'America/Bogota',
    'Chile': 'America/Santiago',
    'Perú': 'America/Lima',
    'Venezuela': 'America/Caracas',
    'Ecuador': 'America/Guayaquil',
    'Uruguay': 'America/Montevideo',
    'Paraguay': 'America/Asuncion',
    'Bolivia': 'America/La_Paz',
    'Costa Rica': 'America/Costa_Rica',
    'Panamá': 'America/Panama',
    'Guatemala': 'America/Guatemala',
    'Honduras': 'America/Tegucigalpa',
    'El Salvador': 'America/El_Salvador',
    'Nicaragua': 'America/Managua',
    'República Dominicana': 'America/Santo_Domingo',
    'Puerto Rico': 'America/Puerto_Rico',
    'Cuba': 'America/Havana',
    'Estados Unidos (Este)': 'America/New_York',
    'Estados Unidos (Centro)': 'America/Chicago',
    'Estados Unidos (Oeste)': 'America/Los_Angeles',
    'Brasil (São Paulo)': 'America/Sao_Paulo',
    'Brasil (Río)': 'America/Sao_Paulo',
    'Otro': 'UTC'
};

class TimeWeatherSystem {
    constructor() {
        this.currentWeather = null;
        this.weatherChangeInterval = 3 * 60 * 60 * 1000; // 3 hours
        this.lastWeatherChange = Date.now();
        this.initializeWeather();
    }

    // Initialize weather with a random type
    initializeWeather() {
        const weatherKeys = Object.keys(WEATHER_TYPES);
        const randomWeather = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
        this.currentWeather = randomWeather;
    }

    // Get current weather
    getCurrentWeather() {
        // Check if weather should change
        if (Date.now() - this.lastWeatherChange > this.weatherChangeInterval) {
            this.changeWeather();
        }

        return {
            type: this.currentWeather,
            ...WEATHER_TYPES[this.currentWeather],
            nextChange: new Date(this.lastWeatherChange + this.weatherChangeInterval)
        };
    }

    // Change weather
    changeWeather() {
        const weatherKeys = Object.keys(WEATHER_TYPES);
        let newWeather = this.currentWeather;

        // Ensure new weather is different from current
        while (newWeather === this.currentWeather) {
            newWeather = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
        }

        this.currentWeather = newWeather;
        this.lastWeatherChange = Date.now();

        return this.getCurrentWeather();
    }

    // Get time period for a timezone
    getTimePeriod(timezone) {
        const now = moment().tz(timezone);
        const hour = now.hour();

        for (const [key, period] of Object.entries(TIME_PERIODS)) {
            if (period.hours.includes(hour)) {
                return {
                    type: key,
                    ...period,
                    currentTime: now.format('HH:mm'),
                    date: now.format('DD/MM/YYYY')
                };
            }
        }

        return TIME_PERIODS.NIGHT;
    }

    // Get full game time info for a character
    getGameTimeInfo(character) {
        const timezone = character.timezone || 'UTC';
        const timePeriod = this.getTimePeriod(timezone);
        const weather = this.getCurrentWeather();

        return {
            timezone,
            country: character.country,
            timePeriod,
            weather,
            combinedEffects: this.calculateCombinedEffects(timePeriod.effects, weather.effects)
        };
    }

    // Calculate combined effects from time and weather
    calculateCombinedEffects(timeEffects, weatherEffects) {
        const combined = {
            lootBonus: 1.0,
            encounterRate: 1.0,
            expBonus: 1.0,
            goldBonus: 1.0,
            rareEncounterBonus: 1.0
        };

        // Multiply effects
        for (const [key, value] of Object.entries(timeEffects)) {
            if (combined.hasOwnProperty(key)) {
                combined[key] *= value;
            }
        }

        for (const [key, value] of Object.entries(weatherEffects)) {
            if (combined.hasOwnProperty(key)) {
                combined[key] *= value;
            }
        }

        return combined;
    }

    // Format time info for display
    formatTimeWeatherDisplay(character) {
        const info = this.getGameTimeInfo(character);

        return {
            text: [
                `${info.timePeriod.emoji} **${info.timePeriod.name}** - ${info.timePeriod.currentTime}`,
                `${info.weather.emoji} **${info.weather.name}**`,
                `📅 ${info.timePeriod.date}`,
                `🌍 ${info.country}`
            ].join('\n'),
            effects: info.combinedEffects
        };
    }

    // Get available countries
    static getAvailableCountries() {
        return Object.keys(COUNTRIES);
    }

    // Get timezone for country
    static getTimezoneForCountry(country) {
        return COUNTRIES[country] || 'UTC';
    }

    // Apply effects to a value
    applyEffects(baseValue, effects, effectType) {
        const multiplier = effects[effectType] || 1.0;
        return Math.floor(baseValue * multiplier);
    }
}

// Create a singleton instance
const timeWeatherSystem = new TimeWeatherSystem();

module.exports = {
    timeWeatherSystem,
    TimeWeatherSystem,
    WEATHER_TYPES,
    TIME_PERIODS,
    COUNTRIES
};
