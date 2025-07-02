const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const economy = require('../../../utils/advancedEconomy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Muestra tu balance actual')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario para ver su balance')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        
        try {
            const guildId = interaction.guildId;
            const userBalance = await economy.getUser(guildId, targetUser.id);
            const config = await economy.getConfig(guildId);
            const currency = config.currencyName;

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`Balance de ${targetUser.username}`)
                .addFields(
                    { name: 'Balance Actual', value: `${userBalance.wallet} ${currency}`, inline: true },
                    { name: 'Banco', value: `${userBalance.bank} ${currency}`, inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al obtener balance:', error);
            await interaction.reply({ 
                content: '❌ Hubo un error al obtener el balance. Por favor, intenta de nuevo.',
                ephemeral: true 
            });
        }
    },
}; 