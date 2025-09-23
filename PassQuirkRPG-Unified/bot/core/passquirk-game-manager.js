const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');

// Importar todos los sistemas core
const { WorldEngine } = require('./world-engine');
const { ClassSystem } = require('./class-system');
const { CombatSystem } = require('./combat-system');
const { ProgressionSystem } = require('./progression-system');
const { InventorySystem } = require('./inventory-system');
const { QuestSystem } = require('./quest-system');
const { GuildSystem } = require('./guild-system');
const { EventSystem } = require('./event-system');
const { AchievementSystem } = require('./achievement-system');
const { EconomySystem } = require('./economy-system');
const { MissionSystem } = require('./mission-system');

// Importar utilidades
const { PassQuirkEmbed, DialogEmbed, ShopEmbed, InventoryEmbed, ProfileEmbed, ErrorEmbed, SuccessEmbed, MenuEmbed } = require('../utils/embedStyles');
const { UniversalPanelManager } = require('../panels/universal-panel-manager');

// Importar paneles oficiales del repositorio CioMaff/PassQuirk-RPG
const { createOfficialPlayerPanel } = require('../../embeds/official-player-panel');
const { createOfficialCombatPanel, createCombatResultPanel } = require('../../embeds/official-combat-panel');
const { createOfficialShopPanel, createGachaponPanel, createCategoryPanel, createGachaponResultPanel } = require('../../embeds/official-shop-panel');

/**
 * 🎮 PassQuirk Game Manager - El cerebro central del RPG
 * 
 * Este manager coordina todos los sistemas del juego y maneja
 * las interacciones del usuario de manera cohesiva.
 */
class PassQuirkGameManager {
    constructor(client) {
        this.client = client;
        
        // Inicializar todos los sistemas
        this.worldEngine = new WorldEngine();
        this.classSystem = new ClassSystem();
        this.combatSystem = new CombatSystem();
        this.progressionSystem = new ProgressionSystem();
        this.inventorySystem = new InventorySystem();
        this.questSystem = new QuestSystem();
        this.guildSystem = new GuildSystem();
        this.eventSystem = new EventSystem();
        this.achievementSystem = new AchievementSystem();
        this.economySystem = new EconomySystem();
        this.missionSystem = new MissionSystem();
        this.panelManager = new UniversalPanelManager();
        
        // Sesiones activas de jugadores
        this.activeSessions = new Map();
        
        // Inicializar el mundo
        this.initializeWorld();
        
        console.log('🎮 PassQuirk Game Manager inicializado correctamente');
    }
    
    /**
     * Inicializa el mundo del juego con datos oficiales
     */
    async initializeWorld() {
        try {
            // Inicializar el WorldEngine con datos oficiales
            await this.worldEngine.initialize();
            
            // Inicializar eventos globales
            await this.eventSystem.initializeEvents();
            
            // Configurar ciclos del mundo (tiempo, clima, eventos)
            this.worldEngine.startWorldCycles();
            
            // Inicializar misiones diarias
            await this.missionSystem.initializeDailyMissions();
            
            // Configurar eventos de exploración
            this.setupExplorationEvents();
            
            console.log('🌍 Mundo de PassQuirk inicializado con datos oficiales');
        } catch (error) {
            console.error('❌ Error al inicializar el mundo:', error);
        }
    }
    
    /**
     * Configura eventos de exploración basados en el sistema oficial
     */
    setupExplorationEvents() {
        // Configurar eventos de drop especiales
        this.worldEngine.activateEvent({
            id: 'exploration_bonus',
            name: 'Bonificación de Exploración',
            description: 'Mayor probabilidad de encontrar tesoros raros',
            effects: {
                treasure_bonus: 1.5,
                rare_drop_chance: 0.15
            },
            duration: 24 * 60 * 60 * 1000 // 24 horas
        });
    }
    
    /**
     * Obtiene o crea los datos del jugador
     */
    async getPlayerData(userId) {
        try {
            let user = await User.findOne({ where: { userId } });
            
            if (!user) {
                // Crear nuevo jugador
                user = await this.createNewPlayer(userId);
            }
            
            return this.formatPlayerData(user);
        } catch (error) {
            console.error('❌ Error al obtener datos del jugador:', error);
            throw error;
        }
    }
    
    /**
     * Crea un nuevo jugador
     */
    async createNewPlayer(userId) {
        const defaultData = {
            userId,
            characterName: null,
            characterClass: null,
            level: 1,
            experience: 0,
            rpgStats: {
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                attack: 10,
                defense: 5,
                speed: 8,
                intelligence: 7
            },
            balance: 1000,
            gems: 10,
            pg: 0,
            energy: 100,
            reputation: 0,
            location: {
                region: 'Reino de Akai',
                zone: 'Centro de Inicio',
                x: 0,
                y: 0
            },
            inventory: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            quirks: [],
            achievements: [],
            titles: [],
            activeTitle: null,
            quests: {
                main: [],
                side: [],
                daily: [],
                weekly: []
            },
            guild: null,
            lastDaily: null,
            lastWork: null,
            createdAt: new Date()
        };
        
        return await User.create(defaultData);
    }
    
    /**
     * Formatea los datos del jugador para uso en el juego
     */
    formatPlayerData(user) {
        return {
            userId: user.userId,
            characterName: user.characterName,
            characterClass: user.characterClass,
            level: user.level || 1,
            experience: user.experience || 0,
            stats: user.rpgStats || {
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                attack: 10,
                defense: 5,
                speed: 8,
                intelligence: 7
            },
            currencies: {
                balance: user.balance || 1000,
                gems: user.gems || 10,
                pg: user.pg || 0,
                energy: user.energy || 100,
                reputation: user.reputation || 0
            },
            location: user.location || {
                region: 'Reino de Akai',
                zone: 'Centro de Inicio',
                x: 0,
                y: 0
            },
            inventory: user.inventory || [],
            equipment: user.equipment || {
                weapon: null,
                armor: null,
                accessory: null
            },
            quirks: user.quirks || [],
            achievements: user.achievements || [],
            titles: user.titles || [],
            activeTitle: user.activeTitle,
            quests: user.quests || {
                main: [],
                side: [],
                daily: [],
                weekly: []
            },
            guild: user.guild,
            lastDaily: user.lastDaily,
            lastWork: user.lastWork,
            createdAt: user.createdAt
        };
    }
    
    /**
     * Guarda los datos del jugador
     */
    async savePlayerData(userId, playerData) {
        try {
            const user = await User.findOne({ where: { userId } });
            if (!user) throw new Error('Usuario no encontrado');
            
            // Actualizar datos
            await user.update({
                characterName: playerData.characterName,
                characterClass: playerData.characterClass,
                level: playerData.level,
                experience: playerData.experience,
                rpgStats: playerData.stats,
                balance: playerData.currencies.balance,
                gems: playerData.currencies.gems,
                pg: playerData.currencies.pg,
                energy: playerData.currencies.energy,
                reputation: playerData.currencies.reputation,
                location: playerData.location,
                inventory: playerData.inventory,
                equipment: playerData.equipment,
                quirks: playerData.quirks,
                achievements: playerData.achievements,
                titles: playerData.titles,
                activeTitle: playerData.activeTitle,
                quests: playerData.quests,
                guild: playerData.guild,
                lastDaily: playerData.lastDaily,
                lastWork: playerData.lastWork
            });
            
            return true;
        } catch (error) {
            console.error('❌ Error al guardar datos del jugador:', error);
            throw error;
        }
    }
    
    /**
     * Maneja el comando principal del RPG
     */
    async handleMainCommand(interaction) {
        try {
            const playerData = await this.getPlayerData(interaction.user.id);
            
            // Si es un nuevo jugador, mostrar creación de personaje
            if (!playerData.characterName) {
                return await this.showCharacterCreation(interaction, playerData);
            }
            
            // Mostrar panel principal
            return await this.showMainPanel(interaction, playerData);
        } catch (error) {
            console.error('❌ Error en comando principal:', error);
            return await this.showError(interaction, 'Error al cargar el juego');
        }
    }
    
    /**
     * Muestra la pantalla de creación de personaje
     */
    async showCharacterCreation(interaction, playerData) {
        const embed = new PassQuirkEmbed()
            .setTitle('🌟 ¡Bienvenido a PassQuirk RPG! 🌟')
            .setDescription(
                '**¡Tu épica aventura está a punto de comenzar!** ⚔️\n\n' +
                'En el mundo de **PassQuirk**, tus acciones reales se convierten en poder. ' +
                'Estudiar, trabajar, ejercitarte y completar tareas te otorgarán experiencia y recompensas.\n\n' +
                '🎭 **Primero, elige tu clase inicial:**\n' +
                '• **Guerrero** ⚔️ - Maestro del combate físico\n' +
                '• **Mago** 🔮 - Dominador de las artes arcanas\n' +
                '• **Pícaro** 🗡️ - Experto en sigilo y agilidad\n' +
                '• **Sanador** 💚 - Protector y curandero\n' +
                '• **Erudito** 📚 - Buscador del conocimiento\n' +
                '• **Artista** 🎨 - Creador de belleza y magia\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#6C5CE7')
            .setImage('https://i.imgur.com/passquirk-welcome.png')
            .addFields(
                {
                    name: '🎁 Recompensas de Inicio',
                    value: '• 1000 💰 Monedas\n• 10 💎 Gemas\n• Equipo básico\n• Pociones de inicio',
                    inline: true
                },
                {
                    name: '🗺️ Tu Aventura',
                    value: '• Explora 5 regiones únicas\n• Completa misiones épicas\n• Únete a un gremio\n• Desbloquea Quirks especiales',
                    inline: true
                }
            );
        
        const classMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_class')
                    .setPlaceholder('🎭 Elige tu clase inicial...')
                    .addOptions([
                        {
                            label: 'Guerrero',
                            description: 'Maestro del combate físico y la resistencia',
                            value: 'warrior',
                            emoji: '⚔️'
                        },
                        {
                            label: 'Mago',
                            description: 'Dominador de las artes arcanas y la magia',
                            value: 'mage',
                            emoji: '🔮'
                        },
                        {
                            label: 'Pícaro',
                            description: 'Experto en sigilo, agilidad y críticos',
                            value: 'rogue',
                            emoji: '🗡️'
                        },
                        {
                            label: 'Sanador',
                            description: 'Protector del equipo y maestro curandero',
                            value: 'healer',
                            emoji: '💚'
                        },
                        {
                            label: 'Erudito',
                            description: 'Buscador del conocimiento y la sabiduría',
                            value: 'scholar',
                            emoji: '📚'
                        },
                        {
                            label: 'Artista',
                            description: 'Creador de belleza y magia inspiradora',
                            value: 'artist',
                            emoji: '🎨'
                        }
                    ])
            );
        
        const nameButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('set_character_name')
                    .setLabel('✏️ Elegir Nombre')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✏️')
            );
        
        return await interaction.reply({
            embeds: [embed],
            components: [classMenu, nameButton]
        });
    }
    
    /**
     * Muestra el panel principal del juego usando el diseño oficial
     */
    async showMainPanel(interaction, playerData) {
        try {
            // Formatear datos del jugador para el panel oficial
            const formattedPlayerData = {
                name: playerData.characterName,
                clase: this.mapClassToOfficial(playerData.characterClass),
                passquirk: playerData.quirks[0] || 1, // Primer quirk o default
                nivel: playerData.level,
                experiencia: playerData.experience,
                vida: playerData.stats.hp,
                mana: playerData.stats.mp,
                monedas: playerData.currencies.balance,
                gemas: playerData.currencies.gems,
                tickets: playerData.currencies.pg,
                arma: playerData.equipment.weapon || 'Espada Básica',
                armadura: playerData.equipment.armor || 'Túnica Inicial',
                accesorio: playerData.equipment.accessory || 'Ninguno',
                zona: playerData.location.region || '🌟 Reino de Akai',
                region: playerData.location.zone || 'Zona Inicial',
                ultimaActividad: new Date(),
                misionesCompletadas: playerData.achievements.length,
                enemigosDerrrotados: playerData.stats.enemiesDefeated || 0,
                avatar: interaction.user.displayAvatarURL({ dynamic: true })
            };
            
            // Usar el panel oficial del repositorio CioMaff/PassQuirk-RPG
            const panelData = createOfficialPlayerPanel(formattedPlayerData);
            
            return await interaction.reply(panelData);
        } catch (error) {
            console.error('❌ Error al mostrar panel oficial:', error);
            // Fallback al panel original si hay error
            return await this.showLegacyMainPanel(interaction, playerData);
        }
    }
    
    /**
     * Mapea las clases del bot actual a las clases oficiales
     */
    mapClassToOfficial(currentClass) {
        const classMapping = {
            'Guerrero': 'celestial',
            'Mago': 'fenix',
            'Pícaro': 'sombra',
            'Sanador': 'inmortal',
            'Erudito': 'demon',
            'Artista': 'berserker'
        };
        return classMapping[currentClass] || 'celestial';
    }
    
    /**
     * Panel principal legacy como fallback
     */
    async showLegacyMainPanel(interaction, playerData) {
        // Calcular estadísticas dinámicas
        const totalStats = Object.values(playerData.stats).reduce((a, b) => a + b, 0);
        const nextLevelXP = this.progressionSystem.getXPForLevel(playerData.level + 1);
        const currentRegion = this.worldEngine.getRegion(playerData.location.region);
        
        // Determinar rango
        let rank = this.getRankByLevel(playerData.level);
        
        const embed = new PassQuirkEmbed()
            .setTitle(`⚔️ ${playerData.characterName} - Panel Principal ⚔️`)
            .setDescription(
                `**¡Bienvenido de vuelta, ${playerData.characterName}!** 🌟\n\n` +
                `🎭 **${playerData.characterClass}** | ${rank} | 💪 **Poder:** ${totalStats}\n` +
                `📍 **${currentRegion.name}** - ${playerData.location.zone}\n\n` +
                '¿Qué aventura te espera hoy en PassQuirk?\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: '📊 Estado del Personaje',
                    value: `\`\`\`yaml\n` +
                           `Nivel: ${playerData.level} ⭐\n` +
                           `HP: ${playerData.stats.hp}/${playerData.stats.maxHp} ❤️\n` +
                           `MP: ${playerData.stats.mp}/${playerData.stats.maxMp} 💙\n` +
                           `XP: ${playerData.experience}/${nextLevelXP} ✨\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '💰 Recursos',
                    value: `\`\`\`yaml\n` +
                           `Monedas: ${playerData.currencies.balance} 🪙\n` +
                           `Gemas: ${playerData.currencies.gems} 💎\n` +
                           `PG: ${playerData.currencies.pg} ⚡\n` +
                           `Energía: ${playerData.currencies.energy}/100 🔋\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '🎯 Progreso Actual',
                    value: `\`\`\`yaml\n` +
                           `Quirks: ${playerData.quirks.length}/10 🌟\n` +
                           `Logros: ${playerData.achievements.length} 🏆\n` +
                           `Misiones: ${playerData.quests.daily.length} 📜\n` +
                           `\`\`\``,
                    inline: true
                }
            );
        
        // Agregar información del evento actual si existe
        const currentEvent = this.eventSystem.getCurrentEvent();
        if (currentEvent) {
            embed.addFields({
                name: '🎉 Evento Activo',
                value: `**${currentEvent.name}**\n${currentEvent.description}\n⏰ Termina: <t:${Math.floor(currentEvent.endTime / 1000)}:R>`,
                inline: false
            });
        }
        
        const navigationMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('main_navigation')
                    .setPlaceholder('🎮 Selecciona una acción...')
                    .addOptions([
                        {
                            label: '👤 Perfil de Personaje',
                            description: 'Ver y gestionar tu personaje',
                            value: 'character_profile',
                            emoji: '👤'
                        },
                        {
                            label: '🎒 Inventario',
                            description: 'Gestiona tus objetos y equipo',
                            value: 'inventory',
                            emoji: '🎒'
                        },
                        {
                            label: '⚔️ Combate',
                            description: 'Buscar enemigos y entrenar',
                            value: 'combat',
                            emoji: '⚔️'
                        },
                        {
                            label: '🗺️ Explorar',
                            description: 'Explora nuevas regiones',
                            value: 'explore',
                            emoji: '🗺️'
                        },
                        {
                            label: '🏪 Tienda',
                            description: 'Compra objetos y mejoras',
                            value: 'shop',
                            emoji: '🏪'
                        },
                        {
                            label: '📜 Misiones',
                            description: 'Ver misiones disponibles',
                            value: 'missions',
                            emoji: '📜'
                        }
                    ])
            );
        
        const quickActions = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('quick_work')
                    .setLabel('💼 Trabajar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💰'),
                new ButtonBuilder()
                    .setCustomId('quick_daily')
                    .setLabel('🎁 Recompensa Diaria')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎁'),
                new ButtonBuilder()
                    .setCustomId('quick_stats')
                    .setLabel('📊 Estadísticas')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📊'),
                new ButtonBuilder()
                    .setCustomId('quick_heal')
                    .setLabel('💚 Curar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('💚')
            );
        
        return await interaction.reply({
            embeds: [embed],
            components: [navigationMenu, quickActions]
        });
    }
    
    /**
     * Obtiene el rango basado en el nivel
     */
    getRankByLevel(level) {
        if (level >= 100) return '👑 Leyenda Suprema';
        if (level >= 80) return '🌟 Leyenda';
        if (level >= 60) return '💎 Gran Maestro';
        if (level >= 40) return '🥇 Maestro';
        if (level >= 25) return '🥈 Experto';
        if (level >= 15) return '🥉 Veterano';
        if (level >= 5) return '⚡ Aventurero';
        return '🌱 Novato';
    }
    
    /**
     * Muestra un mensaje de error
     */
    async showError(interaction, message) {
        const embed = new ErrorEmbed(new Error(message));
        
        if (interaction.replied || interaction.deferred) {
            return await interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
    
    /**
     * Maneja las interacciones de botones
     */
    async handleButtonInteraction(interaction) {
        const buttonId = interaction.customId;
        const userId = interaction.user.id;
        
        try {
            const playerData = await this.getPlayerData(userId);
            
            switch (buttonId) {
                case 'quick_work':
                    return await this.handleQuickWork(interaction, playerData);
                case 'quick_daily':
                    return await this.handleQuickDaily(interaction, playerData);
                case 'quick_stats':
                    return await this.handleQuickStats(interaction, playerData);
                case 'quick_heal':
                    return await this.handleQuickHeal(interaction, playerData);
                case 'set_character_name':
                    return await this.handleSetCharacterName(interaction, playerData);
                case 'back_to_main':
                    return await this.showMainPanel(interaction, playerData);
                case 'continue_to_game':
                    return await this.showMainPanel(interaction, playerData);
                case 'start_quest':
                    if (!playerData.hasCharacter) {
                        return await this.showCharacterCreation(interaction);
                    } else {
                        return await this.showMainPanel(interaction, playerData);
                    }
                // Botones de exploración
                case 'explore_current':
                    return await this.handleExplorationAction(interaction, playerData, 'explore_current');
                case 'rest_at_inn':
                    return await this.handleExplorationAction(interaction, playerData, 'rest_at_inn');
                case 'continue_exploration':
                    return await this.performExploration(interaction, playerData);
                // Botones de combate
                default:
                    if (buttonId.startsWith('fight_')) {
                        const enemyId = buttonId.replace('fight_', '');
                        return await this.handleCombatStart(interaction, playerData, enemyId);
                    }
                    if (buttonId === 'flee_combat') {
                        return await this.handleCombatFlee(interaction, playerData);
                    }
                    // Botones de interacción con NPCs
                    if (buttonId.startsWith('talk_')) {
                        const npcId = buttonId.replace('talk_', '');
                        return await this.handleNPCTalk(interaction, playerData, npcId);
                    }
                    if (buttonId.startsWith('trade_')) {
                        const npcId = buttonId.replace('trade_', '');
                        return await this.handleNPCTrade(interaction, playerData, npcId);
                    }
                    return await this.showError(interaction, 'Acción no reconocida');
            }
        } catch (error) {
            console.error('❌ Error en interacción de botón:', error);
            return await this.showError(interaction, 'Error al procesar la acción');
        }
    }
    
    /**
     * Maneja las interacciones de menús
     */
    async handleSelectMenuInteraction(interaction) {
        const menuId = interaction.customId;
        const selectedValue = interaction.values[0];
        const userId = interaction.user.id;
        
        try {
            const playerData = await this.getPlayerData(userId);
            
            switch (menuId) {
                case 'select_class':
                    return await this.handleClassSelection(interaction, playerData, selectedValue);
                case 'main_navigation':
                    return await this.handleMainNavigation(interaction, playerData, selectedValue);
                case 'exploration_region':
                    return await this.handleRegionSelection(interaction, playerData, selectedValue);
                case 'exploration_action':
                    return await this.handleExplorationAction(interaction, playerData, selectedValue);
                default:
                    return await this.showError(interaction, 'Menú no reconocido');
            }
        } catch (error) {
            console.error('❌ Error en interacción de menú:', error);
            return await this.showError(interaction, 'Error al procesar la selección');
        }
    }
    
    /**
     * Maneja la selección de clase
     */
    async handleClassSelection(interaction, playerData, selectedClass) {
        const classData = this.classSystem.getClass(selectedClass);
        if (!classData) {
            return await this.showError(interaction, 'Clase no válida');
        }
        
        // Actualizar datos del jugador
        playerData.characterClass = classData.name;
        playerData.stats = this.classSystem.calculatePlayerStats(playerData, selectedClass);
        
        // Agregar Quirk inicial de la clase
        if (classData.uniqueQuirks && classData.uniqueQuirks.length > 0) {
            playerData.quirks.push(classData.uniqueQuirks[0]);
        }
        
        // Guardar cambios
        await this.savePlayerData(playerData.userId, playerData);
        
        const embed = new SuccessEmbed(
            `¡Has elegido la clase **${classData.name}**! ${classData.emoji}\n\n` +
            `**Descripción:** ${classData.description}\n\n` +
            `**Estadísticas base:**\n` +
            `• Ataque: ${playerData.stats.attack}\n` +
            `• Defensa: ${playerData.stats.defense}\n` +
            `• Velocidad: ${playerData.stats.speed}\n` +
            `• Inteligencia: ${playerData.stats.intelligence}\n\n` +
            `**Quirk inicial desbloqueado:** ${classData.uniqueQuirks[0]}`,
            { title: '🎭 Clase Seleccionada' }
        );
        
        const continueButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('continue_to_game')
                    .setLabel('🚀 ¡Comenzar Aventura!')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🚀')
            );
        
        return await interaction.update({
            embeds: [embed],
            components: [continueButton]
        });
    }
    
    /**
     * Maneja la navegación principal
     */
    async handleMainNavigation(interaction, playerData, selectedValue) {
        switch (selectedValue) {
            case 'character_profile':
                return await this.showCharacterProfile(interaction, playerData);
            case 'inventory':
                return await this.showInventory(interaction, playerData);
            case 'combat':
                return await this.showCombat(interaction, playerData);
            case 'explore':
                return await this.showExploration(interaction, playerData);
            case 'shop':
                return await this.showShop(interaction, playerData);
            case 'missions':
                return await this.showMissions(interaction, playerData);
            default:
                return await this.showError(interaction, 'Opción no válida');
        }
    }
    
    /**
     * Muestra el perfil del personaje
     */
    async showCharacterProfile(interaction, playerData) {
        const classData = this.classSystem.getClass(playerData.characterClass.toLowerCase());
        const nextLevelXP = this.progressionSystem.getXPForLevel(playerData.level + 1);
        
        const embed = new ProfileEmbed(interaction.user, {
            level: playerData.level,
            xp: playerData.experience,
            xpToNext: nextLevelXP,
            rank: this.getRankByLevel(playerData.level),
            balance: playerData.currencies.balance,
            gems: playerData.currencies.gems,
            pg: playerData.currencies.pg
        })
            .addFields(
                {
                    name: '🎭 Información de Clase',
                    value: `**Clase:** ${playerData.characterClass}\n` +
                           `**Descripción:** ${classData?.description || 'Sin descripción'}\n` +
                           `**Región preferida:** ${classData?.preferredRegion || 'Ninguna'}`,
                    inline: false
                },
                {
                    name: '⚔️ Estadísticas de Combate',
                    value: `\`\`\`yaml\n` +
                           `Ataque: ${playerData.stats.attack}\n` +
                           `Defensa: ${playerData.stats.defense}\n` +
                           `Velocidad: ${playerData.stats.speed}\n` +
                           `Inteligencia: ${playerData.stats.intelligence}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '🌟 Quirks Activos',
                    value: playerData.quirks.length > 0 ? 
                           playerData.quirks.map(quirk => `• ${quirk}`).join('\n') :
                           '*No tienes Quirks activos*',
                    inline: true
                }
            );
        
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.update({
            embeds: [embed],
            components: [backButton]
        });
    }
    
    /**
     * Maneja el trabajo rápido
     */
    async handleQuickWork(interaction, playerData) {
        const now = new Date();
        const lastWork = playerData.lastWork ? new Date(playerData.lastWork) : null;
        const timeDiff = lastWork ? now - lastWork : Infinity;
        const cooldownTime = 4 * 60 * 60 * 1000; // 4 horas en milisegundos
        
        if (timeDiff < cooldownTime) {
            const remainingTime = Math.ceil((cooldownTime - timeDiff) / (60 * 1000));
            const hours = Math.floor(remainingTime / 60);
            const minutes = remainingTime % 60;
            
            return await this.showError(interaction, 
                `⏰ Debes esperar **${hours}h ${minutes}m** antes de poder trabajar de nuevo.`);
        }
        
        // Calcular recompensas basadas en la clase y nivel
        const classData = this.classSystem.getClass(playerData.characterClass.toLowerCase());
        const baseReward = 50 + (playerData.level * 10);
        const classMultiplier = classData?.workMultiplier || 1;
        const finalReward = Math.floor(baseReward * classMultiplier);
        const xpGained = Math.floor(finalReward / 10);
        
        // Actualizar datos del jugador
        playerData.currencies.balance += finalReward;
        playerData.experience += xpGained;
        playerData.lastWork = now.toISOString();
        
        // Verificar subida de nivel
        const leveledUp = this.progressionSystem.checkLevelUp(playerData);
        
        await this.savePlayerData(playerData);
        
        const embed = new SuccessEmbed(
            `💼 **¡Has completado tu trabajo!**\n\n` +
            `💰 **Ganaste:** ${finalReward} monedas\n` +
            `⭐ **Experiencia:** +${xpGained} XP\n` +
            `${leveledUp ? `🎉 **¡SUBISTE DE NIVEL!** Ahora eres nivel ${playerData.level}` : ''}`,
            { title: '💼 Trabajo Completado' }
        );
        
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.reply({
            embeds: [embed],
            components: [backButton],
            ephemeral: true
        });
    }
    
    /**
     * Maneja la recompensa diaria
     */
    async handleQuickDaily(interaction, playerData) {
        const now = new Date();
        const lastDaily = playerData.lastDaily ? new Date(playerData.lastDaily) : null;
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastDailyDate = lastDaily ? new Date(lastDaily.getFullYear(), lastDaily.getMonth(), lastDaily.getDate()) : null;
        
        if (lastDailyDate && lastDailyDate.getTime() === today.getTime()) {
            return await this.showError(interaction, 
                '🎁 Ya has reclamado tu recompensa diaria hoy. ¡Vuelve mañana!');
        }
        
        // Calcular racha
        let streak = playerData.dailyStreak || 0;
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDailyDate && lastDailyDate.getTime() === yesterday.getTime()) {
            streak += 1;
        } else if (!lastDailyDate || lastDailyDate.getTime() < yesterday.getTime()) {
            streak = 1;
        }
        
        // Calcular recompensas
        const baseCoins = 100;
        const streakBonus = Math.min(streak * 10, 200);
        const totalCoins = baseCoins + streakBonus;
        const gems = streak >= 7 ? 1 : 0;
        const xp = 25 + (streak * 5);
        
        // Actualizar datos
        playerData.currencies.balance += totalCoins;
        playerData.currencies.gems += gems;
        playerData.experience += xp;
        playerData.lastDaily = now.toISOString();
        playerData.dailyStreak = streak;
        
        const leveledUp = this.progressionSystem.checkLevelUp(playerData);
        
        await this.savePlayerData(playerData);
        
        const embed = new SuccessEmbed(
            `🎁 **¡Recompensa diaria reclamada!**\n\n` +
            `💰 **Monedas:** +${totalCoins}\n` +
            `${gems > 0 ? `💎 **Gemas:** +${gems}\n` : ''}` +
            `⭐ **Experiencia:** +${xp} XP\n` +
            `🔥 **Racha:** ${streak} días\n` +
            `${leveledUp ? `🎉 **¡SUBISTE DE NIVEL!** Ahora eres nivel ${playerData.level}` : ''}`,
            { title: '🎁 Recompensa Diaria' }
        );
        
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.reply({
            embeds: [embed],
            components: [backButton],
            ephemeral: true
        });
    }
    
    /**
     * Maneja las estadísticas rápidas
     */
    async handleQuickStats(interaction, playerData) {
        const classData = this.classSystem.getClass(playerData.characterClass.toLowerCase());
        const nextLevelXP = this.progressionSystem.getXPForLevel(playerData.level + 1);
        const currentXP = playerData.experience;
        const xpProgress = ((currentXP % 1000) / 1000) * 100;
        
        const embed = new InfoEmbed(
            `📊 **Estadísticas de ${playerData.characterName}**\n\n` +
            `🎭 **Clase:** ${playerData.characterClass}\n` +
            `⭐ **Nivel:** ${playerData.level}\n` +
            `🌟 **Experiencia:** ${currentXP}/${nextLevelXP} (${xpProgress.toFixed(1)}%)\n` +
            `🏆 **Rango:** ${this.getRankByLevel(playerData.level)}\n\n` +
            `💰 **Monedas:** ${playerData.currencies.balance.toLocaleString()}\n` +
            `💎 **Gemas:** ${playerData.currencies.gems}\n` +
            `🌟 **PG:** ${playerData.currencies.pg}\n\n` +
            `⚔️ **Ataque:** ${playerData.stats.attack}\n` +
            `🛡️ **Defensa:** ${playerData.stats.defense}\n` +
            `⚡ **Velocidad:** ${playerData.stats.speed}\n` +
            `🧠 **Inteligencia:** ${playerData.stats.intelligence}\n\n` +
            `❤️ **HP:** ${playerData.stats.hp}/${playerData.stats.maxHp}\n` +
            `💙 **MP:** ${playerData.stats.mp}/${playerData.stats.maxMp}`,
            { title: '📊 Estadísticas Rápidas' }
        );
        
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.reply({
            embeds: [embed],
            components: [backButton],
            ephemeral: true
        });
    }
    
    /**
     * Maneja la curación rápida
     */
    async handleQuickHeal(interaction, playerData) {
        const maxHp = playerData.stats.maxHp;
        const currentHp = playerData.stats.hp;
        const maxMp = playerData.stats.maxMp;
        const currentMp = playerData.stats.mp;
        
        if (currentHp >= maxHp && currentMp >= maxMp) {
            return await this.showError(interaction, 
                '💚 Ya tienes la salud y maná al máximo.');
        }
        
        const healCost = 50;
        
        if (playerData.currencies.balance < healCost) {
            return await this.showError(interaction, 
                `💰 Necesitas ${healCost} monedas para curarte.`);
        }
        
        // Curar completamente
        playerData.stats.hp = maxHp;
        playerData.stats.mp = maxMp;
        playerData.currencies.balance -= healCost;
        
        await this.savePlayerData(playerData);
        
        const embed = new SuccessEmbed(
            `💚 **¡Te has curado completamente!**\n\n` +
            `❤️ **HP:** ${maxHp}/${maxHp}\n` +
            `💙 **MP:** ${maxMp}/${maxMp}\n\n` +
            `💰 **Costo:** ${healCost} monedas`,
            { title: '💚 Curación Completa' }
        );
        
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.reply({
            embeds: [embed],
            components: [backButton],
            ephemeral: true
        });
    }
    
    /**
     * Maneja el establecimiento del nombre del personaje
     */
    async handleSetCharacterName(interaction, playerData) {
        // Este método se implementará cuando se añada el modal para nombres
        return await this.showError(interaction, 'Función en desarrollo');
    }
    
    /**
     * Métodos adicionales para inventario, tienda, combate, etc.
     */
    async showInventory(interaction, playerData) {
        const embed = new InfoEmbed(
            '🎒 **Tu inventario está vacío por ahora.**\n\n' +
            'Completa misiones y explora el mundo para obtener objetos épicos.',
            { title: '🎒 Inventario' }
        );
        
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.update({
            embeds: [embed],
            components: [backButton]
        });
    }
    
    async showCombat(interaction, playerData) {
        const embed = new InfoEmbed(
            '⚔️ **Sistema de combate en desarrollo**\n\n' +
            'Pronto podrás enfrentarte a enemigos épicos y ganar recompensas increíbles.',
            { title: '⚔️ Combate' }
        );
        
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.update({
            embeds: [embed],
            components: [backButton]
        });
    }
    
    async showExploration(interaction, playerData) {
        const currentRegion = this.worldEngine.getRegion(playerData.location.region);
        const availableRegions = this.worldEngine.getRegionsForLevel(playerData.level);
        const timeOfDay = this.worldEngine.getTimeOfDay();
        
        const embed = new PassQuirkEmbed()
            .setTitle('🗺️ Exploración - Mundo de PassQuirk')
            .setDescription(
                `**¡Explora el vasto mundo de PassQuirk!** 🌍\n\n` +
                `📍 **Ubicación Actual:** ${currentRegion.name}\n` +
                `🕐 **Hora del Día:** ${this.getTimeEmoji(timeOfDay)} ${timeOfDay}\n` +
                `⚡ **Energía:** ${playerData.currencies.energy}/100\n\n` +
                `Cada exploración consume **10 energía** y puede otorgarte:\n` +
                `• 💰 Oro y recursos\n` +
                `• 🎒 Objetos raros\n` +
                `• ⚔️ Encuentros con enemigos\n` +
                `• 🎭 NPCs con misiones\n` +
                `• 🌟 Eventos especiales\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
            )
            .setColor(currentRegion.color)
            .addFields(
                {
                    name: `${currentRegion.emoji} ${currentRegion.name}`,
                    value: `${currentRegion.description}\n\n` +
                           `**Nivel:** ${currentRegion.levelRange.min}-${currentRegion.levelRange.max}\n` +
                           `**Clima:** ${currentRegion.climate}\n` +
                           `**Peligros:** ${currentRegion.dangers.join(', ')}`,
                    inline: false
                }
            );
        
        // Agregar información de regiones disponibles
        if (availableRegions.length > 1) {
            const regionList = availableRegions
                .filter(r => r.id !== currentRegion.id)
                .map(r => `${r.emoji} **${r.name}** (Nv.${r.levelRange.min}-${r.levelRange.max})`)
                .join('\n');
            
            embed.addFields({
                name: '🌍 Regiones Disponibles',
                value: regionList || 'Ninguna región adicional disponible',
                inline: false
            });
        }
        
        // Menú de regiones
        const regionMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('exploration_region')
                    .setPlaceholder('🗺️ Selecciona una región para explorar...')
                    .addOptions(
                        availableRegions.map(region => ({
                            label: region.name,
                            description: `Nivel ${region.levelRange.min}-${region.levelRange.max} | ${region.theme}`,
                            value: region.id,
                            emoji: region.emoji
                        }))
                    )
            );
        
        // Botones de acción
        const actionButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('explore_current')
                    .setLabel(`Explorar ${currentRegion.name}`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔍')
                    .setDisabled(playerData.currencies.energy < 10),
                new ButtonBuilder()
                    .setCustomId('rest_at_inn')
                    .setLabel('Descansar en Posada')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🏨'),
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('Volver')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.update({
            embeds: [embed],
            components: [regionMenu, actionButtons]
        });
    }
    
    /**
     * Obtiene el emoji correspondiente a la hora del día
     */
    getTimeEmoji(timeOfDay) {
        const timeEmojis = {
            'dawn': '🌅',
            'day': '☀️',
            'dusk': '🌇',
            'night': '🌙'
        };
        return timeEmojis[timeOfDay] || '🕐';
    }
    
    /**
     * Maneja la selección de región para explorar
     */
    async handleRegionSelection(interaction, playerData, regionId) {
        const region = this.worldEngine.getRegion(regionId);
        if (!region) {
            return await this.showError(interaction, 'Región no encontrada');
        }
        
        // Verificar si el jugador puede acceder a esta región
        if (playerData.level < region.levelRange.min) {
            return await this.showError(interaction, 
                `Necesitas nivel ${region.levelRange.min} para explorar ${region.name}`);
        }
        
        // Actualizar ubicación del jugador
        playerData.location.region = regionId;
        playerData.location.zone = 'Entrada';
        await this.savePlayerData(playerData.userId, playerData);
        
        const embed = new SuccessEmbed(
            `🗺️ **¡Has viajado a ${region.name}!**\n\n` +
            `${region.description}\n\n` +
            `Ahora puedes explorar esta nueva región y descubrir sus secretos.`
        );
        
        const exploreButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('explore_current')
                    .setLabel(`Explorar ${region.name}`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔍'),
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('Volver al Panel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.update({
            embeds: [embed],
            components: [exploreButton]
        });
    }
    
    /**
     * Maneja las acciones de exploración
     */
    async handleExplorationAction(interaction, playerData, action) {
        switch (action) {
            case 'explore_current':
                return await this.performExploration(interaction, playerData);
            case 'rest_at_inn':
                return await this.restAtInn(interaction, playerData);
            default:
                return await this.showError(interaction, 'Acción de exploración no válida');
        }
    }
    
    /**
     * Realiza una exploración en la región actual
     */
    async performExploration(interaction, playerData) {
        // Verificar energía
        if (playerData.currencies.energy < 10) {
            return await this.showError(interaction, 
                'No tienes suficiente energía. Descansa en una posada para recuperarla.');
        }
        
        // Consumir energía
        playerData.currencies.energy -= 10;
        
        // Generar encuentro aleatorio usando el WorldEngine
        const currentRegion = this.worldEngine.getRegion(playerData.location.region);
        const encounterType = this.worldEngine.generateRandomEncounter(currentRegion, playerData.level);
        
        let embed, components;
        
        switch (encounterType.type) {
            case 'enemy':
                ({ embed, components } = await this.handleEnemyEncounter(interaction, playerData, encounterType));
                break;
            case 'treasure':
                ({ embed, components } = await this.handleTreasureEncounter(interaction, playerData, encounterType));
                break;
            case 'npc':
                ({ embed, components } = await this.handleNPCEncounter(interaction, playerData, encounterType));
                break;
            case 'event':
                ({ embed, components } = await this.handleSpecialEvent(interaction, playerData, encounterType));
                break;
            default:
                ({ embed, components } = await this.handleEmptyExploration(interaction, playerData));
        }
        
        // Guardar datos actualizados
        await this.savePlayerData(playerData.userId, playerData);
        
        return await interaction.update({
            embeds: [embed],
            components: [components]
        });
    }
    
    /**
     * Maneja encuentros con enemigos
     */
    async handleEnemyEncounter(interaction, playerData, encounter) {
        const enemy = encounter.enemy;
        
        const embed = new PassQuirkEmbed()
            .setTitle(`⚔️ ¡Encuentro con ${enemy.name}!`)
            .setDescription(
                `${enemy.emoji} **${enemy.name}** aparece ante ti!\n\n` +
                `${enemy.description}\n\n` +
                `**Nivel:** ${enemy.level} | **Rareza:** ${enemy.rarity}\n` +
                `**Recompensas potenciales:**\n` +
                `• 💰 ${encounter.rewards.gold} oro\n` +
                `• ✨ ${encounter.rewards.exp} experiencia\n` +
                `• 🎒 Posibles objetos raros`
            )
            .setColor('#FF6B6B');
        
        const components = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`fight_${enemy.id}`)
                    .setLabel('⚔️ Luchar')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('flee_combat')
                    .setLabel('🏃 Huir')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        return { embed, components };
    }
    
    /**
     * Maneja encuentros con tesoros
     */
    async handleTreasureEncounter(interaction, playerData, encounter) {
        const treasure = encounter.treasure;
        
        // Agregar recompensas al jugador
        playerData.currencies.balance += treasure.gold;
        if (treasure.item) {
            playerData.inventory.push({
                id: treasure.item.id,
                name: treasure.item.name,
                quantity: 1,
                obtainedAt: new Date()
            });
        }
        
        const embed = new SuccessEmbed(
            `💰 **¡Has encontrado un tesoro!**\n\n` +
            `🪙 **+${treasure.gold} oro**\n` +
            (treasure.item ? `🎒 **${treasure.item.name}** añadido al inventario\n` : '') +
            `\n¡Excelente descubrimiento!`
        );
        
        const components = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('explore_current')
                    .setLabel('🔍 Seguir Explorando')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(playerData.currencies.energy < 10),
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        return { embed, components };
    }
    
    /**
     * Maneja encuentros con NPCs
     */
    async handleNPCEncounter(interaction, playerData, encounter) {
        const npc = encounter.npc;
        
        const embed = new PassQuirkEmbed()
            .setTitle(`🎭 Encuentro con ${npc.name}`)
            .setDescription(
                `${npc.emoji} **${npc.name}**\n\n` +
                `*"${npc.dialogue}"*\n\n` +
                `${npc.description}`
            )
            .setColor('#4ECDC4');
        
        const components = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`talk_${npc.id}`)
                    .setLabel('💬 Hablar')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`trade_${npc.id}`)
                    .setLabel('🤝 Comerciar')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('continue_exploration')
                    .setLabel('🚶 Continuar')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        return { embed, components };
    }
    
    /**
     * Maneja eventos especiales
     */
    async handleSpecialEvent(interaction, playerData, encounter) {
        const event = encounter.event;
        
        // Aplicar efectos del evento
        if (event.rewards) {
            if (event.rewards.exp) {
                playerData.experience += event.rewards.exp;
            }
            if (event.rewards.gold) {
                playerData.currencies.balance += event.rewards.gold;
            }
            if (event.rewards.items) {
                event.rewards.items.forEach(item => {
                    playerData.inventory.push({
                        id: item.id,
                        name: item.name,
                        quantity: 1,
                        obtainedAt: new Date()
                    });
                });
            }
        }
        
        const embed = new PassQuirkEmbed()
            .setTitle(`🌟 ${event.name}`)
            .setDescription(
                `${event.description}\n\n` +
                (event.rewards ? 
                    `**Recompensas obtenidas:**\n` +
                    (event.rewards.exp ? `• ✨ +${event.rewards.exp} experiencia\n` : '') +
                    (event.rewards.gold ? `• 💰 +${event.rewards.gold} oro\n` : '') +
                    (event.rewards.items ? event.rewards.items.map(item => `• 🎒 ${item.name}`).join('\n') : '')
                    : '')
            )
            .setColor('#FFD93D');
        
        const components = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('explore_current')
                    .setLabel('🔍 Seguir Explorando')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(playerData.currencies.energy < 10),
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        return { embed, components };
    }
    
    /**
     * Maneja exploración sin encuentros
     */
    async handleEmptyExploration(interaction, playerData) {
        const embed = new PassQuirkEmbed()
            .setTitle('🔍 Exploración Tranquila')
            .setDescription(
                'Has explorado la zona pero no has encontrado nada de interés esta vez.\n\n' +
                'A veces la aventura requiere paciencia. ¡Sigue explorando!'
            )
            .setColor('#95A5A6');
        
        const components = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('explore_current')
                    .setLabel('🔍 Seguir Explorando')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(playerData.currencies.energy < 10),
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        return { embed, components };
    }
    
    /**
     * Permite al jugador descansar en una posada
     */
    async restAtInn(interaction, playerData) {
        const cost = 50;
        
        if (playerData.currencies.balance < cost) {
            return await this.showError(interaction, 
                `No tienes suficiente oro. Necesitas ${cost} monedas para descansar.`);
        }
        
        // Cobrar y restaurar energía
        playerData.currencies.balance -= cost;
        playerData.currencies.energy = 100;
        playerData.stats.hp = playerData.stats.maxHp;
        playerData.stats.mp = playerData.stats.maxMp;
        
        await this.savePlayerData(playerData.userId, playerData);
        
        const embed = new SuccessEmbed(
            `🏨 **¡Has descansado en la posada!**\n\n` +
            `💰 -${cost} oro\n` +
            `⚡ Energía restaurada (100/100)\n` +
            `❤️ HP restaurado\n` +
            `💙 MP restaurado\n\n` +
            `¡Te sientes renovado y listo para la aventura!`
        );
        
        const components = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('explore_current')
                    .setLabel('🔍 Explorar')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        return await interaction.update({
             embeds: [embed],
             components: [components]
         });
     }
     
     /**
      * Maneja el inicio de combate
      */
     async handleCombatStart(interaction, playerData, enemyId) {
         const embed = new PassQuirkEmbed()
             .setTitle('⚔️ Sistema de Combate')
             .setDescription(
                 '¡El sistema de combate está en desarrollo!\n\n' +
                 'Pronto podrás enfrentarte a enemigos épicos y ganar recompensas increíbles.\n\n' +
                 '🔥 **Características próximas:**\n' +
                 '• Combate por turnos estratégico\n' +
                 '• Uso de Quirks en batalla\n' +
                 '• Recompensas basadas en dificultad\n' +
                 '• Sistema de críticos y esquivas'
             )
             .setColor('#FF6B6B');
         
         const backButton = new ActionRowBuilder()
             .addComponents(
                 new ButtonBuilder()
                     .setCustomId('back_to_main')
                     .setLabel('🏠 Volver al Panel')
                     .setStyle(ButtonStyle.Secondary)
             );
         
         return await interaction.update({
             embeds: [embed],
             components: [backButton]
         });
     }
     
     /**
      * Maneja huir del combate
      */
     async handleCombatFlee(interaction, playerData) {
         const embed = new PassQuirkEmbed()
             .setTitle('🏃 Has huido del combate')
             .setDescription(
                 'Has decidido retirarte estratégicamente del combate.\n\n' +
                 'A veces la discreción es la mejor parte del valor.'
             )
             .setColor('#95A5A6');
         
         const exploreButton = new ActionRowBuilder()
             .addComponents(
                 new ButtonBuilder()
                     .setCustomId('explore_current')
                     .setLabel('🔍 Seguir Explorando')
                     .setStyle(ButtonStyle.Primary)
                     .setDisabled(playerData.currencies.energy < 10),
                 new ButtonBuilder()
                     .setCustomId('back_to_main')
                     .setLabel('🏠 Volver al Panel')
                     .setStyle(ButtonStyle.Secondary)
             );
         
         return await interaction.update({
             embeds: [embed],
             components: [exploreButton]
         });
     }
     
     /**
      * Maneja conversaciones con NPCs
      */
     async handleNPCTalk(interaction, playerData, npcId) {
         const embed = new PassQuirkEmbed()
             .setTitle('💬 Conversación con NPC')
             .setDescription(
                 '¡El sistema de diálogos está en desarrollo!\n\n' +
                 'Pronto podrás tener conversaciones profundas con NPCs únicos.\n\n' +
                 '🎭 **Características próximas:**\n' +
                 '• Diálogos ramificados\n' +
                 '• Misiones especiales\n' +
                 '• Información del mundo\n' +
                 '• Relaciones con NPCs'
             )
             .setColor('#4ECDC4');
         
         const backButton = new ActionRowBuilder()
             .addComponents(
                 new ButtonBuilder()
                     .setCustomId('continue_exploration')
                     .setLabel('🚶 Continuar Explorando')
                     .setStyle(ButtonStyle.Primary),
                 new ButtonBuilder()
                     .setCustomId('back_to_main')
                     .setLabel('🏠 Volver al Panel')
                     .setStyle(ButtonStyle.Secondary)
             );
         
         return await interaction.update({
             embeds: [embed],
             components: [backButton]
         });
     }
     
     /**
      * Maneja comercio con NPCs
      */
     async handleNPCTrade(interaction, playerData, npcId) {
         const embed = new PassQuirkEmbed()
             .setTitle('🤝 Comercio con NPC')
             .setDescription(
                 '¡El sistema de comercio está en desarrollo!\n\n' +
                 'Pronto podrás intercambiar objetos y recursos con NPCs.\n\n' +
                 '💰 **Características próximas:**\n' +
                 '• Tiendas especializadas\n' +
                 '• Intercambio de objetos raros\n' +
                 '• Precios dinámicos\n' +
                 '• Descuentos por reputación'
             )
             .setColor('#F39C12');
         
         const backButton = new ActionRowBuilder()
             .addComponents(
                 new ButtonBuilder()
                     .setCustomId('continue_exploration')
                     .setLabel('🚶 Continuar Explorando')
                     .setStyle(ButtonStyle.Primary),
                 new ButtonBuilder()
                     .setCustomId('back_to_main')
                     .setLabel('🏠 Volver al Panel')
                     .setStyle(ButtonStyle.Secondary)
             );
         
         return await interaction.update({
             embeds: [embed],
             components: [backButton]
         });
     }
     
     async showShop(interaction, playerData) {
        const embed = new InfoEmbed(
            '🏪 **Tienda en desarrollo**\n\n' +
            'Pronto podrás comprar objetos, mejoras y Quirks especiales.',
            { title: '🏪 Tienda' }
        );
        
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.update({
            embeds: [embed],
            components: [backButton]
        });
    }
    
    async showMissions(interaction, playerData) {
        const embed = new InfoEmbed(
            '📜 **Sistema de misiones en desarrollo**\n\n' +
            'Pronto tendrás misiones épicas que conectarán tu vida real con el mundo PassQuirk.',
            { title: '📜 Misiones' }
        );
        
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🏠 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );
        
        return await interaction.update({
            embeds: [embed],
            components: [backButton]
        });
    }
}

module.exports = PassQuirkGameManager;