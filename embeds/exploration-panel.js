const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

function createExplorationPanel(playerData, currentLocation) {
  const embed = new EmbedBuilder()
    .setTitle(`🗺️ ${currentLocation.name}`)
    .setColor(0x3498db)
    .setDescription(`**${playerData.name}**, te encuentras en ${currentLocation.description}`)
    .addFields(
      {
        name: "🎯 Misión Actual",
        value: playerData.currentQuest || "Ninguna misión activa",
        inline: false
      },
      {
        name: "🌍 Ubicación",
        value: `**${currentLocation.name}**\n${currentLocation.type}\nNivel recomendado: ${currentLocation.recommendedLevel}`,
        inline: true
      },
      {
        name: "⚡ Energía",
        value: `${playerData.energy}/${playerData.maxEnergy}\n${generateEnergyBar(playerData.energy, playerData.maxEnergy)}`,
        inline: true
      },
      {
        name: "🎒 Espacio de Inventario",
        value: `${playerData.inventoryUsed}/${playerData.inventoryMax}`,
        inline: true
      }
    )
    .setImage(currentLocation.image)
    .setFooter({ text: "Selecciona una acción para continuar tu aventura" });

  const actionSelect = new StringSelectMenuBuilder()
    .setCustomId('exploration_action')
    .setPlaceholder('Selecciona una acción')
    .addOptions([
      {
        label: '🔍 Buscar recursos',
        description: 'Busca materiales y objetos en el área',
        value: 'search_resources'
      },
      {
        label: '⚔️ Buscar enemigos',
        description: 'Busca criaturas para combatir',
        value: 'search_enemies'
      },
      {
        label: '🏪 Buscar comerciantes',
        description: 'Busca NPCs para comerciar',
        value: 'search_merchants'
      },
      {
        label: '🗝️ Buscar secretos',
        description: 'Explora en busca de áreas ocultas',
        value: 'search_secrets'
      }
    ]);

  const navigationRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('move_north')
        .setLabel('⬆️ Norte')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!currentLocation.exits.north),
      new ButtonBuilder()
        .setCustomId('move_south')
        .setLabel('⬇️ Sur')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!currentLocation.exits.south),
      new ButtonBuilder()
        .setCustomId('move_east')
        .setLabel('➡️ Este')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!currentLocation.exits.east),
      new ButtonBuilder()
        .setCustomId('move_west')
        .setLabel('⬅️ Oeste')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!currentLocation.exits.west)
    );

  const utilityRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('rest')
        .setLabel('😴 Descansar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('camp')
        .setLabel('🏕️ Acampar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('map')
        .setLabel('🗺️ Mapa')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('return_town')
        .setLabel('🏠 Regresar')
        .setStyle(ButtonStyle.Danger)
    );

  const actionRow = new ActionRowBuilder().addComponents(actionSelect);

  return { embeds: [embed], components: [actionRow, navigationRow, utilityRow] };
}

function generateEnergyBar(current, max) {
  const percentage = (current / max) * 100;
  const barLength = 10;
  const filledLength = Math.floor((percentage / 100) * barLength);
  const bar = '🟨'.repeat(filledLength) + '⬜'.repeat(barLength - filledLength);
  return `${bar} ${percentage.toFixed(0)}%`;
}

module.exports = { createExplorationPanel };