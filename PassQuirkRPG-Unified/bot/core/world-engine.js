// 🌍 WORLD ENGINE - Motor del Mundo PassQuirk RPG
// El corazón que hace latir todo el universo de PassQuirk
// ⚡ Actualizado con datos oficiales del repositorio GitHub

const { PassQuirkEmbed } = require('../utils/embedStyles');
const passquirkData = require('../data/passquirkData');

/**
 * 🎮 WorldEngine - El motor que controla toda la lógica del mundo RPG
 * Inspirado en los mejores sistemas de Solo Leveling y RPGs épicos
 * 🌟 DATOS OFICIALES: Integrado con documentación completa de PassQuirk RPG
 */
class WorldEngine {
    constructor() {
        this.regions = new Map();
        this.activeEvents = new Map();
        this.timeSystem = {
            dayNightCycle: 24, // minutos = 24 horas reales
            currentTime: new Date(),
            timeOfDay: 'day',
            weatherSystem: true
        };
        this.globalState = {
            serverTime: new Date(),
            activeSeasons: [],
            globalEvents: [],
            worldLevel: 1,
            activeDropEvents: [],
            explorationBonuses: new Map()
        };
        
        this.initializeWorld();
    }

    /**
     * 🏗️ Inicializa el mundo con todas las regiones y configuraciones
     */
    initializeWorld() {
        console.log('🌟 Inicializando el Mundo de PassQuirk...');
        
        // Cargar regiones del mundo
        this.loadRegions();
        
        // Inicializar eventos globales
        this.initializeGlobalEvents();
        
        // Configurar ciclos del mundo
        this.startWorldCycles();
        
        console.log('✨ Mundo de PassQuirk inicializado correctamente!');
    }

    /**
     * 🗺️ Carga todas las regiones del mundo - DATOS OFICIALES
     * <mcreference link="https://github.com/CioMaff/PassQuirk-RPG/blob/main/passquirkdoc/enemigos.md" index="0">0</mcreference>
     */
    loadRegions() {
        const regions = {
            akai: {
                id: 'akai',
                name: '🌸 Reino de Akai',
                description: 'Tierras pacíficas donde florecen los cerezos eternos y comienza toda aventura',
                levelRange: [1, 25],
                theme: 'japanese_peaceful',
                color: 0xff6b9d,
                emoji: '🌸',
                climate: 'temperate',
                enemies: {
                    fireImps: {
                        name: '🔥 Fire Imps',
                        emoji: '🔥',
                        level: '1-5',
                        rarity: 'común',
                        description: 'Pequeños demonios de fuego que saltan entre las llamas'
                    },
                    marketThieves: {
                        name: '🗡️ Market Thieves',
                        emoji: '🗡️',
                        level: '3-8',
                        rarity: 'común',
                        description: 'Ladrones que acechan en los mercados de Akai'
                    },
                    enchantedDeer: {
                        name: '🦌 Enchanted Deer',
                        emoji: '🦌',
                        level: '5-12',
                        rarity: 'raro',
                        description: 'Ciervos mágicos protegidos por espíritus ancestrales'
                    }
                },
                resources: ['cherry_blossoms', 'bamboo', 'spring_water', 'fire_essence'],
                npcs: ['Maestro Takeshi', 'Comerciante Yuki', 'Guardián Sakura'],
                specialFeatures: {
                    beginnerZone: {
                        description: 'Zona inicial perfecta para nuevos aventureros',
                        effect: 'tutorial_bonuses'
                    }
                }
            },
            
            say: {
                id: 'say',
                name: '🌊 Reino de Say',
                description: 'Reino acuático donde la magia fluye como ríos cristalinos',
                levelRange: [10, 30],
                theme: 'aquatic_magical',
                color: 0x4a90e2,
                emoji: '🌊',
                climate: 'humid',
                enemies: {
                    magicCats: {
                        name: '🐱 Magic Cats',
                        emoji: '🐱',
                        level: '8-15',
                        rarity: 'común',
                        description: 'Gatos mágicos que dominan pequeños hechizos'
                    },
                    waterElementals: {
                        name: '💧 Water Elementals',
                        emoji: '💧',
                        level: '12-20',
                        rarity: 'raro',
                        description: 'Espíritus del agua con poder curativo y destructivo'
                    },
                    giantElementalSnakes: {
                        name: '🐍 Giant Elemental Snakes',
                        emoji: '🐍',
                        level: '18-25',
                        rarity: 'épico',
                        description: 'Serpientes gigantes imbuidas con magia elemental'
                    }
                },
                resources: ['water_crystals', 'aquatic_herbs', 'pearl_essence'],
                npcs: ['Sirena Marina', 'Mago Acuático', 'Guardián de las Corrientes'],
                specialFeatures: {
                    tidalWaves: {
                        description: 'Mareas mágicas que potencian hechizos de agua',
                        effect: 'water_magic_boost'
                    }
                }
            },
            
            masai: {
                id: 'masai',
                name: '🏜️ Reino de Masai',
                description: 'Vastas tierras desérticas donde los guerreros forjan su destino',
                levelRange: [25, 50],
                theme: 'desert_warrior',
                color: 0xdaa520,
                emoji: '🏜️',
                climate: 'arid',
                enemies: {
                    desertScorpions: {
                        name: '🦂 Desert Scorpions',
                        emoji: '🦂',
                        level: '20-30',
                        rarity: 'común',
                        description: 'Escorpiones del desierto con veneno paralizante'
                    },
                    sandElementals: {
                        name: '🌪️ Sand Elementals',
                        emoji: '🌪️',
                        level: '25-35',
                        rarity: 'raro',
                        description: 'Espíritus de arena que controlan las dunas'
                    },
                    ancientMummies: {
                        name: '🧟 Ancient Mummies',
                        emoji: '🧟',
                        level: '30-40',
                        rarity: 'épico',
                        description: 'Momias ancestrales que guardan secretos milenarios'
                    }
                },
                resources: ['golden_sand', 'cactus_essence', 'ancient_stones'],
                npcs: ['Guerrero Masai', 'Chamán del Desierto', 'Comerciante Nómada'],
                specialFeatures: {
                    sandstorms: {
                        description: 'Tormentas de arena que revelan ruinas ocultas',
                        effect: 'ancient_discovery_boost'
                    }
                }
            },
            
montanas_heladas: {
                id: 'montanas_heladas',
                name: '🏔️ Montañas Heladas',
                description: 'Picos eternamente nevados donde el frío pone a prueba el alma',
                levelRange: [40, 65],
                theme: 'frozen_peaks',
                color: 0x87ceeb,
                emoji: '🏔️',
                climate: 'frozen',
                enemies: {
                    iceWolves: {
                        name: '🐺 Ice Wolves',
                        emoji: '🐺',
                        level: '35-45',
                        rarity: 'común',
                        description: 'Lobos de hielo que cazan en manadas letales'
                    },
                    frostGiants: {
                        name: '🧊 Frost Giants',
                        emoji: '🧊',
                        level: '45-55',
                        rarity: 'épico',
                        description: 'Gigantes de hielo con fuerza devastadora'
                    },
                    crystalDragons: {
                        name: '🐲 Crystal Dragons',
                        emoji: '🐲',
                        level: '55-65',
                        rarity: 'legendario',
                        description: 'Dragones de cristal que dominan el hielo eterno'
                    }
                },
                resources: ['ice_crystals', 'frozen_herbs', 'dragon_scales'],
                npcs: ['Explorador Ártico', 'Chamán del Hielo', 'Guardián de los Picos'],
                specialFeatures: {
                    blizzards: {
                        description: 'Ventiscas que ocultan tesoros congelados',
                        effect: 'ice_treasure_boost'
                    }
                }
            },
            
            desierto_ilusiones: {
                id: 'desierto_ilusiones',
                name: '🌪️ Desierto de las Ilusiones',
                description: 'Donde la realidad se distorsiona y los espejismos cobran vida',
                levelRange: [50, 80],
                theme: 'illusion_desert',
                color: 0xffd700,
                emoji: '🌪️',
                climate: 'mystical_arid',
                enemies: {
                    mirageSpirits: {
                        name: '👻 Mirage Spirits',
                        emoji: '👻',
                        level: '45-60',
                        rarity: 'raro',
                        description: 'Espíritus que crean ilusiones mortales'
                    },
                    sandKings: {
                        name: '👑 Sand Kings',
                        emoji: '👑',
                        level: '60-75',
                        rarity: 'épico',
                        description: 'Reyes de arena que controlan las dunas'
                    },
                    voidCrawlers: {
                        name: '🕷️ Void Crawlers',
                        emoji: '🕷️',
                        level: '70-80',
                        rarity: 'legendario',
                        description: 'Criaturas del vacío que emergen de las grietas dimensionales'
                    }
                },
                resources: ['mirage_essence', 'void_sand', 'reality_shards'],
                npcs: ['Oráculo de las Ilusiones', 'Navegante Dimensional', 'Guardián de la Realidad'],
                specialFeatures: {
                    realityDistortion: {
                        description: 'La realidad se distorsiona creando efectos impredecibles',
                        effect: 'random_reality_effects'
                    }
                }
            },
            
            isla_rey_demonio: {
                id: 'isla_rey_demonio',
                name: '👹 Isla del Rey Demonio',
                description: 'Fortaleza infernal donde solo los más poderosos se atreven a pisar',
                levelRange: [80, 120],
                theme: 'demonic_fortress',
                color: 0x8b0000,
                emoji: '👹',
                climate: 'infernal',
                enemies: {
                    lesserDemons: {
                        name: '😈 Lesser Demons',
                        emoji: '😈',
                        level: '75-90',
                        rarity: 'épico',
                        description: 'Demonios menores que sirven al Rey Demonio'
                    },
                    demonLords: {
                        name: '👺 Demon Lords',
                        emoji: '👺',
                        level: '90-110',
                        rarity: 'legendario',
                        description: 'Señores demonios con poder devastador'
                    },
                    demonKing: {
                        name: '👹 Demon King',
                        emoji: '👹',
                        level: '110-120',
                        rarity: 'mítico',
                        description: 'El Rey Demonio, maestro absoluto de la isla infernal'
                    }
                },
                resources: ['demon_essence', 'infernal_crystals', 'soul_fragments'],
                npcs: ['Cazador de Demonios', 'Exorcista Legendario', 'Alma Perdida'],
                specialFeatures: {
                    demonicAura: {
                        description: 'Aura demoníaca que corrompe pero otorga poder',
                        effect: 'high_risk_high_power'
                    }
                }
            }
        };

        // Cargar regiones en el mapa
        Object.values(regions).forEach(region => {
            this.regions.set(region.id, region);
        });

        console.log(`🗺️ Cargadas ${this.regions.size} regiones del mundo`);
    }

    /**
     * 🎊 Inicializa eventos globales del mundo
     */
    initializeGlobalEvents() {
        const globalEvents = [
            {
                id: 'double_exp_weekend',
                name: '🌟 Fin de Semana de EXP Doble',
                description: 'Toda la experiencia ganada se duplica',
                type: 'recurring',
                schedule: 'weekends',
                effect: { exp_multiplier: 2.0 },
                active: false
            },
            {
                id: 'merchant_festival',
                name: '🏪 Festival del Comerciante',
                description: 'Todos los precios de la tienda reducidos en 30%',
                type: 'monthly',
                schedule: 'first_week',
                effect: { shop_discount: 0.3 },
                active: false
            },
            {
                id: 'boss_invasion',
                name: '👹 Invasión de Jefes',
                description: 'Jefes especiales aparecen en todas las regiones',
                type: 'special',
                schedule: 'random',
                effect: { special_bosses: true, rare_loot: 2.0 },
                active: false
            }
        ];

        this.globalState.globalEvents = globalEvents;
        console.log(`🎊 Inicializados ${globalEvents.length} eventos globales`);
    }

    /**
     * ⏰ Inicia los ciclos del mundo (día/noche, eventos, etc.)
     */
    startWorldCycles() {
        // NOTA: Intervalos comentados para evitar bucles durante las pruebas
        // Descomentar cuando el bot esté en producción
        
        // Ciclo de día/noche (cada 4 horas reales = 1 día del juego)
        // setInterval(() => {
        //     this.updateDayNightCycle();
        // }, 4 * 60 * 60 * 1000); // 4 horas

        // Verificar eventos cada hora
        // setInterval(() => {
        //     this.checkAndActivateEvents();
        // }, 60 * 60 * 1000); // 1 hora

        // Actualizar estado del mundo cada 30 minutos
        // setInterval(() => {
        //     this.updateWorldState();
        // }, 30 * 60 * 1000); // 30 minutos

        console.log('⏰ Ciclos del mundo configurados (intervalos deshabilitados para pruebas)');
    }

    /**
     * 🌅 Actualiza el ciclo de día y noche
     */
    updateDayNightCycle() {
        const hour = new Date().getHours();
        const timeOfDay = this.getTimeOfDay(hour);
        
        this.globalState.timeOfDay = timeOfDay;
        
        // Aplicar efectos según la hora
        switch (timeOfDay) {
            case 'dawn':
                this.globalState.activeEffects = { exp_bonus: 1.1 };
                break;
            case 'day':
                this.globalState.activeEffects = { work_bonus: 1.2 };
                break;
            case 'dusk':
                this.globalState.activeEffects = { magic_bonus: 1.15 };
                break;
            case 'night':
                this.globalState.activeEffects = { stealth_bonus: 1.3 };
                break;
        }

        console.log(`🌅 Ciclo actualizado: ${timeOfDay}`);
    }

    /**
     * 🕐 Determina la hora del día basada en la hora real
     */
    getTimeOfDay(hour) {
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 18) return 'day';
        if (hour >= 18 && hour < 21) return 'dusk';
        return 'night';
    }

    /**
     * 🎊 Verifica y activa eventos según el calendario
     */
    checkAndActivateEvents() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const dayOfMonth = now.getDate();
        
        this.globalState.globalEvents.forEach(event => {
            let shouldActivate = false;
            
            switch (event.schedule) {
                case 'weekends':
                    shouldActivate = (dayOfWeek === 0 || dayOfWeek === 6);
                    break;
                case 'first_week':
                    shouldActivate = (dayOfMonth <= 7);
                    break;
                case 'random':
                    shouldActivate = (Math.random() < 0.1); // 10% chance cada hora
                    break;
            }
            
            if (shouldActivate && !event.active) {
                this.activateEvent(event);
            } else if (!shouldActivate && event.active) {
                this.deactivateEvent(event);
            }
        });
    }

    /**
     * ✨ Activa un evento global
     */
    activateEvent(event) {
        event.active = true;
        event.startTime = new Date();
        
        console.log(`🎊 Evento activado: ${event.name}`);
        
        // Aquí se podría notificar a todos los usuarios activos
        // this.notifyAllUsers(`🎊 ¡${event.name} ha comenzado! ${event.description}`);
    }

    /**
     * 🔚 Desactiva un evento global
     */
    deactivateEvent(event) {
        event.active = false;
        event.endTime = new Date();
        
        console.log(`🔚 Evento finalizado: ${event.name}`);
    }

    /**
     * 🔄 Actualiza el estado general del mundo
     */
    updateWorldState() {
        this.globalState.serverTime = new Date();
        
        // Calcular nivel del mundo basado en el promedio de usuarios
        // this.calculateWorldLevel();
        
        console.log('🔄 Estado del mundo actualizado');
    }

    /**
     * 🌍 Obtiene información de una región específica
     */
    getRegion(regionId) {
        return this.regions.get(regionId);
    }

    /**
     * 🗺️ Obtiene todas las regiones disponibles
     */
    getAllRegions() {
        return Array.from(this.regions.values());
    }

    /**
     * 🎯 Obtiene regiones apropiadas para el nivel del jugador
     */
    getRegionsForLevel(playerLevel) {
        return this.getAllRegions().filter(region => {
            const [minLevel, maxLevel] = region.levelRange;
            return playerLevel >= minLevel - 5 && playerLevel <= maxLevel + 5;
        });
    }

    /**
     * 🎲 Genera un encuentro aleatorio para una región - DATOS OFICIALES
     */
    generateRandomEncounter(regionId, playerLevel) {
        const region = this.getRegion(regionId);
        if (!region) return null;

        const encounterTypes = ['enemy', 'treasure', 'npc', 'event'];
        const encounterType = encounterTypes[Math.floor(Math.random() * encounterTypes.length)];

        switch (encounterType) {
            case 'enemy':
                return this.generateEnemyEncounter(region, playerLevel);
            case 'treasure':
                return this.generateTreasureEncounter(region, playerLevel);
            case 'npc':
                return this.generateNpcEncounter(region);
            case 'event':
                return this.generateEventEncounter(region);
        }
    }

    /**
     * 🎲 Genera un encuentro aleatorio de enemigo - DATOS OFICIALES
     */
    generateRandomEnemy(regionId, playerLevel) {
        const region = this.getRegion(regionId);
        if (!region || !region.enemies) return null;

        // Obtener enemigos de la región
        const enemyKeys = Object.keys(region.enemies);
        const randomEnemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
        const enemyData = region.enemies[randomEnemyKey];
        
        // Calcular nivel basado en el rango del enemigo
        const levelRange = enemyData.level.split('-').map(Number);
        const enemyLevel = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];
        
        return {
            id: randomEnemyKey,
            name: enemyData.name,
            emoji: enemyData.emoji,
            level: enemyLevel,
            rarity: enemyData.rarity,
            description: enemyData.description,
            region: regionId,
            rewards: {
                exp: this.calculateExpReward(enemyLevel, enemyData.rarity),
                gold: this.calculateGoldReward(enemyLevel, enemyData.rarity),
                items: this.generateEnemyDrops(enemyData.rarity)
            }
        };
    }

    /**
     * 👹 Genera un encuentro con enemigo - DATOS OFICIALES
     */
    generateEnemyEncounter(region, playerLevel) {
        if (!region.enemies) return null;
        
        const enemyKeys = Object.keys(region.enemies);
        const randomEnemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
        const enemyData = region.enemies[randomEnemyKey];
        
        // Calcular nivel basado en el rango del enemigo
        const levelRange = enemyData.level.split('-').map(Number);
        const enemyLevel = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];
        
        return {
            type: 'enemy',
            id: randomEnemyKey,
            name: enemyData.name,
            emoji: enemyData.emoji,
            level: enemyLevel,
            rarity: enemyData.rarity,
            description: enemyData.description,
            region: region.id,
            rewards: {
                exp: this.calculateExpReward(enemyLevel, enemyData.rarity),
                gold: this.calculateGoldReward(enemyLevel, enemyData.rarity),
                items: this.generateEnemyDrops(enemyData.rarity)
            }
        };
    }

    /**
     * 💰 Calcula recompensa de experiencia
     */
    calculateExpReward(level, rarity) {
        const baseExp = level * 10;
        const rarityMultiplier = {
            'común': 1.0,
            'raro': 1.5,
            'épico': 2.0,
            'legendario': 3.0,
            'mítico': 5.0
        };
        return Math.floor(baseExp * (rarityMultiplier[rarity] || 1.0));
    }

    /**
     * 🪙 Calcula recompensa de oro
     */
    calculateGoldReward(level, rarity) {
        const baseGold = level * 5;
        const rarityMultiplier = {
            'común': 1.0,
            'raro': 1.3,
            'épico': 1.8,
            'legendario': 2.5,
            'mítico': 4.0
        };
        return Math.floor(baseGold * (rarityMultiplier[rarity] || 1.0));
    }

    /**
     * 🎁 Genera drops de enemigos
     */
    generateEnemyDrops(rarity) {
        const dropChance = {
            'común': 0.3,
            'raro': 0.5,
            'épico': 0.7,
            'legendario': 0.9,
            'mítico': 1.0
        };
        
        if (Math.random() < (dropChance[rarity] || 0.3)) {
            return [`${rarity}_essence`, 'battle_fragment'];
        }
        return [];
    }

    /**
     * 💎 Genera un encuentro con tesoro - DATOS OFICIALES
     */
    generateTreasureEncounter(region, playerLevel) {
        const rarity = this.calculateTreasureRarity(playerLevel);
        const treasureItem = this.passquirkData.getRandomItemByRarity(rarity);
        
        return {
            type: 'treasure',
            item: treasureItem,
            rarity: rarity,
            region: region.id,
            description: `¡Has encontrado ${treasureItem.name} en ${region.name}!`,
            rewards: {
                item: treasureItem,
                gold: Math.floor(Math.random() * 100) + (playerLevel * 5)
            }
        };
    }

    /**
     * 👥 Genera un encuentro con NPC - DATOS OFICIALES
     */
    generateNPCEncounter(region, playerLevel) {
        const npcs = region.npcs || ['Viajero Misterioso'];
        const npcName = npcs[Math.floor(Math.random() * npcs.length)];
        
        const interactions = {
            'Maestro Takeshi': {
                dialogue: '"Joven aventurero, los cerezos susurran secretos del pasado..."',
                options: ['Entrenar', 'Buscar sabiduría', 'Preguntar sobre PassQuirks']
            },
            'Sirena Marina': {
                dialogue: '"Las corrientes traen noticias de tierras lejanas..."',
                options: ['Comerciar', 'Pedir bendición acuática', 'Escuchar historias']
            },
            'Guerrero Masai': {
                dialogue: '"El desierto forja a los verdaderos guerreros..."',
                options: ['Desafiar a duelo', 'Aprender técnicas', 'Intercambiar armas']
            },
            'Cazador de Demonios': {
                dialogue: '"Los demonios acechan... ¿tienes el valor para enfrentarlos?"',
                options: ['Unirse a la caza', 'Comprar equipo anti-demonio', 'Huir']
            }
        };
        
        return {
            type: 'npc',
            name: npcName,
            region: region.id,
            description: `Te encuentras con ${npcName} en ${region.name}`,
            interaction: interactions[npcName] || {
                dialogue: '"Saludos, aventurero..."',
                options: ['Hablar', 'Comerciar', 'Continuar']
            }
        };
    }

    /**
     * 🎭 Genera un evento especial - DATOS OFICIALES
     */
    generateSpecialEvent(region, playerLevel) {
        const regionEvents = {
            'akai': [
                {
                    name: 'Floración de Cerezos Mágicos',
                    description: 'Los cerezos brillan con energía mágica, otorgando experiencia extra',
                    effect: 'exp_boost',
                    duration: '1 hora'
                },
                {
                    name: 'Festival de Primavera',
                    description: 'Los habitantes celebran, aumentando las recompensas de comercio',
                    effect: 'trade_boost',
                    duration: '2 horas'
                }
            ],
            'say': [
                {
                    name: 'Marea Mágica',
                    description: 'Las aguas se cargan de magia, potenciando habilidades acuáticas',
                    effect: 'water_magic_boost',
                    duration: '30 minutos'
                }
            ],
            'masai': [
                {
                    name: 'Tormenta de Arena Ancestral',
                    description: 'Vientos antiguos revelan ruinas ocultas',
                    effect: 'ancient_discovery',
                    duration: '45 minutos'
                }
            ]
        };
        
        const events = regionEvents[region.id] || [
            {
                name: 'Fenómeno Misterioso',
                description: 'Algo extraño sucede en esta región...',
                effect: 'mystery_bonus',
                duration: '20 minutos'
            }
        ];
        
        const selectedEvent = events[Math.floor(Math.random() * events.length)];
        
        return {
            type: 'event',
            name: selectedEvent.name,
            description: selectedEvent.description,
            effect: selectedEvent.effect,
            duration: selectedEvent.duration,
            region: region.id,
            rewards: this.generateEventRewards(selectedEvent.effect, playerLevel)
        };
    }

    /**
     * 🎁 Genera recompensas de eventos - DATOS OFICIALES
     */
    generateEventRewards(effectType, playerLevel) {
        const baseRewards = {
            exp: playerLevel * 15,
            gold: playerLevel * 8
        };
        
        const effectMultipliers = {
            'exp_boost': { exp: 2.0, gold: 1.0 },
            'trade_boost': { exp: 1.0, gold: 2.5 },
            'water_magic_boost': { exp: 1.5, gold: 1.2 },
            'ancient_discovery': { exp: 1.8, gold: 1.8 },
            'mystery_bonus': { exp: 1.3, gold: 1.3 }
        };
        
        const multiplier = effectMultipliers[effectType] || { exp: 1.0, gold: 1.0 };
        
        return {
            exp: Math.floor(baseRewards.exp * multiplier.exp),
            gold: Math.floor(baseRewards.gold * multiplier.gold),
            specialItems: this.generateSpecialEventItems(effectType)
        };
    }
    
    /**
     * ✨ Genera objetos especiales de eventos
     */
    generateSpecialEventItems(effectType) {
        const eventItems = {
            'exp_boost': ['Cherry Blossom Essence', 'Wisdom Scroll'],
            'trade_boost': ['Merchant Token', 'Golden Coin'],
            'water_magic_boost': ['Aqua Crystal', 'Tide Essence'],
            'ancient_discovery': ['Ancient Relic', 'Desert Gem'],
            'mystery_bonus': ['Mystery Box', 'Unknown Artifact']
        };
        
        const items = eventItems[effectType] || ['Event Token'];
        return [items[Math.floor(Math.random() * items.length)]];
    }

    /**
     * 🎁 Calcula la rareza del tesoro basado en el nivel del jugador - DATOS OFICIALES
     */
    calculateTreasureRarity(playerLevel = 1) {
        const rand = Math.random();
        const levelBonus = Math.min(playerLevel / 100, 0.2);
        
        if (rand < 0.5 - levelBonus) return 'común';
        if (rand < 0.75 - levelBonus/2) return 'raro';
        if (rand < 0.9) return 'épico';
        if (rand < 0.98) return 'legendario';
        return 'mítico';
    }

    /**
     * 🌟 Obtiene el estado actual del mundo
     */
    getWorldState() {
        return {
            ...this.globalState,
            activeRegions: this.regions.size,
            activeEvents: this.globalState.globalEvents.filter(e => e.active).length
        };
    }

    /**
     * ⚡ Aplica efectos globales (tiempo, eventos) - DATOS OFICIALES
     */
    applyGlobalEffects(baseReward) {
        let modifiedReward = { ...baseReward };
        
        // Aplicar efectos de tiempo del día
        const timeEffects = {
            'dawn': { exp: 1.1, gold: 1.0 },
            'day': { exp: 1.0, gold: 1.2 },
            'dusk': { exp: 1.2, gold: 1.1 },
            'night': { exp: 1.0, gold: 1.0 }
        };
        
        const currentTimeEffect = timeEffects[this.timeSystem.timeOfDay] || { exp: 1.0, gold: 1.0 };
        modifiedReward.exp = Math.floor(modifiedReward.exp * currentTimeEffect.exp);
        modifiedReward.gold = Math.floor(modifiedReward.gold * currentTimeEffect.gold);
        
        // Aplicar efectos de eventos globales activos
        this.globalState.globalEvents.forEach(event => {
            if (event.effects && event.effects.exp_multiplier) {
                modifiedReward.exp = Math.floor(modifiedReward.exp * event.effects.exp_multiplier);
            }
            if (event.effects && event.effects.gold_multiplier) {
                modifiedReward.gold = Math.floor(modifiedReward.gold * event.effects.gold_multiplier);
            }
        });
        
        return modifiedReward;
    }
}

// Crear instancia singleton del motor del mundo
// NOTA: Comentado para evitar ejecución automática durante las pruebas
// const worldEngine = new WorldEngine();

module.exports = {
    WorldEngine,
    // worldEngine
};