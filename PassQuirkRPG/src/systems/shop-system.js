// 🛒 SISTEMA DE TIENDA - Gestión de compras y ventas
const { OfficialEmbedBuilder, OFFICIAL_COLORS, OFFICIAL_EMOJIS } = require('../utils/embedStyles');
const User = require('../models/User');

/**
 * Catálogo de items disponibles en la tienda
 */
const SHOP_CATALOG = {
    weapons: {
        name: '⚔️ Armas',
        items: {
            'sword_basic': {
                name: 'Espada Básica',
                description: 'Una espada simple pero efectiva',
                price: 500,
                currency: 'coins',
                stats: { attack: 10 },
                emoji: '⚔️'
            },
            'bow_basic': {
                name: 'Arco Básico',
                description: 'Perfecto para ataques a distancia',
                price: 450,
                currency: 'coins',
                stats: { attack: 8, speed: 2 },
                emoji: '🏹'
            }
        }
    },
    armor: {
        name: '🛡️ Armaduras',
        items: {
            'armor_basic': {
                name: 'Armadura Básica',
                description: 'Protección esencial para aventureros',
                price: 600,
                currency: 'coins',
                stats: { defense: 15 },
                emoji: '🛡️'
            },
            'helmet_basic': {
                name: 'Casco Básico',
                description: 'Protege tu cabeza en combate',
                price: 300,
                currency: 'coins',
                stats: { defense: 8 },
                emoji: '⛑️'
            }
        }
    },
    consumables: {
        name: '🧪 Consumibles',
        items: {
            'health_potion': {
                name: 'Poción de Salud',
                description: 'Restaura 50 HP instantáneamente',
                price: 100,
                currency: 'coins',
                effect: 'heal_50',
                emoji: '🧪'
            },
            'mana_potion': {
                name: 'Poción de Maná',
                description: 'Restaura 30 MP instantáneamente',
                price: 80,
                currency: 'coins',
                effect: 'mana_30',
                emoji: '💙'
            }
        }
    },
    premium: {
        name: '💎 Premium',
        items: {
            'exp_boost': {
                name: 'Impulso de EXP',
                description: 'Duplica la experiencia ganada por 1 hora',
                price: 50,
                currency: 'gems',
                effect: 'exp_boost_1h',
                emoji: '⭐'
            },
            'lucky_charm': {
                name: 'Amuleto de Suerte',
                description: 'Aumenta la probabilidad de drops raros',
                price: 75,
                currency: 'gems',
                effect: 'luck_boost',
                emoji: '🍀'
            }
        }
    }
};

class ShopSystem {
    /**
     * Muestra el catálogo principal de la tienda
     */
    static async showMainCatalog() {
        const embedBuilder = new OfficialEmbedBuilder()
            .setOfficialStyle('shop')
            .setOfficialTitle('Tienda PassQuirk - Catálogo Principal', OFFICIAL_EMOJIS.SHOP)
            .setOfficialDescription(
                '**¡Bienvenido a la tienda oficial de PassQuirk!** 🛒\n\n' +
                'Aquí encontrarás todo lo necesario para tu aventura. ' +
                'Selecciona una categoría para ver los items disponibles.\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            );

        // Agregar categorías
        Object.entries(SHOP_CATALOG).forEach(([key, category]) => {
            const itemCount = Object.keys(category.items).length;
            embedBuilder.addOfficialField(
                category.name,
                `${itemCount} items disponibles`,
                true,
                category.name.split(' ')[0]
            );
        });

        return embedBuilder.getEmbed();
    }

    /**
     * Muestra los items de una categoría específica
     */
    static async showCategory(categoryKey) {
        const category = SHOP_CATALOG[categoryKey];
        if (!category) {
            throw new Error('Categoría no encontrada');
        }

        const embedBuilder = new OfficialEmbedBuilder()
            .setOfficialStyle('shop')
            .setOfficialTitle(`${category.name} - Tienda PassQuirk`, OFFICIAL_EMOJIS.SHOP)
            .setOfficialDescription(
                `**Items disponibles en ${category.name}:**\n\n` +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            );

        // Agregar items
        Object.entries(category.items).forEach(([itemKey, item]) => {
            const currency = item.currency === 'coins' ? '🪙' : '💎';
            const statsText = item.stats ? 
                Object.entries(item.stats).map(([stat, value]) => `${stat}: +${value}`).join(', ') : 
                item.effect || 'Consumible';
            
            embedBuilder.addOfficialField(
                `${item.emoji} ${item.name}`,
                `${item.description}\n**Precio:** ${item.price} ${currency}\n**Efecto:** ${statsText}`,
                true
            );
        });

        return embedBuilder.getEmbed();
    }

    /**
     * Procesa la compra de un item
     */
    static async purchaseItem(userId, categoryKey, itemKey, quantity = 1) {
        const category = SHOP_CATALOG[categoryKey];
        if (!category) {
            throw new Error('Categoría no encontrada');
        }

        const item = category.items[itemKey];
        if (!item) {
            throw new Error('Item no encontrado');
        }

        // Obtener usuario
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const totalPrice = item.price * quantity;
        
        // Verificar fondos
        if (item.currency === 'PassCoins') {
            if (user.balance < totalPrice) {
                throw new Error(`Fondos insuficientes. Necesitas ${totalPrice} monedas.`);
            }
            user.balance -= totalPrice;
        } else if (item.currency === 'PassGem') {
            if (user.gems < totalPrice) {
                throw new Error(`PassGems insuficientes. Necesitas ${totalPrice} PassGems.`);
            }
            user.gems -= totalPrice;
        }

        await user.save();

        // Aquí se agregaría la lógica para añadir el item al inventario
        // Por ahora solo simulamos la compra

        return {
            success: true,
            item: item,
            quantity: quantity,
            totalPrice: totalPrice,
            currency: item.currency,
            remainingBalance: item.currency === 'coins' ? user.balance : user.gems
        };
    }

    /**
     * Obtiene información de un item específico
     */
    static getItemInfo(categoryKey, itemKey) {
        const category = SHOP_CATALOG[categoryKey];
        if (!category) return null;
        
        return category.items[itemKey] || null;
    }

    /**
     * Busca items por nombre
     */
    static searchItems(query) {
        const results = [];
        
        Object.entries(SHOP_CATALOG).forEach(([categoryKey, category]) => {
            Object.entries(category.items).forEach(([itemKey, item]) => {
                if (item.name.toLowerCase().includes(query.toLowerCase()) ||
                    item.description.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        categoryKey,
                        itemKey,
                        item,
                        category: category.name
                    });
                }
            });
        });
        
        return results;
    }
}

module.exports = {
    ShopSystem,
    SHOP_CATALOG
};