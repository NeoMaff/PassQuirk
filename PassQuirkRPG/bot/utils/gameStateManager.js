const { Collection } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { COLORS } = require('./embedStyles');

/**
 * Gestor de estados del juego para PassQuirk RPG
 * Maneja el estado de los jugadores, combates, misiones, etc.
 */
class GameStateManager {
    constructor() {
        // Almacena los estados de los jugadores (userId -> playerState)
        this.playerStates = new Collection();
        
        // Almacena las sesiones de combate (combatId -> combatState)
        this.combatSessions = new Collection();
        
        // Almacena los diálogos activos (userId -> dialogState)
        this.activeDialogs = new Collection();
        
        // Temporizadores para limpiar estados inactivos
        this.cleanupInterval = setInterval(() => this.cleanupInactiveSessions(), 30 * 60 * 1000); // Cada 30 minutos
    }

    /**
     * Obtiene o crea el estado de un jugador
     * @param {string} userId - ID del usuario de Discord
     * @returns {Object} Estado del jugador
     */
    getPlayerState(userId) {
        if (!this.playerStates.has(userId)) {
            this.playerStates.set(userId, {
                userId,
                lastActivity: Date.now(),
                location: 'town_square', // Ubicación por defecto
                inCombat: false,
                combatId: null,
                inDialog: false,
                dialogId: null,
                inventory: [],
                stats: {
                    health: 100,
                    maxHealth: 100,
                    mana: 50,
                    maxMana: 50,
                    attack: 10,
                    defense: 5,
                    level: 1,
                    xp: 0,
                    xpToNextLevel: 100
                },
                cooldowns: {},
                quests: {},
                lastSaved: null
            });
        }
        
        // Actualizar tiempo de última actividad
        const state = this.playerStates.get(userId);
        state.lastActivity = Date.now();
        
        return state;
    }

    /**
     * Inicia un nuevo combate
     * @param {Array<string>} playerIds - IDs de los jugadores participantes
     * @param {Array<Object>} enemies - Enemigos en el combate
     * @param {Object} options - Opciones adicionales
     * @returns {string} ID del combate
     */
    startCombat(playerIds, enemies, options = {}) {
        const combatId = `combat_${uuidv4()}`;
        const turnOrder = [];
        
        // Crear estado inicial del combate
        const combatState = {
            id: combatId,
            startTime: Date.now(),
            turn: 0,
            currentTurn: 0,
            turnOrder,
            players: {},
            enemies: enemies.map((enemy, index) => ({
                id: `enemy_${index}`,
                ...enemy,
                currentHealth: enemy.health,
                statusEffects: []
            })),
            log: [],
            rewards: {
                xp: 0,
                items: [],
                currency: 0
            },
            options: {
                isPvP: false,
                canFlee: true,
                ...options
            },
            state: 'active' // 'active', 'finished', 'fled'
        };
        
        // Inicializar jugadores en el combate
        playerIds.forEach(playerId => {
            const playerState = this.getPlayerState(playerId);
            playerState.inCombat = true;
            playerState.combatId = combatId;
            
            combatState.players[playerId] = {
                ...playerState.stats,
                statusEffects: [],
                actionsUsed: 0,
                isReady: false
            };
            
            // Agregar al orden de turno
            turnOrder.push({
                id: playerId,
                type: 'player',
                initiative: this.rollInitiative(playerState.stats)
            });
        });
        
        // Agregar enemigos al orden de turno
        combatState.enemies.forEach(enemy => {
            turnOrder.push({
                id: enemy.id,
                type: 'enemy',
                initiative: this.rollInitiative(enemy)
            });
        });
        
        // Ordenar por iniciativa (mayor a menor)
        combatState.turnOrder = turnOrder.sort((a, b) => b.initiative - a.initiative);
        
        // Establecer el primer turno
        if (combatState.turnOrder.length > 0) {
            const firstInTurn = combatState.turnOrder[0];
            combatState.currentTurn = 0;
            
            // Agregar al log
            this.addCombatLog(combatState, {
                type: 'turn_start',
                actor: firstInTurn.id,
                actorType: firstInTurn.type,
                message: `¡${firstInTurn.type === 'player' ? 'Tu turno' : 'Turno del enemigo'}!`
            });
        }
        
        this.combatSessions.set(combatId, combatState);
        return combatId;
    }
    
    /**
     * Realiza una acción en el combate
     * @param {string} combatId - ID del combate
     * @param {string} actorId - ID del actor que realiza la acción
     * @param {string} actionType - Tipo de acción (attack, skill, item, flee)
     * @param {Object} actionData - Datos de la acción
     * @returns {Object} Resultado de la acción
     */
    performCombatAction(combatId, actorId, actionType, actionData = {}) {
        const combat = this.combatSessions.get(combatId);
        if (!combat || combat.state !== 'active') {
            return { success: false, message: 'El combate no está activo o no existe.' };
        }
        
        // Verificar que sea el turno del jugador
        const currentTurn = combat.turnOrder[combat.currentTurn];
        if (!currentTurn || currentTurn.id !== actorId) {
            return { success: false, message: 'No es tu turno.' };
        }
        
        const actor = currentTurn.type === 'player' 
            ? combat.players[actorId]
            : combat.enemies.find(e => e.id === actorId);
            
        if (!actor) {
            return { success: false, message: 'Actor no encontrado.' };
        }
        
        // Procesar la acción
        let result;
        switch (actionType) {
            case 'attack':
                result = this._processAttack(combat, actor, actionData);
                break;
                
            case 'skill':
                result = this._processSkill(combat, actor, actionData);
                break;
                
            case 'item':
                result = this._processItem(combat, actor, actionData);
                break;
                
            case 'flee':
                result = this._processFlee(combat, actor);
                break;
                
            default:
                return { success: false, message: 'Acción no válida.' };
        }
        
        // Verificar si el combate ha terminado
        this._checkCombatEnd(combat);
        
        // Pasar al siguiente turno si la acción no fue de huida
        if (actionType !== 'flee' && combat.state === 'active') {
            this._nextTurn(combat);
        }
        
        return { success: true, combat, ...result };
    }
    
    /**
     * Inicia un diálogo con un NPC
     * @param {string} userId - ID del usuario
     * @param {string} npcId - ID del NPC
     * @param {Array<Object>} dialogTree - Árbol de diálogo
     * @returns {string} ID del diálogo
     */
    startDialog(userId, npcId, dialogTree) {
        const dialogId = `dialog_${uuidv4()}`;
        const playerState = this.getPlayerState(userId);
        
        playerState.inDialog = true;
        playerState.dialogId = dialogId;
        
        this.activeDialogs.set(dialogId, {
            id: dialogId,
            userId,
            npcId,
            currentStep: 0,
            dialogTree,
            variables: {},
            startTime: Date.now(),
            lastActivity: Date.now()
        });
        
        return dialogId;
    }
    
    /**
     * Procesa una respuesta en un diálogo
     * @param {string} dialogId - ID del diálogo
     * @param {number} choiceIndex - Índice de la opción seleccionada
     * @returns {Object} Resultado del diálogo
     */
    processDialogChoice(dialogId, choiceIndex) {
        const dialog = this.activeDialogs.get(dialogId);
        if (!dialog) {
            return { success: false, message: 'Diálogo no encontrado.' };
        }
        
        dialog.lastActivity = Date.now();
        const currentStep = dialog.dialogTree[dialog.currentStep];
        
        // Verificar si la opción es válida
        if (!currentStep.choices || choiceIndex < 0 || choiceIndex >= currentStep.choices.length) {
            return { success: false, message: 'Opción no válida.' };
        }
        
        const choice = currentStep.choices[choiceIndex];
        
        // Procesar acciones de la opción
        if (choice.actions) {
            this._processDialogActions(dialog, choice.actions);
        }
        
        // Mover al siguiente paso o finalizar
        if (choice.nextStep !== undefined) {
            if (choice.nextStep === -1 || choice.nextStep >= dialog.dialogTree.length) {
                // Fin del diálogo
                this.endDialog(dialogId);
                return { 
                    success: true, 
                    finished: true,
                    message: choice.message || 'El diálogo ha terminado.'
                };
            } else {
                // Siguiente paso
                dialog.currentStep = choice.nextStep;
                return { 
                    success: true, 
                    finished: false,
                    currentStep: dialog.dialogTree[dialog.currentStep],
                    message: choice.message
                };
            }
        }
        
        // Si no hay siguiente paso, terminar el diálogo
        this.endDialog(dialogId);
        return { 
            success: true, 
            finished: true,
            message: choice.message || 'El diálogo ha terminado.'
        };
    }
    
    /**
     * Finaliza un diálogo
     * @param {string} dialogId - ID del diálogo
     */
    endDialog(dialogId) {
        const dialog = this.activeDialogs.get(dialogId);
        if (dialog) {
            const playerState = this.getPlayerState(dialog.userId);
            playerState.inDialog = false;
            playerState.dialogId = null;
            this.activeDialogs.delete(dialogId);
        }
    }
    
    /**
     * Limpia las sesiones inactivas
     */
    cleanupInactiveSessions() {
        const now = Date.now();
        const inactiveThreshold = 30 * 60 * 1000; // 30 minutos
        
        // Limpiar combates inactivos
        for (const [id, combat] of this.combatSessions) {
            if (now - combat.startTime > 2 * 60 * 60 * 1000) { // 2 horas
                this.combatSessions.delete(id);
                
                // Notificar a los jugadores
                Object.keys(combat.players).forEach(playerId => {
                    const playerState = this.getPlayerState(playerId);
                    playerState.inCombat = false;
                    playerState.combatId = null;
                });
            }
        }
        
        // Limpiar diálogos inactivos
        for (const [id, dialog] of this.activeDialogs) {
            if (now - dialog.lastActivity > 15 * 60 * 1000) { // 15 minutos
                this.endDialog(id);
            }
        }
    }
    
    // Métodos auxiliares privados
    
    _processAttack(combat, actor, { targetId }) {
        // Implementar lógica de ataque
        return { message: 'Ataque realizado' };
    }
    
    _processSkill(combat, actor, { skillId, targetId }) {
        // Implementar lógica de habilidad
        return { message: 'Habilidad utilizada' };
    }
    
    _processItem(combat, actor, { itemId, targetId }) {
        // Implementar lógica de ítem
        return { message: 'Ítem utilizado' };
    }
    
    _processFlee(combat, actor) {
        // Implementar lógica de huida
        return { message: '¡Has huido del combate!', success: true };
    }
    
    _checkCombatEnd(combat) {
        // Implementar lógica para verificar fin de combate
    }
    
    _nextTurn(combat) {
        // Implementar lógica para pasar al siguiente turno
    }
    
    _processDialogActions(dialog, actions) {
        // Implementar procesamiento de acciones de diálogo
    }
    
    rollInitiative(actor) {
        // Valor base + 1d20
        return (actor.speed || 0) + Math.floor(Math.random() * 20) + 1;
    }
    
    addCombatLog(combat, entry) {
        if (!combat.log) combat.log = [];
        combat.log.push({
            ...entry,
            timestamp: Date.now()
        });
    }
}

// Exportar una instancia singleton
module.exports = new GameStateManager();
