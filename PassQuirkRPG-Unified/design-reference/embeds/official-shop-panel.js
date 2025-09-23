const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');
const { ITEMS } = require('../bot/data/passquirk-official-data');

/**
 * 🛒 Panel Oficial de Tienda
 * Basado en el sistema de tienda oficial de PassQuirk RPG
 */
function createOfficialShopPanel(playerData, category = 'all') {
    const embed = new EmbedBuilder()
        .setTitle('🛒 Tienda Oficial de PassQuirk')
        .setColor('#FFD700')
        .setDescription('¡Bienvenido a la tienda oficial! Aquí encontrarás todo lo necesario para tu aventura.')
        .setTimestamp();

    // Mostrar balance del jugador
    const currencies = playerData.currencies || {};
    const balanceInfo = [
        `💰 **Gold:** ${currencies.balance || 0}`,
        `💎 **Gemas:** ${currencies.gems || 0}`,
        `⭐ **PG:** ${currencies.pg || 0}`
    ].join(' | ');

    embed.addFields({
        name: '💳 Tu Balance',
        value: balanceInfo,
        inline: false
    });

    // Filtrar items por categoría
    const filteredItems = getItemsByCategory(category);
    
    if (filteredItems.length === 0) {
        embed.addFields({
            name: '📦 Productos Disponibles',
            value: '❌ No hay productos disponibles en esta categoría.',
            inline: false
        });
    } else {
        // Mostrar items en grupos
        const itemGroups = groupItemsByType(filteredItems);
        
        for (const [type, items] of Object.entries(itemGroups)) {
            const itemList = items.slice(0, 5).map(item => {
                const canAfford = (currencies.balance || 0) >= item.price;
                const affordIcon = canAfford ? '✅' : '❌';
                return `${affordIcon} ${item.emoji} **${item.name}** - ${item.price}💰\n   *${item.effect}* (${item.rarity})`;
            }).join('\n\n');

            embed.addFields({
                name: `${getTypeEmoji(type)} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                value: itemList || 'Sin productos',
                inline: false
            });
        }
    }

    // Ofertas especiales
    const specialOffers = getSpecialOffers();
    if (specialOffers.length > 0) {
        const offerList = specialOffers.map(offer => 
            `🔥 ${offer.emoji} **${offer.name}** ~~${offer.originalPrice}💰~~ **${offer.price}💰** (-${offer.discount}%)`
        ).join('\n');
        
        embed.addFields({
            name: '🔥 Ofertas Especiales',
            value: offerList,
            inline: false
        });
    }

    embed.setFooter({
        text: '🛒 Usa los botones para navegar por la tienda',
        iconURL: 'https://i.imgur.com/shop-icon.png'
    });

    // Menú de categorías
    const categoryMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_category')
        .setPlaceholder('🏷️ Selecciona una categoría')
        .addOptions([
            {
                label: 'Todos los productos',
                description: 'Ver todos los productos disponibles',
                value: 'all',
                emoji: '🛒'
            },
            {
                label: 'Consumibles',
                description: 'Pociones, elixires y consumibles',
                value: 'consumible',
                emoji: '🧪'
            },
            {
                label: 'Armas',
                description: 'Espadas, arcos y armas de combate',
                value: 'arma',
                emoji: '⚔️'
            },
            {
                label: 'Armaduras',
                description: 'Protección y equipamiento defensivo',
                value: 'armadura',
                emoji: '🛡️'
            },
            {
                label: 'Accesorios',
                description: 'Anillos, collares y accesorios mágicos',
                value: 'accesorio',
                emoji: '💍'
            },
            {
                label: 'Especiales',
                description: 'Items únicos y especiales',
                value: 'especial',
                emoji: '🌟'
            }
        ]);

    // Botones de acción
    const actionRow1 = new ActionRowBuilder().addComponents(categoryMenu);
    
    const actionRow2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('shop_gachapon')
                .setLabel('🎰 Gachapon')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('shop_special')
                .setLabel('🌟 Especiales')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('shop_my_purchases')
                .setLabel('📦 Mis Compras')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('shop_close')
                .setLabel('❌ Cerrar')
                .setStyle(ButtonStyle.Danger)
        );

    return { embeds: [embed], components: [actionRow1, actionRow2] };
}

/**
 * 🎰 Panel de Gachapon
 */
function createGachaponPanel(playerData) {
    const embed = new EmbedBuilder()
        .setTitle('🎰 Gachapon Mágico')
        .setColor('#FF69B4')
        .setDescription('¡Prueba tu suerte con el Gachapon mágico! Obtén items raros y únicos.')
        .setTimestamp();

    const currencies = playerData.currencies || {};
    
    embed.addFields({
        name: '💳 Tu Balance',
        value: `💰 **Gold:** ${currencies.balance || 0} | 💎 **Gemas:** ${currencies.gems || 0}`,
        inline: false
    });

    // Tipos de gachapon disponibles
    const gachaponTypes = [
        {
            name: '🎰 Gachapon Básico',
            cost: '100💰',
            description: 'Items comunes y raros',
            rates: '🔵 Normal: 60% | 🟢 Común: 30% | 🟣 Raro: 10%'
        },
        {
            name: '💎 Gachapon Premium',
            cost: '5💎',
            description: 'Items raros y legendarios',
            rates: '🟢 Común: 40% | 🟣 Raro: 40% | 🟡 Legendario: 20%'
        },
        {
            name: '🌟 Gachapon Mítico',
            cost: '20💎',
            description: 'Items legendarios y míticos',
            rates: '🟣 Raro: 30% | 🟡 Legendario: 50% | ⚪ Mítico: 20%'
        }
    ];

    gachaponTypes.forEach(type => {
        embed.addFields({
            name: type.name,
            value: `**Costo:** ${type.cost}\n**Contenido:** ${type.description}\n**Probabilidades:** ${type.rates}`,
            inline: true
        });
    });

    embed.addFields({
        name: '🎁 Recompensas Especiales',
        value: '• 🌟 **LOY** - Item mítico especial\n• ✨ **Quirks únicos** - Habilidades especiales\n• 🏆 **Títulos raros** - Prestigio y bonificaciones',
        inline: false
    });

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('gachapon_basic')
                .setLabel('🎰 Básico (100💰)')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('gachapon_premium')
                .setLabel('💎 Premium (5💎)')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('gachapon_mythic')
                .setLabel('🌟 Mítico (20💎)')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('gachapon_back')
                .setLabel('🔙 Volver')
                .setStyle(ButtonStyle.Secondary)
        );

    return { embeds: [embed], components: [actionRow] };
}

/**
 * 📦 Panel de Categoría Específica
 */
function createCategoryPanel(playerData, category) {
    const embed = new EmbedBuilder()
        .setTitle(`🏷️ ${category.charAt(0).toUpperCase() + category.slice(1)}s`)
        .setColor('#4169E1')
        .setTimestamp();

    const items = getItemsByCategory(category);
    const currencies = playerData.currencies || {};

    if (items.length === 0) {
        embed.setDescription('❌ No hay productos disponibles en esta categoría.');
    } else {
        const itemList = items.map((item, index) => {
            const canAfford = (currencies.balance || 0) >= item.price;
            const affordIcon = canAfford ? '✅' : '❌';
            return `**${index + 1}.** ${affordIcon} ${item.emoji} **${item.name}**\n   💰 ${item.price} | ${item.rarity}\n   *${item.effect}*`;
        }).join('\n\n');

        embed.setDescription(itemList);
    }

    embed.addFields({
        name: '💳 Tu Balance',
        value: `💰 ${currencies.balance || 0} | 💎 ${currencies.gems || 0}`,
        inline: false
    });

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('category_buy')
                .setLabel('🛒 Comprar')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('category_back')
                .setLabel('🔙 Volver')
                .setStyle(ButtonStyle.Secondary)
        );

    return { embeds: [embed], components: [actionRow] };
}

/**
 * 🎁 Panel de Resultado de Gachapon
 */
function createGachaponResultPanel(playerData, result) {
    const embed = new EmbedBuilder()
        .setTitle('🎁 ¡Resultado del Gachapon!')
        .setColor(getRarityColor(result.rarity))
        .setTimestamp();

    embed.setDescription(`🎉 **¡Has obtenido:**\n\n${result.emoji} **${result.name}**\n${result.rarity}\n\n*${result.effect}*`);

    // Animación de rareza
    const rarityAnimation = getRarityAnimation(result.rarity);
    embed.addFields({
        name: '✨ Rareza',
        value: rarityAnimation,
        inline: false
    });

    if (result.special) {
        embed.addFields({
            name: '🌟 ¡Objeto Especial!',
            value: result.specialMessage || '¡Has obtenido un objeto muy raro!',
            inline: false
        });
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('gachapon_again')
                .setLabel('🎰 Intentar de Nuevo')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('gachapon_inventory')
                .setLabel('🎒 Ver Inventario')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('gachapon_close')
                .setLabel('❌ Cerrar')
                .setStyle(ButtonStyle.Danger)
        );

    return { embeds: [embed], components: [actionRow] };
}

/**
 * Obtiene items por categoría
 */
function getItemsByCategory(category) {
    if (category === 'all') {
        return Object.values(ITEMS);
    }
    
    return Object.values(ITEMS).filter(item => item.type === category);
}

/**
 * Agrupa items por tipo
 */
function groupItemsByType(items) {
    const groups = {};
    items.forEach(item => {
        if (!groups[item.type]) {
            groups[item.type] = [];
        }
        groups[item.type].push(item);
    });
    return groups;
}

/**
 * Obtiene ofertas especiales
 */
function getSpecialOffers() {
    // Simulación de ofertas especiales
    return [
        {
            name: 'Pack de Aventurero',
            emoji: '🎒',
            originalPrice: 500,
            price: 350,
            discount: 30
        }
    ];
}

/**
 * Obtiene emoji por tipo de item
 */
function getTypeEmoji(type) {
    const typeEmojis = {
        'consumible': '🧪',
        'arma': '⚔️',
        'armadura': '🛡️',
        'accesorio': '💍',
        'especial': '🌟'
    };
    return typeEmojis[type] || '📦';
}

/**
 * Obtiene color por rareza
 */
function getRarityColor(rarity) {
    const colors = {
        '🔵 Normal': '#0099FF',
        '🟢 Común': '#00FF00',
        '🟣 Raro': '#9900FF',
        '🟡 Legendario': '#FFD700',
        '⚪ Mítico': '#FFFFFF'
    };
    return colors[rarity] || '#808080';
}

/**
 * Obtiene animación por rareza
 */
function getRarityAnimation(rarity) {
    const animations = {
        '🔵 Normal': '🔵 ▫️ ▫️ ▫️ ▫️',
        '🟢 Común': '🔵 🟢 ▫️ ▫️ ▫️',
        '🟣 Raro': '🔵 🟢 🟣 ▫️ ▫️',
        '🟡 Legendario': '🔵 🟢 🟣 🟡 ▫️',
        '⚪ Mítico': '🔵 🟢 🟣 🟡 ⚪'
    };
    return animations[rarity] || '▫️ ▫️ ▫️ ▫️ ▫️';
}

module.exports = {
    createOfficialShopPanel,
    createGachaponPanel,
    createCategoryPanel,
    createGachaponResultPanel
};