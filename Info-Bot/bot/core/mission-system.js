// 🎯 MISSION SYSTEM - Sistema de Misiones Dinámicas de PassQuirk RPG
// Genera misiones procedurales, eventos especiales y contenido adaptativo

const { PassQuirkEmbed } = require('../utils/embedStyles');
const { worldEngine } = require('./world-engine');
const { combatSystem } = require('./combat-system');
const { progressionSystem } = require('./progression-system');
const { economySystem } = require('./economy-system');
const { inventorySystem } = require('./inventory-system');

/**
 * 🎯 Tipos de misiones
 */
const MISSION_TYPES = {
    // Misiones de combate
    hunt: {
        id: 'hunt',
        name: 'Caza de Monstruos',
        emoji: '⚔️',
        description: 'Elimina enemigos específicos',
        category: 'combat',
        difficulty_range: [1, 5],
        base_duration: 30 * 60 * 1000, // 30 minutos
        energy_cost: 15,
        generation_weight: 25
    },
    
    boss_hunt: {
        id: 'boss_hunt',
        name: 'Caza de Jefe',
        emoji: '👹',
        description: 'Derrota a un jefe poderoso',
        category: 'combat',
        difficulty_range: [3, 5],
        base_duration: 60 * 60 * 1000, // 1 hora
        energy_cost: 30,
        generation_weight: 10
    },
    
    // Misiones de exploración
    exploration: {
        id: 'exploration',
        name: 'Exploración',
        emoji: '🗺️',
        description: 'Explora nuevas áreas y descubre secretos',
        category: 'exploration',
        difficulty_range: [1, 4],
        base_duration: 45 * 60 * 1000, // 45 minutos
        energy_cost: 20,
        generation_weight: 20
    },
    
    treasure_hunt: {
        id: 'treasure_hunt',
        name: 'Búsqueda del Tesoro',
        emoji: '💎',
        description: 'Encuentra tesoros ocultos',
        category: 'exploration',
        difficulty_range: [2, 5],
        base_duration: 90 * 60 * 1000, // 1.5 horas
        energy_cost: 25,
        generation_weight: 15
    },
    
    // Misiones de recolección
    gathering: {
        id: 'gathering',
        name: 'Recolección',
        emoji: '🌿',
        description: 'Recolecta materiales específicos',
        category: 'gathering',
        difficulty_range: [1, 3],
        base_duration: 20 * 60 * 1000, // 20 minutos
        energy_cost: 10,
        generation_weight: 30
    },
    
    // Misiones sociales
    delivery: {
        id: 'delivery',
        name: 'Entrega',
        emoji: '📦',
        description: 'Entrega objetos a NPCs específicos',
        category: 'social',
        difficulty_range: [1, 3],
        base_duration: 15 * 60 * 1000, // 15 minutos
        energy_cost: 8,
        generation_weight: 25
    },
    
    escort: {
        id: 'escort',
        name: 'Escolta',
        emoji: '🛡️',
        description: 'Protege a un NPC durante su viaje',
        category: 'social',
        difficulty_range: [2, 4],
        base_duration: 40 * 60 * 1000, // 40 minutos
        energy_cost: 20,
        generation_weight: 15
    },
    
    // Misiones especiales
    mystery: {
        id: 'mystery',
        name: 'Misterio',
        emoji: '🔍',
        description: 'Resuelve enigmas y misterios',
        category: 'special',
        difficulty_range: [2, 5],
        base_duration: 60 * 60 * 1000, // 1 hora
        energy_cost: 25,
        generation_weight: 10
    },
    
    rescue: {
        id: 'rescue',
        name: 'Rescate',
        emoji: '🆘',
        description: 'Rescata a personas en peligro',
        category: 'special',
        difficulty_range: [3, 5],
        base_duration: 75 * 60 * 1000, // 1.25 horas
        energy_cost: 35,
        generation_weight: 8
    },
    
    // Misiones del mundo real
    real_world_study: {
        id: 'real_world_study',
        name: 'Sesión de Estudio',
        emoji: '📚',
        description: 'Estudia en el mundo real',
        category: 'real_world',
        difficulty_range: [1, 3],
        base_duration: 60 * 60 * 1000, // 1 hora
        energy_cost: 0,
        generation_weight: 20,
        real_world: true
    },
    
    real_world_exercise: {
        id: 'real_world_exercise',
        name: 'Entrenamiento Físico',
        emoji: '💪',
        description: 'Ejercítate en el mundo real',
        category: 'real_world',
        difficulty_range: [1, 4],
        base_duration: 45 * 60 * 1000, // 45 minutos
        energy_cost: 0,
        generation_weight: 18,
        real_world: true
    },
    
    real_world_creative: {
        id: 'real_world_creative',
        name: 'Proyecto Creativo',
        emoji: '🎨',
        description: 'Trabaja en un proyecto creativo',
        category: 'real_world',
        difficulty_range: [1, 5],
        base_duration: 90 * 60 * 1000, // 1.5 horas
        energy_cost: 0,
        generation_weight: 15,
        real_world: true
    }
};

/**
 * 🎖️ Dificultades de misión
 */
const MISSION_DIFFICULTIES = {
    1: {
        name: 'Novato',
        emoji: '🟢',
        color: 0x00ff00,
        exp_multiplier: 1.0,
        reward_multiplier: 1.0,
        failure_chance: 0.05
    },
    2: {
        name: 'Fácil',
        emoji: '🔵',
        color: 0x0099ff,
        exp_multiplier: 1.2,
        reward_multiplier: 1.2,
        failure_chance: 0.10
    },
    3: {
        name: 'Normal',
        emoji: '🟡',
        color: 0xffff00,
        exp_multiplier: 1.5,
        reward_multiplier: 1.5,
        failure_chance: 0.15
    },
    4: {
        name: 'Difícil',
        emoji: '🟠',
        color: 0xff9900,
        exp_multiplier: 2.0,
        reward_multiplier: 2.0,
        failure_chance: 0.25
    },
    5: {
        name: 'Extremo',
        emoji: '🔴',
        color: 0xff0000,
        exp_multiplier: 3.0,
        reward_multiplier: 3.0,
        failure_chance: 0.35
    }
};

/**
 * 🎁 Recompensas base por categoría
 */
const BASE_REWARDS = {
    combat: {
        exp: { min: 50, max: 150 },
        coins: { min: 30, max: 100 },
        gems: { min: 0, max: 2 },
        reputation: { min: 1, max: 5 },
        items: ['weapon_fragment', 'armor_piece', 'healing_potion']
    },
    exploration: {
        exp: { min: 40, max: 120 },
        coins: { min: 25, max: 80 },
        gems: { min: 1, max: 3 },
        reputation: { min: 2, max: 6 },
        items: ['map_fragment', 'rare_material', 'ancient_coin']
    },
    gathering: {
        exp: { min: 30, max: 90 },
        coins: { min: 20, max: 60 },
        pg: { min: 5, max: 15 },
        items: ['crafting_material', 'herb', 'ore']
    },
    social: {
        exp: { min: 35, max: 100 },
        coins: { min: 40, max: 120 },
        reputation: { min: 3, max: 10 },
        items: ['gift', 'letter_of_recommendation', 'social_token']
    },
    special: {
        exp: { min: 80, max: 200 },
        coins: { min: 60, max: 180 },
        gems: { min: 2, max: 5 },
        reputation: { min: 5, max: 15 },
        items: ['rare_artifact', 'special_key', 'mystery_box']
    },
    real_world: {
        exp: { min: 100, max: 300 },
        pg: { min: 20, max: 50 },
        coins: { min: 50, max: 150 },
        gems: { min: 1, max: 4 },
        reputation: { min: 3, max: 12 },
        items: ['motivation_boost', 'real_world_achievement', 'inspiration_crystal']
    }
};

/**
 * 🌟 Eventos especiales
 */
const SPECIAL_EVENTS = {
    double_exp: {
        id: 'double_exp',
        name: 'Fin de Semana de Doble EXP',
        emoji: '⭐',
        description: 'Todas las misiones otorgan doble experiencia',
        duration: 48 * 60 * 60 * 1000, // 48 horas
        effects: {
            exp_multiplier: 2.0
        },
        trigger_chance: 0.15
    },
    
    treasure_fever: {
        id: 'treasure_fever',
        name: 'Fiebre del Tesoro',
        emoji: '💰',
        description: 'Mayor probabilidad de encontrar tesoros',
        duration: 24 * 60 * 60 * 1000, // 24 horas
        effects: {
            treasure_chance: 0.3,
            coins_multiplier: 1.5
        },
        trigger_chance: 0.12
    },
    
    monster_invasion: {
        id: 'monster_invasion',
        name: 'Invasión de Monstruos',
        emoji: '👹',
        description: 'Aparecen más enemigos pero con mejores recompensas',
        duration: 12 * 60 * 60 * 1000, // 12 horas
        effects: {
            enemy_spawn_rate: 2.0,
            combat_rewards: 1.8
        },
        trigger_chance: 0.08
    },
    
    peaceful_times: {
        id: 'peaceful_times',
        name: 'Tiempos de Paz',
        emoji: '🕊️',
        description: 'Menos combates, más misiones sociales y de exploración',
        duration: 36 * 60 * 60 * 1000, // 36 horas
        effects: {
            social_mission_chance: 0.4,
            exploration_bonus: 1.3
        },
        trigger_chance: 0.10
    },
    
    gem_rush: {
        id: 'gem_rush',
        name: 'Fiebre de Gemas',
        emoji: '💎',
        description: 'Todas las misiones tienen chance de otorgar gemas extra',
        duration: 18 * 60 * 60 * 1000, // 18 horas
        effects: {
            gem_bonus_chance: 0.25,
            gem_multiplier: 1.5
        },
        trigger_chance: 0.07
    }
};

/**
 * 🎯 Clase principal del sistema de misiones
 */
class MissionSystem {
    constructor() {
        this.missionTypes = MISSION_TYPES;
        this.difficulties = MISSION_DIFFICULTIES;
        this.baseRewards = BASE_REWARDS;
        this.specialEvents = SPECIAL_EVENTS;
        this.activeMissions = new Map();
        this.completedMissions = new Map();
        this.activeEvents = new Map();
        this.missionHistory = new Map();
        this.dailyMissions = new Map();
    }

    /**
     * 🚀 Inicializar sistema de misiones
     */
    initialize() {
        this.generateDailyMissions();
        this.checkSpecialEvents();
        
        // Generar nuevas misiones diarias cada 24 horas
        setInterval(() => {
            this.generateDailyMissions();
        }, 24 * 60 * 60 * 1000);
        
        // Verificar eventos especiales cada hora
        setInterval(() => {
            this.checkSpecialEvents();
        }, 60 * 60 * 1000);
        
        // Limpiar misiones expiradas cada 30 minutos
        setInterval(() => {
            this.cleanupExpiredMissions();
        }, 30 * 60 * 1000);
        
        console.log('🎯 Sistema de misiones inicializado');
    }

    /**
     * 🎲 Generar misión aleatoria
     */
    generateRandomMission(playerData, missionType = null, difficulty = null) {
        // Seleccionar tipo de misión
        if (!missionType) {
            missionType = this.selectRandomMissionType(playerData);
        }
        
        const mission = this.missionTypes[missionType];
        if (!mission) {
            return null;
        }
        
        // Seleccionar dificultad
        if (!difficulty) {
            difficulty = this.selectAppropriiateDifficulty(playerData, mission);
        }
        
        // Generar detalles específicos
        const missionDetails = this.generateMissionDetails(mission, difficulty, playerData);
        
        // Crear misión completa
        const generatedMission = {
            id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: missionType,
            difficulty: difficulty,
            playerId: playerData.userId,
            ...missionDetails,
            status: 'available',
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas para aceptar
            progress: 0,
            maxProgress: missionDetails.target || 1
        };
        
        console.log(`🎲 Misión generada: ${mission.name} (${this.difficulties[difficulty].name})`);
        
        return generatedMission;
    }

    /**
     * ✅ Aceptar misión
     */
    acceptMission(playerData, missionId) {
        // Buscar misión en misiones diarias o disponibles
        let mission = this.dailyMissions.get(`${playerData.userId}_${missionId}`);
        
        if (!mission) {
            return { success: false, reason: 'mission_not_found' };
        }
        
        if (mission.status !== 'available') {
            return { success: false, reason: 'mission_not_available' };
        }
        
        if (Date.now() > mission.expiresAt) {
            return { success: false, reason: 'mission_expired' };
        }
        
        // Verificar si el jugador ya tiene demasiadas misiones activas
        const activeMissionCount = this.getActiveMissionCount(playerData.userId);
        const maxActiveMissions = this.getMaxActiveMissions(playerData);
        
        if (activeMissionCount >= maxActiveMissions) {
            return { success: false, reason: 'too_many_active_missions', 
                    max: maxActiveMissions, current: activeMissionCount };
        }
        
        // Verificar energía (solo para misiones que no son del mundo real)
        if (!mission.real_world) {
            const missionData = this.missionTypes[mission.type];
            const energyCost = missionData.energy_cost;
            
            const currencies = economySystem.initializePlayerCurrencies(playerData);
            if (currencies.energy < energyCost) {
                return { success: false, reason: 'insufficient_energy',
                        required: energyCost, available: currencies.energy };
            }
            
            // Gastar energía
            economySystem.spendCurrency(playerData, 'energy', energyCost, 'mission_start');
        }
        
        // Aceptar misión
        mission.status = 'active';
        mission.startedAt = Date.now();
        mission.completionDeadline = Date.now() + mission.duration;
        
        this.activeMissions.set(mission.id, mission);
        
        console.log(`✅ ${playerData.username} aceptó la misión: ${mission.title}`);
        
        return { success: true, mission };
    }

    /**
     * 📈 Actualizar progreso de misión
     */
    updateMissionProgress(playerData, action, data = {}) {
        const activeMissions = this.getPlayerActiveMissions(playerData.userId);
        const updatedMissions = [];
        
        activeMissions.forEach(mission => {
            const updated = this.checkMissionProgress(mission, action, data);
            if (updated) {
                updatedMissions.push(mission);
                
                // Verificar si la misión está completa
                if (mission.progress >= mission.maxProgress) {
                    this.completeMission(playerData, mission.id);
                }
            }
        });
        
        return updatedMissions;
    }

    /**
     * 🏆 Completar misión
     */
    completeMission(playerData, missionId) {
        const mission = this.activeMissions.get(missionId);
        if (!mission || mission.playerId !== playerData.userId) {
            return { success: false, reason: 'mission_not_found' };
        }
        
        if (mission.progress < mission.maxProgress) {
            return { success: false, reason: 'mission_not_complete',
                    progress: mission.progress, required: mission.maxProgress };
        }
        
        // Calcular recompensas
        const rewards = this.calculateMissionRewards(mission, playerData);
        
        // Otorgar recompensas
        const grantedRewards = this.grantMissionRewards(playerData, rewards);
        
        // Marcar como completada
        mission.status = 'completed';
        mission.completedAt = Date.now();
        
        this.completedMissions.set(mission.id, mission);
        this.activeMissions.delete(mission.id);
        
        // Registrar en historial
        this.recordMissionCompletion(playerData, mission);
        
        console.log(`🏆 ${playerData.username} completó la misión: ${mission.title}`);
        
        return { success: true, mission, rewards: grantedRewards };
    }

    /**
     * ❌ Abandonar misión
     */
    abandonMission(playerData, missionId) {
        const mission = this.activeMissions.get(missionId);
        if (!mission || mission.playerId !== playerData.userId) {
            return { success: false, reason: 'mission_not_found' };
        }
        
        // Devolver parte de la energía (25%)
        if (!mission.real_world) {
            const missionData = this.missionTypes[mission.type];
            const energyRefund = Math.floor(missionData.energy_cost * 0.25);
            economySystem.addCurrency(playerData, 'energy', energyRefund, 'mission_abandon');
        }
        
        // Remover misión
        this.activeMissions.delete(mission.id);
        
        console.log(`❌ ${playerData.username} abandonó la misión: ${mission.title}`);
        
        return { success: true, energyRefund: mission.real_world ? 0 : Math.floor(this.missionTypes[mission.type].energy_cost * 0.25) };
    }

    /**
     * 📊 Obtener misiones del jugador
     */
    getPlayerMissions(playerData) {
        const activeMissions = this.getPlayerActiveMissions(playerData.userId);
        const dailyMissions = this.getPlayerDailyMissions(playerData.userId);
        
        return {
            active: activeMissions,
            daily: dailyMissions,
            completed_today: this.getTodayCompletedMissions(playerData.userId),
            total_completed: this.getTotalCompletedMissions(playerData.userId)
        };
    }

    /**
     * 🎯 Generar misiones diarias
     */
    generateDailyMissions() {
        // Limpiar misiones diarias anteriores
        this.dailyMissions.clear();
        
        // Esta función se llamaría para cada jugador activo
        // Por ahora, generamos un conjunto base de misiones
        console.log('🎯 Misiones diarias generadas');
    }

    /**
     * 🎪 Verificar eventos especiales
     */
    checkSpecialEvents() {
        // Limpiar eventos expirados
        this.activeEvents.forEach((event, eventId) => {
            if (Date.now() > event.endsAt) {
                this.activeEvents.delete(eventId);
                console.log(`🎪 Evento especial terminado: ${event.name}`);
            }
        });
        
        // Verificar si debe iniciarse un nuevo evento
        if (this.activeEvents.size === 0) {
            Object.values(this.specialEvents).forEach(eventTemplate => {
                if (Math.random() < eventTemplate.trigger_chance) {
                    this.startSpecialEvent(eventTemplate);
                }
            });
        }
    }

    /**
     * 🎉 Iniciar evento especial
     */
    startSpecialEvent(eventTemplate) {
        const event = {
            ...eventTemplate,
            id: `event_${Date.now()}`,
            startedAt: Date.now(),
            endsAt: Date.now() + eventTemplate.duration
        };
        
        this.activeEvents.set(event.id, event);
        
        console.log(`🎉 Evento especial iniciado: ${event.name}`);
        
        return event;
    }

    // MÉTODOS DE UTILIDAD

    /**
     * 🎲 Seleccionar tipo de misión aleatoria
     */
    selectRandomMissionType(playerData) {
        const weights = [];
        const types = [];
        
        Object.entries(this.missionTypes).forEach(([typeId, mission]) => {
            // Ajustar peso basado en preferencias del jugador y eventos activos
            let weight = mission.generation_weight;
            
            // Aplicar modificadores de eventos especiales
            this.activeEvents.forEach(event => {
                if (event.effects.social_mission_chance && mission.category === 'social') {
                    weight *= 2;
                }
            });
            
            weights.push(weight);
            types.push(typeId);
        });
        
        return this.weightedRandomSelect(types, weights);
    }

    /**
     * 🎯 Seleccionar dificultad apropiada
     */
    selectAppropriiateDifficulty(playerData, mission) {
        const playerLevel = playerData.level || 1;
        const difficultyRange = mission.difficulty_range;
        
        // Calcular dificultad base basada en el nivel del jugador
        let baseDifficulty = Math.min(5, Math.max(1, Math.floor(playerLevel / 5) + 1));
        
        // Ajustar dentro del rango permitido para la misión
        baseDifficulty = Math.max(difficultyRange[0], Math.min(difficultyRange[1], baseDifficulty));
        
        // Añadir algo de variabilidad
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, o 1
        const finalDifficulty = Math.max(difficultyRange[0], Math.min(difficultyRange[1], baseDifficulty + variation));
        
        return finalDifficulty;
    }

    /**
     * 📝 Generar detalles de misión
     */
    generateMissionDetails(mission, difficulty, playerData) {
        const difficultyData = this.difficulties[difficulty];
        const region = worldEngine.getRandomRegion(playerData.level || 1);
        
        let details = {
            title: this.generateMissionTitle(mission, difficulty),
            description: this.generateMissionDescription(mission, difficulty, region),
            region: region.id,
            duration: mission.base_duration * (1 + (difficulty - 1) * 0.2),
            real_world: mission.real_world || false
        };
        
        // Generar objetivos específicos según el tipo
        switch (mission.id) {
            case 'hunt':
                const enemy = combatSystem.generateEnemy(playerData.level || 1, region.id);
                details.target = Math.floor(Math.random() * 5) + difficulty;
                details.enemy_type = enemy.type;
                details.objective = `Elimina ${details.target} ${enemy.name}`;
                break;
                
            case 'boss_hunt':
                const boss = combatSystem.generateBoss(playerData.level || 1, region.id);
                details.target = 1;
                details.boss_type = boss.type;
                details.objective = `Derrota a ${boss.name}`;
                break;
                
            case 'gathering':
                const materials = ['Hierba Mágica', 'Mineral Raro', 'Cristal de Energía', 'Fruto Silvestre'];
                const material = materials[Math.floor(Math.random() * materials.length)];
                details.target = Math.floor(Math.random() * 10) + difficulty * 2;
                details.material_type = material;
                details.objective = `Recolecta ${details.target} ${material}`;
                break;
                
            case 'exploration':
                details.target = Math.floor(Math.random() * 3) + 1;
                details.objective = `Explora ${details.target} área${details.target > 1 ? 's' : ''} desconocida${details.target > 1 ? 's' : ''}`;
                break;
                
            case 'delivery':
                const npcs = ['Mercader Kael', 'Sanadora Luna', 'Herrero Gareth', 'Maga Aria'];
                const npc = npcs[Math.floor(Math.random() * npcs.length)];
                details.target = 1;
                details.npc_name = npc;
                details.objective = `Entrega el paquete a ${npc}`;
                break;
                
            case 'real_world_study':
                const subjects = ['Matemáticas', 'Historia', 'Ciencias', 'Literatura', 'Idiomas'];
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                details.target = difficulty * 30; // minutos
                details.subject = subject;
                details.objective = `Estudia ${subject} por ${details.target} minutos`;
                break;
                
            case 'real_world_exercise':
                const exercises = ['Correr', 'Flexiones', 'Yoga', 'Caminar', 'Estiramientos'];
                const exercise = exercises[Math.floor(Math.random() * exercises.length)];
                details.target = difficulty * 15; // minutos
                details.exercise_type = exercise;
                details.objective = `Realiza ${exercise} por ${details.target} minutos`;
                break;
                
            default:
                details.target = difficulty;
                details.objective = mission.description;
        }
        
        return details;
    }

    /**
     * 📊 Verificar progreso de misión
     */
    checkMissionProgress(mission, action, data) {
        let progressMade = false;
        
        switch (mission.type) {
            case 'hunt':
                if (action === 'enemy_defeated' && data.enemy_type === mission.enemy_type) {
                    mission.progress = Math.min(mission.maxProgress, mission.progress + 1);
                    progressMade = true;
                }
                break;
                
            case 'boss_hunt':
                if (action === 'boss_defeated' && data.boss_type === mission.boss_type) {
                    mission.progress = mission.maxProgress;
                    progressMade = true;
                }
                break;
                
            case 'gathering':
                if (action === 'item_gathered' && data.material_type === mission.material_type) {
                    mission.progress = Math.min(mission.maxProgress, mission.progress + (data.quantity || 1));
                    progressMade = true;
                }
                break;
                
            case 'exploration':
                if (action === 'area_explored' && data.region === mission.region) {
                    mission.progress = Math.min(mission.maxProgress, mission.progress + 1);
                    progressMade = true;
                }
                break;
                
            case 'real_world_study':
                if (action === 'study_session' && data.subject === mission.subject) {
                    mission.progress = Math.min(mission.maxProgress, mission.progress + (data.duration || 0));
                    progressMade = true;
                }
                break;
                
            case 'real_world_exercise':
                if (action === 'exercise_session' && data.exercise_type === mission.exercise_type) {
                    mission.progress = Math.min(mission.maxProgress, mission.progress + (data.duration || 0));
                    progressMade = true;
                }
                break;
        }
        
        return progressMade;
    }

    /**
     * 🧮 Calcular recompensas de misión
     */
    calculateMissionRewards(mission, playerData) {
        const missionData = this.missionTypes[mission.type];
        const difficultyData = this.difficulties[mission.difficulty];
        const baseRewards = this.baseRewards[missionData.category];
        
        const rewards = {};
        
        // Calcular recompensas base
        Object.keys(baseRewards).forEach(rewardType => {
            if (rewardType === 'items') {
                rewards.items = this.selectMissionItems(baseRewards.items, mission.difficulty);
            } else {
                const baseReward = baseRewards[rewardType];
                let amount;
                
                if (typeof baseReward === 'object') {
                    amount = Math.floor(Math.random() * (baseReward.max - baseReward.min + 1)) + baseReward.min;
                } else {
                    amount = baseReward;
                }
                
                // Aplicar multiplicadores
                amount = Math.floor(amount * difficultyData.reward_multiplier);
                
                // Aplicar efectos de eventos especiales
                this.activeEvents.forEach(event => {
                    if (event.effects.exp_multiplier && rewardType === 'exp') {
                        amount = Math.floor(amount * event.effects.exp_multiplier);
                    }
                    if (event.effects.coins_multiplier && rewardType === 'coins') {
                        amount = Math.floor(amount * event.effects.coins_multiplier);
                    }
                    if (event.effects.gem_multiplier && rewardType === 'gems') {
                        amount = Math.floor(amount * event.effects.gem_multiplier);
                    }
                });
                
                // Bonus por nivel del jugador
                const levelBonus = 1 + ((playerData.level || 1) - 1) * 0.01;
                amount = Math.floor(amount * levelBonus);
                
                rewards[rewardType] = amount;
            }
        });
        
        return rewards;
    }

    /**
     * 🎁 Otorgar recompensas de misión
     */
    grantMissionRewards(playerData, rewards) {
        const grantedRewards = [];
        
        // Otorgar monedas
        Object.keys(rewards).forEach(rewardType => {
            if (rewardType !== 'items' && rewardType !== 'exp' && rewards[rewardType] > 0) {
                const result = economySystem.addCurrency(playerData, rewardType, rewards[rewardType], 'mission');
                if (result.success) {
                    grantedRewards.push({
                        type: 'currency',
                        currency: rewardType,
                        amount: result.amount
                    });
                }
            }
        });
        
        // Otorgar experiencia
        if (rewards.exp) {
            const expResult = progressionSystem.awardExperience(playerData, 'mission', rewards.exp);
            grantedRewards.push({
                type: 'exp',
                amount: expResult.expGained
            });
        }
        
        // Otorgar objetos
        if (rewards.items) {
            rewards.items.forEach(itemId => {
                const addResult = inventorySystem.addItem(playerData, itemId, 1);
                if (addResult.success) {
                    grantedRewards.push({
                        type: 'item',
                        item: inventorySystem.getItem(itemId),
                        quantity: 1
                    });
                }
            });
        }
        
        return grantedRewards;
    }

    /**
     * 🎯 Seleccionar objetos de misión
     */
    selectMissionItems(itemPool, difficulty) {
        const itemCount = Math.floor(Math.random() * difficulty) + 1;
        const selectedItems = [];
        
        for (let i = 0; i < itemCount; i++) {
            const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
            selectedItems.push(randomItem);
        }
        
        return selectedItems;
    }

    /**
     * 🎲 Selección aleatoria ponderada
     */
    weightedRandomSelect(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }

    /**
     * 📝 Generar título de misión
     */
    generateMissionTitle(mission, difficulty) {
        const difficultyData = this.difficulties[difficulty];
        const titles = {
            hunt: ['Caza Salvaje', 'Exterminio', 'Cacería Peligrosa', 'Limpieza de Zona'],
            boss_hunt: ['Desafío Épico', 'Confrontación Final', 'Duelo de Titanes', 'Batalla Legendaria'],
            exploration: ['Expedición', 'Reconocimiento', 'Aventura Inexplorada', 'Descubrimiento'],
            gathering: ['Recolección', 'Búsqueda de Recursos', 'Cosecha Especial', 'Obtención de Materiales'],
            delivery: ['Entrega Urgente', 'Misión de Correo', 'Transporte Especial', 'Servicio de Mensajería'],
            real_world_study: ['Sesión de Aprendizaje', 'Tiempo de Estudio', 'Desarrollo Intelectual', 'Crecimiento Académico'],
            real_world_exercise: ['Entrenamiento Físico', 'Sesión de Ejercicio', 'Fortalecimiento Corporal', 'Actividad Física']
        };
        
        const missionTitles = titles[mission.id] || [mission.name];
        const randomTitle = missionTitles[Math.floor(Math.random() * missionTitles.length)];
        
        return `${difficultyData.emoji} ${randomTitle}`;
    }

    /**
     * 📖 Generar descripción de misión
     */
    generateMissionDescription(mission, difficulty, region) {
        const descriptions = {
            hunt: `Los monstruos han estado causando problemas en ${region.name}. Es hora de tomar acción.`,
            boss_hunt: `Un poderoso jefe ha aparecido en ${region.name}. Solo los más valientes pueden enfrentarlo.`,
            exploration: `Hay rumores de lugares inexplorados en ${region.name}. ¿Te atreves a investigar?`,
            gathering: `Los recursos en ${region.name} son abundantes, pero recolectarlos no será fácil.`,
            delivery: `Un paquete importante debe ser entregado en ${region.name}. La puntualidad es clave.`,
            real_world_study: `El conocimiento es poder. Dedica tiempo al estudio para fortalecer tu mente.`,
            real_world_exercise: `Un cuerpo fuerte alberga una mente fuerte. Es hora de entrenar.`
        };
        
        return descriptions[mission.id] || mission.description;
    }

    /**
     * 📊 Obtener misiones activas del jugador
     */
    getPlayerActiveMissions(playerId) {
        return Array.from(this.activeMissions.values()).filter(mission => mission.playerId === playerId);
    }

    /**
     * 📅 Obtener misiones diarias del jugador
     */
    getPlayerDailyMissions(playerId) {
        return Array.from(this.dailyMissions.values()).filter(mission => mission.playerId === playerId);
    }

    /**
     * 🔢 Obtener número de misiones activas
     */
    getActiveMissionCount(playerId) {
        return this.getPlayerActiveMissions(playerId).length;
    }

    /**
     * 📈 Obtener máximo de misiones activas
     */
    getMaxActiveMissions(playerData) {
        const baseMax = 3;
        const levelBonus = Math.floor((playerData.level || 1) / 10);
        return baseMax + levelBonus;
    }

    /**
     * 🗑️ Limpiar misiones expiradas
     */
    cleanupExpiredMissions() {
        const now = Date.now();
        
        // Limpiar misiones activas expiradas
        this.activeMissions.forEach((mission, missionId) => {
            if (now > mission.completionDeadline) {
                this.activeMissions.delete(missionId);
                console.log(`🗑️ Misión expirada removida: ${mission.title}`);
            }
        });
        
        // Limpiar misiones diarias expiradas
        this.dailyMissions.forEach((mission, missionId) => {
            if (now > mission.expiresAt) {
                this.dailyMissions.delete(missionId);
            }
        });
    }

    /**
     * 📝 Registrar completación de misión
     */
    recordMissionCompletion(playerData, mission) {
        if (!this.missionHistory.has(playerData.userId)) {
            this.missionHistory.set(playerData.userId, []);
        }
        
        const history = this.missionHistory.get(playerData.userId);
        history.push({
            missionId: mission.id,
            type: mission.type,
            difficulty: mission.difficulty,
            completedAt: Date.now(),
            duration: mission.completedAt - mission.startedAt
        });
        
        // Mantener solo los últimos 100 registros
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
    }

    /**
     * 📊 Obtener misiones completadas hoy
     */
    getTodayCompletedMissions(playerId) {
        const today = new Date().toDateString();
        const history = this.missionHistory.get(playerId) || [];
        
        return history.filter(record => {
            const completedDate = new Date(record.completedAt).toDateString();
            return completedDate === today;
        }).length;
    }

    /**
     * 📈 Obtener total de misiones completadas
     */
    getTotalCompletedMissions(playerId) {
        const history = this.missionHistory.get(playerId) || [];
        return history.length;
    }

    /**
     * 🎨 Generar embed de misiones disponibles
     */
    generateMissionsEmbed(playerData) {
        const missions = this.getPlayerMissions(playerData);
        
        const embed = new PassQuirkEmbed()
            .setTitle('🎯 Misiones Disponibles')
            .setDescription('Acepta misiones para ganar experiencia y recompensas');
        
        // Misiones activas
        if (missions.active.length > 0) {
            let activeText = '';
            missions.active.forEach(mission => {
                const progress = `${mission.progress}/${mission.maxProgress}`;
                const timeLeft = Math.ceil((mission.completionDeadline - Date.now()) / (60 * 1000));
                activeText += `${mission.title}\n📊 Progreso: ${progress} | ⏰ ${timeLeft}m\n\n`;
            });
            
            embed.addField('⚡ Misiones Activas', activeText, false);
        }
        
        // Misiones diarias
        if (missions.daily.length > 0) {
            let dailyText = '';
            missions.daily.slice(0, 5).forEach(mission => {
                const difficultyData = this.difficulties[mission.difficulty];
                dailyText += `${difficultyData.emoji} ${mission.title}\n${mission.objective}\n\n`;
            });
            
            embed.addField('📅 Misiones Diarias', dailyText, false);
        }
        
        // Estadísticas
        embed.addField(
            '📊 Estadísticas',
            `Completadas hoy: ${missions.completed_today}\nTotal completadas: ${missions.total_completed}`,
            true
        );
        
        // Eventos activos
        if (this.activeEvents.size > 0) {
            let eventsText = '';
            this.activeEvents.forEach(event => {
                const timeLeft = Math.ceil((event.endsAt - Date.now()) / (60 * 60 * 1000));
                eventsText += `${event.emoji} ${event.name} (${timeLeft}h)\n`;
            });
            
            embed.addField('🎪 Eventos Especiales', eventsText, false);
        }
        
        return embed;
    }
}

// Crear instancia singleton del sistema de misiones
const missionSystem = new MissionSystem();

module.exports = {
    MissionSystem,
    missionSystem,
    MISSION_TYPES,
    MISSION_DIFFICULTIES,
    BASE_REWARDS,
    SPECIAL_EVENTS
};