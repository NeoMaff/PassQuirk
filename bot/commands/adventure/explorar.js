const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Character = require('../../models/Character');
const User = require('../../models/User');
const { PassQuirkEmbed } = require('../../utils/embedStyles');
const { timeWeatherSystem } = require('../../utils/timeWeatherSystem');
const { ENEMIES, REGIONS } = require('../../utils/gameData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explorar')
        .setDescription('🗺️ Explora el mundo en busca de aventuras'),

    async execute(interaction) {
        try {
            const character = await Character.findOne({ userId: interaction.user.id });

            if (!character) {
                return interaction.reply({
                    content: '⚠️ No tienes un personaje. Usa `/start` para crear uno.',
                    ephemeral: true
                });
            }

            // Get time/weather effects
            const gameInfo = timeWeatherSystem.getGameTimeInfo(character);
            const effects = gameInfo.combinedEffects;

            // Check energy
            if (character.stats.currentEnergy < 10) {
                return interaction.reply({
                    content: '⚠️ No tienes suficiente energía. Descansa con `/personaje` → **Descansar**.',
                    ephemeral: true
                });
            }

            // Consume energy
            character.stats.currentEnergy -= 10;

            // Calculate encounter chance
            let encounterChance = 60; // Base 60%
            encounterChance *= effects.encounterRate;

            const encounterRoll = Math.random() * 100;

            let result;
            if (encounterRoll < encounterChance) {
                // Enemy encounter
                result = await handleEnemyEncounter(character, gameInfo);
            } else if (encounterRoll < encounterChance + 20) {
                // Item found
                result = await handleItemFound(character, effects);
            } else if (encounterRoll < encounterChance + 30) {
                // Gold found
                result = await handleGoldFound(character, effects);
            } else {
                // Nothing found
                result = {
                    title: '🌲 Nada encontrado',
                    description: 'Exploraste el área pero no encontraste nada de interés.'
                };
            }

            // Update exploration stats
            character.exploration.totalDistance += 1;
            await character.save();

            // Create embed
            const embed = new PassQuirkEmbed()
                .setTitle(result.title)
                .setDescription(result.description)
                .addFields(
                    {
                        name: '📍 Ubicación',
                        value: `${character.location.region} - ${character.location.zone}`,
                        inline: true
                    },
                    {
                        name: '⚡ Energía',
                        value: `${character.stats.currentEnergy}/${character.stats.maxEnergy}`,
                        inline: true
                    },
                    {
                        name: '🌍 Condiciones',
                        value: `${gameInfo.timePeriod.emoji} ${gameInfo.timePeriod.name} | ${gameInfo.weather.emoji} ${gameInfo.weather.name}`,
                        inline: false
                    }
                );

            if (result.fields) {
                embed.addFields(result.fields);
            }

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('explore_again')
                        .setLabel('Seguir Explorando')
                        .setEmoji('🗺️')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('explore_rest')
                        .setLabel('Descansar')
                        .setEmoji('🛌')
                        .setStyle(ButtonStyle.Success)
                );

            if (result.combatButton) {
                buttons.components.unshift(result.combatButton);
            }

            await interaction.reply({
                embeds: [embed],
                components: [buttons]
            });

        } catch (error) {
            console.error('Error en /explorar:', error);
            await interaction.reply({
                content: '❌ Hubo un error durante la exploración.',
                ephemeral: true
            });
        }
    }
};

async function handleEnemyEncounter(character, gameInfo) {
    // Get region enemies
    const region = REGIONS[character.location.region];
    const availableEnemies = region ? region.enemies : ['slime', 'goblin'];

    // Select random enemy
    const enemyId = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    const enemyData = ENEMIES[enemyId];

    if (!enemyData) {
        return {
            title: '❌ Error',
            description: 'Error al generar enemigo.'
        };
    }

    return {
        title: '⚔️ ¡Encuentro con enemigo!',
        description: `Te has encontrado con un **${enemyData.emoji} ${enemyData.name}** (Nivel ${enemyData.level})\n\n${enemyData.description}`,
        fields: [
            {
                name: '💪 Estadísticas del Enemigo',
                value: [
                    `❤️ **Vida:** ${enemyData.stats.maxHp}`,
                    `⚔️ **Ataque:** ${enemyData.stats.attack}`,
                    `🛡️ **Defensa:** ${enemyData.stats.defense}`,
                    `⚡ **Velocidad:** ${enemyData.stats.speed}`
                ].join('\n'),
                inline: true
            }
        ],
        combatButton: new ButtonBuilder()
            .setCustomId(`combat_start_${enemyId}`)
            .setLabel('Iniciar Combate')
            .setEmoji('⚔️')
            .setStyle(ButtonStyle.Danger)
    };
}

async function handleItemFound(character, effects) {
    // Random item generation (simplified)
    const items = [
        { id: 'health_potion', name: 'Poción de Vida', emoji: '🧪', rarity: 'common' },
        { id: 'mana_potion', name: 'Poción de Maná', emoji: '💙', rarity: 'common' },
        { id: 'gold_coin', name: 'Moneda de Oro', emoji: '💰', rarity: 'common' },
        { id: 'rare_gem', name: 'Gema Rara', emoji: '💎', rarity: 'rare' }
    ];

    const foundItem = items[Math.floor(Math.random() * items.length)];

    // Add to inventory
    const user = await User.findOne({ userId: character.userId });
    if (user) {
        await user.addItem({
            itemId: foundItem.id,
            name: foundItem.name,
            amount: 1
        });
    }

    character.exploration.itemsFound += 1;

    return {
        title: '🎒 ¡Objeto encontrado!',
        description: `Has encontrado: **${foundItem.emoji} ${foundItem.name}**`,
        fields: [
            {
                name: '📦 Rareza',
                value: foundItem.rarity === 'rare' ? '⭐ Raro' : '📝 Común',
                inline: true
            }
        ]
    };
}

async function handleGoldFound(character, effects) {
    const baseGold = Math.floor(Math.random() * 50) + 10;
    const goldFound = Math.floor(baseGold * effects.goldBonus);

    // Add gold to user
    const user = await User.findOne({ userId: character.userId });
    if (user) {
        await user.addMoney(goldFound, 'balance');
    }

    return {
        title: '💰 ¡Oro encontrado!',
        description: `Has encontrado **${goldFound}** monedas de oro.`,
        fields: []
    };
}
