// 🏰 GUILD SYSTEM - Sistema de Gremios de PassQuirk RPG
// Maneja gremios, membresías, actividades cooperativas y competencias

const { PassQuirkEmbed } = require('../utils/embedStyles');
const { progressionSystem } = require('./progression-system');
const { inventorySystem } = require('./inventory-system');
const { questSystem } = require('./quest-system');

/**
 * 🏰 Tipos de gremios
 */
const GUILD_TYPES = {
    adventurers: {
        name: 'Aventureros',
        emoji: '⚔️',
        color: 0xff6b35,
        description: 'Gremio enfocado en exploración y combate',
        bonuses: {
            combat_exp: 1.1,
            exploration_rewards: 1.15
        },
        requirements: {
            min_level: 5,
            combat_victories: 10
        }
    },
    scholars: {
        name: 'Eruditos',
        emoji: '📚',
        color: 0x4a90e2,
        description: 'Gremio dedicado al conocimiento y la magia',
        bonuses: {
            study_exp: 1.2,
            mana_regen: 1.1
        },
        requirements: {
            min_level: 3,
            study_sessions: 20
        }
    },
    merchants: {
        name: 'Mercaderes',
        emoji: '💰',
        color: 0xf5a623,
        description: 'Gremio centrado en el comercio y la economía',
        bonuses: {
            coin_gain: 1.25,
            trade_discounts: 0.9
        },
        requirements: {
            min_level: 8,
            coins_earned: 5000
        }
    },
    artisans: {
        name: 'Artesanos',
        emoji: '🔨',
        color: 0x8e44ad,
        description: 'Gremio de creadores y crafteo',
        bonuses: {
            craft_success: 1.15,
            material_efficiency: 1.1
        },
        requirements: {
            min_level: 10,
            items_crafted: 25
        }
    },
    guardians: {
        name: 'Guardianes',
        emoji: '🛡️',
        color: 0x27ae60,
        description: 'Gremio protector de las tierras',
        bonuses: {
            defense_bonus: 1.2,
            healing_efficiency: 1.15
        },
        requirements: {
            min_level: 15,
            damage_blocked: 10000
        }
    }
};

/**
 * 👑 Rangos de gremio
 */
const GUILD_RANKS = {
    member: {
        name: 'Miembro',
        emoji: '👤',
        permissions: ['participate_events', 'use_guild_chat'],
        contribution_required: 0
    },
    veteran: {
        name: 'Veterano',
        emoji: '⭐',
        permissions: ['participate_events', 'use_guild_chat', 'invite_members'],
        contribution_required: 1000
    },
    officer: {
        name: 'Oficial',
        emoji: '🎖️',
        permissions: ['participate_events', 'use_guild_chat', 'invite_members', 'kick_members', 'manage_events'],
        contribution_required: 5000
    },
    leader: {
        name: 'Líder',
        emoji: '👑',
        permissions: ['all'],
        contribution_required: 0
    }
};

/**
 * 🎯 Actividades de gremio
 */
const GUILD_ACTIVITIES = {
    raid: {
        name: 'Incursión',
        emoji: '⚔️',
        description: 'Batalla cooperativa contra jefes poderosos',
        min_participants: 3,
        max_participants: 8,
        duration: 60, // minutos
        cooldown: 24 * 60 * 60 * 1000, // 24 horas
        rewards: {
            exp: 500,
            coins: 300,
            guild_points: 100
        }
    },
    expedition: {
        name: 'Expedición',
        emoji: '🗺️',
        description: 'Exploración grupal de nuevas regiones',
        min_participants: 2,
        max_participants: 6,
        duration: 45,
        cooldown: 12 * 60 * 60 * 1000, // 12 horas
        rewards: {
            exp: 300,
            coins: 200,
            guild_points: 75
        }
    },
    training: {
        name: 'Entrenamiento',
        emoji: '💪',
        description: 'Sesión de entrenamiento grupal',
        min_participants: 2,
        max_participants: 10,
        duration: 30,
        cooldown: 6 * 60 * 60 * 1000, // 6 horas
        rewards: {
            exp: 200,
            guild_points: 50
        }
    },
    tournament: {
        name: 'Torneo',
        emoji: '🏆',
        description: 'Competencia entre miembros del gremio',
        min_participants: 4,
        max_participants: 16,
        duration: 90,
        cooldown: 7 * 24 * 60 * 60 * 1000, // 7 días
        rewards: {
            exp: 800,
            coins: 500,
            guild_points: 200
        }
    }
};

/**
 * 🏪 Tienda de gremio
 */
const GUILD_SHOP = {
    guild_banner: {
        id: 'guild_banner',
        name: 'Estandarte de Gremio',
        description: 'Aumenta la experiencia de gremio en un 10%',
        cost: 5000,
        currency: 'guild_points',
        effect: { guild_exp_bonus: 1.1 },
        duration: 7 * 24 * 60 * 60 * 1000 // 7 días
    },
    exp_boost_guild: {
        id: 'exp_boost_guild',
        name: 'Impulso de EXP Grupal',
        description: 'Todos los miembros obtienen 25% más EXP por 24h',
        cost: 3000,
        currency: 'guild_points',
        effect: { member_exp_bonus: 1.25 },
        duration: 24 * 60 * 60 * 1000 // 24 horas
    },
    guild_vault_expansion: {
        id: 'guild_vault_expansion',
        name: 'Expansión de Bóveda',
        description: 'Aumenta el espacio de la bóveda del gremio',
        cost: 10000,
        currency: 'guild_points',
        effect: { vault_slots: 50 },
        permanent: true
    },
    raid_ticket: {
        id: 'raid_ticket',
        name: 'Boleto de Incursión',
        description: 'Permite participar en una incursión adicional',
        cost: 1000,
        currency: 'guild_points',
        consumable: true
    }
};

/**
 * 🏰 Clase principal del sistema de gremios
 */
class GuildSystem {
    constructor() {
        this.guildTypes = GUILD_TYPES;
        this.guildRanks = GUILD_RANKS;
        this.guildActivities = GUILD_ACTIVITIES;
        this.guildShop = GUILD_SHOP;
        this.guilds = new Map(); // Cache de gremios
    }

    /**
     * 🆕 Crea un nuevo gremio
     */
    async createGuild(leaderData, guildName, guildType, description = '') {
        // Verificar si el jugador ya está en un gremio
        if (leaderData.guild) {
            return { success: false, reason: 'already_in_guild' };
        }

        // Verificar requisitos del tipo de gremio
        const typeInfo = this.guildTypes[guildType];
        if (!typeInfo) {
            return { success: false, reason: 'invalid_guild_type' };
        }

        if (!this.meetsGuildRequirements(leaderData, typeInfo.requirements)) {
            return { success: false, reason: 'requirements_not_met' };
        }

        // Verificar costo de creación
        const creationCost = 1000;
        if ((leaderData.coins || 0) < creationCost) {
            return { success: false, reason: 'insufficient_funds' };
        }

        // Crear el gremio
        const guildId = this.generateGuildId();
        const guild = {
            id: guildId,
            name: guildName,
            type: guildType,
            description: description,
            leader: leaderData.userId,
            created: Date.now(),
            level: 1,
            exp: 0,
            points: 0,
            members: {
                [leaderData.userId]: {
                    userId: leaderData.userId,
                    username: leaderData.username,
                    rank: 'leader',
                    joinDate: Date.now(),
                    contribution: 0,
                    lastActive: Date.now()
                }
            },
            vault: {
                coins: 0,
                items: [],
                maxSlots: 100
            },
            activities: {
                completed: [],
                scheduled: []
            },
            achievements: [],
            settings: {
                joinRequests: true,
                autoAccept: false,
                minLevelToJoin: 1
            },
            activeEffects: []
        };

        // Deducir costo y actualizar datos del líder
        leaderData.coins -= creationCost;
        leaderData.guild = {
            id: guildId,
            rank: 'leader',
            joinDate: Date.now(),
            contribution: 0
        };

        // Guardar gremio en cache
        this.guilds.set(guildId, guild);

        console.log(`🏰 Gremio creado: ${guildName} por ${leaderData.username}`);

        return { success: true, guild, cost: creationCost };
    }

    /**
     * 🚪 Unirse a un gremio
     */
    async joinGuild(playerData, guildId) {
        // Verificar si el jugador ya está en un gremio
        if (playerData.guild) {
            return { success: false, reason: 'already_in_guild' };
        }

        const guild = await this.getGuild(guildId);
        if (!guild) {
            return { success: false, reason: 'guild_not_found' };
        }

        // Verificar si el gremio está lleno
        const memberCount = Object.keys(guild.members).length;
        const maxMembers = this.getMaxMembers(guild.level);
        if (memberCount >= maxMembers) {
            return { success: false, reason: 'guild_full' };
        }

        // Verificar requisitos
        const guildType = this.guildTypes[guild.type];
        if (!this.meetsGuildRequirements(playerData, guildType.requirements)) {
            return { success: false, reason: 'requirements_not_met' };
        }

        // Verificar nivel mínimo del gremio
        if ((playerData.level || 1) < guild.settings.minLevelToJoin) {
            return { success: false, reason: 'level_too_low' };
        }

        // Añadir al jugador al gremio
        guild.members[playerData.userId] = {
            userId: playerData.userId,
            username: playerData.username,
            rank: 'member',
            joinDate: Date.now(),
            contribution: 0,
            lastActive: Date.now()
        };

        // Actualizar datos del jugador
        playerData.guild = {
            id: guildId,
            rank: 'member',
            joinDate: Date.now(),
            contribution: 0
        };

        console.log(`🚪 ${playerData.username} se unió al gremio ${guild.name}`);

        return { success: true, guild };
    }

    /**
     * 🚶 Abandonar gremio
     */
    async leaveGuild(playerData) {
        if (!playerData.guild) {
            return { success: false, reason: 'not_in_guild' };
        }

        const guild = await this.getGuild(playerData.guild.id);
        if (!guild) {
            return { success: false, reason: 'guild_not_found' };
        }

        // Si es el líder, transferir liderazgo o disolver gremio
        if (playerData.guild.rank === 'leader') {
            const officers = Object.values(guild.members).filter(m => m.rank === 'officer');
            const veterans = Object.values(guild.members).filter(m => m.rank === 'veteran');
            const members = Object.values(guild.members).filter(m => m.rank === 'member');

            if (officers.length > 0) {
                // Promover al oficial con más contribución
                const newLeader = officers.reduce((prev, current) => 
                    prev.contribution > current.contribution ? prev : current
                );
                guild.members[newLeader.userId].rank = 'leader';
                guild.leader = newLeader.userId;
            } else if (veterans.length > 0) {
                // Promover al veterano con más contribución
                const newLeader = veterans.reduce((prev, current) => 
                    prev.contribution > current.contribution ? prev : current
                );
                guild.members[newLeader.userId].rank = 'leader';
                guild.leader = newLeader.userId;
            } else if (members.length > 0) {
                // Promover al miembro con más contribución
                const newLeader = members.reduce((prev, current) => 
                    prev.contribution > current.contribution ? prev : current
                );
                guild.members[newLeader.userId].rank = 'leader';
                guild.leader = newLeader.userId;
            } else {
                // Disolver gremio si no hay más miembros
                return this.dissolveGuild(guild.id);
            }
        }

        // Remover al jugador del gremio
        delete guild.members[playerData.userId];
        delete playerData.guild;

        console.log(`🚶 ${playerData.username} abandonó el gremio ${guild.name}`);

        return { success: true, guild };
    }

    /**
     * 💥 Disolver gremio
     */
    async dissolveGuild(guildId) {
        const guild = await this.getGuild(guildId);
        if (!guild) {
            return { success: false, reason: 'guild_not_found' };
        }

        // Remover gremio del cache
        this.guilds.delete(guildId);

        console.log(`💥 Gremio disuelto: ${guild.name}`);

        return { success: true };
    }

    /**
     * 📈 Promover miembro
     */
    async promoteMember(promoterData, targetUserId) {
        if (!promoterData.guild) {
            return { success: false, reason: 'not_in_guild' };
        }

        const guild = await this.getGuild(promoterData.guild.id);
        if (!guild) {
            return { success: false, reason: 'guild_not_found' };
        }

        const promoter = guild.members[promoterData.userId];
        const target = guild.members[targetUserId];

        if (!target) {
            return { success: false, reason: 'target_not_in_guild' };
        }

        // Verificar permisos
        if (!this.canPromote(promoter.rank, target.rank)) {
            return { success: false, reason: 'insufficient_permissions' };
        }

        // Verificar contribución requerida
        const nextRank = this.getNextRank(target.rank);
        if (!nextRank) {
            return { success: false, reason: 'already_max_rank' };
        }

        const rankInfo = this.guildRanks[nextRank];
        if (target.contribution < rankInfo.contribution_required) {
            return { success: false, reason: 'insufficient_contribution' };
        }

        // Promover
        target.rank = nextRank;

        console.log(`📈 ${target.username} promovido a ${rankInfo.name} en ${guild.name}`);

        return { success: true, newRank: nextRank, rankInfo };
    }

    /**
     * 🎯 Iniciar actividad de gremio
     */
    async startGuildActivity(initiatorData, activityType) {
        if (!initiatorData.guild) {
            return { success: false, reason: 'not_in_guild' };
        }

        const guild = await this.getGuild(initiatorData.guild.id);
        if (!guild) {
            return { success: false, reason: 'guild_not_found' };
        }

        const activity = this.guildActivities[activityType];
        if (!activity) {
            return { success: false, reason: 'invalid_activity' };
        }

        // Verificar permisos
        const member = guild.members[initiatorData.userId];
        if (!this.hasPermission(member.rank, 'manage_events')) {
            return { success: false, reason: 'insufficient_permissions' };
        }

        // Verificar cooldown
        const lastActivity = guild.activities.completed
            .filter(a => a.type === activityType)
            .sort((a, b) => b.endTime - a.endTime)[0];

        if (lastActivity && (Date.now() - lastActivity.endTime) < activity.cooldown) {
            return { success: false, reason: 'activity_on_cooldown' };
        }

        // Crear instancia de actividad
        const activityInstance = {
            id: this.generateActivityId(),
            type: activityType,
            name: activity.name,
            initiator: initiatorData.userId,
            startTime: Date.now(),
            endTime: Date.now() + (activity.duration * 60 * 1000),
            participants: [initiatorData.userId],
            status: 'recruiting',
            maxParticipants: activity.max_participants,
            minParticipants: activity.min_participants
        };

        guild.activities.scheduled.push(activityInstance);

        console.log(`🎯 Actividad iniciada: ${activity.name} en ${guild.name}`);

        return { success: true, activity: activityInstance };
    }

    /**
     * 🤝 Unirse a actividad de gremio
     */
    async joinGuildActivity(playerData, activityId) {
        if (!playerData.guild) {
            return { success: false, reason: 'not_in_guild' };
        }

        const guild = await this.getGuild(playerData.guild.id);
        if (!guild) {
            return { success: false, reason: 'guild_not_found' };
        }

        const activity = guild.activities.scheduled.find(a => a.id === activityId);
        if (!activity) {
            return { success: false, reason: 'activity_not_found' };
        }

        if (activity.status !== 'recruiting') {
            return { success: false, reason: 'activity_not_recruiting' };
        }

        if (activity.participants.includes(playerData.userId)) {
            return { success: false, reason: 'already_participating' };
        }

        if (activity.participants.length >= activity.maxParticipants) {
            return { success: false, reason: 'activity_full' };
        }

        activity.participants.push(playerData.userId);

        // Si se alcanza el mínimo, iniciar actividad
        if (activity.participants.length >= activity.minParticipants && activity.status === 'recruiting') {
            activity.status = 'active';
            activity.actualStartTime = Date.now();
        }

        console.log(`🤝 ${playerData.username} se unió a ${activity.name}`);

        return { success: true, activity };
    }

    /**
     * 🏁 Completar actividad de gremio
     */
    async completeGuildActivity(activityId, results = {}) {
        // Buscar la actividad en todos los gremios
        let guild = null;
        let activity = null;

        for (const [guildId, guildData] of this.guilds) {
            const foundActivity = guildData.activities.scheduled.find(a => a.id === activityId);
            if (foundActivity) {
                guild = guildData;
                activity = foundActivity;
                break;
            }
        }

        if (!activity) {
            return { success: false, reason: 'activity_not_found' };
        }

        if (activity.status !== 'active') {
            return { success: false, reason: 'activity_not_active' };
        }

        // Marcar como completada
        activity.status = 'completed';
        activity.endTime = Date.now();
        activity.results = results;

        // Mover a completadas
        guild.activities.completed.push(activity);
        guild.activities.scheduled = guild.activities.scheduled.filter(a => a.id !== activityId);

        // Otorgar recompensas
        const activityData = this.guildActivities[activity.type];
        const rewards = this.calculateActivityRewards(activityData, activity.participants.length, results);

        // Distribuir recompensas a participantes
        const rewardedPlayers = [];
        for (const participantId of activity.participants) {
            const member = guild.members[participantId];
            if (member) {
                // Aquí se aplicarían las recompensas al jugador
                // (requiere acceso a la base de datos de jugadores)
                member.contribution += rewards.guild_points || 0;
                rewardedPlayers.push({
                    userId: participantId,
                    username: member.username,
                    rewards
                });
            }
        }

        // Añadir puntos al gremio
        guild.points += rewards.guild_points || 0;
        guild.exp += rewards.guild_points || 0;

        // Verificar subida de nivel del gremio
        this.checkGuildLevelUp(guild);

        console.log(`🏁 Actividad completada: ${activity.name} en ${guild.name}`);

        return { success: true, activity, rewards, rewardedPlayers };
    }

    /**
     * 🛒 Comprar en la tienda del gremio
     */
    async purchaseFromGuildShop(playerData, itemId) {
        if (!playerData.guild) {
            return { success: false, reason: 'not_in_guild' };
        }

        const guild = await this.getGuild(playerData.guild.id);
        if (!guild) {
            return { success: false, reason: 'guild_not_found' };
        }

        const item = this.guildShop[itemId];
        if (!item) {
            return { success: false, reason: 'item_not_found' };
        }

        // Verificar permisos
        const member = guild.members[playerData.userId];
        if (!this.hasPermission(member.rank, 'use_guild_shop')) {
            return { success: false, reason: 'insufficient_permissions' };
        }

        // Verificar fondos
        if (item.currency === 'guild_points') {
            if (guild.points < item.cost) {
                return { success: false, reason: 'insufficient_guild_points' };
            }
            guild.points -= item.cost;
        } else if (item.currency === 'coins') {
            if ((playerData.coins || 0) < item.cost) {
                return { success: false, reason: 'insufficient_coins' };
            }
            playerData.coins -= item.cost;
        }

        // Aplicar efecto del objeto
        if (item.effect) {
            if (item.permanent) {
                // Efecto permanente
                this.applyPermanentEffect(guild, item.effect);
            } else {
                // Efecto temporal
                const effect = {
                    ...item.effect,
                    source: itemId,
                    startTime: Date.now(),
                    endTime: Date.now() + item.duration,
                    purchasedBy: playerData.userId
                };
                guild.activeEffects.push(effect);
            }
        }

        // Si es consumible, añadir al inventario del jugador
        if (item.consumable) {
            inventorySystem.addItem(playerData, itemId, 1);
        }

        console.log(`🛒 ${playerData.username} compró ${item.name} para ${guild.name}`);

        return { success: true, item, cost: item.cost };
    }

    // MÉTODOS DE UTILIDAD

    /**
     * 🔍 Obtener información de un gremio
     */
    async getGuild(guildId) {
        // Primero verificar cache
        if (this.guilds.has(guildId)) {
            return this.guilds.get(guildId);
        }

        // Aquí se cargaría desde la base de datos
        // Por ahora retornamos null
        return null;
    }

    /**
     * 🔢 Obtener máximo de miembros según nivel del gremio
     */
    getMaxMembers(guildLevel) {
        return Math.min(50, 10 + (guildLevel * 2));
    }

    /**
     * ✅ Verificar si cumple requisitos del gremio
     */
    meetsGuildRequirements(playerData, requirements) {
        if (requirements.min_level && (playerData.level || 1) < requirements.min_level) {
            return false;
        }

        if (requirements.combat_victories && (playerData.combatStats?.victories || 0) < requirements.combat_victories) {
            return false;
        }

        if (requirements.study_sessions && (playerData.studySessions || 0) < requirements.study_sessions) {
            return false;
        }

        if (requirements.coins_earned && (playerData.totalCoinsEarned || 0) < requirements.coins_earned) {
            return false;
        }

        if (requirements.items_crafted && (playerData.itemsCrafted || 0) < requirements.items_crafted) {
            return false;
        }

        if (requirements.damage_blocked && (playerData.combatStats?.damageBlocked || 0) < requirements.damage_blocked) {
            return false;
        }

        return true;
    }

    /**
     * 👑 Verificar si puede promover
     */
    canPromote(promoterRank, targetRank) {
        const rankHierarchy = ['member', 'veteran', 'officer', 'leader'];
        const promoterLevel = rankHierarchy.indexOf(promoterRank);
        const targetLevel = rankHierarchy.indexOf(targetRank);

        // Solo líderes y oficiales pueden promover
        if (promoterLevel < 2) return false;

        // No se puede promover a alguien de igual o mayor rango
        if (targetLevel >= promoterLevel) return false;

        // Los oficiales no pueden crear otros oficiales
        if (promoterRank === 'officer' && targetRank === 'veteran') return false;

        return true;
    }

    /**
     * ⬆️ Obtener siguiente rango
     */
    getNextRank(currentRank) {
        const rankProgression = {
            member: 'veteran',
            veteran: 'officer',
            officer: 'leader'
        };
        return rankProgression[currentRank] || null;
    }

    /**
     * 🔐 Verificar permisos
     */
    hasPermission(rank, permission) {
        const rankInfo = this.guildRanks[rank];
        if (!rankInfo) return false;

        return rankInfo.permissions.includes(permission) || rankInfo.permissions.includes('all');
    }

    /**
     * 📊 Calcular recompensas de actividad
     */
    calculateActivityRewards(activityData, participantCount, results = {}) {
        const baseRewards = { ...activityData.rewards };

        // Bonus por número de participantes
        const participantBonus = Math.min(1.5, 1 + (participantCount - activityData.min_participants) * 0.1);

        // Bonus por rendimiento
        const performanceBonus = results.success ? 1.2 : 0.8;

        // Aplicar multiplicadores
        Object.keys(baseRewards).forEach(key => {
            if (typeof baseRewards[key] === 'number') {
                baseRewards[key] = Math.floor(baseRewards[key] * participantBonus * performanceBonus);
            }
        });

        return baseRewards;
    }

    /**
     * 📈 Verificar subida de nivel del gremio
     */
    checkGuildLevelUp(guild) {
        const expRequired = this.getGuildExpRequired(guild.level);
        
        while (guild.exp >= expRequired) {
            guild.exp -= expRequired;
            guild.level++;
            
            console.log(`📈 Gremio ${guild.name} subió al nivel ${guild.level}!`);
            
            // Desbloquear beneficios por nivel
            this.unlockGuildBenefits(guild);
        }
    }

    /**
     * 🎯 Obtener EXP requerida para nivel de gremio
     */
    getGuildExpRequired(level) {
        return 1000 + (level * 500);
    }

    /**
     * 🔓 Desbloquear beneficios por nivel de gremio
     */
    unlockGuildBenefits(guild) {
        const benefits = {
            5: { vault_slots: 50, description: 'Expansión de bóveda' },
            10: { activity_cooldown_reduction: 0.9, description: 'Reducción de cooldown de actividades' },
            15: { member_exp_bonus: 1.05, description: 'Bonus de EXP para miembros' },
            20: { max_members_bonus: 10, description: 'Capacidad adicional de miembros' }
        };

        const benefit = benefits[guild.level];
        if (benefit) {
            this.applyPermanentEffect(guild, benefit);
            console.log(`🔓 ${guild.name} desbloqueó: ${benefit.description}`);
        }
    }

    /**
     * ⚡ Aplicar efecto permanente
     */
    applyPermanentEffect(guild, effect) {
        if (effect.vault_slots) {
            guild.vault.maxSlots += effect.vault_slots;
        }
        if (effect.max_members_bonus) {
            guild.maxMembersBonus = (guild.maxMembersBonus || 0) + effect.max_members_bonus;
        }
        // Otros efectos permanentes...
    }

    /**
     * 🆔 Generar ID único para gremio
     */
    generateGuildId() {
        return 'guild_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 🆔 Generar ID único para actividad
     */
    generateActivityId() {
        return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 🎨 Generar embed de información del gremio
     */
    generateGuildInfoEmbed(guild) {
        const guildType = this.guildTypes[guild.type];
        const memberCount = Object.keys(guild.members).length;
        const maxMembers = this.getMaxMembers(guild.level);
        
        const embed = new PassQuirkEmbed()
            .setTitle(`${guildType.emoji} ${guild.name}`)
            .setDescription(guild.description || guildType.description)
            .setColor(guildType.color)
            .addField('📊 Información General', 
                `**Nivel:** ${guild.level}\n` +
                `**Tipo:** ${guildType.name}\n` +
                `**Miembros:** ${memberCount}/${maxMembers}\n` +
                `**Puntos:** ${guild.points}\n` +
                `**EXP:** ${guild.exp}/${this.getGuildExpRequired(guild.level)}`,
                true
            );

        // Líder y oficiales
        const leader = Object.values(guild.members).find(m => m.rank === 'leader');
        const officers = Object.values(guild.members).filter(m => m.rank === 'officer');
        
        let leadershipText = `**Líder:** ${leader ? leader.username : 'Vacante'}`;
        if (officers.length > 0) {
            leadershipText += `\n**Oficiales:** ${officers.map(o => o.username).join(', ')}`;
        }
        
        embed.addField('👑 Liderazgo', leadershipText, true);

        // Actividades recientes
        const recentActivities = guild.activities.completed
            .slice(-3)
            .map(a => `${this.guildActivities[a.type]?.emoji || '🎯'} ${a.name}`)
            .join('\n');
        
        if (recentActivities) {
            embed.addField('🎯 Actividades Recientes', recentActivities, false);
        }

        // Efectos activos
        const activeEffects = guild.activeEffects
            .filter(e => e.endTime > Date.now())
            .map(e => {
                const timeLeft = Math.ceil((e.endTime - Date.now()) / (60 * 60 * 1000));
                return `${this.guildShop[e.source]?.name || 'Efecto'} (${timeLeft}h)`;
            })
            .join('\n');
        
        if (activeEffects) {
            embed.addField('⚡ Efectos Activos', activeEffects, false);
        }

        return embed;
    }

    /**
     * 🎨 Generar embed de lista de miembros
     */
    generateMemberListEmbed(guild, page = 1) {
        const membersPerPage = 10;
        const members = Object.values(guild.members)
            .sort((a, b) => {
                const rankOrder = { leader: 4, officer: 3, veteran: 2, member: 1 };
                return rankOrder[b.rank] - rankOrder[a.rank] || b.contribution - a.contribution;
            });
        
        const totalPages = Math.ceil(members.length / membersPerPage);
        const startIndex = (page - 1) * membersPerPage;
        const pageMembers = members.slice(startIndex, startIndex + membersPerPage);
        
        const embed = new PassQuirkEmbed()
            .setTitle(`👥 Miembros de ${guild.name}`)
            .setDescription(`Página ${page}/${totalPages} • ${members.length} miembros`);
        
        pageMembers.forEach(member => {
            const rankInfo = this.guildRanks[member.rank];
            const lastActive = Math.floor((Date.now() - member.lastActive) / (24 * 60 * 60 * 1000));
            
            embed.addField(
                `${rankInfo.emoji} ${member.username}`,
                `**Rango:** ${rankInfo.name}\n` +
                `**Contribución:** ${member.contribution}\n` +
                `**Último activo:** ${lastActive === 0 ? 'Hoy' : `${lastActive} días`}`,
                true
            );
        });
        
        return embed;
    }
}

// Crear instancia singleton del sistema de gremios
const guildSystem = new GuildSystem();

module.exports = {
    GuildSystem,
    guildSystem,
    GUILD_TYPES,
    GUILD_RANKS,
    GUILD_ACTIVITIES,
    GUILD_SHOP
};