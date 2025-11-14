const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },

    // Item Type
    type: {
        type: String,
        enum: ['weapon', 'armor', 'consumable', 'material', 'quest', 'misc'],
        required: true
    },

    // Item Subtype
    subtype: String, // e.g., 'sword', 'potion', 'ore', etc.

    // Rarity
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'],
        default: 'common'
    },

    // Value
    value: { type: Number, default: 0 }, // Sell price
    buyPrice: { type: Number, default: 0 }, // Buy price (0 = not purchasable)

    // Equipment Stats (for weapons and armor)
    stats: {
        attack: { type: Number, default: 0 },
        defense: { type: Number, default: 0 },
        magicPower: { type: Number, default: 0 },
        magicDefense: { type: Number, default: 0 },
        strength: { type: Number, default: 0 },
        dexterity: { type: Number, default: 0 },
        intelligence: { type: Number, default: 0 },
        constitution: { type: Number, default: 0 },
        luck: { type: Number, default: 0 },
        speed: { type: Number, default: 0 },
        criticalChance: { type: Number, default: 0 },
        evasion: { type: Number, default: 0 }
    },

    // Equipment Slot (for weapons and armor)
    slot: {
        type: String,
        enum: ['head', 'chest', 'hands', 'legs', 'feet', 'weapon', 'offhand', 'accessory', null],
        default: null
    },

    // Requirements
    requirements: {
        level: { type: Number, default: 1 },
        class: [String], // Empty array = all classes
        stats: {
            strength: { type: Number, default: 0 },
            dexterity: { type: Number, default: 0 },
            intelligence: { type: Number, default: 0 }
        }
    },

    // Effects (for consumables)
    effects: [{
        type: {
            type: String,
            enum: ['heal_hp', 'heal_mana', 'heal_energy', 'buff', 'debuff', 'status', 'experience', 'gold']
        },
        value: Number, // Amount or percentage
        duration: Number, // In turns or seconds
        target: {
            type: String,
            enum: ['self', 'ally', 'enemy', 'all_allies', 'all_enemies'],
            default: 'self'
        }
    }],

    // Crafting
    craftable: { type: Boolean, default: false },
    craftingRecipe: [{
        itemId: String,
        amount: Number
    }],
    craftingCost: { type: Number, default: 0 },

    // Stacking
    stackable: { type: Boolean, default: true },
    maxStack: { type: Number, default: 99 },

    // Tradeable
    tradeable: { type: Boolean, default: true },
    sellable: { type: Boolean, default: true },

    // Icon/Image
    icon: String,
    image: String,

    // Metadata
    lore: String,
    tags: [String],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp before saving
itemSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get items by type
itemSchema.statics.getByType = function(type) {
    return this.find({ type });
};

// Static method to get items by rarity
itemSchema.statics.getByRarity = function(rarity) {
    return this.find({ rarity });
};

// Static method to get shop items
itemSchema.statics.getShopItems = function() {
    return this.find({ buyPrice: { $gt: 0 } }).sort({ buyPrice: 1 });
};

// Method to check if character can equip
itemSchema.methods.canEquip = function(character) {
    if (this.type !== 'weapon' && this.type !== 'armor') {
        return { canEquip: false, reason: 'Item is not equipable' };
    }

    if (character.level < this.requirements.level) {
        return { canEquip: false, reason: `Requires level ${this.requirements.level}` };
    }

    if (this.requirements.class.length > 0 && !this.requirements.class.includes(character.class)) {
        return { canEquip: false, reason: `Requires class: ${this.requirements.class.join(', ')}` };
    }

    if (character.stats.strength < this.requirements.stats.strength) {
        return { canEquip: false, reason: `Requires ${this.requirements.stats.strength} strength` };
    }

    if (character.stats.dexterity < this.requirements.stats.dexterity) {
        return { canEquip: false, reason: `Requires ${this.requirements.stats.dexterity} dexterity` };
    }

    if (character.stats.intelligence < this.requirements.stats.intelligence) {
        return { canEquip: false, reason: `Requires ${this.requirements.stats.intelligence} intelligence` };
    }

    return { canEquip: true };
};

// Indexes
itemSchema.index({ itemId: 1 });
itemSchema.index({ type: 1, rarity: 1 });
itemSchema.index({ buyPrice: 1 });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
