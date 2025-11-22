// 👺 MODELO ENEMY - Esquema de base de datos para enemigos
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enemy = sequelize.define('Enemy', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    // Información básica del enemigo
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    emoji: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    
    // Zona donde aparece el enemigo
    zone: {
        type: DataTypes.ENUM(
            'Reino de Akai', 
            'Reino de Say', 
            'Reino de Masai', 
            'Montañas Heladas', 
            'Desierto de las Ilusiones', 
            'Isla del Rey Demonio'
        ),
        allowNull: false
    },
    
    // Nivel del enemigo
    minLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    maxLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    
    // Rareza del enemigo según documentación
    rarity: {
        type: DataTypes.ENUM(
            'Normal',      // 🔵
            'Común',       // 🟢
            'Raro',        // 🟣
            'Legendario',  // 🟡
            'Oscuro',      // ⚫
            'Ancestral',   // 🟣
            'Mítico',      // ⚪
            'Celestial',   // ✨
            'Caos'         // 🔴
        ),
        allowNull: false
    },
    
    // Estadísticas base del enemigo
    baseHealth: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    baseMana: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    baseAttack: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    baseDefense: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    baseSpeed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    baseIntelligence: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        validate: {
            min: 1
        }
    },
    
    // Recompensas por derrotar al enemigo
    experienceReward: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    goldReward: {
        type: DataTypes.JSON,
        defaultValue: { min: 1, max: 5 }
    },
    
    // Posibles drops del enemigo
    possibleDrops: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Habilidades especiales del enemigo
    abilities: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Resistencias y debilidades
    resistances: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    weaknesses: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Comportamiento en combate
    aggressiveness: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        validate: {
            min: 1,
            max: 10
        }
    },
    
    // Probabilidad de aparición (0-100)
    spawnRate: {
        type: DataTypes.FLOAT,
        defaultValue: 50.0,
        validate: {
            min: 0.1,
            max: 100.0
        }
    },
    
    // Estado del enemigo
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    
    // Imagen o sprite del enemigo
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'enemies'
});

// Métodos de instancia para el enemigo
Enemy.prototype.generateInstance = function(playerLevel) {
    // Generar un nivel apropiado para el enemigo basado en el nivel del jugador
    const level = Math.max(
        this.minLevel,
        Math.min(
            this.maxLevel,
            playerLevel + Math.floor(Math.random() * 3) - 1
        )
    );
    
    // Calcular estadísticas escaladas por nivel
    const healthMultiplier = 1 + (level - 1) * 0.1;
    const attackMultiplier = 1 + (level - 1) * 0.08;
    const defenseMultiplier = 1 + (level - 1) * 0.05;
    
    return {
        id: this.id,
        name: this.name,
        emoji: this.emoji,
        level: level,
        health: Math.floor(this.baseHealth * healthMultiplier),
        maxHealth: Math.floor(this.baseHealth * healthMultiplier),
        mana: Math.floor(this.baseMana * healthMultiplier),
        maxMana: Math.floor(this.baseMana * healthMultiplier),
        attack: Math.floor(this.baseAttack * attackMultiplier),
        defense: Math.floor(this.baseDefense * defenseMultiplier),
        speed: this.baseSpeed,
        intelligence: this.baseIntelligence,
        rarity: this.rarity,
        zone: this.zone,
        abilities: this.abilities,
        resistances: this.resistances,
        weaknesses: this.weaknesses,
        experienceReward: Math.floor(this.experienceReward * (1 + (level - 1) * 0.1)),
        goldReward: {
            min: Math.floor(this.goldReward.min * (1 + (level - 1) * 0.1)),
            max: Math.floor(this.goldReward.max * (1 + (level - 1) * 0.1))
        },
        possibleDrops: this.possibleDrops
    };
};

Enemy.prototype.getRarityColor = function() {
    const rarityColors = {
        'Normal': '#3498db',      // 🔵 Azul
        'Común': '#2ecc71',       // 🟢 Verde
        'Raro': '#9b59b6',        // 🟣 Morado
        'Legendario': '#f1c40f',  // 🟡 Amarillo
        'Oscuro': '#2c3e50',      // ⚫ Negro
        'Ancestral': '#8e44ad',   // 🟣 Morado oscuro
        'Mítico': '#ecf0f1',      // ⚪ Blanco
        'Celestial': '#e74c3c',   // ✨ Dorado/Rojo
        'Caos': '#c0392b'         // 🔴 Rojo oscuro
    };
    
    return rarityColors[this.rarity] || '#95a5a6';
};

Enemy.prototype.getRarityEmoji = function() {
    const rarityEmojis = {
        'Normal': '🔵',
        'Común': '🟢',
        'Raro': '🟣',
        'Legendario': '🟡',
        'Oscuro': '⚫',
        'Ancestral': '🟣',
        'Mítico': '⚪',
        'Celestial': '✨',
        'Caos': '🔴'
    };
    
    return rarityEmojis[this.rarity] || '❓';
};

module.exports = Enemy;