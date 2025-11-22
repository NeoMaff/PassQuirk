const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

/**
 * Gestor de usuarios y datos del juego
 * Sistema de base de datos simple basado en archivos JSON
 */
class UserManager {
    constructor() {
        this.dataPath = path.join(__dirname, 'data');
        this.usersFile = path.join(this.dataPath, 'users.json');
        this.cache = new Map();
        this.saveQueue = new Set();
        this.saveInterval = null;
        
        this.init();
    }

    /**
     * Inicializa el sistema de base de datos
     */
    async init() {
        try {
            // Crear directorio de datos si no existe
            await fs.mkdir(this.dataPath, { recursive: true });
            
            // Cargar datos existentes
            await this.loadUsers();
            
            // Iniciar sistema de guardado automático
            this.startAutoSave();
            
            console.log('✅ UserManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar UserManager:', error);
        }
    }

    /**
     * Carga los datos de usuarios desde el archivo
     */
    async loadUsers() {
        try {
            const data = await fs.readFile(this.usersFile, 'utf8');
            const users = JSON.parse(data);
            
            // Cargar en cache
            for (const [userId, userData] of Object.entries(users)) {
                this.cache.set(userId, userData);
            }
            
            console.log(`📁 Cargados ${this.cache.size} usuarios`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Archivo no existe, crear uno nuevo
                await this.saveUsers();
                console.log('📁 Archivo de usuarios creado');
            } else {
                console.error('❌ Error al cargar usuarios:', error);
            }
        }
    }

    /**
     * Guarda los datos de usuarios al archivo
     */
    async saveUsers() {
        try {
            const users = Object.fromEntries(this.cache);
            await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
            this.saveQueue.clear();
        } catch (error) {
            console.error('❌ Error al guardar usuarios:', error);
        }
    }

    /**
     * Inicia el sistema de guardado automático
     */
    startAutoSave() {
        this.saveInterval = setInterval(async () => {
            if (this.saveQueue.size > 0) {
                await this.saveUsers();
            }
        }, 30000); // Guardar cada 30 segundos si hay cambios
    }

    /**
     * Detiene el sistema de guardado automático
     */
    stopAutoSave() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
    }

    /**
     * Obtiene los datos de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Object|null}
     */
    getUser(userId) {
        return this.cache.get(userId) || null;
    }

    /**
     * Crea un nuevo usuario
     * @param {string} userId - ID del usuario
     * @param {Object} userData - Datos iniciales del usuario
     * @returns {Object}
     */
    createUser(userId, userData = {}) {
        const defaultUser = {
            id: userId,
            createdAt: Date.now(),
            lastActive: Date.now(),
            character: null,
            stats: {
                commandsUsed: 0,
                timePlayedMs: 0,
                combatsWon: 0,
                combatsLost: 0,
                zonesExplored: 0,
                questsCompleted: 0,
                itemsFound: 0,
                goldEarned: 0,
                goldSpent: 0
            },
            settings: {
                language: 'es',
                notifications: true,
                autoSave: true
            },
            ...userData
        };

        this.cache.set(userId, defaultUser);
        this.saveQueue.add(userId);
        return defaultUser;
    }

    /**
     * Actualiza los datos de un usuario
     * @param {string} userId - ID del usuario
     * @param {Object} updates - Actualizaciones a aplicar
     * @returns {Object|null}
     */
    updateUser(userId, updates) {
        const user = this.cache.get(userId);
        if (!user) return null;

        // Aplicar actualizaciones
        const updatedUser = this.deepMerge(user, updates);
        updatedUser.lastActive = Date.now();
        
        this.cache.set(userId, updatedUser);
        this.saveQueue.add(userId);
        return updatedUser;
    }

    /**
     * Crea un personaje para un usuario
     * @param {string} userId - ID del usuario
     * @param {Object} characterData - Datos del personaje
     * @returns {Object|null}
     */
    createCharacter(userId, characterData) {
        const user = this.getUser(userId) || this.createUser(userId);
        
        if (user.character) {
            throw new Error('El usuario ya tiene un personaje');
        }

        const classData = config.getClass(characterData.class);
        if (!classData) {
            throw new Error('Clase de personaje inválida');
        }

        const character = {
            name: characterData.name,
            class: characterData.class,
            region: characterData.region,
            level: 1,
            exp: 0,
            gold: config.game.startingGold,
            stats: {
                hp: classData.stats.hp,
                maxHp: classData.stats.hp,
                mp: classData.stats.mp,
                maxMp: classData.stats.mp,
                attack: classData.stats.attack,
                defense: classData.stats.defense,
                speed: classData.stats.speed
            },
            inventory: {
                items: [],
                equipment: {
                    weapon: null,
                    armor: null,
                    accessory: null
                },
                maxSlots: config.game.maxInventorySlots
            },
            quirks: {
                active: [],
                learned: [],
                points: 0
            },
            combat: {
                isInCombat: false,
                currentEnemy: null,
                combatStartTime: null
            },
            exploration: {
                currentZone: null,
                isExploring: false,
                exploreStartTime: null
            },
            quests: {
                active: [],
                completed: [],
                daily: {
                    lastReset: Date.now(),
                    quests: []
                }
            },
            achievements: [],
            createdAt: Date.now()
        };

        return this.updateUser(userId, { character });
    }

    /**
     * Actualiza el personaje de un usuario
     * @param {string} userId - ID del usuario
     * @param {Object} updates - Actualizaciones del personaje
     * @returns {Object|null}
     */
    updateCharacter(userId, updates) {
        const user = this.getUser(userId);
        if (!user || !user.character) return null;

        const characterUpdates = {
            character: this.deepMerge(user.character, updates)
        };

        return this.updateUser(userId, characterUpdates);
    }

    /**
     * Añade experiencia a un personaje
     * @param {string} userId - ID del usuario
     * @param {number} expGain - Experiencia a añadir
     * @returns {Object|null} - Información del nivel
     */
    addExperience(userId, expGain) {
        const user = this.getUser(userId);
        if (!user || !user.character) return null;

        const character = user.character;
        const oldLevel = character.level;
        character.exp += expGain;

        // Verificar subida de nivel
        let newLevel = oldLevel;
        while (newLevel < config.game.maxLevel) {
            const expRequired = config.getExpForLevel(newLevel + 1);
            if (character.exp >= expRequired) {
                newLevel++;
                // Aumentar estadísticas por nivel
                this.levelUpCharacter(character);
            } else {
                break;
            }
        }

        character.level = newLevel;
        this.updateUser(userId, { character });

        return {
            oldLevel,
            newLevel,
            expGained: expGain,
            leveledUp: newLevel > oldLevel
        };
    }

    /**
     * Aumenta las estadísticas del personaje al subir de nivel
     * @param {Object} character - Personaje
     */
    levelUpCharacter(character) {
        const classData = config.getClass(character.class);
        if (!classData) return;

        // Aumentar estadísticas base según la clase
        const statGains = {
            hp: Math.floor(classData.stats.hp * 0.1),
            mp: Math.floor(classData.stats.mp * 0.1),
            attack: Math.floor(classData.stats.attack * 0.05),
            defense: Math.floor(classData.stats.defense * 0.05),
            speed: Math.floor(classData.stats.speed * 0.03)
        };

        character.stats.maxHp += statGains.hp;
        character.stats.maxMp += statGains.mp;
        character.stats.attack += statGains.attack;
        character.stats.defense += statGains.defense;
        character.stats.speed += statGains.speed;

        // Restaurar HP y MP al subir de nivel
        character.stats.hp = character.stats.maxHp;
        character.stats.mp = character.stats.maxMp;
    }

    /**
     * Añade oro a un personaje
     * @param {string} userId - ID del usuario
     * @param {number} amount - Cantidad de oro
     * @returns {boolean}
     */
    addGold(userId, amount) {
        const user = this.getUser(userId);
        if (!user || !user.character) return false;

        user.character.gold += amount;
        this.updateUser(userId, { character: user.character });
        
        // Actualizar estadísticas
        if (amount > 0) {
            this.updateUserStats(userId, { goldEarned: amount });
        } else {
            this.updateUserStats(userId, { goldSpent: Math.abs(amount) });
        }

        return true;
    }

    /**
     * Actualiza las estadísticas del usuario
     * @param {string} userId - ID del usuario
     * @param {Object} statUpdates - Actualizaciones de estadísticas
     */
    updateUserStats(userId, statUpdates) {
        const user = this.getUser(userId);
        if (!user) return;

        for (const [stat, value] of Object.entries(statUpdates)) {
            if (user.stats[stat] !== undefined) {
                user.stats[stat] += value;
            }
        }

        this.updateUser(userId, { stats: user.stats });
    }

    /**
     * Obtiene todos los usuarios (para estadísticas globales)
     * @returns {Array}
     */
    getAllUsers() {
        return Array.from(this.cache.values());
    }

    /**
     * Obtiene el ranking de usuarios por criterio
     * @param {string} criteria - Criterio de ranking
     * @param {number} limit - Límite de resultados
     * @returns {Array}
     */
    getRanking(criteria = 'level', limit = 10) {
        const users = this.getAllUsers()
            .filter(user => user.character)
            .sort((a, b) => {
                switch (criteria) {
                    case 'level':
                        return b.character.level - a.character.level;
                    case 'gold':
                        return b.character.gold - a.character.gold;
                    case 'combats':
                        return b.stats.combatsWon - a.stats.combatsWon;
                    case 'quests':
                        return b.stats.questsCompleted - a.stats.questsCompleted;
                    default:
                        return 0;
                }
            });

        return users.slice(0, limit);
    }

    /**
     * Realiza una fusión profunda de objetos
     * @param {Object} target - Objeto objetivo
     * @param {Object} source - Objeto fuente
     * @returns {Object}
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Cierra el gestor de usuarios y guarda los datos
     */
    async close() {
        this.stopAutoSave();
        await this.saveUsers();
        console.log('💾 UserManager cerrado y datos guardados');
    }
}

module.exports = UserManager;