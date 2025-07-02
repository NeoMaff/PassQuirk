const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const economy = require('../../../utils/advancedEconomy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pagar')
        .setDescription('Paga a otro usuario')
        .addUserOption(opt =>
            opt.setName('usuario')
                .setDescription('Usuario que recibirá el pago')
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName('cantidad')
                .setDescription('Cantidad a pagar')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const fromId = interaction.user.id;
        const toUser = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');

        if (toUser.bot) return interaction.reply({ content: '❌ No puedes pagar a un bot.', ephemeral: true });
        if (toUser.id === fromId) return interaction.reply({ content: '❌ No puedes pagarte a ti mismo.', ephemeral: true });

        try {
            const { fromUser, toUser: updatedTo } = await economy.pay(guildId, fromId, toUser.id, amount);
            const currency = (await economy.getConfig(guildId)).currencyName;

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🤝 Pago Realizado')
                .setDescription(`Has pagado **${amount} ${currency}** a ${toUser.username}`)
                .addFields(
                    { name: 'Tu Balance', value: `${fromUser.wallet} ${currency}`, inline: true },
                    { name: `Balance de ${toUser.username}`, value: `${updatedTo.wallet} ${currency}`, inline: true },
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            await interaction.reply({ content: `❌ ${err.message}`, ephemeral: true });
        }
    },
};
