// Game Classes and their initial stats/skills
const CLASSES = {
    Guerrero: {
        name: 'Guerrero',
        description: 'Un luchador cuerpo a cuerpo especializado en defensa y daño físico',
        emoji: '⚔️',
        baseStats: {
            strength: 15,
            dexterity: 8,
            intelligence: 5,
            constitution: 15,
            luck: 7,
            speed: 8
        },
        startingSkills: ['slash', 'defend', 'power_strike'],
        passive: {
            name: 'Voluntad de Hierro',
            description: '+10% HP y +15% Defensa'
        }
    },
    Mago: {
        name: 'Mago',
        description: 'Maestro de las artes arcanas con poderosos hechizos mágicos',
        emoji: '🔮',
        baseStats: {
            strength: 5,
            dexterity: 7,
            intelligence: 18,
            constitution: 8,
            luck: 10,
            speed: 10
        },
        startingSkills: ['fireball', 'magic_shield', 'mana_burst'],
        passive: {
            name: 'Maestría Arcana',
            description: '+20% Poder Mágico y +10% Maná'
        }
    },
    Arquero: {
        name: 'Arquero',
        description: 'Experto en ataques a distancia con alta precisión',
        emoji: '🏹',
        baseStats: {
            strength: 10,
            dexterity: 18,
            intelligence: 8,
            constitution: 10,
            luck: 12,
            speed: 12
        },
        startingSkills: ['quick_shot', 'aimed_shot', 'arrow_rain'],
        passive: {
            name: 'Ojo de Águila',
            description: '+15% Precisión y +10% Crítico'
        }
    },
    Ladrón: {
        name: 'Ladrón',
        description: 'Ágil y sigiloso, especializado en ataques críticos',
        emoji: '🗡️',
        baseStats: {
            strength: 8,
            dexterity: 16,
            intelligence: 10,
            constitution: 9,
            luck: 16,
            speed: 15
        },
        startingSkills: ['backstab', 'evade', 'steal'],
        passive: {
            name: 'Golpe Crítico',
            description: '+20% Probabilidad Crítica y +25% Daño Crítico'
        }
    },
    Ninja: {
        name: 'Ninja',
        description: 'Maestro de las sombras con gran velocidad y técnicas letales',
        emoji: '🥷',
        baseStats: {
            strength: 12,
            dexterity: 15,
            intelligence: 12,
            constitution: 10,
            luck: 13,
            speed: 18
        },
        startingSkills: ['shadow_strike', 'smoke_bomb', 'shuriken'],
        passive: {
            name: 'Velocidad Sombría',
            description: '+25% Velocidad y +15% Evasión'
        }
    }
};

// Skills Database
const SKILLS = {
    // Guerrero Skills
    slash: {
        skillId: 'slash',
        name: 'Tajo',
        description: 'Un corte poderoso con tu arma',
        type: 'physical',
        element: null,
        power: 1.2,
        accuracy: 95,
        manaCost: 5,
        actionPoints: 2,
        cooldown: 0,
        class: ['Guerrero']
    },
    defend: {
        skillId: 'defend',
        name: 'Defender',
        description: 'Adopta una postura defensiva, reduciendo el daño recibido',
        type: 'status',
        element: null,
        power: 0,
        accuracy: 100,
        manaCost: 0,
        actionPoints: 1,
        cooldown: 0,
        effects: [{ type: 'defense_boost', value: 50, duration: 1 }],
        class: ['Guerrero']
    },
    power_strike: {
        skillId: 'power_strike',
        name: 'Golpe Poderoso',
        description: 'Un ataque devastador que causa gran daño',
        type: 'physical',
        element: null,
        power: 2.0,
        accuracy: 85,
        manaCost: 15,
        actionPoints: 3,
        cooldown: 2,
        class: ['Guerrero']
    },

    // Mago Skills
    fireball: {
        skillId: 'fireball',
        name: 'Bola de Fuego',
        description: 'Lanza una bola de fuego ardiente',
        type: 'magical',
        element: 'fire',
        power: 1.5,
        accuracy: 90,
        manaCost: 20,
        actionPoints: 2,
        cooldown: 0,
        class: ['Mago']
    },
    magic_shield: {
        skillId: 'magic_shield',
        name: 'Escudo Mágico',
        description: 'Crea un escudo protector de energía mágica',
        type: 'status',
        element: null,
        power: 0,
        accuracy: 100,
        manaCost: 15,
        actionPoints: 2,
        cooldown: 3,
        effects: [{ type: 'magic_defense_boost', value: 40, duration: 3 }],
        class: ['Mago']
    },
    mana_burst: {
        skillId: 'mana_burst',
        name: 'Explosión de Maná',
        description: 'Libera toda tu energía mágica en una explosión devastadora',
        type: 'magical',
        element: 'arcane',
        power: 2.5,
        accuracy: 85,
        manaCost: 40,
        actionPoints: 4,
        cooldown: 4,
        class: ['Mago']
    },

    // Arquero Skills
    quick_shot: {
        skillId: 'quick_shot',
        name: 'Disparo Rápido',
        description: 'Un disparo veloz y preciso',
        type: 'physical',
        element: null,
        power: 1.0,
        accuracy: 98,
        manaCost: 5,
        actionPoints: 1,
        cooldown: 0,
        class: ['Arquero']
    },
    aimed_shot: {
        skillId: 'aimed_shot',
        name: 'Disparo Certero',
        description: 'Un disparo cuidadosamente apuntado con alta probabilidad de crítico',
        type: 'physical',
        element: null,
        power: 1.5,
        accuracy: 95,
        manaCost: 15,
        actionPoints: 3,
        cooldown: 1,
        critBonus: 30,
        class: ['Arquero']
    },
    arrow_rain: {
        skillId: 'arrow_rain',
        name: 'Lluvia de Flechas',
        description: 'Dispara múltiples flechas que caen sobre todos los enemigos',
        type: 'physical',
        element: null,
        power: 0.8,
        accuracy: 90,
        manaCost: 25,
        actionPoints: 4,
        cooldown: 3,
        target: 'all_enemies',
        class: ['Arquero']
    },

    // Ladrón Skills
    backstab: {
        skillId: 'backstab',
        name: 'Apuñalar',
        description: 'Un ataque furtivo con alta probabilidad de crítico',
        type: 'physical',
        element: 'dark',
        power: 1.8,
        accuracy: 85,
        manaCost: 15,
        actionPoints: 3,
        cooldown: 1,
        critBonus: 40,
        class: ['Ladrón']
    },
    evade: {
        skillId: 'evade',
        name: 'Evadir',
        description: 'Aumenta tu evasión temporalmente',
        type: 'status',
        element: null,
        power: 0,
        accuracy: 100,
        manaCost: 10,
        actionPoints: 1,
        cooldown: 2,
        effects: [{ type: 'evasion_boost', value: 50, duration: 2 }],
        class: ['Ladrón']
    },
    steal: {
        skillId: 'steal',
        name: 'Robar',
        description: 'Intenta robar un objeto del enemigo',
        type: 'status',
        element: null,
        power: 0,
        accuracy: 70,
        manaCost: 10,
        actionPoints: 2,
        cooldown: 3,
        class: ['Ladrón']
    },

    // Ninja Skills
    shadow_strike: {
        skillId: 'shadow_strike',
        name: 'Golpe Sombrío',
        description: 'Ataca desde las sombras con velocidad sobrenatural',
        type: 'physical',
        element: 'dark',
        power: 1.6,
        accuracy: 95,
        manaCost: 15,
        actionPoints: 2,
        cooldown: 0,
        class: ['Ninja']
    },
    smoke_bomb: {
        skillId: 'smoke_bomb',
        name: 'Bomba de Humo',
        description: 'Lanza una bomba de humo que reduce la precisión de los enemigos',
        type: 'status',
        element: null,
        power: 0,
        accuracy: 100,
        manaCost: 20,
        actionPoints: 2,
        cooldown: 3,
        effects: [{ type: 'accuracy_debuff', value: -30, duration: 2, target: 'all_enemies' }],
        class: ['Ninja']
    },
    shuriken: {
        skillId: 'shuriken',
        name: 'Shuriken',
        description: 'Lanza múltiples shurikens rápidos',
        type: 'physical',
        element: null,
        power: 0.6,
        accuracy: 90,
        manaCost: 10,
        actionPoints: 2,
        cooldown: 1,
        hits: 3,
        class: ['Ninja']
    }
};

// Enemy Database
const ENEMIES = {
    slime: {
        enemyId: 'slime',
        name: 'Slime',
        description: 'Una criatura gelatinosa débil',
        level: 1,
        type: 'normal',
        element: 'water',
        emoji: '🟢',
        stats: {
            maxHp: 30,
            attack: 5,
            defense: 3,
            magicPower: 2,
            magicDefense: 5,
            speed: 5,
            criticalChance: 2,
            evasion: 10
        },
        skills: ['tackle'],
        rewards: {
            expBase: 15,
            goldBase: 10,
            items: [
                { itemId: 'slime_gel', chance: 30 }
            ]
        }
    },
    goblin: {
        enemyId: 'goblin',
        name: 'Goblin',
        description: 'Un pequeño humanoide malvado',
        level: 3,
        type: 'normal',
        element: null,
        emoji: '👺',
        stats: {
            maxHp: 50,
            attack: 12,
            defense: 8,
            magicPower: 5,
            magicDefense: 6,
            speed: 15,
            criticalChance: 8,
            evasion: 15
        },
        skills: ['scratch', 'stone_throw'],
        rewards: {
            expBase: 35,
            goldBase: 25,
            items: [
                { itemId: 'goblin_ear', chance: 25 },
                { itemId: 'rusty_dagger', chance: 10 }
            ]
        }
    },
    wolf: {
        enemyId: 'wolf',
        name: 'Lobo',
        description: 'Un lobo salvaje y feroz',
        level: 5,
        type: 'normal',
        element: null,
        emoji: '🐺',
        stats: {
            maxHp: 80,
            attack: 18,
            defense: 10,
            magicPower: 5,
            magicDefense: 8,
            speed: 25,
            criticalChance: 12,
            evasion: 20
        },
        skills: ['bite', 'howl'],
        rewards: {
            expBase: 60,
            goldBase: 40,
            items: [
                { itemId: 'wolf_fang', chance: 35 },
                { itemId: 'wolf_pelt', chance: 20 }
            ]
        }
    },
    skeleton: {
        enemyId: 'skeleton',
        name: 'Esqueleto',
        description: 'Un guerrero no-muerto',
        level: 7,
        type: 'undead',
        element: 'dark',
        emoji: '💀',
        stats: {
            maxHp: 100,
            attack: 22,
            defense: 15,
            magicPower: 8,
            magicDefense: 12,
            speed: 18,
            criticalChance: 10,
            evasion: 15
        },
        skills: ['bone_strike', 'dark_aura'],
        rewards: {
            expBase: 95,
            goldBase: 60,
            items: [
                { itemId: 'bone_fragment', chance: 40 },
                { itemId: 'rusty_sword', chance: 15 }
            ]
        }
    },
    orc: {
        enemyId: 'orc',
        name: 'Orco',
        description: 'Un brutal guerrero verde',
        level: 10,
        type: 'normal',
        element: null,
        emoji: '👹',
        stats: {
            maxHp: 150,
            attack: 30,
            defense: 20,
            magicPower: 10,
            magicDefense: 15,
            speed: 15,
            criticalChance: 15,
            evasion: 10
        },
        skills: ['heavy_strike', 'war_cry'],
        rewards: {
            expBase: 140,
            goldBase: 90,
            items: [
                { itemId: 'orc_tusk', chance: 30 },
                { itemId: 'iron_axe', chance: 12 }
            ]
        }
    },
    dragon: {
        enemyId: 'dragon',
        name: 'Dragón',
        description: 'Una poderosa bestia legendaria',
        level: 25,
        type: 'boss',
        element: 'fire',
        emoji: '🐉',
        stats: {
            maxHp: 500,
            attack: 60,
            defense: 40,
            magicPower: 70,
            magicDefense: 50,
            speed: 30,
            criticalChance: 20,
            evasion: 15
        },
        skills: ['fire_breath', 'tail_swipe', 'dragon_roar'],
        rewards: {
            expBase: 1000,
            goldBase: 500,
            items: [
                { itemId: 'dragon_scale', chance: 80 },
                { itemId: 'dragon_heart', chance: 40 },
                { itemId: 'legendary_sword', chance: 15 }
            ]
        }
    }
};

// Starter Items
const STARTER_ITEMS = {
    Guerrero: ['wooden_sword', 'leather_armor', 'health_potion'],
    Mago: ['wooden_staff', 'cloth_robe', 'mana_potion'],
    Arquero: ['wooden_bow', 'leather_vest', 'health_potion'],
    Ladrón: ['rusty_dagger', 'leather_armor', 'health_potion'],
    Ninja: ['kunai', 'ninja_gi', 'smoke_bomb_item']
};

// Regions
const REGIONS = {
    'Reino de Akai': {
        name: 'Reino de Akai',
        description: 'Tierras volcánicas donde los guerreros forjan su destino',
        emoji: '🔴',
        theme: 'fire',
        recommendedLevel: [1, 15],
        enemies: ['slime', 'goblin', 'wolf'],
        zones: ['Ciudad Inicial', 'Bosque de Entrenamiento', 'Montaña Volcánica']
    },
    'Reino de Say': {
        name: 'Reino de Say',
        description: 'Bosques encantados llenos de magia y misterio',
        emoji: '🟢',
        theme: 'nature',
        recommendedLevel: [10, 25],
        enemies: ['goblin', 'skeleton', 'orc'],
        zones: ['Biblioteca Arcana', 'Bosque Místico', 'Torre de Hechicería']
    },
    'Reino de Masai': {
        name: 'Reino de Masai',
        description: 'Desiertos dorados y ciudades bulliciosas',
        emoji: '🟡',
        theme: 'desert',
        recommendedLevel: [15, 30],
        enemies: ['orc', 'skeleton', 'dragon'],
        zones: ['Mercado Central', 'Desierto Sin Fin', 'Ruinas Antiguas']
    }
};

module.exports = {
    CLASSES,
    SKILLS,
    ENEMIES,
    STARTER_ITEMS,
    REGIONS
};
