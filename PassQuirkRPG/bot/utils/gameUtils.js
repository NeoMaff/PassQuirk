const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');
const config = require('../config/config');
const helpers = require('./helpers');

/**
 * Utilidades del juego para el bot PassQuirk RPG
 */
class GameUtils {
    /**
     * Crea un embed básico con el estilo del juego
     * @param {Object} options - Opciones del embed
     * @returns {EmbedBuilder}
     */
    static createEmbed(options = {}) {
        const embed = new EmbedBuilder()
            .setColor(options.color || config.colors.primary)
            .setTimestamp();

        if (options.title) embed.setTitle(options.title);
        if (options.description) embed.setDescription(options.description);
        if (options.thumbnail) embed.setThumbnail(options.thumbnail);
        if (options.image) embed.setImage(options.image);
        if (options.footer) {
            embed.setFooter({
                text: options.footer.text,
                iconURL: options.footer.iconURL
            });
        } else {
            embed.setFooter({
                text: 'PassQuirk RPG',
                iconURL: 'https://cdn.discordapp.com/attachments/1234567890/passquirk-icon.png'
            });
        }
        if (options.author) {
            embed.setAuthor({
                name: options.author.name,
                iconURL: options.author.iconURL,
                url: options.author.url
            });
        }
        if (options.fields) {
            options.fields.forEach(field => {
                embed.addFields({
                    name: field.name,
                    value: field.value,
                    inline: field.inline || false
                });
            });
        }

        return embed;
    }

    /**
     * Crea un embed de error
     * @param {string} message - Mensaje de error
     * @returns {EmbedBuilder}
     */
    static createErrorEmbed(message) {
        return this.createEmbed({
            title: `${config.emojis.error} Error`,
            description: message,
            color: config.colors.error
        });
    }

    /**
     * Crea un embed de éxito
     * @param {string} message - Mensaje de éxito
     * @returns {EmbedBuilder}
     */
    static createSuccessEmbed(message) {
        return this.createEmbed({
            title: `${config.emojis.success} Éxito`,
            description: message,
            color: config.colors.success
        });
    }

    /**
     * Crea un embed de advertencia
     * @param {string} message - Mensaje de advertencia
     * @returns {EmbedBuilder}
     */
    static createWarningEmbed(message) {
        return this.createEmbed({
            title: `${config.emojis.warning} Advertencia`,
            description: message,
            color: config.colors.warning
        });
    }

    /**
     * Crea botones de navegación
     * @param {Object} options - Opciones de navegación
     * @returns {ActionRowBuilder}
     */
    static createNavigationButtons(options = {}) {
        const row = new ActionRowBuilder();
        const {
            currentPage = 1,
            totalPages = 1,
            customId = 'nav',
            showHome = false,
            showBack = false,
            additionalButtons = []
        } = options;

        // Botón de página anterior
        if (currentPage > 1) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${customId}_prev_${currentPage - 1}`)
                    .setLabel('◀️ Anterior')
                    .setStyle(ButtonStyle.Primary)
            );
        }

        // Botón de inicio
        if (showHome) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${customId}_home`)
                    .setLabel('🏠 Inicio')
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        // Botón de volver
        if (showBack) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${customId}_back`)
                    .setLabel('🔙 Volver')
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        // Botones adicionales
        additionalButtons.forEach(button => {
            row.addComponents(button);
        });

        // Botón de página siguiente
        if (currentPage < totalPages) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${customId}_next_${currentPage + 1}`)
                    .setLabel('Siguiente ▶️')
                    .setStyle(ButtonStyle.Primary)
            );
        }

        return row;
    }

    /**
     * Crea un menú de selección
     * @param {Object} options - Opciones del menú
     * @returns {ActionRowBuilder}
     */
    static createSelectMenu(options = {}) {
        const { customId, placeholder, options: menuOptions, maxValues = 1, minValues = 1 } = options;

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMaxValues(maxValues)
            .setMinValues(minValues)
            .addOptions(menuOptions);

        return new ActionRowBuilder().addComponents(selectMenu);
    }

    /**
     * Formatea números grandes con separadores
     * @param {number} number - Número a formatear
     * @returns {string}
     */
    static formatNumber(number) {
        return helpers.formatNumber(number);
    }

    /**
     * Crea una barra de progreso
     * @param {number} current - Valor actual
     * @param {number} max - Valor máximo
     * @param {number} length - Longitud de la barra
     * @returns {string}
     */
    static createProgressBar(current, max, length = 10) {
        return helpers.createProgressBar(current, max, length);
    }

    /**
     * Crea una barra de HP/MP
     * @param {number} current - Valor actual
     * @param {number} max - Valor máximo
     * @param {string} type - Tipo (hp, mp)
     * @returns {string}
     */
    static createHealthBar(current, max, type = 'hp') {
        const emoji = type === 'hp' ? config.emojis.hp : config.emojis.mp;
        const percentage = Math.round((current / max) * 100);
        const bar = this.createProgressBar(current, max, 8);

        return `${emoji} ${bar} ${current}/${max} (${percentage}%)`;
    }

    /**
     * Obtiene el color según la rareza
     * @param {string} rarity - Rareza del ítem
     * @returns {string}
     */
    static getRarityColor(rarity) {
        const colors = {
            'common': '#FFFFFF',
            'uncommon': '#1EFF00',
            'rare': '#0070DD',
            'epic': '#A335EE',
            'legendary': '#FF8000',
            'mythic': '#E6CC80'
        };
        return colors[rarity] || colors.common;
    }

    /**
     * Obtiene el emoji según la rareza
     * @param {string} rarity - Rareza del ítem
     * @returns {string}
     */
    static getRarityEmoji(rarity) {
        const emojis = {
            'common': config.emojis.common,
            'uncommon': config.emojis.uncommon,
            'rare': config.emojis.rare,
            'epic': config.emojis.epic,
            'legendary': config.emojis.legendary,
            'mythic': config.emojis.mythic
        };
        return emojis[rarity] || emojis.common;
    }

    /**
     * Calcula la experiencia requerida para un nivel
     * @param {number} level - Nivel objetivo
     * @returns {number}
     */
    static getExpForLevel(level) {
        return config.getExpForLevel(level);
    }

    /**
     * Calcula el nivel basado en la experiencia
     * @param {number} exp - Experiencia actual
     * @returns {number}
     */
    static getLevelFromExp(exp) {
        let level = 1;
        let totalExp = 0;

        while (totalExp <= exp && level < config.game.maxLevel) {
            totalExp += this.getExpForLevel(level);
            if (totalExp <= exp) level++;
        }

        return level;
    }

    /**
     * Formatea el tiempo transcurrido
     * @param {number} milliseconds - Tiempo en milisegundos
     * @returns {string}
     */
    static formatTime(milliseconds) {
        return helpers.formatTime(milliseconds);
    }

    /**
     * Genera un número aleatorio entre min y max (inclusive)
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {number}
     */
    static randomInt(min, max) {
        return helpers.getRandomInt(min, max);
    }

    /**
     * Selecciona un elemento aleatorio de un array
     * @param {Array} array - Array de elementos
     * @returns {*}
     */
    static randomChoice(array) {
        return helpers.getRandomElement(array);
    }

    /**
     * Verifica si un usuario tiene cooldown activo
     * @param {string} userId - ID del usuario
     * @param {string} command - Comando
     * @param {Map} cooldowns - Mapa de cooldowns
     * @returns {number|null} - Tiempo restante en ms o null si no hay cooldown
     */
    static checkCooldown(userId, command, cooldowns) {
        const now = Date.now();
        const cooldownAmount = config.game.cooldowns[command] || 0;

        if (!cooldowns.has(command)) {
            cooldowns.set(command, new Map());
        }

        const timestamps = cooldowns.get(command);

        if (timestamps.has(userId)) {
            const expirationTime = timestamps.get(userId) + cooldownAmount;

            if (now < expirationTime) {
                return expirationTime - now;
            }
        }

        timestamps.set(userId, now);
        setTimeout(() => timestamps.delete(userId), cooldownAmount);

        return null;
    }

    /**
     * Trunca texto si es muy largo
     * @param {string} text - Texto a truncar
     * @param {number} maxLength - Longitud máxima
     * @returns {string}
     */
    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * Capitaliza la primera letra de una cadena
     * @param {string} str - Cadena a capitalizar
     * @returns {string}
     */
    static capitalize(str) {
        return helpers.capitalize(str);
    }

    /**
     * Valida si un usuario tiene un personaje
     * @param {Object} userData - Datos del usuario
     * @returns {boolean}
     */
    static hasCharacter(userData) {
        return userData && userData.character && userData.character.name;
    }

    /**
     * Obtiene el rango basado en el nivel
     * @param {number} level - Nivel del personaje
     * @returns {string}
     */
    static getRankByLevel(level) {
        if (level >= 90) return 'Leyenda';
        if (level >= 80) return 'Maestro';
        if (level >= 70) return 'Experto';
        if (level >= 60) return 'Veterano';
        if (level >= 50) return 'Avanzado';
        if (level >= 40) return 'Competente';
        if (level >= 30) return 'Experimentado';
        if (level >= 20) return 'Aprendiz';
        if (level >= 10) return 'Novato';
        return 'Principiante';
    }

    /**
     * Crea un embed de perfil de personaje
     * @param {Object} character - Datos del personaje
     * @param {Object} user - Usuario de Discord
     * @returns {EmbedBuilder}
     */
    static createCharacterProfileEmbed(character, user) {
        const rank = this.getRankByLevel(character.level);
        const expForNext = this.getExpForLevel(character.level + 1);
        const expProgress = this.createProgressBar(character.exp, expForNext, 10);

        return this.createEmbed({
            title: `${config.emojis.profile} Perfil de ${character.name}`,
            color: config.colors.profile,
            thumbnail: user.displayAvatarURL({ dynamic: true }),
            fields: [
                {
                    name: `${config.emojis.level} Nivel y Experiencia`,
                    value: `**Nivel:** ${character.level} (${rank})\n**EXP:** ${expProgress}\n${this.formatNumber(character.exp)}/${this.formatNumber(expForNext)}`,
                    inline: true
                },
                {
                    name: `${config.emojis.hp} Estadísticas`,
                    value: `**HP:** ${character.stats.hp}/${character.stats.maxHp}\n**MP:** ${character.stats.mp}/${character.stats.maxMp}\n**ATK:** ${character.stats.attack}\n**DEF:** ${character.stats.defense}\n**SPD:** ${character.stats.speed}`,
                    inline: true
                },
                {
                    name: `${config.emojis.gold} Recursos`,
                    value: `**Oro:** ${this.formatNumber(character.gold)}\n**Clase:** ${this.capitalize(character.class)}\n**Región:** ${this.capitalize(character.region)}`,
                    inline: true
                }
            ]
        });
    }
}

module.exports = GameUtils;