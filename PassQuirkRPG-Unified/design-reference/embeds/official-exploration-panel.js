const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');
const { ENEMIES_BY_ZONE } = require('../bot/data/passquirk-official-data');

/**
 * 🗺️ Panel Oficial de Exploración
 * Basado en el sistema de exploración oficial de PassQuirk RPG
 */
function createOfficialExplorationPanel(playerData, currentZone = 'Bosque Encantado') {
    const embed = new EmbedBuilder()
        .setTitle('🗺️ Exploración de PassQuirk')
        .setColor('#228B22')
        .setDescription('Explora las vastas tierras de PassQuirk y descubre nuevas aventuras.')
        .setTimestamp();

    const playerLocation = playerData.location || currentZone;
    const playerLevel = playerData.level || 1;
    const energy = playerData.energy || { current: 100, max: 100 };

    // Información del jugador
    embed.addFields({
        name: '👤 Estado del Aventurero',
        value: `**${playerData.name || 'Aventurero'}** | Nivel ${playerLevel}\n📍 **Ubicación:** ${playerLocation}\n⚡ **Energía:** ${energy.current}/${energy.max}`,
        inline: false
    });

    // Información de la zona actual
    const zoneInfo = getZoneInfo(playerLocation);
    embed.addFields({
        name: `🌍 ${playerLocation}`,
        value: `${zoneInfo.description}\n\n**Nivel recomendado:** ${zoneInfo.recommendedLevel}\n**Enemigos:** ${zoneInfo.enemyCount} tipos diferentes\n**Rareza máxima:** ${zoneInfo.maxRarity}`,
        inline: false
    });

    // Enemigos en la zona
    const zoneEnemies = getZoneEnemies(playerLocation);
    if (zoneEnemies.length > 0) {
        const enemyList = zoneEnemies.slice(0, 5).map(enemy => 
            `${getEnemyEmoji(enemy.rarity)} **${enemy.name}** (Nivel ${enemy.level}) ${enemy.rarity}`
        ).join('\n');
        
        embed.addFields({
            name: '👹 Enemigos Detectados',
            value: enemyList + (zoneEnemies.length > 5 ? '\n*...y más*' : ''),
            inline: true
        });
    }

    // Recursos disponibles
    const zoneResources = getZoneResources(playerLocation);
    embed.addFields({
        name: '💎 Recursos Disponibles',
        value: zoneResources.join('\n'),
        inline: true
    });

    // Eventos especiales
    const specialEvents = getSpecialEvents(playerLocation, playerLevel);
    if (specialEvents.length > 0) {
        embed.addFields({
            name: '🌟 Eventos Especiales',
            value: specialEvents.join('\n'),
            inline: false
        });
    }

    embed.setFooter({
        text: '🗺️ Cada exploración consume energía',
        iconURL: 'https://i.imgur.com/exploration-icon.png'
    });

    // Menú de zonas
    const zoneMenu = new StringSelectMenuBuilder()
        .setCustomId('select_exploration_zone')
        .setPlaceholder('🌍 Selecciona una zona para explorar')
        .addOptions(getZoneOptions(playerLevel));

    // Botones de acción
    const actionRow1 = new ActionRowBuilder().addComponents(zoneMenu);
    
    const actionRow2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('explore_quick')
                .setLabel('⚡ Exploración Rápida')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(energy.current < 10),
            new ButtonBuilder()
                .setCustomId('explore_deep')
                .setLabel('🔍 Exploración Profunda')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(energy.current < 25),
            new ButtonBuilder()
                .setCustomId('explore_hunt')
                .setLabel('🎯 Cazar Enemigos')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(energy.current < 15),
            new ButtonBuilder()
                .setCustomId('explore_gather')
                .setLabel('🌿 Recolectar')
                .setStyle(ButtonStyle.Success)
                .setDisabled(energy.current < 5)
        );

    return { embeds: [embed], components: [actionRow1, actionRow2] };
}

/**
 * 🎯 Panel de Caza de Enemigos
 */
function createHuntingPanel(playerData, zone) {
    const embed = new EmbedBuilder()
        .setTitle(`🎯 Caza en ${zone}`)
        .setColor('#DC143C')
        .setDescription('Selecciona tu objetivo y prepárate para la batalla.')
        .setTimestamp();

    const zoneEnemies = getZoneEnemies(zone);
    const playerLevel = playerData.level || 1;
    const energy = playerData.energy || { current: 100, max: 100 };

    embed.addFields({
        name: '⚡ Estado de Energía',
        value: `**${energy.current}/${energy.max}** energía disponible`,
        inline: false
    });

    // Lista de enemigos disponibles
    if (zoneEnemies.length > 0) {
        const enemyList = zoneEnemies.map((enemy, index) => {
            const difficulty = getDifficultyVsPlayer(enemy, playerLevel);
            const energyCost = getHuntEnergyCost(enemy);
            const canHunt = energy.current >= energyCost;
            const status = canHunt ? '✅' : '❌';
            
            return `${status} **${index + 1}.** ${getEnemyEmoji(enemy.rarity)} **${enemy.name}**\n   Nivel ${enemy.level} | ${enemy.rarity} | ${difficulty}\n   💰 Recompensa: ${enemy.goldReward || '???'} | ⚡ Costo: ${energyCost}`;
        }).join('\n\n');
        
        embed.addFields({
            name: '👹 Objetivos Disponibles',
            value: enemyList,
            inline: false
        });
    }

    // Consejos de caza
    embed.addFields({
        name: '💡 Consejos de Caza',
        value: '• Los enemigos de mayor rareza dan mejores recompensas\n• Cazar enemigos de tu nivel o inferior es más seguro\n• Los enemigos raros aparecen con menos frecuencia\n• Usa pociones antes de enfrentar enemigos difíciles',
        inline: false
    });

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('hunt_random')
                .setLabel('🎲 Caza Aleatoria')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(energy.current < 15),
            new ButtonBuilder()
                .setCustomId('hunt_select')
                .setLabel('🎯 Seleccionar Objetivo')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('hunt_boss')
                .setLabel('👑 Buscar Jefe')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(energy.current < 50),
            new ButtonBuilder()
                .setCustomId('hunt_back')
                .setLabel('🔙 Volver')
                .setStyle(ButtonStyle.Secondary)
        );

    return { embeds: [embed], components: [actionRow] };
}

/**
 * 🌿 Panel de Recolección
 */
function createGatheringPanel(playerData, zone) {
    const embed = new EmbedBuilder()
        .setTitle(`🌿 Recolección en ${zone}`)
        .setColor('#32CD32')
        .setDescription('Busca recursos valiosos en el entorno.')
        .setTimestamp();

    const energy = playerData.energy || { current: 100, max: 100 };
    const gatheringSkill = playerData.skills?.gathering || 1;
    
    embed.addFields({
        name: '⚡ Estado de Energía',
        value: `**${energy.current}/${energy.max}** energía disponible\n🌿 **Habilidad de Recolección:** Nivel ${gatheringSkill}`,
        inline: false
    });

    // Recursos disponibles en la zona
    const availableResources = getZoneGatheringResources(zone);
    const resourceList = availableResources.map(resource => {
        const canGather = energy.current >= resource.energyCost && gatheringSkill >= resource.requiredSkill;
        const status = canGather ? '✅' : '❌';
        const reason = !canGather ? (energy.current < resource.energyCost ? ' (Sin energía)' : ' (Habilidad insuficiente)') : '';
        
        return `${status} ${resource.emoji} **${resource.name}**${reason}\n   ${resource.rarity} | ⚡ Costo: ${resource.energyCost} | 🌿 Req: Nivel ${resource.requiredSkill}\n   *${resource.description}*`;
    }).join('\n\n');

    embed.addFields({
        name: '💎 Recursos Disponibles',
        value: resourceList || 'No hay recursos disponibles en esta zona.',
        inline: false
    });

    // Bonificaciones por habilidad
    const skillBonuses = getGatheringSkillBonuses(gatheringSkill);
    embed.addFields({
        name: '🎯 Bonificaciones de Habilidad',
        value: skillBonuses.join('\n'),
        inline: false
    });

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('gather_quick')
                .setLabel('⚡ Recolección Rápida')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(energy.current < 5),
            new ButtonBuilder()
                .setCustomId('gather_careful')
                .setLabel('🔍 Recolección Cuidadosa')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(energy.current < 10),
            new ButtonBuilder()
                .setCustomId('gather_rare')
                .setLabel('🌟 Buscar Raros')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(energy.current < 20),
            new ButtonBuilder()
                .setCustomId('gather_back')
                .setLabel('🔙 Volver')
                .setStyle(ButtonStyle.Secondary)
        );

    return { embeds: [embed], components: [actionRow] };
}

/**
 * 🔍 Panel de Exploración Profunda
 */
function createDeepExplorationPanel(playerData, zone) {
    const embed = new EmbedBuilder()
        .setTitle(`🔍 Exploración Profunda: ${zone}`)
        .setColor('#4B0082')
        .setDescription('Adéntrate en las profundidades y descubre secretos ocultos.')
        .setTimestamp();

    const energy = playerData.energy || { current: 100, max: 100 };
    const explorationLevel = playerData.skills?.exploration || 1;
    
    embed.addFields({
        name: '⚡ Preparación',
        value: `**Energía:** ${energy.current}/${energy.max}\n🔍 **Habilidad de Exploración:** Nivel ${explorationLevel}\n⏱️ **Duración estimada:** 15-30 minutos`,
        inline: false
    });

    // Posibles descubrimientos
    const possibleFinds = getDeepExplorationFinds(zone, explorationLevel);
    const findsList = possibleFinds.map(find => 
        `${find.emoji} **${find.name}** (${find.chance}% probabilidad)\n   *${find.description}*`
    ).join('\n\n');

    embed.addFields({
        name: '🎁 Posibles Descubrimientos',
        value: findsList,
        inline: false
    });

    // Riesgos
    const risks = getExplorationRisks(zone);
    embed.addFields({
        name: '⚠️ Riesgos Potenciales',
        value: risks.join('\n'),
        inline: false
    });

    // Recompensas por completar
    embed.addFields({
        name: '🏆 Recompensas Garantizadas',
        value: '• +50-100 EXP de Exploración\n• 25-75 Gold\n• Posibilidad de encontrar items únicos\n• Mapeo de nuevas áreas',
        inline: false
    });

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('deep_explore_start')
                .setLabel('🚀 Comenzar Exploración')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(energy.current < 25),
            new ButtonBuilder()
                .setCustomId('deep_explore_prepare')
                .setLabel('🎒 Prepararse')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('deep_explore_cancel')
                .setLabel('❌ Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

    return { embeds: [embed], components: [actionRow] };
}

/**
 * 🎁 Panel de Resultado de Exploración
 */
function createExplorationResultPanel(playerData, result) {
    const embed = new EmbedBuilder()
        .setTitle('🎁 ¡Exploración Completada!')
        .setColor('#FFD700')
        .setDescription(`Has completado tu exploración en **${result.zone}**.`)
        .setTimestamp();

    // Resumen de la exploración
    embed.addFields({
        name: '📊 Resumen de la Aventura',
        value: `⏱️ **Duración:** ${result.duration}\n🗺️ **Distancia recorrida:** ${result.distance}\n👹 **Enemigos encontrados:** ${result.enemiesFound}\n💎 **Recursos recolectados:** ${result.resourcesGathered}`,
        inline: false
    });

    // Recompensas obtenidas
    if (result.rewards && result.rewards.length > 0) {
        const rewardsList = result.rewards.map(reward => 
            `${reward.emoji} **${reward.name}** ${reward.quantity ? `x${reward.quantity}` : ''}`
        ).join('\n');
        
        embed.addFields({
            name: '🎁 Recompensas Obtenidas',
            value: rewardsList,
            inline: false
        });
    }

    // Experiencia ganada
    if (result.experience) {
        embed.addFields({
            name: '⭐ Experiencia Ganada',
            value: `🔍 **Exploración:** +${result.experience.exploration} EXP\n⚔️ **Combate:** +${result.experience.combat} EXP\n🌿 **Recolección:** +${result.experience.gathering} EXP`,
            inline: true
        });
    }

    // Dinero ganado
    if (result.gold) {
        embed.addFields({
            name: '💰 Gold Obtenido',
            value: `**+${result.gold}** Gold`,
            inline: true
        });
    }

    // Descubrimientos especiales
    if (result.discoveries && result.discoveries.length > 0) {
        const discoveriesList = result.discoveries.map(discovery => 
            `🌟 **${discovery.name}** - ${discovery.description}`
        ).join('\n');
        
        embed.addFields({
            name: '🔍 Descubrimientos Especiales',
            value: discoveriesList,
            inline: false
        });
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('exploration_continue')
                .setLabel('🔄 Explorar de Nuevo')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('exploration_inventory')
                .setLabel('🎒 Ver Inventario')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('exploration_rest')
                .setLabel('😴 Descansar')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('exploration_close')
                .setLabel('❌ Cerrar')
                .setStyle(ButtonStyle.Danger)
        );

    return { embeds: [embed], components: [actionRow] };
}

// Funciones auxiliares
function getZoneInfo(zoneName) {
    const zoneData = {
        'Bosque Encantado': {
            description: '🌲 Un bosque místico lleno de criaturas mágicas y plantas raras.',
            recommendedLevel: '1-10',
            enemyCount: 8,
            maxRarity: '🟣 Raro'
        },
        'Montañas Heladas': {
            description: '🏔️ Picos nevados donde habitan bestias de hielo y dragones menores.',
            recommendedLevel: '8-15',
            enemyCount: 6,
            maxRarity: '🟡 Legendario'
        },
        'Desierto Ardiente': {
            description: '🏜️ Vastas dunas donde el calor extremo forja guerreros resistentes.',
            recommendedLevel: '12-20',
            enemyCount: 7,
            maxRarity: '🟡 Legendario'
        },
        'Pantano Tóxico': {
            description: '🐸 Tierras pantanosas llenas de venenos y criaturas corrompidas.',
            recommendedLevel: '15-25',
            enemyCount: 9,
            maxRarity: '⚪ Mítico'
        }
    };
    
    return zoneData[zoneName] || zoneData['Bosque Encantado'];
}

function getZoneEnemies(zoneName) {
    return ENEMIES_BY_ZONE[zoneName] || [];
}

function getZoneResources(zoneName) {
    const resources = {
        'Bosque Encantado': ['🌿 Hierbas medicinales', '🍄 Hongos mágicos', '🌰 Frutos del bosque'],
        'Montañas Heladas': ['❄️ Cristales de hielo', '⛏️ Minerales raros', '🦴 Huesos de dragón'],
        'Desierto Ardiente': ['🔥 Gemas de fuego', '🏺 Reliquias antiguas', '🌵 Cactus espinoso'],
        'Pantano Tóxico': ['☠️ Venenos raros', '🐸 Esencias tóxicas', '🕷️ Telarañas venenosas']
    };
    
    return resources[zoneName] || ['🌿 Recursos básicos'];
}

function getSpecialEvents(zoneName, playerLevel) {
    const events = [];
    
    if (Math.random() < 0.3) {
        events.push('🌟 **Comerciante Viajero** - Tienda especial disponible');
    }
    
    if (playerLevel >= 10 && Math.random() < 0.2) {
        events.push('👑 **Jefe de Zona** - Boss especial detectado');
    }
    
    if (Math.random() < 0.15) {
        events.push('🎁 **Tesoro Oculto** - Cofre misterioso encontrado');
    }
    
    return events;
}

function getZoneOptions(playerLevel) {
    const zones = [
        { name: 'Bosque Encantado', emoji: '🌲', minLevel: 1 },
        { name: 'Montañas Heladas', emoji: '🏔️', minLevel: 8 },
        { name: 'Desierto Ardiente', emoji: '🏜️', minLevel: 12 },
        { name: 'Pantano Tóxico', emoji: '🐸', minLevel: 15 },
        { name: 'Volcán Activo', emoji: '🌋', minLevel: 20 },
        { name: 'Reino Submarino', emoji: '🌊', minLevel: 25 }
    ];
    
    return zones
        .filter(zone => playerLevel >= zone.minLevel)
        .map(zone => ({
            label: zone.name,
            description: `Zona recomendada para nivel ${zone.minLevel}+`,
            value: zone.name,
            emoji: zone.emoji
        }));
}

function getEnemyEmoji(rarity) {
    const emojis = {
        '🔵 Normal': '👹',
        '🟢 Común': '👺',
        '🟣 Raro': '👿',
        '🟡 Legendario': '😈',
        '⚪ Mítico': '👑'
    };
    return emojis[rarity] || '👹';
}

function getDifficultyVsPlayer(enemy, playerLevel) {
    const enemyLevel = parseInt(enemy.level.split('-')[0]);
    const diff = enemyLevel - playerLevel;
    
    if (diff <= -5) return '😴 Muy Fácil';
    if (diff <= -2) return '😊 Fácil';
    if (diff <= 2) return '😐 Normal';
    if (diff <= 5) return '😰 Difícil';
    return '💀 Muy Difícil';
}

function getHuntEnergyCost(enemy) {
    const rarityMultiplier = {
        '🔵 Normal': 1,
        '🟢 Común': 1.2,
        '🟣 Raro': 1.5,
        '🟡 Legendario': 2,
        '⚪ Mítico': 3
    };
    
    return Math.floor(15 * (rarityMultiplier[enemy.rarity] || 1));
}

function getZoneGatheringResources(zoneName) {
    const resources = {
        'Bosque Encantado': [
            { name: 'Hierba Medicinal', emoji: '🌿', rarity: '🟢 Común', energyCost: 5, requiredSkill: 1, description: 'Útil para pociones básicas' },
            { name: 'Hongo Mágico', emoji: '🍄', rarity: '🟣 Raro', energyCost: 10, requiredSkill: 3, description: 'Ingrediente para pociones avanzadas' }
        ],
        'Montañas Heladas': [
            { name: 'Cristal de Hielo', emoji: '❄️', rarity: '🟢 Común', energyCost: 8, requiredSkill: 2, description: 'Material para armas de hielo' },
            { name: 'Mineral Raro', emoji: '⛏️', rarity: '🟣 Raro', energyCost: 15, requiredSkill: 5, description: 'Para forjar equipamiento superior' }
        ]
    };
    
    return resources[zoneName] || [];
}

function getGatheringSkillBonuses(skillLevel) {
    const bonuses = [
        `• **Nivel ${skillLevel}:** Eficiencia básica de recolección`
    ];
    
    if (skillLevel >= 3) bonuses.push('• **Nivel 3+:** +10% probabilidad de recursos raros');
    if (skillLevel >= 5) bonuses.push('• **Nivel 5+:** -20% costo de energía');
    if (skillLevel >= 10) bonuses.push('• **Nivel 10+:** Posibilidad de doble recolección');
    
    return bonuses;
}

function getDeepExplorationFinds(zone, explorationLevel) {
    return [
        { name: 'Cofre Oculto', emoji: '📦', chance: 30, description: 'Contiene items aleatorios' },
        { name: 'Ruinas Antiguas', emoji: '🏛️', chance: 20, description: 'Secretos del pasado' },
        { name: 'Criatura Rara', emoji: '🦄', chance: 15, description: 'Encuentro con bestia legendaria' },
        { name: 'Portal Mágico', emoji: '🌀', chance: 10, description: 'Acceso a zona secreta' }
    ];
}

function getExplorationRisks(zone) {
    return [
        '⚠️ Encuentros con enemigos hostiles',
        '⚠️ Trampas ocultas en ruinas',
        '⚠️ Condiciones climáticas adversas',
        '⚠️ Posibilidad de perderse'
    ];
}

module.exports = {
    createOfficialExplorationPanel,
    createHuntingPanel,
    createGatheringPanel,
    createDeepExplorationPanel,
    createExplorationResultPanel
};