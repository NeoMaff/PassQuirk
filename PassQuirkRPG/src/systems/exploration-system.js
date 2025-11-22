/**
 * Sistema de Exploración para PassQuirk RPG
 * 
 * Este sistema maneja todas las mecánicas de exploración del juego:
 * - Exploración de zonas
 * - Eventos aleatorios
 * - Descubrimientos y tesoros
 * - Progresión de zonas
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS, EMOJIS } = require('../utils/embedStyles');

class ExplorationSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.activeExplorations = new Map();
        
        // Configuración de eventos
        this.eventProbabilities = {
            nothing: 0.15,  // Nada interesante
            item: 0.30,     // Encontrar un objeto
            enemy: 0.35,    // Encontrar un enemigo
            quirk: 0.10,    // Descubrir un quirk
            treasure: 0.10  // Encontrar un tesoro
        };
        
        // Zonas de exploración
        this.zones = {
            'Reino de Akai': {
                name: 'Reino de Akai',
                description: 'El reino principal donde comienzan todas las aventuras. Un lugar relativamente seguro con enemigos de bajo nivel.',
                minLevel: 1,
                maxLevel: 10,
                difficulty: 'Fácil',
                image: 'https://i.imgur.com/example1.jpg',
                enemyTypes: ['slime', 'goblin', 'lobo', 'bandido'],
                itemTypes: ['común', 'poco común'],
                unlockRequirements: null // Zona inicial
            },
            'Bosque Sombrío': {
                name: 'Bosque Sombrío',
                description: 'Un bosque antiguo lleno de criaturas misteriosas y tesoros ocultos.',
                minLevel: 5,
                maxLevel: 15,
                difficulty: 'Moderado',
                image: 'https://i.imgur.com/example2.jpg',
                enemyTypes: ['lobo', 'oso', 'espíritu', 'druida corrupto'],
                itemTypes: ['común', 'poco común', 'raro'],
                unlockRequirements: { level: 5 }
            },
            'Montañas Heladas': {
                name: 'Montañas Heladas',
                description: 'Cumbres nevadas donde habitan bestias de hielo y antiguos dragones.',
                minLevel: 10,
                maxLevel: 20,
                difficulty: 'Difícil',
                image: 'https://i.imgur.com/example3.jpg',
                enemyTypes: ['yeti', 'lobo de hielo', 'golem de hielo', 'dragón menor'],
                itemTypes: ['poco común', 'raro', 'épico'],
                unlockRequirements: { level: 10, zonesCompleted: ['Bosque Sombrío'] }
            },
            'Desierto de Fuego': {
                name: 'Desierto de Fuego',
                description: 'Vastas dunas ardientes donde el calor extremo y las criaturas de fuego ponen a prueba a los aventureros.',
                minLevel: 15,
                maxLevel: 25,
                difficulty: 'Muy Difícil',
                image: 'https://i.imgur.com/example4.jpg',
                enemyTypes: ['escorpión de fuego', 'elemental de fuego', 'ifrit', 'fénix corrupto'],
                itemTypes: ['raro', 'épico'],
                unlockRequirements: { level: 15, zonesCompleted: ['Montañas Heladas'] }
            },
            'Ruinas Ancestrales': {
                name: 'Ruinas Ancestrales',
                description: 'Antiguos templos y ciudades en ruinas donde descansan poderosos artefactos y guardianes olvidados.',
                minLevel: 20,
                maxLevel: 30,
                difficulty: 'Extremo',
                image: 'https://i.imgur.com/example5.jpg',
                enemyTypes: ['golem de piedra', 'espectro', 'guardián ancestral', 'liche'],
                itemTypes: ['raro', 'épico', 'legendario'],
                unlockRequirements: { level: 20, zonesCompleted: ['Desierto de Fuego'] }
            },
            'Abismo del Vacío': {
                name: 'Abismo del Vacío',
                description: 'El lugar más peligroso conocido, donde las leyes de la realidad se distorsionan y habitan las criaturas más poderosas.',
                minLevel: 25,
                maxLevel: 40,
                difficulty: 'Pesadilla',
                image: 'https://i.imgur.com/example6.jpg',
                enemyTypes: ['horror del vacío', 'devorador de realidad', 'señor del abismo', 'avatar del caos'],
                itemTypes: ['épico', 'legendario', 'mítico'],
                unlockRequirements: { level: 25, zonesCompleted: ['Ruinas Ancestrales'] }
            }
        };
    }
    
    /**
     * Inicia una exploración para un jugador
     * @param {Object} interaction - Interacción de Discord
     * @param {Object} player - Datos del jugador
     * @param {string} zoneName - Nombre de la zona a explorar
     * @returns {Object} Datos de la exploración iniciada
     */
    async startExploration(interaction, player, zoneName) {
        const userId = player.userId;
        
        // Verificar si el jugador ya está explorando
        if (this.activeExplorations.has(userId)) {
            throw new Error('Ya estás explorando. Termina tu exploración actual antes de iniciar otra.');
        }
        
        // Verificar si la zona existe
        if (!this.zones[zoneName]) {
            throw new Error(`La zona "${zoneName}" no existe.`);
        }
        
        const zone = this.zones[zoneName];
        
        // Verificar requisitos de nivel
        if (player.level < zone.minLevel) {
            throw new Error(`Necesitas ser nivel ${zone.minLevel} para explorar ${zoneName}.`);
        }
        
        // Verificar si la zona está desbloqueada
        if (zone.unlockRequirements) {
            // Verificar nivel requerido
            if (zone.unlockRequirements.level && player.level < zone.unlockRequirements.level) {
                throw new Error(`Necesitas ser nivel ${zone.unlockRequirements.level} para desbloquear ${zoneName}.`);
            }
            
            // Verificar zonas completadas requeridas
            if (zone.unlockRequirements.zonesCompleted) {
                const unlockedZones = player.exploration?.unlockedZones || [];
                const missingZones = zone.unlockRequirements.zonesCompleted.filter(z => !unlockedZones.includes(z));
                
                if (missingZones.length > 0) {
                    throw new Error(`Necesitas explorar ${missingZones.join(', ')} antes de desbloquear ${zoneName}.`);
                }
            }
        }
        
        // Crear datos de exploración
        const exploration = {
            id: `exploration_${userId}_${Date.now()}`,
            player: player,
            zone: zone,
            events: [],
            currentEvent: null,
            status: 'active',
            startTime: Date.now(),
            energy: 3, // Número de eventos que puede explorar
            discoveries: []
        };
        
        // Registrar la exploración activa
        this.activeExplorations.set(userId, exploration);
        
        // Crear sesión de juego
        const sessionId = this.gameManager.startSession(userId, 'exploration', { explorationId: exploration.id });
        exploration.sessionId = sessionId;
        
        // Actualizar zona actual del jugador
        try {
            const updatedPlayer = await this.gameManager.getPlayer(userId);
            updatedPlayer.exploration = updatedPlayer.exploration || {};
            updatedPlayer.exploration.currentZone = zoneName;
            
            // Añadir a zonas desbloqueadas si no está ya
            updatedPlayer.exploration.unlockedZones = updatedPlayer.exploration.unlockedZones || ['Reino de Akai'];
            if (!updatedPlayer.exploration.unlockedZones.includes(zoneName)) {
                updatedPlayer.exploration.unlockedZones.push(zoneName);
            }
            
            await this.gameManager.playerDB.savePlayer(updatedPlayer);
        } catch (error) {
            console.error('Error al actualizar zona del jugador:', error);
        }
        
        // Mostrar el embed de exploración inicial
        await this.showExplorationEmbed(interaction, exploration);
        
        return exploration;
    }
    
    /**
     * Muestra el embed de exploración actualizado
     * @param {Object} interaction - Interacción de Discord
     * @param {Object} exploration - Datos de la exploración
     */
    async showExplorationEmbed(interaction, exploration) {
        const { player, zone, events, currentEvent, status, energy } = exploration;
        
        // Crear embed
        const embed = new EmbedBuilder()
            .setTitle(`🗺️ Explorando: ${zone.name}`)
            .setDescription(zone.description)
            .setColor(COLORS.SYSTEM.EXPLORATION)
            .addFields(
                { name: 'Dificultad', value: zone.difficulty, inline: true },
                { name: 'Nivel recomendado', value: `${zone.minLevel}-${zone.maxLevel}`, inline: true },
                { name: 'Energía restante', value: `${energy}/3`, inline: true }
            );
        
        // Añadir imagen de la zona si existe
        if (zone.image) {
            embed.setImage(zone.image);
        }
        
        // Añadir información del evento actual si existe
        if (currentEvent) {
            embed.addFields({ name: 'Evento actual', value: currentEvent.description, inline: false });
            
            // Añadir detalles específicos según el tipo de evento
            switch (currentEvent.type) {
                case 'enemy':
                    embed.addFields({ name: '⚔️ Enemigo encontrado', value: `Has encontrado un ${currentEvent.data.name} (Nivel ${currentEvent.data.level})`, inline: false });
                    break;
                case 'item':
                    embed.addFields({ name: '🎒 Objeto encontrado', value: `Has encontrado: ${currentEvent.data.name} (${currentEvent.data.rarity})`, inline: false });
                    break;
                case 'quirk':
                    embed.addFields({ name: '✨ Quirk descubierto', value: `Has descubierto un nuevo quirk: ${currentEvent.data.name}`, inline: false });
                    break;
                case 'treasure':
                    embed.addFields({ name: '💰 Tesoro encontrado', value: `Has encontrado un tesoro: ${currentEvent.data.name}`, inline: false });
                    break;
                case 'nothing':
                    // No se añade información adicional para eventos de "nada"
                    break;
            }
        }
        
        // Añadir resumen de eventos anteriores
        if (events.length > 0) {
            const recentEvents = events.slice(-3).map(e => `• ${e.summary}`).join('\n');
            embed.addFields({ name: 'Eventos recientes', value: recentEvents, inline: false });
        }
        
        // Crear botones de acción
        const buttons = [];
        
        if (status === 'active') {
            if (currentEvent) {
                // Botones específicos según el tipo de evento
                const actionRow = new ActionRowBuilder();
                
                switch (currentEvent.type) {
                    case 'enemy':
                        actionRow.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`exploration_battle_${exploration.id}`)
                                .setLabel('Combatir')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('⚔️'),
                            new ButtonBuilder()
                                .setCustomId(`exploration_flee_${exploration.id}`)
                                .setLabel('Huir')
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji('🏃')
                        );
                        break;
                    case 'item':
                    case 'quirk':
                    case 'treasure':
                    case 'nothing':
                        actionRow.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`exploration_continue_${exploration.id}`)
                                .setLabel('Continuar')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('➡️')
                        );
                        break;
                }
                
                buttons.push(actionRow);
            } else if (energy > 0) {
                // Botón para explorar más
                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`exploration_explore_${exploration.id}`)
                            .setLabel('Explorar')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🔍'),
                        new ButtonBuilder()
                            .setCustomId(`exploration_return_${exploration.id}`)
                            .setLabel('Regresar')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🏠')
                    );
                
                buttons.push(actionRow);
            } else {
                // Sin energía, solo puede regresar
                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`exploration_return_${exploration.id}`)
                            .setLabel('Regresar')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🏠')
                    );
                
                buttons.push(actionRow);
            }
        } else {
            // Exploración finalizada
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`exploration_finish_${exploration.id}`)
                        .setLabel('Finalizar')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅')
                );
            
            buttons.push(actionRow);
        }
        
        // Enviar o actualizar mensaje
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [embed], components: buttons });
        } else {
            await interaction.reply({ embeds: [embed], components: buttons });
        }
    }
    
    /**
     * Genera un evento aleatorio para la exploración
     * @param {Object} exploration - Datos de la exploración
     * @returns {Object} Evento generado
     */
    generateRandomEvent(exploration) {
        const { player, zone } = exploration;
        
        // Determinar tipo de evento basado en probabilidades
        const eventType = this.getRandomEventType();
        
        // Crear evento base
        const event = {
            type: eventType,
            timestamp: Date.now(),
            data: null,
            description: '',
            summary: ''
        };
        
        // Generar detalles según el tipo de evento
        switch (eventType) {
            case 'nothing':
                const nothingEvents = [
                    'Caminas por un sendero tranquilo sin encontrar nada interesante.',
                    'Descansas bajo la sombra de un árbol y recuperas algo de energía.',
                    'Observas el paisaje, pero no hay nada destacable.',
                    'Encuentras huellas de alguna criatura, pero ya se ha ido.',
                    'El viento sopla suavemente mientras avanzas sin incidentes.'
                ];
                
                const randomNothingEvent = nothingEvents[Math.floor(Math.random() * nothingEvents.length)];
                event.description = randomNothingEvent;
                event.summary = 'No encontraste nada especial';
                break;
                
            case 'enemy':
                // Obtener un enemigo aleatorio apropiado para la zona y nivel del jugador
                const enemy = this.gameManager.getRandomEnemy(player.level, zone.name);
                event.data = enemy;
                event.description = `¡Has encontrado un ${enemy.name} (Nivel ${enemy.level})! Prepárate para el combate o intenta huir.`;
                event.summary = `Encontraste un ${enemy.name}`;
                break;
                
            case 'item':
                // Generar un objeto aleatorio basado en la zona
                const item = this.generateRandomItem(zone, player.level);
                event.data = item;
                event.description = `Has encontrado un objeto: ${item.name} (${item.rarity})\n${item.description}`;
                event.summary = `Encontraste ${item.name}`;
                break;
                
            case 'quirk':
                // Generar un quirk aleatorio que el jugador no tenga
                const quirk = this.generateRandomQuirk(player);
                event.data = quirk;
                event.description = `¡Has descubierto un nuevo quirk: ${quirk.name}!\n${quirk.description}`;
                event.summary = `Descubriste el quirk ${quirk.name}`;
                break;
                
            case 'treasure':
                // Generar un tesoro aleatorio basado en la zona
                const treasure = this.generateRandomTreasure(zone, player.level);
                event.data = treasure;
                event.description = `¡Has encontrado un tesoro: ${treasure.name}!\n${treasure.description}`;
                event.summary = `Encontraste un tesoro: ${treasure.name}`;
                break;
        }
        
        return event;
    }
    
    /**
     * Determina un tipo de evento aleatorio basado en las probabilidades configuradas
     * @returns {string} Tipo de evento
     */
    getRandomEventType() {
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const [eventType, probability] of Object.entries(this.eventProbabilities)) {
            cumulativeProbability += probability;
            if (rand < cumulativeProbability) {
                return eventType;
            }
        }
        
        // Por defecto, devolver 'nothing'
        return 'nothing';
    }
    
    /**
     * Genera un objeto aleatorio basado en la zona y nivel del jugador
     * @param {Object} zone - Datos de la zona
     * @param {number} playerLevel - Nivel del jugador
     * @returns {Object} Objeto generado
     */
    generateRandomItem(zone, playerLevel) {
        // Implementación básica - en una versión completa, se cargarían de una base de datos de objetos
        const itemTypes = ['poción', 'arma', 'armadura', 'accesorio', 'material'];
        const rarities = zone.itemTypes || ['común', 'poco común'];
        
        const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
        
        // Generar estadísticas basadas en rareza y nivel
        const statMultiplier = {
            'común': 1,
            'poco común': 1.2,
            'raro': 1.5,
            'épico': 2,
            'legendario': 3,
            'mítico': 5
        }[randomRarity];
        
        const baseValue = playerLevel * 5 * statMultiplier;
        
        // Crear objeto según su tipo
        let item = {
            id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            type: randomType,
            rarity: randomRarity,
            level: Math.max(1, Math.floor(playerLevel * 0.8 + Math.random() * playerLevel * 0.4)),
            value: Math.floor(baseValue)
        };
        
        switch (randomType) {
            case 'poción':
                const potionTypes = ['salud', 'maná', 'fuerza', 'defensa', 'velocidad'];
                const potionType = potionTypes[Math.floor(Math.random() * potionTypes.length)];
                item.name = `Poción de ${potionType} ${randomRarity}`;
                item.description = `Restaura o aumenta temporalmente ${potionType}.`;
                item.effect = { type: potionType, value: Math.floor(baseValue) };
                break;
                
            case 'arma':
                const weaponTypes = ['espada', 'hacha', 'arco', 'bastón', 'daga'];
                const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
                item.name = `${weaponType.charAt(0).toUpperCase() + weaponType.slice(1)} ${randomRarity}`;
                item.description = `Un${weaponType === 'espada' || weaponType === 'hacha' || weaponType === 'daga' ? 'a' : ''} ${weaponType} de calidad ${randomRarity}.`;
                item.stats = { attack: Math.floor(baseValue * 0.8) };
                break;
                
            case 'armadura':
                const armorTypes = ['casco', 'pechera', 'guantes', 'botas', 'escudo'];
                const armorType = armorTypes[Math.floor(Math.random() * armorTypes.length)];
                item.name = `${armorType.charAt(0).toUpperCase() + armorType.slice(1)} ${randomRarity}`;
                item.description = `Un${armorType === 'casco' || armorType === 'escudo' ? '' : 'a'} ${armorType} de calidad ${randomRarity}.`;
                item.stats = { defense: Math.floor(baseValue * 0.8) };
                break;
                
            case 'accesorio':
                const accessoryTypes = ['anillo', 'amuleto', 'capa', 'cinturón', 'brazalete'];
                const accessoryType = accessoryTypes[Math.floor(Math.random() * accessoryTypes.length)];
                item.name = `${accessoryType.charAt(0).toUpperCase() + accessoryType.slice(1)} ${randomRarity}`;
                item.description = `Un ${accessoryType} de calidad ${randomRarity}.`;
                
                // Los accesorios pueden tener efectos variados
                const statTypes = ['hp', 'mp', 'attack', 'defense', 'speed'];
                const statType = statTypes[Math.floor(Math.random() * statTypes.length)];
                item.stats = { [statType]: Math.floor(baseValue * 0.5) };
                break;
                
            case 'material':
                const materialTypes = ['mineral', 'gema', 'hierba', 'piel', 'fragmento'];
                const materialType = materialTypes[Math.floor(Math.random() * materialTypes.length)];
                item.name = `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} ${randomRarity}`;
                item.description = `Un material ${randomRarity} usado para fabricación.`;
                item.craftingValue = Math.floor(baseValue * 0.3);
                break;
        }
        
        return item;
    }
    
    /**
     * Genera un quirk aleatorio que el jugador no tenga
     * @param {Object} player - Datos del jugador
     * @returns {Object} Quirk generado
     */
    generateRandomQuirk(player) {
        // Obtener lista de quirks que el jugador no tiene
        const playerQuirks = player.quirks || [];
        const playerQuirkNames = playerQuirks.map(q => q.name);
        
        // Filtrar quirks disponibles (excluyendo PassQuirks principales)
        const availableQuirks = [];
        
        // Añadir quirks de combate
        const combatQuirks = [
            { name: 'Golpe Crítico', description: 'Aumenta la probabilidad de golpes críticos en combate.', type: 'combat', bonus: { critChance: 5 } },
            { name: 'Resistencia Elemental', description: 'Reduce el daño recibido de ataques elementales.', type: 'combat', bonus: { elementalResistance: 10 } },
            { name: 'Contraataque', description: 'Posibilidad de devolver parte del daño recibido.', type: 'combat', bonus: { counterAttack: 15 } },
            { name: 'Golpe Rápido', description: 'Posibilidad de realizar un ataque adicional en combate.', type: 'combat', bonus: { extraAttackChance: 8 } },
            { name: 'Defensa Perfecta', description: 'Posibilidad de bloquear completamente un ataque.', type: 'combat', bonus: { perfectBlockChance: 5 } }
        ];
        
        // Añadir quirks de economía
        const economyQuirks = [
            { name: 'Ojo para el Valor', description: 'Aumenta el oro obtenido de la venta de objetos.', type: 'economy', bonus: { sellBonus: 10 } },
            { name: 'Regateo', description: 'Reduce el costo de compra de objetos en tiendas.', type: 'economy', bonus: { buyDiscount: 8 } },
            { name: 'Buscador de Tesoros', description: 'Aumenta la probabilidad de encontrar objetos raros.', type: 'economy', bonus: { rareFindChance: 5 } },
            { name: 'Bolsillos Profundos', description: 'Aumenta la capacidad de inventario.', type: 'economy', bonus: { inventorySlots: 5 } },
            { name: 'Fortuna del Aventurero', description: 'Aumenta el oro obtenido de enemigos.', type: 'economy', bonus: { goldBonus: 15 } }
        ];
        
        // Añadir quirks de progresión
        const progressionQuirks = [
            { name: 'Aprendizaje Rápido', description: 'Aumenta la experiencia obtenida de todas las fuentes.', type: 'progression', bonus: { expBonus: 5 } },
            { name: 'Adaptabilidad', description: 'Reduce el tiempo de enfriamiento de habilidades.', type: 'progression', bonus: { cooldownReduction: 10 } },
            { name: 'Vitalidad', description: 'Aumenta la salud máxima.', type: 'progression', bonus: { maxHpBonus: 10 } },
            { name: 'Concentración', description: 'Aumenta el maná máximo.', type: 'progression', bonus: { maxMpBonus: 10 } },
            { name: 'Maestría de Atributos', description: 'Pequeño aumento a todos los atributos.', type: 'progression', bonus: { allStats: 3 } }
        ];
        
        // Combinar todos los quirks disponibles
        availableQuirks.push(...combatQuirks, ...economyQuirks, ...progressionQuirks);
        
        // Filtrar quirks que el jugador ya tiene
        const newQuirks = availableQuirks.filter(quirk => !playerQuirkNames.includes(quirk.name));
        
        if (newQuirks.length === 0) {
            // Si el jugador ya tiene todos los quirks, crear uno genérico
            return {
                name: 'Quirk Menor',
                description: 'Un pequeño aumento a tus capacidades.',
                type: 'generic',
                bonus: { allStats: 1 }
            };
        }
        
        // Seleccionar un quirk aleatorio
        return newQuirks[Math.floor(Math.random() * newQuirks.length)];
    }
    
    /**
     * Genera un tesoro aleatorio basado en la zona y nivel del jugador
     * @param {Object} zone - Datos de la zona
     * @param {number} playerLevel - Nivel del jugador
     * @returns {Object} Tesoro generado
     */
    generateRandomTreasure(zone, playerLevel) {
        // Implementación básica - en una versión completa, se cargarían de una base de datos de tesoros
        const treasureTypes = [
            { name: 'Cofre pequeño', goldMultiplier: 2, itemCount: 1 },
            { name: 'Cofre mediano', goldMultiplier: 3, itemCount: 2 },
            { name: 'Cofre grande', goldMultiplier: 5, itemCount: 3 },
            { name: 'Alijo oculto', goldMultiplier: 4, itemCount: 2 },
            { name: 'Tesoro antiguo', goldMultiplier: 7, itemCount: 3 }
        ];
        
        // Seleccionar un tipo de tesoro aleatorio
        const treasureType = treasureTypes[Math.floor(Math.random() * treasureTypes.length)];
        
        // Calcular oro basado en nivel del jugador y multiplicador del tesoro
        const gold = Math.floor(playerLevel * 10 * treasureType.goldMultiplier * (0.8 + Math.random() * 0.4));
        
        // Generar objetos aleatorios
        const items = [];
        for (let i = 0; i < treasureType.itemCount; i++) {
            items.push(this.generateRandomItem(zone, playerLevel));
        }
        
        // Crear tesoro
        const treasure = {
            name: treasureType.name,
            description: `Un tesoro que contiene ${gold} de oro y ${treasureType.itemCount} objeto(s).`,
            gold: gold,
            items: items
        };
        
        return treasure;
    }
    
    /**
     * Procesa una acción de exploración
     * @param {Object} interaction - Interacción de Discord
     * @param {string} explorationId - ID de la exploración
     */
    async processExplore(interaction, explorationId) {
        const userId = interaction.user.id;
        const exploration = this.activeExplorations.get(userId);
        
        if (!exploration || exploration.id !== explorationId || exploration.status !== 'active') {
            await interaction.reply({ content: 'Esta exploración ya no está activa.', ephemeral: true });
            return;
        }
        
        await interaction.deferUpdate();
        
        // Verificar energía
        if (exploration.energy <= 0) {
            await interaction.followUp({ content: 'No tienes energía suficiente para seguir explorando.', ephemeral: true });
            return;
        }
        
        // Generar evento aleatorio
        const event = this.generateRandomEvent(exploration);
        
        // Actualizar exploración
        exploration.currentEvent = event;
        exploration.energy--;
        
        // Mostrar exploración actualizada
        await this.showExplorationEmbed(interaction, exploration);
    }
    
    /**
     * Procesa una acción de batalla durante la exploración
     * @param {Object} interaction - Interacción de Discord
     * @param {string} explorationId - ID de la exploración
     */
    async processBattle(interaction, explorationId) {
        const userId = interaction.user.id;
        const exploration = this.activeExplorations.get(userId);
        
        if (!exploration || exploration.id !== explorationId || exploration.status !== 'active') {
            await interaction.reply({ content: 'Esta exploración ya no está activa.', ephemeral: true });
            return;
        }
        
        if (!exploration.currentEvent || exploration.currentEvent.type !== 'enemy') {
            await interaction.reply({ content: 'No hay un enemigo para combatir.', ephemeral: true });
            return;
        }
        
        await interaction.deferUpdate();
        
        // Obtener datos del enemigo
        const enemy = exploration.currentEvent.data;
        
        // Iniciar batalla
        try {
            // Verificar si el sistema de combate está disponible
            if (!this.gameManager.systems.combat) {
                throw new Error('Sistema de combate no disponible.');
            }
            
            // Obtener datos actualizados del jugador
            const player = await this.gameManager.getPlayer(userId);
            
            // Iniciar batalla
            await this.gameManager.systems.combat.startBattle(interaction, player, enemy);
            
            // Registrar evento en la exploración
            exploration.events.push(exploration.currentEvent);
            exploration.currentEvent = null;
            
            // Pausar la exploración mientras se combate
            // La exploración se reanudará cuando termine la batalla
        } catch (error) {
            console.error('Error al iniciar batalla:', error);
            await interaction.followUp({ content: `Error al iniciar batalla: ${error.message}`, ephemeral: true });
        }
    }
    
    /**
     * Procesa una acción de huida durante la exploración
     * @param {Object} interaction - Interacción de Discord
     * @param {string} explorationId - ID de la exploración
     */
    async processFlee(interaction, explorationId) {
        const userId = interaction.user.id;
        const exploration = this.activeExplorations.get(userId);
        
        if (!exploration || exploration.id !== explorationId || exploration.status !== 'active') {
            await interaction.reply({ content: 'Esta exploración ya no está activa.', ephemeral: true });
            return;
        }
        
        await interaction.deferUpdate();
        
        // Registrar evento de huida
        if (exploration.currentEvent) {
            exploration.currentEvent.summary += ' (Huiste)';
            exploration.events.push(exploration.currentEvent);
            exploration.currentEvent = null;
        }
        
        // Mostrar exploración actualizada
        await this.showExplorationEmbed(interaction, exploration);
    }
    
    /**
     * Procesa una acción de continuar durante la exploración
     * @param {Object} interaction - Interacción de Discord
     * @param {string} explorationId - ID de la exploración
     */
    async processContinue(interaction, explorationId) {
        const userId = interaction.user.id;
        const exploration = this.activeExplorations.get(userId);
        
        if (!exploration || exploration.id !== explorationId || exploration.status !== 'active') {
            await interaction.reply({ content: 'Esta exploración ya no está activa.', ephemeral: true });
            return;
        }
        
        await interaction.deferUpdate();
        
        // Procesar recompensas del evento actual
        if (exploration.currentEvent) {
            const event = exploration.currentEvent;
            const player = await this.gameManager.getPlayer(userId);
            
            switch (event.type) {
                case 'item':
                    // Añadir objeto al inventario
                    const item = event.data;
                    player.inventory = player.inventory || { items: {}, gold: 0 };
                    player.inventory.items[item.id] = item;
                    await this.gameManager.playerDB.savePlayer(player);
                    break;
                    
                case 'quirk':
                    // Añadir quirk a la lista del jugador
                    const quirk = event.data;
                    player.quirks = player.quirks || [];
                    player.quirks.push(quirk);
                    await this.gameManager.playerDB.savePlayer(player);
                    break;
                    
                case 'treasure':
                    // Añadir oro y objetos del tesoro
                    const treasure = event.data;
                    player.inventory = player.inventory || { items: {}, gold: 0 };
                    player.inventory.gold += treasure.gold;
                    
                    // Añadir objetos
                    for (const item of treasure.items) {
                        player.inventory.items[item.id] = item;
                    }
                    
                    await this.gameManager.playerDB.savePlayer(player);
                    break;
            }
            
            // Registrar evento
            exploration.events.push(event);
            exploration.currentEvent = null;
        }
        
        // Mostrar exploración actualizada
        await this.showExplorationEmbed(interaction, exploration);
    }
    
    /**
     * Procesa una acción de regresar durante la exploración
     * @param {Object} interaction - Interacción de Discord
     * @param {string} explorationId - ID de la exploración
     */
    async processReturn(interaction, explorationId) {
        const userId = interaction.user.id;
        const exploration = this.activeExplorations.get(userId);
        
        if (!exploration || exploration.id !== explorationId) {
            await interaction.reply({ content: 'Esta exploración ya no está activa.', ephemeral: true });
            return;
        }
        
        await interaction.deferUpdate();
        
        // Finalizar exploración
        exploration.status = 'completed';
        exploration.endTime = Date.now();
        
        // Calcular recompensas totales
        const totalGold = exploration.events
            .filter(e => e.type === 'treasure')
            .reduce((sum, e) => sum + e.data.gold, 0);
        
        const totalItems = exploration.events
            .filter(e => e.type === 'item' || e.type === 'treasure')
            .reduce((count, e) => {
                if (e.type === 'item') return count + 1;
                return count + e.data.items.length;
            }, 0);
        
        const totalQuirks = exploration.events
            .filter(e => e.type === 'quirk')
            .length;
        
        const totalEnemies = exploration.events
            .filter(e => e.type === 'enemy')
            .length;
        
        // Actualizar estadísticas del jugador
        try {
            const player = await this.gameManager.getPlayer(userId);
            
            // Actualizar estadísticas de exploración
            player.exploration = player.exploration || {};
            player.exploration.total = (player.exploration.total || 0) + 1;
            
            // Registrar descubrimientos
            player.exploration.discoveries = player.exploration.discoveries || [];
            
            // Añadir pequeña cantidad de experiencia por explorar
            const baseExp = 5 * exploration.zone.difficulty.length; // Más difícil = más exp
            const eventsExp = exploration.events.length * 3;
            const totalExp = baseExp + eventsExp;
            
            player.experience += totalExp;
            
            // Verificar si sube de nivel
            while (player.experience >= player.experienceToNext) {
                player.experience -= player.experienceToNext;
                player.level += 1;
                player.experienceToNext = Math.floor(100 * Math.pow(1.1, player.level));
            }
            
            await this.gameManager.playerDB.savePlayer(player);
            
        } catch (error) {
            console.error('Error al actualizar estadísticas de exploración:', error);
        }
        
        // Crear resumen de exploración
        const summary = new EmbedBuilder()
            .setTitle(`🗺️ Exploración completada: ${exploration.zone.name}`)
            .setDescription(`Has completado tu exploración en ${exploration.zone.name}.`)
            .setColor(COLORS.SYSTEM.SUCCESS)
            .addFields(
                { name: 'Eventos totales', value: `${exploration.events.length}`, inline: true },
                { name: 'Oro obtenido', value: `${totalGold}`, inline: true },
                { name: 'Objetos encontrados', value: `${totalItems}`, inline: true },
                { name: 'Quirks descubiertos', value: `${totalQuirks}`, inline: true },
                { name: 'Enemigos encontrados', value: `${totalEnemies}`, inline: true },
                { name: 'Experiencia ganada', value: `${baseExp + eventsExp}`, inline: true }
            );
        
        // Mostrar resumen
        await interaction.followUp({ embeds: [summary] });
        
        // Mostrar exploración actualizada
        await this.showExplorationEmbed(interaction, exploration);
        
        // Finalizar sesión de juego
        if (exploration.sessionId) {
            this.gameManager.endSession(exploration.sessionId);
        }
    }
    
    /**
     * Procesa una acción de finalizar exploración
     * @param {Object} interaction - Interacción de Discord
     * @param {string} explorationId - ID de la exploración
     */
    async processFinish(interaction, explorationId) {
        const userId = interaction.user.id;
        
        // Eliminar la exploración
        this.activeExplorations.delete(userId);
        
        await interaction.update({ content: 'Exploración finalizada.', embeds: [], components: [] });
    }
    
    /**
     * Maneja la interacción con botones de exploración
     * @param {Object} interaction - Interacción de botón
     * @returns {boolean} True si la interacción fue manejada, false en caso contrario
     */
    async handleButtonInteraction(interaction) {
        const customId = interaction.customId;
        
        // Verificar si es un botón de exploración
        if (!customId.startsWith('exploration_')) return false;
        
        const [prefix, action, explorationId] = customId.split('_');
        const userId = interaction.user.id;
        
        // Verificar que el usuario tiene una exploración activa
        const exploration = this.activeExplorations.get(userId);
        if (!exploration || exploration.id !== explorationId) {
            await interaction.reply({ content: 'Esta exploración ya no está activa.', ephemeral: true });
            return true;
        }
        
        // Manejar diferentes acciones
        switch (action) {
            case 'explore':
                await this.processExplore(interaction, explorationId);
                break;
            case 'battle':
                await this.processBattle(interaction, explorationId);
                break;
            case 'flee':
                await this.processFlee(interaction, explorationId);
                break;
            case 'continue':
                await this.processContinue(interaction, explorationId);
                break;
            case 'return':
                await this.processReturn(interaction, explorationId);
                break;
            case 'finish':
                await this.processFinish(interaction, explorationId);
                break;
            default:
                return false;
        }
        
        return true;
    }
}

module.exports = ExplorationSystem;