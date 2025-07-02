const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const economy = require('../../../utils/advancedEconomy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Reclama tu recompensa diaria'),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        try {
            const { user, earnings } = await economy.daily(guildId, userId);
            const currency = (await economy.getConfig(guildId)).currencyName;

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎁 Recompensa Diaria')
                .setDescription(`Has recibido **${earnings} ${currency}** por tu registro diario.`)
                .addFields(
                    { name: '💰 Cartera', value: `${user.wallet} ${currency}`, inline: true },
                    { name: '🏦 Banco', value: `${user.bank} ${currency}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            if (err.message.startsWith('Cooldown:')) {
                const remaining = err.message.split(':')[1];
                await interaction.reply({ content: `⏰ ¡Ya reclamaste hoy! Vuelve en ${remaining}.`, ephemeral: true });
            } else {
                console.error('daily error', err);
                await interaction.reply({ content: '❌ Error al reclamar la diaria.', ephemeral: true });
            }
        }
    },
};
