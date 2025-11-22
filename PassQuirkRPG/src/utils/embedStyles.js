const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');

/**
 * 🎨 Sistema de Estilos Oficial de PassQuirk RPG
 * Basado en el diseño de referencia v0.dev
 */

// 🎨 Paleta de Colores Oficial
const COLORS = {
    // Colores principales
    PRIMARY: '#FF6B6B',        // Rojo PassQuirk
    SECONDARY: '#4ECDC4',      // Turquesa
    SUCCESS: '#45B7D1',       // Azul éxito
    WARNING: '#FFA726',       // Naranja advertencia
    DANGER: '#FF4444',        // Rojo peligro
    INFO: '#6C5CE7',          // Púrpura información
    
    // Colores del sistema
    COMBAT: '#FF4444',        // Combate
    EXPLORATION: '#45B7D1',   // Exploración
    INVENTORY: '#8B4513',     // Inventario
    PROFILE: '#FF6B6B',       // Perfil
    ECONOMY: '#FFD700',       // Economía
    SETTINGS: '#6C5CE7',      // Configuración
    TUTORIAL: '#00CED1',      // Tutorial
    HELP: '#32CD32',          // Ayuda
    
    // Colores del sistema agrupados
    SYSTEM: {
        PROFILE: '#FF6B6B',   // Perfil
        ERROR: '#FF4444',     // Error
        SUCCESS: '#45B7D1',   // Éxito
        WARNING: '#FFA726',   // Advertencia
        INFO: '#6C5CE7',      // Información
        EQUIPMENT: '#8B4513', // Equipamiento
        STATS: '#6C5CE7'      // Estadísticas
    },
    
    // Colores de rareza
    COMMON: '#95A5A6',        // Común - Gris
    UNCOMMON: '#2ECC71',      // Poco común - Verde
    RARE: '#3498DB',          // Raro - Azul
    EPIC: '#9B59B6',          // Épico - Púrpura
    LEGENDARY: '#F39C12',     // Legendario - Dorado
    MYTHIC: '#E74C3C',        // Mítico - Rojo
    
    // Colores de clases
    WARRIOR: '#E74C3C',       // Guerrero - Rojo
    MAGE: '#3498DB',          // Mago - Azul
    ARCHER: '#27AE60',        // Arquero - Verde
    ROGUE: '#8E44AD',         // Pícaro - Púrpura
    PALADIN: '#F39C12',       // Paladín - Dorado
    HEALER: '#1ABC9C'         // Sanador - Turquesa
};

// Sistema de emojis animados integrado usando URLs correctas de emoji.gg
const ANIMATED_EMOJIS = {
    // Estrellas y efectos
    STAR_PURPLE: 'https://cdn3.emoji.gg/emojis/5417_star_purple.gif',
    GREEN_SPARKLES: 'https://cdn3.emoji.gg/emojis/5267-green-sparkles.gif',
    SPARKLE_STARS: 'https://cdn3.emoji.gg/emojis/58229-sparklestars.gif',
    STAR_BLUE: 'https://cdn3.emoji.gg/emojis/70857-star-b.gif',
    STAR_RED: 'https://cdn3.emoji.gg/emojis/42684-star-r.gif',
    STAR_YELLOW: 'https://cdn3.emoji.gg/emojis/19097-star-y.gif',
    STAR_GENERIC: 'https://cdn3.emoji.gg/emojis/40437-star.gif',
    
    // Coronas y rangos
    CROWN_GREEN: 'https://cdn3.emoji.gg/emojis/47232-crown-green.gif',
    
    // Elementos y efectos
    GREEN_FIRE: 'https://cdn3.emoji.gg/emojis/7384-greenfire.gif',
    EARTH_MINECRAFT: 'https://cdn3.emoji.gg/emojis/35311-earth-minecraft.gif',
    SWORD_CLASH: 'https://cdn3.emoji.gg/emojis/7384-greenfire.gif', // Usando green fire para combate
    
    // Celebración y recompensas
    CHRISTMAS_GIFT: 'https://cdn3.emoji.gg/emojis/69253-christmas-gift.gif',
    GG: 'https://cdn3.emoji.gg/emojis/68602-gg.gif',
    TADA: 'https://cdn3.emoji.gg/emojis/65115-tada.gif',
    
    // Utilidades
    BIN: 'https://cdn3.emoji.gg/emojis/90616-bin.gif',
    SLIME: 'https://cdn3.emoji.gg/emojis/7384-greenfire.gif' // Usando green fire para slime
};

// 🎭 Emojis Oficiales del Sistema
const EMOJIS = {
    // Sistema general
    PASSQUIRK: '🌟',
    PROFILE: '👤',
    LEVEL: '⭐',
    EXP: '✨',
    GOLD: '💰',
    GEMS: '💎',
    ENERGY: '🔋',
    HP: '❤️',
    MP: '💙',
    QUIRK: '✨',
    EQUIPMENT: '⚔️',
    
    // Estadísticas
    ATTACK: '⚔️',
    DEFENSE: '🛡️',
    SPEED: '💨',
    INTELLIGENCE: '🧠',
    LUCK: '🍀',
    
    // Estadísticas agrupadas
    STATS: {
        HP: '❤️',
        MP: '💙',
        ATTACK: '⚔️',
        DEFENSE: '🛡️',
        SPEED: '💨',
        INTELLIGENCE: '🧠',
        LUCK: '🍀',
        EXPERIENCE: '✨',
        GOLD: '💰',
        BONUS: '📈',
        CHART: '📊'
    },
    
    // Sistema
    SYSTEM: {
        INFO: 'ℹ️',
        ITEM: '📦',
        ERROR: '❌',
        SUCCESS: '✅',
        WARNING: '⚠️'
    },
    
    // Combate
    COMBAT: {
        SWORD: '⚔️',
        SHIELD: '🛡️',
        BATTLE: '⚔️'
    },
    
    // Clases
    WARRIOR: '⚔️',
    MAGE: '🔮',
    ARCHER: '🏹',
    ROGUE: '🗡️',
    PALADIN: '🛡️',
    HEALER: '💚',
    
    // Acciones
    COMBAT: '⚔️',
    EXPLORE: '🗺️',
    INVENTORY: '🎒',
    SHOP: '🏪',
    QUEST: '📜',
    SETTINGS: '⚙️',
    
    // Estados
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    LOADING: '⏳'
};

/**
 * 🎨 Creador de Embeds con Estilo Oficial
 */
class OfficialEmbedBuilder {
    constructor() {
        this.embed = new EmbedBuilder();
        this.components = [];
    }

    /**
     * Configura el embed con el estilo base oficial
     */
    setOfficialStyle(type = 'default') {
        const styles = {
            default: { color: COLORS.PRIMARY, footer: '🎮 PassQuirk RPG - Tu aventura isekai te espera' },
            combat: { color: COLORS.COMBAT, footer: '⚔️ Sistema de Combate Oficial' },
            exploration: { color: COLORS.EXPLORATION, footer: '🗺️ Sistema de Exploración' },
            inventory: { color: COLORS.INVENTORY, footer: '🎒 Gestión de Inventario' },
            profile: { color: COLORS.PROFILE, footer: '👤 Perfil de Aventurero' },
            economy: { color: COLORS.ECONOMY, footer: '💰 Sistema Económico' },
            settings: { color: COLORS.SETTINGS, footer: '⚙️ Configuración del Sistema' },
            tutorial: { color: COLORS.TUTORIAL, footer: '📚 Tutorial Interactivo' },
            help: { color: COLORS.HELP, footer: '❓ Sistema de Ayuda' }
        };

        const style = styles[type] || styles.default;
        this.embed.setColor(style.color);
        this.embed.setTimestamp();
        this.embed.setFooter({
            text: style.footer,
            iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png' // Placeholder temporal
        });

        return this;
    }

    /**
     * Establece el título con emoji oficial
     */
    setOfficialTitle(title, emoji = EMOJIS.PASSQUIRK) {
        this.embed.setTitle(`${emoji} ${title}`);
        return this;
    }

    /**
     * Establece la descripción con formato oficial
     */
    setOfficialDescription(description) {
        this.embed.setDescription(description);
        return this;
    }

    /**
     * Añade un campo con formato oficial
     */
    addOfficialField(name, value, inline = false, emoji = '') {
        const fieldName = emoji ? `${emoji} ${name}` : name;
        this.embed.addFields({ name: fieldName, value, inline });
        return this;
    }

    /**
     * Añade información del jugador
     */
    addPlayerInfo(playerData) {
        const playerInfo = [
            `**👤 Nombre:** ${playerData.characterName || 'Aventurero'}`,
            `**🎯 Clase:** ${playerData.characterClass || 'Sin clase'} ${getClassEmoji(playerData.characterClass)}`,
            `**⭐ Nivel:** ${playerData.level || 1}`,
            `**✨ EXP:** ${playerData.experience || 0}/${getExpForNextLevel(playerData.level || 1)}`,
            `**🏆 Rango:** ${getPlayerRank(playerData.level || 1)}`
        ].join('\n');

        this.addOfficialField('Información del Personaje', playerInfo, false, '📊');
        return this;
    }

    /**
     * Añade estadísticas del jugador
     */
    addPlayerStats(stats) {
        const statsInfo = [
            `${EMOJIS.HP} **HP:** ${stats.hp || 100}/${stats.maxHp || 100}`,
            `${EMOJIS.MP} **MP:** ${stats.mp || 50}/${stats.maxMp || 50}`,
            `${EMOJIS.ATTACK} **ATK:** ${stats.attack || 10}`,
            `${EMOJIS.DEFENSE} **DEF:** ${stats.defense || 5}`,
            `${EMOJIS.SPEED} **SPD:** ${stats.speed || 8}`,
            `${EMOJIS.INTELLIGENCE} **INT:** ${stats.intelligence || 7}`
        ].join('\n');

        this.addOfficialField('Estadísticas', statsInfo, true, '📈');
        return this;
    }

    /**
     * Añade recursos del jugador
     */
    addPlayerResources(currencies) {
        const resourcesInfo = [
            `${EMOJIS.GOLD} **Gold:** ${currencies.balance || 0}`,
            `${EMOJIS.GEMS} **Gemas:** ${currencies.gems || 0}`,
            `${EMOJIS.ENERGY} **Energía:** ${currencies.energy || 100}/100`,
            `⭐ **PG:** ${currencies.pg || 0}`
        ].join('\n');

        this.addOfficialField('Recursos', resourcesInfo, true, '💰');
        return this;
    }

    /**
     * Crea una barra de progreso visual
     */
    createProgressBar(current, max, length = 10) {
        const percentage = Math.max(0, Math.min(100, (current / max) * 100));
        const filledBars = Math.floor((percentage / 100) * length);
        const emptyBars = length - filledBars;
        
        let bar = '';
        for (let i = 0; i < filledBars; i++) {
            bar += '🟩';
        }
        for (let i = 0; i < emptyBars; i++) {
            bar += '⬜';
        }
        
        return `${bar} ${current}/${max} (${Math.floor(percentage)}%)`;
    }

    /**
     * Obtiene el embed construido
     */
    getEmbed() {
        return this.embed;
    }

    /**
     * Obtiene los componentes
     */
    getComponents() {
        return this.components;
    }

    /**
     * Obtiene el resultado completo
     */
    build() {
        return {
            embeds: [this.embed],
            components: this.components
        };
    }
}

/**
 * 🔘 Creador de Botones con Estilo Oficial
 */
class OfficialButtonBuilder {
    constructor() {
        this.buttons = [];
    }

    /**
     * Añade un botón con estilo oficial
     */
    addOfficialButton(customId, label, style = 'secondary', emoji = null, disabled = false) {
        const buttonStyles = {
            primary: ButtonStyle.Primary,
            secondary: ButtonStyle.Secondary,
            success: ButtonStyle.Success,
            danger: ButtonStyle.Danger,
            link: ButtonStyle.Link
        };

        const button = new ButtonBuilder()
            .setCustomId(customId)
            .setLabel(label)
            .setStyle(buttonStyles[style] || ButtonStyle.Secondary)
            .setDisabled(disabled);

        if (emoji) {
            button.setEmoji(emoji);
        }

        this.buttons.push(button);
        return this;
    }

    /**
     * Crea botones de navegación estándar
     */
    addNavigationButtons(page = 0, totalPages = 1, baseId = 'nav') {
        if (page > 0) {
            this.addOfficialButton(`${baseId}_prev_${page - 1}`, 'Anterior', 'secondary', '⬅️');
        }

        this.addOfficialButton(`${baseId}_info`, `${page + 1}/${totalPages}`, 'secondary', 'ℹ️', true);

        if (page < totalPages - 1) {
            this.addOfficialButton(`${baseId}_next_${page + 1}`, 'Siguiente', 'secondary', '➡️');
        }

        return this;
    }

    /**
     * Crea botones de acción de combate
     */
    addCombatButtons() {
        this.addOfficialButton('combat_attack', 'Atacar', 'danger', '⚔️');
        this.addOfficialButton('combat_defend', 'Defender', 'secondary', '🛡️');
        this.addOfficialButton('combat_skill', 'Habilidad', 'primary', '✨');
        this.addOfficialButton('combat_item', 'Objeto', 'success', '🧪');
        return this;
    }

    /**
     * Crea botones de gestión de inventario
     */
    addInventoryButtons() {
        this.addOfficialButton('inventory_use', 'Usar Item', 'primary', '🔧');
        this.addOfficialButton('inventory_equip', 'Equipar', 'success', '⚔️');
        this.addOfficialButton('inventory_sell', 'Vender', 'danger', '💰');
        return this;
    }

    /**
     * Construye las filas de botones
     */
    buildRows(buttonsPerRow = 4) {
        const rows = [];
        for (let i = 0; i < this.buttons.length; i += buttonsPerRow) {
            const rowButtons = this.buttons.slice(i, i + buttonsPerRow);
            rows.push(new ActionRowBuilder().addComponents(...rowButtons));
        }
        return rows;
    }
}

/**
 * 📋 Creador de Menús de Selección con Estilo Oficial
 */
class OfficialSelectMenuBuilder {
    constructor(customId, placeholder = 'Selecciona una opción') {
        this.menu = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder);
    }

    /**
     * Añade opciones con estilo oficial
     */
    addOfficialOptions(options) {
        const formattedOptions = options.map(option => ({
            label: option.label,
            description: option.description || '',
            value: option.value,
            emoji: option.emoji || null
        }));

        this.menu.addOptions(formattedOptions);
        return this;
    }

    /**
     * Crea menú de categorías de inventario
     */
    addInventoryCategories() {
        const categories = [
            { label: 'Todos los items', description: 'Ver todos los items del inventario', value: 'all', emoji: '🎒' },
            { label: 'Consumibles', description: 'Pociones, elixires y consumibles', value: 'consumible', emoji: '🧪' },
            { label: 'Armas', description: 'Espadas, arcos y armas de combate', value: 'arma', emoji: '⚔️' },
            { label: 'Armaduras', description: 'Protección y equipamiento defensivo', value: 'armadura', emoji: '🛡️' },
            { label: 'Accesorios', description: 'Anillos, collares y accesorios mágicos', value: 'accesorio', emoji: '💍' },
            { label: 'Especiales', description: 'Items únicos y especiales', value: 'especial', emoji: '🌟' }
        ];

        return this.addOfficialOptions(categories);
    }

    /**
     * Crea menú de clases de personaje
     */
    addCharacterClasses() {
        const classes = [
            { label: 'Guerrero', description: 'Especialista en combate cuerpo a cuerpo', value: 'warrior', emoji: '⚔️' },
            { label: 'Mago', description: 'Maestro de las artes arcanas', value: 'mage', emoji: '🔮' },
            { label: 'Arquero', description: 'Experto en combate a distancia', value: 'archer', emoji: '🏹' },
            { label: 'Pícaro', description: 'Ágil y sigiloso', value: 'rogue', emoji: '🗡️' },
            { label: 'Paladín', description: 'Defensor sagrado', value: 'paladin', emoji: '🛡️' },
            { label: 'Sanador', description: 'Especialista en magia curativa', value: 'healer', emoji: '💚' }
        ];

        return this.addOfficialOptions(classes);
    }

    /**
     * Construye el menú
     */
    build() {
        return new ActionRowBuilder().addComponents(this.menu);
    }
}

// 🔧 Funciones de Utilidad

/**
 * Obtiene el emoji de la clase
 */
function getClassEmoji(className) {
    const classEmojis = {
        'Guerrero': EMOJIS.WARRIOR,
        'Mago': EMOJIS.MAGE,
        'Arquero': EMOJIS.ARCHER,
        'Pícaro': EMOJIS.ROGUE,
        'Paladín': EMOJIS.PALADIN,
        'Sanador': EMOJIS.HEALER
    };
    return classEmojis[className] || '❓';
}

/**
 * Calcula la experiencia necesaria para el siguiente nivel
 */
function getExpForNextLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Obtiene el rango del jugador basado en su nivel
 */
function getPlayerRank(level) {
    if (level >= 50) return '🌟 Legendario';
    if (level >= 40) return '💎 Maestro';
    if (level >= 30) return '🏆 Experto';
    if (level >= 20) return '⚡ Avanzado';
    if (level >= 10) return '🔥 Intermedio';
    return '🌱 Novato';
}

/**
 * Obtiene el color según la rareza
 */
function getRarityColor(rarity) {
    const rarityColors = {
        'Común': COLORS.COMMON,
        'Poco común': COLORS.UNCOMMON,
        'Raro': COLORS.RARE,
        'Épico': COLORS.EPIC,
        'Legendario': COLORS.LEGENDARY,
        'Mítico': COLORS.MYTHIC
    };
    return rarityColors[rarity] || COLORS.COMMON;
}

/**
 * Formatea números grandes
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

module.exports = {
    COLORS,
    EMOJIS,
    ANIMATED_EMOJIS,
    OfficialEmbedBuilder,
    OfficialButtonBuilder,
    OfficialSelectMenuBuilder,
    getClassEmoji,
    getExpForNextLevel,
    getPlayerRank,
    getRarityColor,
    formatNumber
};