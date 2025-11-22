// 📊 DATOS OFICIALES PASSQUIRK - Información del sistema RPG

/**
 * Clases disponibles en PassQuirk RPG (Oficiales según documentación)
 */
const CLASSES = {
    celestial: {
        name: 'Celestial',
        description: 'Ser de luz con habilidades curativas y ataques sagrados de área',
        emoji: '🪽',
        philosophy: 'La luz sagrada guía mi camino',
        stats: {
            hp: 100,
            mp: 120,
            attack: 10,
            defense: 12,
            speed: 11,
            intelligence: 15,
            wisdom: 16,
            resistance: 15
        },
        skills: ['Divine Healing', 'Sacred Light', 'Purification'],
        compatiblePassQuirks: ['Fénix', 'Agua', 'Vacío', 'Caos', 'Luz']
    },
    fenix: {
        name: 'Fénix',
        description: 'Renace tras ser derrotado; domina el fuego y el resurgir explosivo',
        emoji: '🔥',
        philosophy: 'De las cenizas renazco más fuerte',
        stats: {
            hp: 130,
            mp: 90,
            attack: 16,
            defense: 14,
            speed: 12,
            resistance: 16
        },
        skills: ['Phoenix Rebirth', 'Flame Mastery', 'Explosive Revival'],
        compatiblePassQuirks: ['Fénix', 'Trueno', 'Dragón', 'Caos', 'Luz']
    },
    berserker: {
        name: 'Berserker',
        description: 'Guerrero desatado con fuerza bruta creciente cuanto más daño recibe',
        emoji: '⚔️',
        philosophy: 'La furia es mi fuerza',
        stats: {
            hp: 140,
            mp: 50,
            attack: 17,
            defense: 14,
            speed: 10,
            strength: 16
        },
        skills: ['Berserker Rage', 'Unstoppable Force', 'Blood Frenzy'],
        compatiblePassQuirks: ['Tierra', 'Bestia', 'Caos', 'Luz']
    },
    inmortal: {
        name: 'Inmortal',
        description: 'No puede morir fácilmente; regenera y resiste efectos mortales',
        emoji: '☠️',
        philosophy: 'La muerte es solo una ilusión',
        stats: {
            hp: 160,
            mp: 70,
            attack: 12,
            defense: 17,
            speed: 8,
            resistance: 17,
            vitality: 16
        },
        skills: ['Immortal Body', 'Death Resistance', 'Eternal Endurance'],
        compatiblePassQuirks: ['Tierra', 'Dragón', 'Agua', 'Caos', 'Luz']
    },
    demon: {
        name: 'Demon',
        description: 'Poder oscuro, drenaje de vida y habilidades infernales',
        emoji: '👹',
        philosophy: 'El poder oscuro fluye en mis venas',
        stats: {
            hp: 110,
            mp: 100,
            attack: 16,
            defense: 10,
            speed: 13,
            intelligence: 16,
            magic: 15
        },
        skills: ['Life Drain', 'Dark Magic', 'Infernal Power'],
        compatiblePassQuirks: ['Vendaval', 'Oscuridad', 'Bestia', 'Vacío', 'Caos', 'Luz']
    },
    sombra: {
        name: 'Sombra',
        description: 'Ninja silencioso y letal; experto en clones, humo y ataques críticos',
        emoji: '⚔️🌀',
        philosophy: 'Las sombras son mis aliadas',
        stats: {
            hp: 95,
            mp: 80,
            attack: 15,
            defense: 9,
            speed: 17,
            dexterity: 16,
            luck: 16
        },
        skills: ['Shadow Clone', 'Stealth Master', 'Critical Strike'],
        compatiblePassQuirks: ['Vendaval', 'Oscuridad', 'Trueno', 'Caos', 'Luz']
    }
};

/**
 * PassQuirks Oficiales - Habilidades especiales únicas
 */
const PASSQUIRKS = {
    fenix: {
        name: 'Fénix',
        element: 'Fuego',
        description: 'El poder del ave inmortal que renace de sus cenizas',
        emoji: '🔥',
        rarity: 'Legendario',
        compatibleClasses: ['Celestial', 'Fénix', 'Berserker'],
        abilities: ['Regeneración de fuego', 'Renacimiento', 'Llamas eternas']
    },
    vendaval: {
        name: 'Vendaval',
        element: 'Viento',
        description: 'Control sobre los vientos y tormentas',
        emoji: '🌪️',
        rarity: 'Épico',
        compatibleClasses: ['Demon', 'Sombra'],
        abilities: ['Velocidad extrema', 'Control del viento', 'Tormenta']
    },
    tierra: {
        name: 'Tierra',
        element: 'Tierra',
        description: 'Dominio sobre la tierra y las rocas',
        emoji: '🌍',
        rarity: 'Épico',
        compatibleClasses: ['Berserker', 'Inmortal'],
        abilities: ['Control masivo de rocas', 'Defensa de tierra', 'Terremoto']
    },
    oscuridad: {
        name: 'Oscuridad',
        element: 'Sombra',
        description: 'Manipulación de las sombras y la oscuridad',
        emoji: '🌑',
        rarity: 'Épico',
        compatibleClasses: ['Demon', 'Sombra'],
        abilities: ['Absorbe luz', 'Invisibilidad', 'Ataques sombríos']
    },
    bestia: {
        name: 'Bestia',
        element: 'Naturaleza',
        description: 'Conexión con los instintos animales primitivos',
        emoji: '🐺',
        rarity: 'Épico',
        compatibleClasses: ['Berserker', 'Demon'],
        abilities: ['Fuerza extrema', 'Instintos animales', 'Resistencia física']
    },
    trueno: {
        name: 'Trueno',
        element: 'Eléctrico',
        description: 'Control sobre rayos y electricidad',
        emoji: '⚡',
        rarity: 'Épico',
        compatibleClasses: ['Fénix', 'Sombra'],
        abilities: ['Control de rayos', 'Velocidad mejorada', 'Descarga eléctrica']
    },
    dragon: {
        name: 'Dragón',
        element: 'Mítico',
        description: 'El poder ancestral de los dragones',
        emoji: '🐉',
        rarity: 'Legendario',
        compatibleClasses: ['Fénix', 'Inmortal'],
        abilities: ['Fuerza dracónica', 'Defensa dracónica', 'Aliento de dragón']
    },
    agua: {
        name: 'Agua',
        element: 'Agua',
        description: 'Fluidez y adaptabilidad del agua',
        emoji: '💧',
        rarity: 'Épico',
        compatibleClasses: ['Celestial', 'Inmortal'],
        abilities: ['Control de agua', 'Curación de aliados', 'Adaptabilidad']
    },
    vacio: {
        name: 'Vacío',
        element: 'Cósmico',
        description: 'Manipulación del espacio y la nada',
        emoji: '🌌',
        rarity: 'Legendario',
        compatibleClasses: ['Celestial', 'Demon'],
        abilities: ['Control gravitacional', 'Manipulación del espacio', 'Teletransporte']
    },
    caos: {
        name: 'Caos',
        element: 'Universal',
        description: 'Poder impredecible que trasciende las reglas',
        emoji: '🌀',
        rarity: 'Mítico',
        compatibleClasses: ['Todas las clases'],
        abilities: ['Poder inestable', 'Efectos aleatorios', 'Destrucción masiva']
    },
    luz: {
        name: 'Luz',
        element: 'Universal',
        description: 'Energía pura de la creación y la esperanza',
        emoji: '✨',
        rarity: 'Mítico',
        compatibleClasses: ['Todas las clases'],
        abilities: ['Energía pura', 'Creación', 'Esperanza infinita']
    }
};

/**
 * Quirks adicionales por categoría
 */
const QUIRKS = {
    // Quirks de Combate
    critical_strike: {
        name: 'Golpe Crítico',
        type: 'combat',
        description: 'Posibilidad de hacer daño crítico devastador',
        emoji: '💥',
        rarity: 'Común',
        effect: 'critical_chance'
    },
    elemental_mastery: {
        name: 'Maestría Elemental',
        type: 'combat',
        description: 'Dominio sobre elementos específicos',
        emoji: '🔥',
        rarity: 'Raro',
        effect: 'elemental_boost'
    },
    berserker_mode: {
        name: 'Modo Berserker',
        type: 'combat',
        description: 'Furia descontrolada que aumenta el poder',
        emoji: '😡',
        rarity: 'Épico',
        effect: 'rage_boost'
    },
    
    // Quirks de Economía
    golden_touch: {
        name: 'Toque Dorado',
        type: 'economy',
        description: 'Aumenta las ganancias de monedas',
        emoji: '💰',
        rarity: 'Raro',
        effect: 'coin_boost'
    },
    merchants_eye: {
        name: 'Ojo de Comerciante',
        type: 'economy',
        description: 'Detecta mejores ofertas y precios',
        emoji: '👁️',
        rarity: 'Común',
        effect: 'shop_discount'
    },
    resource_finder: {
        name: 'Buscador de Recursos',
        type: 'economy',
        description: 'Encuentra recursos raros más fácilmente',
        emoji: '⛏️',
        rarity: 'Épico',
        effect: 'resource_boost'
    },
    
    // Quirks de Progresión
    fast_learner: {
        name: 'Aprendiz Rápido',
        type: 'progression',
        description: 'Gana experiencia adicional',
        emoji: '📚',
        rarity: 'Común',
        effect: 'exp_boost'
    },
    skill_hoarder: {
        name: 'Acumulador de Habilidades',
        type: 'progression',
        description: 'Aprende habilidades más rápido',
        emoji: '🎯',
        rarity: 'Raro',
        effect: 'skill_boost'
    },
    experience_boost: {
        name: 'Impulso de Experiencia',
        type: 'progression',
        description: 'Multiplica la experiencia ganada',
        emoji: '⭐',
        rarity: 'Épico',
        effect: 'exp_multiplier'
    }
};

/**
 * Zonas del mundo PassQuirk
 */
const WORLD_ZONES = {
    akai_kingdom: {
        name: 'Reino de Akai',
        description: 'La capital del mundo PassQuirk',
        emoji: '🏰',
        level_range: [1, 10],
        enemies: ['Slime', 'Goblin', 'Lobo'],
        resources: ['Hierro', 'Madera', 'Piedra']
    },
    mystic_forest: {
        name: 'Bosque Místico',
        description: 'Un bosque lleno de magia y misterio',
        emoji: '🌲',
        level_range: [8, 20],
        enemies: ['Ent', 'Hada Oscura', 'Araña Gigante'],
        resources: ['Hierbas Mágicas', 'Cristales', 'Madera Élfica']
    },
    desert_ruins: {
        name: 'Ruinas del Desierto',
        description: 'Antiguas ruinas llenas de tesoros',
        emoji: '🏜️',
        level_range: [15, 30],
        enemies: ['Momia', 'Escorpión Gigante', 'Guardián de Arena'],
        resources: ['Oro', 'Gemas', 'Pergaminos Antiguos']
    },
    ice_mountains: {
        name: 'Montañas Heladas',
        description: 'Picos nevados con criaturas peligrosas',
        emoji: '🏔️',
        level_range: [25, 40],
        enemies: ['Yeti', 'Dragón de Hielo', 'Lobo Ártico'],
        resources: ['Hielo Eterno', 'Mithril', 'Pieles Árticas']
    }
};

/**
 * Actividades de la vida real que otorgan experiencia
 */
const REAL_LIFE_ACTIVITIES = {
    study: {
        name: 'Estudiar',
        emoji: '📚',
        base_exp: 50,
        base_coins: 25,
        cooldown: 3600000, // 1 hora
        description: 'Estudia para ganar experiencia y conocimiento'
    },
    exercise: {
        name: 'Ejercitarse',
        emoji: '💪',
        base_exp: 40,
        base_coins: 20,
        cooldown: 7200000, // 2 horas
        description: 'Mantente en forma y gana resistencia'
    },
    work: {
        name: 'Trabajar',
        emoji: '💼',
        base_exp: 60,
        base_coins: 50,
        cooldown: 14400000, // 4 horas
        description: 'Trabaja para ganar monedas y experiencia'
    },
    read: {
        name: 'Leer',
        emoji: '📖',
        base_exp: 30,
        base_coins: 15,
        cooldown: 1800000, // 30 minutos
        description: 'Lee para expandir tu mente'
    },
    meditate: {
        name: 'Meditar',
        emoji: '🧘',
        base_exp: 25,
        base_coins: 10,
        cooldown: 3600000, // 1 hora
        description: 'Medita para encontrar paz interior'
    }
};

/**
 * Sistema de niveles y experiencia
 */
const LEVEL_SYSTEM = {
    getRequiredExp: (level) => {
        return level * 100 + (level - 1) * 50;
    },
    getExpReward: (activity, level) => {
        const baseExp = REAL_LIFE_ACTIVITIES[activity]?.base_exp || 0;
        return Math.floor(baseExp * (1 + level * 0.1));
    },
    getCoinReward: (activity, level) => {
        const baseCoins = REAL_LIFE_ACTIVITIES[activity]?.base_coins || 0;
        return Math.floor(baseCoins * (1 + level * 0.05));
    }
};

/**
 * Configuración del juego
 */
const GAME_CONFIG = {
    MAX_LEVEL: 100,
    STARTING_COINS: 1000,
    STARTING_GEMS: 10,
    DAILY_REWARD_COINS: 100,
    DAILY_REWARD_GEMS: 5,
    COMBAT_COOLDOWN: 300000, // 5 minutos
    EXPLORATION_COOLDOWN: 600000 // 10 minutos
};

/**
 * Sistema de rareza de quirks
 */
const QUIRK_RARITY = {
    common: {
        name: 'Común',
        color: '#95a5a6',
        chance: 60,
        emoji: '⚪',
        description: 'Quirks básicos disponibles para todos'
    },
    rare: {
        name: 'Raro',
        color: '#3498db',
        chance: 25,
        emoji: '🔵',
        description: 'Quirks poco comunes con efectos mejorados'
    },
    epic: {
        name: 'Épico',
        color: '#9b59b6',
        chance: 10,
        emoji: '🟣',
        description: 'Quirks poderosos con habilidades especiales'
    },
    legendary: {
        name: 'Legendario',
        color: '#f39c12',
        chance: 4,
        emoji: '🟠',
        description: 'Quirks extremadamente raros y poderosos'
    },
    mythic: {
        name: 'Mítico',
        color: '#e74c3c',
        chance: 1,
        emoji: '🔴',
        description: 'Los quirks más raros y poderosos del universo'
    }
};

module.exports = {
    CLASSES,
    PASSQUIRKS,
    QUIRKS,
    QUIRK_RARITY,
    WORLD_ZONES,
    REAL_LIFE_ACTIVITIES,
    LEVEL_SYSTEM,
    GAME_CONFIG
};