const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createDetailedStatsPanel(playerData) {
  const embed = new EmbedBuilder()
    .setTitle(`[Lv. ${playerData.level}] ${playerData.characterName} (#${playerData.id})`)
    .setColor(0x9b59b6)
    .setDescription(`Under a full moon, this POKÉMON likes to mimic the shadows of people and laugh at their fright.`)
    .setThumbnail(playerData.characterImage)
    .addFields(
      {
        name: "Type",
        value: playerData.type,
        inline: true
      },
      {
        name: "Ability",
        value: playerData.ability,
        inline: true
      },
      {
        name: "Nature",
        value: playerData.nature,
        inline: true
      },
      {
        name: "🔮 #130 Cursed Body",
        value: "Bashful (No stat change)",
        inline: true
      },
      {
        name: "Rarity",
        value: "Shiny",
        inline: true
      },
      {
        name: "Date Caught",
        value: "Epic False 6/1/2023",
        inline: true
      },
      {
        name: "Stats (Stat|Vs|EVs)",
        value: generateStatBars(playerData.stats),
        inline: false
      },
      {
        name: "Power: 1935",
        value: "\u200B",
        inline: false
      },
      {
        name: "Level Progress",
        value: generateProgressBar(playerData.experience, playerData.maxExperience),
        inline: false
      }
    )
    .setFooter({ text: "Use navigation buttons to explore different stats" });

  const equipmentRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('power_weight')
        .setLabel('⚖️ Power Weight')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('power_bracer')
        .setLabel('💪 Power Bracer')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('power_belt')
        .setLabel('🔗 Power Belt')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('power_lens')
        .setLabel('🔍 Power Lens')
        .setStyle(ButtonStyle.Secondary)
    );

  const equipmentRow2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('power_band')
        .setLabel('🎯 Power Band')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('power_anklet')
        .setLabel('⚡ Power Anklet')
        .setStyle(ButtonStyle.Secondary)
    );

  return { embeds: [embed], components: [equipmentRow, equipmentRow2] };
}

function generateStatBars(stats) {
  const statNames = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
  const maxBarLength = 20;
  
  return statNames.map(stat => {
    const value = stats[stat] || 0;
    const maxValue = 500; // Valor máximo para la barra
    const barLength = Math.floor((value / maxValue) * maxBarLength);
    const bar = '█'.repeat(barLength) + '░'.repeat(maxBarLength - barLength);
    return `**${stat}** (${value}|${stats[stat + '_base'] || 0}|${stats[stat + '_ev'] || 0}) ${bar}`;
  }).join('\n');
}

function generateProgressBar(current, max) {
  const percentage = (current / max) * 100;
  const barLength = 20;
  const filledLength = Math.floor((percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  return `${bar} ${percentage.toFixed(1)}%`;
}

module.exports = { createDetailedStatsPanel };