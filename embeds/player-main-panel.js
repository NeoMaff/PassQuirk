const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createPlayerMainPanel(playerData) {
  const embed = new EmbedBuilder()
    .setTitle(`🏝️ ${playerData.name}'s Private Island`)
    .setColor(0x5865f2)
    .setThumbnail(playerData.avatar || "https://cdn.discordapp.com/embed/avatars/0.png")
    .addFields(
      {
        name: "Stats: ⭐",
        value: `🪙 Coins: **${playerData.coins.toLocaleString()}**\n💎 Emeralds: **${playerData.emeralds}**\n🔵 Class: **${playerData.class} [${playerData.level}]**\n🏹 Bow: ${playerData.bow || "None"}`,
        inline: true
      },
      {
        name: "📅 Created At: Feb 05 2021",
        value: `🏛️ Guild: **${playerData.guild}**\n🛡️ Armor: **${playerData.armor}**\n⚔️ Sword: **${playerData.sword}**`,
        inline: true
      },
      {
        name: "Minions: (4/6) 🔧",
        value: playerData.minions.map(minion => 
          `${minion.icon} Minion [Tier ${minion.tier}] 🪙 ${minion.coinsPerSecond}/s`
        ).join('\n'),
        inline: false
      }
    )
    .setFooter({ 
      text: `${playerData.name}#${playerData.discriminator} • Private Island • Today at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` 
    });

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('view_stats')
        .setLabel('📊 Ver Estadísticas')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('manage_minions')
        .setLabel('🔧 Gestionar Minions')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('upgrade_island')
        .setLabel('⬆️ Mejorar Isla')
        .setStyle(ButtonStyle.Success)
    );

  return { embeds: [embed], components: [row] };
}

module.exports = { createPlayerMainPanel };