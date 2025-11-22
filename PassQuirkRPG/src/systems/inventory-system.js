/**
 * Sistema de Inventario para PassQuirk RPG
 * 
 * Este sistema maneja todas las mecánicas de inventario del juego:
 * - Visualización de inventario
 * - Uso de objetos
 * - Equipamiento de objetos
 * - Venta de objetos
 * - Categorización de objetos
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');
const { COLORS, EMOJIS, ANIMATED_EMOJIS } = require('../utils/embedStyles');
const { OfficialEmbedBuilder } = require('../utils/embedStyles');
const { OfficialButtonBuilder } = require('../utils/embedStyles');
const { OfficialSelectMenuBuilder } = require('../utils/embedStyles');

class InventorySystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.itemData = gameManager.gameData.ITEMS;
        
        // Configuración del inventario
        this.maxItemsPerPage = 5;
        this.defaultSlots = 20;
        
        // Categorías de objetos
        this.categories = {
            all: { name: 'Todos los items', emoji: '🎒' },
            consumible: { name: 'Consumibles', emoji: '🧪' },
            arma: { name: 'Armas', emoji: '⚔️' },
            armadura: { name: 'Armaduras', emoji: '🛡️' },
            accesorio: { name: 'Accesorios', emoji: '💍' },
            especial: { name: 'Especiales', emoji: '🌟' }
        };
    }
    
    /**
     * Muestra el inventario del jugador
     */
    async showInventory(interaction, userId, category = 'all', page = 0) {
        const player = await this.gameManager.getPlayer(userId);
        if (!player) {
            await interaction.reply({
                content: '⚠️ No tienes un personaje creado. Usa `/character create` para crear uno.',
                ephemeral: true
            });
            return;
        }
        
        // Asegurarse de que el inventario existe
        player.inventory = player.inventory || { items: {}, equipment: {}, gold: 0 };
        
        // Obtener los items del inventario según la categoría
        const items = this.getItemsByCategory(player.inventory.items, category);
        
        // Calcular páginas
        const totalPages = Math.ceil(items.length / this.maxItemsPerPage);
        const currentPage = Math.min(page, Math.max(0, totalPages - 1));
        const startIndex = currentPage * this.maxItemsPerPage;
        const endIndex = Math.min(startIndex + this.maxItemsPerPage, items.length);
        const displayedItems = items.slice(startIndex, endIndex);
        
        // Crear el embed del inventario
        const embed = new OfficialEmbedBuilder()
            .setOfficialStyle('inventory')
            .setOfficialTitle(`Inventario de ${player.username}`, EMOJIS.INVENTORY)
            .setOfficialDescription(`Aquí puedes ver y gestionar tus objetos.\n\n**Categoría:** ${this.categories[category].emoji} ${this.categories[category].name}\n**Oro:** ${EMOJIS.GOLD} ${player.inventory.gold || 0}\n**Espacio:** ${Object.keys(player.inventory.items).length}/${this.getInventoryCapacity(player)} objetos`);
        
        // Añadir información de equipamiento
        this.addEquipmentInfo(embed, player.inventory.equipment);
        
        // Añadir items a mostrar
        if (displayedItems.length > 0) {
            for (const itemInfo of displayedItems) {
                const { itemId, item, quantity } = itemInfo;
                const isEquipped = this.isItemEquipped(player.inventory.equipment, itemId);
                const equipStatus = isEquipped ? ' (Equipado)' : '';
                
                embed.addOfficialField(
                    `${item.emoji} ${item.name}${equipStatus}`,
                    `**Tipo:** ${this.getItemTypeEmoji(item.type)} ${this.capitalizeFirstLetter(item.type)}\n` +
                    `**Rareza:** ${item.rarity}\n` +
                    `**Efecto:** ${item.effect}\n` +
                    `**Cantidad:** x${quantity}`,
                    false
                );
            }
        } else {
            embed.addOfficialField(
                '📦 Inventario Vacío',
                category === 'all' 
                    ? 'No tienes ningún objeto en tu inventario. ¡Explora para encontrar tesoros o visita la tienda!'
                    : `No tienes objetos de tipo "${this.categories[category].name}". Prueba con otra categoría.`,
                false
            );
        }
        
        // Crear componentes de interacción
        const components = [];
        
        // Menú de categorías
        const categoryMenu = new OfficialSelectMenuBuilder('inventory_category')
            .addInventoryCategories();
        components.push(new ActionRowBuilder().addComponents(categoryMenu.menu));
        
        // Botones de acción para el inventario
        if (displayedItems.length > 0) {
            const actionButtons = new OfficialButtonBuilder()
                .addInventoryButtons()
                .buildRows();
            components.push(...actionButtons);
        }
        
        // Botones de navegación si hay múltiples páginas
        if (totalPages > 1) {
            const navigationButtons = new OfficialButtonBuilder()
                .addNavigationButtons(currentPage, totalPages, 'inventory_page')
                .buildRows(3);
            components.push(...navigationButtons);
        }
        
        // Botón para volver al perfil
        const profileButton = new OfficialButtonBuilder()
            .addOfficialButton('character_profile', 'Volver al Perfil', 'secondary', '👤')
            .buildRows();
        components.push(...profileButton);
        
        // Responder a la interacción
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [embed], components });
        } else {
            await interaction.reply({ embeds: [embed], components });
        }
        
        return { embed, components };
    }
    
    /**
     * Obtiene los items del inventario según la categoría
     */
    getItemsByCategory(inventoryItems, category) {
        const result = [];
        
        for (const [itemId, quantity] of Object.entries(inventoryItems)) {
            const item = this.gameManager.gameData.ITEMS[itemId];
            if (!item) continue; // Skip if item doesn't exist in game data
            
            if (category === 'all' || item.type === category) {
                result.push({ itemId, item, quantity });
            }
        }
        
        // Ordenar por rareza y nombre
        return result.sort((a, b) => {
            // Primero por tipo
            if (a.item.type !== b.item.type) {
                return a.item.type.localeCompare(b.item.type);
            }
            // Luego por rareza (descendente)
            if (a.item.rarity !== b.item.rarity) {
                return b.item.rarity.localeCompare(a.item.rarity);
            }
            // Finalmente por nombre
            return a.item.name.localeCompare(b.item.name);
        });
    }
    
    /**
     * Añade información de equipamiento al embed
     */
    addEquipmentInfo(embed, equipment) {
        const equipmentInfo = [];
        
        // Verificar cada slot de equipamiento
        const slots = {
            weapon: { name: 'Arma', emoji: '⚔️' },
            armor: { name: 'Armadura', emoji: '🛡️' },
            accessory: { name: 'Accesorio', emoji: '💍' }
        };
        
        for (const [slot, info] of Object.entries(slots)) {
            const itemId = equipment[slot];
            if (itemId && this.gameManager.gameData.ITEMS[itemId]) {
                const item = this.gameManager.gameData.ITEMS[itemId];
                equipmentInfo.push(`${info.emoji} **${info.name}:** ${item.name} (${item.effect})`);
            } else {
                equipmentInfo.push(`${info.emoji} **${info.name}:** No equipado`);
            }
        }
        
        embed.addOfficialField('Equipamiento', equipmentInfo.join('\n'), false, '🧰');
    }
    
    /**
     * Verifica si un item está equipado
     */
    isItemEquipped(equipment, itemId) {
        return Object.values(equipment).includes(itemId);
    }
    
    /**
     * Obtiene la capacidad del inventario del jugador
     */
    getInventoryCapacity(player) {
        // Capacidad base + bonificaciones
        let capacity = this.defaultSlots;
        
        // Añadir bonificaciones de habilidades, quirks, etc.
        if (player.quirks) {
            for (const quirk of player.quirks) {
                if (quirk.bonuses && quirk.bonuses.inventorySlots) {
                    capacity += quirk.bonuses.inventorySlots;
                }
            }
        }
        
        return capacity;
    }
    
    /**
     * Usa un objeto del inventario
     */
    async useItem(interaction, userId, itemId) {
        const player = await this.gameManager.getPlayer(userId);
        if (!player || !player.inventory || !player.inventory.items[itemId]) {
            await interaction.reply({
                content: '⚠️ No tienes ese objeto en tu inventario.',
                ephemeral: true
            });
            return false;
        }
        
        const item = this.gameManager.gameData.ITEMS[itemId];
        if (!item) {
            await interaction.reply({
                content: '⚠️ Objeto no encontrado en la base de datos del juego.',
                ephemeral: true
            });
            return false;
        }
        
        // Verificar si el objeto es usable
        if (item.type !== 'consumible' && item.type !== 'especial') {
            await interaction.reply({
                content: `⚠️ No puedes usar este tipo de objeto. Los objetos de tipo ${item.type} deben ser equipados, no usados.`,
                ephemeral: true
            });
            return false;
        }
        
        // Aplicar efectos del objeto
        const result = await this.applyItemEffects(player, item);
        
        // Consumir el objeto
        await this.gameManager.playerDB.useItem(userId, itemId, 1);
        
        // Mostrar resultado
        await interaction.reply({
            content: `✅ Has usado **${item.name}**. ${result.message}`,
            ephemeral: true
        });
        
        return true;
    }
    
    /**
     * Equipa un objeto
     */
    async equipItem(interaction, userId, itemId) {
        const player = await this.gameManager.getPlayer(userId);
        if (!player || !player.inventory || !player.inventory.items[itemId]) {
            await interaction.reply({
                content: '⚠️ No tienes ese objeto en tu inventario.',
                ephemeral: true
            });
            return false;
        }
        
        const item = this.gameManager.gameData.ITEMS[itemId];
        if (!item) {
            await interaction.reply({
                content: '⚠️ Objeto no encontrado en la base de datos del juego.',
                ephemeral: true
            });
            return false;
        }
        
        // Determinar el slot según el tipo de item
        let slot;
        switch (item.type) {
            case 'arma':
                slot = 'weapon';
                break;
            case 'armadura':
                slot = 'armor';
                break;
            case 'accesorio':
                slot = 'accessory';
                break;
            default:
                await interaction.reply({
                    content: `⚠️ No puedes equipar este tipo de objeto. Los objetos de tipo ${item.type} deben ser usados, no equipados.`,
                    ephemeral: true
                });
                return false;
        }
        
        // Equipar el objeto
        await this.gameManager.playerDB.equipItem(userId, itemId, slot);
        
        // Mostrar resultado
        await interaction.reply({
            content: `✅ Has equipado **${item.name}** en el slot de ${this.getSlotName(slot)}.`,
            ephemeral: true
        });
        
        return true;
    }
    
    /**
     * Vende un objeto
     */
    async sellItem(interaction, userId, itemId, quantity = 1) {
        const player = await this.gameManager.getPlayer(userId);
        if (!player || !player.inventory || !player.inventory.items[itemId]) {
            await interaction.reply({
                content: '⚠️ No tienes ese objeto en tu inventario.',
                ephemeral: true
            });
            return false;
        }
        
        const item = this.gameManager.gameData.ITEMS[itemId];
        if (!item) {
            await interaction.reply({
                content: '⚠️ Objeto no encontrado en la base de datos del juego.',
                ephemeral: true
            });
            return false;
        }
        
        // Verificar si tiene suficientes unidades
        if (player.inventory.items[itemId] < quantity) {
            await interaction.reply({
                content: `⚠️ No tienes suficientes unidades de este objeto. Tienes ${player.inventory.items[itemId]} y quieres vender ${quantity}.`,
                ephemeral: true
            });
            return false;
        }
        
        // Verificar si el objeto está equipado
        if (this.isItemEquipped(player.inventory.equipment, itemId)) {
            await interaction.reply({
                content: '⚠️ No puedes vender un objeto que está equipado. Desequípalo primero.',
                ephemeral: true
            });
            return false;
        }
        
        // Calcular precio de venta (50% del valor original)
        const sellPrice = Math.floor((item.price || 0) * 0.5) * quantity;
        
        // Consumir el objeto
        await this.gameManager.playerDB.useItem(userId, itemId, quantity);
        
        // Añadir oro
        player.inventory.gold = (player.inventory.gold || 0) + sellPrice;
        await this.gameManager.playerDB.savePlayer(player);
        
        // Mostrar resultado
        await interaction.reply({
            content: `💰 Has vendido ${quantity}x **${item.name}** por ${sellPrice} de oro.`,
            ephemeral: true
        });
        
        return true;
    }
    
    /**
     * Aplica los efectos de un objeto al jugador
     */
    async applyItemEffects(player, item) {
        // Parsear el efecto del objeto
        const effectText = item.effect || '';
        const result = { success: true, message: '' };
        
        // Efectos comunes
        if (effectText.includes('+') || effectText.includes('-')) {
            // Buscar patrones como "+10 HP", "-5 MP", etc.
            const statEffects = effectText.match(/([+-]\d+)\s+(\w+)/g) || [];
            
            for (const statEffect of statEffects) {
                const [_, amount, stat] = statEffect.match(/([+-]\d+)\s+(\w+)/) || [];
                if (!amount || !stat) continue;
                
                const numAmount = parseInt(amount);
                
                switch (stat.toUpperCase()) {
                    case 'HP':
                        player.stats.hp = Math.min(player.stats.hp + numAmount, player.stats.maxHp || 100);
                        result.message += `Recuperaste ${numAmount} HP. `;
                        break;
                    case 'MP':
                        player.stats.mp = Math.min(player.stats.mp + numAmount, player.stats.maxMp || 50);
                        result.message += `Recuperaste ${numAmount} MP. `;
                        break;
                    case 'EXP':
                        await this.gameManager.playerDB.addExperience(player.userId, numAmount);
                        result.message += `Ganaste ${numAmount} EXP. `;
                        break;
                }
            }
        }
        
        // Efectos especiales
        if (item.id === 'pergamino_teletransporte') {
            result.message = 'Puedes teletransportarte a cualquier zona desbloqueada.';
            // La lógica de teletransporte se implementaría en el comando específico
        }
        
        // Guardar cambios en el jugador
        await this.gameManager.playerDB.savePlayer(player);
        
        return result;
    }
    
    /**
     * Añade un objeto al inventario del jugador
     */
    async addItem(userId, itemId, quantity = 1) {
        return await this.gameManager.playerDB.addItem(userId, itemId, quantity);
    }
    
    /**
     * Obtiene el emoji para un tipo de objeto
     */
    getItemTypeEmoji(type) {
        const typeEmojis = {
            consumible: '🧪',
            arma: '⚔️',
            armadura: '🛡️',
            accesorio: '💍',
            especial: '🌟'
        };
        
        return typeEmojis[type] || '📦';
    }
    
    /**
     * Obtiene el nombre de un slot de equipamiento
     */
    getSlotName(slot) {
        const slotNames = {
            weapon: 'Arma',
            armor: 'Armadura',
            accessory: 'Accesorio'
        };
        
        return slotNames[slot] || slot;
    }
    
    /**
     * Capitaliza la primera letra de un string
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

module.exports = InventorySystem;