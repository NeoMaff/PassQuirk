const { EmbedBuilder } = require('discord.js');
const { formatNumber } = require('./helpers');

// Colores principales del tema
const COLORS = {
    PRIMARY: '#6C5CE7',    // Púrpura principal
    SECONDARY: '#00B894',  // Verde agua
    SUCCESS: '#00B894',   // Verde
    WARNING: '#FDCB6E',   // Amarillo
    DANGER: '#FF7675',    // Rojo
    INFO: '#0984E3',      // Azul
    DARK: '#2D3436',      // Gris oscuro
    LIGHT: '#DFE6E9',     // Gris claro
    GOLD: '#FDCB6E',      // Dorado
    SILVER: '#B2BEC3',    // Plateado
    BRONZE: '#E17055'     // Bronce
};

// Estilo base para los embeds
class PassQuirkEmbed extends EmbedBuilder {
    constructor(data = {}) {
        super(data);
        this.setColor(COLORS.PRIMARY);
        this.setTimestamp();
        this.setFooter({
            text: 'PassQuirk RPG',
            iconURL: 'https://i.imgur.com/6sYJbZP.png' // URL del logo
        });
    }
}

// Estilo para diálogos de NPC
class DialogEmbed extends PassQuirkEmbed {
    constructor(npcName, dialog, options = {}) {
        super();
        this.setColor(COLORS.INFO);
        this.setAuthor({
            name: npcName,
            iconURL: options.npcAvatar
        });
        this.setDescription(dialog);
        
        if (options.image) this.setImage(options.image);
        if (options.thumbnail) this.setThumbnail(options.thumbnail);
    }
}

// Estilo para la tienda
class ShopEmbed extends PassQuirkEmbed {
    constructor(shopName, description, options = {}) {
        super();
        this.setColor(COLORS.SECONDARY);
        this.setTitle(`🛒 ${shopName}`);
        this.setDescription(description);
        
        if (options.items && options.items.length > 0) {
            const itemsText = options.items
                .map((item, index) => {
                    const price = formatNumber(item.price);
                    return `**${index + 1}.** ${item.emoji} **${item.name}** - ${price} ${item.currencyEmoji || '💰'}\n` +
                           `↳ ${item.description || 'Sin descripción'}`;
                })
                .join('\n\n');
                
            this.addFields({
                name: '📦 Productos Disponibles',
                value: itemsText || '*No hay productos disponibles*',
                inline: false
            });
        }
        
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
        
        // Barra de progreso personalizada
        const progressBar = (current, max, size = 10) => {
            const progress = Math.round((current / max) * size);
            return `[${'█'.repeat(progress)}${'░'.repeat(size - progress)}] ${Math.round((current / max) * 100)}%`;
        };
        
        this.setThumbnail(user.displayAvatarURL());
        
        // Información básica
        this.addFields(
            {
                name: '🏆 Nivel',
                value: `**${stats.level || 1}**`,
                inline: true
            },
            {
                name: '✨ Experiencia',
                value: `${progressBar(stats.xp || 0, stats.xpToNext || 100)}\n` +
                       `${formatNumber(stats.xp || 0)} / ${formatNumber(stats.xpToNext || 100)} XP`,
                inline: true
            },
            {
                name: '💼 Rango',
                value: stats.rank ? `#${stats.rank}` : 'Sin rango',
                inline: true
            },
            {
                name: '📅 Miembro desde',
                value: user.createdAt ? `<t:${Math.floor(user.createdAt.getTime() / 1000)}:D>` : 'Desconocido',
                inline: true
            }
        );
        
        // Estadísticas de juego
        if (stats.playtime || stats.battles) {
            const gameStats = [];
            if (stats.playtime) gameStats.push(`• **Tiempo jugado:** ${stats.playtime}h`);
            if (stats.battles) gameStats.push(`• **Batallas:** ${formatNumber(stats.battles)}`);
            if (stats.victories) gameStats.push(`• **Victorias:** ${stats.victories}`);
            
            this.addFields({
                name: '🎮 Estadísticas de Juego',
                value: gameStats.join('\n') || 'No hay estadísticas disponibles',
                inline: false
            });
        }
        
        // Economía
        if (stats.balance !== undefined || stats.gems !== undefined) {
            const economy = [];
            if (stats.balance !== undefined) economy.push(`💰 **Monedas:** ${formatNumber(stats.balance)}`);
            if (stats.gems !== undefined) economy.push(`💎 **Gemas:** ${formatNumber(stats.gems)}`);
            if (stats.pg !== undefined) economy.push(`⚔️ **PG:** ${formatNumber(stats.pg)}`);
            
            this.addFields({
                name: '💵 Economía',
                value: economy.join(' | '),
                inline: false
            });
        }
    }
}

// Estilo para mensajes de error
class ErrorEmbed extends PassQuirkEmbed {
    constructor(error, options = {}) {
        super();
        this.setColor(COLORS.DANGER);
        this.setTitle('❌ ' + (options.title || 'Error'));
        this.setDescription(error.message || String(error));
        
        if (options.fields) {
            this.addFields(options.fields);
        }
        
        if (options.tip) {
            this.addFields({
                name: '💡 Consejo',
                value: options.tip,
                inline: false
            });
        }
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

// Estilo para menús de selección
class MenuEmbed extends PassQuirkEmbed {
    constructor(title, description, options = {}) {
        super();
        this.setColor(COLORS.PRIMARY);
        this.setTitle(title);
        this.setDescription(description);
        
        if (options.fields) {
            this.addFields(options.fields);
        }
        
        if (options.footer) {
            this.setFooter({ 
                text: options.footer,
                iconURL: 'https://i.imgur.com/6sYJbZP.png'
            });
        }
    }
}

module.exports = {
    COLORS,
    PassQuirkEmbed,
    DialogEmbed,
    ShopEmbed,
    InventoryEmbed,
    ProfileEmbed,
    ErrorEmbed,
    SuccessEmbed,
    MenuEmbed
};
