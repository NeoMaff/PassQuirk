// 🎯 QUEST SYSTEM - Sistema de Misiones de PassQuirk RPG
// 🌟 Integrado con CioMaff/PassQuirk-RPG - Sistema Épico de Misiones Isekai
// 🎮 Conecta actividades reales del usuario con aventuras inmersivas

const { PassQuirkEmbed } = require('../utils/embedStyles');
const { progressionSystem } = require('./progression-system');
const { inventorySystem } = require('./inventory-system');
const { worldEngine } = require('./world-engine');
const { CLASES_OFICIALES, ENEMIGOS_OFICIALES, passquirks } = require('../data/passquirkData');

/**
 * 📋 Tipos de misiones épicas estilo anime isekai
 */
const QUEST_TYPES = {
    main: {
        name: '⚔️ Épica Principal',
        emoji: '⭐',
        color: 0xffd700,
        description: 'La historia principal de tu aventura isekai'
    },
    side: {
        name: '📜 Aventura Secundaria',
        emoji: '📜',
        color: 0x87ceeb,
        description: 'Misiones que forjan tu leyenda'
    },
    daily: {
        name: '🌅 Entrenamiento Diario',
        emoji: '📅',
        color: 0x32cd32,
        description: 'Rutinas que fortalecen tu poder real'
    },
    weekly: {
        name: '🗓️ Desafío Semanal',
        emoji: '📆',
        color: 0xff6347,
        description: 'Pruebas épicas que definen tu progreso'
    },
    event: {
        name: '🎆 Evento Legendario',
        emoji: '🎉',
        color: 0xff1493,
        description: 'Eventos únicos que cambian el mundo'
    },
    guild: {
        name: '🏰 Misión de Gremio',
        emoji: '🏰',
        color: 0x9370db,
        description: 'Aventuras cooperativas épicas'
    },
    real_life: {
        name: '🌟 Poder Real',
        emoji: '🌟',
        color: 0x00ff7f,
        description: 'Actividades reales que otorgan poder en PassQuirk'
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
 * 📚 Base de datos de misiones épicas - Estilo Isekai Anime
 */
const QUEST_DATABASE = {
    // 🌟 MISIONES PRINCIPALES - ARCO DEL DESPERTAR
    isekai_awakening: {
        id: 'isekai_awakening',
        name: '🌟 El Despertar del Héroe Isekai',
        description: '¡Has sido transportado al mundo de PassQuirk! Tu aventura épica comienza ahora.',
        type: 'main',
        chapter: 1,
        requirements: { level: 1 },
        objectives: [
            {
                id: 'choose_destiny',
                description: '⚔️ Elige tu destino como héroe (Selecciona tu clase)',
                type: 'class_selection',
                target: 1,
                current: 0
            },
            {
                id: 'first_power_surge',
                description: '⚡ Experimenta tu primer aumento de poder (Gana 150 EXP)',
                type: 'exp_gain',
                target: 150,
                current: 0
            },
            {
                id: 'real_world_training',
                description: '🏃‍♂️ Entrena en el mundo real (Haz ejercicio por 30 minutos)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'exercise',
                duration: 30
            }
        ],
        rewards: {
            exp: 300,
            coins: 200,
            items: [{ id: 'starter_weapon', quantity: 1 }, { id: 'health_potion', quantity: 3 }],
            title: '🌟 Héroe Isekai',
            quirk_fragment: 'power_awakening'
        },
        story: {
            intro: '✨ **¡Un destello cegador te envuelve!** \n\nDe repente, te encuentras en un mundo completamente diferente. El aire vibra con energía mágica, y puedes sentir un poder desconocido corriendo por tus venas. \n\n🌍 **¡Bienvenido al mundo de PassQuirk!** \n\nEres el héroe elegido, transportado aquí para enfrentar las fuerzas oscuras que amenazan este reino. Tu aventura épica está a punto de comenzar...',
            completion: '🎉 **¡Increíble!** Has completado tu despertar como héroe isekai. \n\n⚡ Puedes sentir cómo el poder fluye a través de ti, conectando tu mundo real con este reino mágico. Cada acción que realices en tu vida cotidiana ahora fortalecerá tu poder en PassQuirk. \n\n🗡️ **¡El destino del mundo está en tus manos!**'
        }
    },
    
    // 🏛️ MISIONES DE PODER REAL - Conectan vida real con el juego
    scholar_path: {
        id: 'scholar_path',
        name: '📚 El Camino del Erudito Místico',
        description: 'Tu conocimiento del mundo real fortalece tu magia en PassQuirk.',
        type: 'real_life',
        chapter: 1,
        requirements: { level: 3 },
        objectives: [
            {
                id: 'study_session',
                description: '📖 Estudia o lee por 1 hora (Aumenta tu INT mágica)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'study',
                duration: 60
            },
            {
                id: 'knowledge_application',
                description: '🧠 Aplica lo aprendido (Completa una tarea académica)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'academic_task'
            }
        ],
        rewards: {
            exp: 400,
            coins: 150,
            items: [{ id: 'wisdom_scroll', quantity: 1 }, { id: 'mana_crystal', quantity: 2 }],
            stat_boost: { intelligence: 2, mana: 10 },
            title: '🧙‍♂️ Erudito Místico'
        },
        story: {
            intro: '📚 **Los antiguos sabios susurran...** \n\n"El conocimiento es el arma más poderosa. Cada libro que leas, cada concepto que domines en tu mundo, fortalecerá tu magia en PassQuirk." \n\n✨ Tu mente es un conducto entre ambos mundos.',
            completion: '🌟 **¡Tu sabiduría ha crecido exponencialmente!** \n\nPuedes sentir cómo el conocimiento adquirido se transforma en poder mágico puro. Tu inteligencia ha aumentado, y nuevos hechizos están a tu alcance. \n\n📖 **¡El poder del conocimiento es tuyo!**'
        }
    },
    
    warrior_training: {
        id: 'warrior_training',
        name: '💪 El Entrenamiento del Guerrero Legendario',
        description: 'Tu fuerza física se convierte en poder de combate épico.',
        type: 'real_life',
        chapter: 1,
        requirements: { level: 3 },
        objectives: [
            {
                id: 'physical_training',
                description: '🏋️‍♂️ Entrena tu cuerpo (Ejercicio por 45 minutos)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'exercise',
                duration: 45
            },
            {
                id: 'endurance_test',
                description: '🏃‍♂️ Prueba de resistencia (Actividad cardiovascular)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'cardio'
            }
        ],
        rewards: {
            exp: 350,
            coins: 120,
            items: [{ id: 'strength_elixir', quantity: 2 }, { id: 'endurance_charm', quantity: 1 }],
            stat_boost: { strength: 3, stamina: 15 },
            title: '⚔️ Guerrero Legendario'
        },
        story: {
            intro: '💪 **El espíritu de los antiguos guerreros te llama...** \n\n"La fuerza del cuerpo alimenta el alma del guerrero. Cada gota de sudor en tu mundo se convierte en poder de combate en PassQuirk." \n\n🔥 Tu determinación trasciende dimensiones.',
            completion: '⚡ **¡Tu poder físico ha alcanzado nuevas alturas!** \n\nSientes cómo cada fibra muscular vibra con energía mágica. Tu fuerza y resistencia han aumentado dramáticamente. \n\n🗡️ **¡Eres un guerrero imparable!**'
        }
    },
    
    first_exploration: {
        id: 'first_exploration',
        name: '🗺️ Primeros Pasos en el Reino de Akai',
        description: 'Explora las tierras místicas de Akai y descubre sus secretos ancestrales.',
        type: 'main',
        chapter: 2,
        requirements: { level: 5, completed_quests: ['isekai_awakening'] },
        objectives: [
            {
                id: 'explore_akai_lands',
                description: '🗺️ Explora 3 ubicaciones místicas en Akai',
                type: 'exploration',
                target: 3,
                current: 0,
                region: 'akai'
            },
            {
                id: 'defeat_shadow_goblins',
                description: '⚔️ Derrota 5 Goblins de las Sombras',
                type: 'enemy_defeat',
                target: 5,
                current: 0,
                enemy_type: 'shadow_goblin'
            },
            {
                id: 'discover_ancient_rune',
                description: '🔮 Descubre una Runa Ancestral',
                type: 'item_discovery',
                target: 1,
                current: 0,
                item_id: 'ancient_rune'
            }
        ],
        rewards: {
            exp: 600,
            coins: 350,
            items: [{ id: 'akai_blessing', quantity: 1 }, { id: 'health_potion', quantity: 5 }],
            region_unlock: 'say'
        },
        story: {
            intro: '🌸 **Las tierras de Akai te llaman con su belleza ancestral...** \n\nPuedes sentir la energía mágica que emana de cada rincón de este reino. Los cerezos eternos susurran secretos del pasado, y las criaturas místicas observan tu llegada. \n\n🗺️ Es hora de explorar y demostrar tu valor.',
            completion: '🎌 **¡Has conquistado las tierras de Akai!** \n\nTu valor ha sido reconocido por los espíritus ancestrales. Las runas que has descubierto pulsan con poder antiguo, y nuevos caminos se abren ante ti. \n\n🌟 **¡El Reino de Say ahora está a tu alcance!**'
        }
    },
    
    // 🎨 MISIONES CREATIVAS - Para editores de video y artistas
    digital_creator_path: {
        id: 'digital_creator_path',
        name: '🎬 El Sendero del Creador Digital',
        description: 'Tu creatividad digital se convierte en magia de ilusión en PassQuirk.',
        type: 'real_life',
        chapter: 2,
        requirements: { level: 8 },
        objectives: [
            {
                id: 'video_creation',
                description: '🎥 Crea y edita un video (Cualquier duración)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'video_editing'
            },
            {
                id: 'creative_project',
                description: '🎨 Completa un proyecto creativo (Arte, música, diseño)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'creative_work'
            },
            {
                id: 'share_creation',
                description: '📤 Comparte tu creación (Publica o muestra tu trabajo)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'content_sharing'
            }
        ],
        rewards: {
            exp: 500,
            coins: 300,
            items: [{ id: 'illusion_crystal', quantity: 3 }, { id: 'creativity_essence', quantity: 2 }],
            stat_boost: { creativity: 5, charisma: 3 },
            title: '🎭 Maestro de Ilusiones',
            quirk_fragment: 'digital_mastery'
        },
        story: {
            intro: '🎬 **Los Maestros de la Ilusión te observan...** \n\n"Tu habilidad para crear mundos digitales es un don raro. Cada video que edites, cada obra que crees, alimentará tu poder de ilusión en PassQuirk." \n\n✨ Tu creatividad trasciende la realidad.',
            completion: '🌟 **¡Tu poder creativo ha alcanzado niveles legendarios!** \n\nPuedes sentir cómo tu creatividad se materializa en hechizos de ilusión. Tus obras digitales han desbloqueado nuevas habilidades mágicas. \n\n🎭 **¡Eres un verdadero Maestro de las Ilusiones!**'
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
    
    // 🌅 MISIONES DIARIAS ÉPICAS
    daily_hero_training: {
        id: 'daily_hero_training',
        name: '🌅 Entrenamiento del Héroe Diario',
        description: 'Fortalece tu conexión entre ambos mundos con rutinas épicas.',
        type: 'daily',
        reset_time: 'daily',
        objectives: [
            {
                id: 'morning_meditation',
                description: '🧘‍♂️ Meditación matutina (5 minutos de reflexión)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'meditation',
                duration: 5
            },
            {
                id: 'knowledge_quest',
                description: '📚 Búsqueda de conocimiento (Estudia o lee 30 min)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'study',
                duration: 30
            },
            {
                id: 'physical_power',
                description: '💪 Fortalecimiento físico (Ejercicio 20 min)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'exercise',
                duration: 20
            }
        ],
        rewards: {
            exp: 150,
            coins: 75,
            items: [{ id: 'daily_blessing', quantity: 1 }, { id: 'energy_crystal', quantity: 1 }],
            stat_boost: { all_stats: 1 }
        },
        story: {
            completion: '🌟 **¡Otro día de crecimiento épico completado!** Tu dedicación diaria fortalece el vínculo entre ambos mundos.'
        }
    },
    
    daily_creative_flow: {
        id: 'daily_creative_flow',
        name: '🎨 Flujo Creativo Diario',
        description: 'Canaliza tu creatividad diaria en poder mágico.',
        type: 'daily',
        reset_time: 'daily',
        objectives: [
            {
                id: 'creative_expression',
                description: '🎭 Expresión creativa (Dibuja, escribe, edita, diseña)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'creative_work'
            },
            {
                id: 'inspiration_gathering',
                description: '💡 Recolección de inspiración (Consume contenido creativo)',
                type: 'real_activity',
                target: 1,
                current: 0,
                activity: 'inspiration'
            }
        ],
        rewards: {
            exp: 120,
            coins: 60,
            items: [{ id: 'inspiration_shard', quantity: 2 }],
            stat_boost: { creativity: 2 }
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
     * 🎯 Actualiza el progreso de una misión (Versión épica mejorada)
     */
    updateQuestProgress(playerData, actionType, data = {}) {
        this.initializeQuests(playerData);
        
        const updatedQuests = [];
        const completedQuests = [];
        const epicMoments = [];
        
        playerData.quests.active.forEach(questInstance => {
            const quest = this.questDatabase[questInstance.id];
            if (!quest) return;
            
            let questUpdated = false;
            
            questInstance.objectives.forEach(objective => {
                if (objective.type === actionType && objective.current < objective.target) {
                    // Verificar condiciones específicas
                    if (this.matchesObjectiveConditions(objective, data)) {
                        const increment = data.amount || 1;
                        const oldProgress = objective.current;
                        objective.current = Math.min(objective.current + increment, objective.target);
                        questUpdated = true;
                        
                        // Crear momento épico para actividades reales
                        if (objective.type === 'real_activity') {
                            epicMoments.push({
                                type: 'real_power_surge',
                                activity: objective.activity,
                                progress: `${objective.current}/${objective.target}`,
                                questName: quest.name,
                                powerGained: this.calculateRealActivityPower(objective, data)
                            });
                        }
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
        
        return { updatedQuests, completedQuests, epicMoments };
    }
    
    /**
     * ⚡ Calcula el poder ganado por actividades reales
     */
    calculateRealActivityPower(objective, data) {
        const basePower = {
            'study': { exp: 50, intelligence: 1 },
            'exercise': { exp: 40, strength: 1, stamina: 2 },
            'video_editing': { exp: 60, creativity: 2, charisma: 1 },
            'creative_work': { exp: 55, creativity: 2 },
            'meditation': { exp: 30, wisdom: 1, mana: 5 },
            'cardio': { exp: 45, stamina: 2, agility: 1 },
            'academic_task': { exp: 70, intelligence: 2 },
            'content_sharing': { exp: 35, charisma: 2 },
            'inspiration': { exp: 25, creativity: 1 }
        };
        
        const activityPower = basePower[objective.activity] || { exp: 20 };
        
        // Bonus por duración si está especificada
        if (objective.duration && data.duration) {
            const durationMultiplier = Math.min(data.duration / objective.duration, 2.0);
            Object.keys(activityPower).forEach(key => {
                if (key !== 'exp') {
                    activityPower[key] = Math.floor(activityPower[key] * durationMultiplier);
                }
            });
        }
        
        return activityPower;
    }
    
    /**
     * 🌟 Registra una actividad real del usuario
     */
    async recordRealActivity(playerData, activity, duration = null, details = {}) {
        const activityData = {
            activity: activity,
            duration: duration,
            timestamp: Date.now(),
            ...details
        };
        
        // Actualizar progreso de misiones
        const progressResult = this.updateQuestProgress(playerData, 'real_activity', activityData);
        
        // Aplicar poder ganado inmediatamente
        if (progressResult.epicMoments.length > 0) {
            progressResult.epicMoments.forEach(moment => {
                const power = moment.powerGained;
                
                // Aplicar experiencia
                if (power.exp) {
                    progressionSystem.awardExperience(playerData, 'real_activity', power.exp);
                }
                
                // Aplicar stats
                Object.keys(power).forEach(stat => {
                    if (stat !== 'exp' && power[stat] > 0) {
                        playerData.stats = playerData.stats || {};
                        playerData.stats[stat] = (playerData.stats[stat] || 0) + power[stat];
                    }
                });
            });
        }
        
        // Registrar en historial de actividades
        playerData.realActivityHistory = playerData.realActivityHistory || [];
        playerData.realActivityHistory.push(activityData);
        
        // Mantener solo las últimas 50 actividades
        if (playerData.realActivityHistory.length > 50) {
            playerData.realActivityHistory = playerData.realActivityHistory.slice(-50);
        }
        
        console.log(`🌟 ${playerData.username} completó actividad real: ${activity} ${duration ? `(${duration} min)` : ''}`);
        
        return {
            success: true,
            progressResult,
            powerGained: progressResult.epicMoments.reduce((total, moment) => {
                Object.keys(moment.powerGained).forEach(key => {
                    total[key] = (total[key] || 0) + moment.powerGained[key];
                });
                return total;
            }, {})
        };
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
     * 🔍 Obtiene misiones disponibles para un jugador
     */
    getAvailableQuests(playerData) {
        this.initializeQuests(playerData);
        
        const availableQuests = [];
        
        Object.values(this.questDatabase).forEach(quest => {
            if (this.canAcceptQuest(playerData, quest.id)) {
                availableQuests.push(quest);
            }
        });
        
        return availableQuests;
    }

    /**
     * 📋 Obtiene misiones activas del jugador
     */
    getActiveQuests(playerData) {
        this.initializeQuests(playerData);
        return playerData.quests.active || [];
    }

    /**
     * ✅ Obtiene misiones completadas del jugador
     */
    getCompletedQuests(playerData) {
        this.initializeQuests(playerData);
        return playerData.quests.completed || [];
    }

    /**
     * 🎲 Genera una misión diaria aleatoria
     */
    generateRandomDailyQuest(playerData) {
        const dailyQuests = Object.values(this.questDatabase).filter(quest => 
            quest.type === 'daily' && this.canAcceptQuest(playerData, quest.id)
        );
        
        if (dailyQuests.length === 0) return null;
        
        const randomQuest = dailyQuests[Math.floor(Math.random() * dailyQuests.length)];
        return randomQuest;
    }

    /**
     * ⚡ Crea una misión dinámica basada en las actividades del usuario
     */
    createDynamicQuest(playerData, questType = 'real_life', difficulty = 'normal') {
        const questId = `dynamic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const difficultyMultipliers = {
            'easy': { duration: 0.5, rewards: 0.7, target: 0.6 },
            'normal': { duration: 1.0, rewards: 1.0, target: 1.0 },
            'hard': { duration: 1.5, rewards: 1.5, target: 1.4 },
            'epic': { duration: 2.0, rewards: 2.5, target: 2.0 }
        };
        
        const multiplier = difficultyMultipliers[difficulty] || difficultyMultipliers.normal;
        
        const questTemplates = {
            'real_life': {
                name: `🌟 Desafío del Héroe: ${this.getRandomHeroTitle()}`,
                description: `Un nuevo desafío aparece en tu camino hacia la grandeza. Demuestra tu determinación en el mundo real para desbloquear poder en PassQuirk.`,
                objectives: [
                    {
                        id: 'real_power_training',
                        type: 'real_activity',
                        activity: this.getRandomRealActivity(playerData),
                        target: Math.ceil(3 * multiplier.target),
                        current: 0,
                        description: `Completa actividades de entrenamiento real`
                    }
                ],
                rewards: {
                    experience: Math.floor(200 * multiplier.rewards),
                    coins: Math.floor(150 * multiplier.rewards),
                    items: [{ id: 'energy_crystal', quantity: Math.ceil(2 * multiplier.rewards) }],
                    title: difficulty === 'epic' ? 'Maestro de la Realidad' : null
                }
            },
            'creative': {
                name: `🎨 Misión Creativa: ${this.getRandomCreativeTitle()}`,
                description: `Tu creatividad es tu arma más poderosa. Canaliza tu inspiración para crear algo extraordinario.`,
                objectives: [
                    {
                        id: 'creative_mastery',
                        type: 'real_activity',
                        activity: 'video_editing',
                        target: Math.ceil(2 * multiplier.target),
                        current: 0,
                        duration: Math.ceil(30 * multiplier.duration),
                        description: `Dedica tiempo a proyectos creativos`
                    }
                ],
                rewards: {
                    experience: Math.floor(250 * multiplier.rewards),
                    coins: Math.floor(100 * multiplier.rewards),
                    items: [{ id: 'illusion_crystal', quantity: Math.ceil(3 * multiplier.rewards) }],
                    quirks: difficulty === 'epic' ? ['creativity_boost'] : []
                }
            }
        };
        
        const template = questTemplates[questType] || questTemplates.real_life;
        
        const dynamicQuest = {
            id: questId,
            type: 'dynamic',
            ...template,
            difficulty: difficulty,
            createdAt: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 días
            requirements: {
                level: Math.max(1, playerData.level - 2)
            }
        };
        
        // Añadir a la base de datos temporal
        this.questDatabase[questId] = dynamicQuest;
        
        console.log(`⚡ Misión dinámica creada: ${dynamicQuest.name} (${difficulty})`);
        
        return dynamicQuest;
    }
    
    /**
     * 🎭 Obtiene un título heroico aleatorio
     */
    getRandomHeroTitle() {
        const titles = [
            'Forja del Destino', 'Despertar del Poder', 'Prueba de Voluntad',
            'Camino del Guerrero', 'Ascensión Épica', 'Desafío Supremo',
            'Llamada del Héroe', 'Transformación Legendaria', 'Conquista Personal'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }
    
    /**
     * 🎨 Obtiene un título creativo aleatorio
     */
    getRandomCreativeTitle() {
        const titles = [
            'Inspiración Divina', 'Maestría Artística', 'Visión Creativa',
            'Expresión del Alma', 'Creación Épica', 'Arte Trascendental',
            'Imaginación Sin Límites', 'Obra Maestra', 'Genio Creativo'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }
    
    /**
     * 🏃 Obtiene una actividad real aleatoria basada en el perfil del jugador
     */
    getRandomRealActivity(playerData) {
        const activities = ['study', 'exercise', 'meditation', 'creative_work'];
        
        // Personalizar según la clase del jugador
        if (playerData.class) {
            const classActivities = {
                'Celestial': ['meditation', 'study', 'inspiration'],
                'Fénix': ['exercise', 'cardio', 'meditation'],
                'Berserker': ['exercise', 'cardio', 'study'],
                'Inmortal': ['study', 'meditation', 'academic_task'],
                'Demon': ['exercise', 'creative_work', 'study'],
                'Sombra': ['meditation', 'study', 'creative_work']
            };
            
            const preferredActivities = classActivities[playerData.class] || activities;
            return preferredActivities[Math.floor(Math.random() * preferredActivities.length)];
        }
        
        return activities[Math.floor(Math.random() * activities.length)];
    }
    
    /**
     * 🌟 Crea un evento especial temporal
     */
    createSpecialEvent(eventType = 'power_surge', duration = 24) {
        const eventId = `event_${Date.now()}_${eventType}`;
        const now = Date.now();
        const durationMs = duration * 60 * 60 * 1000; // horas a milisegundos
        
        const eventTemplates = {
            'power_surge': {
                name: '⚡ Oleada de Poder Cósmico',
                description: 'Una misteriosa energía cósmica aumenta el poder de todas las actividades reales. ¡Aprovecha este momento!',
                effects: {
                    realActivityMultiplier: 2.0,
                    experienceBonus: 1.5,
                    rareDrop: 0.3
                }
            },
            'creative_awakening': {
                name: '🎨 Despertar Creativo',
                description: 'Las musas han bendecido este mundo. Todas las actividades creativas otorgan recompensas épicas.',
                effects: {
                    creativeMultiplier: 3.0,
                    creativityStatBonus: 2,
                    specialItems: ['inspiration_crystal', 'muse_blessing']
                }
            },
            'hero_festival': {
                name: '🎉 Festival de Héroes',
                description: 'Los héroes de todos los mundos se reúnen. Completa misiones para obtener recompensas exclusivas.',
                effects: {
                    questRewardMultiplier: 2.5,
                    socialBonus: 1.8,
                    festivalTokens: true
                }
            }
        };
        
        const template = eventTemplates[eventType] || eventTemplates.power_surge;
        
        const specialEvent = {
            id: eventId,
            type: 'special_event',
            ...template,
            startTime: now,
            endTime: now + durationMs,
            active: true,
            participants: []
        };
        
        console.log(`🌟 Evento especial creado: ${specialEvent.name} (${duration}h)`);
        
        return specialEvent;
    }
    
    /**
     * 🎯 Obtiene el progreso épico del jugador
     */
    getEpicProgress(playerData) {
        this.initializeQuests(playerData);
        
        const realActivities = playerData.realActivityHistory || [];
        const recentActivities = realActivities.filter(activity => 
            Date.now() - activity.timestamp < (7 * 24 * 60 * 60 * 1000) // última semana
        );
        
        const activityStats = {};
        recentActivities.forEach(activity => {
            activityStats[activity.activity] = (activityStats[activity.activity] || 0) + 1;
        });
        
        const totalRealPower = Object.values(activityStats).reduce((sum, count) => sum + count, 0);
        
        return {
            totalQuests: playerData.quests.completed.length,
            activeQuests: playerData.quests.active.length,
            realActivitiesThisWeek: recentActivities.length,
            totalRealPower: totalRealPower,
            activityBreakdown: activityStats,
            epicLevel: this.calculateEpicLevel(totalRealPower, playerData.quests.completed.length),
            nextMilestone: this.getNextEpicMilestone(totalRealPower)
        };
    }
    
    /**
     * 🏆 Calcula el nivel épico del jugador
     */
    calculateEpicLevel(realPower, completedQuests) {
        const totalScore = (realPower * 10) + (completedQuests * 25);
        
        if (totalScore >= 1000) return 'Leyenda Viviente';
        if (totalScore >= 500) return 'Héroe Épico';
        if (totalScore >= 250) return 'Guerrero Ascendido';
        if (totalScore >= 100) return 'Aventurero Experimentado';
        if (totalScore >= 50) return 'Héroe en Entrenamiento';
        return 'Novato Prometedor';
    }
    
    /**
     * 🎯 Obtiene el siguiente hito épico
     */
    getNextEpicMilestone(currentPower) {
        const milestones = [
            { power: 10, title: 'Primera Transformación', reward: 'Cristal de Poder' },
            { power: 25, title: 'Despertar del Héroe', reward: 'Quirk Aleatorio' },
            { power: 50, title: 'Maestría Inicial', reward: 'Arma Épica' },
            { power: 100, title: 'Ascensión Heroica', reward: 'Título Legendario' },
            { power: 200, title: 'Leyenda en Formación', reward: 'Habilidad Única' }
        ];
        
        return milestones.find(milestone => currentPower < milestone.power) || 
               { power: '∞', title: 'Más Allá de los Límites', reward: 'Poder Infinito' };
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