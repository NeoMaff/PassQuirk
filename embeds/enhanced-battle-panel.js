const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createEnhancedBattlePanel(playerData, enemyData, locationData, battleState = 'start') {
  const embed = new EmbedBuilder()
    .setTitle(`⚔️ ${locationData.name}`)
    .setColor(battleState === 'victory' ? 0x57f287 : battleState === 'defeat' ? 0xed4245 : 0xfee75c)
    .setDescription(
      battleState === 'start' 
        ? `**${playerData.name}**, ¡frente a ti se encuentra un **${enemyData.name}**!\n\n¿Lucharás contra el ${enemyData.name} o huirás como un cobarde?`
        : battleState === 'victory'
        ? `¡**${playerData.name}** ha derrotado al **${enemyData.name}**!`
        : `**${playerData.name}** ha sido derrotado por **${enemyData.name}**...`
    )
    .addFields(
      {
        name: `${playerData.name}: 🟢 Nivel ${playerData.level}`,
        value: `❤️ PS ${generateHealthBar(playerData.currentHp, playerData.maxHp)}\n💙 PM ${generateManaBar(playerData.currentMp, playerData.maxMp)}\n⚔️ ATK: ${playerData.attack} | 🛡️ DEF: ${playerData.defense}`,
        inline: true,
      },
      {
        name: `${enemyData.name}: 🔴 Nivel ${enemyData.level}`,
        value: `❤️ PS ${generateHealthBar(enemyData.currentHp, enemyData.maxHp)}\n💙 PM ${generateManaBar(enemyData.currentMp, enemyData.maxMp)}\n⚔️ ATK: ${enemyData.attack} | 🛡️ DEF: ${enemyData.defense}`,
        inline: true,
      }
    )
    .setImage(locationData.battleImage || "https://cdn.discordapp.com/attachments/placeholder/battle-scene.png")
    .setFooter({ 
      text: battleState === 'start' 
        ? "Elige tu próxima acción haciendo clic en un botón de abajo."
        : "Batalla finalizada. Usa los botones para continuar."
    });

  if (battleState === 'start' || battleState === 'ongoing') {
    const actionRow1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('battle_attack')
          .setLabel('⚔️ Atacar')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('battle_skill')
          .setLabel('✨ Habilidad')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('battle_defend')
          .setLabel('🛡️ Defender')
          .setStyle(ButtonStyle.Secondary)
      );

    const actionRow2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('battle_item')
          .setLabel('🧪 Objeto')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('battle_escape')
          .setLabel('🏃 Escapar')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('battle_analyze')
          .setLabel('🔍 Analizar')
          .setStyle(ButtonStyle.Primary)
      );

    return { embeds: [embed], components: [actionRow1, actionRow2] };
  } else {
    const resultRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('battle_continue')
          .setLabel('➡️ Continuar')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('battle_loot')
          .setLabel('💰 Ver Botín')
          .setStyle(ButtonStyle.Success)
          .setDisabled(battleState === 'defeat'),
        new ButtonBuilder()
          .setCustomId('battle_return')
          .setLabel('🏠 Regresar')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [resultRow] };
  }
}

function generateHealthBar(current, max) {
  const percentage = (current / max) * 100;
  const barLength = 10;
  const filledLength = Math.floor((percentage / 100) * barLength);
  const emptyLength = barLength - filledLength;
  
  const bar = '🟩'.repeat(filledLength) + '⬜'.repeat(emptyLength);
  return `${current}/${max} ${bar} ${percentage.toFixed(0)}%`;
}

function generateManaBar(current, max) {
  const percentage = (current / max) * 100;
  const barLength = 10;
  const filledLength = Math.floor((percentage / 100) * barLength);
  const emptyLength = barLength - filledLength;
  
  const bar = '🟦'.repeat(filledLength) + '⬜'.repeat(emptyLength);
  return `${current}/${max} ${bar} ${percentage.toFixed(0)}%`;
}

module.exports = { createEnhancedBattlePanel };