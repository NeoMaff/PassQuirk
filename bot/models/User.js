const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    balance: { type: Number, default: 1000 },
    gems: { type: Number, default: 0 },
    pg: { type: Number, default: 0 },
    lastDaily: { type: Date },
    lastWork: { type: Date },
    inventory: [{
        itemId: String,
        name: String,
        description: String,
        value: Number,
        amount: { type: Number, default: 1 },
        type: String,
        rarity: { type: String, default: 'common' },
        createdAt: { type: Date, default: Date.now }
    }],
    stats: {
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        messages: { type: Number, default: 0 },
        commands: { type: Number, default: 0 },
        voiceMinutes: { type: Number, default: 0 }
    },
    settings: {
        notifications: { type: Boolean, default: true },
        privacy: { type: String, enum: ['public', 'private'], default: 'public' },
        theme: { type: String, default: 'dark' }
    },
    cooldowns: {
        work: { type: Date },
        daily: { type: Date },
        crime: { type: Date },
        rob: { type: Date }
    },
    achievements: [{
        id: String,
        name: String,
        description: String,
        icon: String,
        achievedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Actualizar la fecha de actualización antes de guardar
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Método para agregar monedas
userSchema.methods.addMoney = async function(amount, type = 'balance') {
    if (type === 'balance') {
        this.balance += amount;
    } else if (type === 'gems') {
        this.gems += amount;
    } else if (type === 'pg') {
        this.pg += amount;
    }
    await this.save();
    return this;
};

// Método para quitar monedas
userSchema.methods.removeMoney = async function(amount, type = 'balance') {
    if (type === 'balance') {
        if (this.balance < amount) return false;
        this.balance -= amount;
    } else if (type === 'gems') {
        if (this.gems < amount) return false;
        this.gems -= amount;
    } else if (type === 'pg') {
        if (this.pg < amount) return false;
        this.pg -= amount;
    }
    await this.save();
    return true;
};

// Método para agregar un ítem al inventario
userSchema.methods.addItem = async function(item) {
    const existingItem = this.inventory.find(i => i.itemId === item.itemId);
    
    if (existingItem) {
        existingItem.amount += item.amount || 1;
    } else {
        this.inventory.push({
            ...item,
            amount: item.amount || 1,
            addedAt: new Date()
        });
    }
    
    await this.save();
    return this;
};

// Método para quitar un ítem del inventario
userSchema.methods.removeItem = async function(itemId, amount = 1) {
    const itemIndex = this.inventory.findIndex(i => i.itemId === itemId);
    
    if (itemIndex === -1) return false;
    
    if (this.inventory[itemIndex].amount > amount) {
        this.inventory[itemIndex].amount -= amount;
    } else {
        this.inventory.splice(itemIndex, 1);
    }
    
    await this.save();
    return true;
};

// Método para verificar si el usuario tiene un ítem
userSchema.methods.hasItem = function(itemId, amount = 1) {
    const item = this.inventory.find(i => i.itemId === itemId);
    return item && item.amount >= amount ? item : false;
};

// Índices para búsquedas rápidas
userSchema.index({ userId: 1 });
userSchema.index({ 'stats.level': -1, 'stats.xp': -1 });
userSchema.index({ balance: -1 });
userSchema.index({ 'inventory.itemId': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
