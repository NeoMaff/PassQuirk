// 🏆 ACHIEVEMENT SYSTEM - Sistema de Logros de PassQuirk RPG
// Maneja logros, títulos, medallas y progreso de objetivos

const { PassQuirkEmbed } = require('../utils/embedStyles');
const { progressionSystem } = require('./progression-system');
const { inventorySystem } = require('./inventory-system');

/**
 * 🎯 Tipos de logros
 */
const ACHIEVEMENT_TYPES = {
    combat: {
        name: 'Combate',
        emoji: '⚔️',
        color: 0xff4500,
        description: 'Logros relacionados con batallas y combate'
    },
    exploration: {
        name: 'Exploración',
        emoji: '🗺️',
        color: 0x32cd32,
        description: 'Logros por explorar el mundo de PassQuirk'
    },
    social: {
        name: 'Social',
        emoji: '👥',
        color: 0x4169e1,
        description: 'Logros relacionados con interacciones sociales'
    },
    progression: {
        name: 'Progresión',
        emoji: '📈',
        color: 0x9370db,
        description: 'Logros por avanzar en nivel y habilidades'
    },
    collection: {
        name: 'Colección',
        emoji: '📦',
        color: 0xff69b4,
        description: 'Logros por recolectar objetos y materiales'
    },
    crafting: {
        name: 'Artesanía',
        emoji: '🔨',
        color: 0xdaa520,
        description: 'Logros relacionados con creación y mejora'
    },
    special: {
        name: 'Especial',
        emoji: '✨',
        color: 0xffd700,
        description: 'Logros únicos y eventos especiales'
    },
    real_world: {
        name: 'Mundo Real',
        emoji: '🌍',
        color: 0x20b2aa,
        description: 'Logros por actividades del mundo real'
    }
};

/**
 * 🏅 Rareza de logros
 */
const ACHIEVEMENT_RARITY = {
    common: {
        name: 'Común',
        emoji: '🥉',
        color: 0x808080,
        multiplier: 1.0,
        description: 'Logros básicos al alcance de todos'
    },
    uncommon: {
        name: 'Poco Común',
        emoji: '🥈',
        color: 0x90ee90,
        multiplier: 1.5,
        description: 'Logros que requieren dedicación'
    },
    rare: {
        name: 'Raro',
        emoji: '🥇',
        color: 0x4169e1,
        multiplier: 2.0,
        description: 'Logros desafiantes para aventureros experimentados'
    },
    epic: {
        name: 'Épico',
        emoji: '🏆',
        color: 0x9370db,
        multiplier: 3.0,
        description: 'Logros extraordinarios que pocos alcanzan'
    },
    legendary: {
        name: 'Legendario',
        emoji: '👑',
        color: 0xffd700,
        multiplier: 5.0,
        description: 'Logros míticos para los más dedicados'
    },
    mythic: {
        name: 'Mítico',
        emoji: '💎',
        color: 0xff1493,
        multiplier: 10.0,
        description: 'Logros imposibles que desafían la realidad'
    }
};

/**
 * 🎖️ Base de datos de logros
 */
const ACHIEVEMENT_DATABASE = {
    // LOGROS DE COMBATE
    first_victory: {
        id: 'first_victory',
        name: 'Primera Victoria',
        description: 'Gana tu primera batalla',
        type: 'combat',
        rarity: 'common',
        condition: {
            type: 'battles_won',
            target: 1
        },
        rewards: {
            exp: 100,
            coins: 50,
            title: 'Novato Guerrero'
        },
        hidden: false
    },
    
    hundred_battles: {
        id: 'hundred_battles',
        name: 'Centurión',
        description: 'Participa en 100 batallas',
        type: 'combat',
        rarity: 'uncommon',
        condition: {
            type: 'battles_participated',
            target: 100
        },
        rewards: {
            exp: 500,
            coins: 200,
            items: [{ id: 'battle_medal', quantity: 1 }],
            title: 'Veterano de Guerra'
        },
        hidden: false
    },
    
    perfect_streak: {
        id: 'perfect_streak',
        name: 'Racha Perfecta',
        description: 'Gana 10 batallas consecutivas sin perder',
        type: 'combat',
        rarity: 'rare',
        condition: {
            type: 'win_streak',
            target: 10
        },
        rewards: {
            exp: 1000,
            coins: 500,
            items: [{ id: 'perfect_warrior_ring', quantity: 1 }],
            title: 'Guerrero Perfecto'
        },
        hidden: false
    },
    
    boss_slayer: {
        id: 'boss_slayer',
        name: 'Cazador de Jefes',
        description: 'Derrota 25 jefes',
        type: 'combat',
        rarity: 'epic',
        condition: {
            type: 'bosses_defeated',
            target: 25
        },
        rewards: {
            exp: 2000,
            coins: 1000,
            items: [{ id: 'boss_slayer_crown', quantity: 1 }],
            title: 'Cazador de Titanes'
        },
        hidden: false
    },
    
    legendary_warrior: {
        id: 'legendary_warrior',
        name: 'Guerrero Legendario',
        description: 'Alcanza 1000 victorias en combate',
        type: 'combat',
        rarity: 'legendary',
        condition: {
            type: 'battles_won',
            target: 1000
        },
        rewards: {
            exp: 5000,
            coins: 2500,
            items: [{ id: 'legendary_sword', quantity: 1 }],
            title: 'Leyenda Viviente',
            permanent_bonus: { attack: 10, defense: 10 }
        },
        hidden: false
    },
    
    // LOGROS DE EXPLORACIÓN
    first_steps: {
        id: 'first_steps',
        name: 'Primeros Pasos',
        description: 'Visita tu primera región',
        type: 'exploration',
        rarity: 'common',
        condition: {
            type: 'regions_visited',
            target: 1
        },
        rewards: {
            exp: 50,
            coins: 25,
            title: 'Explorador Novato'
        },
        hidden: false
    },
    
    world_traveler: {
        id: 'world_traveler',
        name: 'Viajero del Mundo',
        description: 'Visita todas las regiones de PassQuirk',
        type: 'exploration',
        rarity: 'rare',
        condition: {
            type: 'all_regions_visited',
            target: 5 // Akai, Say, Masai, Zephyr, Void
        },
        rewards: {
            exp: 1500,
            coins: 750,
            items: [{ id: 'world_map', quantity: 1 }],
            title: 'Maestro Explorador'
        },
        hidden: false
    },
    
    dungeon_crawler: {
        id: 'dungeon_crawler',
        name: 'Explorador de Mazmorras',
        description: 'Completa 50 mazmorras',
        type: 'exploration',
        rarity: 'uncommon',
        condition: {
            type: 'dungeons_completed',
            target: 50
        },
        rewards: {
            exp: 800,
            coins: 400,
            items: [{ id: 'dungeon_key', quantity: 5 }],
            title: 'Señor de las Mazmorras'
        },
        hidden: false
    },
    
    treasure_hunter: {
        id: 'treasure_hunter',
        name: 'Cazador de Tesoros',
        description: 'Encuentra 100 cofres del tesoro',
        type: 'exploration',
        rarity: 'rare',
        condition: {
            type: 'treasures_found',
            target: 100
        },
        rewards: {
            exp: 1200,
            coins: 600,
            items: [{ id: 'treasure_detector', quantity: 1 }],
            title: 'Buscador de Fortunas'
        },
        hidden: false
    },
    
    // LOGROS SOCIALES
    first_friend: {
        id: 'first_friend',
        name: 'Primer Amigo',
        description: 'Añade tu primer amigo',
        type: 'social',
        rarity: 'common',
        condition: {
            type: 'friends_added',
            target: 1
        },
        rewards: {
            exp: 100,
            coins: 50,
            title: 'Sociable'
        },
        hidden: false
    },
    
    guild_founder: {
        id: 'guild_founder',
        name: 'Fundador de Gremio',
        description: 'Crea tu propio gremio',
        type: 'social',
        rarity: 'uncommon',
        condition: {
            type: 'guilds_created',
            target: 1
        },
        rewards: {
            exp: 500,
            coins: 250,
            items: [{ id: 'guild_banner', quantity: 1 }],
            title: 'Líder Nato'
        },
        hidden: false
    },
    
    helpful_soul: {
        id: 'helpful_soul',
        name: 'Alma Caritativa',
        description: 'Ayuda a 50 jugadores novatos',
        type: 'social',
        rarity: 'rare',
        condition: {
            type: 'players_helped',
            target: 50
        },
        rewards: {
            exp: 1000,
            coins: 500,
            items: [{ id: 'helper_badge', quantity: 1 }],
            title: 'Mentor Bondadoso'
        },
        hidden: false
    },
    
    community_pillar: {
        id: 'community_pillar',
        name: 'Pilar de la Comunidad',
        description: 'Participa en 25 eventos comunitarios',
        type: 'social',
        rarity: 'epic',
        condition: {
            type: 'community_events_participated',
            target: 25
        },
        rewards: {
            exp: 2500,
            coins: 1250,
            items: [{ id: 'community_crown', quantity: 1 }],
            title: 'Héroe Comunitario'
        },
        hidden: false
    },
    
    // LOGROS DE PROGRESIÓN
    level_up: {
        id: 'level_up',
        name: 'Primer Nivel',
        description: 'Alcanza el nivel 2',
        type: 'progression',
        rarity: 'common',
        condition: {
            type: 'level_reached',
            target: 2
        },
        rewards: {
            exp: 50,
            coins: 25,
            title: 'En Crecimiento'
        },
        hidden: false
    },
    
    veteran_adventurer: {
        id: 'veteran_adventurer',
        name: 'Aventurero Veterano',
        description: 'Alcanza el nivel 25',
        type: 'progression',
        rarity: 'uncommon',
        condition: {
            type: 'level_reached',
            target: 25
        },
        rewards: {
            exp: 1000,
            coins: 500,
            items: [{ id: 'veteran_badge', quantity: 1 }],
            title: 'Veterano Respetado'
        },
        hidden: false
    },
    
    master_class: {
        id: 'master_class',
        name: 'Maestro de Clase',
        description: 'Alcanza el nivel 50',
        type: 'progression',
        rarity: 'rare',
        condition: {
            type: 'level_reached',
            target: 50
        },
        rewards: {
            exp: 2500,
            coins: 1250,
            items: [{ id: 'master_emblem', quantity: 1 }],
            title: 'Maestro Consumado'
        },
        hidden: false
    },
    
    legendary_hero: {
        id: 'legendary_hero',
        name: 'Héroe Legendario',
        description: 'Alcanza el nivel 100',
        type: 'progression',
        rarity: 'legendary',
        condition: {
            type: 'level_reached',
            target: 100
        },
        rewards: {
            exp: 10000,
            coins: 5000,
            items: [{ id: 'legendary_cape', quantity: 1 }],
            title: 'Héroe de Leyenda',
            permanent_bonus: { all_stats: 25 }
        },
        hidden: false
    },
    
    // LOGROS DE COLECCIÓN
    first_item: {
        id: 'first_item',
        name: 'Primera Adquisición',
        description: 'Obtén tu primer objeto',
        type: 'collection',
        rarity: 'common',
        condition: {
            type: 'items_collected',
            target: 1
        },
        rewards: {
            exp: 25,
            coins: 10,
            title: 'Coleccionista Novato'
        },
        hidden: false
    },
    
    hoarder: {
        id: 'hoarder',
        name: 'Acumulador',
        description: 'Posee 500 objetos diferentes',
        type: 'collection',
        rarity: 'uncommon',
        condition: {
            type: 'unique_items_owned',
            target: 500
        },
        rewards: {
            exp: 750,
            coins: 375,
            items: [{ id: 'storage_expansion', quantity: 1 }],
            title: 'Gran Acumulador'
        },
        hidden: false
    },
    
    rare_collector: {
        id: 'rare_collector',
        name: 'Coleccionista de Rarezas',
        description: 'Posee 50 objetos raros o superiores',
        type: 'collection',
        rarity: 'rare',
        condition: {
            type: 'rare_items_owned',
            target: 50
        },
        rewards: {
            exp: 1500,
            coins: 750,
            items: [{ id: 'rare_item_detector', quantity: 1 }],
            title: 'Cazador de Rarezas'
        },
        hidden: false
    },
    
    legendary_collector: {
        id: 'legendary_collector',
        name: 'Coleccionista Legendario',
        description: 'Posee 10 objetos legendarios',
        type: 'collection',
        rarity: 'epic',
        condition: {
            type: 'legendary_items_owned',
            target: 10
        },
        rewards: {
            exp: 3000,
            coins: 1500,
            items: [{ id: 'legendary_vault', quantity: 1 }],
            title: 'Guardián de Leyendas'
        },
        hidden: false
    },
    
    // LOGROS DE ARTESANÍA
    first_craft: {
        id: 'first_craft',
        name: 'Primera Creación',
        description: 'Crea tu primer objeto',
        type: 'crafting',
        rarity: 'common',
        condition: {
            type: 'items_crafted',
            target: 1
        },
        rewards: {
            exp: 75,
            coins: 35,
            title: 'Artesano Novato'
        },
        hidden: false
    },
    
    master_crafter: {
        id: 'master_crafter',
        name: 'Maestro Artesano',
        description: 'Crea 100 objetos',
        type: 'crafting',
        rarity: 'uncommon',
        condition: {
            type: 'items_crafted',
            target: 100
        },
        rewards: {
            exp: 1000,
            coins: 500,
            items: [{ id: 'master_tools', quantity: 1 }],
            title: 'Maestro del Oficio'
        },
        hidden: false
    },
    
    legendary_smith: {
        id: 'legendary_smith',
        name: 'Herrero Legendario',
        description: 'Crea un objeto legendario',
        type: 'crafting',
        rarity: 'legendary',
        condition: {
            type: 'legendary_items_crafted',
            target: 1
        },
        rewards: {
            exp: 5000,
            coins: 2500,
            items: [{ id: 'legendary_hammer', quantity: 1 }],
            title: 'Forjador de Leyendas'
        },
        hidden: false
    },
    
    // LOGROS DEL MUNDO REAL
    daily_dedication: {
        id: 'daily_dedication',
        name: 'Dedicación Diaria',
        description: 'Completa 30 días consecutivos de actividades',
        type: 'real_world',
        rarity: 'uncommon',
        condition: {
            type: 'daily_streak',
            target: 30
        },
        rewards: {
            exp: 1500,
            coins: 750,
            items: [{ id: 'dedication_medal', quantity: 1 }],
            title: 'Alma Dedicada'
        },
        hidden: false
    },
    
    study_master: {
        id: 'study_master',
        name: 'Maestro del Estudio',
        description: 'Completa 100 sesiones de estudio',
        type: 'real_world',
        rarity: 'rare',
        condition: {
            type: 'study_sessions_completed',
            target: 100
        },
        rewards: {
            exp: 2000,
            coins: 1000,
            items: [{ id: 'wisdom_tome', quantity: 1 }],
            title: 'Sabio Estudioso'
        },
        hidden: false
    },
    
    fitness_warrior: {
        id: 'fitness_warrior',
        name: 'Guerrero del Fitness',
        description: 'Completa 50 sesiones de ejercicio',
        type: 'real_world',
        rarity: 'rare',
        condition: {
            type: 'exercise_sessions_completed',
            target: 50
        },
        rewards: {
            exp: 2000,
            coins: 1000,
            items: [{ id: 'strength_potion', quantity: 5 }],
            title: 'Atleta Dedicado'
        },
        hidden: false
    },
    
    creative_soul: {
        id: 'creative_soul',
        name: 'Alma Creativa',
        description: 'Completa 25 proyectos creativos',
        type: 'real_world',
        rarity: 'uncommon',
        condition: {
            type: 'creative_projects_completed',
            target: 25
        },
        rewards: {
            exp: 1250,
            coins: 625,
            items: [{ id: 'inspiration_crystal', quantity: 1 }],
            title: 'Artista Inspirado'
        },
        hidden: false
    },
    
    // LOGROS ESPECIALES
    beta_tester: {
        id: 'beta_tester',
        name: 'Probador Beta',
        description: 'Participaste en la fase beta de PassQuirk',
        type: 'special',
        rarity: 'epic',
        condition: {
            type: 'special_flag',
            flag: 'beta_participant'
        },
        rewards: {
            exp: 2000,
            coins: 1000,
            items: [{ id: 'beta_crown', quantity: 1 }],
            title: 'Pionero Beta'
        },
        hidden: false
    },
    
    anniversary_participant: {
        id: 'anniversary_participant',
        name: 'Celebrante del Aniversario',
        description: 'Participa en el evento de aniversario',
        type: 'special',
        rarity: 'rare',
        condition: {
            type: 'event_participation',
            event: 'anniversary_celebration'
        },
        rewards: {
            exp: 1000,
            coins: 500,
            items: [{ id: 'anniversary_badge', quantity: 1 }],
            title: 'Celebrante Fiel'
        },
        hidden: false
    },
    
    secret_finder: {
        id: 'secret_finder',
        name: 'Descubridor de Secretos',
        description: 'Encuentra un secreto oculto en PassQuirk',
        type: 'special',
        rarity: 'mythic',
        condition: {
            type: 'secrets_found',
            target: 1
        },
        rewards: {
            exp: 10000,
            coins: 5000,
            items: [{ id: 'mystery_key', quantity: 1 }],
            title: 'Guardián de Misterios'
        },
        hidden: true
    },
    
    perfect_player: {
        id: 'perfect_player',
        name: 'Jugador Perfecto',
        description: 'Alcanza la perfección en todas las estadísticas',
        type: 'special',
        rarity: 'mythic',
        condition: {
            type: 'perfect_stats',
            target: 1000 // Todas las stats en 1000
        },
        rewards: {
            exp: 50000,
            coins: 25000,
            items: [{ id: 'perfection_orb', quantity: 1 }],
            title: 'Ser Perfecto',
            permanent_bonus: { all_stats: 100 }
        },
        hidden: true
    }
};

/**
 * 👑 Base de datos de títulos
 */
const TITLE_DATABASE = {
    // Títulos básicos
    'Novato Guerrero': {
        id: 'novato_guerrero',
        name: 'Novato Guerrero',
        description: 'Un guerrero que da sus primeros pasos',
        rarity: 'common',
        effects: { attack: 2 },
        unlocked_by: 'first_victory'
    },
    
    'Veterano de Guerra': {
        id: 'veterano_guerra',
        name: 'Veterano de Guerra',
        description: 'Un guerrero experimentado en el campo de batalla',
        rarity: 'uncommon',
        effects: { attack: 5, defense: 3 },
        unlocked_by: 'hundred_battles'
    },
    
    'Guerrero Perfecto': {
        id: 'guerrero_perfecto',
        name: 'Guerrero Perfecto',
        description: 'Un guerrero que nunca conoce la derrota',
        rarity: 'rare',
        effects: { attack: 8, defense: 5, critical_rate: 0.05 },
        unlocked_by: 'perfect_streak'
    },
    
    'Cazador de Titanes': {
        id: 'cazador_titanes',
        name: 'Cazador de Titanes',
        description: 'Aquel que caza a los más poderosos',
        rarity: 'epic',
        effects: { attack: 15, boss_damage: 0.2 },
        unlocked_by: 'boss_slayer'
    },
    
    'Leyenda Viviente': {
        id: 'leyenda_viviente',
        name: 'Leyenda Viviente',
        description: 'Una leyenda que camina entre nosotros',
        rarity: 'legendary',
        effects: { all_stats: 20, exp_bonus: 0.1 },
        unlocked_by: 'legendary_warrior'
    },
    
    // Títulos de exploración
    'Explorador Novato': {
        id: 'explorador_novato',
        name: 'Explorador Novato',
        description: 'Alguien que comienza a explorar el mundo',
        rarity: 'common',
        effects: { movement_speed: 0.05 },
        unlocked_by: 'first_steps'
    },
    
    'Maestro Explorador': {
        id: 'maestro_explorador',
        name: 'Maestro Explorador',
        description: 'Conoce cada rincón del mundo',
        rarity: 'rare',
        effects: { movement_speed: 0.15, treasure_find_rate: 0.1 },
        unlocked_by: 'world_traveler'
    },
    
    'Señor de las Mazmorras': {
        id: 'senor_mazmorras',
        name: 'Señor de las Mazmorras',
        description: 'Maestro de los lugares más oscuros',
        rarity: 'uncommon',
        effects: { dungeon_exp_bonus: 0.15 },
        unlocked_by: 'dungeon_crawler'
    },
    
    'Buscador de Fortunas': {
        id: 'buscador_fortunas',
        name: 'Buscador de Fortunas',
        description: 'Encuentra tesoros donde otros no pueden',
        rarity: 'rare',
        effects: { treasure_find_rate: 0.25, coin_bonus: 0.1 },
        unlocked_by: 'treasure_hunter'
    },
    
    // Títulos sociales
    'Sociable': {
        id: 'sociable',
        name: 'Sociable',
        description: 'Disfruta de la compañía de otros',
        rarity: 'common',
        effects: { friendship_bonus: 0.05 },
        unlocked_by: 'first_friend'
    },
    
    'Líder Nato': {
        id: 'lider_nato',
        name: 'Líder Nato',
        description: 'Nacido para liderar a otros',
        rarity: 'uncommon',
        effects: { leadership_bonus: 0.1, guild_exp_bonus: 0.05 },
        unlocked_by: 'guild_founder'
    },
    
    'Mentor Bondadoso': {
        id: 'mentor_bondadoso',
        name: 'Mentor Bondadoso',
        description: 'Guía a otros hacia la grandeza',
        rarity: 'rare',
        effects: { teaching_bonus: 0.2, karma: 10 },
        unlocked_by: 'helpful_soul'
    },
    
    'Héroe Comunitario': {
        id: 'heroe_comunitario',
        name: 'Héroe Comunitario',
        description: 'Un pilar de la comunidad',
        rarity: 'epic',
        effects: { community_bonus: 0.25, all_stats: 5 },
        unlocked_by: 'community_pillar'
    },
    
    // Títulos especiales
    'Pionero Beta': {
        id: 'pionero_beta',
        name: 'Pionero Beta',
        description: 'Uno de los primeros en explorar PassQuirk',
        rarity: 'epic',
        effects: { all_bonuses: 0.05, prestige: 50 },
        unlocked_by: 'beta_tester'
    },
    
    'Guardián de Misterios': {
        id: 'guardian_misterios',
        name: 'Guardián de Misterios',
        description: 'Conoce secretos que otros no pueden imaginar',
        rarity: 'mythic',
        effects: { secret_detection: 0.5, mystery_bonus: 0.3 },
        unlocked_by: 'secret_finder'
    },
    
    'Ser Perfecto': {
        id: 'ser_perfecto',
        name: 'Ser Perfecto',
        description: 'Ha alcanzado la perfección absoluta',
        rarity: 'mythic',
        effects: { all_stats: 50, all_bonuses: 0.25 },
        unlocked_by: 'perfect_player'
    }
};

/**
 * 🏆 Clase principal del sistema de logros
 */
class AchievementSystem {
    constructor() {
        this.achievementDatabase = ACHIEVEMENT_DATABASE;
        this.titleDatabase = TITLE_DATABASE;
        this.achievementTypes = ACHIEVEMENT_TYPES;
        this.achievementRarity = ACHIEVEMENT_RARITY;
        this.playerProgress = new Map();
    }

    /**
     * 🚀 Inicializar sistema de logros
     */
    initialize() {
        console.log('🏆 Sistema de logros inicializado');
        console.log(`📊 ${Object.keys(this.achievementDatabase).length} logros disponibles`);
        console.log(`👑 ${Object.keys(this.titleDatabase).length} títulos disponibles`);
    }

    /**
     * 📊 Inicializar progreso del jugador
     */
    initializePlayerProgress(playerData) {
        if (!playerData.achievements) {
            playerData.achievements = {
                unlocked: [],
                progress: {},
                titles: [],
                activeTitle: null,
                stats: {
                    totalAchievements: 0,
                    commonAchievements: 0,
                    uncommonAchievements: 0,
                    rareAchievements: 0,
                    epicAchievements: 0,
                    legendaryAchievements: 0,
                    mythicAchievements: 0,
                    achievementPoints: 0
                }
            };
        }
        
        return playerData.achievements;
    }

    /**
     * 🎯 Actualizar progreso de logro
     */
    updateProgress(playerData, progressType, value = 1, additionalData = {}) {
        const achievements = this.initializePlayerProgress(playerData);
        
        // Actualizar progreso
        if (!achievements.progress[progressType]) {
            achievements.progress[progressType] = 0;
        }
        achievements.progress[progressType] += value;
        
        // Verificar logros
        const newAchievements = this.checkAchievements(playerData, progressType, additionalData);
        
        return newAchievements;
    }

    /**
     * ✅ Verificar logros
     */
    checkAchievements(playerData, progressType, additionalData = {}) {
        const achievements = playerData.achievements;
        const newAchievements = [];
        
        Object.values(this.achievementDatabase).forEach(achievement => {
            // Saltar si ya está desbloqueado
            if (achievements.unlocked.includes(achievement.id)) {
                return;
            }
            
            // Verificar condición
            if (this.checkAchievementCondition(achievement, playerData, progressType, additionalData)) {
                const result = this.unlockAchievement(playerData, achievement.id);
                if (result.success) {
                    newAchievements.push(result.achievement);
                }
            }
        });
        
        return newAchievements;
    }

    /**
     * 🔍 Verificar condición de logro
     */
    checkAchievementCondition(achievement, playerData, progressType, additionalData) {
        const condition = achievement.condition;
        const progress = playerData.achievements.progress;
        
        switch (condition.type) {
            case 'battles_won':
            case 'battles_participated':
            case 'bosses_defeated':
            case 'regions_visited':
            case 'dungeons_completed':
            case 'treasures_found':
            case 'friends_added':
            case 'guilds_created':
            case 'players_helped':
            case 'community_events_participated':
            case 'items_collected':
            case 'unique_items_owned':
            case 'rare_items_owned':
            case 'legendary_items_owned':
            case 'items_crafted':
            case 'legendary_items_crafted':
            case 'study_sessions_completed':
            case 'exercise_sessions_completed':
            case 'creative_projects_completed':
            case 'secrets_found':
                return (progress[condition.type] || 0) >= condition.target;
            
            case 'level_reached':
                return (playerData.level || 1) >= condition.target;
            
            case 'daily_streak':
                return (playerData.dailyStreak || 0) >= condition.target;
            
            case 'win_streak':
                return (progress.current_win_streak || 0) >= condition.target;
            
            case 'all_regions_visited':
                const visitedRegions = progress.visited_regions || [];
                return visitedRegions.length >= condition.target;
            
            case 'perfect_stats':
                const stats = ['attack', 'defense', 'speed', 'magic', 'luck'];
                return stats.every(stat => (playerData[stat] || 0) >= condition.target);
            
            case 'special_flag':
                return playerData.specialFlags?.[condition.flag] === true;
            
            case 'event_participation':
                return additionalData.eventId === condition.event;
            
            default:
                return false;
        }
    }

    /**
     * 🔓 Desbloquear logro
     */
    unlockAchievement(playerData, achievementId) {
        const achievement = this.achievementDatabase[achievementId];
        if (!achievement) {
            return { success: false, reason: 'achievement_not_found' };
        }
        
        const achievements = this.initializePlayerProgress(playerData);
        
        // Verificar si ya está desbloqueado
        if (achievements.unlocked.includes(achievementId)) {
            return { success: false, reason: 'already_unlocked' };
        }
        
        // Desbloquear logro
        achievements.unlocked.push(achievementId);
        
        // Actualizar estadísticas
        achievements.stats.totalAchievements++;
        achievements.stats[achievement.rarity + 'Achievements']++;
        
        // Calcular puntos de logro
        const rarity = this.achievementRarity[achievement.rarity];
        const points = Math.floor(100 * rarity.multiplier);
        achievements.stats.achievementPoints += points;
        
        // Otorgar recompensas
        const rewards = this.grantAchievementRewards(playerData, achievement);
        
        // Desbloquear título si corresponde
        if (achievement.rewards.title) {
            this.unlockTitle(playerData, achievement.rewards.title);
        }
        
        console.log(`🏆 ${playerData.username} desbloqueó: ${achievement.name}`);
        
        return {
            success: true,
            achievement: {
                ...achievement,
                unlockedAt: Date.now(),
                points
            },
            rewards
        };
    }

    /**
     * 🎁 Otorgar recompensas de logro
     */
    grantAchievementRewards(playerData, achievement) {
        const rewards = achievement.rewards;
        const grantedRewards = [];
        
        // Experiencia
        if (rewards.exp) {
            const expResult = progressionSystem.awardExperience(playerData, 'achievement', rewards.exp);
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
        
        // Bonos permanentes
        if (rewards.permanent_bonus) {
            this.applyPermanentBonus(playerData, rewards.permanent_bonus);
            grantedRewards.push({ type: 'permanent_bonus', bonus: rewards.permanent_bonus });
        }
        
        return grantedRewards;
    }

    /**
     * 👑 Desbloquear título
     */
    unlockTitle(playerData, titleName) {
        const achievements = this.initializePlayerProgress(playerData);
        
        if (!achievements.titles.includes(titleName)) {
            achievements.titles.push(titleName);
            
            // Si es el primer título, activarlo automáticamente
            if (!achievements.activeTitle) {
                achievements.activeTitle = titleName;
            }
            
            console.log(`👑 ${playerData.username} desbloqueó el título: ${titleName}`);
            return true;
        }
        
        return false;
    }

    /**
     * 🔄 Cambiar título activo
     */
    setActiveTitle(playerData, titleName) {
        const achievements = this.initializePlayerProgress(playerData);
        
        if (titleName === null) {
            achievements.activeTitle = null;
            return { success: true, title: null };
        }
        
        if (!achievements.titles.includes(titleName)) {
            return { success: false, reason: 'title_not_unlocked' };
        }
        
        const title = this.titleDatabase[titleName];
        if (!title) {
            return { success: false, reason: 'title_not_found' };
        }
        
        achievements.activeTitle = titleName;
        
        console.log(`👑 ${playerData.username} activó el título: ${titleName}`);
        
        return { success: true, title };
    }

    /**
     * 📊 Obtener estadísticas de logros
     */
    getAchievementStats(playerData) {
        const achievements = this.initializePlayerProgress(playerData);
        const totalAchievements = Object.keys(this.achievementDatabase).length;
        
        return {
            ...achievements.stats,
            completionPercentage: (achievements.stats.totalAchievements / totalAchievements) * 100,
            totalAvailable: totalAchievements,
            activeTitle: achievements.activeTitle,
            availableTitles: achievements.titles.length
        };
    }

    /**
     * 📋 Obtener logros del jugador
     */
    getPlayerAchievements(playerData, filter = 'all') {
        const achievements = this.initializePlayerProgress(playerData);
        
        let achievementList = Object.values(this.achievementDatabase);
        
        // Filtrar por tipo
        if (filter !== 'all') {
            achievementList = achievementList.filter(achievement => achievement.type === filter);
        }
        
        return achievementList.map(achievement => {
            const isUnlocked = achievements.unlocked.includes(achievement.id);
            const progress = this.getAchievementProgress(playerData, achievement);
            
            return {
                ...achievement,
                unlocked: isUnlocked,
                progress: progress.current,
                target: progress.target,
                percentage: progress.percentage,
                hidden: achievement.hidden && !isUnlocked
            };
        });
    }

    /**
     * 📈 Obtener progreso de logro específico
     */
    getAchievementProgress(playerData, achievement) {
        const condition = achievement.condition;
        const progress = playerData.achievements?.progress || {};
        
        let current = 0;
        let target = condition.target || 1;
        
        switch (condition.type) {
            case 'level_reached':
                current = playerData.level || 1;
                break;
            case 'daily_streak':
                current = playerData.dailyStreak || 0;
                break;
            case 'all_regions_visited':
                current = (progress.visited_regions || []).length;
                break;
            case 'perfect_stats':
                const stats = ['attack', 'defense', 'speed', 'magic', 'luck'];
                current = Math.min(...stats.map(stat => playerData[stat] || 0));
                break;
            default:
                current = progress[condition.type] || 0;
        }
        
        const percentage = Math.min(100, (current / target) * 100);
        
        return { current, target, percentage };
    }

    /**
     * 💪 Aplicar bonus permanente
     */
    applyPermanentBonus(playerData, bonus) {
        if (!playerData.permanentBonuses) {
            playerData.permanentBonuses = {};
        }
        
        Object.keys(bonus).forEach(stat => {
            if (stat === 'all_stats') {
                ['attack', 'defense', 'speed', 'magic', 'luck'].forEach(s => {
                    playerData.permanentBonuses[s] = (playerData.permanentBonuses[s] || 0) + bonus[stat];
                });
            } else {
                playerData.permanentBonuses[stat] = (playerData.permanentBonuses[stat] || 0) + bonus[stat];
            }
        });
    }

    /**
     * 👑 Obtener efectos del título activo
     */
    getActiveTitleEffects(playerData) {
        const achievements = playerData.achievements;
        if (!achievements?.activeTitle) {
            return {};
        }
        
        const title = this.titleDatabase[achievements.activeTitle];
        return title?.effects || {};
    }

    /**
     * 🎨 Generar embed de logro desbloqueado
     */
    generateAchievementUnlockedEmbed(achievement, rewards) {
        const rarity = this.achievementRarity[achievement.rarity];
        const type = this.achievementTypes[achievement.type];
        
        const embed = new PassQuirkEmbed()
            .setTitle(`🏆 ¡Logro Desbloqueado!`)
            .setDescription(`**${rarity.emoji} ${achievement.name}**\n${achievement.description}`)
            .setColor(rarity.color)
            .addField('📊 Tipo', `${type.emoji} ${type.name}`, true)
            .addField('⭐ Rareza', `${rarity.emoji} ${rarity.name}`, true)
            .addField('🎯 Puntos', `${Math.floor(100 * rarity.multiplier)}`, true);
        
        // Recompensas
        if (rewards.length > 0) {
            const rewardText = rewards.map(reward => {
                switch (reward.type) {
                    case 'exp':
                        return `📈 ${reward.amount} EXP`;
                    case 'coins':
                        return `💰 ${reward.amount} Coins`;
                    case 'item':
                        return `📦 ${reward.item.name} x${reward.quantity}`;
                    case 'permanent_bonus':
                        return `💪 Bonus Permanente`;
                    default:
                        return `🎁 ${reward.type}`;
                }
            }).join('\n');
            
            embed.addField('🎁 Recompensas', rewardText, false);
        }
        
        return embed;
    }

    /**
     * 🎨 Generar embed de lista de logros
     */
    generateAchievementListEmbed(playerData, filter = 'all', page = 1) {
        const achievements = this.getPlayerAchievements(playerData, filter);
        const stats = this.getAchievementStats(playerData);
        
        const itemsPerPage = 10;
        const totalPages = Math.ceil(achievements.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageAchievements = achievements.slice(startIndex, endIndex);
        
        const embed = new PassQuirkEmbed()
            .setTitle('🏆 Logros')
            .setDescription(`Progreso: ${stats.totalAchievements}/${stats.totalAvailable} (${stats.completionPercentage.toFixed(1)}%)\nPuntos: ${stats.achievementPoints}`);
        
        if (filter !== 'all') {
            const type = this.achievementTypes[filter];
            embed.setTitle(`🏆 Logros - ${type.emoji} ${type.name}`);
        }
        
        pageAchievements.forEach(achievement => {
            if (achievement.hidden) return;
            
            const rarity = this.achievementRarity[achievement.rarity];
            const status = achievement.unlocked ? '✅' : '⏳';
            const progressText = achievement.unlocked ? 
                'Completado' : 
                `${achievement.progress}/${achievement.target} (${achievement.percentage.toFixed(1)}%)`;
            
            embed.addField(
                `${status} ${rarity.emoji} ${achievement.name}`,
                `${achievement.description}\n**Progreso:** ${progressText}`,
                false
            );
        });
        
        if (totalPages > 1) {
            embed.setFooter(`Página ${page}/${totalPages}`);
        }
        
        return embed;
    }

    /**
     * 🎨 Generar embed de títulos
     */
    generateTitleListEmbed(playerData) {
        const achievements = this.initializePlayerProgress(playerData);
        const availableTitles = achievements.titles;
        
        const embed = new PassQuirkEmbed()
            .setTitle('👑 Títulos')
            .setDescription(`Títulos desbloqueados: ${availableTitles.length}`);
        
        if (achievements.activeTitle) {
            const activeTitle = this.titleDatabase[achievements.activeTitle];
            embed.addField('👑 Título Activo', 
                `**${activeTitle.name}**\n${activeTitle.description}`,
                false
            );
        }
        
        if (availableTitles.length === 0) {
            embed.addField('📭 Sin títulos', 'Desbloquea logros para obtener títulos.');
        } else {
            availableTitles.forEach(titleName => {
                const title = this.titleDatabase[titleName];
                if (title) {
                    const rarity = this.achievementRarity[title.rarity];
                    const isActive = achievements.activeTitle === titleName;
                    const status = isActive ? '👑' : '⭐';
                    
                    embed.addField(
                        `${status} ${rarity.emoji} ${title.name}`,
                        title.description,
                        true
                    );
                }
            });
        }
        
        return embed;
    }
}

// Crear instancia singleton del sistema de logros
const achievementSystem = new AchievementSystem();

module.exports = {
    AchievementSystem,
    achievementSystem,
    ACHIEVEMENT_DATABASE,
    TITLE_DATABASE,
    ACHIEVEMENT_TYPES,
    ACHIEVEMENT_RARITY
};