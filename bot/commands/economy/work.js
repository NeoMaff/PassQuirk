const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const economy = require('../../../utils/advancedEconomy');

const trabajos = [
    { nombre: 'Programador', pago: { min: 50, max: 150 } },
    { nombre: 'Diseñador', pago: { min: 40, max: 120 } },
    { nombre: 'Músico', pago: { min: 30, max: 100 } },
    { nombre: 'Escritor', pago: { min: 35, max: 110 } },
    { nombre: 'Artista', pago: { min: 45, max: 130 } }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trabajar')
        .setDescription('Trabaja para ganar monedas'),

    async execute(interaction) {
        try {
            const guildId = interaction.guildId;
            const userId = interaction.user.id;

            const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)];
            try {
                const { user, earnings } = await economy.work(guildId, userId);
                const currency = (await economy.getConfig(guildId)).currencyName;

                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('¡Trabajo Completado!')
                    .setDescription(`Has trabajado como **${trabajo.nombre}** y ganaste **${earnings} ${currency}**!`)
                    .addFields(
                        { name: 'Balance Actual', value: `${user.wallet} ${currency}`, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error en comando trabajar:', error);
                await interaction.reply({
                    content: '❌ Hubo un error al procesar tu trabajo. Por favor, intenta de nuevo.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error en comando trabajar:', error);
            await interaction.reply({
                content: '❌ Hubo un error al procesar tu trabajo. Por favor, intenta de nuevo.',
                ephemeral: true
            });
        }
    },
}; 