/**
 * PassQuirk Game Manager
 * Sistema central que coordina todos los subsistemas del juego
 */

const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Importar sistemas del juego
const { PlayerDatabase } = require('../data/player-database');
const passquirkData = require('../data/passquirk-official-data');

class PassQuirkGameManager {
    constructor(client) {
        this.client = client;
        this.playerDB = new PlayerDatabase();
        this.activeSessions = new Map();
        this.gameData = passquirkData;
        
        // Sistemas del juego
        this.systems = {
            combat: null,      // Sistema de combate
            exploration: null, // Sistema de exploración
            inventory: null,   // Sistema de inventario
            quirks: null,      // Sistema de quirks
            shop: null,        // Sistema de tienda
            quests: null,      // Sistema de misiones
            dialogue: null     // Sistema de diálogos
        };
        
        // Inicializar sistemas
        this.initializeSystems();
        
        console.log('🎮 PassQuirk Game Manager inicializado');
    }
    
    /**
     * Inicializa todos los subsistemas del juego
     */
    initializeSystems() {
        // Intentar cargar los sistemas si existen
        try {
            // Ruta base para los sistemas
            const systemsPath = path.join(__dirname, '../../src/systems');
            
            // Cargar sistema de combate
            if (fs.existsSync(path.join(systemsPath, 'combat-system.js'))) {
                const CombatSystem = require(path.join(systemsPath, 'combat-system.js'));
                this.systems.combat = new CombatSystem(this);
                console.log('⚔️ Sistema de combate cargado');
            }
            
            // Cargar sistema de exploración
            if (fs.existsSync(path.join(systemsPath, 'exploration-system.js'))) {
                const ExplorationSystem = require(path.join(systemsPath, 'exploration-system.js'));
                this.systems.exploration = new ExplorationSystem(this);
                console.log('🗺️ Sistema de exploración cargado');
            }
            
            // Cargar sistema de inventario
            if (fs.existsSync(path.join(systemsPath, 'inventory-system.js'))) {
                const InventorySystem = require(path.join(systemsPath, 'inventory-system.js'));
                this.systems.inventory = new InventorySystem(this);
                console.log('🎒 Sistema de inventario cargado');
            }
            
            // Cargar sistema de quirks
            if (fs.existsSync(path.join(systemsPath, 'quirks-system.js'))) {
                const QuirksSystem = require(path.join(systemsPath, 'quirks-system.js'));
                this.systems.quirks = new QuirksSystem(this);
                console.log('✨ Sistema de quirks cargado');
            }
            
            // Cargar sistema de tienda
            if (fs.existsSync(path.join(systemsPath, 'shop-system.js'))) {
                const { ShopSystem } = require(path.join(systemsPath, 'shop-system.js'));
                this.systems.shop = ShopSystem;
                console.log('🛒 Sistema de tienda cargado');
            }
            
            // Cargar sistema de misiones
            if (fs.existsSync(path.join(systemsPath, 'quest-system.js'))) {
                const QuestSystem = require(path.join(systemsPath, 'quest-system.js'));
                this.systems.quests = new QuestSystem(this);
                console.log('📜 Sistema de misiones cargado');
            }
            
            // Cargar sistema de diálogos
            if (this.client && this.client.dialogueManager) {
                this.systems.dialogue = this.client.dialogueManager;
                console.log('💬 Sistema de diálogos cargado');
            }
        } catch (error) {
            console.error('Error al inicializar sistemas del juego:', error);
        }
    }
    
    /**
     * Obtiene los datos de un jugador
     * @param {string} userId - ID del usuario
     * @returns {Object} Datos del jugador
     */
    async getPlayer(userId) {
        return await this.playerDB.getPlayer(userId);
    }
    
    /**
     * Crea un nuevo personaje para un jugador
     * @param {string} userId - ID del usuario
     * @param {string} username - Nombre de usuario
     * @param {Object} characterData - Datos del personaje
     * @returns {Object} Datos del jugador actualizado
     */
    async createCharacter(userId, username, characterData) {
        const { name, className, passquirkName, description, avatarURL } = characterData;
        
        // Verificar si el jugador ya existe
        const existingPlayer = await this.playerDB.getPlayer(userId);
        if (existingPlayer && existingPlayer.class !== 'Novato') {
            throw new Error('Ya tienes un personaje creado');
        }
        
        // Verificar compatibilidad de clase y passquirk
        const passquirk = this.getPassquirkByName(passquirkName);
        if (!passquirk) {
            throw new Error(`PassQuirk no encontrado: ${passquirkName}`);
        }
        
        if (!passquirk.compatibleClasses.includes(className)) {
            throw new Error(`La clase ${className} no es compatible con el PassQuirk ${passquirkName}`);
        }
        
        // Crear o actualizar jugador
        const player = existingPlayer || await this.playerDB.createPlayer(userId, username);
        
        // Actualizar datos del personaje
        player.name = name;
        player.class = className;
        player.passquirk = {
            name: passquirkName,
            level: 1,
            element: passquirk.element,
            rarity: passquirk.rarity,
            emoji: passquirk.emoji
        };
        player.description = description;
        player.avatarURL = avatarURL;
        
        // Aplicar bonificaciones de clase
        this.applyClassBonuses(player, className);
        
        // Guardar jugador
        await this.playerDB.savePlayer(player);
        
        return player;
    }
    
    /**
     * Aplica bonificaciones de estadísticas según la clase
     * @param {Object} player - Datos del jugador
     * @param {string} className - Nombre de la clase
     */
    applyClassBonuses(player, className) {
        // Bonificaciones base por clase
        const bonuses = {
            '🔥 Fénix': {
                hp: 20,
                mp: 30,
                attack: 15,
                defense: 10,
                speed: 12,
                intelligence: 8,
                strength: 12
            },
            '🪽 Celestial': {
                hp: 15,
                mp: 40,
                attack: 10,
                defense: 12,
                speed: 10,
                intelligence: 15,
                wisdom: 15
            },
            '⚔️ Berserker': {
                hp: 30,
                mp: 10,
                attack: 20,
                defense: 15,
                speed: 8,
                strength: 20,
                resistance: 15
            },
            '☠️ Inmortal': {
                hp: 40,
                mp: 15,
                attack: 12,
                defense: 20,
                speed: 5,
                resistance: 20,
                technique: 10
            },
            '👹 Demon': {
                hp: 25,
                mp: 25,
                attack: 18,
                defense: 12,
                speed: 15,
                strength: 15,
                technique: 12
            },
            '⚔️🌀 Sombra': {
                hp: 20,
                mp: 20,
                attack: 15,
                defense: 10,
                speed: 20,
                technique: 15,
                creativity: 15
            }
        };
        
        // Aplicar bonificaciones si la clase existe
        if (bonuses[className]) {
            const classBonus = bonuses[className];
            for (const [stat, value] of Object.entries(classBonus)) {
                if (player.stats[stat] !== undefined) {
                    player.stats[stat] += value;
                }
            }
        }
    }
    
    /**
     * Obtiene un PassQuirk por su nombre
     * @param {string} name - Nombre del PassQuirk
     * @returns {Object} Datos del PassQuirk
     */
    getPassquirkByName(name) {
        for (const [key, passquirk] of Object.entries(this.gameData.PASSQUIRKS)) {
            if (passquirk.name === name) {
                return passquirk;
            }
        }
        return null;
    }
    
    /**
     * Obtiene un enemigo aleatorio según el nivel del jugador
     * @param {number} playerLevel - Nivel del jugador
     * @param {string} zone - Zona de exploración (opcional)
     * @returns {Object} Datos del enemigo
     */
    getRandomEnemy(playerLevel, zone = null) {
        // Implementar lógica para seleccionar enemigo según nivel y zona
        const availableEnemies = Object.values(this.gameData.ENEMIES).filter(enemy => {
            // Filtrar por nivel
            const levelMatch = enemy.level <= playerLevel + 2 && enemy.level >= playerLevel - 3;
            
            // Filtrar por zona si se especifica
            const zoneMatch = !zone || !enemy.zones || enemy.zones.includes(zone);
            
            return levelMatch && zoneMatch;
        });
        
        if (availableEnemies.length === 0) {
            // Si no hay enemigos disponibles, devolver un enemigo básico
            return this.gameData.ENEMIES.slime;
        }
        
        // Seleccionar enemigo aleatorio
        const randomIndex = Math.floor(Math.random() * availableEnemies.length);
        return availableEnemies[randomIndex];
    }
    
    /**
     * Inicia una sesión de juego para un usuario
     * @param {string} userId - ID del usuario
     * @param {string} sessionType - Tipo de sesión (combat, exploration, etc.)
     * @param {Object} sessionData - Datos iniciales de la sesión
     * @returns {string} ID de la sesión
     */
    startSession(userId, sessionType, sessionData = {}) {
        const sessionId = `${sessionType}_${userId}_${Date.now()}`;
        
        this.activeSessions.set(sessionId, {
            userId,
            type: sessionType,
            startTime: Date.now(),
            data: sessionData,
            status: 'active'
        });
        
        return sessionId;
    }
    
    /**
     * Finaliza una sesión de juego
     * @param {string} sessionId - ID de la sesión
     * @returns {boolean} Éxito de la operación
     */
    endSession(sessionId) {
        if (!this.activeSessions.has(sessionId)) {
            return false;
        }
        
        const session = this.activeSessions.get(sessionId);
        session.status = 'completed';
        session.endTime = Date.now();
        
        // Guardar resultados de la sesión si es necesario
        
        this.activeSessions.delete(sessionId);
        return true;
    }
    
    /**
     * Obtiene una sesión activa por su ID
     * @param {string} sessionId - ID de la sesión
     * @returns {Object} Datos de la sesión
     */
    getSession(sessionId) {
        return this.activeSessions.get(sessionId) || null;
    }
    
    /**
     * Obtiene todas las sesiones activas de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Array} Lista de sesiones activas
     */
    getUserSessions(userId) {
        const sessions = [];
        
        for (const [sessionId, session] of this.activeSessions.entries()) {
            if (session.userId === userId && session.status === 'active') {
                sessions.push({
                    id: sessionId,
                    ...session
                });
            }
        }
        
        return sessions;
    }

    /**
     * Obtiene el estado de una misión para un usuario
     * @param {string} userId - ID del usuario
     * @param {string} missionId - ID de la misión
     * @returns {Object} Estado de la misión
     */
    async getMissionState(userId, missionId) {
        const player = await this.getPlayer(userId);
        if (!player) return null;
        
        if (!player.missions) player.missions = {};
        if (!player.missions[missionId]) player.missions[missionId] = { variables: {}, progress: 0, status: 'not_started' };
        
        return player.missions[missionId];
    }
    
    /**
     * Establece una variable para una misión
     * @param {string} userId - ID del usuario
     * @param {string} missionId - ID de la misión
     * @param {string} variable - Nombre de la variable
     * @param {any} value - Valor de la variable
     */
    async setMissionVariable(userId, missionId, variable, value) {
        const player = await this.getPlayer(userId);
        if (!player) return false;
        
        if (!player.missions) player.missions = {};
        if (!player.missions[missionId]) player.missions[missionId] = { variables: {}, progress: 0, status: 'not_started' };
        
        player.missions[missionId].variables[variable] = value;
        await this.playerDB.savePlayer(player);
        
        return true;
    }
    
    /**
     * Actualiza el progreso de una misión
     * @param {string} userId - ID del usuario
     * @param {string} missionId - ID de la misión
     * @param {number} progress - Valor de progreso (0-100)
     * @param {string} status - Estado de la misión (not_started, in_progress, completed, failed)
     */
    async updateMissionProgress(userId, missionId, progress, status) {
        const player = await this.getPlayer(userId);
        if (!player) return false;
        
        if (!player.missions) player.missions = {};
        if (!player.missions[missionId]) player.missions[missionId] = { variables: {}, progress: 0, status: 'not_started' };
        
        player.missions[missionId].progress = progress;
        player.missions[missionId].status = status;
        await this.playerDB.savePlayer(player);
        
        return true;
    }
    
    /**
     * Limpia el estado de una misión
     * @param {string} userId - ID del usuario
     * @param {string} missionId - ID de la misión
     */
    async clearMissionState(userId, missionId) {
        const player = await this.getPlayer(userId);
        if (!player || !player.missions) return false;
        
        if (player.missions[missionId]) {
            delete player.missions[missionId];
            await this.playerDB.savePlayer(player);
        }
        
        return true;
    }
    
    /**
     * Maneja las interacciones de botones delegándolas a los sistemas correspondientes
     * @param {Object} interaction - Interacción de botón de Discord
     * @returns {boolean} True si la interacción fue manejada, false en caso contrario
     */
    async handleButtonInteraction(interaction) {
        const customId = interaction.customId;
        
        try {
            // Delegar a sistema de combate
            if (this.systems.combat && await this.systems.combat.handleButtonInteraction(interaction)) {
                return true;
            }
            
            // Delegar a sistema de exploración
            if (this.systems.exploration && await this.systems.exploration.handleButtonInteraction(interaction)) {
                return true;
            }
            
            // Delegar a sistema de diálogos
            if (this.systems.dialogue && await this.systems.dialogue.handleButtonInteraction(interaction)) {
                return true;
            }
            
            // Si ningún sistema maneja la interacción, registrar para debug
            console.log(`⚠️ Interacción de botón no manejada: ${customId}`);
            return false;
            
        } catch (error) {
            console.error('Error en GameManager.handleButtonInteraction:', error);
            throw error;
        }
    }
    
    /**
     * Maneja las interacciones de menús de selección delegándolas a los sistemas correspondientes
     * @param {Object} interaction - Interacción de menú de selección de Discord
     * @returns {boolean} True si la interacción fue manejada, false en caso contrario
     */
    async handleSelectMenuInteraction(interaction) {
        const customId = interaction.customId;
        
        try {
            // Delegar a sistema de inventario
            if (this.systems.inventory && customId.startsWith('inventory_')) {
                // El sistema de inventario maneja sus propios menús de selección
                return false; // Por ahora no implementado
            }
            
            // Delegar a sistema de tienda
            if (this.systems.shop && customId.startsWith('shop_')) {
                // El sistema de tienda maneja sus propios menús de selección
                return false; // Por ahora no implementado
            }
            
            // Si ningún sistema maneja la interacción, registrar para debug
            console.log(`⚠️ Interacción de menú no manejada: ${customId}`);
            return false;
            
        } catch (error) {
            console.error('Error en GameManager.handleSelectMenuInteraction:', error);
            throw error;
        }
    }
}

module.exports = PassQuirkGameManager;