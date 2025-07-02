const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const economy = require('../../../utils/advancedEconomy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('retirar')
        .setDescription('Retira monedas de tu banco')
        .addIntegerOption(opt =>
            opt.setName('cantidad')
                .setDescription('Cantidad a retirar')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const amount = interaction.options.getInteger('cantidad');

        try {
            const user = await economy.withdraw(guildId, userId, amount);
            const currency = (await economy.getConfig(guildId)).currencyName;

            const embed = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('💸 Retiro Exitoso')
                .setDescription(`Has retirado **${amount} ${currency}** de tu banco.`)
                .addFields(
                    { name: '💰 Cartera', value: `${user.wallet} ${currency}`, inline: true },
                    { name: '🏦 Banco', value: `${user.bank} ${currency}`, inline: true },
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            await interaction.reply({ content: `❌ ${err.message}`, ephemeral: true });
        }
    },
};
