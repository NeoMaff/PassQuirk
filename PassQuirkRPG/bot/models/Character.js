// 🧙‍♂️ MODELO CHARACTER - Esquema de base de datos para personajes RPG
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Character = sequelize.define('Character', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'userId'
        }
    },
    
    // Información básica del personaje
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 20]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 500]
        }
    },
    
    // Clase del personaje según documentación oficial
    class: {
        type: DataTypes.ENUM('Celestial', 'Fenix', 'Berserker', 'Inmortal', 'Demon', 'Sombra'),
        allowNull: false
    },
    
    // Reino elegido según documentación oficial
    region: {
        type: DataTypes.ENUM('Akai', 'Say', 'Masai'),
        allowNull: false
    },
    
    // Estadísticas base del personaje
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 100
        }
    },
    experience: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    
    // Estadísticas de combate
    health: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        validate: {
            min: 0
        }
    },
    maxHealth: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        validate: {
            min: 1
        }
    },
    mana: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
        validate: {
            min: 0
        }
    },
    maxMana: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
        validate: {
            min: 1
        }
    },
    
    // Atributos principales
    attack: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        validate: {
            min: 1
        }
    },
    defense: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        validate: {
            min: 1
        }
    },
    speed: {
        type: DataTypes.INTEGER,
        defaultValue: 8,
        validate: {
            min: 1
        }
    },
    intelligence: {
        type: DataTypes.INTEGER,
        defaultValue: 7,
        validate: {
            min: 1
        }
    },
    
    // Ubicación actual
    currentZone: {
        type: DataTypes.STRING,
        defaultValue: 'Space Central'
    },
    coordinates: {
        type: DataTypes.JSON,
        defaultValue: { x: 0, y: 0 }
    },
    
    // Quirks del personaje (habilidades especiales)
    quirks: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Inventario del personaje
    inventory: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Equipamiento actual
    equipment: {
        type: DataTypes.JSON,
        defaultValue: {
            weapon: null,
            armor: null,
            helmet: null,
            boots: null,
            accessory: null
        }
    },
    
    // Misiones activas y completadas
    activeQuests: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    completedQuests: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Estado del tutorial
    tutorialCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tutorialStep: {
        type: DataTypes.STRING,
        defaultValue: 'not_started'
    },
    
    // Estadísticas de combate
    combatStats: {
        type: DataTypes.JSON,
        defaultValue: {
            battlesWon: 0,
            battlesLost: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            enemiesDefeated: 0
        }
    },
    
    // Estado actual del personaje
    isInCombat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isExploring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    
    // Cooldowns
    lastCombat: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastExploration: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'characters'
});

// Métodos de instancia para el personaje
Character.prototype.gainExperience = async function(amount) {
    this.experience += amount;
    
    // Calcular si sube de nivel (100 XP por nivel)
    const requiredXP = this.level * 100;
    if (this.experience >= requiredXP) {
        this.level += 1;
        this.experience -= requiredXP;
        
        // Aumentar estadísticas al subir de nivel
        this.maxHealth += 10;
        this.health = this.maxHealth; // Curar al subir de nivel
        this.maxMana += 5;
        this.mana = this.maxMana;
        this.attack += 2;
        this.defense += 1;
        this.speed += 1;
        this.intelligence += 1;
        
        await this.save();
        return { levelUp: true, newLevel: this.level };
    }
    
    await this.save();
    return { levelUp: false };
};

Character.prototype.takeDamage = async function(damage) {
    const actualDamage = Math.max(1, damage - this.defense);
    this.health = Math.max(0, this.health - actualDamage);
    
    // Actualizar estadísticas de combate
    const stats = this.combatStats;
    stats.totalDamageTaken += actualDamage;
    this.combatStats = stats;
    
    await this.save();
    return { damage: actualDamage, isDead: this.health <= 0 };
};

Character.prototype.heal = async function(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    await this.save();
    return this.health;
};

Character.prototype.addItem = async function(item) {
    const inventory = this.inventory || [];
    const existingItemIndex = inventory.findIndex(i => i.id === item.id);
    
    if (existingItemIndex !== -1) {
        inventory[existingItemIndex].quantity += item.quantity || 1;
    } else {
        inventory.push({
            ...item,
            quantity: item.quantity || 1,
            obtainedAt: new Date()
        });
    }
    
    this.inventory = inventory;
    await this.save();
    return this;
};

Character.prototype.removeItem = async function(itemId, quantity = 1) {
    const inventory = this.inventory || [];
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) return false;
    
    if (inventory[itemIndex].quantity > quantity) {
        inventory[itemIndex].quantity -= quantity;
    } else {
        inventory.splice(itemIndex, 1);
    }
    
    this.inventory = inventory;
    await this.save();
    return true;
};

Character.prototype.hasItem = function(itemId, quantity = 1) {
    const inventory = this.inventory || [];
    const item = inventory.find(i => i.id === itemId);
    return item && item.quantity >= quantity ? item : false;
};

module.exports = Character;