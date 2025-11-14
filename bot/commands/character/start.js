const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Character = require('../../models/Character');
const User = require('../../models/User');
const { PassQuirkEmbed, SuccessEmbed } = require('../../utils/embedStyles');
const { CLASSES, STARTER_ITEMS } = require('../../utils/gameData');
const { COUNTRIES } = require('../../utils/timeWeatherSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('🎮 Inicia tu aventura en PassQuirk RPG'),

    async execute(interaction) {
        try {
            // Check if user already has a character
            const existingCharacter = await Character.findOne({ userId: interaction.user.id });

            if (existingCharacter) {
                const embed = new PassQuirkEmbed()
                    .setTitle('⚠️ Ya tienes un personaje')
                    .setDescription(`Ya tienes un personaje creado: **${existingCharacter.name}** (Nivel ${existingCharacter.level})\n\nUsa \`/personaje\` para ver tu perfil.`);

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Step 1: Welcome and Country Selection
            const welcomeEmbed = new PassQuirkEmbed()
                .setTitle('🐉 ¡Bienvenido a PassQuirk RPG!')
                .setDescription(
                    '**Prepárate para embarcarte en una épica aventura** donde explorarás reinos mágicos, lucharás contra criaturas poderosas y te convertirás en una leyenda.\n\n' +
                    '🌍 **Paso 1: Selecciona tu país**\n' +
                    'Esto determinará tu zona horaria para el sistema de día/noche del juego.'
                )
                .setImage('https://i.imgur.com/placeholder.png'); // Add game banner

            // Create country select menu
            const countryOptions = Object.keys(COUNTRIES).slice(0, 25).map(country => ({
                label: country,
                value: country,
                emoji: '🌍'
            }));

            const countrySelect = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_country')
                        .setPlaceholder('🌍 Selecciona tu país')
                        .addOptions(countryOptions)
                );

            await interaction.reply({
                embeds: [welcomeEmbed],
                components: [countrySelect]
            });

        } catch (error) {
            console.error('Error en comando /start:', error);
            await interaction.reply({
                content: '❌ Hubo un error al iniciar tu aventura. Por favor, inténtalo de nuevo.',
                ephemeral: true
            });
        }
    }
};
