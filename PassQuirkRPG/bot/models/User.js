// 👤 MODELO USER - Esquema de base de datos para usuarios
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    balance: {
        type: DataTypes.INTEGER,
        defaultValue: 1000
    },
    gems: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    pg: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastDaily: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastWork: {
        type: DataTypes.DATE,
        allowNull: true
    },
    dailyStreak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    
    // Campos específicos del RPG
    characterName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    characterClass: {
        type: DataTypes.ENUM('Celestial', 'Fenix', 'Berserker', 'Inmortal', 'Demon', 'Sombra'),
        allowNull: true
    },
    characterRegion: {
        type: DataTypes.ENUM('Akai', 'Say', 'Masai'),
        allowNull: true
    },
    hasCharacter: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    
    // Estadísticas RPG (almacenadas como JSON)
    rpgStats: {
        type: DataTypes.JSON,
        defaultValue: {
            level: 1,
            xp: 0,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            attack: 10,
            defense: 5,
            speed: 8,
            intelligence: 7
        }
    },
    
    // Ubicación y progreso
    location: {
        type: DataTypes.JSON,
        defaultValue: {
            region: 'Centro de Inicio',
            zone: 'Plaza Principal',
            coordinates: { x: 0, y: 0 }
        }
    },
    
    // Quirks (habilidades especiales)
    quirks: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Equipo equipado
    equipment: {
        type: DataTypes.JSON,
        defaultValue: {
            weapon: null,
            armor: null,
            accessory: null
        }
    },
    
    // Misiones y progreso
    quests: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Inventario
    inventory: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Estadísticas generales
    stats: {
        type: DataTypes.JSON,
        defaultValue: {
            level: 1,
            xp: 0,
            messages: 0,
            commands: 0,
            voiceMinutes: 0
        }
    },
    
    // Configuraciones
    settings: {
        type: DataTypes.JSON,
        defaultValue: {
            notifications: true,
            privacy: 'public',
            theme: 'dark'
        }
    },
    
    // Cooldowns
    cooldowns: {
        type: DataTypes.JSON,
        defaultValue: {
            work: null,
            daily: null,
            crime: null,
            rob: null
        }
    },
    
    // Logros
    achievements: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    timestamps: true, // Esto crea automáticamente createdAt y updatedAt
    tableName: 'users'
});

// Métodos de instancia
User.prototype.addMoney = async function(amount, type = 'balance') {
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

User.prototype.removeMoney = async function(amount, type = 'balance') {
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

User.prototype.addItem = async function(item) {
    const inventory = this.inventory || [];
    const existingItemIndex = inventory.findIndex(i => i.itemId === item.itemId);
    
    if (existingItemIndex !== -1) {
        inventory[existingItemIndex].amount += item.amount || 1;
    } else {
        inventory.push({
            ...item,
            amount: item.amount || 1,
            addedAt: new Date()
        });
    }
    
    this.inventory = inventory;
    await this.save();
    return this;
};

User.prototype.removeItem = async function(itemId, amount = 1) {
    const inventory = this.inventory || [];
    const itemIndex = inventory.findIndex(i => i.itemId === itemId);
    
    if (itemIndex === -1) return false;
    
    if (inventory[itemIndex].amount > amount) {
        inventory[itemIndex].amount -= amount;
    } else {
        inventory.splice(itemIndex, 1);
    }
    
    this.inventory = inventory;
    await this.save();
    return true;
};

User.prototype.hasItem = function(itemId, amount = 1) {
    const inventory = this.inventory || [];
    const item = inventory.find(i => i.itemId === itemId);
    return item && item.amount >= amount ? item : false;
};

module.exports = User;
