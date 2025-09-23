const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');
const { ITEMS } = require('../bot/data/passquirk-official-data');

/**
 * 🎒 Panel Oficial de Inventario
 * Basado en el sistema de inventario oficial de PassQuirk RPG
 */
function createOfficialInventoryPanel(playerData, category = 'all', page = 0) {
    const embed = new EmbedBuilder()
        .setTitle('🎒 Inventario de Aventurero')
        .setColor('#8B4513')
        .setDescription('Tu colección de items y equipamiento para la aventura.')
        .setTimestamp();

    const inventory = playerData.inventory || {};
    const equipment = playerData.equipment || {};
    
    // Información del jugador
    embed.addFields({
        name: '👤 Información del Aventurero',
        value: `**${playerData.name || 'Aventurero'}** | Nivel ${playerData.level || 1}\n🎒 **Capacidad:** ${getInventoryCount(inventory)}/${getMaxCapacity(playerData)} items`,
        inline: false
    });

    // Equipamiento actual
    const equippedItems = getEquippedItems(equipment);
    if (equippedItems.length > 0) {
        const equippedList = equippedItems.map(item => 
            `${item.emoji} **${item.name}** (${item.slot})`
        ).join('\n');
        
        embed.addFields({
            name: '⚔️ Equipamiento Actual',
            value: equippedList,
            inline: false
        });
    }

    // Items del inventario
    const filteredItems = getInventoryItemsByCategory(inventory, category);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredItems.slice(startIndex, endIndex);

    if (pageItems.length === 0) {
        embed.addFields({
            name: '📦 Items del Inventario',
            value: category === 'all' ? '❌ Tu inventario está vacío.' : `❌ No tienes items de tipo "${category}".`,
            inline: false
        });
    } else {
        const itemList = pageItems.map((item, index) => {
            const globalIndex = startIndex + index + 1;
            const quantity = item.quantity > 1 ? ` x${item.quantity}` : '';
            const equipped = item.equipped ? ' 🔹 **[Equipado]**' : '';
            return `**${globalIndex}.** ${item.emoji} **${item.name}**${quantity}${equipped}\n   ${item.rarity} | *${item.effect}*`;
        }).join('\n\n');

        embed.addFields({
            name: `📦 Items del Inventario (Página ${page + 1}/${totalPages || 1})`,
            value: itemList,
            inline: false
        });
    }

    // Estadísticas del inventario
    const stats = getInventoryStats(inventory);
    embed.addFields({
        name: '📊 Estadísticas del Inventario',
        value: `🧪 **Consumibles:** ${stats.consumibles}\n⚔️ **Armas:** ${stats.armas}\n🛡️ **Armaduras:** ${stats.armaduras}\n💍 **Accesorios:** ${stats.accesorios}\n🌟 **Especiales:** ${stats.especiales}`,
        inline: true
    });

    // Valor total del inventario
    const totalValue = calculateInventoryValue(inventory);
    embed.addFields({
        name: '💰 Valor Total',
        value: `**${totalValue}** Gold\n\n*Valor estimado de todos tus items*`,
        inline: true
    });

    embed.setFooter({
        text: '🎒 Usa los botones para gestionar tu inventario',
        iconURL: 'https://i.imgur.com/inventory-icon.png'
    });

    // Menú de categorías
    const categoryMenu = new StringSelectMenuBuilder()
        .setCustomId('inventory_category')
        .setPlaceholder('🏷️ Filtrar por categoría')
        .addOptions([
            {
                label: 'Todos los items',
                description: 'Ver todos los items del inventario',
                value: 'all',
                emoji: '🎒'
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

    // Botones de navegación
    const navigationRow = new ActionRowBuilder().addComponents(categoryMenu);
    
    const actionRow = new ActionRowBuilder();
    
    // Botón de página anterior
    if (page > 0) {
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`inventory_page_${page - 1}`)
                .setLabel('⬅️ Anterior')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    
    // Botones de acción principales
    actionRow.addComponents(
        new ButtonBuilder()
            .setCustomId('inventory_use')
            .setLabel('🔧 Usar Item')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('inventory_equip')
            .setLabel('⚔️ Equipar')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('inventory_sell')
            .setLabel('💰 Vender')
            .setStyle(ButtonStyle.Danger)
    );
    
    // Botón de página siguiente
    if (page < totalPages - 1) {
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`inventory_page_${page + 1}`)
                .setLabel('Siguiente ➡️')
                .setStyle(ButtonStyle.Secondary)
        );
    }

    const components = [navigationRow];
    if (actionRow.components.length > 0) {
        components.push(actionRow);
    }

    return { embeds: [embed], components };
}

/**
 * ⚔️ Panel de Equipamiento
 */
function createEquipmentPanel(playerData) {
    const embed = new EmbedBuilder()
        .setTitle('⚔️ Panel de Equipamiento')
        .setColor('#FF4500')
        .setDescription('Gestiona tu equipamiento y mejora tus estadísticas.')
        .setTimestamp();

    const equipment = playerData.equipment || {};
    const stats = playerData.stats || {};

    // Slots de equipamiento
    const equipmentSlots = [
        { slot: 'weapon', name: 'Arma Principal', emoji: '⚔️' },
        { slot: 'armor', name: 'Armadura', emoji: '🛡️' },
        { slot: 'helmet', name: 'Casco', emoji: '⛑️' },
        { slot: 'boots', name: 'Botas', emoji: '👢' },
        { slot: 'accessory1', name: 'Accesorio 1', emoji: '💍' },
        { slot: 'accessory2', name: 'Accesorio 2', emoji: '📿' }
    ];

    const equipmentList = equipmentSlots.map(slot => {
        const item = equipment[slot.slot];
        if (item) {
            return `${slot.emoji} **${slot.name}:** ${item.emoji} ${item.name} (${item.rarity})`;
        } else {
            return `${slot.emoji} **${slot.name}:** *Vacío*`;
        }
    }).join('\n');

    embed.addFields({
        name: '🎯 Equipamiento Actual',
        value: equipmentList,
        inline: false
    });

    // Estadísticas con bonificaciones
    const baseStats = {
        attack: stats.attack || 10,
        defense: stats.defense || 10,
        speed: stats.speed || 10,
        magic: stats.magic || 10
    };

    const equipmentBonuses = calculateEquipmentBonuses(equipment);
    const totalStats = {
        attack: baseStats.attack + equipmentBonuses.attack,
        defense: baseStats.defense + equipmentBonuses.defense,
        speed: baseStats.speed + equipmentBonuses.speed,
        magic: baseStats.magic + equipmentBonuses.magic
    };

    const statsText = [
        `⚔️ **Ataque:** ${baseStats.attack} (+${equipmentBonuses.attack}) = **${totalStats.attack}**`,
        `🛡️ **Defensa:** ${baseStats.defense} (+${equipmentBonuses.defense}) = **${totalStats.defense}**`,
        `⚡ **Velocidad:** ${baseStats.speed} (+${equipmentBonuses.speed}) = **${totalStats.speed}**`,
        `🔮 **Magia:** ${baseStats.magic} (+${equipmentBonuses.magic}) = **${totalStats.magic}**`
    ].join('\n');

    embed.addFields({
        name: '📊 Estadísticas Totales',
        value: statsText,
        inline: false
    });

    // Efectos especiales del equipamiento
    const specialEffects = getEquipmentSpecialEffects(equipment);
    if (specialEffects.length > 0) {
        embed.addFields({
            name: '✨ Efectos Especiales',
            value: specialEffects.join('\n'),
            inline: false
        });
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('equipment_change')
                .setLabel('🔄 Cambiar Equipo')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('equipment_unequip')
                .setLabel('📤 Desequipar')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('equipment_upgrade')
                .setLabel('⬆️ Mejorar')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('equipment_back')
                .setLabel('🔙 Volver')
                .setStyle(ButtonStyle.Danger)
        );

    return { embeds: [embed], components: [actionRow] };
}

/**
 * 🔧 Panel de Uso de Items
 */
function createItemUsePanel(playerData, itemId) {
    const item = getItemFromInventory(playerData.inventory, itemId);
    
    if (!item) {
        return createErrorPanel('❌ Item no encontrado en el inventario.');
    }

    const embed = new EmbedBuilder()
        .setTitle(`🔧 Usar: ${item.name}`)
        .setColor('#32CD32')
        .setDescription(`¿Estás seguro de que quieres usar este item?`)
        .setTimestamp();

    embed.addFields({
        name: '📦 Información del Item',
        value: `${item.emoji} **${item.name}**\n${item.rarity}\n\n**Efecto:** ${item.effect}\n**Cantidad:** ${item.quantity || 1}`,
        inline: false
    });

    if (item.type === 'consumible') {
        embed.addFields({
            name: '⚡ Efectos al Usar',
            value: getItemUseEffects(item),
            inline: false
        });
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`use_item_${itemId}`)
                .setLabel('✅ Confirmar Uso')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('use_item_cancel')
                .setLabel('❌ Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

    return { embeds: [embed], components: [actionRow] };
}

/**
 * 💰 Panel de Venta de Items
 */
function createItemSellPanel(playerData, itemId) {
    const item = getItemFromInventory(playerData.inventory, itemId);
    
    if (!item) {
        return createErrorPanel('❌ Item no encontrado en el inventario.');
    }

    const sellPrice = Math.floor(item.price * 0.6); // 60% del precio original
    const totalValue = sellPrice * (item.quantity || 1);

    const embed = new EmbedBuilder()
        .setTitle(`💰 Vender: ${item.name}`)
        .setColor('#FFD700')
        .setDescription(`¿Quieres vender este item?`)
        .setTimestamp();

    embed.addFields({
        name: '📦 Información del Item',
        value: `${item.emoji} **${item.name}**\n${item.rarity}\n\n**Cantidad:** ${item.quantity || 1}\n**Precio unitario:** ${sellPrice}💰\n**Valor total:** ${totalValue}💰`,
        inline: false
    });

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`sell_item_${itemId}`)
                .setLabel(`💰 Vender por ${totalValue}💰`)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('sell_item_cancel')
                .setLabel('❌ Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

    return { embeds: [embed], components: [actionRow] };
}

/**
 * ❌ Panel de Error
 */
function createErrorPanel(message) {
    const embed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setColor('#FF0000')
        .setDescription(message)
        .setTimestamp();

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('error_back')
                .setLabel('🔙 Volver')
                .setStyle(ButtonStyle.Secondary)
        );

    return { embeds: [embed], components: [actionRow] };
}

// Funciones auxiliares
function getInventoryCount(inventory) {
    return Object.values(inventory).reduce((total, item) => total + (item.quantity || 1), 0);
}

function getMaxCapacity(playerData) {
    const baseCapacity = 50;
    const levelBonus = (playerData.level || 1) * 5;
    return baseCapacity + levelBonus;
}

function getEquippedItems(equipment) {
    return Object.entries(equipment)
        .filter(([slot, item]) => item)
        .map(([slot, item]) => ({ ...item, slot }));
}

function getInventoryItemsByCategory(inventory, category) {
    const items = Object.entries(inventory).map(([id, item]) => ({ ...item, id }));
    
    if (category === 'all') {
        return items;
    }
    
    return items.filter(item => item.type === category);
}

function getInventoryStats(inventory) {
    const stats = {
        consumibles: 0,
        armas: 0,
        armaduras: 0,
        accesorios: 0,
        especiales: 0
    };
    
    Object.values(inventory).forEach(item => {
        const quantity = item.quantity || 1;
        switch (item.type) {
            case 'consumible':
                stats.consumibles += quantity;
                break;
            case 'arma':
                stats.armas += quantity;
                break;
            case 'armadura':
                stats.armaduras += quantity;
                break;
            case 'accesorio':
                stats.accesorios += quantity;
                break;
            case 'especial':
                stats.especiales += quantity;
                break;
        }
    });
    
    return stats;
}

function calculateInventoryValue(inventory) {
    return Object.values(inventory).reduce((total, item) => {
        const quantity = item.quantity || 1;
        const sellPrice = Math.floor(item.price * 0.6);
        return total + (sellPrice * quantity);
    }, 0);
}

function calculateEquipmentBonuses(equipment) {
    const bonuses = { attack: 0, defense: 0, speed: 0, magic: 0 };
    
    Object.values(equipment).forEach(item => {
        if (item && item.stats) {
            bonuses.attack += item.stats.attack || 0;
            bonuses.defense += item.stats.defense || 0;
            bonuses.speed += item.stats.speed || 0;
            bonuses.magic += item.stats.magic || 0;
        }
    });
    
    return bonuses;
}

function getEquipmentSpecialEffects(equipment) {
    const effects = [];
    
    Object.values(equipment).forEach(item => {
        if (item && item.specialEffect) {
            effects.push(`${item.emoji} **${item.name}:** ${item.specialEffect}`);
        }
    });
    
    return effects;
}

function getItemFromInventory(inventory, itemId) {
    return inventory[itemId] || null;
}

function getItemUseEffects(item) {
    // Simulación de efectos de uso
    const effects = {
        'Poción de Vida': '+50 HP',
        'Poción de Maná': '+30 MP',
        'Elixir de Fuerza': '+10 Ataque por 5 turnos',
        'Antídoto': 'Cura envenenamiento'
    };
    
    return effects[item.name] || 'Efecto desconocido';
}

module.exports = {
    createOfficialInventoryPanel,
    createEquipmentPanel,
    createItemUsePanel,
    createItemSellPanel,
    createErrorPanel
};