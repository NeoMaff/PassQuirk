// 🗄️ CONFIGURACIÓN DE BASE DE DATOS - Instancia centralizada
const sequelize = require('../../src/database/connection');

// Función para conectar y sincronizar la base de datos
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos SQLite local');
        
        // Importar modelos
        const User = require('../models/User');
        const Character = require('../models/Character');
        const Enemy = require('../models/Enemy');
        const Item = require('../models/Item');
        const Inventory = require('../models/Inventory');
        
        // Configurar relaciones
        setupAssociations(User, Character, Enemy);
        
        // Sincronizar modelos (crear tablas si no existen)
        await sequelize.sync({ alter: true });
        console.log('✅ Base de datos sincronizada');
        
        // Poblar datos iniciales si es necesario
        await seedInitialData();
        
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        return false;
    }
};

// Función para establecer relaciones entre modelos
function setupAssociations(User, Character, Enemy) {
    // Un usuario puede tener un personaje
    User.hasOne(Character, {
        foreignKey: 'userId',
        sourceKey: 'userId',
        as: 'character'
    });
    
    Character.belongsTo(User, {
        foreignKey: 'userId',
        targetKey: 'userId',
        as: 'user'
    });
    
    // Inventario: Character 1-N Inventory
    const Item = require('../models/Item');
    const Inventory = require('../models/Inventory');

    Character.hasMany(Inventory, {
        foreignKey: 'characterId',
        as: 'inventoryItems'
    });

    Inventory.belongsTo(Character, {
        foreignKey: 'characterId',
        as: 'character'
    });

    // Inventory N-1 Item
    Item.hasMany(Inventory, {
        foreignKey: 'itemId',
        as: 'inventories'
    });

    Inventory.belongsTo(Item, {
        foreignKey: 'itemId',
        as: 'item'
    });

    console.log('🔗 Relaciones de base de datos configuradas.');
}

// Función para poblar datos iniciales
async function seedInitialData() {
    try {
        const Enemy = require('../models/Enemy');
        const Item = require('../models/Item');
        
        // Verificar si ya existen enemigos
        const existingEnemies = await Enemy.count();
        if (existingEnemies === 0) {
            console.log('🌱 Poblando base de datos con enemigos iniciales...');
            // Enemigo especial para tutorial
            const tutorialEnemy = {
                name: 'Slime Verde',
                emoji: '🟢',
                zone: 'Reino de Akai',
                minLevel: 1,
                maxLevel: 1,
                rarity: 'Normal',
                baseHealth: 15,
                baseMana: 0,
                baseAttack: 5,
                baseDefense: 1,
                baseSpeed: 5,
                experienceReward: 10,
                goldReward: { min: 1, max: 3 },
                spawnRate: 100.0
            };
            await Enemy.create(tutorialEnemy);
            console.log('✅ Enemigo de tutorial creado: Slime Verde');
        }

        // Poblar items básicos si no existen
        const existingItems = await Item.count();
        if (existingItems === 0) {
            console.log('🌱 Poblando base de datos con items iniciales...');
            await Item.bulkCreate([
                { id: 'sword_basic', name: 'Espada Básica', type: 'weapon', rarity: 'common', value: 500, stats: { attack: 10 }, emoji: '⚔️' },
                { id: 'bow_basic', name: 'Arco Básico', type: 'weapon', rarity: 'common', value: 450, stats: { attack: 8, speed: 2 }, emoji: '🏹' },
                { id: 'armor_basic', name: 'Armadura Básica', type: 'armor', rarity: 'common', value: 600, stats: { defense: 15 }, emoji: '🛡️' },
                { id: 'helmet_basic', name: 'Casco Básico', type: 'armor', rarity: 'common', value: 300, stats: { defense: 8 }, emoji: '⛑️' },
                { id: 'health_potion', name: 'Poción de Salud', type: 'consumable', rarity: 'common', value: 100, effect: 'heal_50', emoji: '🧪' },
                { id: 'mana_potion', name: 'Poción de Maná', type: 'consumable', rarity: 'common', value: 80, effect: 'mana_30', emoji: '💙' }
            ]);
            console.log('✅ Items iniciales creados');
        }
        
    } catch (error) {
        console.error('❌ Error al poblar datos iniciales:', error);
    }
}

// Función para cerrar la conexión
const closeDatabase = async () => {
    try {
        await sequelize.close();
        console.log('✅ Conexión a la base de datos cerrada');
    } catch (error) {
        console.error('❌ Error al cerrar la base de datos:', error);
    }
};

module.exports = sequelize;
module.exports.connectDatabase = connectDatabase;
module.exports.closeDatabase = closeDatabase;