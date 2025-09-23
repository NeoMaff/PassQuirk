const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ENEMIES_BY_ZONE } = require('../bot/data/passquirk-official-data');

/**
 * 🗡️ Panel Oficial de Combate
 * Basado en el sistema de combate oficial de PassQuirk RPG
 */
function createOfficialCombatPanel(playerData, enemy, battleState) {
    const embed = new EmbedBuilder()
        .setTitle('⚔️ ¡Combate en Curso!')
        .setColor('#FF4444')
        .setTimestamp();

    // Información del jugador
    const playerInfo = [
        `**${playerData.characterName || 'Aventurero'}** ${getClassEmoji(playerData.characterClass)}`,
        `❤️ HP: ${battleState.playerHp}/${playerData.stats.maxHp || 100}`,
        `💙 MP: ${battleState.playerMp}/${playerData.stats.maxMp || 50}`,
        `⚔️ ATK: ${playerData.stats.attack || 10}`,
        `🛡️ DEF: ${playerData.stats.defense || 5}`
    ].join('\n');

    embed.addFields({
        name: '👤 Jugador',
        value: playerInfo,
        inline: true
    });

    // Información del enemigo
    const enemyInfo = [
        `**${enemy.name}** ${enemy.emoji}`,
        `❤️ HP: ${battleState.enemyHp}/${enemy.maxHp || 100}`,
        `⚔️ ATK: ${enemy.attack || 8}`,
        `🛡️ DEF: ${enemy.defense || 3}`,
        `🎯 Rareza: ${enemy.rarity}`
    ].join('\n');

    embed.addFields({
        name: '👹 Enemigo',
        value: enemyInfo,
        inline: true
    });

    // Estado del combate
    const combatStatus = [
        `🔄 **Turno:** ${battleState.turn}`,
        `⏱️ **Duración:** ${battleState.duration || '0s'}`,
        `🎲 **Último daño:** ${battleState.lastDamage || 0}`,
        `✨ **Efectos activos:** ${battleState.effects?.length || 0}`
    ].join('\n');

    embed.addFields({
        name: '📊 Estado del Combate',
        value: combatStatus,
        inline: false
    });

    // Barras de vida visuales
    const playerHpBar = createHealthBar(battleState.playerHp, playerData.stats.maxHp || 100);
    const enemyHpBar = createHealthBar(battleState.enemyHp, enemy.maxHp || 100);

    embed.addFields({
        name: '📊 Barras de Vida',
        value: `**Jugador:** ${playerHpBar}\n**Enemigo:** ${enemyHpBar}`,
        inline: false
    });

    // Log de acciones recientes
    if (battleState.actionLog && battleState.actionLog.length > 0) {
        const recentActions = battleState.actionLog.slice(-3).join('\n');
        embed.addFields({
            name: '📜 Acciones Recientes',
            value: recentActions,
            inline: false
        });
    }

    embed.setFooter({
        text: '⚔️ Elige tu próxima acción sabiamente',
        iconURL: 'https://i.imgur.com/combat-icon.png'
    });

    // Botones de combate
    const combatRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('combat_attack')
                .setLabel('⚔️ Atacar')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('combat_defend')
                .setLabel('🛡️ Defender')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('combat_skill')
                .setLabel('✨ Habilidad')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('combat_item')
                .setLabel('🧪 Objeto')
                .setStyle(ButtonStyle.Success)
        );

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('combat_flee')
                .setLabel('🏃 Huir')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('combat_info')
                .setLabel('ℹ️ Info Enemigo')
                .setStyle(ButtonStyle.Secondary)
        );

    return { embeds: [embed], components: [combatRow, actionRow] };
}

/**
 * 🏆 Panel de Resultado de Combate
 */
function createCombatResultPanel(playerData, enemy, result, rewards) {
    const isVictory = result === 'victory';
    const embed = new EmbedBuilder()
        .setTitle(isVictory ? '🏆 ¡Victoria!' : '💀 Derrota')
        .setColor(isVictory ? '#00FF00' : '#FF0000')
        .setTimestamp();

    if (isVictory) {
        embed.setDescription(`¡Has derrotado a **${enemy.name}** ${enemy.emoji}!`);
        
        // Recompensas obtenidas
        if (rewards) {
            const rewardInfo = [
                `💰 **Gold:** +${rewards.gold || 0}`,
                `✨ **EXP:** +${rewards.exp || 0}`,
                `💎 **Gemas:** +${rewards.gems || 0}`
            ];

            if (rewards.items && rewards.items.length > 0) {
                rewardInfo.push(`🎁 **Objetos:** ${rewards.items.map(item => `${item.emoji} ${item.name}`).join(', ')}`);
            }

            if (rewards.quirks && rewards.quirks.length > 0) {
                rewardInfo.push(`🌟 **Quirks:** ${rewards.quirks.map(quirk => `✨ ${quirk.name}`).join(', ')}`);
            }

            embed.addFields({
                name: '🎁 Recompensas Obtenidas',
                value: rewardInfo.join('\n'),
                inline: false
            });
        }

        // Progreso de nivel
        if (rewards && rewards.levelUp) {
            embed.addFields({
                name: '⭐ ¡Subiste de Nivel!',
                value: `**Nivel ${rewards.oldLevel}** → **Nivel ${rewards.newLevel}**\n🎉 ¡Nuevas habilidades desbloqueadas!`,
                inline: false
            });
        }
    } else {
        embed.setDescription(`Has sido derrotado por **${enemy.name}** ${enemy.emoji}...`);
        embed.addFields({
            name: '💔 Consecuencias',
            value: '• Pierdes el 10% de tu gold\n• Regresas al punto de control\n• -5 de energía',
            inline: false
        });
    }

    // Estadísticas del combate
    const combatStats = [
        `⏱️ **Duración:** ${result.duration || 'N/A'}`,
        `🎯 **Daño total:** ${result.totalDamage || 0}`,
        `🛡️ **Daño bloqueado:** ${result.blockedDamage || 0}`,
        `✨ **Habilidades usadas:** ${result.skillsUsed || 0}`
    ].join('\n');

    embed.addFields({
        name: '📊 Estadísticas del Combate',
        value: combatStats,
        inline: false
    });

    embed.setFooter({
        text: isVictory ? '🎮 ¡Continúa tu aventura!' : '🎮 ¡No te rindas, inténtalo de nuevo!',
        iconURL: 'https://i.imgur.com/passquirk-icon.png'
    });

    // Botones post-combate
    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('combat_continue')
                .setLabel('🚀 Continuar')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('combat_inventory')
                .setLabel('🎒 Ver Inventario')
                .setStyle(ButtonStyle.Secondary)
        );

    if (isVictory) {
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId('combat_explore_more')
                .setLabel('🗺️ Explorar Más')
                .setStyle(ButtonStyle.Success)
        );
    }

    return { embeds: [embed], components: [actionRow] };
}

/**
 * Crea una barra de vida visual
 */
function createHealthBar(current, max) {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const filledBars = Math.floor(percentage / 10);
    const emptyBars = 10 - filledBars;
    
    let bar = '';
    for (let i = 0; i < filledBars; i++) {
        bar += '🟩';
    }
    for (let i = 0; i < emptyBars; i++) {
        bar += '⬜';
    }
    
    return `${bar} ${current}/${max} (${Math.floor(percentage)}%)`;
}

/**
 * Obtiene el emoji de la clase
 */
function getClassEmoji(className) {
    const classEmojis = {
        'Guerrero': '⚔️',
        'Mago': '🔮',
        'Arquero': '🏹',
        'Asesino': '🗡️',
        'Paladín': '🛡️',
        'Berserker': '⚡',
        'Nigromante': '💀',
        'Druida': '🌿',
        'Monje': '👊',
        'Bardo': '🎵'
    };
    return classEmojis[className] || '❓';
}

module.exports = {
    createOfficialCombatPanel,
    createCombatResultPanel
};