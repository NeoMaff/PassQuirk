// 🎯 QUEST SYSTEM - Sistema de Misiones de PassQuirk RPG
// Maneja misiones principales, secundarias, diarias y de eventos

const { PassQuirkEmbed } = require('../utils/embedStyles');
const { progressionSystem } = require('./progression-system');
const { inventorySystem } = require('./inventory-system');
const { worldEngine } = require('./world-engine');

/**
 * 📋 Tipos de misiones
 */
const QUEST_TYPES = {
    main: {
        name: 'Principal',
        emoji: '⭐',
        color: 0xffd700,
        description: 'Misiones de la historia principal'
    },
    side: {
        name: 'Secundaria',
        emoji: '📜',
        color: 0x87ceeb,
        description: 'Misiones opcionales con recompensas'
    },
    daily: {
        name: 'Diaria',
        emoji: '📅',
        color: 0x32cd32,
        description: 'Misiones que se renuevan cada día'
    },
    weekly: {
        name: 'Semanal',
        emoji: '📆',
        color: 0xff6347,
        description: 'Misiones que se renuevan cada semana'
    },
    event: {
        name: 'Evento',
        emoji: '🎉',
        color: 0xff1493,
        description: 'Misiones especiales de eventos limitados'
    },
    guild: {
        name: 'Gremio',
        emoji: '🏰',
        color: 0x9370db,
        description: 'Misiones cooperativas de gremio'
    }
};

/**
 * 🎯 Estados de misiones
 */
const QUEST_STATUS = {
    available: 'Disponible',
    active: 'Activa',
    completed: 'Completada',
    failed: 'Fallida',
    expired: 'Expirada',
    locked: 'Bloqueada'
};

/**
 * 📚 Base de datos de misiones
 */
const QUEST_DATABASE = {
    // MISIONES PRINCIPALES
    welcome_hero: {
        id: 'welcome_hero',
        name: 'Bienvenido, Héroe',
        description: 'Completa tu primer día como aventurero en PassQuirk.',
        type: 'main',
        chapter: 1,
        requirements: { level: 1 },
        objectives: [
            {
                id: 'choose_class',
                description: 'Elige tu clase de aventurero',
                type: 'action',
                target: 'class_selection',
                required: 1,
                current: 0
            },
            {
                id: 'gain_exp',
                description: 'Gana 100 puntos de experiencia',
                type: 'exp_gain',
                target: 100,
                current: 0
            },
            {
                id: 'first_battle',
                description: 'Gana tu primera batalla',
                type: 'combat_victory',
                target: 1,
                current: 0
            }
        ],
        rewards: {
            exp: 200,
            coins: 100,
            items: [{ id: 'wooden_sword', quantity: 1 }],
            title: 'novato'
        },
        story: {
            intro: '¡Bienvenido al mundo de PassQuirk! Tu aventura como héroe comienza ahora.',
            completion: '¡Excelente! Has completado tus primeros pasos como aventurero. El mundo te espera.'
        }
    },
    
    first_exploration: {
        id: 'first_exploration',
        name: 'Primeros Pasos en Akai',
        description: 'Explora la región de Akai y descubre sus secretos.',
        type: 'main',
        chapter: 2,
        requirements: { level: 5, completed_quests: ['welcome_hero'] },
        objectives: [
            {
                id: 'explore_akai',
                description: 'Explora 3 ubicaciones en la región de Akai',
                type: 'exploration',
                target: 3,
                current: 0,
                region: 'akai'
            },
            {
                id: 'defeat_goblins',
                description: 'Derrota 5 goblins',
                type: 'enemy_defeat',
                target: 5,
                current: 0,
                enemy_type: 'goblin'
            }
        ],
        rewards: {
            exp: 500,
            coins: 250,
            items: [{ id: 'health_potion', quantity: 3 }]
        },
        story: {
            intro: 'La región de Akai te llama. Es hora de explorar y enfrentar tus primeros desafíos.',
            completion: 'Has demostrado tu valor en Akai. Nuevas aventuras te esperan.'
        }
    },
    
    shadow_threat: {
        id: 'shadow_threat',
        name: 'La Amenaza de las Sombras',
        description: 'Investiga las extrañas sombras que aparecen en Say.',
        type: 'main',
        chapter: 3,
        requirements: { level: 15, completed_quests: ['first_exploration'] },
        objectives: [
            {
                id: 'investigate_say',
                description: 'Investiga las anomalías en la región de Say',
                type: 'exploration',
                target: 1,
                current: 0,
                region: 'say',
                specific_location: 'shadow_grove'
            },
            {
                id: 'defeat_shadow_beast',
                description: 'Derrota al Bestia de las Sombras',
                type: 'boss_defeat',
                target: 1,
                current: 0,
                boss_id: 'shadow_beast'
            }
        ],
        rewards: {
            exp: 1000,
            coins: 500,
            items: [{ id: 'iron_sword', quantity: 1 }, { id: 'shadow_essence', quantity: 1 }]
        },
        story: {
            intro: 'Extrañas sombras han comenzado a aparecer en Say. Los aldeanos están aterrorizados.',
            completion: 'Has derrotado a la Bestia de las Sombras. La paz regresa a Say, por ahora.'
        }
    },
    
    // MISIONES SECUNDARIAS
    merchant_troubles: {
        id: 'merchant_troubles',
        name: 'Problemas del Mercader',
        description: 'Ayuda al mercader local a recuperar su mercancía robada.',
        type: 'side',
        requirements: { level: 3 },
        objectives: [
            {
                id: 'find_stolen_goods',
                description: 'Encuentra la mercancía robada',
                type: 'item_collection',
                target: 5,
                current: 0,
                item_id: 'stolen_goods'
            },
            {
                id: 'defeat_bandits',
                description: 'Derrota a los bandidos responsables',
                type: 'enemy_defeat',
                target: 3,
                current: 0,
                enemy_type: 'bandit'
            }
        ],
        rewards: {
            exp: 300,
            coins: 150,
            items: [{ id: 'leather_armor', quantity: 1 }],
            reputation: { merchant_guild: 10 }
        },
        story: {
            intro: 'Un mercader desesperado te pide ayuda. Sus bienes han sido robados por bandidos.',
            completion: 'El mercader está muy agradecido. Te ha ganado una buena reputación.'
        }
    },
    
    ancient_artifact: {
        id: 'ancient_artifact',
        name: 'El Artefacto Ancestral',
        description: 'Busca un artefacto perdido en las ruinas de Masai.',
        type: 'side',
        requirements: { level: 20, region_access: 'masai' },
        objectives: [
            {
                id: 'explore_ruins',
                description: 'Explora las ruinas ancestrales',
                type: 'exploration',
                target: 1,
                current: 0,
                region: 'masai',
                specific_location: 'ancient_ruins'
            },
            {
                id: 'solve_puzzle',
                description: 'Resuelve el acertijo de los ancestros',
                type: 'puzzle',
                target: 1,
                current: 0,
                puzzle_id: 'ancient_riddle'
            },
            {
                id: 'retrieve_artifact',
                description: 'Recupera el Orbe de Sabiduría',
                type: 'item_collection',
                target: 1,
                current: 0,
                item_id: 'wisdom_orb'
            }
        ],
        rewards: {
            exp: 800,
            coins: 400,
            items: [{ id: 'wisdom_amulet', quantity: 1 }],
            quirk: 'ancient_knowledge'
        },
        story: {
            intro: 'Un sabio anciano te habla de un artefacto perdido que otorga gran sabiduría.',
            completion: 'Has recuperado el Orbe de Sabiduría. Su poder fluye a través de ti.'
        }
    },
    
    // MISIONES DIARIAS
    daily_training: {
        id: 'daily_training',
        name: 'Entrenamiento Diario',
        description: 'Completa tu rutina de entrenamiento diaria.',
        type: 'daily',
        reset_time: 'daily',
        objectives: [
            {
                id: 'study_session',
                description: 'Realiza una sesión de estudio',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'study'
            },
            {
                id: 'exercise_session',
                description: 'Realiza ejercicio físico',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'exercise'
            }
        ],
        rewards: {
            exp: 100,
            coins: 50,
            items: [{ id: 'health_potion', quantity: 1 }]
        }
    },
    
    daily_battles: {
        id: 'daily_battles',
        name: 'Combates Diarios',
        description: 'Demuestra tu valor en combate.',
        type: 'daily',
        reset_time: 'daily',
        objectives: [
            {
                id: 'win_battles',
                description: 'Gana 3 batallas',
                type: 'combat_victory',
                target: 3,
                current: 0
            }
        ],
        rewards: {
            exp: 150,
            coins: 75,
            items: [{ id: 'mana_potion', quantity: 2 }]
        }
    },
    
    daily_exploration: {
        id: 'daily_exploration',
        name: 'Exploración Diaria',
        description: 'Explora el mundo y descubre nuevos lugares.',
        type: 'daily',
        reset_time: 'daily',
        objectives: [
            {
                id: 'explore_locations',
                description: 'Explora 2 ubicaciones diferentes',
                type: 'exploration',
                target: 2,
                current: 0
            }
        ],
        rewards: {
            exp: 120,
            coins: 60,
            items: [{ id: 'iron_ore', quantity: 3 }]
        }
    },
    
    // MISIONES SEMANALES
    weekly_challenge: {
        id: 'weekly_challenge',
        name: 'Desafío Semanal',
        description: 'Completa el gran desafío de la semana.',
        type: 'weekly',
        reset_time: 'weekly',
        objectives: [
            {
                id: 'gain_levels',
                description: 'Sube 2 niveles',
                type: 'level_gain',
                target: 2,
                current: 0
            },
            {
                id: 'complete_quests',
                description: 'Completa 5 misiones',
                type: 'quest_completion',
                target: 5,
                current: 0
            },
            {
                id: 'earn_coins',
                description: 'Gana 1000 monedas',
                type: 'coin_gain',
                target: 1000,
                current: 0
            }
        ],
        rewards: {
            exp: 1000,
            coins: 500,
            items: [{ id: 'exp_boost', quantity: 2 }, { id: 'quirk_crystal', quantity: 1 }]
        }
    },
    
    // MISIONES DE EVENTO
    summer_festival: {
        id: 'summer_festival',
        name: 'Festival de Verano',
        description: 'Participa en las celebraciones del Festival de Verano.',
        type: 'event',
        event_id: 'summer_2024',
        start_date: '2024-06-21',
        end_date: '2024-07-21',
        objectives: [
            {
                id: 'festival_activities',
                description: 'Participa en 10 actividades del festival',
                type: 'event_activity',
                target: 10,
                current: 0,
                activity_type: 'festival'
            },
            {
                id: 'collect_tokens',
                description: 'Recolecta 50 tokens del festival',
                type: 'item_collection',
                target: 50,
                current: 0,
                item_id: 'festival_token'
            }
        ],
        rewards: {
            exp: 2000,
            coins: 1000,
            items: [{ id: 'summer_crown', quantity: 1 }, { id: 'festival_fireworks', quantity: 5 }],
            title: 'festival_champion'
        }
    }
};

/**
 * 🎯 Clase principal del sistema de misiones
 */
class QuestSystem {
    constructor() {
        this.questDatabase = QUEST_DATABASE;
        this.questTypes = QUEST_TYPES;
        this.questStatus = QUEST_STATUS;
    }

    /**
     * 🆕 Inicializa el sistema de misiones para un jugador
     */
    initializeQuests(playerData) {
        if (!playerData.quests) {
            playerData.quests = {
                active: [],
                completed: [],
                available: [],
                daily_reset: new Date().toDateString(),
                weekly_reset: this.getWeekStart().toDateString()
            };
        }
        
        // Verificar y resetear misiones diarias/semanales
        this.checkQuestResets(playerData);
        
        // Actualizar misiones disponibles
        this.updateAvailableQuests(playerData);
        
        return playerData.quests;
    }

    /**
     * 🔄 Verifica y resetea misiones diarias/semanales
     */
    checkQuestResets(playerData) {
        const today = new Date().toDateString();
        const thisWeek = this.getWeekStart().toDateString();
        
        // Reset diario
        if (playerData.quests.daily_reset !== today) {
            this.resetDailyQuests(playerData);
            playerData.quests.daily_reset = today;
        }
        
        // Reset semanal
        if (playerData.quests.weekly_reset !== thisWeek) {
            this.resetWeeklyQuests(playerData);
            playerData.quests.weekly_reset = thisWeek;
        }
    }

    /**
     * 📅 Resetea misiones diarias
     */
    resetDailyQuests(playerData) {
        // Remover misiones diarias activas
        playerData.quests.active = playerData.quests.active.filter(
            quest => this.questDatabase[quest.id]?.type !== 'daily'
        );
        
        // Añadir nuevas misiones diarias
        const dailyQuests = Object.values(this.questDatabase)
            .filter(quest => quest.type === 'daily');
        
        dailyQuests.forEach(quest => {
            if (this.canAcceptQuest(playerData, quest.id)) {
                this.acceptQuest(playerData, quest.id);
            }
        });
        
        console.log(`🔄 Misiones diarias reseteadas para ${playerData.username}`);
    }

    /**
     * 📆 Resetea misiones semanales
     */
    resetWeeklyQuests(playerData) {
        // Remover misiones semanales activas
        playerData.quests.active = playerData.quests.active.filter(
            quest => this.questDatabase[quest.id]?.type !== 'weekly'
        );
        
        // Añadir nuevas misiones semanales
        const weeklyQuests = Object.values(this.questDatabase)
            .filter(quest => quest.type === 'weekly');
        
        weeklyQuests.forEach(quest => {
            if (this.canAcceptQuest(playerData, quest.id)) {
                this.acceptQuest(playerData, quest.id);
            }
        });
        
        console.log(`🔄 Misiones semanales reseteadas para ${playerData.username}`);
    }

    /**
     * 📋 Actualiza la lista de misiones disponibles
     */
    updateAvailableQuests(playerData) {
        const available = [];
        
        Object.values(this.questDatabase).forEach(quest => {
            if (this.canAcceptQuest(playerData, quest.id) && 
                !this.isQuestActive(playerData, quest.id) &&
                !this.isQuestCompleted(playerData, quest.id)) {
                available.push(quest.id);
            }
        });
        
        playerData.quests.available = available;
    }

    /**
     * ✅ Verifica si un jugador puede aceptar una misión
     */
    canAcceptQuest(playerData, questId) {
        const quest = this.questDatabase[questId];
        if (!quest) return false;
        
        const requirements = quest.requirements || {};
        
        // Verificar nivel
        if (requirements.level && (playerData.level || 1) < requirements.level) {
            return false;
        }
        
        // Verificar misiones completadas
        if (requirements.completed_quests) {
            const completed = playerData.quests?.completed || [];
            const hasRequired = requirements.completed_quests.every(reqQuest => 
                completed.includes(reqQuest)
            );
            if (!hasRequired) return false;
        }
        
        // Verificar acceso a región
        if (requirements.region_access) {
            const unlockedRegions = playerData.unlockedRegions || ['akai'];
            if (!unlockedRegions.includes(requirements.region_access)) {
                return false;
            }
        }
        
        // Verificar clase
        if (requirements.class && !requirements.class.includes(playerData.class)) {
            return false;
        }
        
        // Verificar eventos activos
        if (quest.type === 'event') {
            return this.isEventActive(quest);
        }
        
        return true;
    }

    /**
     * 📝 Acepta una misión
     */
    acceptQuest(playerData, questId) {
        const quest = this.questDatabase[questId];
        if (!quest) {
            return { success: false, reason: 'quest_not_found' };
        }
        
        if (!this.canAcceptQuest(playerData, questId)) {
            return { success: false, reason: 'requirements_not_met' };
        }
        
        if (this.isQuestActive(playerData, questId)) {
            return { success: false, reason: 'already_active' };
        }
        
        this.initializeQuests(playerData);
        
        // Crear instancia de la misión
        const questInstance = {
            id: questId,
            status: 'active',
            startTime: Date.now(),
            objectives: quest.objectives.map(obj => ({ ...obj, current: 0 }))
        };
        
        playerData.quests.active.push(questInstance);
        
        // Remover de disponibles
        playerData.quests.available = playerData.quests.available.filter(id => id !== questId);
        
        console.log(`📝 ${playerData.username} aceptó la misión: ${quest.name}`);
        
        return { success: true, quest: questInstance };
    }

    /**
     * 🎯 Actualiza el progreso de una misión
     */
    updateQuestProgress(playerData, actionType, data = {}) {
        this.initializeQuests(playerData);
        
        const updatedQuests = [];
        const completedQuests = [];
        
        playerData.quests.active.forEach(questInstance => {
            const quest = this.questDatabase[questInstance.id];
            if (!quest) return;
            
            let questUpdated = false;
            
            questInstance.objectives.forEach(objective => {
                if (objective.type === actionType && objective.current < objective.target) {
                    // Verificar condiciones específicas
                    if (this.matchesObjectiveConditions(objective, data)) {
                        const increment = data.amount || 1;
                        objective.current = Math.min(objective.current + increment, objective.target);
                        questUpdated = true;
                    }
                }
            });
            
            if (questUpdated) {
                updatedQuests.push(questInstance);
                
                // Verificar si la misión está completa
                if (this.isQuestObjectivesComplete(questInstance)) {
                    this.completeQuest(playerData, questInstance.id);
                    completedQuests.push(questInstance);
                }
            }
        });
        
        return { updatedQuests, completedQuests };
    }

    /**
     * ✅ Verifica si las condiciones del objetivo coinciden
     */
    matchesObjectiveConditions(objective, data) {
        // Verificar región específica
        if (objective.region && data.region !== objective.region) {
            return false;
        }
        
        // Verificar ubicación específica
        if (objective.specific_location && data.location !== objective.specific_location) {
            return false;
        }
        
        // Verificar tipo de enemigo
        if (objective.enemy_type && data.enemy_type !== objective.enemy_type) {
            return false;
        }
        
        // Verificar ID de jefe
        if (objective.boss_id && data.boss_id !== objective.boss_id) {
            return false;
        }
        
        // Verificar ID de objeto
        if (objective.item_id && data.item_id !== objective.item_id) {
            return false;
        }
        
        // Verificar actividad específica
        if (objective.activity && data.activity !== objective.activity) {
            return false;
        }
        
        return true;
    }

    /**
     * 🏁 Completa una misión
     */
    completeQuest(playerData, questId) {
        const quest = this.questDatabase[questId];
        if (!quest) return { success: false, reason: 'quest_not_found' };
        
        // Remover de misiones activas
        playerData.quests.active = playerData.quests.active.filter(q => q.id !== questId);
        
        // Añadir a completadas
        if (!playerData.quests.completed.includes(questId)) {
            playerData.quests.completed.push(questId);
        }
        
        // Otorgar recompensas
        const rewards = this.grantQuestRewards(playerData, quest);
        
        // Actualizar misiones disponibles
        this.updateAvailableQuests(playerData);
        
        console.log(`🏁 ${playerData.username} completó la misión: ${quest.name}`);
        
        return { success: true, rewards };
    }

    /**
     * 🎁 Otorga las recompensas de una misión
     */
    grantQuestRewards(playerData, quest) {
        const rewards = quest.rewards || {};
        const grantedRewards = [];
        
        // Experiencia
        if (rewards.exp) {
            const expResult = progressionSystem.awardExperience(playerData, 'quest_complete', rewards.exp);
            grantedRewards.push({ type: 'exp', amount: expResult.expGained });
        }
        
        // Monedas
        if (rewards.coins) {
            playerData.coins = (playerData.coins || 0) + rewards.coins;
            grantedRewards.push({ type: 'coins', amount: rewards.coins });
        }
        
        // Objetos
        if (rewards.items) {
            rewards.items.forEach(item => {
                const addResult = inventorySystem.addItem(playerData, item.id, item.quantity);
                if (addResult.success) {
                    grantedRewards.push({ 
                        type: 'item', 
                        item: inventorySystem.getItem(item.id), 
                        quantity: item.quantity 
                    });
                }
            });
        }
        
        // Título
        if (rewards.title) {
            playerData.availableTitles = playerData.availableTitles || [];
            if (!playerData.availableTitles.includes(rewards.title)) {
                playerData.availableTitles.push(rewards.title);
                grantedRewards.push({ type: 'title', title: rewards.title });
            }
        }
        
        // Quirk
        if (rewards.quirk) {
            playerData.unlockedQuirks = playerData.unlockedQuirks || [];
            if (!playerData.unlockedQuirks.includes(rewards.quirk)) {
                playerData.unlockedQuirks.push(rewards.quirk);
                grantedRewards.push({ type: 'quirk', quirk: rewards.quirk });
            }
        }
        
        // Reputación
        if (rewards.reputation) {
            playerData.reputation = playerData.reputation || {};
            Object.entries(rewards.reputation).forEach(([faction, amount]) => {
                playerData.reputation[faction] = (playerData.reputation[faction] || 0) + amount;
                grantedRewards.push({ type: 'reputation', faction, amount });
            });
        }
        
        return grantedRewards;
    }

    /**
     * ❌ Falla una misión
     */
    failQuest(playerData, questId, reason = 'unknown') {
        const questInstance = playerData.quests.active.find(q => q.id === questId);
        if (!questInstance) return { success: false, reason: 'quest_not_active' };
        
        questInstance.status = 'failed';
        questInstance.failReason = reason;
        questInstance.failTime = Date.now();
        
        // Remover de activas (mantener en historial)
        playerData.quests.active = playerData.quests.active.filter(q => q.id !== questId);
        
        console.log(`❌ ${playerData.username} falló la misión: ${questId} (${reason})`);
        
        return { success: true };
    }

    /**
     * 🔍 Obtiene información detallada de una misión
     */
    getQuestInfo(questId) {
        const quest = this.questDatabase[questId];
        if (!quest) return null;
        
        const questType = this.questTypes[quest.type];
        
        return {
            ...quest,
            typeInfo: questType
        };
    }

    /**
     * 📊 Obtiene estadísticas de misiones del jugador
     */
    getQuestStats(playerData) {
        this.initializeQuests(playerData);
        
        const stats = {
            active: playerData.quests.active.length,
            completed: playerData.quests.completed.length,
            available: playerData.quests.available.length,
            total: Object.keys(this.questDatabase).length
        };
        
        // Estadísticas por tipo
        stats.byType = {};
        Object.keys(this.questTypes).forEach(type => {
            stats.byType[type] = {
                completed: playerData.quests.completed.filter(questId => 
                    this.questDatabase[questId]?.type === type
                ).length,
                total: Object.values(this.questDatabase).filter(q => q.type === type).length
            };
        });
        
        return stats;
    }

    // MÉTODOS DE UTILIDAD

    /**
     * ✅ Verifica si una misión está activa
     */
    isQuestActive(playerData, questId) {
        return playerData.quests?.active?.some(q => q.id === questId) || false;
    }

    /**
     * ✅ Verifica si una misión está completada
     */
    isQuestCompleted(playerData, questId) {
        return playerData.quests?.completed?.includes(questId) || false;
    }

    /**
     * ✅ Verifica si todos los objetivos de una misión están completos
     */
    isQuestObjectivesComplete(questInstance) {
        return questInstance.objectives.every(obj => obj.current >= obj.target);
    }

    /**
     * ✅ Verifica si un evento está activo
     */
    isEventActive(quest) {
        if (!quest.start_date || !quest.end_date) return true;
        
        const now = new Date();
        const start = new Date(quest.start_date);
        const end = new Date(quest.end_date);
        
        return now >= start && now <= end;
    }

    /**
     * 📅 Obtiene el inicio de la semana actual
     */
    getWeekStart() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day;
        return new Date(now.setDate(diff));
    }

    /**
     * 🎨 Genera un embed con la lista de misiones
     */
    generateQuestListEmbed(playerData, type = 'all', page = 1) {
        this.initializeQuests(playerData);
        
        let quests = [];
        let title = '📋 Misiones';
        
        if (type === 'active') {
            quests = playerData.quests.active.map(q => ({ ...this.questDatabase[q.id], instance: q }));
            title = '⚡ Misiones Activas';
        } else if (type === 'available') {
            quests = playerData.quests.available.map(id => this.questDatabase[id]).filter(Boolean);
            title = '📋 Misiones Disponibles';
        } else if (type === 'completed') {
            quests = playerData.quests.completed.map(id => this.questDatabase[id]).filter(Boolean);
            title = '✅ Misiones Completadas';
        } else {
            // Todas las misiones
            const active = playerData.quests.active.map(q => ({ ...this.questDatabase[q.id], instance: q, status: 'active' }));
            const available = playerData.quests.available.map(id => ({ ...this.questDatabase[id], status: 'available' }));
            quests = [...active, ...available];
        }
        
        const questsPerPage = 5;
        const totalPages = Math.ceil(quests.length / questsPerPage);
        const startIndex = (page - 1) * questsPerPage;
        const pageQuests = quests.slice(startIndex, startIndex + questsPerPage);
        
        const embed = new PassQuirkEmbed()
            .setTitle(`${title} de ${playerData.username}`)
            .setDescription(`Página ${page}/${totalPages || 1} • ${quests.length} misiones`);
        
        if (pageQuests.length === 0) {
            embed.addField('📭 Sin misiones', 'No hay misiones en esta categoría.');
        } else {
            pageQuests.forEach(quest => {
                const questType = this.questTypes[quest.type];
                const status = quest.status || (quest.instance ? 'active' : 'available');
                
                let progressText = '';
                if (quest.instance) {
                    const progress = quest.instance.objectives.map(obj => 
                        `${obj.current}/${obj.target}`
                    ).join(' • ');
                    progressText = `\n**Progreso:** ${progress}`;
                }
                
                embed.addField(
                    `${questType.emoji} ${quest.name}`,
                    `${quest.description}${progressText}\n**Estado:** ${status}`,
                    false
                );
            });
        }
        
        return embed;
    }

    /**
     * 🎨 Genera un embed detallado de una misión específica
     */
    generateQuestDetailEmbed(playerData, questId) {
        const quest = this.questDatabase[questId];
        if (!quest) return null;
        
        const questType = this.questTypes[quest.type];
        const questInstance = playerData.quests?.active?.find(q => q.id === questId);
        
        const embed = new PassQuirkEmbed()
            .setTitle(`${questType.emoji} ${quest.name}`)
            .setDescription(quest.description)
            .setColor(questType.color);
        
        // Objetivos
        const objectives = questInstance ? questInstance.objectives : quest.objectives;
        const objectiveText = objectives.map(obj => {
            const progress = questInstance ? `${obj.current}/${obj.target}` : `0/${obj.target}`;
            const status = questInstance && obj.current >= obj.target ? '✅' : '⏳';
            return `${status} ${obj.description} (${progress})`;
        }).join('\n');
        
        embed.addField('🎯 Objetivos', objectiveText);
        
        // Recompensas
        if (quest.rewards) {
            const rewardText = [];
            if (quest.rewards.exp) rewardText.push(`⭐ ${quest.rewards.exp} EXP`);
            if (quest.rewards.coins) rewardText.push(`💰 ${quest.rewards.coins} monedas`);
            if (quest.rewards.items) {
                quest.rewards.items.forEach(item => {
                    const itemData = inventorySystem.getItem(item.id);
                    if (itemData) {
                        rewardText.push(`${itemData.emoji} ${itemData.name} x${item.quantity}`);
                    }
                });
            }
            if (quest.rewards.title) rewardText.push(`🎖️ Título: ${quest.rewards.title}`);
            if (quest.rewards.quirk) rewardText.push(`✨ Quirk: ${quest.rewards.quirk}`);
            
            embed.addField('🎁 Recompensas', rewardText.join('\n'));
        }
        
        // Historia
        if (quest.story) {
            const isCompleted = this.isQuestCompleted(playerData, questId);
            const storyText = isCompleted ? quest.story.completion : quest.story.intro;
            embed.addField('📖 Historia', storyText);
        }
        
        // Requisitos
        if (quest.requirements) {
            const reqText = [];
            if (quest.requirements.level) reqText.push(`Nivel ${quest.requirements.level}`);
            if (quest.requirements.completed_quests) {
                reqText.push(`Misiones: ${quest.requirements.completed_quests.join(', ')}`);
            }
            if (quest.requirements.region_access) {
                reqText.push(`Región: ${quest.requirements.region_access}`);
            }
            
            if (reqText.length > 0) {
                embed.addField('📋 Requisitos', reqText.join('\n'));
            }
        }
        
        return embed;
    }
}

// Crear instancia singleton del sistema de misiones
const questSystem = new QuestSystem();

module.exports = {
    QuestSystem,
    questSystem,
    QUEST_DATABASE,
    QUEST_TYPES,
    QUEST_STATUS
};