// 🎨 UNIVERSAL PANEL MANAGER - Gestor de Paneles Modulares de PassQuirk RPG
// Sistema unificado para manejar todos los paneles e interfaces del bot

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { PassQuirkEmbed, COLORS } = require('../utils/embedStyles');

// Definir colores específicos para PassQuirk
const PASSQUIRK_COLORS = {
    primary: COLORS.PRIMARY,
    secondary: COLORS.SECONDARY,
    character: COLORS.INFO,
    inventory: COLORS.SUCCESS,
    shop: COLORS.GOLD,
    battle: COLORS.DANGER,
    missions: COLORS.WARNING,
    work: COLORS.SECONDARY,
    error: COLORS.DANGER,
    loading: COLORS.INFO
};

// Definir elementos anime
const ANIME_ELEMENTS = {
    icons: {
        main_menu: '🏠',
        character: '👤',
        inventory: '🎒',
        shop: '🏪',
        battle: '⚔️',
        missions: '🎯'
    }
};

/**
 * 🎨 Tipos de paneles disponibles
 */
const PANEL_TYPES = {
    MAIN_MENU: 'main_menu',
    CHARACTER: 'character',
    INVENTORY: 'inventory',
    SHOP: 'shop',
    BATTLE: 'battle',
    DUNGEON: 'dungeon',
    MISSIONS: 'missions',
    GUILD: 'guild',
    STATS: 'stats',
    SETTINGS: 'settings',
    WORK: 'work',
    INVESTMENT: 'investment',
    ACHIEVEMENTS: 'achievements',
    LEADERBOARD: 'leaderboard',
    EVENTS: 'events'
};

/**
 * 🎯 Estados de panel
 */
const PANEL_STATES = {
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error',
    UPDATING: 'updating'
};

/**
 * 🎮 Configuraciones de botones estándar
 */
const STANDARD_BUTTONS = {
    BACK: {
        customId: 'panel_back',
        label: 'Atrás',
        emoji: '⬅️',
        style: ButtonStyle.Secondary
    },
    HOME: {
        customId: 'panel_home',
        label: 'Inicio',
        emoji: '🏠',
        style: ButtonStyle.Primary
    },
    REFRESH: {
        customId: 'panel_refresh',
        label: 'Actualizar',
        emoji: '🔄',
        style: ButtonStyle.Secondary
    },
    CLOSE: {
        customId: 'panel_close',
        label: 'Cerrar',
        emoji: '❌',
        style: ButtonStyle.Danger
    },
    HELP: {
        customId: 'panel_help',
        label: 'Ayuda',
        emoji: '❓',
        style: ButtonStyle.Secondary
    }
};

/**
 * 🎨 Clase principal del gestor de paneles
 */
class UniversalPanelManager {
    constructor() {
        this.panelTypes = PANEL_TYPES;
        this.panelStates = PANEL_STATES;
        this.standardButtons = STANDARD_BUTTONS;
        this.activePanels = new Map();
        this.panelHistory = new Map();
        this.panelData = new Map();
        this.panelConfigs = new Map();
        
        this.initializePanelConfigs();
    }

    /**
     * 🚀 Inicializar configuraciones de paneles
     */
    initializePanelConfigs() {
        // Configuración del menú principal
        this.panelConfigs.set(PANEL_TYPES.MAIN_MENU, {
            title: '🏠 PassQuirk RPG - Menú Principal',
            description: 'Bienvenido a tu aventura épica. ¿Qué deseas hacer?',
            color: PASSQUIRK_COLORS.primary,
            thumbnail: ANIME_ELEMENTS.icons.main_menu,
            buttons: [
                {
                    customId: 'panel_character',
                    label: 'Personaje',
                    emoji: '👤',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'panel_inventory',
                    label: 'Inventario',
                    emoji: '🎒',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'panel_missions',
                    label: 'Misiones',
                    emoji: '🎯',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'panel_battle',
                    label: 'Combate',
                    emoji: '⚔️',
                    style: ButtonStyle.Danger
                },
                {
                    customId: 'panel_shop',
                    label: 'Tienda',
                    emoji: '🏪',
                    style: ButtonStyle.Success
                }
            ],
            selectMenu: {
                customId: 'main_menu_select',
                placeholder: 'Selecciona una opción avanzada...',
                options: [
                    {
                        label: 'Gremio',
                        value: 'panel_guild',
                        emoji: '🏛️',
                        description: 'Únete o gestiona tu gremio'
                    },
                    {
                        label: 'Trabajo',
                        value: 'panel_work',
                        emoji: '💼',
                        description: 'Encuentra trabajos para ganar dinero'
                    },
                    {
                        label: 'Inversiones',
                        value: 'panel_investment',
                        emoji: '📈',
                        description: 'Invierte tu dinero sabiamente'
                    },
                    {
                        label: 'Logros',
                        value: 'panel_achievements',
                        emoji: '🏆',
                        description: 'Ve tus logros y títulos'
                    },
                    {
                        label: 'Eventos',
                        value: 'panel_events',
                        emoji: '🎪',
                        description: 'Eventos especiales activos'
                    },
                    {
                        label: 'Configuración',
                        value: 'panel_settings',
                        emoji: '⚙️',
                        description: 'Ajusta tus preferencias'
                    }
                ]
            }
        });

        // Configuración del panel de personaje
        this.panelConfigs.set(PANEL_TYPES.CHARACTER, {
            title: '👤 Información del Personaje',
            description: 'Detalles completos de tu aventurero',
            color: PASSQUIRK_COLORS.character,
            thumbnail: ANIME_ELEMENTS.icons.character,
            buttons: [
                {
                    customId: 'character_stats',
                    label: 'Estadísticas',
                    emoji: '📊',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'character_quirks',
                    label: 'Quirks',
                    emoji: '✨',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'character_evolution',
                    label: 'Evolución',
                    emoji: '🔄',
                    style: ButtonStyle.Success
                },
                this.standardButtons.BACK
            ]
        });

        // Configuración del panel de inventario
        this.panelConfigs.set(PANEL_TYPES.INVENTORY, {
            title: '🎒 Inventario',
            description: 'Gestiona tus objetos y equipamiento',
            color: PASSQUIRK_COLORS.inventory,
            thumbnail: ANIME_ELEMENTS.icons.inventory,
            buttons: [
                {
                    customId: 'inventory_equipment',
                    label: 'Equipamiento',
                    emoji: '⚔️',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'inventory_consumables',
                    label: 'Consumibles',
                    emoji: '🧪',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'inventory_materials',
                    label: 'Materiales',
                    emoji: '🔧',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'inventory_sort',
                    label: 'Ordenar',
                    emoji: '📋',
                    style: ButtonStyle.Secondary
                },
                this.standardButtons.BACK
            ]
        });

        // Configuración del panel de tienda
        this.panelConfigs.set(PANEL_TYPES.SHOP, {
            title: '🏪 Tienda de Aventureros',
            description: 'Compra y vende objetos para tu aventura',
            color: PASSQUIRK_COLORS.shop,
            thumbnail: ANIME_ELEMENTS.icons.shop,
            buttons: [
                {
                    customId: 'shop_weapons',
                    label: 'Armas',
                    emoji: '⚔️',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'shop_armor',
                    label: 'Armaduras',
                    emoji: '🛡️',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'shop_consumables',
                    label: 'Consumibles',
                    emoji: '🧪',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'shop_special',
                    label: 'Especiales',
                    emoji: '✨',
                    style: ButtonStyle.Success
                },
                this.standardButtons.BACK
            ]
        });

        // Configuración del panel de combate
        this.panelConfigs.set(PANEL_TYPES.BATTLE, {
            title: '⚔️ Arena de Combate',
            description: 'Enfréntate a enemigos y pon a prueba tus habilidades',
            color: PASSQUIRK_COLORS.battle,
            thumbnail: ANIME_ELEMENTS.icons.battle,
            buttons: [
                {
                    customId: 'battle_quick',
                    label: 'Combate Rápido',
                    emoji: '⚡',
                    style: ButtonStyle.Danger
                },
                {
                    customId: 'battle_dungeon',
                    label: 'Mazmorra',
                    emoji: '🏰',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'battle_boss',
                    label: 'Jefe',
                    emoji: '👹',
                    style: ButtonStyle.Danger
                },
                {
                    customId: 'battle_tournament',
                    label: 'Torneo',
                    emoji: '🏆',
                    style: ButtonStyle.Success
                },
                this.standardButtons.BACK
            ]
        });

        // Configuración del panel de misiones
        this.panelConfigs.set(PANEL_TYPES.MISSIONS, {
            title: '🎯 Centro de Misiones',
            description: 'Acepta misiones y completa objetivos épicos',
            color: PASSQUIRK_COLORS.missions,
            thumbnail: ANIME_ELEMENTS.icons.missions,
            buttons: [
                {
                    customId: 'missions_active',
                    label: 'Activas',
                    emoji: '⚡',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'missions_daily',
                    label: 'Diarias',
                    emoji: '📅',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'missions_special',
                    label: 'Especiales',
                    emoji: '✨',
                    style: ButtonStyle.Success
                },
                {
                    customId: 'missions_history',
                    label: 'Historial',
                    emoji: '📜',
                    style: ButtonStyle.Secondary
                },
                this.standardButtons.BACK
            ]
        });

        // Configuración del panel de trabajo
        this.panelConfigs.set(PANEL_TYPES.WORK, {
            title: '💼 Centro de Empleo',
            description: 'Encuentra trabajos para ganar dinero y experiencia',
            color: PASSQUIRK_COLORS.work,
            thumbnail: ANIME_ELEMENTS.icons.work,
            buttons: [
                {
                    customId: 'work_available',
                    label: 'Disponibles',
                    emoji: '📋',
                    style: ButtonStyle.Primary
                },
                {
                    customId: 'work_current',
                    label: 'Trabajo Actual',
                    emoji: '⚡',
                    style: ButtonStyle.Success
                },
                {
                    customId: 'work_history',
                    label: 'Historial',
                    emoji: '📊',
                    style: ButtonStyle.Secondary
                },
                this.standardButtons.BACK
            ]
        });

        console.log('🎨 Configuraciones de paneles inicializadas');
    }

    /**
     * 🎨 Crear panel principal
     */
    async createPanel(panelType, playerData, options = {}) {
        const config = this.panelConfigs.get(panelType);
        if (!config) {
            throw new Error(`Panel type ${panelType} not found`);
        }

        // Crear embed base
        const embed = new PassQuirkEmbed()
            .setTitle(config.title)
            .setDescription(config.description)
            .setColor(config.color);

        if (config.thumbnail) {
            embed.setThumbnail(config.thumbnail);
        }

        // Añadir contenido específico del panel
        await this.addPanelContent(embed, panelType, playerData, options);

        // Crear componentes de interacción
        const components = this.createPanelComponents(panelType, playerData, options);

        // Registrar panel activo
        const panelId = this.generatePanelId(playerData.userId, panelType);
        this.activePanels.set(panelId, {
            type: panelType,
            playerId: playerData.userId,
            createdAt: Date.now(),
            state: PANEL_STATES.READY,
            data: options
        });

        // Añadir al historial
        this.addToHistory(playerData.userId, panelType);

        return {
            embeds: [embed],
            components: components,
            panelId: panelId
        };
    }

    /**
     * 📝 Añadir contenido específico al panel
     */
    async addPanelContent(embed, panelType, playerData, options) {
        switch (panelType) {
            case PANEL_TYPES.MAIN_MENU:
                await this.addMainMenuContent(embed, playerData);
                break;
            case PANEL_TYPES.CHARACTER:
                await this.addCharacterContent(embed, playerData, options);
                break;
            case PANEL_TYPES.INVENTORY:
                await this.addInventoryContent(embed, playerData, options);
                break;
            case PANEL_TYPES.SHOP:
                await this.addShopContent(embed, playerData, options);
                break;
            case PANEL_TYPES.BATTLE:
                await this.addBattleContent(embed, playerData, options);
                break;
            case PANEL_TYPES.MISSIONS:
                await this.addMissionsContent(embed, playerData, options);
                break;
            case PANEL_TYPES.WORK:
                await this.addWorkContent(embed, playerData, options);
                break;
            default:
                embed.addFields({
                    name: '🚧 En Desarrollo',
                    value: 'Este panel está siendo desarrollado. ¡Pronto estará disponible!',
                    inline: false
                });
        }
    }

    /**
     * 🏠 Contenido del menú principal
     */
    async addMainMenuContent(embed, playerData) {
        const { classSystem } = require('../core/class-system');
        const { economySystem } = require('../core/economy-system');
        
        const playerClass = classSystem.getPlayerClass(playerData);
        const currencies = economySystem.initializePlayerCurrencies(playerData);
        
        // Información básica del jugador
        embed.addFields(
            {
                name: '👤 Información del Aventurero',
                value: `**Nombre:** ${playerData.username}\n**Nivel:** ${playerData.level || 1}\n**Clase:** ${playerClass?.emoji || '❓'} ${playerClass?.name || 'Sin Clase'}`,
                inline: true
            },
            {
                name: '💰 Recursos',
                value: `💰 ${currencies.coins?.toLocaleString() || 0} Coins\n💎 ${currencies.gems?.toLocaleString() || 0} Gemas\n⚡ ${currencies.energy || 0}/100 Energía`,
                inline: true
            },
            {
                name: '📊 Progreso',
                value: `🎯 EXP: ${playerData.experience || 0}\n⭐ Reputación: ${currencies.reputation || 0}\n🎮 PG: ${currencies.pg || 0}`,
                inline: true
            }
        );

        // Estado actual
        const { missionSystem } = require('../core/mission-system');
        const activeMissions = missionSystem.getPlayerActiveMissions(playerData.userId);
        const { economySystem: economy } = require('../core/economy-system');
        const workStatus = economy.getWorkStatus(playerData);
        
        let statusText = '';
        if (workStatus.working) {
            const timeLeft = Math.ceil(workStatus.timeRemaining / (60 * 1000));
            statusText += `💼 Trabajando como ${workStatus.work.name} (${timeLeft}m)\n`;
        }
        
        if (activeMissions.length > 0) {
            statusText += `🎯 ${activeMissions.length} misión${activeMissions.length > 1 ? 'es' : ''} activa${activeMissions.length > 1 ? 's' : ''}\n`;
        }
        
        if (!statusText) {
            statusText = '😴 Descansando en la posada';
        }
        
        embed.addFields({
            name: '⚡ Estado Actual',
            value: statusText,
            inline: false
        });
    }

    /**
     * 👤 Contenido del panel de personaje
     */
    async addCharacterContent(embed, playerData, options) {
        const { classSystem } = require('../core/class-system');
        const { progressionSystem } = require('../core/progression-system');
        
        const playerClass = classSystem.getPlayerClass(playerData);
        const stats = classSystem.calculatePlayerStats(playerData);
        const nextLevelExp = progressionSystem.getExperienceForLevel(playerData.level + 1);
        const currentExp = playerData.experience || 0;
        const expToNext = nextLevelExp - currentExp;
        
        // Información de clase
        if (playerClass) {
            embed.addFields({
                name: `${playerClass.emoji} ${playerClass.name}`,
                value: playerClass.description,
                inline: false
            });
        }
        
        // Estadísticas
        embed.addFields(
            {
                name: '⚔️ Combate',
                value: `**Ataque:** ${stats.attack}\n**Defensa:** ${stats.defense}\n**Velocidad:** ${stats.speed}`,
                inline: true
            },
            {
                name: '🧠 Mental',
                value: `**Magia:** ${stats.magic}\n**Inteligencia:** ${stats.intelligence}\n**Sabiduría:** ${stats.wisdom}`,
                inline: true
            },
            {
                name: '🎭 Social',
                value: `**Carisma:** ${stats.charisma}\n**Creatividad:** ${stats.creativity}\n**Suerte:** ${stats.luck}`,
                inline: true
            }
        );
        
        // Progreso de nivel
        const progressBar = this.createProgressBar(currentExp, nextLevelExp, 10);
        embed.addFields({
            name: '📈 Progreso de Nivel',
            value: `${progressBar}\n**EXP:** ${currentExp.toLocaleString()} / ${nextLevelExp.toLocaleString()}\n**Falta:** ${expToNext.toLocaleString()} EXP`,
            inline: false
        });
        
        // Quirks activos
        if (playerData.quirks && playerData.quirks.length > 0) {
            const quirksText = playerData.quirks.map(quirkId => {
                const quirk = classSystem.getQuirk(quirkId);
                return quirk ? `${quirk.emoji} ${quirk.name}` : quirkId;
            }).join('\n');
            
            embed.addFields({
                name: '✨ Quirks Activos',
                value: quirksText,
                inline: false
            });
        }
    }

    /**
     * 🎒 Contenido del panel de inventario
     */
    async addInventoryContent(embed, playerData, options) {
        const { inventorySystem } = require('../core/inventory-system');
        
        const inventory = inventorySystem.getPlayerInventory(playerData);
        const equipment = inventorySystem.getPlayerEquipment(playerData);
        
        // Equipamiento actual
        let equipmentText = '';
        Object.entries(equipment).forEach(([slot, item]) => {
            if (item) {
                const itemData = inventorySystem.getItem(item.id);
                equipmentText += `**${slot}:** ${itemData?.emoji || '📦'} ${itemData?.name || item.id}\n`;
            } else {
                equipmentText += `**${slot}:** Vacío\n`;
            }
        });
        
        if (equipmentText) {
            embed.addFields({
                name: '⚔️ Equipamiento Actual',
                value: equipmentText,
                inline: false
            });
        }
        
        // Inventario por categorías
        const category = options.category || 'all';
        const items = this.filterInventoryByCategory(inventory, category);
        
        if (items.length > 0) {
            const itemsText = items.slice(0, 10).map(item => {
                const itemData = inventorySystem.getItem(item.id);
                return `${itemData?.emoji || '📦'} ${itemData?.name || item.id} x${item.quantity}`;
            }).join('\n');
            
            embed.addFields({
                name: `📦 Objetos${category !== 'all' ? ` (${category})` : ''}`,
                value: itemsText || 'Inventario vacío',
                inline: false
            });
            
            if (items.length > 10) {
                embed.addFields({
                    name: '📋 Información',
                    value: `Mostrando 10 de ${items.length} objetos`,
                    inline: false
                });
            }
        } else {
            embed.addFields({
                name: '📦 Inventario',
                value: 'No tienes objetos en esta categoría',
                inline: false
            });
        }
    }

    /**
     * 🏪 Contenido del panel de tienda
     */
    async addShopContent(embed, playerData, options) {
        const { inventorySystem } = require('../core/inventory-system');
        const { economySystem } = require('../core/economy-system');
        
        const currencies = economySystem.initializePlayerCurrencies(playerData);
        const category = options.category || 'weapons';
        const shopItems = inventorySystem.getShopItems(category);
        
        // Mostrar dinero disponible
        embed.addFields({
            name: '💰 Tu Dinero',
            value: `💰 ${currencies.coins?.toLocaleString() || 0} Coins\n💎 ${currencies.gems?.toLocaleString() || 0} Gemas`,
            inline: true
        });
        
        // Mostrar objetos de la tienda
        if (shopItems.length > 0) {
            const itemsText = shopItems.slice(0, 8).map(item => {
                const priceText = item.gem_price ? 
                    `💎 ${item.gem_price}` : 
                    `💰 ${item.price?.toLocaleString() || 0}`;
                return `${item.emoji || '📦'} **${item.name}**\n${priceText} | ${item.description}`;
            }).join('\n\n');
            
            embed.addFields({
                name: `🏪 ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                value: itemsText,
                inline: false
            });
        } else {
            embed.addFields({
                name: '🏪 Tienda',
                value: 'No hay objetos disponibles en esta categoría',
                inline: false
            });
        }
    }

    /**
     * ⚔️ Contenido del panel de combate
     */
    async addBattleContent(embed, playerData, options) {
        const { combatSystem } = require('../core/combat-system');
        const { worldEngine } = require('../core/world-engine');
        
        // Información del jugador
        const stats = require('../core/class-system').classSystem.calculatePlayerStats(playerData);
        
        embed.addFields(
            {
                name: '⚔️ Tus Estadísticas de Combate',
                value: `**Ataque:** ${stats.attack}\n**Defensa:** ${stats.defense}\n**Velocidad:** ${stats.speed}\n**Magia:** ${stats.magic}`,
                inline: true
            },
            {
                name: '🌍 Regiones Disponibles',
                value: Object.values(worldEngine.regions).map(region => 
                    `${region.emoji} **${region.name}**\nNivel: ${region.level_range.min}-${region.level_range.max}`
                ).slice(0, 3).join('\n\n'),
                inline: true
            }
        );
        
        // Combate activo
        const activeBattle = combatSystem.getActiveBattle(playerData.userId);
        if (activeBattle) {
            embed.addFields({
                name: '⚡ Combate Activo',
                value: `Enfrentándote a: ${activeBattle.enemy.name}\nTurno: ${activeBattle.turn}`,
                inline: false
            });
        } else {
            embed.addFields({
                name: '🎯 Opciones de Combate',
                value: '• **Combate Rápido:** Lucha contra un enemigo aleatorio\n• **Mazmorra:** Explora mazmorras peligrosas\n• **Jefe:** Desafía a jefes poderosos\n• **Torneo:** Compite contra otros jugadores',
                inline: false
            });
        }
    }

    /**
     * 🎯 Contenido del panel de misiones
     */
    async addMissionsContent(embed, playerData, options) {
        const { missionSystem } = require('../core/mission-system');
        
        const missions = missionSystem.getPlayerMissions(playerData);
        const view = options.view || 'active';
        
        // Estadísticas generales
        embed.addFields({
            name: '📊 Estadísticas de Misiones',
            value: `**Activas:** ${missions.active.length}\n**Completadas hoy:** ${missions.completed_today}\n**Total completadas:** ${missions.total_completed}`,
            inline: true
        });
        
        // Mostrar misiones según la vista
        switch (view) {
            case 'active':
                if (missions.active.length > 0) {
                    const activeText = missions.active.map(mission => {
                        const progress = `${mission.progress}/${mission.maxProgress}`;
                        const timeLeft = Math.ceil((mission.completionDeadline - Date.now()) / (60 * 1000));
                        return `${mission.title}\n📊 ${progress} | ⏰ ${timeLeft}m`;
                    }).join('\n\n');
                    
                    embed.addFields({
                        name: '⚡ Misiones Activas',
                        value: activeText,
                        inline: false
                    });
                } else {
                    embed.addFields({
                        name: '⚡ Misiones Activas',
                        value: 'No tienes misiones activas',
                        inline: false
                    });
                }
                break;
                
            case 'daily':
                if (missions.daily.length > 0) {
                    const dailyText = missions.daily.slice(0, 5).map(mission => {
                        const difficulty = missionSystem.difficulties[mission.difficulty];
                        return `${difficulty.emoji} ${mission.title}\n${mission.objective}`;
                    }).join('\n\n');
                    
                    embed.addFields({
                        name: '📅 Misiones Diarias',
                        value: dailyText,
                        inline: false
                    });
                } else {
                    embed.addFields({
                        name: '📅 Misiones Diarias',
                        value: 'No hay misiones diarias disponibles',
                        inline: false
                    });
                }
                break;
        }
        
        // Eventos especiales activos
        if (missionSystem.activeEvents.size > 0) {
            const eventsText = Array.from(missionSystem.activeEvents.values()).map(event => {
                const timeLeft = Math.ceil((event.endsAt - Date.now()) / (60 * 60 * 1000));
                return `${event.emoji} ${event.name} (${timeLeft}h)`;
            }).join('\n');
            
            embed.addFields({
                name: '🎪 Eventos Especiales',
                value: eventsText,
                inline: false
            });
        }
    }

    /**
     * 💼 Contenido del panel de trabajo
     */
    async addWorkContent(embed, playerData, options) {
        const { economySystem } = require('../core/economy-system');
        
        const workStatus = economySystem.getWorkStatus(playerData);
        const currencies = economySystem.initializePlayerCurrencies(playerData);
        
        // Estado actual del trabajo
        if (workStatus.working) {
            const timeLeft = Math.ceil(workStatus.timeRemaining / (60 * 1000));
            const progressPercent = Math.floor(workStatus.progress);
            const progressBar = this.createProgressBar(workStatus.progress, 100, 10);
            
            embed.addFields({
                name: '💼 Trabajo Actual',
                value: `${workStatus.work.emoji} **${workStatus.work.name}**\n${progressBar} ${progressPercent}%\n⏰ Tiempo restante: ${timeLeft} minutos`,
                inline: false
            });
            
            if (workStatus.canComplete) {
                embed.addFields({
                    name: '✅ ¡Trabajo Completado!',
                    value: 'Puedes reclamar tus recompensas',
                    inline: false
                });
            }
        } else {
            embed.addFields({
                name: '💼 Estado del Trabajo',
                value: 'No estás trabajando actualmente',
                inline: false
            });
        }
        
        // Mostrar energía disponible
        embed.addFields({
            name: '⚡ Energía',
            value: `${currencies.energy}/100`,
            inline: true
        });
        
        // Trabajos disponibles
        const view = options.view || 'available';
        if (view === 'available' && !workStatus.working) {
            const availableJobs = Object.values(economySystem.workTypes).slice(0, 5);
            const jobsText = availableJobs.map(job => {
                const requirementCheck = economySystem.checkWorkRequirements(playerData, job);
                const status = requirementCheck.success ? '✅' : '❌';
                const duration = Math.floor(job.duration / (60 * 60 * 1000));
                return `${status} ${job.emoji} **${job.name}**\n⏰ ${duration}h | ⚡ ${job.energy_cost} energía`;
            }).join('\n\n');
            
            embed.addFields({
                name: '📋 Trabajos Disponibles',
                value: jobsText,
                inline: false
            });
        }
    }

    /**
     * 🎮 Crear componentes de interacción
     */
    createPanelComponents(panelType, playerData, options) {
        const config = this.panelConfigs.get(panelType);
        if (!config) return [];

        const components = [];

        // Crear botones principales
        if (config.buttons && config.buttons.length > 0) {
            const buttonRows = this.createButtonRows(config.buttons);
            components.push(...buttonRows);
        }

        // Crear menú de selección si existe
        if (config.selectMenu) {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(config.selectMenu.customId)
                .setPlaceholder(config.selectMenu.placeholder)
                .addOptions(config.selectMenu.options);

            components.push(new ActionRowBuilder().addComponents(selectMenu));
        }

        return components;
    }

    /**
     * 🔘 Crear filas de botones
     */
    createButtonRows(buttons) {
        const rows = [];
        const buttonsPerRow = 5;
        
        for (let i = 0; i < buttons.length; i += buttonsPerRow) {
            const rowButtons = buttons.slice(i, i + buttonsPerRow);
            const row = new ActionRowBuilder();
            
            rowButtons.forEach(buttonConfig => {
                const button = new ButtonBuilder()
                    .setCustomId(buttonConfig.customId)
                    .setLabel(buttonConfig.label)
                    .setStyle(buttonConfig.style);
                
                if (buttonConfig.emoji) {
                    button.setEmoji(buttonConfig.emoji);
                }
                
                if (buttonConfig.disabled) {
                    button.setDisabled(true);
                }
                
                row.addComponents(button);
            });
            
            rows.push(row);
        }
        
        return rows;
    }

    /**
     * 🔄 Actualizar panel existente
     */
    async updatePanel(panelId, playerData, options = {}) {
        const panel = this.activePanels.get(panelId);
        if (!panel) {
            throw new Error('Panel not found');
        }

        panel.state = PANEL_STATES.UPDATING;
        
        try {
            const updatedPanel = await this.createPanel(panel.type, playerData, { ...panel.data, ...options });
            panel.state = PANEL_STATES.READY;
            return updatedPanel;
        } catch (error) {
            panel.state = PANEL_STATES.ERROR;
            throw error;
        }
    }

    /**
     * 🗂️ Navegar a panel
     */
    async navigateToPanel(currentPanelId, targetPanelType, playerData, options = {}) {
        // Añadir panel actual al historial si existe
        if (currentPanelId) {
            const currentPanel = this.activePanels.get(currentPanelId);
            if (currentPanel) {
                this.addToHistory(playerData.userId, currentPanel.type);
            }
        }

        // Crear nuevo panel
        return await this.createPanel(targetPanelType, playerData, options);
    }

    /**
     * ⬅️ Volver al panel anterior
     */
    async goBack(playerData) {
        const history = this.panelHistory.get(playerData.userId) || [];
        if (history.length === 0) {
            return await this.createPanel(PANEL_TYPES.MAIN_MENU, playerData);
        }

        const previousPanelType = history.pop();
        this.panelHistory.set(playerData.userId, history);
        
        return await this.createPanel(previousPanelType, playerData);
    }

    // MÉTODOS DE UTILIDAD

    /**
     * 🆔 Generar ID único de panel
     */
    generatePanelId(userId, panelType) {
        return `${userId}_${panelType}_${Date.now()}`;
    }

    /**
     * 📚 Añadir al historial
     */
    addToHistory(userId, panelType) {
        if (!this.panelHistory.has(userId)) {
            this.panelHistory.set(userId, []);
        }
        
        const history = this.panelHistory.get(userId);
        
        // Evitar duplicados consecutivos
        if (history[history.length - 1] !== panelType) {
            history.push(panelType);
            
            // Mantener solo los últimos 10 paneles
            if (history.length > 10) {
                history.shift();
            }
        }
    }

    /**
     * 📊 Crear barra de progreso
     */
    createProgressBar(current, max, length = 10) {
        const percentage = Math.min(100, (current / max) * 100);
        const filled = Math.floor((percentage / 100) * length);
        const empty = length - filled;
        
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    /**
     * 🗂️ Filtrar inventario por categoría
     */
    filterInventoryByCategory(inventory, category) {
        if (category === 'all') {
            return inventory;
        }
        
        const { inventorySystem } = require('../core/inventory-system');
        
        return inventory.filter(item => {
            const itemData = inventorySystem.getItem(item.id);
            return itemData && itemData.type === category;
        });
    }

    /**
     * 🧹 Limpiar paneles inactivos
     */
    cleanupInactivePanels() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutos
        
        this.activePanels.forEach((panel, panelId) => {
            if (now - panel.createdAt > maxAge) {
                this.activePanels.delete(panelId);
            }
        });
    }

    /**
     * 📊 Obtener estadísticas de paneles
     */
    getPanelStats() {
        const stats = {
            activePanels: this.activePanels.size,
            panelTypes: {},
            totalHistoryEntries: 0
        };
        
        this.activePanels.forEach(panel => {
            stats.panelTypes[panel.type] = (stats.panelTypes[panel.type] || 0) + 1;
        });
        
        this.panelHistory.forEach(history => {
            stats.totalHistoryEntries += history.length;
        });
        
        return stats;
    }

    /**
     * 🎨 Crear embed de error
     */
    createErrorEmbed(error, panelType = 'unknown') {
        return new PassQuirkEmbed()
            .setTitle('❌ Error en el Panel')
            .setDescription(`Ocurrió un error al cargar el panel: ${panelType}`)
            .addFields({
                name: '🔧 Detalles del Error',
                value: error.message || 'Error desconocido',
                inline: false
            })
            .setColor(PASSQUIRK_COLORS.error)
            .setTimestamp();
    }

    /**
     * 🎨 Crear embed de carga
     */
    createLoadingEmbed(panelType) {
        return new PassQuirkEmbed()
            .setTitle('⏳ Cargando...')
            .setDescription(`Preparando el panel: ${panelType}`)
            .setColor(PASSQUIRK_COLORS.loading)
            .setTimestamp();
    }
}

// Crear instancia singleton del gestor de paneles
const universalPanelManager = new UniversalPanelManager();

module.exports = {
    UniversalPanelManager,
    universalPanelManager,
    PANEL_TYPES,
    PANEL_STATES,
    STANDARD_BUTTONS
};