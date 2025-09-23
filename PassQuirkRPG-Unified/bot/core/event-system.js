// 🎉 EVENT SYSTEM - Sistema de Eventos de PassQuirk RPG
// Maneja eventos especiales, festivales, contenido estacional y celebraciones

const { PassQuirkEmbed } = require('../utils/embedStyles');
const { progressionSystem } = require('./progression-system');
const { inventorySystem } = require('./inventory-system');
const { questSystem } = require('./quest-system');
const { worldEngine } = require('./world-engine');

/**
 * 🎊 Tipos de eventos
 */
const EVENT_TYPES = {
    seasonal: {
        name: 'Estacional',
        emoji: '🌸',
        color: 0x98fb98,
        description: 'Eventos que cambian con las estaciones'
    },
    festival: {
        name: 'Festival',
        emoji: '🎉',
        color: 0xff69b4,
        description: 'Celebraciones especiales con actividades únicas'
    },
    limited: {
        name: 'Limitado',
        emoji: '⏰',
        color: 0xff4500,
        description: 'Eventos de tiempo limitado con recompensas exclusivas'
    },
    community: {
        name: 'Comunitario',
        emoji: '🤝',
        color: 0x4169e1,
        description: 'Eventos que requieren participación de toda la comunidad'
    },
    special: {
        name: 'Especial',
        emoji: '✨',
        color: 0xffd700,
        description: 'Eventos únicos para ocasiones especiales'
    },
    raid: {
        name: 'Incursión',
        emoji: '⚔️',
        color: 0x8b0000,
        description: 'Eventos de combate cooperativo contra jefes épicos'
    }
};

/**
 * 🎯 Estados de eventos
 */
const EVENT_STATUS = {
    upcoming: 'Próximo',
    active: 'Activo',
    ending_soon: 'Terminando Pronto',
    ended: 'Terminado',
    paused: 'Pausado'
};

/**
 * 🎪 Base de datos de eventos
 */
const EVENT_DATABASE = {
    // EVENTOS ESTACIONALES
    spring_awakening: {
        id: 'spring_awakening',
        name: 'Despertar de Primavera',
        description: 'La naturaleza renace y trae consigo nuevas oportunidades de crecimiento.',
        type: 'seasonal',
        season: 'spring',
        duration: 30 * 24 * 60 * 60 * 1000, // 30 días
        recurring: true,
        recurrence_pattern: 'yearly',
        activities: [
            {
                id: 'flower_gathering',
                name: 'Recolección de Flores',
                description: 'Recolecta flores especiales que solo florecen en primavera',
                type: 'collection',
                rewards: {
                    exp: 50,
                    items: [{ id: 'spring_flower', quantity: 1 }]
                },
                cooldown: 4 * 60 * 60 * 1000 // 4 horas
            },
            {
                id: 'nature_meditation',
                name: 'Meditación Natural',
                description: 'Medita en armonía con la naturaleza para ganar sabiduría',
                type: 'meditation',
                rewards: {
                    exp: 100,
                    mana: 50
                },
                cooldown: 8 * 60 * 60 * 1000 // 8 horas
            }
        ],
        global_effects: {
            exp_bonus: 1.15,
            nature_spawn_rate: 1.5,
            healing_effectiveness: 1.2
        },
        shop: {
            spring_crown: {
                id: 'spring_crown',
                name: 'Corona de Primavera',
                description: 'Una corona hecha de flores primaverales que aumenta la regeneración de mana',
                cost: 500,
                currency: 'spring_tokens',
                stats: { mana_regen: 1.2 },
                rarity: 'rare'
            },
            growth_potion: {
                id: 'growth_potion',
                name: 'Poción de Crecimiento',
                description: 'Duplica la experiencia ganada por 1 hora',
                cost: 200,
                currency: 'spring_tokens',
                effect: { exp_multiplier: 2, duration: 60 * 60 * 1000 },
                consumable: true
            }
        },
        achievements: [
            {
                id: 'spring_collector',
                name: 'Coleccionista Primaveral',
                description: 'Recolecta 100 flores de primavera',
                condition: { type: 'item_collection', item: 'spring_flower', amount: 100 },
                rewards: { title: 'Guardián de la Primavera', items: [{ id: 'nature_amulet', quantity: 1 }] }
            }
        ]
    },
    
    summer_festival: {
        id: 'summer_festival',
        name: 'Festival de Verano',
        description: 'El sol brilla intensamente y la energía está en su punto máximo.',
        type: 'festival',
        season: 'summer',
        duration: 21 * 24 * 60 * 60 * 1000, // 21 días
        recurring: true,
        recurrence_pattern: 'yearly',
        activities: [
            {
                id: 'sun_dance',
                name: 'Danza del Sol',
                description: 'Participa en la danza ritual para honrar al sol',
                type: 'ritual',
                rewards: {
                    exp: 150,
                    coins: 100,
                    items: [{ id: 'sun_token', quantity: 3 }]
                },
                cooldown: 24 * 60 * 60 * 1000 // 24 horas
            },
            {
                id: 'beach_volleyball',
                name: 'Voleibol Playero',
                description: 'Compite en torneos de voleibol con otros aventureros',
                type: 'competition',
                min_participants: 4,
                rewards: {
                    winner: { exp: 300, coins: 200, items: [{ id: 'champion_trophy', quantity: 1 }] },
                    participant: { exp: 100, coins: 50 }
                }
            }
        ],
        global_effects: {
            energy_bonus: 1.25,
            fire_damage_bonus: 1.3,
            water_activities_available: true
        },
        shop: {
            sun_hat: {
                id: 'sun_hat',
                name: 'Sombrero Solar',
                description: 'Protege del sol y aumenta la resistencia al fuego',
                cost: 300,
                currency: 'sun_tokens',
                stats: { fire_resistance: 0.2, stamina: 10 },
                rarity: 'uncommon'
            },
            beach_ball: {
                id: 'beach_ball',
                name: 'Pelota de Playa',
                description: 'Una pelota divertida que aumenta la moral del equipo',
                cost: 150,
                currency: 'sun_tokens',
                effect: { team_morale: 1.1 },
                rarity: 'common'
            }
        }
    },
    
    autumn_harvest: {
        id: 'autumn_harvest',
        name: 'Cosecha de Otoño',
        description: 'Es tiempo de recoger los frutos del trabajo duro.',
        type: 'seasonal',
        season: 'autumn',
        duration: 25 * 24 * 60 * 60 * 1000, // 25 días
        recurring: true,
        recurrence_pattern: 'yearly',
        activities: [
            {
                id: 'harvest_crops',
                name: 'Cosechar Cultivos',
                description: 'Ayuda a los granjeros a cosechar sus cultivos',
                type: 'farming',
                rewards: {
                    exp: 75,
                    coins: 50,
                    items: [{ id: 'harvest_fruit', quantity: 2 }]
                },
                cooldown: 6 * 60 * 60 * 1000 // 6 horas
            },
            {
                id: 'cooking_contest',
                name: 'Concurso de Cocina',
                description: 'Demuestra tus habilidades culinarias',
                type: 'crafting_contest',
                rewards: {
                    exp: 200,
                    items: [{ id: 'master_chef_hat', quantity: 1 }]
                },
                cooldown: 24 * 60 * 60 * 1000 // 24 horas
            }
        ],
        global_effects: {
            crafting_success_rate: 1.2,
            food_effectiveness: 1.3,
            gathering_yield: 1.4
        }
    },
    
    winter_solstice: {
        id: 'winter_solstice',
        name: 'Solsticio de Invierno',
        description: 'La noche más larga del año trae magia especial.',
        type: 'seasonal',
        season: 'winter',
        duration: 20 * 24 * 60 * 60 * 1000, // 20 días
        recurring: true,
        recurrence_pattern: 'yearly',
        activities: [
            {
                id: 'ice_sculpture',
                name: 'Escultura de Hielo',
                description: 'Crea hermosas esculturas de hielo',
                type: 'art',
                rewards: {
                    exp: 120,
                    items: [{ id: 'ice_crystal', quantity: 1 }]
                },
                cooldown: 12 * 60 * 60 * 1000 // 12 horas
            },
            {
                id: 'snowball_fight',
                name: 'Guerra de Bolas de Nieve',
                description: 'Participa en épicas batallas de bolas de nieve',
                type: 'pvp_fun',
                rewards: {
                    exp: 80,
                    coins: 30
                },
                cooldown: 4 * 60 * 60 * 1000 // 4 horas
            }
        ],
        global_effects: {
            ice_magic_bonus: 1.4,
            cold_resistance: 1.5,
            meditation_effectiveness: 1.3
        }
    },
    
    // EVENTOS ESPECIALES
    anniversary_celebration: {
        id: 'anniversary_celebration',
        name: 'Celebración de Aniversario',
        description: '¡Celebramos otro año de aventuras en PassQuirk!',
        type: 'special',
        duration: 14 * 24 * 60 * 60 * 1000, // 14 días
        recurring: true,
        recurrence_pattern: 'yearly',
        start_date: '2024-12-01', // Fecha de lanzamiento
        activities: [
            {
                id: 'memory_lane',
                name: 'Sendero de Recuerdos',
                description: 'Revive los momentos más épicos del año pasado',
                type: 'story',
                rewards: {
                    exp: 500,
                    coins: 1000,
                    items: [{ id: 'anniversary_medal', quantity: 1 }]
                },
                one_time: true
            },
            {
                id: 'community_goals',
                name: 'Objetivos Comunitarios',
                description: 'Trabajen juntos para alcanzar metas globales',
                type: 'community',
                global_progress: true,
                targets: {
                    total_exp_gained: 1000000,
                    battles_won: 50000,
                    quests_completed: 25000
                },
                rewards: {
                    individual: { exp: 1000, coins: 500 },
                    community: { global_exp_bonus: 1.5, duration: 7 * 24 * 60 * 60 * 1000 }
                }
            }
        ],
        global_effects: {
            all_bonuses: 1.5,
            rare_drop_rate: 2.0,
            friendship_bonus: 1.3
        },
        shop: {
            anniversary_crown: {
                id: 'anniversary_crown',
                name: 'Corona de Aniversario',
                description: 'Una corona especial que conmemora tu dedicación',
                cost: 2024,
                currency: 'anniversary_tokens',
                stats: { all_stats: 10 },
                rarity: 'legendary',
                limited_quantity: 100
            }
        }
    },
    
    // EVENTOS DE INCURSIÓN
    shadow_invasion: {
        id: 'shadow_invasion',
        name: 'Invasión de las Sombras',
        description: 'Criaturas sombrias han invadido todas las regiones. ¡Defiende PassQuirk!',
        type: 'raid',
        duration: 7 * 24 * 60 * 60 * 1000, // 7 días
        recurring: false,
        activities: [
            {
                id: 'shadow_patrol',
                name: 'Patrulla Anti-Sombras',
                description: 'Elimina criaturas sombrias de las regiones',
                type: 'combat',
                rewards: {
                    exp: 200,
                    coins: 150,
                    items: [{ id: 'shadow_essence', quantity: 1 }]
                },
                cooldown: 2 * 60 * 60 * 1000 // 2 horas
            },
            {
                id: 'shadow_lord_raid',
                name: 'Incursión del Señor de las Sombras',
                description: 'Únete a otros aventureros para derrotar al Señor de las Sombras',
                type: 'raid_boss',
                min_participants: 10,
                max_participants: 50,
                boss: {
                    name: 'Señor de las Sombras',
                    hp: 1000000,
                    level: 50,
                    abilities: ['shadow_wave', 'darkness_aura', 'void_strike']
                },
                rewards: {
                    exp: 2000,
                    coins: 1000,
                    items: [{ id: 'shadow_slayer_sword', quantity: 1 }],
                    title: 'Cazador de Sombras'
                }
            }
        ],
        global_effects: {
            shadow_enemies_spawn: true,
            light_magic_bonus: 1.5,
            darkness_resistance_needed: true
        }
    },
    
    // EVENTOS COMUNITARIOS
    builders_week: {
        id: 'builders_week',
        name: 'Semana de los Constructores',
        description: 'Trabajemos juntos para construir nuevas estructuras en PassQuirk.',
        type: 'community',
        duration: 7 * 24 * 60 * 60 * 1000, // 7 días
        recurring: true,
        recurrence_pattern: 'monthly',
        activities: [
            {
                id: 'gather_materials',
                name: 'Recolectar Materiales',
                description: 'Reúne materiales de construcción para el proyecto comunitario',
                type: 'gathering',
                rewards: {
                    exp: 100,
                    items: [{ id: 'building_materials', quantity: 5 }]
                },
                cooldown: 3 * 60 * 60 * 1000, // 3 horas
                contributes_to_global: true
            },
            {
                id: 'construction_work',
                name: 'Trabajo de Construcción',
                description: 'Ayuda directamente en la construcción',
                type: 'building',
                rewards: {
                    exp: 150,
                    coins: 100
                },
                cooldown: 6 * 60 * 60 * 1000, // 6 horas
                contributes_to_global: true
            }
        ],
        community_goal: {
            target: 100000, // materiales necesarios
            current: 0,
            rewards_on_completion: {
                new_building: 'community_center',
                individual_rewards: {
                    exp: 1000,
                    coins: 500,
                    title: 'Constructor Comunitario'
                }
            }
        }
    }
};

/**
 * 🎉 Clase principal del sistema de eventos
 */
class EventSystem {
    constructor() {
        this.eventDatabase = EVENT_DATABASE;
        this.eventTypes = EVENT_TYPES;
        this.eventStatus = EVENT_STATUS;
        this.activeEvents = new Map();
        this.eventParticipants = new Map();
        this.communityProgress = new Map();
    }

    /**
     * 🚀 Inicializar sistema de eventos
     */
    initialize() {
        this.checkScheduledEvents();
        this.updateEventStatuses();
        this.cleanupExpiredEvents();
        
        // Configurar verificación periódica
        setInterval(() => {
            this.checkScheduledEvents();
            this.updateEventStatuses();
        }, 60 * 60 * 1000); // Cada hora
        
        console.log('🎉 Sistema de eventos inicializado');
    }

    /**
     * 📅 Verificar eventos programados
     */
    checkScheduledEvents() {
        const now = new Date();
        
        Object.values(this.eventDatabase).forEach(event => {
            if (this.shouldStartEvent(event, now)) {
                this.startEvent(event.id);
            }
        });
    }

    /**
     * ✅ Verificar si un evento debe iniciarse
     */
    shouldStartEvent(event, now) {
        // Si ya está activo, no iniciar
        if (this.activeEvents.has(event.id)) {
            return false;
        }
        
        // Eventos estacionales
        if (event.type === 'seasonal' && event.recurring) {
            return this.isSeasonActive(event.season, now);
        }
        
        // Eventos con fecha específica
        if (event.start_date) {
            const startDate = new Date(event.start_date);
            const endDate = new Date(startDate.getTime() + event.duration);
            
            return now >= startDate && now <= endDate;
        }
        
        // Eventos recurrentes
        if (event.recurring && event.recurrence_pattern) {
            return this.checkRecurrencePattern(event, now);
        }
        
        return false;
    }

    /**
     * 🌸 Verificar si una estación está activa
     */
    isSeasonActive(season, date) {
        const month = date.getMonth() + 1; // 1-12
        
        const seasons = {
            spring: [3, 4, 5], // Marzo, Abril, Mayo
            summer: [6, 7, 8], // Junio, Julio, Agosto
            autumn: [9, 10, 11], // Septiembre, Octubre, Noviembre
            winter: [12, 1, 2] // Diciembre, Enero, Febrero
        };
        
        return seasons[season]?.includes(month) || false;
    }

    /**
     * 🔄 Verificar patrón de recurrencia
     */
    checkRecurrencePattern(event, now) {
        // Implementación básica - se puede expandir
        if (event.recurrence_pattern === 'monthly') {
            // Primer lunes de cada mes, por ejemplo
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const firstMonday = new Date(firstDay);
            firstMonday.setDate(1 + (8 - firstDay.getDay()) % 7);
            
            return now.toDateString() === firstMonday.toDateString();
        }
        
        return false;
    }

    /**
     * 🎬 Iniciar un evento
     */
    startEvent(eventId) {
        const event = this.eventDatabase[eventId];
        if (!event) {
            console.error(`❌ Evento no encontrado: ${eventId}`);
            return { success: false, reason: 'event_not_found' };
        }
        
        if (this.activeEvents.has(eventId)) {
            return { success: false, reason: 'event_already_active' };
        }
        
        // Crear instancia del evento
        const eventInstance = {
            ...event,
            startTime: Date.now(),
            endTime: Date.now() + event.duration,
            status: 'active',
            participants: new Set(),
            activityCooldowns: new Map(),
            communityProgress: event.community_goal ? { ...event.community_goal } : null
        };
        
        this.activeEvents.set(eventId, eventInstance);
        
        // Aplicar efectos globales
        if (event.global_effects) {
            this.applyGlobalEffects(eventId, event.global_effects);
        }
        
        // Inicializar progreso comunitario
        if (event.community_goal) {
            this.communityProgress.set(eventId, { ...event.community_goal });
        }
        
        console.log(`🎬 Evento iniciado: ${event.name}`);
        
        return { success: true, event: eventInstance };
    }

    /**
     * 🏁 Finalizar un evento
     */
    endEvent(eventId) {
        const eventInstance = this.activeEvents.get(eventId);
        if (!eventInstance) {
            return { success: false, reason: 'event_not_active' };
        }
        
        eventInstance.status = 'ended';
        eventInstance.actualEndTime = Date.now();
        
        // Remover efectos globales
        this.removeGlobalEffects(eventId);
        
        // Procesar recompensas finales
        const finalRewards = this.processFinalRewards(eventInstance);
        
        // Mover a historial
        this.activeEvents.delete(eventId);
        
        console.log(`🏁 Evento finalizado: ${eventInstance.name}`);
        
        return { success: true, finalRewards };
    }

    /**
     * 🎯 Participar en actividad de evento
     */
    participateInActivity(playerData, eventId, activityId) {
        const eventInstance = this.activeEvents.get(eventId);
        if (!eventInstance) {
            return { success: false, reason: 'event_not_active' };
        }
        
        const activity = eventInstance.activities.find(a => a.id === activityId);
        if (!activity) {
            return { success: false, reason: 'activity_not_found' };
        }
        
        // Verificar cooldown
        const cooldownKey = `${playerData.userId}_${activityId}`;
        const lastParticipation = eventInstance.activityCooldowns.get(cooldownKey);
        
        if (lastParticipation && (Date.now() - lastParticipation) < activity.cooldown) {
            const timeLeft = activity.cooldown - (Date.now() - lastParticipation);
            return { success: false, reason: 'activity_on_cooldown', timeLeft };
        }
        
        // Verificar si es actividad única
        if (activity.one_time && eventInstance.participants.has(`${playerData.userId}_${activityId}`)) {
            return { success: false, reason: 'activity_already_completed' };
        }
        
        // Procesar participación
        const result = this.processActivityParticipation(playerData, eventInstance, activity);
        
        if (result.success) {
            // Actualizar cooldown
            eventInstance.activityCooldowns.set(cooldownKey, Date.now());
            
            // Marcar participación
            eventInstance.participants.add(playerData.userId);
            if (activity.one_time) {
                eventInstance.participants.add(`${playerData.userId}_${activityId}`);
            }
            
            // Contribuir al progreso comunitario
            if (activity.contributes_to_global && eventInstance.communityProgress) {
                this.updateCommunityProgress(eventId, result.contribution || 1);
            }
        }
        
        return result;
    }

    /**
     * ⚡ Procesar participación en actividad
     */
    processActivityParticipation(playerData, eventInstance, activity) {
        const rewards = { ...activity.rewards };
        const grantedRewards = [];
        
        // Aplicar multiplicadores del evento
        if (eventInstance.global_effects) {
            this.applyEventMultipliers(rewards, eventInstance.global_effects);
        }
        
        // Otorgar experiencia
        if (rewards.exp) {
            const expResult = progressionSystem.awardExperience(playerData, 'event_activity', rewards.exp);
            grantedRewards.push({ type: 'exp', amount: expResult.expGained });
        }
        
        // Otorgar monedas
        if (rewards.coins) {
            playerData.coins = (playerData.coins || 0) + rewards.coins;
            grantedRewards.push({ type: 'coins', amount: rewards.coins });
        }
        
        // Otorgar objetos
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
        
        // Otorgar mana
        if (rewards.mana) {
            playerData.mana = Math.min(
                (playerData.mana || 0) + rewards.mana,
                playerData.maxMana || 100
            );
            grantedRewards.push({ type: 'mana', amount: rewards.mana });
        }
        
        console.log(`🎯 ${playerData.username} participó en ${activity.name}`);
        
        return { 
            success: true, 
            rewards: grantedRewards,
            contribution: this.calculateContribution(activity, playerData)
        };
    }

    /**
     * 🤝 Actualizar progreso comunitario
     */
    updateCommunityProgress(eventId, contribution) {
        const progress = this.communityProgress.get(eventId);
        if (!progress) return;
        
        progress.current += contribution;
        
        // Verificar si se alcanzó el objetivo
        if (progress.current >= progress.target && !progress.completed) {
            progress.completed = true;
            progress.completionTime = Date.now();
            
            this.processCommunityGoalCompletion(eventId, progress);
        }
        
        this.communityProgress.set(eventId, progress);
    }

    /**
     * 🏆 Procesar completación de objetivo comunitario
     */
    processCommunityGoalCompletion(eventId, progress) {
        const eventInstance = this.activeEvents.get(eventId);
        if (!eventInstance) return;
        
        console.log(`🏆 Objetivo comunitario completado para ${eventInstance.name}!`);
        
        // Aplicar recompensas comunitarias
        if (progress.rewards_on_completion?.community) {
            this.applyGlobalEffects(eventId + '_community', progress.rewards_on_completion.community);
        }
        
        // Las recompensas individuales se otorgarán cuando los jugadores las reclamen
    }

    /**
     * 🛒 Comprar en tienda de evento
     */
    purchaseFromEventShop(playerData, eventId, itemId) {
        const eventInstance = this.activeEvents.get(eventId);
        if (!eventInstance) {
            return { success: false, reason: 'event_not_active' };
        }
        
        const item = eventInstance.shop?.[itemId];
        if (!item) {
            return { success: false, reason: 'item_not_found' };
        }
        
        // Verificar cantidad limitada
        if (item.limited_quantity !== undefined) {
            const purchased = this.getItemPurchaseCount(eventId, itemId);
            if (purchased >= item.limited_quantity) {
                return { success: false, reason: 'item_sold_out' };
            }
        }
        
        // Verificar moneda del evento
        const playerCurrency = playerData.eventCurrencies?.[item.currency] || 0;
        if (playerCurrency < item.cost) {
            return { success: false, reason: 'insufficient_event_currency' };
        }
        
        // Procesar compra
        playerData.eventCurrencies = playerData.eventCurrencies || {};
        playerData.eventCurrencies[item.currency] -= item.cost;
        
        // Añadir objeto al inventario
        const addResult = inventorySystem.addItem(playerData, itemId, 1);
        if (!addResult.success) {
            // Revertir compra si no se puede añadir
            playerData.eventCurrencies[item.currency] += item.cost;
            return { success: false, reason: 'inventory_full' };
        }
        
        // Registrar compra
        this.recordItemPurchase(eventId, itemId, playerData.userId);
        
        console.log(`🛒 ${playerData.username} compró ${item.name} del evento ${eventInstance.name}`);
        
        return { success: true, item, cost: item.cost };
    }

    /**
     * 📊 Obtener estadísticas de evento
     */
    getEventStats(eventId) {
        const eventInstance = this.activeEvents.get(eventId);
        if (!eventInstance) return null;
        
        const stats = {
            name: eventInstance.name,
            type: eventInstance.type,
            status: eventInstance.status,
            startTime: eventInstance.startTime,
            endTime: eventInstance.endTime,
            timeRemaining: Math.max(0, eventInstance.endTime - Date.now()),
            participants: eventInstance.participants.size,
            activitiesCompleted: eventInstance.activityCooldowns.size
        };
        
        // Progreso comunitario
        const communityProgress = this.communityProgress.get(eventId);
        if (communityProgress) {
            stats.communityProgress = {
                current: communityProgress.current,
                target: communityProgress.target,
                percentage: Math.min(100, (communityProgress.current / communityProgress.target) * 100),
                completed: communityProgress.completed || false
            };
        }
        
        return stats;
    }

    /**
     * 📋 Obtener eventos activos
     */
    getActiveEvents() {
        return Array.from(this.activeEvents.values()).map(event => ({
            id: event.id,
            name: event.name,
            type: event.type,
            description: event.description,
            timeRemaining: Math.max(0, event.endTime - Date.now()),
            status: event.status,
            participants: event.participants.size
        }));
    }

    /**
     * 🔄 Actualizar estados de eventos
     */
    updateEventStatuses() {
        const now = Date.now();
        
        this.activeEvents.forEach((eventInstance, eventId) => {
            const timeRemaining = eventInstance.endTime - now;
            
            if (timeRemaining <= 0) {
                this.endEvent(eventId);
            } else if (timeRemaining <= 24 * 60 * 60 * 1000) { // 24 horas
                eventInstance.status = 'ending_soon';
            }
        });
    }

    /**
     * 🧹 Limpiar eventos expirados
     */
    cleanupExpiredEvents() {
        // Limpiar datos de eventos que terminaron hace más de 7 días
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        // Aquí se implementaría la limpieza de la base de datos
        console.log('🧹 Limpieza de eventos expirados completada');
    }

    // MÉTODOS DE UTILIDAD

    /**
     * ⚡ Aplicar efectos globales
     */
    applyGlobalEffects(eventId, effects) {
        // Implementar aplicación de efectos globales
        console.log(`⚡ Aplicando efectos globales para ${eventId}:`, effects);
    }

    /**
     * 🚫 Remover efectos globales
     */
    removeGlobalEffects(eventId) {
        // Implementar remoción de efectos globales
        console.log(`🚫 Removiendo efectos globales para ${eventId}`);
    }

    /**
     * 📈 Aplicar multiplicadores de evento
     */
    applyEventMultipliers(rewards, globalEffects) {
        if (globalEffects.exp_bonus && rewards.exp) {
            rewards.exp = Math.floor(rewards.exp * globalEffects.exp_bonus);
        }
        
        if (globalEffects.all_bonuses) {
            Object.keys(rewards).forEach(key => {
                if (typeof rewards[key] === 'number') {
                    rewards[key] = Math.floor(rewards[key] * globalEffects.all_bonuses);
                }
            });
        }
    }

    /**
     * 🧮 Calcular contribución
     */
    calculateContribution(activity, playerData) {
        let base = 1;
        
        // Bonus por nivel del jugador
        const levelBonus = Math.floor((playerData.level || 1) / 10);
        
        // Bonus por tipo de actividad
        const activityMultipliers = {
            gathering: 2,
            building: 3,
            combat: 1.5,
            crafting: 2.5
        };
        
        const multiplier = activityMultipliers[activity.type] || 1;
        
        return base + levelBonus * multiplier;
    }

    /**
     * 🛍️ Obtener conteo de compras de objeto
     */
    getItemPurchaseCount(eventId, itemId) {
        // Implementar conteo desde base de datos
        return 0;
    }

    /**
     * 📝 Registrar compra de objeto
     */
    recordItemPurchase(eventId, itemId, userId) {
        // Implementar registro en base de datos
        console.log(`📝 Registrando compra: ${itemId} por ${userId} en evento ${eventId}`);
    }

    /**
     * 🏆 Procesar recompensas finales
     */
    processFinalRewards(eventInstance) {
        // Implementar procesamiento de recompensas finales
        return {
            participantCount: eventInstance.participants.size,
            activitiesCompleted: eventInstance.activityCooldowns.size
        };
    }

    /**
     * 🎨 Generar embed de evento
     */
    generateEventEmbed(eventId) {
        const eventInstance = this.activeEvents.get(eventId);
        if (!eventInstance) return null;
        
        const eventType = this.eventTypes[eventInstance.type];
        const timeRemaining = Math.max(0, eventInstance.endTime - Date.now());
        const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        
        const embed = new PassQuirkEmbed()
            .setTitle(`${eventType.emoji} ${eventInstance.name}`)
            .setDescription(eventInstance.description)
            .setColor(eventType.color)
            .addField('⏰ Tiempo Restante', 
                `${days}d ${hours}h`,
                true
            )
            .addField('👥 Participantes', 
                eventInstance.participants.size.toString(),
                true
            )
            .addField('📊 Estado', 
                this.eventStatus[eventInstance.status],
                true
            );
        
        // Progreso comunitario
        const communityProgress = this.communityProgress.get(eventId);
        if (communityProgress) {
            const percentage = Math.min(100, (communityProgress.current / communityProgress.target) * 100);
            embed.addField('🤝 Progreso Comunitario', 
                `${communityProgress.current}/${communityProgress.target} (${percentage.toFixed(1)}%)`,
                false
            );
        }
        
        // Actividades disponibles
        const activities = eventInstance.activities
            .slice(0, 3)
            .map(activity => `${activity.name}`)
            .join('\n');
        
        if (activities) {
            embed.addField('🎯 Actividades', activities, false);
        }
        
        return embed;
    }

    /**
     * 🎨 Generar embed de lista de eventos
     */
    generateEventListEmbed() {
        const activeEvents = this.getActiveEvents();
        
        const embed = new PassQuirkEmbed()
            .setTitle('🎉 Eventos Activos')
            .setDescription(`${activeEvents.length} eventos en curso`);
        
        if (activeEvents.length === 0) {
            embed.addField('📭 Sin eventos', 'No hay eventos activos en este momento.');
        } else {
            activeEvents.forEach(event => {
                const eventType = this.eventTypes[event.type];
                const timeRemaining = Math.max(0, event.timeRemaining);
                const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
                const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                
                embed.addField(
                    `${eventType.emoji} ${event.name}`,
                    `${event.description}\n**Tiempo:** ${days}d ${hours}h\n**Participantes:** ${event.participants}`,
                    false
                );
            });
        }
        
        return embed;
    }
}

// Crear instancia singleton del sistema de eventos
const eventSystem = new EventSystem();

module.exports = {
    EventSystem,
    eventSystem,
    EVENT_DATABASE,
    EVENT_TYPES,
    EVENT_STATUS
};