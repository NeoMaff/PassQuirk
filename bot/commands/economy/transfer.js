const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const economy = require('../../../utils/advancedEconomy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transferir')
        .setDescription('Transfiere monedas a otro usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario al que transferir monedas')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de monedas a transferir')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const targetUser = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');

        // No permitir transferencias a uno mismo
        if (targetUser.id === interaction.user.id) {
            await interaction.reply({
                content: '❌ No puedes transferirte monedas a ti mismo.',
                ephemeral: true
            });
            return;
        }

        try {
            const { fromUser, toUser } = await economy.pay(guildId, interaction.user.id, targetUser.id, amount);
            const currency = (await economy.getConfig(guildId)).currencyName;

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🤝 Transferencia Exitosa')
                .setDescription(`Has transferido **${amount} ${currency}** a ${targetUser.username}`)
                .addFields(
                    { name: 'Tu Balance', value: `${fromUser.wallet} ${currency}`, inline: true },
                    { name: `Balance de ${targetUser.username}`, value: `${toUser.wallet} ${currency}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error en transferencia:', error);
            
            let errorMessage = '❌ Hubo un error al procesar la transferencia.';
            if (error.message === 'Fondos insuficientes') {
                errorMessage = '❌ No tienes suficientes fondos.';
            } else if (error.message === 'Usuario remitente no encontrado') {
                errorMessage = '❌ No tienes una cuenta de economía. Usa el comando /balance para crear una.';
            }

            await interaction.reply({
                content: errorMessage,
                ephemeral: true
            });
        }
    },
}; 