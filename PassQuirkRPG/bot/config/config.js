// Configuración principal del bot PassQuirk RPG
module.exports = {
    // Configuración del bot
    bot: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID, // Para desarrollo, remover en producción
        prefix: '!', // Prefix para comandos de texto (opcional)
        owners: ['YOUR_USER_ID'], // IDs de los propietarios del bot
    },

    // Configuración de la base de datos
    database: {
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017/passquirk',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },

    // Colores para embeds
    colors: {
        primary: '#7289DA',
        success: '#43B581',
        warning: '#FAA61A',
        error: '#F04747',
        info: '#00D4FF',
        purple: '#9B59B6',
        gold: '#F1C40F',
        orange: '#E67E22',
        red: '#E74C3C',
        green: '#2ECC71',
        blue: '#3498DB',
        dark: '#2C2F33',
        light: '#FFFFFF',
        // Colores específicos del juego
        combat: '#FF6B6B',
        exploration: '#4ECDC4',
        shop: '#45B7D1',
        inventory: '#96CEB4',
        quest: '#FFEAA7',
        quirk: '#DDA0DD',
        stats: '#74B9FF',
        profile: '#A29BFE'
    },

    // Emojis del juego
    emojis: {
        // Emojis básicos
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳',
        
        // Emojis de juego
        hp: '❤️',
        mp: '💙',
        exp: '⭐',
        gold: '🪙',
        level: '🔰',
        
        // Emojis de combate
        sword: '⚔️',
        shield: '🛡️',
        bow: '🏹',
        magic: '🔮',
        potion: '🧪',
        
        // Emojis de exploración
        explore: '🗺️',
        treasure: '💎',
        chest: '📦',
        key: '🗝️',
        
        // Emojis de clases
        warrior: '⚔️',
        mage: '🔮',
        archer: '🏹',
        rogue: '🗡️',
        
        // Emojis de rareza
        common: '⚪',
        uncommon: '🟢',
        rare: '🔵',
        epic: '🟣',
        legendary: '🟡',
        mythic: '🔴',
        
        // Emojis de navegación
        left: '⬅️',
        right: '➡️',
        up: '⬆️',
        down: '⬇️',
        back: '🔙',
        home: '🏠',
        
        // Emojis de acciones
        use: '🔧',
        equip: '👕',
        sell: '💰',
        buy: '🛒',
        craft: '🔨',
        upgrade: '⬆️'
    },

    // Configuración del juego
    game: {
        // Niveles y experiencia
        maxLevel: 100,
        baseExp: 100,
        expMultiplier: 1.5,
        
        // Combate
        maxCombatTime: 300000, // 5 minutos
        turnTimeout: 30000, // 30 segundos por turno
        
        // Exploración
        exploreTimeout: 60000, // 1 minuto
        maxExploreTime: 1800000, // 30 minutos
        
        // Inventario
        maxInventorySlots: 50,
        maxStackSize: 99,
        
        // Economía
        startingGold: 100,
        sellMultiplier: 0.5, // Los ítems se venden al 50% de su valor
        
        // Cooldowns (en milisegundos)
        cooldowns: {
            combat: 30000, // 30 segundos
            explore: 60000, // 1 minuto
            quest: 300000, // 5 minutos
            shop: 5000, // 5 segundos
            daily: 86400000 // 24 horas
        },
        
        // Zonas de exploración
        zones: {
            'bosque_inicial': {
                name: 'Bosque Inicial',
                minLevel: 1,
                maxLevel: 10,
                description: 'Un bosque tranquilo perfecto para aventureros novatos'
            },
            'colinas_verdes': {
                name: 'Colinas Verdes',
                minLevel: 8,
                maxLevel: 20,
                description: 'Colinas ondulantes con criaturas más desafiantes'
            },
            'montanas_rocosas': {
                name: 'Montañas Rocosas',
                minLevel: 18,
                maxLevel: 35,
                description: 'Montañas traicioneras con enemigos peligrosos'
            },
            'desierto_ardiente': {
                name: 'Desierto Ardiente',
                minLevel: 30,
                maxLevel: 50,
                description: 'Un desierto abrasador lleno de criaturas del fuego'
            },
            'bosque_sombrio': {
                name: 'Bosque Sombrío',
                minLevel: 45,
                maxLevel: 70,
                description: 'Un bosque oscuro donde la magia siniestra prospera'
            },
            'reino_cristal': {
                name: 'Reino de Cristal',
                minLevel: 65,
                maxLevel: 85,
                description: 'Un reino mágico hecho de cristales brillantes'
            },
            'abismo_eterno': {
                name: 'Abismo Eterno',
                minLevel: 80,
                maxLevel: 100,
                description: 'El lugar más peligroso conocido por los aventureros'
            }
        },
        
        // Clases de personaje
        classes: {
            'warrior': {
                name: 'Guerrero',
                description: 'Un luchador cuerpo a cuerpo con alta defensa',
                stats: { hp: 120, mp: 50, attack: 15, defense: 12, speed: 8 }
            },
            'mage': {
                name: 'Mago',
                description: 'Un maestro de la magia con poderosos hechizos',
                stats: { hp: 80, mp: 120, attack: 18, defense: 6, speed: 10 }
            },
            'archer': {
                name: 'Arquero',
                description: 'Un tirador preciso con ataques a distancia',
                stats: { hp: 100, mp: 80, attack: 16, defense: 8, speed: 14 }
            },
            'rogue': {
                name: 'Pícaro',
                description: 'Un luchador ágil especializado en ataques críticos',
                stats: { hp: 90, mp: 70, attack: 14, defense: 7, speed: 16 }
            }
        }
    },

    // Configuración de desarrollo
    development: {
        debug: process.env.NODE_ENV === 'development',
        logLevel: process.env.LOG_LEVEL || 'info',
        testGuild: process.env.TEST_GUILD_ID
    },

    // Mensajes del sistema
    messages: {
        noCharacter: '❌ No tienes un personaje creado. Usa `/passquirkrpg` para comenzar tu aventura.',
        characterExists: '⚠️ Ya tienes un personaje creado.',
        invalidLevel: '❌ Tu nivel no es suficiente para esta acción.',
        cooldownActive: '⏳ Debes esperar antes de usar este comando nuevamente.',
        systemError: '❌ Ha ocurrido un error del sistema. Intenta de nuevo más tarde.',
        maintenanceMode: '🔧 El bot está en mantenimiento. Intenta más tarde.',
        insufficientGold: '💰 No tienes suficiente oro para esta acción.',
        inventoryFull: '📦 Tu inventario está lleno.',
        itemNotFound: '❌ El ítem especificado no existe.',
        alreadyEquipped: '⚠️ Ya tienes este tipo de ítem equipado.',
        cannotEquip: '❌ No puedes equipar este ítem.',
        inCombat: '⚔️ No puedes hacer esto mientras estás en combate.',
        notInCombat: '❌ No estás en combate actualmente.'
    }
};

// Función para obtener el color según el contexto
module.exports.getColor = function(context) {
    return this.colors[context] || this.colors.primary;
};

// Función para obtener emoji según el contexto
module.exports.getEmoji = function(context) {
    return this.emojis[context] || '';
};

// Función para calcular experiencia requerida para un nivel
module.exports.getExpForLevel = function(level) {
    return Math.floor(this.game.baseExp * Math.pow(this.game.expMultiplier, level - 1));
};

// Función para obtener información de zona
module.exports.getZone = function(zoneId) {
    return this.game.zones[zoneId] || null;
};

// Función para obtener información de clase
module.exports.getClass = function(classId) {
    return this.game.classes[classId] || null;
};