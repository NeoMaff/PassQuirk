const { EmbedBuilder } = require('discord.js');
const { formatNumber } = require('./helpers');
const colors = require('colors');

// Paleta de colores con amarillo como principal según especificaciones
const COLORS = {
    // Color principal - AMARILLO LLAMATIVO
    PRIMARY: '#FFFF00',      // Amarillo puro llamativo
    SECONDARY: '#FFD700',    // Oro dorado
    ACCENT: '#FFA500',       // Naranja dorado

    // Estados
    SUCCESS: '#00D68F',      // Verde éxito brillante
    WARNING: '#FFD93D',      // Amarillo dorado
    DANGER: '#FF4757',       // Rojo intenso
    INFO: '#FFFF00',         // Amarillo para info

    // Tonos neutros
    DARK: '#2C2C54',         // Azul oscuro profundo
    LIGHT: '#F1F2F6',       // Gris muy claro
    MUTED: '#747D8C',        // Gris medio

    // Metales y rangos
    GOLD: '#FFD700',         // Oro puro
    SILVER: '#C0C0C0',      // Plata
    BRONZE: '#CD7F32',       // Bronce
    PLATINUM: '#E5E4E2',     // Platino
    DIAMOND: '#B9F2FF',      // Diamante

    // Elementos RPG
    MAGIC: '#9C88FF',        // Púrpura mágico
    FIRE: '#FF6348',         // Rojo fuego
    WATER: '#0ABDE3',        // Azul agua
    EARTH: '#7D5A0B',        // Marrón tierra
    AIR: '#C7ECEE',          // Azul cielo

    // Rareza de ítems
    COMMON: '#95A5A6',       // Gris común
    UNCOMMON: '#2ECC71',     // Verde poco común
    RARE: '#3498DB',         // Azul raro
    EPIC: '#9B59B6',         // Púrpura épico
    LEGENDARY: '#F39C12',    // Naranja legendario
    MYTHIC: '#E74C3C',       // Rojo mítico

    // Gradientes (para futuras implementaciones)
    GRADIENT_SUNSET: ['#FF6B6B', '#FFE66D'],
    GRADIENT_OCEAN: ['#667eea', '#764ba2'],
    GRADIENT_FOREST: ['#134e5e', '#71b280']
};

// Utilidades para efectos visuales
const createProgressBar = (current, max, size = 10, style = 'default') => {
    const percentage = Math.min(Math.max(current / max, 0), 1);
    const progress = Math.round(percentage * size);

    const styles = {
        default: { filled: '█', empty: '░' },
        modern: { filled: '▰', empty: '▱' },
        dots: { filled: '●', empty: '○' },
        blocks: { filled: '■', empty: '□' },
        hearts: { filled: '♥', empty: '♡' }
    };

    const { filled, empty } = styles[style] || styles.default;
    const bar = filled.repeat(progress) + empty.repeat(size - progress);
    const percent = Math.round(percentage * 100);

    return `[${bar}] ${percent}%`;
};

const getRarityColor = (rarity) => {
    const rarityMap = {
        'common': COLORS.COMMON,
        'uncommon': COLORS.UNCOMMON,
        'rare': COLORS.RARE,
        'epic': COLORS.EPIC,
        'legendary': COLORS.LEGENDARY,
        'mythic': COLORS.MYTHIC
    };
    return rarityMap[rarity?.toLowerCase()] || COLORS.COMMON;
};

const formatCurrency = (amount, type = 'coins') => {
    const currencies = {
        coins: '💰',
        gems: '💎',
        pg: '⚔️',
        gold: '🪙',
        tokens: '🎫'
    };
    return `${currencies[type] || '💰'} ${formatNumber(amount)}`;
};

// Sistema de emojis animados integrado usando URLs correctas de GIF
// Sistema de emojis animados integrado usando URLs de Discord CDN (basado en IDs reales)
const ANIMATED_EMOJIS = {
    // Estrellas y efectos
    STAR_PURPLE: 'https://cdn.discordapp.com/emojis/5417.gif', // Placeholder
    GREEN_SPARKLES: 'https://cdn.discordapp.com/emojis/5267.gif', // Placeholder
    SPARKLE_STARS: 'https://cdn.discordapp.com/emojis/1441601121205616841.gif', // heartsparkles
    STAR_BLUE: 'https://cdn.discordapp.com/emojis/70857.gif', // Placeholder
    STAR_RED: 'https://cdn.discordapp.com/emojis/42684.gif', // Placeholder
    STAR_YELLOW: 'https://cdn.discordapp.com/emojis/19097.gif', // Placeholder
    STAR_GENERIC: 'https://cdn.discordapp.com/emojis/40437.gif', // Placeholder

    // Coronas y rangos
    CROWN_GREEN: 'https://cdn.discordapp.com/emojis/47232.gif', // Placeholder

    // Elementos y efectos
    GREEN_FIRE: 'https://cdn.discordapp.com/emojis/1441597244372422698.gif', // 58346fire
    FIRE_PIXEL: 'https://cdn.discordapp.com/emojis/1441597246671163423.gif', // __21490firepixel
    FIRE_BLACK: 'https://cdn.discordapp.com/emojis/1441597243193823242.gif', // 91149fireblack
    EARTH_MINECRAFT: 'https://cdn.discordapp.com/emojis/35311.gif', // Placeholder
    SWORD_CLASH: 'https://cdn.discordapp.com/emojis/1441597244372422698.gif', // Usando green fire para combate

    // Celebración y recompensas
    CHRISTMAS_GIFT: 'https://cdn.discordapp.com/emojis/69253.gif', // Placeholder
    GG: 'https://cdn.discordapp.com/emojis/68602.gif', // Placeholder
    TADA: 'https://cdn.discordapp.com/emojis/65115.gif', // Placeholder

    // Utilidades
    BIN: 'https://cdn.discordapp.com/emojis/90616.gif', // Placeholder

    // Nuevos del usuario
    SEVLEV: 'https://cdn.discordapp.com/emojis/1441601125076959232.gif',
    GREEN_ROSE: 'https://cdn.discordapp.com/emojis/1441601123415752925.gif',
    STRAWBERRY: 'https://cdn.discordapp.com/emojis/1441601122241478746.gif',
    CHERRY: 'https://cdn.discordapp.com/emojis/1441601120169623634.gif',
    DRINK: 'https://cdn.discordapp.com/emojis/1441601118944886835.gif',
    PURPLE_MOON: 'https://cdn.discordapp.com/emojis/1441601117870886994.gif'
};

// Estilo base mejorado para los embeds con amarillo
const { getEmoji } = require('./emojiManager');

class PassQuirkEmbed extends EmbedBuilder {
    constructor(data = {}) {
        super(data);
        this.setColor(COLORS.PRIMARY); // Amarillo llamativo
        this.setTimestamp();
        this.setFooter({
            text: `${getEmoji('sparkle_stars')} PassQuirk RPG • Desarrollado con ❤️`,
            iconURL: 'https://i.imgur.com/6sYJbZP.png'
        });
    }

    // Método para añadir barra de progreso
    addProgressField(name, current, max, options = {}) {
        const { style = 'default', inline = false, showNumbers = true } = options;
        const progressBar = createProgressBar(current, max, 12, style);
        const numbersText = showNumbers ? `\n${formatNumber(current)} / ${formatNumber(max)}` : '';

        this.addFields({
            name: name,
            value: progressBar + numbersText,
            inline: inline
        });
        return this;
    }

    // Método para añadir estadísticas en formato compacto
    addStatsField(stats, options = {}) {
        const { inline = true, columns = 2 } = options;
        const entries = Object.entries(stats);
        const chunks = [];

        for (let i = 0; i < entries.length; i += columns) {
            const chunk = entries.slice(i, i + columns)
                .map(([key, value]) => `**${key}:** ${value}`)
                .join(' • ');
            chunks.push(chunk);
        }

        this.addFields({
            name: '📊 Estadísticas',
            value: chunks.join('\n'),
            inline: inline
        });
        return this;
    }

    // Método para añadir separador visual
    addSeparator(text = '━━━━━━━━━━━━━━━━━━━━') {
        this.addFields({
            name: '\u200b',
            value: text,
            inline: false
        });
        return this;
    }

    // Método para establecer tema de color
    setTheme(theme) {
        const themes = {
            success: COLORS.SUCCESS,
            warning: COLORS.WARNING,
            danger: COLORS.DANGER,
            info: COLORS.INFO,
            magic: COLORS.MAGIC,
            fire: COLORS.FIRE,
            water: COLORS.WATER,
            earth: COLORS.EARTH,
            gold: COLORS.GOLD,
            silver: COLORS.SILVER,
            bronze: COLORS.BRONZE
        };

        if (themes[theme]) {
            this.setColor(themes[theme]);
        }
        return this;
    }
}

// Estilo mejorado para diálogos de NPC
class DialogEmbed extends PassQuirkEmbed {
    constructor(npcName, dialog, options = {}) {
        super();
        this.setColor(options.color || COLORS.INFO);

        // Título con emoji personalizado
        const npcEmoji = options.npcEmoji || '🗣️';
        this.setAuthor({
            name: `${npcEmoji} ${npcName}`,
            iconURL: options.npcAvatar
        });

        // Formatear diálogo con estilo
        const formattedDialog = `*"${dialog}"*`;
        this.setDescription(formattedDialog);

        // Añadir información adicional del NPC
        if (options.npcTitle) {
            this.addFields({
                name: '👑 Título',
                value: options.npcTitle,
                inline: true
            });
        }

        if (options.location) {
            this.addFields({
                name: '📍 Ubicación',
                value: options.location,
                inline: true
            });
        }

        // Opciones de respuesta
        if (options.choices && options.choices.length > 0) {
            const choicesText = options.choices
                .map((choice, index) => `**${index + 1}.** ${choice.emoji || '▶️'} ${choice.text}`)
                .join('\n');

            this.addFields({
                name: '💭 Opciones de respuesta',
                value: choicesText,
                inline: false
            });
        }

        if (options.image) this.setImage(options.image);
        if (options.thumbnail) this.setThumbnail(options.thumbnail);

        // Footer personalizado para NPCs
        if (options.npcType) {
            this.setFooter({
                text: `${options.npcType} • PassQuirk RPG`,
                iconURL: 'https://i.imgur.com/6sYJbZP.png'
            });
        }
    }
}

// Estilo mejorado para la tienda
class ShopEmbed extends PassQuirkEmbed {
    constructor(shopName, description, options = {}) {
        super();
        this.setColor(options.color || COLORS.SECONDARY);

        // Título con emoji de tienda personalizado
        const shopEmoji = options.shopEmoji || '🛒';
        this.setTitle(`${shopEmoji} ${shopName}`);
        this.setDescription(description);

        // Información del comerciante
        if (options.merchant) {
            this.setAuthor({
                name: `Comerciante: ${options.merchant.name}`,
                iconURL: options.merchant.avatar
            });
        }

        if (options.items && options.items.length > 0) {
            // Agrupar ítems por categoría si existe
            const itemsByCategory = options.items.reduce((acc, item) => {
                const category = item.category || 'General';
                if (!acc[category]) acc[category] = [];
                acc[category].push(item);
                return acc;
            }, {});

            Object.entries(itemsByCategory).forEach(([category, items]) => {
                const itemsText = items
                    .map((item, index) => {
                        const price = formatCurrency(item.price, item.currencyType);
                        const rarity = item.rarity ? `[${item.rarity.toUpperCase()}]` : '';
                        const stock = item.stock !== undefined ? ` (Stock: ${item.stock})` : '';

                        return `**${index + 1}.** ${item.emoji || '📦'} **${item.name}** ${rarity}\n` +
                            `💰 ${price}${stock}\n` +
                            `↳ *${item.description || 'Sin descripción'}*`;
                    })
                    .join('\n\n');

                this.addFields({
                    name: `${category === 'General' ? '📦' : '🏷️'} ${category}`,
                    value: itemsText || '*No hay productos disponibles*',
                    inline: false
                });
            });
        }

        // Información adicional de la tienda
        if (options.shopInfo) {
            const info = [];
            if (options.shopInfo.discount) info.push(`🏷️ **Descuento:** ${options.shopInfo.discount}%`);
            if (options.shopInfo.specialOffer) info.push(`⭐ **Oferta especial:** ${options.shopInfo.specialOffer}`);
            if (options.shopInfo.openHours) info.push(`🕐 **Horario:** ${options.shopInfo.openHours}`);

            if (info.length > 0) {
                this.addFields({
                    name: 'ℹ️ Información de la tienda',
                    value: info.join('\n'),
                    inline: false
                });
            }
        }

        // Monedas aceptadas
        if (options.acceptedCurrencies) {
            const currencies = options.acceptedCurrencies
                .map(currency => formatCurrency(0, currency).split(' ')[0])
                .join(' ');

            this.addFields({
                name: '💱 Monedas aceptadas',
                value: currencies,
                inline: true
            });
        }

        if (options.thumbnail) this.setThumbnail(options.thumbnail);
        if (options.image) this.setImage(options.image);

        if (options.footer) {
            this.setFooter({
                text: options.footer,
                iconURL: 'https://i.imgur.com/6sYJbZP.png'
            });
        }
    }
}

// Estilo para el inventario
class InventoryEmbed extends PassQuirkEmbed {
    constructor(user, items, options = {}) {
        super();
        this.setColor(COLORS.INFO);
        this.setAuthor({
            name: `Inventario de ${user.username}`,
            iconURL: user.displayAvatarURL()
        });

        if (items.length === 0) {
            this.setDescription('Tu inventario está vacío. Visita la tienda para comprar objetos.');
            return;
        }

        // Agrupar ítems por tipo
        const itemsByType = items.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        // Añadir secciones por tipo de ítem
        Object.entries(itemsByType).forEach(([type, typeItems]) => {
            const typeName = type.charAt(0).toUpperCase() + type.slice(1);
            const itemsText = typeItems
                .map(item => `${item.emoji || '•'} **${item.name}** ×${item.amount || 1}`)
                .join('\n');

            this.addFields({
                name: `📦 ${typeName} (${typeItems.length})`,
                value: itemsText,
                inline: true
            });
        });

        // Mostrar estadísticas si se proporcionan
        if (options.stats) {
            const { totalItems, totalValue, mostCommonType } = options.stats;
            const statsText = [
                `• **Total de ítems:** ${formatNumber(totalItems)}`,
                `• **Valor total:** ${formatNumber(totalValue)} 💰`,
                `• **Tipo más común:** ${mostCommonType || 'Ninguno'}`
            ].join('\n');

            this.addFields({
                name: '📊 Estadísticas',
                value: statsText,
                inline: false
            });
        }
    }
}

// Estilo para el perfil del jugador
class ProfileEmbed extends PassQuirkEmbed {
    constructor(user, stats, options = {}) {
        super();
        this.setColor(COLORS.PRIMARY);
        this.setAuthor({
            name: `Perfil de ${user.username}`,
            iconURL: user.displayAvatarURL()
        });

        // Determinar color del embed basado en el nivel
        const levelColor = stats.level >= 50 ? COLORS.LEGENDARY :
            stats.level >= 30 ? COLORS.EPIC :
                stats.level >= 20 ? COLORS.RARE :
                    stats.level >= 10 ? COLORS.UNCOMMON :
                        COLORS.COMMON;

        this.setColor(levelColor);

        this.setThumbnail(user.displayAvatarURL());

        // Información básica
        const fields = [
            {
                name: '🏆 Nivel',
                value: `**${stats.level || 1}** ${this.getLevelBadge(stats.level)}`,
                inline: true
            }
        ];

        // Solo mostrar rango si es diferente al default o si tiene prestigio
        if (stats.rank && stats.rank !== 'Héroe en Entrenamiento') {
            fields.push({
                name: '💼 Rango',
                value: `#${stats.rank} 🎖️`,
                inline: true
            });
        }

        fields.push({
            name: '📅 Miembro desde',
            value: user.createdAt ? `<t:${Math.floor(user.createdAt.getTime() / 1000)}:D>` : 'Desconocido',
            inline: true
        });

        this.addFields(fields);

        // Barra de experiencia con estilo mejorado
        this.addProgressField('✨ Experiencia', stats.xp || 0, stats.xpToNext || 100, {
            style: 'modern',
            inline: false
        });

        // Estadísticas de juego mejoradas
        if (stats.playtime || stats.battles || stats.victories) {
            const gameStatsData = {};
            if (stats.playtime) gameStatsData['⏱️ Tiempo'] = `${stats.playtime}h`;
            if (stats.battles) gameStatsData['⚔️ Batallas'] = formatNumber(stats.battles);
            if (stats.victories) gameStatsData['🏆 Victorias'] = formatNumber(stats.victories);
            if (stats.defeats) gameStatsData['💀 Derrotas'] = formatNumber(stats.defeats);

            // Calcular ratio de victorias
            if (stats.battles && stats.victories) {
                const winRate = ((stats.victories / stats.battles) * 100).toFixed(1);
                gameStatsData['📊 Ratio'] = `${winRate}%`;
            }

            this.addStatsField(gameStatsData, { inline: false });
        }

        // Economía mejorada (Solo mostrar si tiene algo)
        if ((stats.balance > 0) || (stats.gems > 0) || (stats.pg > 0) || (stats.tokens > 0)) {
            const economyData = {};
            if (stats.balance > 0) economyData['Monedas'] = formatCurrency(stats.balance, 'coins');
            if (stats.gems > 0) economyData['Gemas'] = formatCurrency(stats.gems, 'gems');
            if (stats.pg > 0) economyData['PG'] = formatCurrency(stats.pg, 'pg');
            if (stats.tokens > 0) economyData['Tokens'] = formatCurrency(stats.tokens, 'tokens');

            if (Object.keys(economyData).length > 0) {
                this.addStatsField(economyData, { inline: false });
            }
        }

        // Logros y títulos
        if (stats.achievements && stats.achievements.length > 0) {
            const recentAchievements = stats.achievements
                .slice(-3)
                .map(achievement => `🏅 ${achievement.name}`)
                .join('\n');

            this.addFields({
                name: `🏅 Logros recientes (${stats.achievements.length} total)`,
                value: recentAchievements,
                inline: false
            });
        }

        // Estado actual del jugador
        if (stats.status) {
            const statusEmojis = {
                online: '🟢',
                idle: '🟡',
                dnd: '🔴',
                offline: '⚫',
                playing: '🎮',
                battling: '⚔️'
            };

            this.addFields({
                name: '📱 Estado',
                value: `${statusEmojis[stats.status] || '❓'} ${stats.status}`,
                inline: true
            });
        }
    }

    // Método auxiliar para obtener badge de nivel
    getLevelBadge(level) {
        const { getLevelEmoji } = require('./emojiManager');
        return getLevelEmoji(level);
    }
}

// Estilo para mensajes de error
class ErrorEmbed extends PassQuirkEmbed {
    constructor(error, options = {}) {
        super();
        this.setColor(COLORS.DANGER);

        // Usar setAuthor para el icono animado y el título
        this.setAuthor({
            name: options.title || 'Error del Sistema',
            iconURL: ANIMATED_EMOJIS.BIN || 'https://cdn3.emoji.gg/emojis/90616-bin.gif'
        });

        // Título simple por si acaso
        // this.setTitle('❌ Ocurrió un error'); 

        this.setDescription(`**Ha ocurrido un problema:**\n${error.message || String(error)}`);
        this.setThumbnail('https://cdn3.emoji.gg/emojis/90616-bin.gif'); // O una imagen de error genérica

        if (options.fields) {
            this.addFields(options.fields);
        }

        if (options.tip) {
            this.addFields({
                name: '💡 Consejo',
                value: `*${options.tip}*`,
                inline: false
            });
        }

        this.setFooter({
            text: 'Si el error persiste, contacta a un administrador.',
            iconURL: 'https://i.imgur.com/6sYJbZP.png'
        });
    }
}

// Estilo para mensajes de éxito
class SuccessEmbed extends PassQuirkEmbed {
    constructor(message, options = {}) {
        super();
        this.setColor(COLORS.SUCCESS);
        this.setTitle('✅ ' + (options.title || 'Éxito'));
        this.setDescription(message);

        if (options.fields) {
            this.addFields(options.fields);
        }
    }
}

// Estilo mejorado para menús de selección
class MenuEmbed extends PassQuirkEmbed {
    constructor(title, description, options = {}) {
        super();
        this.setColor(options.color || COLORS.PRIMARY);
        this.setTitle(title);
        this.setDescription(description);

        if (options.fields) {
            this.addFields(options.fields);
        }

        // Opciones del menú
        if (options.options && options.options.length > 0) {
            const optionsText = options.options
                .map((option, index) => {
                    const emoji = option.emoji || `${index + 1}️⃣`;
                    const disabled = option.disabled ? ' *(Deshabilitado)*' : '';
                    return `${emoji} **${option.label}**${disabled}\n↳ ${option.description || 'Sin descripción'}`;
                })
                .join('\n\n');

            this.addFields({
                name: '📋 Opciones disponibles',
                value: optionsText,
                inline: false
            });
        }

        if (options.thumbnail) this.setThumbnail(options.thumbnail);
        if (options.image) this.setImage(options.image);

        if (options.footer) {
            this.setFooter({
                text: options.footer,
                iconURL: 'https://i.imgur.com/6sYJbZP.png'
            });
        }
    }
}

// Estilo para embeds de batalla
class BattleEmbed extends PassQuirkEmbed {
    constructor(battleData, options = {}) {
        super();
        this.setColor(COLORS.FIRE);
        this.setTitle(`⚔️ ${battleData.title || 'Batalla en curso'}`);

        // Información de los combatientes
        if (battleData.player && battleData.enemy) {
            this.addFields(
                {
                    name: `👤 ${battleData.player.name}`,
                    value: this.formatCombatant(battleData.player),
                    inline: true
                },
                {
                    name: '🆚',
                    value: '\u200b',
                    inline: true
                },
                {
                    name: `👹 ${battleData.enemy.name}`,
                    value: this.formatCombatant(battleData.enemy),
                    inline: true
                }
            );
        }

        // Acciones de batalla
        if (battleData.lastAction) {
            this.addFields({
                name: '⚡ Última acción',
                value: battleData.lastAction,
                inline: false
            });
        }

        // Estado de la batalla
        if (battleData.status) {
            const statusEmojis = {
                ongoing: '🔄',
                victory: '🏆',
                defeat: '💀',
                draw: '🤝'
            };

            this.addFields({
                name: '📊 Estado',
                value: `${statusEmojis[battleData.status]} ${battleData.status}`,
                inline: true
            });
        }

        if (options.thumbnail) this.setThumbnail(options.thumbnail);
        if (options.image) this.setImage(options.image);
    }

    formatCombatant(combatant) {
        const hp = createProgressBar(combatant.currentHp, combatant.maxHp, 8, 'hearts');
        const mp = combatant.currentMp !== undefined ?
            `\n🔮 MP: ${createProgressBar(combatant.currentMp, combatant.maxMp, 8, 'dots')}` : '';

        return `❤️ HP: ${hp}${mp}\n⚔️ ATK: ${combatant.attack}\n🛡️ DEF: ${combatant.defense}`;
    }
}

// Estilo para notificaciones y logros
class NotificationEmbed extends PassQuirkEmbed {
    constructor(type, message, options = {}) {
        super();

        const notificationTypes = {
            achievement: { color: COLORS.GOLD, emoji: '🏆', title: 'Logro desbloqueado' },
            levelup: { color: COLORS.SUCCESS, emoji: '⬆️', title: 'Subida de nivel' },
            reward: { color: COLORS.SECONDARY, emoji: '🎁', title: 'Recompensa obtenida' },
            warning: { color: COLORS.WARNING, emoji: '⚠️', title: 'Advertencia' },
            info: { color: COLORS.INFO, emoji: 'ℹ️', title: 'Información' },
            event: { color: COLORS.MAGIC, emoji: '🎉', title: 'Evento especial' }
        };

        const config = notificationTypes[type] || notificationTypes.info;

        this.setColor(config.color);
        this.setTitle(`${config.emoji} ${options.title || config.title}`);
        this.setDescription(message);

        // Recompensas específicas
        if (options.rewards) {
            const rewardsText = options.rewards
                .map(reward => `${reward.emoji || '🎁'} **${reward.name}** ${reward.amount ? `×${reward.amount}` : ''}`)
                .join('\n');

            this.addFields({
                name: '🎁 Recompensas',
                value: rewardsText,
                inline: false
            });
        }

        // Progreso hacia siguiente objetivo
        if (options.progress) {
            this.addProgressField(
                options.progress.name,
                options.progress.current,
                options.progress.max,
                { style: 'modern' }
            );
        }

        if (options.thumbnail) this.setThumbnail(options.thumbnail);
        if (options.image) this.setImage(options.image);
    }
}

// Estilo para embeds de ítems
class ItemEmbed extends PassQuirkEmbed {
    constructor(item, options = {}) {
        super();

        // Color basado en rareza
        this.setColor(getRarityColor(item.rarity));

        // Título con rareza
        const rarityText = item.rarity ? `[${item.rarity.toUpperCase()}] ` : '';
        this.setTitle(`${item.emoji || '📦'} ${rarityText}${item.name}`);

        this.setDescription(item.description || 'Sin descripción disponible.');

        // Estadísticas del ítem
        if (item.stats) {
            this.addStatsField(item.stats, { inline: true });
        }

        // Información adicional
        const info = [];
        if (item.type) info.push(`**Tipo:** ${item.type}`);
        if (item.level) info.push(`**Nivel requerido:** ${item.level}`);
        if (item.durability) info.push(`**Durabilidad:** ${item.durability.current}/${item.durability.max}`);
        if (item.value) info.push(`**Valor:** ${formatCurrency(item.value)}`);

        if (info.length > 0) {
            this.addFields({
                name: 'ℹ️ Información',
                value: info.join('\n'),
                inline: true
            });
        }

        // Efectos especiales
        if (item.effects && item.effects.length > 0) {
            const effectsText = item.effects
                .map(effect => `✨ ${effect.name}: ${effect.description}`)
                .join('\n');

            this.addFields({
                name: '🔮 Efectos especiales',
                value: effectsText,
                inline: false
            });
        }

        if (options.thumbnail || item.image) {
            this.setThumbnail(options.thumbnail || item.image);
        }
    }
}

module.exports = {
    // Constantes y utilidades
    COLORS,
    ANIMATED_EMOJIS,
    createProgressBar,
    getRarityColor,
    formatCurrency,

    // Clases de embeds
    PassQuirkEmbed,
    DialogEmbed,
    ShopEmbed,
    InventoryEmbed,
    ProfileEmbed,
    ErrorEmbed,
    SuccessEmbed,
    MenuEmbed,
    BattleEmbed,
    NotificationEmbed,
    ItemEmbed
};
