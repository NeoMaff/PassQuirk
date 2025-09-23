const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PASSQUIRKS, CLASSES } = require('../bot/data/passquirk-official-data');

/**
 * 🎭 Panel Oficial del Jugador
 * Basado en el diseño oficial de PassQuirk RPG
 */
function createOfficialPlayerPanel(playerData) {
    const embed = new EmbedBuilder()
        .setTitle(`🎭 ${playerData.characterName || 'Aventurero'} - Perfil Oficial`)
        .setColor('#FF6B6B')
        .setThumbnail('https://i.imgur.com/passquirk-avatar.png')
        .setTimestamp();

    // Información básica del personaje
    const basicInfo = [
        `**👤 Nombre:** ${playerData.characterName || 'Sin nombre'}`,
        `**🎯 Clase:** ${playerData.characterClass || 'Sin clase'} ${getClassEmoji(playerData.characterClass)}`,
        `**⭐ Nivel:** ${playerData.level}`,
        `**✨ Experiencia:** ${playerData.experience}/${getExpForNextLevel(playerData.level)}`,
        `**🏆 Rango:** ${getPlayerRank(playerData.level)}`
    ].join('\n');

    embed.addFields({
        name: '📊 Información del Personaje',
        value: basicInfo,
        inline: false
    });

    // PassQuirk activo
    const passquirkInfo = playerData.passquirk ? 
        `**${getPassQuirkEmoji(playerData.passquirk)} ${playerData.passquirk}**\n${getPassQuirkDescription(playerData.passquirk)}` :
        '❌ **Sin PassQuirk despertado**\n*Usa `/despertar` para despertar tu poder*';

    embed.addFields({
        name: '🌟 PassQuirk',
        value: passquirkInfo,
        inline: false
    });

    // Estadísticas del jugador
    const stats = playerData.stats || {};
    const statsInfo = [
        `❤️ **HP:** ${stats.hp || 100}/${stats.maxHp || 100}`,
        `💙 **MP:** ${stats.mp || 50}/${stats.maxMp || 50}`,
        `⚔️ **ATK:** ${stats.attack || 10}`,
        `🛡️ **DEF:** ${stats.defense || 5}`,
        `💨 **SPD:** ${stats.speed || 8}`,
        `🧠 **INT:** ${stats.intelligence || 7}`
    ].join('\n');

    embed.addFields({
        name: '📈 Estadísticas',
        value: statsInfo,
        inline: true
    });

    // Recursos y monedas
    const currencies = playerData.currencies || {};
    const resourcesInfo = [
        `💰 **Gold:** ${currencies.balance || 0}`,
        `💎 **Gemas:** ${currencies.gems || 0}`,
        `🔋 **Energía:** ${playerData.energy || 100}/100`,
        `⭐ **PG:** ${currencies.pg || 0}`
    ].join('\n');

    embed.addFields({
        name: '💰 Recursos',
        value: resourcesInfo,
        inline: true
    });

    // Progreso y actividades
    const activities = playerData.activities || {};
    const progressInfo = [
        `📚 **Estudios:** ${activities.study || 0}`,
        `💪 **Entrenamientos:** ${activities.training || 0}`,
        `🎬 **Videos editados:** ${activities.video_editing || 0}`,
        `📖 **Libros leídos:** ${activities.reading || 0}`,
        `🎯 **Misiones completadas:** ${activities.missions || 0}`
    ].join('\n');

    embed.addFields({
        name: '📊 Actividades Reales',
        value: progressInfo,
        inline: false
    });

    // Ubicación actual
    const location = playerData.location || {};
    const locationInfo = `🗺️ **${location.region || 'Reino de Akai'}** - ${location.zone || 'Centro de Inicio'}`;

    embed.addFields({
        name: '🌍 Ubicación',
        value: locationInfo,
        inline: false
    });

    embed.setFooter({
        text: '🎮 PassQuirk RPG - Tu aventura isekai te espera',
        iconURL: 'https://i.imgur.com/passquirk-icon.png'
    });

    // Botones de acción
    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('profile_stats')
                .setLabel('📊 Estadísticas')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('profile_inventory')
                .setLabel('🎒 Inventario')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('profile_quirks')
                .setLabel('✨ Quirks')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('profile_achievements')
                .setLabel('🏆 Logros')
                .setStyle(ButtonStyle.Secondary)
        );

    return { embeds: [embed], components: [actionRow] };
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

/**
 * Obtiene el emoji del PassQuirk
 */
function getPassQuirkEmoji(passquirkName) {
    if (!passquirkName || !PASSQUIRKS[passquirkName]) return '❓';
    return PASSQUIRKS[passquirkName].emoji || '🌟';
}

/**
 * Obtiene la descripción del PassQuirk
 */
function getPassQuirkDescription(passquirkName) {
    if (!passquirkName || !PASSQUIRKS[passquirkName]) return 'Descripción no disponible';
    return PASSQUIRKS[passquirkName].description || 'Un poder misterioso';
}

/**
 * Calcula la experiencia necesaria para el siguiente nivel
 */
function getExpForNextLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Obtiene el rango del jugador basado en su nivel
 */
function getPlayerRank(level) {
    if (level >= 50) return '🌟 Legendario';
    if (level >= 40) return '💎 Maestro';
    if (level >= 30) return '🏆 Experto';
    if (level >= 20) return '⚡ Avanzado';
    if (level >= 10) return '🔥 Intermedio';
    return '🌱 Novato';
}

module.exports = {
    createOfficialPlayerPanel
};