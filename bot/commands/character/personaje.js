const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Character = require('../../models/Character');
const { PassQuirkEmbed, ProfileEmbed } = require('../../utils/embedStyles');
const { timeWeatherSystem } = require('../../utils/timeWeatherSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('personaje')
        .setDescription('👤 Ver tu perfil de personaje'),

    async execute(interaction) {
        try {
            const character = await Character.findOne({ userId: interaction.user.id });

            if (!character) {
                const embed = new PassQuirkEmbed()
                    .setTitle('⚠️ No tienes un personaje')
                    .setDescription('Usa `/start` para crear tu personaje y comenzar tu aventura.');

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Get time and weather info
            const timeInfo = timeWeatherSystem.formatTimeWeatherDisplay(character);

            // Calculate progress to next level
            const expProgress = Math.floor((character.experience / character.expToNextLevel) * 100);
            const hpBar = createBar(character.stats.currentHp, character.stats.maxHp);
            const manaBar = createBar(character.stats.currentMana, character.stats.maxMana);
            const expBar = createBar(character.experience, character.expToNextLevel);

            const embed = new PassQuirkEmbed()
                .setTitle(`${character.class === 'Guerrero' ? '⚔️' : character.class === 'Mago' ? '🔮' : character.class === 'Arquero' ? '🏹' : character.class === 'Ladrón' ? '🗡️' : '🥷'} ${character.name}`)
                .setDescription(`**${character.class}** - Nivel ${character.level}`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: '❤️ Vida',
                        value: `${hpBar}\n${character.stats.currentHp}/${character.stats.maxHp}`,
                        inline: true
                    },
                    {
                        name: '💙 Maná',
                        value: `${manaBar}\n${character.stats.currentMana}/${character.stats.maxMana}`,
                        inline: true
                    },
                    {
                        name: '⚡ Energía',
                        value: `${character.stats.currentEnergy}/${character.stats.maxEnergy}`,
                        inline: true
                    },
                    {
                        name: '✨ Experiencia',
                        value: `${expBar}\n${character.experience}/${character.expToNextLevel} (${expProgress}%)`,
                        inline: false
                    },
                    {
                        name: '⚔️ Estadísticas de Combate',
                        value: [
                            `**Ataque:** ${character.stats.attack}`,
                            `**Defensa:** ${character.stats.defense}`,
                            `**Poder Mágico:** ${character.stats.magicPower}`,
                            `**Def. Mágica:** ${character.stats.magicDefense}`,
                            `**Velocidad:** ${character.stats.speed}`,
                            `**Crítico:** ${character.stats.criticalChance.toFixed(1)}%`,
                            `**Evasión:** ${character.stats.evasion.toFixed(1)}%`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '📊 Atributos',
                        value: [
                            `💪 **Fuerza:** ${character.stats.strength}`,
                            `🎯 **Destreza:** ${character.stats.dexterity}`,
                            `🧠 **Inteligencia:** ${character.stats.intelligence}`,
                            `❤️ **Constitución:** ${character.stats.constitution}`,
                            `🍀 **Suerte:** ${character.stats.luck}`,
                            `⚡ **Velocidad:** ${character.stats.speed}`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '📍 Ubicación',
                        value: `${character.location.region}\n${character.location.zone}`,
                        inline: true
                    },
                    {
                        name: '🌍 Información del Mundo',
                        value: timeInfo.text,
                        inline: false
                    },
                    {
                        name: '🏆 Estadísticas de Combate',
                        value: [
                            `**Batallas:** ${character.combatStats.totalBattles}`,
                            `**Victorias:** ${character.combatStats.wins}`,
                            `**Derrotas:** ${character.combatStats.losses}`,
                            `**Enemigos Derrotados:** ${character.combatStats.enemiesDefeated}`,
                            `**Jefes Derrotados:** ${character.combatStats.bossesDefeated}`
                        ].join('\n'),
                        inline: false
                    }
                );

            // Add guild info if in a guild
            if (character.guild && character.guild.guildId) {
                embed.addFields({
                    name: '⚔️ Gremio',
                    value: `**${character.guild.guildId}**\nRango: ${character.guild.rank}`,
                    inline: true
                });
            }

            // Action buttons
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('character_rest')
                        .setLabel('Descansar')
                        .setEmoji('🛌')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('character_skills')
                        .setLabel('Habilidades')
                        .setEmoji('✨')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('character_equipment')
                        .setLabel('Equipo')
                        .setEmoji('🛡️')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('character_quests')
                        .setLabel('Misiones')
                        .setEmoji('📜')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.reply({
                embeds: [embed],
                components: [buttons]
            });

        } catch (error) {
            console.error('Error en comando /personaje:', error);
            await interaction.reply({
                content: '❌ Hubo un error al obtener tu personaje.',
                ephemeral: true
            });
        }
    }
};

// Helper function to create progress bars
function createBar(current, max, length = 10) {
    const percentage = current / max;
    const filled = Math.round(percentage * length);
    const empty = length - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}
