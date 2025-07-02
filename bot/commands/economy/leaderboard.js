const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const economy = require('../../../utils/advancedEconomy');

function formatPlace(n) {
    return n === 1 ? '🥇' : n === 2 ? '🥈' : n === 3 ? '🥉' : `#${n}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Muestra el TOP de usuarios más ricos')
        .addIntegerOption(opt =>
            opt.setName('cantidad')
                .setDescription('Cantidad de posiciones a mostrar (default 10)')
                .setRequired(false)
                .setMinValue(3)
                .setMaxValue(25)
        ),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const limit = interaction.options.getInteger('cantidad') || 10;
        const lb = await economy.getLeaderboard(guildId, limit);
        const currency = (await economy.getConfig(guildId)).currencyName;

        const desc = lb.map((u, idx) => `${formatPlace(idx + 1)} <@${u.userId}> — **${u.total} ${currency}**`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🏆 Clasificación de Riqueza')
            .setDescription(desc || 'Sin datos todavía.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
