// 🎒 INVENTORY SYSTEM - Sistema de Inventario de PassQuirk RPG
// Maneja objetos, equipamiento, consumibles y almacenamiento

const { PassQuirkEmbed } = require('../utils/embedStyles');
const { progressionSystem } = require('./progression-system');
const { classSystem } = require('./class-system');

/**
 * 📦 Tipos de objetos disponibles
 */
const ITEM_TYPES = {
    weapon: 'Arma',
    armor: 'Armadura',
    accessory: 'Accesorio',
    consumable: 'Consumible',
    material: 'Material',
    quest: 'Misión',
    special: 'Especial'
};

/**
 * ⭐ Rarezas de objetos
 */
const ITEM_RARITIES = {
    common: {
        name: 'Común',
        color: 0x808080,
        emoji: '⚪',
        sellMultiplier: 0.5,
        dropRate: 0.6
    },
    uncommon: {
        name: 'Poco Común',
        color: 0x00ff00,
        emoji: '🟢',
        sellMultiplier: 0.6,
        dropRate: 0.25
    },
    rare: {
        name: 'Raro',
        color: 0x0080ff,
        emoji: '🔵',
        sellMultiplier: 0.7,
        dropRate: 0.1
    },
    epic: {
        name: 'Épico',
        color: 0x8000ff,
        emoji: '🟣',
        sellMultiplier: 0.8,
        dropRate: 0.04
    },
    legendary: {
        name: 'Legendario',
        color: 0xff8000,
        emoji: '🟠',
        sellMultiplier: 0.9,
        dropRate: 0.01
    },
    mythic: {
        name: 'Mítico',
        color: 0xff0080,
        emoji: '🔴',
        sellMultiplier: 1.0,
        dropRate: 0.001
    }
};

/**
 * ⚔️ Base de datos de objetos
 */
const ITEM_DATABASE = {
    // ARMAS
    wooden_sword: {
        id: 'wooden_sword',
        name: 'Espada de Madera',
        description: 'Una espada básica hecha de madera resistente.',
        type: 'weapon',
        rarity: 'common',
        value: 50,
        stats: { attack: 5, durability: 100 },
        requirements: { level: 1 },
        emoji: '🗡️'
    },
    
    iron_sword: {
        id: 'iron_sword',
        name: 'Espada de Hierro',
        description: 'Una espada forjada en hierro, más resistente que la madera.',
        type: 'weapon',
        rarity: 'uncommon',
        value: 150,
        stats: { attack: 12, durability: 200 },
        requirements: { level: 5 },
        emoji: '⚔️'
    },
    
    flame_blade: {
        id: 'flame_blade',
        name: 'Hoja Flamígera',
        description: 'Una espada imbuida con el poder del fuego.',
        type: 'weapon',
        rarity: 'rare',
        value: 500,
        stats: { attack: 25, fire_damage: 10, durability: 300 },
        requirements: { level: 15, class: ['warrior', 'mage'] },
        emoji: '🔥',
        effects: ['burn_chance']
    },
    
    dragon_slayer: {
        id: 'dragon_slayer',
        name: 'Matadragones',
        description: 'Una espada legendaria forjada para cazar dragones.',
        type: 'weapon',
        rarity: 'legendary',
        value: 2500,
        stats: { attack: 50, dragon_damage: 100, durability: 500 },
        requirements: { level: 50 },
        emoji: '🐉',
        effects: ['dragon_slayer', 'intimidate']
    },
    
    // ARMADURAS
    leather_armor: {
        id: 'leather_armor',
        name: 'Armadura de Cuero',
        description: 'Protección básica hecha de cuero curtido.',
        type: 'armor',
        rarity: 'common',
        value: 75,
        stats: { defense: 8, durability: 150 },
        requirements: { level: 1 },
        emoji: '🦺'
    },
    
    chainmail: {
        id: 'chainmail',
        name: 'Cota de Malla',
        description: 'Armadura de anillos entrelazados que ofrece buena protección.',
        type: 'armor',
        rarity: 'uncommon',
        value: 200,
        stats: { defense: 15, durability: 250 },
        requirements: { level: 8 },
        emoji: '🛡️'
    },
    
    plate_armor: {
        id: 'plate_armor',
        name: 'Armadura de Placas',
        description: 'Armadura pesada que ofrece máxima protección.',
        type: 'armor',
        rarity: 'rare',
        value: 800,
        stats: { defense: 35, durability: 400 },
        requirements: { level: 20, strength: 25 },
        emoji: '🛡️'
    },
    
    // ACCESORIOS
    power_ring: {
        id: 'power_ring',
        name: 'Anillo de Poder',
        description: 'Un anillo que aumenta la fuerza del portador.',
        type: 'accessory',
        rarity: 'uncommon',
        value: 300,
        stats: { strength: 5 },
        requirements: { level: 10 },
        emoji: '💍'
    },
    
    wisdom_amulet: {
        id: 'wisdom_amulet',
        name: 'Amuleto de Sabiduría',
        description: 'Un amuleto que incrementa la inteligencia.',
        type: 'accessory',
        rarity: 'rare',
        value: 600,
        stats: { intelligence: 8, mana: 20 },
        requirements: { level: 15 },
        emoji: '🔮'
    },
    
    // CONSUMIBLES
    health_potion: {
        id: 'health_potion',
        name: 'Poción de Salud',
        description: 'Restaura 50 puntos de vida.',
        type: 'consumable',
        rarity: 'common',
        value: 25,
        effects: { heal: 50 },
        stackable: true,
        maxStack: 99,
        emoji: '🧪'
    },
    
    mana_potion: {
        id: 'mana_potion',
        name: 'Poción de Maná',
        description: 'Restaura 30 puntos de maná.',
        type: 'consumable',
        rarity: 'common',
        value: 30,
        effects: { mana_restore: 30 },
        stackable: true,
        maxStack: 99,
        emoji: '💙'
    },
    
    exp_boost: {
        id: 'exp_boost',
        name: 'Impulso de Experiencia',
        description: 'Duplica la experiencia ganada por 1 hora.',
        type: 'consumable',
        rarity: 'rare',
        value: 200,
        effects: { exp_multiplier: 2.0, duration: 3600 },
        stackable: true,
        maxStack: 10,
        emoji: '⭐'
    },
    
    // MATERIALES
    iron_ore: {
        id: 'iron_ore',
        name: 'Mineral de Hierro',
        description: 'Material básico para forjar armas y armaduras.',
        type: 'material',
        rarity: 'common',
        value: 10,
        stackable: true,
        maxStack: 999,
        emoji: '⛏️'
    },
    
    dragon_scale: {
        id: 'dragon_scale',
        name: 'Escama de Dragón',
        description: 'Material legendario obtenido de dragones antiguos.',
        type: 'material',
        rarity: 'legendary',
        value: 500,
        stackable: true,
        maxStack: 99,
        emoji: '🐲'
    },
    
    // OBJETOS ESPECIALES
    quirk_crystal: {
        id: 'quirk_crystal',
        name: 'Cristal de Quirk',
        description: 'Un cristal mágico que puede desbloquear nuevos Quirks.',
        type: 'special',
        rarity: 'epic',
        value: 1000,
        effects: { unlock_random_quirk: true },
        emoji: '💎'
    },
    
    class_tome: {
        id: 'class_tome',
        name: 'Tomo de Clase',
        description: 'Un libro antiguo que permite cambiar de clase.',
        type: 'special',
        rarity: 'rare',
        value: 750,
        effects: { class_change: true },
        emoji: '📚'
    }
};

/**
 * 🛍️ Configuración de tiendas
 */
const SHOP_CONFIGS = {
    general_store: {
        name: 'Tienda General',
        description: 'Objetos básicos para aventureros',
        items: [
            { id: 'health_potion', stock: -1, price_multiplier: 1.0 },
            { id: 'mana_potion', stock: -1, price_multiplier: 1.0 },
            { id: 'wooden_sword', stock: 5, price_multiplier: 1.2 },
            { id: 'leather_armor', stock: 3, price_multiplier: 1.2 }
        ],
        emoji: '🏪'
    },
    
    weapon_shop: {
        name: 'Herrería',
        description: 'Armas y armaduras de calidad',
        items: [
            { id: 'iron_sword', stock: 3, price_multiplier: 1.1 },
            { id: 'chainmail', stock: 2, price_multiplier: 1.1 },
            { id: 'flame_blade', stock: 1, price_multiplier: 1.3 },
            { id: 'plate_armor', stock: 1, price_multiplier: 1.3 }
        ],
        requirements: { level: 5 },
        emoji: '⚒️'
    },
    
    magic_shop: {
        name: 'Tienda Mágica',
        description: 'Objetos mágicos y pociones especiales',
        items: [
            { id: 'wisdom_amulet', stock: 2, price_multiplier: 1.2 },
            { id: 'exp_boost', stock: 5, price_multiplier: 1.5 },
            { id: 'quirk_crystal', stock: 1, price_multiplier: 2.0 },
            { id: 'class_tome', stock: 2, price_multiplier: 1.8 }
        ],
        requirements: { level: 10 },
        emoji: '🔮'
    }
};

/**
 * 🎒 Clase principal del sistema de inventario
 */
class InventorySystem {
    constructor() {
        this.itemDatabase = ITEM_DATABASE;
        this.itemTypes = ITEM_TYPES;
        this.itemRarities = ITEM_RARITIES;
        this.shopConfigs = SHOP_CONFIGS;
        this.defaultInventorySize = 50;
    }

    /**
     * 🆕 Inicializa el inventario de un jugador
     */
    initializeInventory(playerData) {
        if (!playerData.inventory) {
            playerData.inventory = {
                items: {},
                equipped: {
                    weapon: null,
                    armor: null,
                    accessory: null
                },
                size: this.defaultInventorySize,
                activeEffects: []
            };
        }
        return playerData.inventory;
    }

    /**
     * ➕ Añade un objeto al inventario
     */
    addItem(playerData, itemId, quantity = 1, durability = null) {
        const item = this.getItem(itemId);
        if (!item) {
            throw new Error(`Objeto no encontrado: ${itemId}`);
        }

        this.initializeInventory(playerData);
        const inventory = playerData.inventory;

        // Verificar espacio en el inventario
        if (!this.hasSpace(inventory, itemId, quantity)) {
            return { success: false, reason: 'no_space' };
        }

        // Si el objeto es apilable
        if (item.stackable) {
            const maxStack = item.maxStack || 99;
            inventory.items[itemId] = inventory.items[itemId] || { quantity: 0 };
            
            const currentQuantity = inventory.items[itemId].quantity;
            const canAdd = Math.min(quantity, maxStack - currentQuantity);
            
            if (canAdd > 0) {
                inventory.items[itemId].quantity += canAdd;
                return { success: true, added: canAdd, remaining: quantity - canAdd };
            } else {
                return { success: false, reason: 'stack_full' };
            }
        } else {
            // Objeto no apilable - crear entrada única
            const uniqueId = this.generateUniqueItemId(itemId);
            inventory.items[uniqueId] = {
                baseId: itemId,
                quantity: 1,
                durability: durability || item.stats?.durability || 100
            };
            return { success: true, added: 1, uniqueId };
        }
    }

    /**
     * ➖ Remueve un objeto del inventario
     */
    removeItem(playerData, itemId, quantity = 1) {
        this.initializeInventory(playerData);
        const inventory = playerData.inventory;

        if (!inventory.items[itemId]) {
            return { success: false, reason: 'not_found' };
        }

        const currentQuantity = inventory.items[itemId].quantity || 1;
        
        if (currentQuantity < quantity) {
            return { success: false, reason: 'insufficient_quantity' };
        }

        if (currentQuantity === quantity) {
            delete inventory.items[itemId];
        } else {
            inventory.items[itemId].quantity -= quantity;
        }

        return { success: true, removed: quantity };
    }

    /**
     * 🎽 Equipa un objeto
     */
    equipItem(playerData, itemId) {
        const item = this.getItem(itemId);
        if (!item) {
            return { success: false, reason: 'item_not_found' };
        }

        // Verificar si el jugador tiene el objeto
        if (!this.hasItem(playerData, itemId)) {
            return { success: false, reason: 'not_in_inventory' };
        }

        // Verificar requisitos
        const canEquip = this.canEquipItem(playerData, item);
        if (!canEquip.canEquip) {
            return { success: false, reason: 'requirements_not_met', details: canEquip.reason };
        }

        this.initializeInventory(playerData);
        const inventory = playerData.inventory;
        const equipSlot = this.getEquipSlot(item.type);

        if (!equipSlot) {
            return { success: false, reason: 'not_equippable' };
        }

        // Desequipar objeto actual si existe
        const currentEquipped = inventory.equipped[equipSlot];
        if (currentEquipped) {
            this.unequipItem(playerData, equipSlot);
        }

        // Equipar nuevo objeto
        inventory.equipped[equipSlot] = itemId;
        
        // Remover del inventario si no es apilable
        if (!item.stackable) {
            this.removeItem(playerData, itemId, 1);
        }

        return { success: true, equipped: itemId, slot: equipSlot, previousItem: currentEquipped };
    }

    /**
     * 👕 Desequipa un objeto
     */
    unequipItem(playerData, slot) {
        this.initializeInventory(playerData);
        const inventory = playerData.inventory;

        const equippedItem = inventory.equipped[slot];
        if (!equippedItem) {
            return { success: false, reason: 'nothing_equipped' };
        }

        // Añadir de vuelta al inventario
        const addResult = this.addItem(playerData, equippedItem, 1);
        if (!addResult.success) {
            return { success: false, reason: 'no_inventory_space' };
        }

        // Remover del slot de equipamiento
        inventory.equipped[slot] = null;

        return { success: true, unequipped: equippedItem };
    }

    /**
     * 🍶 Usa un objeto consumible
     */
    useItem(playerData, itemId, quantity = 1) {
        const item = this.getItem(itemId);
        if (!item) {
            return { success: false, reason: 'item_not_found' };
        }

        if (item.type !== 'consumable') {
            return { success: false, reason: 'not_consumable' };
        }

        if (!this.hasItem(playerData, itemId, quantity)) {
            return { success: false, reason: 'insufficient_quantity' };
        }

        // Aplicar efectos del objeto
        const effects = this.applyItemEffects(playerData, item, quantity);
        
        // Remover del inventario
        this.removeItem(playerData, itemId, quantity);

        return { success: true, effects, used: quantity };
    }

    /**
     * ✨ Aplica los efectos de un objeto
     */
    applyItemEffects(playerData, item, quantity = 1) {
        const appliedEffects = [];

        if (!item.effects) return appliedEffects;

        Object.entries(item.effects).forEach(([effect, value]) => {
            switch (effect) {
                case 'heal':
                    const healAmount = value * quantity;
                    playerData.currentHp = Math.min(
                        (playerData.currentHp || playerData.maxHp || 100) + healAmount,
                        playerData.maxHp || 100
                    );
                    appliedEffects.push({ type: 'heal', amount: healAmount });
                    break;

                case 'mana_restore':
                    const manaAmount = value * quantity;
                    playerData.currentMana = Math.min(
                        (playerData.currentMana || playerData.maxMana || 50) + manaAmount,
                        playerData.maxMana || 50
                    );
                    appliedEffects.push({ type: 'mana_restore', amount: manaAmount });
                    break;

                case 'exp_multiplier':
                    this.addTemporaryEffect(playerData, {
                        type: 'exp_multiplier',
                        value: value,
                        duration: item.effects.duration || 3600,
                        startTime: Date.now()
                    });
                    appliedEffects.push({ type: 'exp_multiplier', value, duration: item.effects.duration });
                    break;

                case 'unlock_random_quirk':
                    const availableQuirks = classSystem.getAvailableQuirks(playerData.class, playerData.level || 1);
                    const unlockedQuirks = playerData.unlockedQuirks || [];
                    const newQuirks = availableQuirks.universalQuirks.filter(q => !unlockedQuirks.includes(q.name));
                    
                    if (newQuirks.length > 0) {
                        const randomQuirk = newQuirks[Math.floor(Math.random() * newQuirks.length)];
                        playerData.unlockedQuirks = playerData.unlockedQuirks || [];
                        playerData.unlockedQuirks.push(randomQuirk.name);
                        appliedEffects.push({ type: 'quirk_unlocked', quirk: randomQuirk });
                    }
                    break;
            }
        });

        return appliedEffects;
    }

    /**
     * ⏰ Añade un efecto temporal
     */
    addTemporaryEffect(playerData, effect) {
        this.initializeInventory(playerData);
        playerData.inventory.activeEffects = playerData.inventory.activeEffects || [];
        
        // Remover efecto del mismo tipo si existe
        playerData.inventory.activeEffects = playerData.inventory.activeEffects.filter(
            e => e.type !== effect.type
        );
        
        playerData.inventory.activeEffects.push(effect);
    }

    /**
     * 🧹 Limpia efectos temporales expirados
     */
    cleanExpiredEffects(playerData) {
        this.initializeInventory(playerData);
        const now = Date.now();
        
        playerData.inventory.activeEffects = playerData.inventory.activeEffects.filter(
            effect => {
                const elapsed = now - effect.startTime;
                return elapsed < (effect.duration * 1000);
            }
        );
    }

    /**
     * 📊 Calcula las estadísticas totales del jugador (base + equipamiento)
     */
    calculateTotalStats(playerData) {
        this.initializeInventory(playerData);
        const inventory = playerData.inventory;
        
        // Estadísticas base del jugador
        const baseStats = playerData.stats || {};
        const totalStats = { ...baseStats };
        
        // Añadir estadísticas del equipamiento
        Object.values(inventory.equipped).forEach(itemId => {
            if (itemId) {
                const item = this.getItem(itemId);
                if (item && item.stats) {
                    Object.entries(item.stats).forEach(([stat, value]) => {
                        if (stat !== 'durability') {
                            totalStats[stat] = (totalStats[stat] || 0) + value;
                        }
                    });
                }
            }
        });
        
        return totalStats;
    }

    /**
     * 🛒 Compra un objeto en una tienda
     */
    buyItem(playerData, shopId, itemId, quantity = 1) {
        const shop = this.shopConfigs[shopId];
        if (!shop) {
            return { success: false, reason: 'shop_not_found' };
        }

        // Verificar requisitos de la tienda
        if (shop.requirements && !this.meetsRequirements(playerData, shop.requirements)) {
            return { success: false, reason: 'shop_requirements_not_met' };
        }

        const shopItem = shop.items.find(item => item.id === itemId);
        if (!shopItem) {
            return { success: false, reason: 'item_not_in_shop' };
        }

        // Verificar stock
        if (shopItem.stock > 0 && shopItem.stock < quantity) {
            return { success: false, reason: 'insufficient_stock' };
        }

        const item = this.getItem(itemId);
        const totalPrice = Math.floor(item.value * shopItem.price_multiplier * quantity);

        // Verificar dinero del jugador
        if ((playerData.coins || 0) < totalPrice) {
            return { success: false, reason: 'insufficient_funds', required: totalPrice };
        }

        // Verificar espacio en inventario
        if (!this.hasSpace(playerData.inventory, itemId, quantity)) {
            return { success: false, reason: 'no_inventory_space' };
        }

        // Realizar compra
        playerData.coins -= totalPrice;
        const addResult = this.addItem(playerData, itemId, quantity);
        
        // Actualizar stock si no es infinito
        if (shopItem.stock > 0) {
            shopItem.stock -= quantity;
        }

        return { 
            success: true, 
            purchased: quantity, 
            totalPrice, 
            addResult 
        };
    }

    /**
     * 💰 Vende un objeto
     */
    sellItem(playerData, itemId, quantity = 1) {
        const item = this.getItem(itemId);
        if (!item) {
            return { success: false, reason: 'item_not_found' };
        }

        if (!this.hasItem(playerData, itemId, quantity)) {
            return { success: false, reason: 'insufficient_quantity' };
        }

        const rarity = this.itemRarities[item.rarity];
        const sellPrice = Math.floor(item.value * rarity.sellMultiplier * quantity);

        // Remover del inventario
        const removeResult = this.removeItem(playerData, itemId, quantity);
        if (!removeResult.success) {
            return removeResult;
        }

        // Añadir dinero
        playerData.coins = (playerData.coins || 0) + sellPrice;

        return { success: true, sold: quantity, totalPrice: sellPrice };
    }

    /**
     * 🎲 Genera un objeto aleatorio basado en nivel y rareza
     */
    generateRandomItem(playerLevel, forceRarity = null) {
        // Determinar rareza si no se especifica
        let rarity = forceRarity;
        if (!rarity) {
            const rand = Math.random();
            const rarities = Object.keys(this.itemRarities);
            
            for (const r of rarities) {
                if (rand <= this.itemRarities[r].dropRate) {
                    rarity = r;
                    break;
                }
            }
            rarity = rarity || 'common';
        }

        // Filtrar objetos por rareza y nivel
        const availableItems = Object.values(this.itemDatabase).filter(item => {
            return item.rarity === rarity && 
                   (!item.requirements?.level || item.requirements.level <= playerLevel);
        });

        if (availableItems.length === 0) {
            return null;
        }

        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        return {
            ...randomItem,
            durability: randomItem.stats?.durability || 100
        };
    }

    // MÉTODOS DE UTILIDAD

    /**
     * 📦 Obtiene información de un objeto
     */
    getItem(itemId) {
        // Si es un ID único, extraer el ID base
        const baseId = itemId.includes('_unique_') ? itemId.split('_unique_')[0] : itemId;
        return this.itemDatabase[baseId];
    }

    /**
     * ✅ Verifica si el jugador tiene un objeto
     */
    hasItem(playerData, itemId, quantity = 1) {
        this.initializeInventory(playerData);
        const inventory = playerData.inventory;
        
        if (!inventory.items[itemId]) return false;
        
        const currentQuantity = inventory.items[itemId].quantity || 1;
        return currentQuantity >= quantity;
    }

    /**
     * 📏 Verifica si hay espacio en el inventario
     */
    hasSpace(inventory, itemId, quantity = 1) {
        const item = this.getItem(itemId);
        if (!item) return false;

        const currentItems = Object.keys(inventory.items).length;
        
        if (item.stackable && inventory.items[itemId]) {
            const currentQuantity = inventory.items[itemId].quantity || 0;
            const maxStack = item.maxStack || 99;
            return (currentQuantity + quantity) <= maxStack;
        }
        
        return currentItems < inventory.size;
    }

    /**
     * 🔧 Verifica si se puede equipar un objeto
     */
    canEquipItem(playerData, item) {
        if (!item.requirements) {
            return { canEquip: true };
        }

        const requirements = item.requirements;
        const playerLevel = playerData.level || 1;
        const playerStats = this.calculateTotalStats(playerData);

        // Verificar nivel
        if (requirements.level && playerLevel < requirements.level) {
            return { canEquip: false, reason: `Nivel ${requirements.level} requerido` };
        }

        // Verificar clase
        if (requirements.class && !requirements.class.includes(playerData.class)) {
            return { canEquip: false, reason: `Clase ${requirements.class.join(' o ')} requerida` };
        }

        // Verificar estadísticas
        Object.entries(requirements).forEach(([stat, value]) => {
            if (stat !== 'level' && stat !== 'class') {
                if ((playerStats[stat] || 0) < value) {
                    return { canEquip: false, reason: `${stat} ${value} requerido` };
                }
            }
        });

        return { canEquip: true };
    }

    /**
     * 🎯 Obtiene el slot de equipamiento para un tipo de objeto
     */
    getEquipSlot(itemType) {
        const slotMap = {
            weapon: 'weapon',
            armor: 'armor',
            accessory: 'accessory'
        };
        return slotMap[itemType] || null;
    }

    /**
     * 🆔 Genera un ID único para objetos no apilables
     */
    generateUniqueItemId(baseId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${baseId}_unique_${timestamp}_${random}`;
    }

    /**
     * ✅ Verifica si se cumplen los requisitos
     */
    meetsRequirements(playerData, requirements) {
        if (requirements.level && (playerData.level || 1) < requirements.level) {
            return false;
        }
        
        if (requirements.class && !requirements.class.includes(playerData.class)) {
            return false;
        }
        
        return true;
    }

    /**
     * 🎨 Genera un embed del inventario
     */
    generateInventoryEmbed(playerData, page = 1, filter = null) {
        this.initializeInventory(playerData);
        const inventory = playerData.inventory;
        
        const itemsPerPage = 10;
        const startIndex = (page - 1) * itemsPerPage;
        
        let items = Object.entries(inventory.items);
        
        // Aplicar filtro si se especifica
        if (filter) {
            items = items.filter(([itemId, data]) => {
                const item = this.getItem(itemId);
                return item && item.type === filter;
            });
        }
        
        const totalPages = Math.ceil(items.length / itemsPerPage);
        const pageItems = items.slice(startIndex, startIndex + itemsPerPage);
        
        const embed = new PassQuirkEmbed()
            .setTitle(`🎒 Inventario de ${playerData.username}`)
            .setDescription(`Página ${page}/${totalPages || 1} • ${items.length} objetos`);
        
        if (pageItems.length === 0) {
            embed.addField('📦 Vacío', 'No tienes objetos en tu inventario.');
        } else {
            pageItems.forEach(([itemId, data]) => {
                const item = this.getItem(itemId);
                if (item) {
                    const rarity = this.itemRarities[item.rarity];
                    const quantity = data.quantity > 1 ? ` x${data.quantity}` : '';
                    const durability = data.durability ? ` (${data.durability}%)` : '';
                    
                    embed.addField(
                        `${rarity.emoji} ${item.name}${quantity}`,
                        `${item.description}${durability}\n💰 ${item.value} monedas`,
                        true
                    );
                }
            });
        }
        
        // Mostrar equipamiento actual
        const equipped = [];
        Object.entries(inventory.equipped).forEach(([slot, itemId]) => {
            if (itemId) {
                const item = this.getItem(itemId);
                if (item) {
                    equipped.push(`${item.emoji} ${item.name}`);
                }
            }
        });
        
        if (equipped.length > 0) {
            embed.addField('⚔️ Equipamiento', equipped.join('\n'));
        }
        
        return embed;
    }

    /**
     * 🏪 Genera un embed de tienda
     */
    generateShopEmbed(shopId, playerData) {
        const shop = this.shopConfigs[shopId];
        if (!shop) return null;
        
        const embed = new PassQuirkEmbed()
            .setTitle(`${shop.emoji} ${shop.name}`)
            .setDescription(shop.description)
            .setColor(0x00ff00);
        
        shop.items.forEach(shopItem => {
            const item = this.getItem(shopItem.id);
            if (item) {
                const price = Math.floor(item.value * shopItem.price_multiplier);
                const stock = shopItem.stock === -1 ? '∞' : shopItem.stock;
                const rarity = this.itemRarities[item.rarity];
                
                embed.addField(
                    `${rarity.emoji} ${item.name}`,
                    `${item.description}\n💰 **${price}** monedas • 📦 Stock: ${stock}`,
                    true
                );
            }
        });
        
        embed.setFooter(`💰 Tienes ${playerData.coins || 0} monedas`);
        
        return embed;
    }
}

// Crear instancia singleton del sistema de inventario
const inventorySystem = new InventorySystem();

module.exports = {
    InventorySystem,
    inventorySystem,
    ITEM_DATABASE,
    ITEM_TYPES,
    ITEM_RARITIES,
    SHOP_CONFIGS
};