const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

function createEnhancedInventoryPanel(playerData, category = 'all', page = 1) {
  const categories = {
    'consumables': '🧪 Consumibles',
    'equipment': '⚔️ Equipamiento', 
    'materials': '🔧 Materiales',
    'treasures': '💎 Tesoros',
    'all': '📦 Todo'
  };

  const inventoryItems = {
    consumables: [
      {
        name: "🪢 Cuerda",
        description: "Una fina cuerda tejida con crin de caballo y hierbas, parece que puede soportar fácilmente el peso de un hombre grande u orco.",
        value: "3 Valor",
        rarity: "común"
      },
      {
        name: "🧪 Poción de Habilidad",
        description: "Habilidad +4: Repone tu puntuación de habilidad",
        value: "2 Valor",
        rarity: "común"
      },
      {
        name: "🧪 Poción de Resistencia", 
        description: "Resistencia +4: Añade a tu puntuación de resistencia",
        value: "3 Valor",
        rarity: "común"
      },
      {
        name: "🧪 Restaurador de Resistencia",
        description: "Resistencia +12: Restaura una gran cantidad de resistencia",
        value: "5 Valor",
        rarity: "raro"
      }
    ],
    equipment: [
      {
        name: "🛡️ Armadura de estaño",
        description: "Armadura +1: Un conjunto de armadura de estaño bastante endeble",
        value: "2 Valor",
        rarity: "común"
      },
      {
        name: "🪓 Hacha de estaño",
        description: "Arma +1: Un hacha de estaño endeble, utilizada en todo el campo para talar árboles pequeños",
        value: "Equipado 🟡 5 Valor",
        rarity: "común",
        equipped: true
      }
    ],
    materials: [
      {
        name: "🔮 Bola de cristal",
        description: "Una bola de cristal de adivino, vieja, maltratada y usada. Hecha de vidrio, por supuesto, no de cristal real, y probablemente sin valor.",
        value: "1 Valor",
        rarity: "común"
      }
    ]
  };

  const embed = new EmbedBuilder()
    .setTitle(`📦 Inventario (página ${page} de 3)`)
    .setColor(0x2f3136)
    .setDescription(`**${categories[category]}** - Inventario de **${playerData.name}**`)
    .setThumbnail(playerData.avatar || "https://cdn.discordapp.com/embed/avatars/0.png");

  const items = category === 'all' 
    ? Object.values(inventoryItems).flat()
    : inventoryItems[category] || [];

  items.slice((page - 1) * 6, page * 6).forEach((item) => {
    const rarityEmoji = {
      'común': '⚪',
      'raro': '🟢', 
      'épico': '🔵',
      'legendario': '🟣'
    };

    embed.addFields({
      name: `${item.name} ${item.equipped ? '(Equipado)' : ''}`,
      value: `${item.description}\n💰 ${item.value} ${rarityEmoji[item.rarity] || '⚪'}`,
      inline: true,
    });
  });

  const categorySelect = new StringSelectMenuBuilder()
    .setCustomId('inventory_category')
    .setPlaceholder('Seleccionar categoría')
    .addOptions(
      Object.entries(categories).map(([key, value]) => ({
        label: value,
        value: key,
        default: key === category
      }))
    );

  const navigationRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`inventory_prev_${page}`)
        .setLabel("◀️ Anterior")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1),
      new ButtonBuilder()
        .setCustomId(`inventory_next_${page}`)
        .setLabel("Siguiente ▶️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 3),
      new ButtonBuilder()
        .setCustomId("inventory_sort")
        .setLabel("🔄 Ordenar")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("inventory_close")
        .setLabel("❌ Cerrar")
        .setStyle(ButtonStyle.Danger)
    );

  const categoryRow = new ActionRowBuilder().addComponents(categorySelect);

  return { embeds: [embed], components: [categoryRow, navigationRow] };
}

module.exports = { createEnhancedInventoryPanel };